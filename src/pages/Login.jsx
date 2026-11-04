import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await login(values);
      navigate(location.state?.from || "/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue with your week."
      alternateText="New here?"
      alternateLabel="Create an account"
      alternateTo="/register"
    >
      <AuthForm mode="login" onSubmit={submit} submitting={submitting} serverError={error} />
    </AuthLayout>
  );
}
