import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldCheck, Zap, ArrowRight, Mail, Lock, User as UserIcon, Globe, CheckCircle2 } from "lucide-react";

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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setIsSubmitting(true);
      if (isRegister) await onRegister(form);
      else await onLogin({ email: form.email, password: form.password });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-outfit transition-colors duration-500">
      {/* Immersive Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--accent)]/15 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-strong)]/15 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl grid lg:grid-cols-2 rounded-[2rem] overflow-hidden shadow-[0_32px_120px_rgba(0,0,0,0.4)] border border-[var(--line)] bg-white/40 dark:bg-black/20 backdrop-blur-3xl"
      >
        {/* Visual Narrative Section */}
        <div className="relative p-10 lg:p-12 bg-gradient-to-br from-[var(--accent-strong)] via-[var(--accent-strong)] to-[var(--accent)] text-white flex flex-col justify-between overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none chat-pattern" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="h-12 w-12 bg-white rounded-xl grid place-items-center text-[var(--accent-strong)] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <MessageSquare size={26} fill="currentColor" strokeWidth={1} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">Pulse</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              Connect at the <br/>
              <span className="text-white/40">Speed</span> of Life.
            </motion.h1>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid gap-6 mt-10"
            >
              <div className="flex gap-4 group items-center">
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md grid place-items-center shrink-0 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Privacy Sovereign</h4>
                  <p className="text-white/60 text-xs leading-relaxed max-w-[240px]">Your conversations belong to you. We handle the rest with elite security.</p>
                </div>
              </div>
              <div className="flex gap-4 group items-center">
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md grid place-items-center shrink-0 border border-white/10 group-hover:bg-white/20 transition-all duration-300">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Blazing Fast</h4>
                  <p className="text-white/60 text-xs leading-relaxed max-w-[240px]">Instant delivery across every device. No delay, no compromise.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="relative z-10 pt-8 border-t border-white/10 mt-12 flex items-center justify-between"
          >
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-9 w-9 rounded-full border border-[var(--accent-strong)] bg-emerald-900/40 backdrop-blur-sm grid place-items-center text-[10px] font-bold">U{i}</div>
              ))}
              <div className="h-9 w-9 rounded-full border border-[var(--accent-strong)] bg-white text-[var(--accent-strong)] grid place-items-center text-[10px] font-bold shadow-lg">+2k</div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Trusted by Experts</p>
          </motion.div>

          {/* Abstract light beam */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
        </div>

        {/* Action Panel Section */}
        <div className="p-10 lg:p-12 flex flex-col justify-center relative bg-white/80 dark:bg-[#0b141a]/95 backdrop-blur-3xl">
          <AnimatePresence mode="wait">
            {view === "landing" ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-sm mx-auto w-full"
              >
                <div className="mb-8 text-center lg:text-left">
                  <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-3 tracking-tighter">Enter the Pulse.</h2>
                  <p className="text-[var(--text-subtle)] text-base leading-relaxed">Experience a communication suite designed for the modern era.</p>
                </div>

                <div className="grid gap-3">
                  <button onClick={() => setView("form")} className="btn-primary h-14 text-base group shadow-xl">
                    Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                  </button>
                  <button 
                    onClick={() => { setIsRegister(true); setView("form"); }}
                    className="h-14 rounded-xl border-2 border-[var(--line)] font-bold text-[var(--text-main)] hover:bg-[var(--bg-panel-strong)] hover:border-[var(--accent)]/30 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    Create Account
                  </button>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-[var(--text-subtle)]/80">
                    <CheckCircle2 size={16} className="text-[var(--accent)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-subtle)]/80">
                    <Globe size={16} className="text-[var(--accent)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Global</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="max-w-sm mx-auto w-full"
              >
                <button 
                  onClick={() => setView("landing")} 
                  className="mb-8 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)] hover:text-[var(--accent-strong)] transition-all flex items-center gap-2"
                >
                  <ArrowRight size={12} className="rotate-180" /> Back
                </button>

                <div className="mb-8">
                  <h2 className="text-3xl font-black text-[var(--text-main)] mb-1 tracking-tighter">
                    {isRegister ? "Join Us." : "Welcome."}
                  </h2>
                  <p className="text-[var(--text-subtle)] text-sm font-medium">Your global communication starts here.</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                  {isRegister && (
                    <div className="relative group">
                      <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] group-focus-within:text-[var(--accent)] transition-colors" />
                      <input
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => updateField("username", e.target.value)}
                        className="w-full bg-[var(--bg-panel-strong)] dark:bg-black/20 border-2 border-transparent focus:border-[var(--accent)]/40 rounded-xl py-4 pl-12 pr-4 transition-all outline-none text-sm placeholder:text-[var(--text-subtle)]/60 font-medium"
                        required
                      />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full bg-[var(--bg-panel-strong)] dark:bg-black/20 border-2 border-transparent focus:border-[var(--accent)]/40 rounded-xl py-4 pl-12 pr-4 transition-all outline-none text-sm placeholder:text-[var(--text-subtle)]/60 font-medium"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] group-focus-within:text-[var(--accent)] transition-colors" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="w-full bg-[var(--bg-panel-strong)] dark:bg-black/20 border-2 border-transparent focus:border-[var(--accent)]/40 rounded-xl py-4 pl-12 pr-4 transition-all outline-none text-sm placeholder:text-[var(--text-subtle)]/60 font-medium"
                      required
                    />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full btn-primary h-14 mt-4 shadow-2xl text-sm"
                  >
                    {isSubmitting ? "Authenticating..." : isRegister ? "Create Free Account" : "Secure Sign In"}
                  </button>
                </form>

                <p className="mt-8 text-center text-xs font-medium text-[var(--text-subtle)]">
                  {isRegister ? "Already a pulse user?" : "New to the platform?"}{" "}
                  <button 
                    onClick={() => { setIsRegister(!isRegister); setError(""); }}
                    className="text-[var(--accent-strong)] font-black hover:underline underline-offset-4 ml-1"
                  >
                    {isRegister ? "Log in" : "Sign up"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer minimal info */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-subtle)]/30 pointer-events-none">
        <span>Privacy</span>
        <div className="h-1.5 w-1.5 bg-current rounded-full" />
        <span>Nodes</span>
        <div className="h-1.5 w-1.5 bg-current rounded-full" />
        <span>Secure</span>
      </div>
    </div>
  );
}



