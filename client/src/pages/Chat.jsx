import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { roomsApi, messagesApi, uploadsApi } from "../services/api";
import { useSocket } from "../hooks/useSocket";

const PAGE_SIZE = 20;

export default function Chat({ token, user, onLogout }) {
  const socket = useSocket(token);
  const currentUserId = user?._id || user?.id;
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [typingIds, setTypingIds] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("pulsechat_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("pulsechat_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const userMap = useMemo(() => {
    const map = new Map();
    rooms.forEach((room) => {
      room.members?.forEach((member) => {
        map.set(member._id, member.username);
      });
    });
    return map;
  }, [rooms]);

  const memberMap = useMemo(() => {
    const map = new Map();
    rooms.forEach((room) => {
      room.members?.forEach((member) => {
        map.set(member._id, member);
      });
    });
    return map;
  }, [rooms]);

  useEffect(() => {
    const init = async () => {
      const response = await roomsApi.list();
      const fetched = response.data.rooms || [];
      setRooms(fetched);
      if (fetched.length && !activeRoom) {
        setActiveRoom(fetched[0]);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!activeRoom?._id) {
      return;
    }

    const fetchMessages = async () => {
      const response = await messagesApi.list(activeRoom._id, 1, PAGE_SIZE);
      setMessages(response.data.messages || []);
      setCurrentPage(response.data.pagination?.page || 1);
      setHasMore(Boolean(response.data.pagination?.hasMore));
    };

    fetchMessages();
  }, [activeRoom?._id]);

  const loadOlderMessages = async () => {
    if (!activeRoom?._id || !hasMore || isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await messagesApi.list(activeRoom._id, nextPage, PAGE_SIZE);
      const older = response.data.messages || [];

      setMessages((previous) => {
        const existingIds = new Set(previous.map((item) => item._id));
        const uniqueOlder = older.filter((item) => !existingIds.has(item._id));
        return [...uniqueOlder, ...previous];
      });

      setCurrentPage(response.data.pagination?.page || nextPage);
      setHasMore(Boolean(response.data.pagination?.hasMore));
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!socket || !activeRoom?._id) {
      return;
    }

    socket.emit("join_room", { roomId: activeRoom._id });

    const onReceive = (message) => {
      if (message.roomId?.toString?.() === activeRoom._id || message.roomId === activeRoom._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit("mark_read", { roomId: activeRoom._id, messageId: message._id });
      }
    };

    const onTyping = ({ roomId, userId }) => {
      if (roomId !== activeRoom._id || userId === currentUserId) {
        return;
      }
      setTypingIds((previous) => (previous.includes(userId) ? previous : [...previous, userId]));
    };

    const onStopTyping = ({ roomId, userId }) => {
      if (roomId !== activeRoom._id) {
        return;
      }
      setTypingIds((previous) => previous.filter((id) => id !== userId));
    };

    const onReaction = ({ messageId, reactions }) => {
      setMessages((previous) =>
        previous.map((message) =>
          message._id === messageId
            ? {
                ...message,
                reactions
              }
            : message
        )
      );
    };

    const onReadReceipt = ({ messageId, userId }) => {
      setMessages((previous) =>
        previous.map((message) => {
          if (message._id !== messageId) {
            return message;
          }
          const already = (message.readBy || []).some((reader) => {
            if (typeof reader === "string") {
              return reader === userId;
            }
            return reader?._id === userId || reader?.id === userId;
          });
          if (already) {
            return message;
          }
          return {
            ...message,
            readBy: [...(message.readBy || []), userId]
          };
        })
      );
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("message_reaction", onReaction);
    socket.on("read_receipt", onReadReceipt);

    return () => {
      socket.emit("leave_room", { roomId: activeRoom._id });
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("message_reaction", onReaction);
      socket.off("read_receipt", onReadReceipt);
      setTypingIds([]);
    };
  }, [socket, activeRoom?._id, currentUserId]);

  const typingUsers = typingIds.map((id) => userMap.get(id) || "Someone");

  const sendMessage = async ({ content, file }) => {
    if (!socket || !activeRoom?._id) {
      return;
    }

    let type = "text";
    let fileUrl = "";

    if (file) {
      const uploaded = await uploadsApi.upload(file);
      type = uploaded.data.type;
      fileUrl = uploaded.data.fileUrl;
    }

    socket.emit("send_message", {
      roomId: activeRoom._id,
      message: content,
      type,
      fileUrl,
      sender: currentUserId
    });
  };

  const reactToMessage = (messageId, emoji) => {
    if (!socket || !activeRoom?._id || !messageId || !emoji) {
      return;
    }

    socket.emit("react_message", {
      roomId: activeRoom._id,
      messageId,
      emoji
    });
  };

  const editMessage = async (messageId, content) => {
    const response = await messagesApi.edit(messageId, { content });
    const updated = response.data.message;
    setMessages((previous) =>
      previous.map((message) =>
        message._id === messageId
          ? {
              ...message,
              ...updated,
              senderId: message.senderId,
              readBy: message.readBy
            }
          : message
      )
    );
  };

  const deleteMessage = async (messageId) => {
    await messagesApi.remove(messageId);
    setMessages((previous) => previous.filter((message) => message._id !== messageId));
  };

  const createRoom = async (name) => {
    const response = await roomsApi.create({ name });
    const room = response.data.room;
    setRooms((prev) => [room, ...prev]);
    setActiveRoom(room);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-screen p-3 md:p-4"
    >
      <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-[96px_280px_1fr]">
        <Sidebar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={() => setIsDark((v) => !v)} />

        <ChannelList
          rooms={rooms}
          activeRoomId={activeRoom?._id}
          onSelectRoom={setActiveRoom}
          onCreateRoom={createRoom}
        />

        <div className="grid min-h-0 grid-rows-[1fr_auto] gap-3">
          <ChatWindow
            room={activeRoom}
            messages={messages}
            currentUserId={currentUserId}
            typingUsers={typingUsers}
            memberMap={memberMap}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadOlderMessages}
            onReact={reactToMessage}
            onEdit={editMessage}
            onDelete={deleteMessage}
          />
          {activeRoom ? (
            <MessageInput
              onSend={sendMessage}
              onTyping={() => socket?.emit("typing", { roomId: activeRoom._id })}
              onStopTyping={() => socket?.emit("stop_typing", { roomId: activeRoom._id })}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
