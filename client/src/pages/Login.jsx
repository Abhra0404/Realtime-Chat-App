import { useState } from "react";
import { motion } from "framer-motion";

const initialForm = {
  username: "",
  email: "",
  password: ""
};

export default function Login({ onLogin, onRegister }) {
  const [view, setView] = useState("landing");
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

  const openSignIn = () => {
    setIsRegister(false);
    setError("");
    setView("form");
  };

  const openSignUp = () => {
    setIsRegister(true);
    setError("");
    setView("form");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-soft"
      >
        <div className="border-b border-[var(--line)] bg-gradient-to-r from-[var(--accent-strong)]/10 via-[var(--accent)]/10 to-transparent px-6 py-6 md:px-8">
          <span className="inline-flex rounded-full bg-[var(--accent)]/20 px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
            Private messaging, built for speed
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">PulseChat</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--text-subtle)] md:text-base">
            Message instantly, share files, react in real time, and stay synced across devices with a clean WhatsApp-style interface.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {view === "landing" ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--text-subtle)]">Realtime</p>
                  <p className="mt-1 text-sm font-bold">Typing + delivery status</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--text-subtle)]">Sharing</p>
                  <p className="mt-1 text-sm font-bold">Images and files</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2">
                  <p className="text-xs font-semibold text-[var(--text-subtle)]">Secure</p>
                  <p className="mt-1 text-sm font-bold">JWT-based auth</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openSignIn}
                  className="w-full rounded-xl bg-[var(--accent-strong)] px-4 py-3 font-semibold text-white transition hover:brightness-110"
                >
                  Continue with email
                </button>
                <button
                  type="button"
                  onClick={openSignUp}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-4 py-3 font-semibold text-[var(--text-main)] transition hover:bg-[var(--bg-panel)]"
                >
                  Create new account
                </button>
              </div>

              <p className="text-center text-xs text-[var(--text-subtle)]">
                By continuing, you agree to use PulseChat responsibly and keep your credentials secure.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-[var(--text-subtle)]">{isRegister ? "Create your account" : "Sign in to continue"}</p>
              <form className="mt-4 space-y-4" onSubmit={submit}>
                {isRegister ? (
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) => updateField("username", event.target.value)}
                    placeholder="Username"
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                    required
                  />
                ) : null}

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                  required
                />

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-3 outline-none focus:ring-2 focus:ring-[var(--accent)]/35"
                  required
                />

                {error ? <p className="text-sm text-red-500">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[var(--accent-strong)] px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setView("landing");
                    setError("");
                  }}
                  className="underline-offset-2 hover:underline"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister((value) => !value);
                    setError("");
                  }}
                  className="underline-offset-2 hover:underline"
                >
                  {isRegister ? "Have an account? Sign in" : "Need an account? Register"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
