import { motion, AnimatePresence } from "framer-motion";
import { User, Image, Bell, Shield, LogOut } from "lucide-react";

export default function ProfilePanel({ user, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="hidden md:flex flex-col h-full w-[320px] rounded-2xl border border-[var(--line)] bg-[var(--bg-sidebar)] overflow-hidden shadow-2xl"
    >
      <div className="p-6 flex flex-col items-center border-b border-[var(--line)] bg-gradient-to-b from-[var(--bg-app)] to-transparent">
        <div className="relative mb-4">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--accent-strong)] text-3xl font-bold text-white shadow-lg border-4 border-[var(--bg-sidebar)]">
            {user?.username?.slice(0, 1)?.toUpperCase() || "U"}
          </div>
          {user?.isOnline && (
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-[var(--bg-sidebar)] shadow-md"></span>
          )}
        </div>
        <h3 className="text-xl font-bold">{user?.username || "Conversation"}</h3>
        <p className="text-sm text-[var(--text-subtle)] mt-1">
          {user?.isOnline ? "Active now" : "Last seen recently"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3 px-2">Info</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-panel)] transition cursor-pointer">
              <User size={18} className="text-[var(--text-subtle)]" />
              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">Username</p>
                <p className="text-sm font-semibold">@{user?.username?.toLowerCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-panel)] transition cursor-pointer">
              <Bell size={18} className="text-[var(--text-subtle)]" />
              <div>
                <p className="text-xs font-medium text-[var(--text-subtle)]">Notifications</p>
                <p className="text-sm font-semibold">Muted</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3 px-2">Media & Files</h4>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-[var(--bg-panel)] animate-pulse flex items-center justify-center">
                <Image size={20} className="text-[var(--text-subtle)] opacity-40" />
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-xs font-semibold py-2 rounded-lg border border-[var(--line)] hover:bg-[var(--bg-panel)] transition">
            View All
          </button>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3 px-2">Privacy & Support</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-panel)] transition cursor-pointer">
              <Shield size={18} className="text-[var(--text-subtle)]" />
              <p className="text-sm font-semibold">Encryption</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--line)]">
        <button 
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          Close Panel
        </button>
      </div>
    </motion.aside>
  );
}
