import { useEffect, useMemo, useState } from "react";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮"];

const getSenderId = (sender) => {
  if (!sender) {
    return "";
  }
  if (typeof sender === "string") {
    return sender;
  }
  return sender._id || sender.id || "";
};

const getMediaUrl = (fileUrl) => {
  if (!fileUrl) {
    return "";
  }
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }
  const socketBase = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  return `${socketBase}${fileUrl}`;
};

export default function MessageBubble({ message, currentUserId, memberMap, onReact, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(message.content || "");
    }
  }, [message.content, isEditing]);

  const mine = getSenderId(message.senderId) === currentUserId;
  const senderLabel = mine ? "You" : message.senderId?.username || "User";
  const mediaUrl = getMediaUrl(message.fileUrl);

  const reactionSummary = useMemo(() => {
    const counts = {};
    (message.reactions || []).forEach((reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });

    return Object.entries(counts);
  }, [message.reactions]);

  const seenByMembers = useMemo(() => {
    const unique = [];
    const seen = new Set();

    (message.readBy || []).forEach((reader) => {
      const id = getSenderId(reader);
      if (!id || id === currentUserId || seen.has(id)) {
        return;
      }
      seen.add(id);
      unique.push(memberMap?.get(id) || { _id: id, username: "User", avatar: "" });
    });

    return unique;
  }, [message.readBy, currentUserId, memberMap]);

  const saveEdit = async () => {
    const content = draft.trim();
    if (!content || content === message.content) {
      setIsEditing(false);
      setDraft(message.content || "");
      return;
    }

    await onEdit(message._id, content);
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    await onDelete(message._id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`group relative flex ${mine ? "justify-end" : "justify-start"}`}>
      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--bg-panel-strong)] p-4 shadow-soft">
            <h4 className="text-sm font-semibold">Delete message?</h4>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          mine
            ? "bg-[var(--accent)] text-slate-950"
            : "border border-[var(--line)] bg-[var(--bg-panel-strong)] text-[var(--text-main)]"
        }`}
      >
        <p className="font-semibold text-xs opacity-80">
          {senderLabel}
        </p>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-panel-strong)] p-2 text-[var(--text-main)] outline-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button type="button" onClick={saveEdit} className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDraft(message.content || "");
                }}
                className="rounded-md border border-[var(--line)] px-2 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {message.type === "image" && mediaUrl ? (
          <a href={mediaUrl} target="_blank" rel="noreferrer" className="mt-2 block">
            <img src={mediaUrl} alt="Uploaded" className="max-h-64 w-auto rounded-xl border border-[var(--line)] object-cover" />
          </a>
        ) : null}

        {message.type === "file" && mediaUrl ? (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg-panel-strong)] px-3 py-1.5 text-xs underline"
          >
            Download file
          </a>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(message._id, emoji)}
              className="rounded-md border border-[var(--line)] px-1.5 py-0.5 text-xs"
            >
              {emoji}
            </button>
          ))}
        </div>

        {reactionSummary.length ? (
          <p className="mt-1 text-[11px] opacity-75">
            {reactionSummary.map(([emoji, count]) => `${emoji} ${count}`).join("  ")}
          </p>
        ) : null}

        <p className="mt-1 text-[10px] opacity-65">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {message.editedAt ? " • edited" : ""}
        </p>

        {mine && seenByMembers.length ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] opacity-70">Seen by</span>
            {seenByMembers.slice(0, 4).map((member) => (
              <span
                key={member._id}
                title={member.username}
                className="grid h-5 w-5 place-items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--bg-panel-strong)] text-[10px]"
              >
                {member.avatar ? (
                  <img src={member.avatar} alt={member.username} className="h-full w-full object-cover" />
                ) : (
                  member.username?.slice(0, 1)?.toUpperCase() || "U"
                )}
              </span>
            ))}
          </div>
        ) : null}

        {mine && !isEditing ? (
          <div className="mt-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-md border border-[var(--line)] px-2 py-1 text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md border border-red-400 px-2 py-1 text-xs text-red-600"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
