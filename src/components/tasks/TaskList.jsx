import Button from "../common/Button.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Loader from "../common/Loader.jsx";
import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, loading, error, onRetry, onAdd, onToggle, onEdit, onDelete, busyTaskId }) {
  if (loading) return <Loader label="Loading tasks" />;
  if (error) {
    return (
      <EmptyState
        title="Tasks could not load"
        message={error}
        action={
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }
  if (!tasks.length) {
    return (
      <EmptyState
        action={
          onAdd ? (
            <Button variant="secondary" onClick={onAdd}>
              Add a task
            </Button>
          ) : null
        }
      />
    );
  }
  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          busy={busyTaskId === task._id}
        />
      ))}
    </div>
  );
}
