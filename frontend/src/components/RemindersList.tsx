import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { AlertTriangle, AlertCircle, Info, BellRing, Loader2, CheckCircle2, Globe, MapPin } from 'lucide-react';
import { useReminderStore, type ReminderSeverity } from '@/store/reminderStore';

const SEVERITY = {
  critical: {
    label: 'Needs attention now',
    icon: AlertCircle,
    row: 'border-red-200 bg-red-50/60',
    chip: 'bg-red-100 text-red-700',
    iconColor: 'text-red-600',
  },
  warning: {
    label: 'Waiting on you',
    icon: AlertTriangle,
    row: 'border-amber-200 bg-amber-50/60',
    chip: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
  },
  info: {
    label: 'Good to know',
    icon: Info,
    row: 'border-sky-200 bg-sky-50/60',
    chip: 'bg-sky-100 text-sky-700',
    iconColor: 'text-sky-600',
  },
} satisfies Record<ReminderSeverity, unknown> & Record<string, {
  label: string;
  icon: typeof Info;
  row: string;
  chip: string;
  iconColor: string;
}>;

const ORDER: ReminderSeverity[] = ['critical', 'warning', 'info'];

export default function RemindersList() {
  const {
    reminders, total, isAdmin, isLoading, error, fetchReminders,
    heldPunches, fetchHeldPunches, reviewPunch, reviewingId,
  } = useReminderStore();

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // The review queue is admin-only; the endpoint is fetched separately so a
  // non-admin never pulls the whole company's punches.
  useEffect(() => {
    if (isAdmin) fetchHeldPunches();
  }, [isAdmin, fetchHeldPunches]);

  const formatTime = (value: string | null) =>
    value
      ? new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : '--';

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-1">
          <BellRing className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Reminders</h1>
          {total > 0 && (
            <span className="px-2.5 py-0.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full">
              {total}
            </span>
          )}
        </div>
        <p className="mb-6 text-sm text-gray-500">
          {isAdmin
            ? 'Everything across the team that is waiting on an administrator.'
            : 'Things you need to take care of.'}
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading reminders...
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {!isLoading && !error && reminders.length === 0 && heldPunches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center border border-gray-200 rounded-xl bg-gray-50/60">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="font-medium text-gray-900">Nothing needs your attention</p>
            <p className="max-w-sm text-sm text-gray-500">
              Approvals, unclosed timesheets and device sign-ups all show up here when
              they need doing.
            </p>
          </div>
        )}

        {isAdmin && heldPunches.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Held for review
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              These punches came from a browser rather than a registered phone. They are
              recorded but do <span className="font-medium">not</span> count toward hours
              or payroll until you approve them.
            </p>
            <ul className="space-y-2">
              {heldPunches.map((punch) => (
                <li
                  key={punch.id}
                  className="flex flex-wrap items-center gap-3 p-4 border border-red-200 rounded-xl bg-red-50/60"
                >
                  <Globe className="w-5 h-5 flex-shrink-0 text-red-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium text-gray-900">
                        {punch.user_name ?? `Employee #${punch.user_id}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {punch.date} &middot; {formatTime(punch.clock_in)} -{' '}
                        {formatTime(punch.clock_out)}
                        {punch.working_hours ? ` (${punch.working_hours}h)` : ''}
                      </span>
                    </div>
                    {punch.is_clock_in_outside && (
                      <p className="flex items-start gap-1 mt-1 text-sm text-amber-700">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Outside the work area
                          {punch.clock_in_outside_reason
                            ? `: "${punch.clock_in_outside_reason}"`
                            : ''}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => reviewPunch(punch.id, 'reject')}
                      disabled={reviewingId === punch.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => reviewPunch(punch.id, 'approve')}
                      disabled={reviewingId === punch.id}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {reviewingId === punch.id ? 'Saving...' : 'Approve'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!isLoading && !error && reminders.length > 0 && (
          <div className="space-y-6">
            {ORDER.map((severity) => {
              const group = reminders.filter((item) => item.severity === severity);
              if (group.length === 0) return null;

              const meta = SEVERITY[severity];
              const Icon = meta.icon;

              return (
                <section key={severity}>
                  <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    {meta.label}
                  </h2>
                  <ul className="space-y-2">
                    {group.map((item) => (
                      <li
                        key={item.key}
                        className={`flex items-start gap-3 p-4 border rounded-xl ${meta.row}`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${meta.iconColor}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">{item.title}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${meta.chip}`}>
                              {item.count}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.detail}</p>
                        </div>
                        {item.action_url && (
                          <Link
                            to={item.action_url}
                            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50"
                          >
                            Review
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
