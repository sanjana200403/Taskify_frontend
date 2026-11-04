import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await register(values);
      navigate("/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with a clearer view of everything ahead."
      alternateText="Already have an account?"
      alternateLabel="Sign in"
      alternateTo="/login"
    >
      <AuthForm mode="register" onSubmit={submit} submitting={submitting} serverError={error} />
    </AuthLayout>
  );
}
