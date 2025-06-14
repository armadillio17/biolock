from decimal import Decimal
from venv import logger
from django.db.models import Sum
from user.models import BenefitsConfiguration, AttendanceSummary, HolidayConfig

class PayslipCalculator:
    @staticmethod
    def calculate_working_hours(user, payroll_period):
        summaries = AttendanceSummary.objects.filter(
            user=user,
            date__range=(payroll_period.start_date, payroll_period.end_date)
        ).select_related(
            'attendance__holiday',
            'attendance__custom_holiday'
        )

        return {
            'working_hours': summaries.aggregate(Sum('total_working_hours'))['total_working_hours__sum'] or 0,
            'overtime_hours': summaries.aggregate(Sum('total_overtime_hours'))['total_overtime_hours__sum'] or 0,
            'leave_hours': summaries.aggregate(Sum('total_leave_hours'))['total_leave_hours__sum'] or 0,
            'absences': summaries.aggregate(Sum('total_absences'))['total_absences__sum'] or 0,
            'holiday_hours': sum(
                summary.total_working_hours
                for summary in summaries
                if summary.attendance and (summary.attendance.holiday or summary.attendance.custom_holiday)
            )
        }
    #TODO : calculate_gross_pay not working properly, need to check the logic
    @staticmethod
    def calculate_gross_pay(salary, payroll_period, hours_data):
        print("calculate_gross_pay: salary amount:", salary.amount)
        print("calculate_gross_pay: payroll period:", payroll_period)
        print("calculate_gross_pay: hours_data:", hours_data)

        working_hours = Decimal(hours_data['working_hours'])
        overtime_hours = Decimal(hours_data['overtime_hours'])

        hourly_rate = Decimal(0)

        if salary.salary_type == "hourly":
            hourly_rate = salary.amount
        elif salary.salary_type == "monthly":
            standard_work_days = Decimal(22)
            daily_rate = salary.amount / standard_work_days
            hourly_rate = daily_rate / Decimal(8)
        else:
            raise ValueError("Unsupported salary type")

        # ✅ Fixed: Do NOT subtract holiday hours from working hours
        regular_pay = working_hours * hourly_rate
        overtime_pay = overtime_hours * hourly_rate * Decimal('1.5')
        holiday_pay = Decimal('0')

        # Calculate holiday pay based on AttendanceSummary
        summaries = AttendanceSummary.objects.filter(
            user=salary.user,
            date__range=(payroll_period.start_date, payroll_period.end_date)
        ).select_related(
            'attendance__holiday',
            'attendance__custom_holiday'
        )

        for summary in summaries:
            attendance = summary.attendance
            if not attendance:
                continue

            total_hours = summary.total_working_hours or Decimal(0)
            cfg = PayslipCalculator.get_holiday_config(attendance)

            if cfg:
                multiplier = Decimal(1) + (cfg.pay_percentage / Decimal(100))
                effective_rate = hourly_rate * multiplier
                holiday_pay += total_hours * effective_rate
                print(f"Holiday pay added for {summary.date}: {total_hours} hours × {effective_rate} = {total_hours * effective_rate}")

        gross_pay = regular_pay + holiday_pay + overtime_pay

        print("regular_pay:", regular_pay)
        print("holiday_pay:", holiday_pay)
        print("overtime_pay:", overtime_pay)
        print("gross_pay:", gross_pay)

        return gross_pay

    @staticmethod
    def get_holiday_config(attendance):
        """
        Helper to safely retrieve config from either Holiday or CustomHoliday.
        Returns HolidayConfig object or None.
        """
        if attendance.holiday:
            configs = getattr(attendance.holiday, 'configs', None)
            if configs and configs.exists():
                return configs.first()

        elif attendance.custom_holiday:
            custom_configs = getattr(attendance.custom_holiday, 'custom_configs', None)
            if custom_configs and custom_configs.exists():
                return custom_configs.first()

        return None

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