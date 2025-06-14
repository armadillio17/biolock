from decimal import Decimal
from django.db.models import Sum
from user.models import BenefitsConfiguration, AttendanceSummary, HolidayConfig

class PayslipCalculator:
    @staticmethod
    def calculate_working_hours(user, payroll_period):
        summaries = AttendanceSummary.objects.filter(
            user=user,
            date__range=(payroll_period.start_date, payroll_period.end_date)
        ).select_related('attendance__holiday')

        return {
            'working_hours': summaries.aggregate(Sum('total_working_hours'))['total_working_hours__sum'] or 0,
            'overtime_hours': summaries.aggregate(Sum('total_overtime_hours'))['total_overtime_hours__sum'] or 0,
            'leave_hours': summaries.aggregate(Sum('total_leave_hours'))['total_leave_hours__sum'] or 0,
            'absences': summaries.aggregate(Sum('total_absences'))['total_absences__sum'] or 0,
            'holiday_hours': sum(
                summary.total_working_hours
                for summary in summaries
                if summary.attendance and summary.attendance.holiday
            )
        }

    @staticmethod
    def calculate_gross_pay(salary, hours_data):
        total_regular_hours = Decimal(hours_data['working_hours']) - Decimal(hours_data['holiday_hours'])
        total_holiday_hours = Decimal(hours_data['holiday_hours'])
        overtime_hours = Decimal(hours_data['overtime_hours'])

        if salary.salary_type == "hourly":
            hourly_rate = salary.amount
        elif salary.salary_type == "monthly":
            standard_work_days = 22
            daily_rate = salary.amount / Decimal(standard_work_days)
            hourly_rate = daily_rate / Decimal(8)
        else:
            raise ValueError("Unsupported salary type")

        regular_pay = total_regular_hours * hourly_rate
        holiday_pay = Decimal(0)
        overtime_pay = overtime_hours * hourly_rate * Decimal(1.5)  # e.g., 50% extra for OT

        # Now apply holiday pay adjustments
        summaries = AttendanceSummary.objects.filter(
            user=salary.user,
            date__range=(salary.period.start_date, salary.period.end_date)
        ).select_related('attendance__holiday__config')

        for summary in summaries:
            if summary.attendance and summary.attendance.holiday:
                holiday = summary.attendance.holiday
                if hasattr(holiday, 'config'):
                    cfg = holiday.config
                    multiplier = Decimal(1) + (cfg.pay_percentage / Decimal(100))
                    effective_rate = hourly_rate * multiplier
                    holiday_pay += summary.total_working_hours * effective_rate

        return regular_pay + holiday_pay + overtime_pay

    @staticmethod
    def calculate_benefits(user, gross_pay):
        benefits = {
            'sss': {'employee': 0, 'employer': 0},
            'philhealth': {'employee': 0, 'employer': 0},
            'pagibig': {'employee': 0, 'employer': 0}
        }
        
        if not hasattr(user, 'sss_number') or not hasattr(user, 'philhealth_number') or not hasattr(user, 'pagibig_number'):
            return benefits
            
        configs = {c.benefit_type: c for c in BenefitsConfiguration.objects.all()}
        
        # SSS Calculation
        if user.sss_number and 'sss' in configs:
            cfg = configs['sss']
            benefits['sss']['employee'] = gross_pay * (cfg.employee_percentage / Decimal(100))
            benefits['sss']['employer'] = gross_pay * (cfg.employer_percentage / Decimal(100))
        
        # PhilHealth Calculation
        if user.philhealth_number and 'philhealth' in configs:
            cfg = configs['philhealth']
            benefits['philhealth']['employee'] = gross_pay * (cfg.employee_percentage / Decimal(100))
            benefits['philhealth']['employer'] = gross_pay * (cfg.employer_percentage / Decimal(100))
        
        # Pag-IBIG Calculation (capped at 5000)
        if user.pagibig_number and 'pagibig' in configs:
            cfg = configs['pagibig']
            base = min(gross_pay, Decimal(5000))
            benefits['pagibig']['employee'] = base * (cfg.employee_percentage / Decimal(100))
            benefits['pagibig']['employer'] = base * (cfg.employer_percentage / Decimal(100))
            
        return benefits

    @staticmethod
    def calculate_absence_deductions(absences):
        return Decimal(absences) * Decimal(100)