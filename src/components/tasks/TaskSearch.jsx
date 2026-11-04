import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce.js";
import { taskService } from "../../services/taskService.js";

export default function TaskSearch({ onStateChange }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 350);

  useEffect(() => {
    let active = true;
    if (!debounced) {
      onStateChange({ active: false, loading: false, tasks: [], error: "", query: "" });
      return () => {
        active = false;
      };
    }
    onStateChange({ active: true, loading: true, tasks: [], error: "", query: debounced });
    taskService
      .search(debounced, { limit: 100 })
      .then(
        (response) =>
          active && onStateChange({ active: true, loading: false, tasks: response.data, error: "", query: debounced }),
      )
      .catch(
        (error) =>
          active && onStateChange({ active: true, loading: false, tasks: [], error: error.message, query: debounced }),
      );
    return () => {
      active = false;
    };
  }, [debounced, onStateChange]);

  return (
    <label className="relative block">
      <span className="sr-only">Search tasks</span>
      <Search className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={17} />
      <input
        className="field h-11 pl-11 pr-11"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for a task"
      />
      {query && (
        <button
          className="icon-button absolute right-2 top-1.5 h-8 w-8"
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </label>
  );
}
