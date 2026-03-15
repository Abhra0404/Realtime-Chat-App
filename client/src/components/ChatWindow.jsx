import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  room,
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
  }, [messages, room?._id, isLoadingMore]);

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
    <section className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-4 backdrop-blur">
      <header className="mb-4 border-b border-[var(--line)] pb-3">
        <h2 className="text-xl font-bold">{room ? `# ${room.name}` : "Pick a room"}</h2>
      </header>

      <div ref={scrollerRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {hasMore ? (
          <p className="text-center text-xs text-[var(--text-subtle)]">
            {isLoadingMore ? "Loading older messages..." : "Scroll up for older messages"}
          </p>
        ) : null}
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--text-subtle)]">No messages yet. Start the conversation.</p>
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
        <p className="mt-2 text-xs text-[var(--text-subtle)]">{typingUsers.join(", ")} typing...</p>
      ) : null}
    </section>
  );
}
