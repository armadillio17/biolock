"""Seed a realistic, internally consistent demo dataset.

Unlike ``seed_users`` -- which only creates roles and bare user rows -- this
builds a small company that has actually been operating: an org chart, work
locations, salaries, statutory benefit rates, holidays, weeks of attendance with
late arrivals/absences/overtime/off-site errands, leave requests in every state,
and payroll periods with payslips computed from those very attendance rows.

Times are generated as Manila wall-clock (the app's audience) and stored as
aware datetimes, so a punch that reads 08:04 in the UI is stored as 00:04 UTC --
exactly what the live clock-in view produces. With TIME_ZONE set to Asia/Manila
both ``Attendance.date`` and ``clock_in__date`` resolve in Manila, so an early
arrival at 07:43 (23:43 UTC the day before) still files under the right day.

    python manage.py seed_demo --flush          # rebuild from scratch
    python manage.py seed_demo --weeks 12       # more history
"""

import random
from datetime import datetime, time, timedelta
from decimal import Decimal, ROUND_HALF_UP
from zoneinfo import ZoneInfo

import bcrypt
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from faker import Faker

from user.models import (
    Attendance,
    AttendanceAdjustments,
    AttendanceSummary,
    BenefitsConfiguration,
    Company,
    CustomHoliday,
    CustomUser,
    Department,
    Holiday,
    HolidayConfig,
    LeaveRequest,
    Location,
    Logs,
    Notifications,
    OvertimeRequest,
    PayrollPeriod,
    Payslip,
    Position,
    PositionUser,
    RegistrationLink,
    Role,
    UserDevice,
    SystemHistory,
    UserSalary,
)
from user.models.department import DepartmentUser

MANILA = ZoneInfo("Asia/Manila")
TWOPLACES = Decimal("0.01")

# The office everyone is fenced to. Matches the Davao coordinates the project
# has been testing against.
HEAD_OFFICE = ("Head Office - Davao", Decimal("7.080531"), Decimal("125.622611"), 75)
ANNEX_OFFICE = ("Annex - Matina", Decimal("7.058000"), Decimal("125.578000"), 60)

SHIFT_START = time(8, 0)
SHIFT_END = time(17, 0)
LUNCH_HOURS = 1.0
FULL_DAY_HOURS = 8.0

ORG = {
    "Engineering": ["Software Engineer", "Senior Software Engineer", "QA Engineer"],
    "Human Resources": ["HR Officer", "HR Assistant"],
    "Finance": ["Accountant", "Payroll Officer"],
    "Operations": ["Operations Associate", "Logistics Coordinator"],
    "Sales": ["Account Executive", "Sales Associate"],
}

# Monthly salary bands per position, in PHP.
SALARY_BANDS = {
    "Senior Software Engineer": (75_000, 95_000),
    "Software Engineer": (45_000, 65_000),
    "QA Engineer": (35_000, 48_000),
    "HR Officer": (38_000, 50_000),
    "HR Assistant": (22_000, 30_000),
    "Accountant": (40_000, 55_000),
    "Payroll Officer": (35_000, 45_000),
    "Operations Associate": (24_000, 32_000),
    "Logistics Coordinator": (26_000, 36_000),
    "Account Executive": (30_000, 42_000),
    "Sales Associate": (20_000, 28_000),
}

# Employee-share / employer-share percentages. Close enough to the real PH
# contribution tables for a demo without pretending to be a payroll authority.
BENEFIT_RATES = {
    "sss": (Decimal("4.50"), Decimal("9.50")),
    "philhealth": (Decimal("2.50"), Decimal("2.50")),
    "pagibig": (Decimal("2.00"), Decimal("2.00")),
}

# Philippine regular holidays, month/day. Fixed-date ones only, so the set holds
# for whatever year the demo window lands in.
PH_HOLIDAYS = [
    ((1, 1), "New Year's Day", "regular"),
    ((4, 9), "Araw ng Kagitingan", "regular"),
    ((5, 1), "Labor Day", "regular"),
    ((6, 12), "Independence Day", "regular"),
    ((8, 21), "Ninoy Aquino Day", "special"),
    ((11, 1), "All Saints' Day", "special"),
    ((11, 30), "Bonifacio Day", "regular"),
    ((12, 8), "Feast of the Immaculate Conception", "special"),
    ((12, 25), "Christmas Day", "regular"),
    ((12, 30), "Rizal Day", "regular"),
]

LEAVE_REASONS = {
    "sick": [
        "Down with flu and fever, will see a doctor.",
        "Migraine since last night, unable to work.",
        "Stomach flu, advised to rest for the day.",
        "Recovering from a dental procedure.",
    ],
    "vacation": [
        "Family trip to Samal Island, booked months ago.",
        "Out of town for a cousin's wedding.",
        "Using remaining leave credits for a short break.",
        "Hometown visit for the barangay fiesta.",
    ],
    "personal": [
        "Processing documents at the LTO, needs personal appearance.",
        "Parent-teacher conference at my child's school.",
        "Moving to a new apartment.",
    ],
    "other": [
        "Jury-style summons for a barangay hearing.",
        "Accompanying a parent to a medical appointment.",
    ],
}

# Why someone legitimately punches in from outside the geofence.
ERRAND_REASONS = [
    "Buying printer ink and bond paper for the office.",
    "Dropping off documents at the bank before opening.",
    "Client meeting at their office in Lanang.",
    "Picking up catering for the team meeting.",
    "Courier run to send contracts to the head office.",
    "Buying coffee and pantry supplies for the team.",
]

# Handsets people actually carry here, for the device roster.
PHONE_MODELS = [
    ("Samsung Galaxy A15", "android"), ("Samsung Galaxy A55", "android"),
    ("Xiaomi Redmi Note 13", "android"), ("Redmi 13C", "android"),
    ("Realme C67", "android"), ("OPPO A78", "android"),
    ("Google Pixel 7a", "android"), ("vivo Y36", "android"),
    ("iPhone 13", "ios"), ("iPhone SE", "ios"),
]

ADJUSTMENT_REASONS = [
    "Employee forgot to clock out; corrected against the security logbook.",
    "Biometric device was offline in the morning; clock-in entered manually.",
    "Employee clocked in from home by mistake; corrected after confirmation.",
]


def php(value):
    """Round a money value the way a payslip would."""
    return Decimal(value).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


class Command(BaseCommand):
    help = "Seed a realistic demo dataset: org chart, attendance, leave, overtime and payroll."

    def add_arguments(self, parser):
        parser.add_argument("--weeks", type=int, default=8,
                            help="Weeks of attendance history to generate (default 8).")
        parser.add_argument("--employees", type=int, default=12,
                            help="Number of regular employees (default 12).")
        parser.add_argument("--password", default="password123",
                            help="Plain password given to every seeded account.")
        parser.add_argument("--seed", type=int, default=20250909,
                            help="RNG seed, so reruns are reproducible.")
        parser.add_argument("--flush", action="store_true",
                            help="Delete existing demo data first. Refuses to run with DEBUG=False unless --force.")
        parser.add_argument("--force", action="store_true",
                            help="Allow --flush outside DEBUG. Destroys data; be sure.")

    def handle(self, *args, **options):
        self.weeks = options["weeks"]
        self.employee_count = options["employees"]
        self.password = options["password"]
        self.rng = random.Random(options["seed"])
        self.fake = Faker("en_PH")
        Faker.seed(options["seed"])

        if options["flush"]:
            if not settings.DEBUG and not options["force"]:
                raise CommandError(
                    "Refusing to --flush with DEBUG=False. This deletes attendance, "
                    "payroll and user rows. Pass --force if you really mean it."
                )
            self._flush()

        # The window ends today and covers whole weeks back from there.
        self.today = datetime.now(MANILA).date()
        self.window_start = self.today - timedelta(weeks=self.weeks)

        with transaction.atomic():
            self._seed_company()
            roles = self._seed_roles()
            locations = self._seed_locations()
            departments, positions = self._seed_org()
            self._seed_benefits()
            holidays = self._seed_holidays()
            admin, staff = self._seed_users(roles, departments, positions)
            self._seed_salaries(staff)
            self._seed_devices(staff)
            leave_days, leave_links = self._seed_leave_requests(staff)
            counts = self._seed_attendance(staff, locations, holidays, leave_days)
            counts["leave_linked"] = self._link_leave_attendance(leave_links)
            self._seed_adjustments(staff, admin)
            periods = self._seed_payroll(staff, holidays)
            self._seed_activity(staff, admin)

        self._report(admin, staff, counts, periods)

    # ------------------------------------------------------------------ flush

    def _flush(self):
        self.stdout.write("Flushing existing demo data...")
        # Ordered children-first so nothing trips a protected relation.
        for model in (
            Payslip, PayrollPeriod, AttendanceAdjustments, AttendanceSummary,
            LeaveRequest, OvertimeRequest, Attendance, UserDevice, Notifications, Logs,
            SystemHistory, UserSalary, PositionUser, DepartmentUser,
            RegistrationLink, HolidayConfig, CustomHoliday, Holiday,
            BenefitsConfiguration, Location, Company,
        ):
            deleted = model.objects.all().delete()[0]
            if deleted:
                self.stdout.write(f"  - {model.__name__}: {deleted}")

        users = CustomUser.objects.exclude(is_superuser=True)
        count = users.count()
        users.delete()
        Position.objects.all().delete()
        Department.objects.all().delete()
        self.stdout.write(f"  - CustomUser: {count}")

    # ----------------------------------------------------------- foundations

    def _seed_company(self):
        Company.objects.get_or_create(
            name="Biolock Solutions Inc.",
            defaults={"company_ip": "203.177.71.10"},
        )

    def _seed_roles(self):
        return {
            name: Role.objects.get_or_create(role_name=name)[0]
            for name in ("superadmin", "admin", "user")
        }

    def _seed_locations(self):
        locations = []
        for name, lat, lng, radius in (HEAD_OFFICE, ANNEX_OFFICE):
            locations.append(Location.objects.get_or_create(
                name=name,
                defaults={"latitude": lat, "longitude": lng, "radius": radius, "is_active": True},
            )[0])
        return locations

    def _seed_org(self):
        departments, positions = {}, {}
        for dept_name, position_names in ORG.items():
            departments[dept_name] = Department.objects.get_or_create(
                department_name=dept_name)[0]
            for position_name in position_names:
                positions[position_name] = Position.objects.get_or_create(
                    position_name=position_name)[0]
        return departments, positions

    def _seed_benefits(self):
        for benefit_type, (employee, employer) in BENEFIT_RATES.items():
            BenefitsConfiguration.objects.update_or_create(
                benefit_type=benefit_type,
                defaults={"employee_percentage": employee, "employer_percentage": employer},
            )

    def _seed_holidays(self):
        """Holidays inside the window, plus a company-specific one."""
        holidays = {}
        for (month, day), name, kind in PH_HOLIDAYS:
            for year in {self.window_start.year, self.today.year}:
                try:
                    holiday_date = datetime(year, month, day).date()
                except ValueError:
                    continue
                if not (self.window_start <= holiday_date <= self.today):
                    continue
                holiday = Holiday.objects.get_or_create(
                    holiday_date=holiday_date, defaults={"holiday_name": name})[0]
                HolidayConfig.objects.get_or_create(
                    holiday=holiday,
                    defaults={
                        "type": kind,
                        "pay_percentage": Decimal("200.00") if kind == "regular" else Decimal("130.00"),
                        "is_active": True,
                    },
                )
                holidays[holiday_date] = holiday

        founding_day = self.window_start + timedelta(days=(self.today - self.window_start).days // 2)
        custom = CustomHoliday.objects.get_or_create(
            custom_holiday_date=founding_day,
            defaults={"custom_holiday_name": "Company Foundation Day"},
        )[0]
        HolidayConfig.objects.get_or_create(
            custom_holiday=custom,
            defaults={"type": "special", "pay_percentage": Decimal("130.00"), "is_active": True},
        )
        return holidays

    # ----------------------------------------------------------------- users

    def _hash(self):
        return bcrypt.hashpw(self.password.encode(), bcrypt.gensalt(rounds=12)).decode()

    def _make_user(self, *, username, first_name, last_name, role, department=None,
                   position=None, is_accepted=True, is_staff=False, index=0):
        user = CustomUser.objects.create(
            username=username,
            email=f"{username}@example.com",
            password=self._hash(),
            first_name=first_name,
            last_name=last_name,
            phone_number=f"+639{self.rng.randint(100000000, 999999999)}",
            role=role,
            department=department,
            position=position,
            is_accepted=is_accepted,
            is_staff=is_staff,
            sss_number=f"{self.rng.randint(10, 99)}-{self.rng.randint(1000000, 9999999)}-{self.rng.randint(0, 9)}",
            pagibig_number=f"{self.rng.randint(1000, 9999)}-{self.rng.randint(1000, 9999)}-{self.rng.randint(1000, 9999)}",
            philhealth_number=f"{self.rng.randint(10, 99)}-{self.rng.randint(100000000, 999999999)}-{self.rng.randint(0, 9)}",
            date_joined=datetime.combine(
                self.window_start - timedelta(days=self.rng.randint(90, 900)),
                time(9, 0), tzinfo=MANILA),
        )
        if department:
            DepartmentUser.objects.get_or_create(department=department, user=user)
        if position:
            PositionUser.objects.get_or_create(position=position, user=user)
        return user

    def _seed_users(self, roles, departments, positions):
        admin = self._make_user(
            username="admin", first_name="System", last_name="Admin",
            role=roles["admin"], department=departments["Human Resources"],
            position=positions["HR Officer"], is_staff=True,
        )
        self._make_user(
            username="hr.officer", first_name="Marilou", last_name="Bacani",
            role=roles["admin"], department=departments["Human Resources"],
            position=positions["HR Officer"],
        )

        # Round-robin across the org so every department has people in it.
        assignments = [
            (dept, position)
            for dept, position_names in ORG.items()
            for position in position_names
        ]

        # Sampling each profile independently leaves the mix to chance -- at a
        # dozen employees that can hand you a team where half are chronically
        # late. Deal from a proportional pool instead, so the population is
        # representative whatever the seed.
        accepted_count = max(self.employee_count - 2, 0)
        pool = (
            ["punctual"] * round(accepted_count * 0.7)
            + ["slipping"] * round(accepted_count * 0.2)
            + ["late"] * round(accepted_count * 0.1)
        )
        pool += ["punctual"] * (accepted_count - len(pool))
        self.rng.shuffle(pool)

        staff = []
        for i in range(self.employee_count):
            dept_name, position_name = assignments[i % len(assignments)]
            first_name = self.fake.first_name()
            last_name = self.fake.last_name()
            # The last two are left unapproved, so the "newly registered" queue
            # on the admin dashboard is not empty.
            is_accepted = i < self.employee_count - 2
            user = self._make_user(
                username=f"{first_name}.{last_name}".lower().replace(" ", "") + str(i),
                first_name=first_name, last_name=last_name,
                role=roles["user"], department=departments[dept_name],
                position=positions[position_name], is_accepted=is_accepted, index=i,
            )
            if is_accepted:
                # Behavioural profile, so the history is not uniform noise.
                user.profile = {
                    "punctuality": pool[len(staff)],
                    "absence_rate": self.rng.uniform(0.01, 0.06),
                    "overtime_rate": self.rng.uniform(0.0, 0.22),
                    "errand_rate": self.rng.uniform(0.0, 0.06),
                    "position": position_name,
                }
                staff.append(user)
        return admin, staff

    def _seed_salaries(self, staff):
        for user in staff:
            low, high = SALARY_BANDS[user.profile["position"]]
            monthly = self.rng.randrange(low, high, 500)
            hourly = self.rng.random() < 0.2
            UserSalary.objects.update_or_create(
                user=user,
                defaults={
                    "salary_type": "hourly" if hourly else "monthly",
                    # Hourly staff are paid per hour on a 22-day, 8-hour month.
                    "amount": php(monthly / 176) if hourly else php(monthly),
                    "effective_date": user.date_joined.date(),
                },
            )
            user.monthly_equivalent = Decimal(monthly)

    def _seed_devices(self, staff):
        """Bind a phone to most staff, leaving a few on the browser.

        The gap is deliberate: the "employees without a registered device"
        reminder and the browser-punch alert have nothing to show on a dataset
        where everybody is already onboarded.
        """
        for index, user in enumerate(staff):
            # Roughly a quarter have not installed the app yet.
            if index % 4 == 3:
                user.device = None
                continue

            model, platform = self.rng.choice(PHONE_MODELS)
            user.device = UserDevice.objects.create(
                user=user,
                android_id=self.fake.sha256()[:32],
                platform=platform,
                device_name=f"{user.first_name}'s phone",
                device_model=model,
                app_version=self.rng.choice(["1.3.2", "1.4.0", "1.4.1"]),
                last_seen_at=datetime.now(MANILA) - timedelta(
                    hours=self.rng.randint(0, 30)),
            )

        # One revoked handset in the history, as a phone replacement leaves.
        replaced = next((u for u in staff if getattr(u, "device", None)), None)
        if replaced:
            old = UserDevice.objects.create(
                user=replaced,
                android_id=self.fake.sha256()[:32],
                platform="android",
                device_model="Samsung Galaxy A03",
                app_version="1.2.0",
                is_active=False,
                revoked_at=datetime.now(MANILA) - timedelta(days=self.rng.randint(20, 60)),
                revoke_reason="Employee replaced a broken phone.",
            )
            old.save()

    # ------------------------------------------------------------------ leave

    def _random_weekday(self, earliest, latest):
        """A uniformly-chosen weekday in [earliest, latest], or None if there is none.

        Picking a random day and nudging weekends forward piles Saturday and
        Sunday onto Monday -- it gave Monday three times the weight -- so choose
        from the weekdays themselves.
        """
        span = (latest - earliest).days
        if span < 0:
            return None
        candidates = [
            earliest + timedelta(days=n)
            for n in range(span + 1)
            if (earliest + timedelta(days=n)).weekday() < 5
        ]
        return self.rng.choice(candidates) if candidates else None

    def _file_leave(self, user, days, leave_type, status):
        """Create one request, backdated to when it would plausibly have been filed.

        created_at is auto_now_add, so it has to be corrected with an UPDATE
        afterwards -- otherwise every historical leave looks like it was filed
        today, which made approved July leave read as filed 44 days late.
        """
        request = LeaveRequest.objects.create(
            user=user,
            start_date=days[0],
            end_date=days[-1],
            type=leave_type,
            details=self.rng.choice(LEAVE_REASONS[leave_type]),
            status=status,
        )

        if leave_type == "sick":
            # Nobody schedules illness: filed the morning of, or the day after.
            filed = days[0] + timedelta(days=self.rng.choice([0, 0, 1]))
        else:
            # Planned leave goes in days to weeks ahead.
            filed = days[0] - timedelta(days=self.rng.randint(3, 30))

        filed = min(filed, self.today)
        filed_at = datetime.combine(
            filed,
            time(self.rng.randint(8, 17), self.rng.randint(0, 59)),
            tzinfo=MANILA,
        )
        LeaveRequest.objects.filter(pk=request.pk).update(
            created_at=filed_at, updated_at=filed_at)
        return request

    def _seed_leave_requests(self, staff):
        """Create leave in every state.

        Returns (approved_days_per_user, pending_links) where pending_links maps
        a request to its first leave day, so the attendance rows created later
        can be wired back to the request via LeaveRequest.attendance_id.
        """
        leave_days = {}
        to_link = []
        last_workday = self.today - timedelta(days=1)

        for index, user in enumerate(staff):
            # 0-2 approved leaves in the past, so attendance can reflect them.
            for _ in range(self.rng.randint(0, 2)):
                length = self.rng.choice([1, 1, 1, 2, 3])
                start = self._random_weekday(
                    self.window_start, last_workday - timedelta(days=length))
                if start is None:
                    continue
                days = [start + timedelta(days=n) for n in range(length)]
                days = [d for d in days if d.weekday() < 5 and d < self.today]
                if not days:
                    continue

                leave_type = self.rng.choice(
                    ["sick", "sick", "vacation", "vacation", "personal", "other"])
                request = self._file_leave(user, days, leave_type, "approved")
                leave_days.setdefault(user.id, set()).update(days)
                to_link.append((request, days[0]))

            # A pending request in the near future -- the approval queue.
            if self.rng.random() < 0.45:
                start = self._random_weekday(
                    self.today + timedelta(days=2), self.today + timedelta(days=21))
                if start:
                    length = self.rng.choice([1, 2, 3, 5])
                    leave_type = self.rng.choice(
                        ["vacation", "vacation", "sick", "personal"])
                    self._file_leave(
                        user,
                        [start + timedelta(days=n) for n in range(length)],
                        leave_type,
                        "pending",
                    )

            # Declined requests: guaranteed for the first two employees rather
            # than left to a dice roll, or the state is missing from the demo
            # entirely on an unlucky seed.
            if index < 2 or self.rng.random() < 0.12:
                start = self._random_weekday(self.window_start, last_workday)
                if start:
                    leave_type = self.rng.choice(["vacation", "personal"])
                    self._file_leave(user, [start], leave_type, "declined")

        return leave_days, to_link

    def _link_leave_attendance(self, to_link):
        """Point each approved request at the on_leave row it produced.

        LeaveRequest.attendance_id exists on the model; leaving it null meant
        nothing could navigate from a leave to the attendance it explains.
        """
        linked = 0
        for request, first_day in to_link:
            attendance = Attendance.objects.filter(
                user=request.user, date=first_day, status="on_leave").first()
            if attendance:
                request.attendance_id = attendance
                request.save(update_fields=["attendance_id"])
                linked += 1
        return linked

    # ------------------------------------------------------------- attendance

    def _punch_coords(self, location, outside):
        """A plausible GPS reading: inside the fence, or off on an errand."""
        if outside:
            return (
                php(Decimal(location.latitude) + Decimal(str(self.rng.uniform(0.02, 0.06)))),
                php(Decimal(location.longitude) + Decimal(str(self.rng.uniform(0.02, 0.06)))),
            )
        # Jitter well inside the radius: ~1e-5 degrees is roughly a metre.
        spread = max(int(location.radius * 0.4), 5)
        return (
            Decimal(location.latitude) + Decimal(str(self.rng.randint(-spread, spread) * 0.00001)),
            Decimal(location.longitude) + Decimal(str(self.rng.randint(-spread, spread) * 0.00001)),
        )

    # Share of days each profile actually shows up late. A 50/50 coin flip here
    # produced a company where most staff were late half the time, which no real
    # timesheet looks like -- even a problem employee is mostly on time.
    LATE_ODDS = {"punctual": 0.03, "slipping": 0.18, "late": 0.40}

    def _clock_in_time(self, day, punctuality):
        if self.rng.random() < self.LATE_ODDS[punctuality]:
            # Late: usually a few minutes over the grace period, occasionally badly.
            minutes = self.rng.choice([
                self.rng.randint(12, 25),
                self.rng.randint(12, 25),
                self.rng.randint(26, 45),
                self.rng.randint(46, 90),
            ])
        else:
            minutes = self.rng.randint(-20, 8)
        return datetime.combine(day, SHIFT_START, tzinfo=MANILA) + timedelta(minutes=minutes)

    def _seed_attendance(self, staff, locations, holidays, leave_days):
        counts = {"present": 0, "late": 0, "absent": 0, "leave": 0,
                  "overtime": 0, "offsite": 0, "held": 0}
        summaries = []
        head_office = locations[0]

        day = self.window_start
        while day <= self.today:
            if day.weekday() >= 5:
                day += timedelta(days=1)
                continue

            holiday = holidays.get(day)

            for user in staff:
                if day < user.date_joined.date():
                    continue

                profile = user.profile
                on_leave = day in leave_days.get(user.id, set())

                # --- on approved leave -------------------------------------
                if on_leave:
                    attendance = Attendance.objects.create(
                        user=user, date=day, status="on_leave", is_clockOut=False)
                    summaries.append(AttendanceSummary(
                        user=user, attendance=attendance, date=day,
                        total_leave_hours=Decimal(FULL_DAY_HOURS)))
                    counts["leave"] += 1
                    continue

                # --- a public holiday: most people are off ------------------
                if holiday and self.rng.random() > 0.12:
                    attendance = Attendance.objects.create(
                        user=user, date=day, status="day_off", holiday=holiday, is_clockOut=False)
                    summaries.append(AttendanceSummary(
                        user=user, attendance=attendance, date=day))
                    continue

                # --- unplanned absence -------------------------------------
                if self.rng.random() < profile["absence_rate"]:
                    attendance = Attendance.objects.create(
                        user=user, date=day, status="absent", is_clockOut=False)
                    summaries.append(AttendanceSummary(
                        user=user, attendance=attendance, date=day, total_absences=1))
                    counts["absent"] += 1
                    continue

                # --- a normal worked day -----------------------------------
                location = head_office if self.rng.random() < 0.85 else locations[1]
                clock_in = self._clock_in_time(day, profile["punctuality"])
                is_late = clock_in.timetz() > time(8, 10, tzinfo=MANILA)

                # Today's punch may still be open -- someone is at their desk.
                still_working = day == self.today and self.rng.random() < 0.6
                clock_out = None if still_working else (
                    datetime.combine(day, SHIFT_END, tzinfo=MANILA)
                    + timedelta(minutes=self.rng.randint(-5, 40))
                )

                offsite = self.rng.random() < profile["errand_rate"]
                lat, lng = self._punch_coords(location, offsite)
                punch_source = "mobile" if getattr(user, "device", None) else "browser"

                worked = 0.0
                if clock_out:
                    gross = (clock_out - clock_in).total_seconds() / 3600
                    worked = min(round(max(gross - LUNCH_HOURS, 0.0), 2), FULL_DAY_HOURS)

                attendance = Attendance.objects.create(
                    user=user, date=day,
                    clock_in=clock_in, clock_out=clock_out,
                    working_hours=worked, overtime_hours=0.0,
                    status="late" if is_late else "working",
                    scheduled_start=datetime.combine(day, SHIFT_START, tzinfo=MANILA),
                    scheduled_end=datetime.combine(day, SHIFT_END, tzinfo=MANILA),
                    is_clockOut=clock_out is not None,
                    holiday=holiday,
                    clock_in_latitude=lat, clock_in_longitude=lng,
                    clock_in_location=None if offsite else location,
                    is_clock_in_outside=offsite,
                    clock_in_outside_reason=self.rng.choice(ERRAND_REASONS) if offsite else None,
                    clock_out_latitude=lat if clock_out else None,
                    clock_out_longitude=lng if clock_out else None,
                    clock_out_location=location if clock_out and not offsite else None,
                    is_clock_out_outside=bool(clock_out) and offsite,
                    clock_out_outside_reason=(
                        self.rng.choice(ERRAND_REASONS) if clock_out and offsite else None),
                    punch_source=punch_source,
                    punch_device=getattr(user, "device", None),
                    # Browser punches are held until an admin approves them.
                    # Older ones have been dealt with; the last few days form
                    # the live review queue.
                    review_status=(
                        "not_required" if punch_source == "mobile"
                        else ("pending" if (self.today - day).days <= 3 else "approved")
                    ),
                )
                counts["late" if is_late else "present"] += 1
                if punch_source == "browser" and (self.today - day).days <= 3:
                    counts["held"] += 1
                if offsite:
                    counts["offsite"] += 1

                overtime_hours = 0.0
                # --- approved overtime: a second session after clocking out --
                if clock_out and self.rng.random() < profile["overtime_rate"]:
                    OvertimeRequest.objects.create(
                        user=user, date=day, status="approved", used=True)
                    ot_in = clock_out + timedelta(minutes=self.rng.randint(10, 45))
                    overtime_hours = round(self.rng.uniform(1.0, 3.5), 2)
                    ot_out = ot_in + timedelta(hours=overtime_hours)
                    Attendance.objects.create(
                        user=user, date=day,
                        clock_in=ot_in, clock_out=ot_out,
                        working_hours=0.0, overtime_hours=overtime_hours,
                        status="working", is_clockOut=True,
                        is_overtime_clock_in=True,
                        holiday=holiday,
                        clock_in_latitude=lat, clock_in_longitude=lng,
                        clock_in_location=location,
                        clock_out_latitude=lat, clock_out_longitude=lng,
                        clock_out_location=location,
                        punch_source="mobile" if getattr(user, "device", None) else "browser",
                        punch_device=getattr(user, "device", None),
                    )
                    counts["overtime"] += 1

                # A punch awaiting review is measured but unpaid, so it is
                # left out of the day's totals -- same rule the API applies.
                held = attendance.review_status == "pending"
                summaries.append(AttendanceSummary(
                    user=user, attendance=attendance, date=day,
                    total_working_hours=php(0 if held else worked),
                    total_overtime_hours=php(0 if held else overtime_hours)))

            day += timedelta(days=1)

        AttendanceSummary.objects.bulk_create(summaries, batch_size=500)

        # Overtime requests that never became sessions: the pending queue.
        for user in staff:
            if self.rng.random() < 0.35:
                OvertimeRequest.objects.create(
                    user=user,
                    date=self.today + timedelta(days=self.rng.randint(1, 10)),
                    status="pending", used=False)
            if self.rng.random() < 0.12:
                OvertimeRequest.objects.create(
                    user=user,
                    date=self.today - timedelta(days=self.rng.randint(1, 20)),
                    status="rejected", used=False)

        return counts

    def _seed_adjustments(self, staff, admin):
        """A handful of admin corrections, as any real timesheet accumulates."""
        candidates = list(
            Attendance.objects.filter(
                user__in=staff, clock_out__isnull=False, is_overtime_clock_in=False
            ).order_by("?")[:8]
        )
        for attendance in candidates:
            original = attendance.clock_out
            corrected = original + timedelta(minutes=self.rng.choice([-45, -30, 25, 40]))
            AttendanceAdjustments.objects.create(
                attendance=attendance,
                adjusted_by=admin,
                adjustment_type="clock_out",
                adjustment_reason=self.rng.choice(ADJUSTMENT_REASONS),
                old_value={"clock_out": original.isoformat()},
                new_value={"clock_out": corrected.isoformat()},
            )

    # ---------------------------------------------------------------- payroll

    def _semi_monthly_periods(self):
        """1st-15th and 16th-EOM periods overlapping the window."""
        periods = []
        cursor = self.window_start.replace(day=1)
        while cursor <= self.today:
            if cursor.month == 12:
                next_month = cursor.replace(year=cursor.year + 1, month=1)
            else:
                next_month = cursor.replace(month=cursor.month + 1)
            end_of_month = next_month - timedelta(days=1)

            periods.append((cursor, cursor.replace(day=15)))
            periods.append((cursor.replace(day=16), end_of_month))
            cursor = next_month

        return [(s, e) for s, e in periods if e >= self.window_start and s <= self.today]

    def _seed_payroll(self, staff, holidays):
        rates = {b.benefit_type: b for b in BenefitsConfiguration.objects.all()}
        periods = []

        for start, end in self._semi_monthly_periods():
            # A period is only payable once it has finished.
            processed = end < self.today
            period = PayrollPeriod.objects.create(
                start_date=start, end_date=end, is_processed=processed)
            periods.append(period)

            if not processed:
                continue

            period_total = Decimal("0.00")
            for user in staff:
                rows = Attendance.objects.filter(
                    user=user, date__gte=start, date__lte=end, deleted_at__isnull=True)
                worked = sum(r.working_hours for r in rows)
                overtime = sum(r.overtime_hours for r in rows)
                absences = rows.filter(status="absent").count()
                leave_hours = rows.filter(status="on_leave").count() * FULL_DAY_HOURS
                holidays_worked = rows.filter(
                    holiday__isnull=False, clock_in__isnull=False).count()

                salary = UserSalary.objects.filter(user=user).first()
                monthly = getattr(user, "monthly_equivalent", Decimal("30000"))
                hourly_rate = php(monthly / 176)

                if salary and salary.salary_type == "hourly":
                    basic = php(Decimal(salary.amount) * Decimal(str(worked)))
                else:
                    # Semi-monthly cut of the monthly rate, less unpaid absences.
                    basic = php(monthly / 2 - hourly_rate * 8 * absences)

                overtime_pay = php(hourly_rate * Decimal("1.25") * Decimal(str(overtime)))
                holiday_pay = php(hourly_rate * 8 * holidays_worked)
                gross = php(basic + overtime_pay + holiday_pay)

                shares = {}
                for benefit_type, config in rates.items():
                    shares[benefit_type] = (
                        php(gross * config.employee_percentage / 100),
                        php(gross * config.employer_percentage / 100),
                    )
                deductions = php(sum(employee for employee, _ in shares.values()))
                net = php(gross - deductions)
                period_total += net

                Payslip.objects.create(
                    user=user, payroll_period=period,
                    total_working_hours=php(worked),
                    total_overtime_hours=php(overtime),
                    total_leave_hours=php(leave_hours),
                    total_absences=absences,
                    total_overtime_pay=overtime_pay,
                    total_holidays_worked=holidays_worked,
                    total_holiday_pay=holiday_pay,
                    basic_salary=basic,
                    gross_pay=gross,
                    deductions=deductions,
                    net_pay=net,
                    sss_employee=shares["sss"][0], sss_employer=shares["sss"][1],
                    philhealth_employee=shares["philhealth"][0],
                    philhealth_employer=shares["philhealth"][1],
                    pagibig_employee=shares["pagibig"][0],
                    pagibig_employer=shares["pagibig"][1],
                )

            period.total_amount = php(period_total)
            period.save(update_fields=["total_amount", "updated_at"])

        return periods

    # --------------------------------------------------------------- activity

    def _seed_activity(self, staff, admin):
        """System history, logs and notifications, newest within the last day."""
        for user in staff:
            for _ in range(self.rng.randint(1, 3)):
                moment = datetime.now(MANILA) - timedelta(
                    hours=self.rng.randint(1, 24 * 7), minutes=self.rng.randint(0, 59))
                history = SystemHistory.objects.create(
                    user_id=user,
                    type=self.rng.choice(["User Login", "Clock In", "Clock Out", "Leave Request"]),
                    data={"status": "Success", "details": f"User '{user.first_name} {user.last_name}'"},
                )
                SystemHistory.objects.filter(pk=history.pk).update(created_at=moment)

                Logs.objects.create(
                    user=user,
                    action=self.rng.choice(["login", "clock_in", "clock_out", "leave_request"]),
                    details=f"{user.first_name} {user.last_name} via mobile app",
                )

        for user in staff[: max(1, len(staff) // 2)]:
            Notifications.objects.create(
                user=user,
                message=self.rng.choice([
                    "Your leave request has been approved.",
                    "Your overtime request is awaiting approval.",
                    "Payslip for the last cutoff is now available.",
                    "Reminder: you clocked in late twice this week.",
                ]),
                is_read=self.rng.random() < 0.5,
            )

        RegistrationLink.objects.create(
            registration_token=self.fake.uuid4(),
            is_token_used=False,
            is_alive_hours=timedelta(hours=48),
        )

    # ----------------------------------------------------------------- report

    def _report(self, admin, staff, counts, periods):
        write = self.stdout.write
        write("")
        write(self.style.SUCCESS("Demo data seeded."))
        write(f"  window        : {self.window_start} -> {self.today} ({self.weeks} weeks)")
        write(f"  employees     : {len(staff)} active, "
              f"{CustomUser.objects.filter(is_accepted=False).count()} awaiting approval")
        write(f"  attendance    : {Attendance.objects.count()} rows "
              f"({counts['present']} on time, {counts['late']} late, "
              f"{counts['absent']} absent, {counts['leave']} on leave)")
        write(f"  overtime      : {counts['overtime']} worked sessions, "
              f"{OvertimeRequest.objects.filter(status='pending').count()} pending requests")
        write(f"  off-site      : {counts['offsite']} punches outside the geofence (each with a reason)")
        write(f"  held for review: {counts['held']} browser punch(es) pending admin approval")
        write(f"  devices       : {UserDevice.objects.filter(is_active=True).count()} bound, "
              f"{sum(1 for u in staff if not getattr(u, 'device', None))} employees still browser-only")
        write(f"  leave requests: {LeaveRequest.objects.count()} "
              f"({LeaveRequest.objects.filter(status='pending').count()} pending, "
              f"{LeaveRequest.objects.filter(status='approved').count()} approved, "
              f"{LeaveRequest.objects.filter(status='declined').count()} declined; "
              f"{counts.get('leave_linked', 0)} linked to attendance)")
        write(f"  payroll       : {len(periods)} periods, "
              f"{Payslip.objects.count()} payslips, "
              f"{PayrollPeriod.objects.filter(is_processed=False).count()} still open")
        write("")
        write("  Log in as:")
        write(f"    admin    / {self.password}   (admin)")
        write(f"    hr.officer / {self.password} (admin)")
        for user in staff[:3]:
            write(f"    {user.username} / {self.password}")
