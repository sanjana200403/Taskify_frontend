import { Link, Navigate } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./Welcome.css";

export default function Welcome() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Loading" />;
  if (user) return <Navigate to="/app" replace />;

  return (
    <main className="welcome-page">
      <section className="onboarding-panel" aria-labelledby="welcome-heading">
        <div className="onboarding-visual" aria-hidden="true">
          <span className="onboarding-ring" />
          <span className="onboarding-pattern onboarding-pattern--left" />
          <span className="onboarding-pattern onboarding-pattern--right" />
        </div>

        <div className="onboarding-content">
          <div className="onboarding-copy">
            <h1 id="welcome-heading">Manage What To Do</h1>
            <p>The best way to manage what you have to do, don&apos;t forget your plans.</p>
          </div>
          <Link className="onboarding-cta" to="/login">
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}
