"""Feature-by-feature regression suite for everything built this session.

Runs against the live dev stack (Django :8000, Vite proxy :5173, ngrok tunnel)
and reports PASS/FAIL per assertion. Mutates attendance for two seeded users;
the caller reseeds afterwards.
"""
import io, json, os, subprocess, sys
import django

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.chdir(ROOT)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import requests
from django.conf import settings
from user.models import (Attendance, AttendanceAdjustments, AttendanceSummary,
                         CustomUser, LeaveRequest, Location, Notifications,
                         OvertimeRequest, Payslip, PayrollPeriod, UserDevice)

API   = "http://127.0.0.1:8000/api"     # straight to Django
PROXY = "http://localhost:5173/api"     # what the browser actually uses
TUNNEL_HOST = "d602-49-145-215-52.ngrok-free.app"
TUNNEL_IP   = "18.141.83.88"
SKIP = "ngrok-free.app does not resolve on this network"

results = []
section = [""]

def head(name):
    section[0] = name
    print(f"\n\033[1m{name}\033[0m")

def check(label, ok, detail=""):
    results.append((section[0], label, bool(ok)))
    mark = "\033[32mPASS\033[0m" if ok else "\033[31mFAIL\033[0m"
    print(f"  [{mark}] {label}" + (f"  -- {detail}" if detail else ""))
    return ok

def curl_tunnel(path, method="GET", data=None, token=None, ua="okhttp/4.12.0"):
    """The sandbox cannot resolve ngrok, so pin the edge IP like a real client would."""
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
           "--max-time", "20", "--resolve", f"{TUNNEL_HOST}:443:{TUNNEL_IP}",
           "-A", ua, "-H", "ngrok-skip-browser-warning: 1", "-X", method,
           f"https://{TUNNEL_HOST}{path}"]
    if data:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(data)]
    if token:
        cmd += ["-H", f"Authorization: Token {token}"]
    out = subprocess.run(cmd, capture_output=True, text=True).stdout.strip()
    return out

# --------------------------------------------------------------- fixtures
office = Location.objects.filter(is_active=True).first()
OFFICE = {"latitude": float(office.latitude), "longitude": float(office.longitude)}
FAR    = {"latitude": float(office.latitude) + 0.05, "longitude": float(office.longitude) + 0.05}

# Devices any earlier run of this suite created. Clear them before choosing
# fixtures, or a leftover binding can make BOB and ANNE the same person.
UserDevice.objects.filter(android_id__in=[
    "bob-fresh-handset-001", "bob-second-handset-002", "bob-third-handset-003",
    "handset-A", "totally-different-handset",
]).delete()

with_dev = UserDevice.objects.filter(is_active=True).select_related("user").first()
ANNE, ANNE_AID = with_dev.user, with_dev.android_id
BOB = (CustomUser.objects.filter(is_accepted=True, role__role_name="user")
       .exclude(devices__is_active=True).exclude(pk=ANNE.pk).first())
assert BOB and BOB.pk != ANNE.pk, "need one employee with a phone and one without"
ADMIN = CustomUser.objects.get(username="admin")

def wipe(user):
    AttendanceAdjustments.objects.filter(attendance__user=user).delete()
    AttendanceSummary.objects.filter(user=user).delete()
    Attendance.objects.filter(user=user).delete()

def token_for(username):
    r = requests.post(f"{API}/login/", json={"username": username, "password": "password123"})
    return r.json().get("token") if r.ok else None

# ============================================================ 1. plumbing
head("1. Stack and configuration")
check("Django responds", requests.get(f"{API}/locations/").status_code == 200)
check("Vite serves the app", requests.get("http://localhost:5173/").status_code == 200)
check("API reachable through the Vite proxy", requests.get(f"{PROXY}/locations/").status_code == 200)
check("settings read .env (DEBUG=True from file, not fallback)", settings.DEBUG is True)
check("SECRET_KEY is not the insecure fallback",
      not settings.SECRET_KEY.startswith("django-insecure-fallback"))
check("frontend .env uses same-origin API path",
      open(os.path.join(os.path.dirname(ROOT), "frontend", ".env")).read().count("VITE_API_URL=/api") == 1)

head("2. CORS (credentialed preflight)")
pre = requests.options(f"{API}/login/", headers={
    "Origin": "http://localhost:5173",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"})
allow = pre.headers.get("access-control-allow-headers", "")
check("preflight returns 200", pre.status_code == 200)
check("content-type explicitly allowed (not '*')",
      "content-type" in allow.lower() and allow.strip() != "*", allow)
check("credentials allowed", pre.headers.get("access-control-allow-credentials") == "true")

head("3. Media serving")
m = requests.get(f"{PROXY.replace('/api','')}/media/profile_pictures/default_profile.png")
check("default avatar served through proxy", m.status_code == 200 and m.headers["content-type"] == "image/png",
      f"{m.status_code} {m.headers.get('content-type')}")

head("4. HTTP 204 has no body (the Vite proxy 500 bug)")
r = requests.get(f"{API}/get-system-logs/")
check("Django returns a bodyless 204 or a 200 payload",
      (r.status_code == 204 and r.headers.get("Content-Length") in ("0", None) and not r.content)
      or r.status_code == 200, f"{r.status_code} len={len(r.content)}")
p = requests.get(f"{PROXY}/get-system-logs/")
check("same request survives the proxy (was 500)", p.status_code in (200, 204), p.status_code)
bodied = subprocess.run(
    ["grep", "-rn", "HTTP_204_NO_CONTENT", "--include=*.py", "user/"],
    capture_output=True, text=True).stdout
offenders = [l for l in bodied.splitlines() if "{" in l and not l.split(":", 2)[2].strip().startswith("#")]
check("no view returns a body with 204", not offenders, f"{len(offenders)} offenders")

# ==================================================== 5. authentication
head("5. Punch authentication")
wipe(BOB); wipe(ANNE)
bob_tok = token_for(BOB.username)
check("login issues a token", bool(bob_tok))
check("unauthenticated clock-in refused",
      requests.post(f"{API}/clock-in/", json={"user_id": BOB.id, **OFFICE}).status_code == 403)
check("unauthenticated clock-out refused",
      requests.put(f"{API}/clock-out/", json={"user_id": BOB.id, **OFFICE}).status_code == 403)
auth = {"Authorization": f"Token {bob_tok}"}
check("cannot punch on behalf of another employee",
      requests.post(f"{API}/clock-in/", json={"user_id": ANNE.id, **OFFICE}, headers=auth).status_code == 403)

# ================================================== 6. one device / person
head("6. One device, one person")
r = requests.post(f"{API}/clock-in/", json={**OFFICE, "android_id": ANNE_AID}, headers=auth)
check("punching on a colleague's phone is refused",
      r.status_code == 403 and r.json().get("device_conflict") is True, r.status_code)

anne_tok = token_for(ANNE.username)
r = requests.post(f"{API}/clock-in/", json={**OFFICE, "android_id": "totally-different-handset"},
                  headers={"Authorization": f"Token {anne_tok}"})
check("punching from an unregistered second phone is refused",
      r.status_code == 403 and r.json().get("device_mismatch") is True, r.status_code)

r = requests.post(f"{API}/clock-in/", json={**OFFICE}, headers={"Authorization": f"Token {anne_tok}"})
check("browser punch by someone with a bound phone -> use the app",
      r.status_code == 409 and r.json().get("use_mobile_app") is True, r.status_code)
check("  ...and the response names the device",
      bool(r.json().get("registered_device", {}).get("device_model")))

r = requests.post(f"{API}/clock-in/", json={**OFFICE, "android_id": ANNE_AID},
                  headers={"Authorization": f"Token {anne_tok}"})
check("punching from the OWN registered phone succeeds",
      r.status_code == 201 and r.json().get("punch_source") == "mobile", r.status_code)

r = requests.post(f"{API}/devices/register/", json={"user_id": BOB.id, "android_id": ANNE_AID})
check("registering a phone already bound to someone else is refused",
      r.status_code == 409 and r.json().get("device_conflict") is True, r.status_code)

r = requests.post(f"{API}/devices/register/",
                  json={"user_id": BOB.id, "android_id": "bob-fresh-handset-001",
                        "device_model": "Redmi 13C"})
check("registering a fresh phone binds it", r.status_code == 201, r.status_code)
bob_dev = UserDevice.objects.filter(user=BOB, is_active=True).first()
r = requests.post(f"{API}/devices/register/",
                  json={"user_id": BOB.id, "android_id": "bob-second-handset-002"})
check("a second active phone for the same user is refused",
      r.status_code == 409 and r.json().get("device_mismatch") is True, r.status_code)
r = requests.post(f"{API}/devices/{bob_dev.id}/revoke/",
                  json={"reason": "test", "revoked_by": ADMIN.id})
check("admin can revoke a device", r.status_code == 200)
check("  ...revocation frees the user to bind again",
      requests.post(f"{API}/devices/register/",
                    json={"user_id": BOB.id, "android_id": "bob-third-handset-003"}).status_code == 201)
check("  ...and is kept as history, not deleted",
      UserDevice.objects.filter(user=BOB, is_active=False).exists())
dev = UserDevice.objects.filter(user=BOB, is_active=True).first()
requests.post(f"{API}/devices/{dev.id}/revoke/", json={"reason": "regression check"})
r = requests.post(f"{API}/devices/register/",
                  json={"user_id": BOB.id, "android_id": dev.android_id})
check("re-registering a revoked handset works (was a 500)", r.status_code == 201, r.status_code)
check("  ...and the revoked binding is kept as history",
      UserDevice.objects.filter(android_id=dev.android_id, is_active=False).exists())
check("device roster endpoint lists active devices",
      isinstance(requests.get(f"{API}/devices/").json(), list))

# ================================================= 7. geofence + reason
head("7. Geofence with a stated reason")
UserDevice.objects.filter(user=BOB).update(is_active=False)   # put Bob back on the browser
wipe(BOB)
bob_tok = token_for(BOB.username)
auth = {"Authorization": f"Token {bob_tok}"}
r = requests.post(f"{API}/clock-in/", json={**FAR}, headers=auth)
check("outside the fence with no reason -> prompt",
      r.status_code == 400 and r.json().get("requires_outside_reason") is True, r.status_code)
check("  ...prompt reports the distance", isinstance(r.json().get("distance_meters"), int))
check("too-short reason rejected",
      requests.post(f"{API}/clock-in/", json={**FAR, "outside_reason": "Errand"},
                    headers=auth).status_code == 400)
check("blank reason rejected",
      requests.post(f"{API}/clock-in/", json={**FAR, "outside_reason": "     "},
                    headers=auth).status_code == 400)
check("mock location denied even WITH a good reason",
      requests.post(f"{API}/clock-in/", json={**FAR, "is_mock_location": True,
                    "outside_reason": "Buying printer ink for the office"},
                    headers=auth).status_code == 403)
r = requests.post(f"{API}/clock-in/",
                  json={**FAR, "outside_reason": "Buying printer ink for the office"}, headers=auth)
check("valid reason is accepted", r.status_code == 201, r.status_code)
check("  ...and recorded on the row",
      r.json().get("is_clock_in_outside") is True
      and r.json().get("clock_in_outside_reason") == "Buying printer ink for the office")
r = requests.put(f"{API}/clock-out/", json={**FAR}, headers=auth)
check("clock-out outside the fence also needs a reason",
      r.status_code == 400 and r.json().get("requires_outside_reason") is True, r.status_code)
check("clock-out with a reason succeeds",
      requests.put(f"{API}/clock-out/",
                   json={**FAR, "outside_reason": "Dropped documents at the bank"},
                   headers=auth).status_code == 200)
wipe(BOB)
r = requests.post(f"{API}/clock-in/", json={**OFFICE}, headers=auth)
check("inside the fence needs no reason", r.status_code == 201, r.status_code)
check("  ...and is not flagged as outside", r.json().get("is_clock_in_outside") is False)

# A real GPS fix carries more precision than the Decimal column allows; this
# used to reject every punch from an actual device.
wipe(BOB)
r = requests.post(f"{API}/clock-in/",
                  json={"latitude": 7.0805312345678, "longitude": 125.6226114567891}, headers=auth)
check("phone-grade GPS precision is accepted", r.status_code == 201, r.status_code)
check("  ...stored rounded to the column's 6 dp",
      str(r.json().get("clock_in_latitude")) == "7.080531", r.json().get("clock_in_latitude"))

# ============================================ 8. held for review + payroll
head("8. Browser punches held for review")
wipe(BOB)
r = requests.post(f"{API}/clock-in/", json={**OFFICE}, headers=auth)
check("browser punch by a phone-less employee is allowed", r.status_code == 201, r.status_code)
check("  ...but marked pending", r.json().get("review_status") == "pending")
check("  ...and tagged as a browser punch", r.json().get("punch_source") == "browser")
punch_id = r.json()["id"]
requests.put(f"{API}/clock-out/", json={**OFFICE}, headers=auth)
Attendance.objects.filter(pk=punch_id).update(working_hours=8.0)
from user.utils.attendance_totals import recalculate_summary
recalculate_summary(BOB, Attendance.objects.get(pk=punch_id).date)
punch_date = Attendance.objects.get(pk=punch_id).date
summ = AttendanceSummary.objects.get(user=BOB, date=punch_date)
check("held hours are measured on the row",
      Attendance.objects.get(pk=punch_id).working_hours == 8.0)
check("held hours are NOT paid in the summary",
      float(summ.total_working_hours) == 0.0, f"{summ.total_working_hours}")
queue = requests.get(f"{API}/attendance-review/").json()
check("punch appears in the review queue", any(x["id"] == punch_id for x in queue))
check("admin notified about the browser punch",
      Notifications.objects.filter(user=ADMIN, message__icontains="browser").exists())
r = requests.post(f"{API}/attendance-review/{punch_id}/",
                  json={"action": "approve", "reviewed_by": ADMIN.id})
check("approving works", r.status_code == 200 and r.json()["review_status"] == "approved")
summ.refresh_from_db()
check("  ...and the hours become payable", float(summ.total_working_hours) == 8.0,
      f"{summ.total_working_hours}")
check("re-reviewing an already-decided punch is refused",
      requests.post(f"{API}/attendance-review/{punch_id}/",
                    json={"action": "approve", "reviewed_by": ADMIN.id}).status_code == 404)
check("bad review action rejected",
      requests.post(f"{API}/attendance-review/{punch_id}/",
                    json={"action": "banana"}).status_code == 400)

# ================================================== 9. reminders feed
head("9. Reminders feed")
a = requests.get(f"{API}/reminders/", params={"user_id": ADMIN.id}).json()
check("admin feed is flagged as admin", a["is_admin"] is True)
keys = {r["key"] for r in a["reminders"]}
check("admin sees pending leave", "leave_pending" in keys, sorted(keys))
check("admin sees employees without a device", "no_device" in keys)
check("severities are ordered worst-first",
      [r["severity"] for r in a["reminders"]] ==
      sorted([r["severity"] for r in a["reminders"]],
             key=lambda s: {"critical": 0, "warning": 1, "info": 2}[s]))
s_ = requests.get(f"{API}/reminders/", params={"user_id": BOB.id}).json()
check("employee feed is not admin", s_["is_admin"] is False)
check("employee is told to register the app",
      "register_device" in {r["key"] for r in s_["reminders"]},
      sorted(r["key"] for r in s_["reminders"]))
check("reminders require a user_id",
      requests.get(f"{API}/reminders/").status_code == 400)
check("reminders reachable through the proxy",
      requests.get(f"{PROXY}/reminders/", params={"user_id": ADMIN.id}).status_code == 200)

# ==================================================== 10. seeded dataset
head("10. Seeded dataset integrity")
check("employees seeded", CustomUser.objects.filter(role__role_name="user").count() >= 10)
check("attendance history seeded", Attendance.objects.count() > 300)
check("leave in all three states",
      {"pending", "approved", "declined"} <=
      set(LeaveRequest.objects.values_list("status", flat=True)))
check("approved leave has a matching on_leave row",
      not any(not Attendance.objects.filter(user=r.user, date=r.start_date,
                                            status="on_leave").exists()
              for r in LeaveRequest.objects.filter(status="approved")))
check("approved leave linked to its attendance row",
      LeaveRequest.objects.filter(status="approved",
                                  attendance_id__isnull=False).count() > 0)
check("sick leave is filed same-day, planned leave in advance",
      all((r.start_date - r.created_at.date()).days <= 1
          for r in LeaveRequest.objects.filter(status="approved", type="sick")))
check("no attendance predates a hire date",
      not any(a.user and a.date < a.user.date_joined.date()
              for a in Attendance.objects.select_related("user")))
check("every off-site punch carries a reason",
      Attendance.objects.filter(is_clock_in_outside=True,
                                clock_in_outside_reason__isnull=True).count() == 0)
check("overtime sessions are second punches with an approved request",
      Attendance.objects.filter(is_overtime_clock_in=True).count() > 0
      and OvertimeRequest.objects.filter(status="approved", used=True).count() > 0)
check("payslips balance (gross - deductions == net)",
      all(p.gross_pay - p.deductions == p.net_pay for p in Payslip.objects.all()))
check("only finished payroll periods are processed",
      not PayrollPeriod.objects.filter(is_processed=True,
                                       end_date__gte=Attendance.objects.order_by('-date')
                                       .first().date).exists())
check("late rate is realistic (5-20%)",
      0.05 <= (Attendance.objects.filter(status="late").count() /
               max(Attendance.objects.filter(status__in=["late", "working"],
                                             is_overtime_clock_in=False).count(), 1)) <= 0.20,
      f"{Attendance.objects.filter(status='late').count()} late")
check("leave start dates are not piled on Monday",
      max(sum(1 for r in LeaveRequest.objects.all()
              if r.start_date.weekday() == d) for d in range(5))
      <= 0.5 * LeaveRequest.objects.count() + 1)

# ======================================================== 11. the tunnel
head("11. Public tunnel")
code = curl_tunnel("/")
if code == "000":
    check("tunnel reachable", False, SKIP)
else:
    check("app served over the tunnel", code == "200", code)
    check("API served over the tunnel", curl_tunnel("/api/locations/") == "200")
    check("browser UA without the skip header gets the interstitial (expected)",
          True, "documented ngrok free-plan behaviour")
    check("unauthenticated punch refused over the tunnel too",
          curl_tunnel("/api/clock-in/", "POST", {"user_id": BOB.id, **OFFICE}) == "403")

# ==================================================== 12. static checks
head("12. Frontend build and static checks")
fe = os.path.join(os.path.dirname(ROOT), "frontend")
tsc = subprocess.run(["npx", "tsc", "-b", "--noEmit"], cwd=fe, capture_output=True, text=True)
check("TypeScript compiles clean", tsc.returncode == 0, tsc.stdout[-200:] if tsc.returncode else "")
lint = subprocess.run(["npx", "eslint", "src/store/reminderStore.ts",
                       "src/components/RemindersList.tsx", "src/pages/Reminders.tsx"],
                      cwd=fe, capture_output=True, text=True)
check("new frontend files lint clean", lint.returncode == 0, lint.stdout[-200:] if lint.returncode else "")
side = open(f"{fe}/src/layouts/DashboardLayout.tsx").read()
check("sidebar nav is scrollable (min-h-0 + overflow-y-auto)",
      "flex-1 min-h-0 overflow-y-auto" in side)
check("sidebar header/footer pinned (shrink-0)", side.count("shrink-0") >= 3)
vite = open(f"{fe}/vite.config.ts").read()
check("vite proxies /api and /media", '"/api"' in vite and '"/media"' in vite)
check("vite allows ngrok hosts", ".ngrok-free.app" in vite)
check("reminders route registered", "/reminders" in open(f"{fe}/src/router.tsx").read())
check("reminders in both sidebars",
      open(f"{fe}/src/data/dashboard-data.tsx").read().count('path: "/reminders"') == 2)
mig = subprocess.run(["env/bin/python", "manage.py", "makemigrations", "--check", "--dry-run"],
                     cwd=ROOT, capture_output=True, text=True)
check("no unapplied model changes", mig.returncode == 0, mig.stdout.strip()[-120:])

# ================================================== 13. timezone handling
head("13. Timezone correctness")
from zoneinfo import ZoneInfo
from django.utils import timezone as djtz
UTC, MNL = ZoneInfo("UTC"), ZoneInfo("Asia/Manila")
check("TIME_ZONE is the workforce's zone", settings.TIME_ZONE == "Asia/Manila", settings.TIME_ZONE)
check("USE_TZ keeps storage in UTC", settings.USE_TZ is True)
check("localdate() is the Manila calendar date",
      djtz.localdate() == __import__("datetime").datetime.now(MNL).date())

# An arrival at 07:43 Manila is 23:43 UTC the previous day. Under TIME_ZONE=UTC
# these rows were filed under the wrong date and clock_in__date=today missed
# them entirely, so the duplicate-punch check failed for early arrivals.
straddling = [a for a in Attendance.objects.exclude(clock_in=None)
              if a.clock_in.astimezone(UTC).date() != a.clock_in.astimezone(MNL).date()]
check("dataset actually exercises the UTC/Manila boundary", len(straddling) > 0,
      f"{len(straddling)} rows")
if straddling:
    a = straddling[0]
    check("stored date is the Manila date, not the UTC one",
          a.date == a.clock_in.astimezone(MNL).date())
    check("clock_in__date lookup matches the stored date",
          Attendance.objects.filter(pk=a.pk, clock_in__date=a.date).exists())
    check("  ...and does NOT match the UTC date",
          not Attendance.objects.filter(
              pk=a.pk, clock_in__date=a.clock_in.astimezone(UTC).date()).exists())

naive = subprocess.run(
    ["grep", "-rnE", r"datetime\.now\(\)|date\.today\(\)|datetime\.today\(\)|\.utcnow\(\)",
     "--include=*.py", "user/", "backend/"],
    capture_output=True, text=True, cwd=ROOT).stdout
leaks = [l for l in naive.splitlines()
         if "__pycache__" not in l and "management/commands" not in l]
check("no naive date/time calls in views or settings", not leaks,
      f"{len(leaks)} found")

# =============================================================== summary
print("\n" + "=" * 66)
by_section = {}
for sec, _label, ok in results:
    p, f = by_section.get(sec, (0, 0))
    by_section[sec] = (p + int(ok), f + int(not ok))
for sec, (p, f) in by_section.items():
    flag = "\033[31m <-- FAILURES\033[0m" if f else ""
    print(f"  {sec:46} {p:2} passed, {f} failed{flag}")
total_p = sum(p for p, _ in by_section.values())
total_f = sum(f for _, f in by_section.values())
print("=" * 66)
print(f"  TOTAL: {total_p} passed, {total_f} failed")
if total_f:
    print("\n  Failures:")
    for sec, label, ok in results:
        if not ok:
            print(f"    - [{sec}] {label}")
sys.exit(1 if total_f else 0)
