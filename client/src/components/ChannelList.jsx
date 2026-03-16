import { Search, Settings, MoreVertical, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";

export default function ChannelList({
  conversations,
  users,
  activeConversationId,
  onSelectConversation,
  onStartChat,
  mobileMode = false,
  currentUser,
  onLogout,
  isDark,
  onToggleTheme
}) {
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter(c => 
    (c.otherParticipant?.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) && 
    u._id !== currentUser?._id
  );

  return (
    <section className="flex flex-col h-full rounded-2xl border border-[var(--line)] bg-[var(--bg-sidebar)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--line)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tight">PulseChat</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-[var(--bg-panel)] transition">
              <Settings size={18} className="text-[var(--text-subtle)]" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-panel)] border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent)] transition-all outline-none"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Recent Chats</h2>
            <span className="bg-[var(--accent-strong)] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {conversations.length}
            </span>
          </div>
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const active = conversation._id === activeConversationId;
              const name = conversation.otherParticipant?.username || "Unknown";
              const unreadCount = conversation.unreadCount || 0;
              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                    active ? "bg-[var(--bg-panel)] shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-sm font-bold text-white shadow-md">
                      {name.slice(0, 1).toUpperCase()}
                    </span>
                    {conversation.otherParticipant?.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-sidebar)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold truncate ${active ? "text-[var(--text-main)]" : "text-[var(--text-subtle)]"}`}>
                        {name}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-[var(--accent)] text-white text-[10px] font-bold h-5 w-5 grid place-items-center rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-subtle)] truncate mt-0.5">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {!mobileMode && filteredUsers.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] px-2 mb-2">Available Users</h2>
            <div className="space-y-1">
              {filteredUsers.map((chatUser) => (
                <button
                  key={chatUser._id}
                  onClick={() => onStartChat(chatUser)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-400 text-xs font-bold text-white">
                    {chatUser.username.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{chatUser.username}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-tighter ${chatUser.isOnline ? "text-emerald-500" : "text-[var(--text-subtle)]"}`}>
                      {chatUser.isOnline ? "• Online" : "• Offline"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Profile */}
      <div
        className="border-t border-[var(--line)] bg-[var(--bg-app)]/50 p-4 backdrop-blur-sm"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--accent-strong)] grid place-items-center text-white font-bold shadow-md">
            {currentUser?.username?.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{currentUser?.username}</p>
            <p className="text-[10px] text-[var(--text-subtle)] font-medium">My Profile</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={onToggleTheme}
              className="p-2 rounded-full hover:bg-[var(--bg-panel)] transition text-[var(--text-subtle)] hover:text-[var(--text-main)]"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-red-500/10 transition text-red-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

