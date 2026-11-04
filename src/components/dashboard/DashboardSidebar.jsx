import { LayoutDashboard, ListTodo, LogOut, Plus, Target, X } from "lucide-react";
import alteraLogo from "../../assets/altera-logo.jpeg";

export default function DashboardSidebar({
  user,
  activeView,
  totalTasks,
  currentWeekProgress,
  onViewChange,
  onCreateTask,
  onClose,
  onLogout,
}) {
  const selectView = (view) => {
    onViewChange(view);
    onClose();
  };

  return (
    <aside className="dashboard-sidebar" aria-label="Workspace sidebar">
      <div className="dashboard-brand">
        <span>
          <img src={alteraLogo} alt="Altera Institute" />
        </span>
        <div>
          <strong>Altera Tasks</strong>
          <small>Plan. Focus. Finish.</small>
        </div>
        <button className="dashboard-sidebar-close" type="button" onClick={onClose} aria-label="Close sidebar">
          <X size={19} />
        </button>
      </div>

      <button
        className="dashboard-create-button"
        type="button"
        onClick={() => {
          onClose();
          onCreateTask();
        }}
      >
        <Plus size={17} />
        Create new task
      </button>

      <p className="dashboard-nav-label">Workspace</p>
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <button
          className={activeView === "overview" ? "is-active" : ""}
          onClick={() => selectView("overview")}
          type="button"
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>
        <button className={activeView === "tasks" ? "is-active" : ""} onClick={() => selectView("tasks")} type="button">
          <ListTodo size={18} />
          <span>All tasks</span>
          <em>{totalTasks}</em>
        </button>
      </nav>

      <div className="dashboard-sidebar-note">
        <Target size={18} />
        <div>
          <strong>
            {currentWeekProgress.hasTasks ? `${currentWeekProgress.percentage}% complete` : "No tasks this week"}
          </strong>
          <span>{currentWeekProgress.hasTasks ? "Current week progress" : "Create a task to begin"}</span>
        </div>
      </div>

      <div className="dashboard-user-card">
        <span className="dashboard-avatar">{user.name.charAt(0)}</span>
        <div>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
        <button type="button" onClick={onLogout} aria-label="Log out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
