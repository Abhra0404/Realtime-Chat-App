import { useState } from "react";

export default function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!value.trim() && !selectedFile) {
      return;
    }

    try {
      setIsSending(true);
      await onSend({ content: value.trim(), file: selectedFile });
      setValue("");
      setSelectedFile(null);
      onStopTyping();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="sticky bottom-0 z-20 border-t border-[var(--line)] bg-[var(--bg-sidebar)] px-3 py-3 md:px-4"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {selectedFile ? (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--bg-panel)] px-3 py-2 text-xs">
          <span className="truncate">Attached: {selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded border border-[var(--line)] px-2 py-0.5 text-[var(--text-subtle)]"
          >
            Remove
          </button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <label className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-lg text-[var(--text-subtle)] transition hover:text-[var(--text-main)]">
          +
          <input
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
            }}
          />
        </label>

        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (event.target.value.trim()) {
              onTyping();
            } else {
              onStopTyping();
            }
          }}
          placeholder="Type a message"
          className="w-full rounded-full border border-[var(--line)] bg-[var(--bg-panel)] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-full bg-[var(--accent-strong)] px-5 py-2.5 font-semibold text-white transition hover:brightness-105 disabled:opacity-70"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
