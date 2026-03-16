export default function ChannelList({
  conversations,
  users,
  activeConversationId,
  onSelectConversation,
  onStartChat,
  mobileMode = false
}) {

  return (
    <section className="h-full rounded-2xl border border-[var(--line)] bg-[var(--bg-sidebar)] p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">Chats</h2>
        <span className="rounded-full bg-[var(--bg-panel)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-subtle)]">
          {conversations.length}
        </span>
      </div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Recent</p>

      <div className="mb-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {conversations.map((conversation) => {
          const active = conversation._id === activeConversationId;
          const name = conversation.otherParticipant?.username || "Unknown";
          const unreadCount = conversation.unreadCount || 0;
          return (
            <button
              key={conversation._id}
              type="button"
              onClick={() => onSelectConversation(conversation)}
              className={`w-full rounded-xl px-3 py-2 text-left transition ${
                active
                  ? "bg-[var(--bg-panel)] ring-1 ring-[var(--line)]"
                  : "hover:bg-[var(--bg-panel)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-strong)] text-sm font-bold text-white">
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      {conversation.otherParticipant?.isOnline ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      ) : null}
                    </div>
                    {unreadCount ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[#0b141a]">
                        {unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-[var(--text-subtle)]">{conversation.lastMessage || "No messages yet"}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!mobileMode ? (
        <>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">People</p>
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {users.map((chatUser) => (
              <button
                key={chatUser._id}
                type="button"
                onClick={() => onStartChat(chatUser)}
                className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[var(--bg-panel)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#607d8b] text-xs font-bold text-white">
                    {chatUser.username.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{chatUser.username}</p>
                    <p className={`text-xs ${chatUser.isOnline ? "text-emerald-500" : "text-[var(--text-subtle)]"}`}>
                      {chatUser.isOnline ? "online" : "last seen recently"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
