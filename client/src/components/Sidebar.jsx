import { Moon, Sun, LogOut } from "lucide-react";

export default function Sidebar({ user, onLogout, isDark, onToggleTheme }) {
  return (
    <aside className="flex h-full w-full flex-row items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-sidebar)] p-4 md:w-[84px] md:flex-col md:justify-start">
      <div className="flex items-center gap-3 md:flex-col md:gap-2">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--accent-strong)] font-bold text-white">
          {user?.username?.slice(0, 1)?.toUpperCase() || "U"}
        </div>
        <div className="md:hidden">
          <p className="text-sm font-semibold">{user?.username}</p>
          <p className="text-xs text-[var(--text-subtle)]">You</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:mt-auto md:flex-col">
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-full border border-[var(--line)] bg-[var(--bg-panel)] p-2.5 text-[var(--text-subtle)] transition hover:text-[var(--text-main)]"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-[var(--line)] bg-[var(--bg-panel)] p-2.5 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
