import { ArrowLeft, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import MobileTaskRow from "./MobileTaskRow.jsx";

export default function MobileAllTasksView({
  tasks,
  query,
  statusFilter,
  priorityFilter,
  taskMeta,
  taskLoading,
  taskError,
  busyTaskId,
  onBack,
  onQueryChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onClearTaskFilters,
  onRetryTasks,
  onTaskPageChange,
  onToggle,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
}) {
  const hasTaskFilters = Boolean(query.trim() || statusFilter || priorityFilter);
  const activeTaskFilterCount =
    Number(Boolean(query.trim())) + Number(Boolean(statusFilter)) + Number(Boolean(priorityFilter));

  return (
    <section className="mobile-task-app mobile-search-screen">
      <div className="task-manager-shell">
        <header className="task-manager-heading">
          <button className="task-manager-back" type="button" onClick={onBack} aria-label="Back to overview">
            <ArrowLeft size={20} />
          </button>
          <div className="task-manager-title">
            <span>Task management</span>
            <h1>All tasks</h1>
            <p>Search, filter, and manage your work in one place.</p>
          </div>
        </header>

        <section className="task-filter-card" aria-label="Task filters">
          <div className="task-filter-card__title">
            <span>
              <SlidersHorizontal size={17} />
            </span>
            <div>
              <strong>Filters</strong>
              <small>Narrow down your task list</small>
            </div>
            {hasTaskFilters && (
              <button
                className="task-filter-clear"
                type="button"
                onClick={onClearTaskFilters}
                aria-label={`Clear filters (${activeTaskFilterCount} active)`}
                title={`Clear ${activeTaskFilterCount} active ${activeTaskFilterCount === 1 ? "filter" : "filters"}`}
              >
                <X size={12} aria-hidden="true" />
                <span>
                  Clear<span className="task-filter-clear__suffix"> filters</span>
                </span>
              </button>
            )}
          </div>
          <div className="task-filter-controls">
            <label className="task-manager-search">
              <span className="sr-only">Search tasks</span>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search by title or description"
                maxLength={120}
              />
              {query && (
                <button type="button" onClick={() => onQueryChange("")} aria-label="Clear task search">
                  <X size={16} />
                </button>
              )}
            </label>
            <label className="task-filter-select">
              <span>Status</span>
              <span className="task-filter-select__control">
                <select value={statusFilter} onChange={(event) => onStatusFilterChange?.(event.target.value)}>
                  <option value="">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </label>
            <label className="task-filter-select">
              <span>Priority</span>
              <span className="task-filter-select__control">
                <select value={priorityFilter} onChange={(event) => onPriorityFilterChange?.(event.target.value)}>
                  <option value="">All priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </label>
          </div>
        </section>

        <section className="task-results-card" aria-labelledby="all-tasks-title">
          <div className="task-results-heading">
            <div>
              <span>
                {taskMeta.total} {taskMeta.total === 1 ? "result" : "results"}
              </span>
              <h2 id="all-tasks-title">Your tasks</h2>
            </div>
            {hasTaskFilters && <p>Showing tasks that match your selected filters.</p>}
          </div>
          <div className="mobile-search-results" aria-live="polite" aria-busy={taskLoading}>
            {taskLoading ? (
              <div className="task-list-loading" role="status" aria-label="Loading tasks">
                {[0, 1, 2].map((item) => (
                  <span key={item} />
                ))}
              </div>
            ) : taskError ? (
              <div className="mobile-empty-state task-results-error" role="alert">
                <strong>We couldn&apos;t load your tasks</strong>
                <span>{taskError}</span>
                <button type="button" onClick={onRetryTasks}>
                  Try again
                </button>
              </div>
            ) : tasks.length ? (
              tasks.map((task) => (
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
              <div className="mobile-empty-state">
                <Search size={24} />
                <strong>{hasTaskFilters ? "No matching tasks" : "No tasks yet"}</strong>
                <span>
                  {hasTaskFilters ? "Try changing or clearing your filters." : "Create your first task to get started."}
                </span>
              </div>
            )}
          </div>
          {!taskLoading && !taskError && taskMeta.totalPages > 1 && (
            <nav className="task-pagination" aria-label="Task list pagination">
              <button type="button" disabled={taskMeta.page <= 1} onClick={() => onTaskPageChange?.(taskMeta.page - 1)}>
                Previous
              </button>
              <span>
                Page {taskMeta.page} of {taskMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={taskMeta.page >= taskMeta.totalPages}
                onClick={() => onTaskPageChange?.(taskMeta.page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </section>
  );
}
