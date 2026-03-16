import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  conversation,
  title,
  subtitle,
  showBackButton,
  onBack,
  messages,
  currentUserId,
  typingUsers,
  memberMap,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onReact,
  onEdit,
  onDelete
}) {
  const scrollerRef = useRef(null);
  const previousHeightRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el && !isLoadingMore) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, conversation?._id, isLoadingMore]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !isLoadingMore) {
      return;
    }

    previousHeightRef.current = el.scrollHeight;
  }, [isLoadingMore]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || isLoadingMore || previousHeightRef.current === 0) {
      return;
    }

    const delta = el.scrollHeight - previousHeightRef.current;
    if (delta > 0) {
      el.scrollTop = delta;
    }
    previousHeightRef.current = 0;
  }, [messages, isLoadingMore]);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || !hasMore || isLoadingMore) {
      return;
    }

    if (el.scrollTop < 80) {
      onLoadMore();
    }
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)]">
      <header className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg-sidebar)] px-4 py-3">
        {showBackButton ? (
          <button
            type="button"
            onClick={onBack}
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-lg"
            aria-label="Back to chats"
          >
            ←
          </button>
        ) : null}
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-strong)] text-sm font-bold text-white">
          {(title || "C").slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h2 className="text-base font-bold">{conversation ? title : "Pick a chat"}</h2>
          {conversation ? <p className="text-xs text-[var(--text-subtle)]">{subtitle}</p> : null}
        </div>
      </header>

      <div ref={scrollerRef} onScroll={handleScroll} className="chat-pattern flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-6">
        {hasMore ? (
          <p className="mx-auto w-fit rounded-full bg-black/10 px-3 py-1 text-center text-[11px] text-[var(--text-subtle)]">
            {isLoadingMore ? "Loading older messages..." : "Scroll up for older messages"}
          </p>
        ) : null}
        {messages.length === 0 ? (
          <p className="mx-auto mt-8 w-fit rounded-xl bg-black/10 px-4 py-2 text-sm text-[var(--text-subtle)]">No messages yet. Say hi.</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id || `${message.createdAt}-${message.content}`}
              message={message}
              currentUserId={currentUserId}
              memberMap={memberMap}
              onReact={onReact}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {typingUsers.length ? (
        <p className="border-t border-[var(--line)] bg-[var(--bg-panel)] px-4 py-1.5 text-xs text-emerald-500">{typingUsers.join(", ")} typing...</p>
      ) : null}
    </section>
  );
}
