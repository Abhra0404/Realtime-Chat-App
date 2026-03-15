import { useState } from "react";
import { motion } from "framer-motion";

const initialForm = {
  username: "",
  email: "",
  password: ""
};

export default function Login({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);
      if (isRegister) {
        await onRegister(form);
      } else {
        await onLogin({ email: form.email, password: form.password });
      }
      setForm(initialForm);
    } catch (requestError) {
      const backendMessage = requestError?.response?.data?.message;
      const networkMessage = requestError?.message;
      setError(backendMessage || networkMessage || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--bg-panel)] p-8 shadow-soft backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold tracking-tight">PulseChat</h1>
        <p className="mt-2 text-sm text-[var(--text-subtle)]">
          Fast rooms, live typing, and startup-grade UI.
        </p>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          {isRegister ? (
            <input
              type="text"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none ring-[var(--accent)] focus:ring"
              required
            />
          ) : null}

          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none ring-[var(--accent)] focus:ring"
            required
          />

          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none ring-[var(--accent)] focus:ring"
            required
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-slate-950 transition hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister((value) => !value);
            setError("");
          }}
          className="mt-4 text-sm text-[var(--text-subtle)] underline"
        >
          {isRegister ? "Have an account? Sign in" : "Need an account? Register"}
        </button>
      </motion.div>
    </div>
  );
}
