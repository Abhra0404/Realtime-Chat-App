import { useEffect, useMemo, useRef, useState } from "react";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮"];
const LONG_PRESS_MS = 450;
const MENU_MARGIN = 8;

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
  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const derivedSocketUrlFromApi = apiBaseUrl ? apiBaseUrl.replace(/\/api\/?$/, "") : "";
  const socketBase =
    import.meta.env.VITE_SOCKET_URL ||
    derivedSocketUrlFromApi ||
    (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);
  const normalizedBase = socketBase.endsWith("/") ? socketBase.slice(0, -1) : socketBase;
  const normalizedPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${normalizedBase}${normalizedPath}`;
};

const getStatusLabel = (status) => {
  if (status === "read") {
    return "✓✓ read";
  }
  if (status === "delivered") {
    return "✓✓ delivered";
  }
  return "✓ sent";
};

export default function MessageBubble({ message, currentUserId, memberMap, onReact, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const menuRef = useRef(null);
  const longPressTimerRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(message.content || "");
    }
  }, [message.content, isEditing]);

  useEffect(() => {
    if (!contextMenu.open) {
      return;
    }

    const closeMenu = () => setContextMenu({ open: false, x: 0, y: 0 });
    const onEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", onEscape);
    };
  }, [contextMenu.open]);

  useEffect(() => {
    if (!contextMenu.open || !menuRef.current) {
      return;
    }

    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    const maxX = Math.max(MENU_MARGIN, window.innerWidth - menuWidth - MENU_MARGIN);
    const maxY = Math.max(MENU_MARGIN, window.innerHeight - menuHeight - MENU_MARGIN);

    const clampedX = Math.min(Math.max(contextMenu.x, MENU_MARGIN), maxX);
    const clampedY = Math.min(Math.max(contextMenu.y, MENU_MARGIN), maxY);

    if (clampedX !== contextMenu.x || clampedY !== contextMenu.y) {
      setContextMenu((previous) => ({ ...previous, x: clampedX, y: clampedY }));
    }
  }, [contextMenu]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => clearLongPressTimer, []);

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

  const openContextMenuAt = (x, y) => {
    setContextMenu({ open: true, x, y });
  };

  const onOpenContextMenu = (event) => {
    event.preventDefault();
    openContextMenuAt(event.clientX, event.clientY);
  };

  const onTouchStart = (event) => {
    if (!event.touches?.length) {
      return;
    }

    const touch = event.touches[0];
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      openContextMenuAt(touch.clientX, touch.clientY);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const onTouchEnd = () => {
    clearLongPressTimer();
  };

  const onTouchMove = () => {
    clearLongPressTimer();
  };

  const selectReaction = (emoji) => {
    onReact(message._id, emoji);
    setContextMenu({ open: false, x: 0, y: 0 });
  };

  return (
    <div
      className={`group relative flex ${mine ? "justify-end" : "justify-start"}`}
      onContextMenu={onOpenContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onTouchMove={onTouchMove}
    >
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

      {contextMenu.open ? (
        <div
          ref={menuRef}
          className="fixed z-50 w-56 rounded-xl border border-[var(--line)] bg-[var(--bg-panel)] p-2 shadow-2xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Reactions</p>
          <div className="mb-2 flex flex-wrap gap-1 px-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => selectReaction(emoji)}
                className="rounded-full border border-[var(--line)] bg-[var(--bg-panel-strong)] px-2 py-1 text-sm"
              >
                {emoji}
              </button>
            ))}
          </div>

          {mine ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setContextMenu({ open: false, x: 0, y: 0 });
                }}
                className="w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-[var(--bg-panel-strong)]"
              >
                Edit message
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setContextMenu({ open: false, x: 0, y: 0 });
                }}
                className="w-full rounded-md px-2 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10"
              >
                Delete message
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className={`max-w-[84%] rounded-lg px-3 py-2 text-sm shadow-sm md:max-w-[72%] ${
          mine
            ? "bg-[var(--outgoing)] text-[var(--text-main)]"
            : "bg-[var(--incoming)] text-[var(--text-main)]"
        }`}
      >
        {!mine ? <p className="text-[11px] font-bold text-[var(--accent-strong)]">{senderLabel}</p> : null}

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
          <p className="mt-0.5 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
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

        {reactionSummary.length ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {reactionSummary.map(([emoji, count]) => (
              <span key={emoji} className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] dark:bg-white/10">
                {emoji} {count}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-1 text-right text-[10px] text-[var(--text-subtle)]">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {message.editedAt ? " • edited" : ""}
          {mine ? ` • ${getStatusLabel(message.status)}` : ""}
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

      </div>
    </div>
  );
}
