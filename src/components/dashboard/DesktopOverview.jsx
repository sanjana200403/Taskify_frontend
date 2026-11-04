import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  ListTodo,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { formatTaskDate } from "../../utils/date.js";
import Button from "../common/Button.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Loader from "../common/Loader.jsx";

const rangeOptions = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const upcomingCopy = {
  week: { eyebrow: "This week", title: "Upcoming this week", empty: "No more tasks are scheduled this week." },
  month: { eyebrow: "This month", title: "Upcoming this month", empty: "No more tasks are scheduled this month." },
  year: { eyebrow: "This year", title: "Upcoming this year", empty: "No more tasks are scheduled this year." },
};

function formatRange(start, end) {
  if (!start || !end) return "Current period";
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${formatter.format(new Date(`${start}T12:00:00`))} - ${formatter.format(new Date(`${end}T12:00:00`))}`;
}

function MetricCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span className="metric-card__icon">
          <Icon size={18} />
        </span>
        <span className="metric-card__note">{note}</span>
      </div>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  );
}

function ActivityChart({ items }) {
  const maximum = Math.max(...items.map((item) => item.total), 1);
  return (
    <div className="activity-chart" aria-label="Task activity chart">
      {items.map((item) => {
        const totalHeight = item.total ? Math.max((item.total / maximum) * 100, 12) : 5;
        const completeHeight = item.total ? (item.completed / item.total) * 100 : 0;
        return (
          <div className="activity-chart__column" key={item.key}>
            <div className="activity-chart__value">{item.total || ""}</div>
            <div className="activity-chart__track">
              <div className="activity-chart__total" style={{ height: `${totalHeight}%` }}>
                <span style={{ height: `${completeHeight}%` }} />
              </div>
            </div>
            <span className="activity-chart__label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DesktopOverview({
  analytics,
  loading,
  error,
  range,
  todayLabel,
  greeting,
  firstName,
  onRangeChange,
  onRetry,
  onOpenTask,
  onCreateTask,
  onViewAll,
}) {
  const maxPriority = Math.max(analytics.priority.low, analytics.priority.medium, analytics.priority.high, 1);

  return (
    <>
      <section className="dashboard-page-heading">
        <div>
          <p>
            <Sparkles size={13} />
            {todayLabel}
          </p>
          <h1>
            {greeting}, {firstName}.
          </h1>
          <span>Here is a clear view of your workload and progress.</span>
        </div>
        <div className="range-switch" aria-label="Analytics period">
          {rangeOptions.map((option) => (
            <button
              className={range === option.value ? "is-active" : ""}
              key={option.value}
              type="button"
              onClick={() => onRangeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="dashboard-loading">
          <Loader label="Loading overview" />
        </div>
      ) : error ? (
        <div className="dashboard-error">
          <EmptyState
            title="Overview could not load"
            message={error}
            action={
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="analytics-period">
            <CalendarDays size={14} />
            {formatRange(analytics.rangeStart, analytics.rangeEnd)}
          </div>

          <section className="metrics-grid">
            <MetricCard
              label="Total tasks"
              value={analytics.total}
              note="In this period"
              icon={ListTodo}
              tone="neutral"
            />
            <MetricCard
              label="Pending"
              value={analytics.status.pending}
              note="Not started"
              icon={CircleDashed}
              tone="pending"
            />
            <MetricCard
              label="In progress"
              value={analytics.status.inProgress}
              note="Being worked on"
              icon={TimerReset}
              tone="progress"
            />
            <MetricCard
              label="Completed"
              value={analytics.status.completed}
              note={`${analytics.completionRate}% completion`}
              icon={CheckCircle2}
              tone="complete"
            />
          </section>

          <section className="overview-grid">
            <article className="dashboard-card performance-card">
              <div className="card-heading">
                <div>
                  <span>Performance</span>
                  <h2>Task activity</h2>
                  <p>Total tasks and completed work across this period.</p>
                </div>
                <div className="chart-legend">
                  <span>
                    <i className="legend-total" />
                    Total
                  </span>
                  <span>
                    <i className="legend-complete" />
                    Completed
                  </span>
                </div>
              </div>
              <ActivityChart items={analytics.activity} />
            </article>

            <article className="dashboard-card focus-card">
              <div className="card-heading">
                <div>
                  <span>Focus</span>
                  <h2>Completion health</h2>
                </div>
              </div>
              <div className="completion-summary">
                <div
                  className="completion-ring"
                  style={{ background: `conic-gradient(#4f63e9 ${analytics.completionRate}%, #e9edf7 0)` }}
                >
                  <div>
                    <strong>{analytics.completionRate}%</strong>
                    <span>complete</span>
                  </div>
                </div>
                <div>
                  <strong>{analytics.status.completed} completed</strong>
                  <p>out of {analytics.total} tasks in this period</p>
                </div>
              </div>
              <div className="focus-stats">
                <div>
                  <span className="focus-icon focus-icon--danger">
                    <AlertTriangle size={16} />
                  </span>
                  <p>
                    <strong>{analytics.overdue}</strong>Overdue
                  </p>
                </div>
                <div>
                  <span className="focus-icon focus-icon--warning">
                    <Clock3 size={16} />
                  </span>
                  <p>
                    <strong>{analytics.dueSoon}</strong>Due in 7 days
                  </p>
                </div>
                <div>
                  <span className="focus-icon focus-icon--brand">
                    <Target size={16} />
                  </span>
                  <p>
                    <strong>{analytics.priority.high}</strong>High priority
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section className="overview-bottom-grid">
            <article className="dashboard-card upcoming-card">
              <div className="card-heading card-heading--row">
                <div>
                  <span>{upcomingCopy[range].eyebrow}</span>
                  <h2>{upcomingCopy[range].title}</h2>
                </div>
                <button type="button" onClick={onViewAll}>
                  View all <ChevronRight size={14} />
                </button>
              </div>
              {analytics.upcoming.length ? (
                <div className="upcoming-list">
                  {analytics.upcoming.map((task) => (
                    <button type="button" key={task._id} onClick={() => onOpenTask(task)}>
                      <span className={`upcoming-dot upcoming-dot--${task.priority.toLowerCase()}`} />
                      <div>
                        <strong>{task.title}</strong>
                        <small>{formatTaskDate(task.scheduledAt)}</small>
                      </div>
                      <em>{task.status}</em>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing upcoming"
                  message={upcomingCopy[range].empty}
                  action={
                    <Button variant="secondary" onClick={onCreateTask}>
                      Add a task
                    </Button>
                  }
                />
              )}
            </article>

            <article className="dashboard-card priority-card">
              <div className="card-heading">
                <div>
                  <span>Workload</span>
                  <h2>Priority breakdown</h2>
                  <p>How your tasks are distributed by importance.</p>
                </div>
              </div>
              {[
                ["High", analytics.priority.high, "danger"],
                ["Medium", analytics.priority.medium, "warning"],
                ["Low", analytics.priority.low, "success"],
              ].map(([label, value, tone]) => (
                <div className="priority-row" key={label}>
                  <div>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                  <div className="priority-track">
                    <span
                      className={`priority-fill priority-fill--${tone}`}
                      style={{ width: `${(value / maxPriority) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </article>
          </section>
        </>
      )}
    </>
  );
}
