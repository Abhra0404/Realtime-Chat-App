import { Info, ChevronLeft, Search } from "lucide-react";

export default function ChatHeader({ 
  conversation, 
  title, 
  subtitle, 
  showBackButton, 
  onBack, 
  onToggleProfile 
}) {
  if (!conversation) return (
    <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg-sidebar)] px-6 py-4">
      <h2 className="text-sm font-bold text-[var(--text-subtle)] uppercase tracking-widest">Select a conversation</h2>
    </header>
  );

  return (
    <header className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--bg-sidebar)] px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-[var(--accent-strong)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        <div className="relative group cursor-pointer" onClick={onToggleProfile}>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-sm font-bold text-white shadow-md transition group-hover:scale-105">
            {title.slice(0, 1).toUpperCase()}
          </div>
          {conversation?.otherParticipant?.isOnline && (
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-sidebar)] shadow-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0 pointer-events-none md:pointer-events-auto cursor-pointer" onClick={onToggleProfile}>
          <h2 className="text-sm md:text-base font-bold truncate leading-tight">{title}</h2>
          <p className={`text-[11px] font-bold uppercase tracking-tighter ${conversation.otherParticipant?.isOnline ? "text-emerald-500" : "text-[var(--text-subtle)]"}`}>
            {conversation.otherParticipant?.isOnline ? "• Active Now" : subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition text-[var(--text-subtle)]">
          <Search size={18} />
        </button>
        <button 
          onClick={onToggleProfile}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition text-[var(--text-subtle)] hover:text-[var(--text-main)]"
        >
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}
