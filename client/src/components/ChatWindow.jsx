import { useEffect, useRef } from "react";
import { Info } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";

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
  onDelete,
  onToggleProfile
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
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] shadow-sm">
      <ChatHeader 
        conversation={conversation}
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onBack={onBack}
        onToggleProfile={onToggleProfile}
      />

      <div ref={scrollerRef} onScroll={handleScroll} className="chat-pattern flex-1 space-y-3 overflow-y-auto px-4 py-6">
        {hasMore ? (
          <div className="flex justify-center mb-4">
            <button 
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-4 py-1.5 rounded-full bg-[var(--bg-sidebar)] border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] hover:text-[var(--text-main)] transition"
            >
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        ) : null}
        
        {!conversation ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <div className="h-20 w-20 rounded-full bg-[var(--bg-sidebar)] grid place-items-center shadow-inner">
              <Info size={40} className="text-[var(--text-subtle)]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text-main)]">PulseChat</p>
              <p className="text-sm font-medium">Select a conversation to start messaging.<br/>Your messages are private and secure.</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
            <div className="h-16 w-16 rounded-full bg-[var(--bg-sidebar)] grid place-items-center">
              <Info size={32} className="text-[var(--text-subtle)]" />
            </div>
            <p className="text-sm font-medium">No messages here yet.<br/>Start the conversation!</p>
          </div>
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
        <div className="px-6 py-2 bg-[var(--bg-app)]/30 backdrop-blur-md border-t border-[var(--line)]">
          <p className="text-[11px] font-bold text-emerald-500 animate-pulse">
            {typingUsers.join(", ")} is typing...
          </p>
        </div>
      ) : null}
    </section>
  );
}


