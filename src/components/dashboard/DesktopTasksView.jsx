import { ChevronLeft, ChevronRight, ListTodo, Search, SlidersHorizontal } from "lucide-react";
import TaskList from "../tasks/TaskList.jsx";

export default function DesktopTasksView({
  filters,
  hasFilters,
  taskMeta,
  taskListProps,
  onFilterChange,
  onClearFilters,
  onPageChange,
}) {
  return (
    <>
      <section className="dashboard-page-heading task-page-heading">
        <div>
          <p>
            <ListTodo size={13} />
            Task management
          </p>
          <h1>All tasks</h1>
          <span>Search, filter, update, and organize every task in one place.</span>
        </div>
      </section>

      <section className="dashboard-card filters-card">
        <div className="filters-title">
          <SlidersHorizontal size={16} />
          <div>
            <strong>Filters</strong>
            <span>Narrow down your task list</span>
          </div>
          {hasFilters && (
            <button type="button" onClick={onClearFilters}>
              Clear all
            </button>
          )}
        </div>
        <div className="task-filters">
          <label className="task-search">
            <span className="sr-only">Search tasks</span>
            <Search size={18} />
            <input
              value={filters.q}
              onChange={(event) => onFilterChange("q", event.target.value)}
              placeholder="Search title or description"
            />
          </label>
          <label>
            <span>Status</span>
            <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value)}>
              <option value="">All statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={filters.priority} onChange={(event) => onFilterChange("priority", event.target.value)}>
              <option value="">All priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label>
            <span>Time range</span>
            <select value={filters.time} onChange={(event) => onFilterChange("time", event.target.value)}>
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={filters.sort} onChange={(event) => onFilterChange("sort", event.target.value)}>
              <option value="dueAsc">Due date: earliest</option>
              <option value="dueDesc">Due date: latest</option>
              <option value="newest">Recently created</option>
            </select>
          </label>
        </div>
      </section>

      <section className="dashboard-card all-tasks-card">
        <div className="all-tasks-heading">
          <div>
            <span>{taskMeta.total} results</span>
            <h2>Your tasks</h2>
          </div>
          <p>Click the status control to move a task from Pending to In Progress to Completed.</p>
        </div>
        <TaskList {...taskListProps} />
        {taskMeta.totalPages > 1 && (
          <div className="pagination">
            <button type="button" disabled={taskMeta.page <= 1} onClick={() => onPageChange(taskMeta.page - 1)}>
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              Page {taskMeta.page} of {taskMeta.totalPages}
            </span>
            <button
              type="button"
              disabled={taskMeta.page >= taskMeta.totalPages}
              onClick={() => onPageChange(taskMeta.page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
