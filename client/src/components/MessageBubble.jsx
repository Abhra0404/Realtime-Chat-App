import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😮"];
const LONG_PRESS_MS = 450;
const MENU_MARGIN = 8;

const getSenderId = (sender) => {
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  return sender._id || sender.id || "";
};

const getMediaUrl = (fileUrl) => {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
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
  if (status === "read") return "✓✓";
  if (status === "delivered") return "✓✓";
  return "✓";
};

export default function MessageBubble({ message, currentUserId, memberMap, onReact, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const menuRef = useRef(null);
  const longPressTimerRef = useRef(null);

  useEffect(() => {
    if (!isEditing) setDraft(message.content || "");
  }, [message.content, isEditing]);

  useEffect(() => {
    if (!contextMenu.open) return;
    const closeMenu = () => setContextMenu({ open: false, x: 0, y: 0 });
    const onEscape = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", onEscape);
    };
  }, [contextMenu.open]);

  const mine = getSenderId(message.senderId) === currentUserId;
  const senderLabel = mine ? "You" : message.senderId?.username || "User";
  const mediaUrl = getMediaUrl(message.fileUrl);

  const reactionSummary = useMemo(() => {
    const counts = {};
    (message.reactions || []).forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    return Object.entries(counts);
  }, [message.reactions]);

  const saveEdit = async () => {
    const content = draft.trim();
    if (!content || content === message.content) {
      setIsEditing(false);
      return;
    }
    await onEdit(message._id, content);
    setIsEditing(false);
  };

  const onOpenContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ open: true, x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative flex flex-col ${mine ? "items-end" : "items-start"} mb-2`}
      onContextMenu={onOpenContextMenu}
    >
      <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
        {!mine && (
          <div className="h-6 w-6 rounded-full bg-[var(--accent-strong)] text-[10px] grid place-items-center text-white font-bold flex-shrink-0 mb-1">
            {senderLabel.slice(0, 1).toUpperCase()}
          </div>
        )}
        
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
            mine
              ? "bg-[var(--accent)] text-white rounded-tr-sm"
              : "bg-[var(--bg-sidebar)] text-[var(--text-main)] rounded-tl-sm border border-[var(--line)]"
          }`}
        >
          {isEditing ? (
            <div className="space-y-2 min-w-[200px]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full bg-black/10 rounded-lg p-2 text-sm outline-none border-none text-inherit"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-[10px] uppercase font-bold opacity-70">Cancel</button>
                <button onClick={saveEdit} className="text-[10px] uppercase font-bold">Save</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              
              {message.type === "image" && mediaUrl && (
                <a href={mediaUrl} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-xl border border-black/5">
                  <img src={mediaUrl} alt="Upload" className="max-h-60 w-full object-cover hover:scale-105 transition duration-500" />
                </a>
              )}

              {message.type === "file" && mediaUrl && (
                <a href={mediaUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-black/5 text-xs truncate">
                  📎 File Attachment
                </a>
              )}
            </>
          )}

          <div className={`flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px] font-medium`}>
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {mine && <span className={message.status === "read" ? "text-blue-200" : ""}>{getStatusLabel(message.status)}</span>}
          </div>

          {reactionSummary.length > 0 && (
            <div className="absolute -bottom-2 left-2 flex gap-1">
              {reactionSummary.map(([emoji, count]) => (
                <span key={emoji} className="bg-[var(--bg-panel)] border border-[var(--line)] rounded-full px-1.5 py-0.5 text-[10px] shadow-sm">
                  {emoji} {count > 1 ? count : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {contextMenu.open && (
        <div
          className="fixed z-50 bg-[var(--bg-sidebar)] border border-[var(--line)] rounded-xl shadow-2xl p-1 w-40 overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-around p-1 border-b border-[var(--line)] mb-1">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(message._id, e); setContextMenu({ open: false }); }} className="hover:scale-125 transition text-lg">{e}</button>
            ))}
          </div>
          {mine && (
            <>
              <button 
                onClick={() => { setIsEditing(true); setContextMenu({ open: false }); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--bg-panel)] transition"
              >
                Edit Message
              </button>
              <button 
                onClick={() => { onDelete(message._id); setContextMenu({ open: false }); }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 transition"
              >
                Delete Message
              </button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

