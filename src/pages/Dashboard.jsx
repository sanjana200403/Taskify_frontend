import { AlertTriangle, CheckCircle2, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import DashboardSidebar from "../components/dashboard/DashboardSidebar.jsx";
import DesktopOverview from "../components/dashboard/DesktopOverview.jsx";
import DesktopTasksView from "../components/dashboard/DesktopTasksView.jsx";
import MobileTaskApp from "../components/mobile/MobileTaskApp.jsx";
import TaskDetailsModal from "../components/tasks/TaskDetailsModal.jsx";
import TaskModal from "../components/tasks/TaskModal.jsx";
import alteraLogo from "../assets/altera-logo.jpeg";
import { useAuth } from "../context/AuthContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { taskService } from "../services/taskService.js";
import { toLocalDateKey, weekQuery } from "../utils/date.js";
import {
  getCompletionToggleStatus,
  updateAnalyticsStatus,
  updateTaskStatus,
  updateWeeklySummaryStatus,
} from "../utils/taskStatus.js";
import "./Dashboard.css";

const emptyAnalytics = {
  total: 0,
  status: { pending: 0, inProgress: 0, completed: 0 },
  priority: { low: 0, medium: 0, high: 0 },
  completionRate: 0,
  overdue: 0,
  dueSoon: 0,
  activity: [],
  upcoming: [],
};

const initialFilters = {
  q: "",
  status: "",
  priority: "",
  time: "all",
  sort: "activeNewest",
  page: 1,
};

function getTimeFilter(value) {
  if (value === "all") return {};
  const now = new Date();
  let from = new Date(now);
  let to = new Date(now);

  if (value === "today") {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
  } else if (value === "week") {
    const day = (now.getDay() + 6) % 7;
    from.setDate(now.getDate() - day);
    from.setHours(0, 0, 0, 0);
    to = new Date(from);
    to.setDate(from.getDate() + 6);
    to.setHours(23, 59, 59, 999);
  } else if (value === "month") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
    to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

function getWeekStartKey(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  date.setHours(0, 0, 0, 0);
  return toLocalDateKey(date);
}

function getWeekFilter(weekStart) {
  const from = new Date(`${weekStart}T00:00:00`);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  const [range, setRange] = useState("week");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [overviewTasks, setOverviewTasks] = useState([]);
  const [overviewTasksLoading, setOverviewTasksLoading] = useState(true);
  const [overviewTasksError, setOverviewTasksError] = useState("");
  const [tasksMeta, setTasksMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [modal, setModal] = useState({ open: false, task: null, defaultDate: null });
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [overviewWeekStart, setOverviewWeekStart] = useState(() => getWeekStartKey());
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [notice, setNotice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [weeklyError, setWeeklyError] = useState("");
  const [expandedWeek, setExpandedWeek] = useState("");
  const [expandedWeekTasks, setExpandedWeekTasks] = useState([]);
  const [expandedWeekLoading, setExpandedWeekLoading] = useState(false);
  const [expandedWeekError, setExpandedWeekError] = useState("");
  const weekRequestId = useRef(0);
  const weekLoadingRequestId = useRef(0);
  const overviewRequestId = useRef(0);
  const overviewLoadingRequestId = useRef(0);
  const taskRequestId = useRef(0);
  const taskLoadingRequestId = useRef(0);
  const analyticsRequestId = useRef(0);
  const analyticsLoadingRequestId = useRef(0);
  const weeklyRequestId = useRef(0);
  const weeklyLoadingRequestId = useRef(0);
  const debouncedQuery = useDebounce(filters.q, 300);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const mobileViewport = window.matchMedia("(max-width: 1023px)");
    if (!mobileViewport.matches) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const handleViewportChange = (event) => {
      if (!event.matches) setSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    mobileViewport.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      mobileViewport.removeEventListener("change", handleViewportChange);
    };
  }, [sidebarOpen]);

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()),
    [],
  );
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const loadAnalytics = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++analyticsRequestId.current;
      if (!silent) {
        analyticsLoadingRequestId.current = requestId;
        setAnalyticsLoading(true);
        setAnalyticsError("");
      }
      try {
        const response = await taskService.analytics(range);
        if (analyticsRequestId.current === requestId) setAnalytics(response.data);
      } catch (error) {
        if (!silent && analyticsRequestId.current === requestId) setAnalyticsError(error.message);
      } finally {
        if (analyticsLoadingRequestId.current === requestId) setAnalyticsLoading(false);
      }
    },
    [range],
  );

  const loadTasks = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++taskRequestId.current;
      if (!silent) {
        taskLoadingRequestId.current = requestId;
        setTasksLoading(true);
        setTasksError("");
      }
      try {
        const response = await taskService.list({
          page: filters.page,
          limit: 10,
          q: debouncedQuery || undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          sort: filters.sort,
          ...getTimeFilter(filters.time),
        });
        if (taskRequestId.current === requestId) {
          setTasks(response.data);
          setTasksMeta(response.meta);
        }
      } catch (error) {
        if (!silent && taskRequestId.current === requestId) setTasksError(error.message);
      } finally {
        if (taskLoadingRequestId.current === requestId) setTasksLoading(false);
      }
    },
    [debouncedQuery, filters.page, filters.priority, filters.sort, filters.status, filters.time],
  );

  const loadOverviewTasks = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++overviewRequestId.current;
      if (!silent) {
        overviewLoadingRequestId.current = requestId;
        setOverviewTasksLoading(true);
        setOverviewTasksError("");
      }
      try {
        const response = await taskService.list({
          page: 1,
          limit: 100,
          sort: "activeNewest",
          ...getWeekFilter(overviewWeekStart),
        });
        if (overviewRequestId.current === requestId) setOverviewTasks(response.data);
      } catch (error) {
        if (!silent && overviewRequestId.current === requestId) setOverviewTasksError(error.message);
      } finally {
        if (overviewLoadingRequestId.current === requestId) setOverviewTasksLoading(false);
      }
    },
    [overviewWeekStart],
  );

  const loadWeeklySummaries = useCallback(async ({ silent = false } = {}) => {
    const requestId = ++weeklyRequestId.current;
    if (!silent) {
      weeklyLoadingRequestId.current = requestId;
      setWeeklyLoading(true);
      setWeeklyError("");
    }
    try {
      const response = await taskService.weeklySummary();
      if (weeklyRequestId.current === requestId) {
        setWeeklySummaries([...(response.data || [])].sort((a, b) => b.weekStart.localeCompare(a.weekStart)));
      }
    } catch (error) {
      if (!silent && weeklyRequestId.current === requestId) setWeeklyError(error.message);
    } finally {
      if (weeklyLoadingRequestId.current === requestId) setWeeklyLoading(false);
    }
  }, []);

  const loadExpandedWeekTasks = useCallback(async (summary, { silent = false } = {}) => {
    if (!summary) return;
    const requestId = ++weekRequestId.current;
    if (!silent) {
      weekLoadingRequestId.current = requestId;
      setExpandedWeekLoading(true);
      setExpandedWeekError("");
    }
    try {
      const query = weekQuery(summary);
      const response = await taskService.list({ page: 1, sort: "activeNewest", ...query });
      const remainingPages = Array.from(
        { length: Math.max((response.meta?.totalPages || 1) - 1, 0) },
        (_, index) => index + 2,
      );
      const remainingResponses = await Promise.all(
        remainingPages.map((page) => taskService.list({ page, sort: "activeNewest", ...query })),
      );
      const allTasks = [response, ...remainingResponses].flatMap((page) => page.data);
      if (weekRequestId.current === requestId) setExpandedWeekTasks(allTasks);
    } catch (error) {
      if (!silent && weekRequestId.current === requestId) setExpandedWeekError(error.message);
    } finally {
      if (weekLoadingRequestId.current === requestId) setExpandedWeekLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  useEffect(() => {
    loadOverviewTasks();
  }, [loadOverviewTasks]);
  useEffect(() => {
    loadWeeklySummaries();
  }, [loadWeeklySummaries]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const refreshData = async ({ silent = false } = {}) => {
    const expandedSummary = weeklySummaries.find((summary) => summary.weekStart === expandedWeek);
    return Promise.all([
      loadAnalytics({ silent }),
      loadTasks({ silent }),
      loadOverviewTasks({ silent }),
      loadWeeklySummaries({ silent }),
      expandedSummary ? loadExpandedWeekTasks(expandedSummary, { silent }) : Promise.resolve(),
    ]);
  };

  const toggleWeek = (summary) => {
    if (expandedWeek === summary.weekStart) {
      weekRequestId.current += 1;
      setExpandedWeek("");
      setExpandedWeekTasks([]);
      setExpandedWeekError("");
      setExpandedWeekLoading(false);
      return;
    }
    setExpandedWeek(summary.weekStart);
    setExpandedWeekTasks([]);
    loadExpandedWeekTasks(summary);
  };

  const retryExpandedWeek = () => {
    const summary = weeklySummaries.find((item) => item.weekStart === expandedWeek);
    if (summary) loadExpandedWeekTasks(summary);
  };

  const saveTask = async (payload) => {
    setSaving(true);
    try {
      if (modal.task) await taskService.update(modal.task._id, payload);
      else await taskService.create(payload);
      setNotice({
        message: modal.task ? "Your task was updated successfully." : "Your new task was created successfully.",
        tone: "success",
      });
      setModal({ open: false, task: null, defaultDate: null });
      await refreshData();
    } catch (error) {
      setNotice({ message: error.message, tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const changeTaskStatus = async (task, nextStatus) => {
    const previousStatus = task.status;
    if (previousStatus === nextStatus) return;

    setTasks((current) => updateTaskStatus(current, task._id, nextStatus));
    setOverviewTasks((current) => updateTaskStatus(current, task._id, nextStatus));
    setExpandedWeekTasks((current) => updateTaskStatus(current, task._id, nextStatus));
    setAnalytics((current) => updateAnalyticsStatus(current, task, previousStatus, nextStatus));
    setWeeklySummaries((current) => updateWeeklySummaryStatus(current, task, previousStatus, nextStatus));
    setBusyTaskId(task._id);

    try {
      await taskService.update(task._id, { status: nextStatus });
      const statusMessage =
        nextStatus === "Completed"
          ? "Task marked as completed."
          : nextStatus === "In Progress"
            ? "Task marked as in progress."
            : "Task moved to pending.";
      setNotice({ message: statusMessage, tone: "success" });
      void refreshData({ silent: true });
    } catch (error) {
      setTasks((current) => updateTaskStatus(current, task._id, previousStatus));
      setOverviewTasks((current) => updateTaskStatus(current, task._id, previousStatus));
      setExpandedWeekTasks((current) => updateTaskStatus(current, task._id, previousStatus));
      setAnalytics((current) => updateAnalyticsStatus(current, task, nextStatus, previousStatus));
      setWeeklySummaries((current) => updateWeeklySummaryStatus(current, task, nextStatus, previousStatus));
      setNotice({ message: error.message, tone: "error" });
    } finally {
      setBusyTaskId("");
    }
  };

  const toggleTask = (task) => changeTaskStatus(task, getCompletionToggleStatus(task.status));

  const deleteTask = async () => {
    if (!deleteTarget) return;
    setBusyTaskId(deleteTarget._id);
    try {
      await taskService.remove(deleteTarget._id);
      setDeleteTarget(null);
      setNotice({ message: "The task was deleted successfully.", tone: "success" });
      await refreshData();
    } catch (error) {
      setNotice({ message: error.message, tone: "error" });
    } finally {
      setBusyTaskId("");
    }
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: name === "page" ? value : 1 }));
  };

  const openNewTask = (date) => {
    setModal({ open: true, task: null, defaultDate: typeof date === "string" ? date : selectedDate });
  };

  const openTask = (task) => {
    setViewTarget(null);
    setModal({ open: true, task, defaultDate: null });
  };

  const closeTaskModal = () => {
    setModal({ open: false, task: null, defaultDate: null });
  };

  const taskListProps = {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    onRetry: loadTasks,
    onAdd: () => openNewTask(),
    onToggle: toggleTask,
    onEdit: openTask,
    onDelete: setDeleteTarget,
    busyTaskId,
  };

  const hasFilters =
    filters.q || filters.status || filters.priority || filters.time !== "all" || filters.sort !== "activeNewest";
  const visibleWeekAnalytics = useMemo(() => {
    const status = overviewTasks.reduce(
      (counts, task) => {
        if (task.status === "Completed") counts.completed += 1;
        else if (task.status === "In Progress") counts.inProgress += 1;
        else counts.pending += 1;
        return counts;
      },
      { pending: 0, inProgress: 0, completed: 0 },
    );
    const total = overviewTasks.length;

    return {
      ...analytics,
      total,
      status,
      completionRate: total ? Math.round((status.completed / total) * 100) : 0,
    };
  }, [analytics, overviewTasks]);
  const currentWeekProgress = useMemo(() => {
    const currentWeek = weeklySummaries.find((summary) => summary.weekStart === getWeekStartKey());
    if (!currentWeek?.totalTasks) return { hasTasks: false, percentage: 0 };
    return {
      hasTasks: true,
      percentage: Math.round((currentWeek.completedTasks / currentWeek.totalTasks) * 100),
    };
  }, [weeklySummaries]);

  const changeOverviewWeek = (weekStart, nextSelectedDate) => {
    setOverviewWeekStart(weekStart);
    setSelectedDate(nextSelectedDate || weekStart);
  };

  return (
    <main className={`dashboard-page ${sidebarOpen ? "is-mobile-sidebar-open" : ""}`}>
      <MobileTaskApp
        view={activeView}
        onViewChange={setActiveView}
        analytics={activeView === "overview" ? visibleWeekAnalytics : analytics}
        analyticsLoading={activeView === "overview" ? overviewTasksLoading : analyticsLoading}
        tasks={activeView === "overview" ? overviewTasks : tasks}
        query={filters.q}
        onQueryChange={(value) => updateFilter("q", value)}
        onAdd={openNewTask}
        onToggle={toggleTask}
        onStatusChange={changeTaskStatus}
        onView={setViewTarget}
        onEdit={openTask}
        onDelete={setDeleteTarget}
        busyTaskId={busyTaskId}
        onMenu={() => setSidebarOpen(true)}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        visibleWeekStart={overviewWeekStart}
        onVisibleWeekChange={changeOverviewWeek}
        statusFilter={filters.status}
        priorityFilter={filters.priority}
        onStatusFilterChange={(value) => updateFilter("status", value)}
        onPriorityFilterChange={(value) => updateFilter("priority", value)}
        onClearTaskFilters={() => setFilters((current) => ({ ...current, q: "", status: "", priority: "", page: 1 }))}
        taskMeta={tasksMeta}
        taskLoading={tasksLoading}
        taskError={tasksError}
        onRetryTasks={loadTasks}
        onTaskPageChange={(page) => updateFilter("page", page)}
        overviewTaskLoading={overviewTasksLoading}
        overviewTaskError={overviewTasksError}
        onRetryOverviewTasks={loadOverviewTasks}
        weeklySummaries={weeklySummaries}
        weeklyLoading={weeklyLoading}
        weeklyError={weeklyError}
        expandedWeek={expandedWeek}
        expandedWeekTasks={expandedWeekTasks}
        expandedWeekLoading={expandedWeekLoading}
        expandedWeekError={expandedWeekError}
        onToggleWeek={toggleWeek}
        onRetryWeeks={loadWeeklySummaries}
        onRetryExpandedWeek={retryExpandedWeek}
      />
      <button
        type="button"
        className="mobile-sidebar-backdrop"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
        aria-hidden={!sidebarOpen}
        tabIndex={sidebarOpen ? 0 : -1}
        disabled={!sidebarOpen}
      />
      <DashboardSidebar
        user={user}
        activeView={activeView}
        totalTasks={tasksMeta.total}
        currentWeekProgress={currentWeekProgress}
        onViewChange={setActiveView}
        onCreateTask={openNewTask}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-mobile-brand">
            <span>
              <img src={alteraLogo} alt="Altera Institute" />
            </span>
            <strong>Altera</strong>
          </div>
          <div className="dashboard-breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{activeView === "overview" ? "Overview" : "All tasks"}</strong>
          </div>
          <div className="dashboard-header-actions">
            <button className="dashboard-new-task" type="button" onClick={() => openNewTask()}>
              <Plus size={17} />
              New task
            </button>
            <span className="dashboard-header-avatar">{user.name.charAt(0)}</span>
          </div>
        </header>

        <nav className="dashboard-mobile-tabs" aria-label="Mobile dashboard navigation">
          <button
            className={activeView === "overview" ? "is-active" : ""}
            onClick={() => setActiveView("overview")}
            type="button"
          >
            Overview
          </button>
          <button
            className={activeView === "tasks" ? "is-active" : ""}
            onClick={() => setActiveView("tasks")}
            type="button"
          >
            All tasks
          </button>
        </nav>

        <div className="dashboard-content">
          {activeView === "overview" ? (
            <DesktopOverview
              analytics={analytics}
              loading={analyticsLoading}
              error={analyticsError}
              range={range}
              todayLabel={todayLabel}
              greeting={greeting}
              firstName={user.name.split(" ")[0]}
              onRangeChange={setRange}
              onRetry={loadAnalytics}
              onOpenTask={openTask}
              onCreateTask={openNewTask}
              onViewAll={() => setActiveView("tasks")}
            />
          ) : (
            <DesktopTasksView
              filters={filters}
              hasFilters={hasFilters}
              taskMeta={tasksMeta}
              taskListProps={taskListProps}
              onFilterChange={updateFilter}
              onClearFilters={() => setFilters(initialFilters)}
              onPageChange={(page) => updateFilter("page", page)}
            />
          )}
        </div>
      </div>

      {notice && (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          aria-atomic="true"
          className={`dashboard-toast dashboard-toast--${notice.tone}`}
        >
          <span className="dashboard-toast__icon" aria-hidden="true">
            {notice.tone === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          </span>
          <div className="dashboard-toast__copy">
            <strong>{notice.tone === "error" ? "Action failed" : "Success"}</strong>
            <span>{notice.message}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}
      <TaskDetailsModal task={viewTarget} onClose={() => setViewTarget(null)} onEdit={openTask} />
      <TaskModal
        open={modal.open}
        task={modal.task}
        defaultDate={modal.defaultDate}
        submitting={saving}
        onClose={closeTaskModal}
        onSubmit={saveTask}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this task?"
        message={`"${deleteTarget?.title || "This task"}" will be permanently removed.`}
        confirming={Boolean(busyTaskId)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteTask}
      />
    </main>
  );
}
