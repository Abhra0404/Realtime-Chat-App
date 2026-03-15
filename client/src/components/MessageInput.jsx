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
    <form onSubmit={submit} className="rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-3">
      {selectedFile ? (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2 text-xs">
          <span className="truncate">Attached: {selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded border border-[var(--line)] px-2 py-0.5"
          >
            Remove
          </button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <label className="cursor-pointer rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2 text-sm">
          + File
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
          placeholder="Type your message..."
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-2 outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-slate-950 disabled:opacity-70"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
