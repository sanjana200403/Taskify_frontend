import { Bell, Check, ChevronLeft, ChevronRight, Menu, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import WeeklyCard from "../dashboard/WeeklyCard.jsx";
import { toLocalDateKey } from "../../utils/date.js";
import MobileAllTasksView from "./MobileAllTasksView.jsx";
import MobileTaskRow from "./MobileTaskRow.jsx";
import "./MobileTaskApp.css";

function getWeekStartKey(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  date.setHours(0, 0, 0, 0);
  return toLocalDateKey(date);
}

function weekFromStart(weekStart) {
  const monday = new Date(`${weekStart}T00:00:00`);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: toLocalDateKey(date),
      weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date).slice(0, 2),
      day: date.getDate(),
      label: new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date),
      shortLabel: new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date),
    };
  });
}

export default function MobileTaskApp({
  view,
  onViewChange,
  analytics,
  analyticsLoading = false,
  tasks,
  query,
  onQueryChange,
  onAdd,
  onToggle,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  busyTaskId,
  onMenu,
  selectedDate: controlledSelectedDate,
  onSelectedDateChange,
  visibleWeekStart,
  onVisibleWeekChange,
  statusFilter = "",
  priorityFilter = "",
  onStatusFilterChange,
  onPriorityFilterChange,
  onClearTaskFilters,
  taskMeta = { page: 1, total: 0, totalPages: 1 },
  taskLoading = false,
  taskError = "",
  onRetryTasks,
  onTaskPageChange,
  overviewTaskLoading = false,
  overviewTaskError = "",
  onRetryOverviewTasks,
  weeklySummaries = [],
  weeklyLoading = false,
  weeklyError = "",
  expandedWeek = "",
  expandedWeekTasks = [],
  expandedWeekLoading = false,
  expandedWeekError = "",
  onToggleWeek,
  onRetryWeeks,
  onRetryExpandedWeek,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [overviewQuery, setOverviewQuery] = useState("");
  const [localSelectedDate, setLocalSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const selectedDate = controlledSelectedDate || localSelectedDate;
  const selectDate = onSelectedDateChange || setLocalSelectedDate;
  const activeWeekStart = visibleWeekStart || getWeekStartKey(selectedDate);
  const week = useMemo(() => weekFromStart(activeWeekStart), [activeWeekStart]);
  const todayKey = toLocalDateKey(new Date());
  const currentWeekStart = getWeekStartKey();
  const weekContextLabel = activeWeekStart === currentWeekStart ? "This Week" : "Selected Week";
  const selectedDateTasks = useMemo(
    () => tasks.filter((task) => toLocalDateKey(task.scheduledAt) === selectedDate),
    [tasks, selectedDate],
  );
  const taskCountByDate = useMemo(
    () =>
      tasks.reduce((counts, task) => {
        const dateKey = toLocalDateKey(task.scheduledAt);
        counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
        return counts;
      }, new Map()),
    [tasks],
  );
  const normalizedOverviewQuery = overviewQuery.trim().toLowerCase();
  const selectedTasks = useMemo(() => {
    if (!normalizedOverviewQuery) return selectedDateTasks;
    return tasks.filter((task) =>
      `${task.title} ${task.description || ""}`.toLowerCase().includes(normalizedOverviewQuery),
    );
  }, [normalizedOverviewQuery, selectedDateTasks, tasks]);
  const selectedDay = week.find((day) => day.key === selectedDate);
  const selectedHeading = normalizedOverviewQuery
    ? "Search Results"
    : selectedDate === todayKey
      ? "Tasks Today"
      : `Tasks for ${selectedDay?.shortLabel ?? selectedDate}`;
  const pending = analytics.status.pending + analytics.status.inProgress;
  const hasWeeklyTasks = analytics.total > 0;
  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const closeOnOutsidePress = (event) => {
      if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  const navigateWeek = (direction) => {
    const nextWeek = new Date(`${activeWeekStart}T00:00:00`);
    nextWeek.setDate(nextWeek.getDate() + direction * 7);

    const selected = new Date(`${selectedDate}T00:00:00`);
    selected.setDate(selected.getDate() + direction * 7);

    const nextWeekStart = toLocalDateKey(nextWeek);
    const nextSelectedDate = toLocalDateKey(selected);
    if (onVisibleWeekChange) onVisibleWeekChange(nextWeekStart, nextSelectedDate);
    else selectDate(nextSelectedDate);
  };

  if (view === "tasks") {
    return (
      <MobileAllTasksView
        tasks={tasks}
        query={query}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        taskMeta={taskMeta}
        taskLoading={taskLoading}
        taskError={taskError}
        busyTaskId={busyTaskId}
        onBack={() => onViewChange("overview")}
        onQueryChange={onQueryChange}
        onStatusFilterChange={onStatusFilterChange}
        onPriorityFilterChange={onPriorityFilterChange}
        onClearTaskFilters={onClearTaskFilters}
        onRetryTasks={onRetryTasks}
        onTaskPageChange={onTaskPageChange}
        onToggle={onToggle}
        onStatusChange={onStatusChange}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <section className="mobile-task-app mobile-home-screen">
      <header className="mobile-home-actions">
        <button type="button" onClick={onMenu} aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <div ref={notificationsRef}>
          <button
            className="mobile-header-search"
            type="button"
            onClick={() => onViewChange("tasks")}
            aria-label="Search tasks"
          >
            <Search size={19} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={19} />
          </button>
          {notificationsOpen && (
            <div className="mobile-notification-popover" role="status">
              <strong>No new notifications</strong>
              <span>You are all caught up.</span>
            </div>
          )}
        </div>
      </header>

      <button className="mobile-search-trigger" type="button" onClick={() => onViewChange("tasks")}>
        <span>Search for a task</span>
        <Search size={18} />
      </button>

      <div className="mobile-overview-search">
        <label className="sr-only" htmlFor="overview-task-search">
          Search this week&apos;s tasks
        </label>
        <input
          id="overview-task-search"
          type="search"
          value={overviewQuery}
          onChange={(event) => setOverviewQuery(event.target.value)}
          placeholder="Search this week's tasks"
          maxLength={120}
        />
        {overviewQuery ? (
          <button type="button" onClick={() => setOverviewQuery("")} aria-label="Clear overview search">
            <X size={17} />
          </button>
        ) : (
          <Search size={18} aria-hidden="true" />
        )}
      </div>

      <div className="mobile-week-navigation">
        <button
          className="mobile-week-nav-button"
          type="button"
          onClick={() => navigateWeek(-1)}
          aria-label="Show previous week"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="mobile-week-strip">
          {week.map((day) => {
            const taskCount = taskCountByDate.get(day.key) || 0;
            return (
              <button
                type="button"
                className={day.key === selectedDate ? "is-selected" : ""}
                key={day.key}
                onClick={() => selectDate(day.key)}
                aria-label={`${day.weekday} ${day.day}. Show tasks for ${day.label}, ${taskCount ? `${taskCount} ${taskCount === 1 ? "task" : "tasks"}` : "no tasks"}`}
                aria-pressed={day.key === selectedDate}
              >
                <span>{day.weekday}</span>
                <strong>{day.day}</strong>
                <i className={`mobile-week-task-dot ${taskCount ? "has-tasks" : ""}`} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <button
          className="mobile-week-nav-button"
          type="button"
          onClick={() => navigateWeek(1)}
          aria-label="Show next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mobile-summary-grid" aria-busy={analyticsLoading}>
        {analyticsLoading ? (
          <>
            <article className="mobile-summary mobile-summary--complete mobile-summary--loading">
              <span />
              <span />
              <span />
            </article>
            <article className="mobile-summary mobile-summary--pending mobile-summary--loading">
              <span />
              <span />
              <span />
            </article>
          </>
        ) : (
          <>
            <article className="mobile-summary mobile-summary--complete">
              <div>
                <span>
                  <Check size={13} />
                </span>
                <p>Task Complete</p>
              </div>
              <strong>{String(analytics.status.completed).padStart(2, "0")}</strong>
              <small>{weekContextLabel}</small>
            </article>
            <article className="mobile-summary mobile-summary--pending">
              <div>
                <span>×</span>
                <p>Task Pending</p>
              </div>
              <strong>{String(pending).padStart(2, "0")}</strong>
              <small>{weekContextLabel}</small>
            </article>
          </>
        )}
      </div>

      <section
        className={`mobile-progress-section ${analyticsLoading ? "is-loading" : ""}`}
        aria-busy={analyticsLoading}
      >
        <div>
          <h2>Weekly Progress</h2>
          {analyticsLoading ? (
            <i className="mobile-progress-value-skeleton" />
          ) : (
            <strong>{hasWeeklyTasks ? `${analytics.completionRate}%` : "No tasks this week"}</strong>
          )}
        </div>
        <div
          className="mobile-progress-track"
          role={hasWeeklyTasks && !analyticsLoading ? "progressbar" : undefined}
          aria-label={hasWeeklyTasks && !analyticsLoading ? "Weekly task completion" : undefined}
          aria-valuemin={hasWeeklyTasks && !analyticsLoading ? 0 : undefined}
          aria-valuemax={hasWeeklyTasks && !analyticsLoading ? 100 : undefined}
          aria-valuenow={hasWeeklyTasks && !analyticsLoading ? analytics.completionRate : undefined}
        >
          <span style={{ width: analyticsLoading ? "34%" : hasWeeklyTasks ? `${analytics.completionRate}%` : "0%" }} />
        </div>
      </section>

      <section className="mobile-today-section">
        <div className="mobile-section-heading">
          <div className="mobile-section-title">
            <h2>{selectedHeading}</h2>
            <span>
              {selectedTasks.length}{" "}
              {normalizedOverviewQuery
                ? selectedTasks.length === 1
                  ? "result"
                  : "results"
                : selectedTasks.length === 1
                  ? "task"
                  : "tasks"}
            </span>
          </div>
          <button type="button" onClick={() => onViewChange("tasks")}>
            View All
          </button>
        </div>
        <div className="mobile-today-list" aria-live="polite" aria-busy={overviewTaskLoading}>
          {overviewTaskLoading ? (
            <div
              className="task-list-loading task-list-loading--overview"
              role="status"
              aria-label="Loading overview tasks"
            >
              {[0, 1, 2].map((item) => (
                <span key={item} />
              ))}
            </div>
          ) : overviewTaskError ? (
            <div className="mobile-empty-state mobile-empty-state--compact task-results-error" role="alert">
              <strong>We couldn&apos;t load your tasks</strong>
              <span>{overviewTaskError}</span>
              <button type="button" onClick={onRetryOverviewTasks}>
                Try again
              </button>
            </div>
          ) : selectedTasks.length ? (
            selectedTasks.map((task) => (
              <MobileTaskRow
                key={task._id}
                task={task}
                onToggle={onToggle}
                onStatusChange={onStatusChange}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                busy={busyTaskId === task._id}
              />
            ))
          ) : normalizedOverviewQuery ? (
            <div className="mobile-empty-state mobile-empty-state--compact">
              <Search size={21} />
              <strong>No matching tasks this week</strong>
              <span>Try another title or description.</span>
            </div>
          ) : (
            <div className="mobile-empty-state mobile-empty-state--compact">
              <Check size={21} />
              <strong>{selectedDate === todayKey ? "No tasks today" : "No tasks for this date"}</strong>
              <span>Your schedule is clear.</span>
            </div>
          )}
        </div>
      </section>

      <section className="mobile-weeks-section" aria-labelledby="weekly-summary-title">
        <div className="mobile-weeks-heading">
          <div>
            <h2 id="weekly-summary-title">Your weeks</h2>
            <p>Open includes Pending and In Progress tasks.</p>
          </div>
        </div>
        {weeklyLoading ? (
          <div className="mobile-weeks-grid" role="status" aria-label="Loading weekly summaries">
            {[0, 1].map((item) => (
              <div className="mobile-week-skeleton" key={item} />
            ))}
          </div>
        ) : weeklyError ? (
          <div className="mobile-week-state" role="alert">
            <strong>We couldn&apos;t load your weeks</strong>
            <span>{weeklyError}</span>
            <button type="button" onClick={onRetryWeeks}>
              Try again
            </button>
          </div>
        ) : weeklySummaries.length ? (
          <div className="mobile-weeks-grid">
            {weeklySummaries.map((summary) => {
              const isExpanded = expandedWeek === summary.weekStart;
              return (
                <WeeklyCard
                  key={summary.weekStart}
                  summary={summary}
                  expanded={isExpanded}
                  onClick={() => onToggleWeek?.(summary)}
                >
                  <div className="mobile-week-expanded" aria-live="polite" aria-busy={expandedWeekLoading}>
                    {expandedWeekLoading ? (
                      <div className="mobile-week-task-loading" role="status">
                        <span />
                        <span />
                      </div>
                    ) : expandedWeekError ? (
                      <div className="mobile-week-state mobile-week-state--inside" role="alert">
                        <strong>We couldn&apos;t load this week</strong>
                        <span>{expandedWeekError}</span>
                        <button type="button" onClick={onRetryExpandedWeek}>
                          Try again
                        </button>
                      </div>
                    ) : expandedWeekTasks.length ? (
                      expandedWeekTasks.map((task) => (
                        <MobileTaskRow
                          key={task._id}
                          task={task}
                          onToggle={onToggle}
                          onStatusChange={onStatusChange}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          busy={busyTaskId === task._id}
                        />
                      ))
                    ) : (
                      <div className="mobile-week-state mobile-week-state--inside">
                        <strong>No tasks in this week</strong>
                        <span>This week is clear.</span>
                      </div>
                    )}
                  </div>
                </WeeklyCard>
              );
            })}
          </div>
        ) : (
          <div className="mobile-week-state">
            <strong>No weekly history yet</strong>
            <span>Create a task to start building your weekly summary.</span>
          </div>
        )}
      </section>

      <button className="mobile-fab" type="button" onClick={() => onAdd(selectedDate)} aria-label="Add task">
        <Plus size={25} />
      </button>
    </section>
  );
}
