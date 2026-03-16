import { useState, useRef } from "react";
import { Send, Paperclip, Smile, X } from "lucide-react";

export default function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  const submit = async (event) => {
    event.preventDefault();
    if (isSending) return;
    if (!value.trim() && !selectedFile) return;

    const keepInputFocused = () => {
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 80);
    };

    keepInputFocused();

    try {
      setIsSending(true);
      await onSend({ content: value.trim(), file: selectedFile });
      setValue("");
      setSelectedFile(null);
      onStopTyping();
    } finally {
      setIsSending(false);
      keepInputFocused();
    }
  };

  return (
    <div
      className="shrink-0 border-t border-[var(--line)] bg-[var(--bg-sidebar)] p-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between p-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--line)] text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 truncate px-2">
            <Paperclip size={14} className="text-[var(--accent)]" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 transition">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={submit} className="flex gap-2 items-center">
        <div className="flex-1 relative group">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.trim()) onTyping();
              else onStopTyping();
            }}
            placeholder="Type a message..."
            className="w-full bg-[var(--bg-panel)] border border-[var(--line)] rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent)]/30 transition-all outline-none"
          />
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition text-[var(--text-subtle)]">
            <Smile size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-3 rounded-full hover:bg-[var(--bg-panel)] transition text-[var(--text-subtle)] hover:text-[var(--text-main)]">
            <Paperclip size={20} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={isSending || (!value.trim() && !selectedFile)}
            onMouseDown={(event) => event.preventDefault()}
            onPointerDown={(event) => event.preventDefault()}
            onTouchStart={(event) => event.preventDefault()}
            className="p-3.5 rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </form>
    </div>
  );
}

