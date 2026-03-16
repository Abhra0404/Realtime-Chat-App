import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import { usersApi, conversationsApi, messagesApi, uploadsApi } from "../services/api";
import { useSocket } from "../hooks/useSocket";

const PAGE_SIZE = 20;

export default function Chat({ token, user, onLogout }) {
  const socket = useSocket(token);
  const currentUserId = user?._id || user?.id;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [mobileView, setMobileView] = useState("list");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
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

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileView("chat");
      } else if (!activeConversation) {
        setMobileView("list");
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeConversation]);

  const memberMap = useMemo(() => {
    const map = new Map();
    users.forEach((chatUser) => map.set(chatUser._id, chatUser));
    map.set(currentUserId, user);
    return map;
  }, [users, currentUserId, user]);

  const activePartnerId = activeConversation?.otherParticipant?._id || "";

  useEffect(() => {
    const init = async () => {
      const [usersResponse, conversationsResponse] = await Promise.all([
        usersApi.list(),
        conversationsApi.list()
      ]);

      const fetchedUsers = usersResponse.data.users || [];
      const fetched = conversationsResponse.data.conversations || [];
      setUsers(fetchedUsers);
      setConversations(fetched);
      if (fetched.length && !activeConversation) {
        setActiveConversation(fetched[0]);
        if (isMobile) {
          setMobileView("list");
        }
      }
    };

    init();
  }, [isMobile]);

  useEffect(() => {
    if (!activeConversation?._id) {
      return;
    }

    const fetchMessages = async () => {
      const response = await conversationsApi.listMessages(activeConversation._id, 1, PAGE_SIZE);
      setMessages(response.data.messages || []);
      setCurrentPage(response.data.pagination?.page || 1);
      setHasMore(Boolean(response.data.pagination?.hasMore));

      (response.data.messages || []).forEach((message) => {
        const senderId = message.senderId?._id || message.senderId;
        if (senderId !== currentUserId && message.status !== "read") {
          socket?.emit("message_read", {
            conversationId: activeConversation._id,
            messageId: message._id
          });
        }
      });
    };

    fetchMessages();
  }, [activeConversation?._id, socket, currentUserId]);

  const loadOlderMessages = async () => {
    if (!activeConversation?._id || !hasMore || isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await conversationsApi.listMessages(activeConversation._id, nextPage, PAGE_SIZE);
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
    if (!socket || !activeConversation?._id) {
      return;
    }

    socket.emit("join_conversation", { conversationId: activeConversation._id });

    const onReceive = (message) => {
      const conversationId = message.conversationId?.toString?.() || message.conversationId;
      if (conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, message]);

        const senderId = message.senderId?._id || message.senderId;
        if (senderId !== currentUserId) {
          socket.emit("message_read", {
            conversationId: activeConversation._id,
            messageId: message._id
          });
        }
      } else {
        setConversations((previous) =>
          previous.map((conversation) => {
            if (conversation._id !== conversationId) {
              return conversation;
            }
            return {
              ...conversation,
              unreadCount: (conversation.unreadCount || 0) + 1,
              lastMessage: message.type === "text" ? message.content : message.type === "image" ? "[Image]" : "[File]"
            };
          })
        );
      }
    };

    const onTyping = ({ conversationId, userId }) => {
      if (conversationId !== activeConversation._id || userId === currentUserId) {
        return;
      }
      setTypingIds((previous) => (previous.includes(userId) ? previous : [...previous, userId]));
    };

    const onStopTyping = ({ conversationId, userId }) => {
      if (conversationId !== activeConversation._id) {
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

    const onMessageRead = ({ messageId, userId }) => {
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
            status: "read",
            readBy: [...(message.readBy || []), userId]
          };
        })
      );
    };

    const onMessageStatus = ({ messageId, status }) => {
      setMessages((previous) =>
        previous.map((message) =>
          message._id === messageId
            ? {
                ...message,
                status
              }
            : message
        )
      );
    };

    const onUserOnline = ({ userId }) => {
      setUsers((previous) =>
        previous.map((chatUser) =>
          chatUser._id === userId
            ? {
                ...chatUser,
                isOnline: true
              }
            : chatUser
        )
      );
    };

    const onUserOffline = ({ userId }) => {
      setUsers((previous) =>
        previous.map((chatUser) =>
          chatUser._id === userId
            ? {
                ...chatUser,
                isOnline: false,
                lastSeenAt: new Date().toISOString()
              }
            : chatUser
        )
      );
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("message_reaction", onReaction);
    socket.on("message_read", onMessageRead);
    socket.on("message_status", onMessageStatus);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      socket.emit("leave_conversation", { conversationId: activeConversation._id });
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("message_reaction", onReaction);
      socket.off("message_read", onMessageRead);
      socket.off("message_status", onMessageStatus);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      setTypingIds([]);
    };
  }, [socket, activeConversation?._id, currentUserId]);

  const typingUsers = typingIds.map((id) => memberMap.get(id)?.username || "Someone");

  const sendMessage = async ({ content, file }) => {
    if (!socket || !activeConversation?._id || !activePartnerId) {
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
      conversationId: activeConversation._id,
      receiverId: activePartnerId,
      message: content,
      type,
      fileUrl,
      sender: currentUserId
    });

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation._id === activeConversation._id
          ? {
              ...conversation,
              lastMessage: type === "text" ? content : type === "image" ? "[Image]" : "[File]"
            }
          : conversation
      )
    );
  };

  const reactToMessage = (messageId, emoji) => {
    if (!socket || !activeConversation?._id || !messageId || !emoji) {
      return;
    }

    socket.emit("react_message", {
      conversationId: activeConversation._id,
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

  const startChatWithUser = async (chatUser) => {
    const response = await conversationsApi.getOrCreateWithUser(chatUser._id);
    const conversation = response.data.conversation;

    setConversations((previous) => {
      const exists = previous.some((item) => item._id === conversation._id);
      if (exists) {
        return previous.map((item) => (item._id === conversation._id ? conversation : item));
      }
      return [conversation, ...previous];
    });

    setActiveConversation(conversation);
    if (isMobile) {
      setMobileView("chat");
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    if (isMobile) {
      setMobileView("chat");
    }
  };

  const activeTitle = activeConversation
    ? activeConversation.otherParticipant?.username || "Conversation"
    : "";

  const activeSubtitle = activeConversation
    ? activeConversation.otherParticipant?.isOnline
      ? "online"
      : "last seen recently"
    : "";

  const mobileHeaderTitle = mobileView === "list" ? "Chats" : activeTitle || "Chat";

  const chatsListPane = (
    <ChannelList
      conversations={conversations}
      users={users}
      activeConversationId={activeConversation?._id}
      onSelectConversation={selectConversation}
      onStartChat={startChatWithUser}
      mobileMode={isMobile}
    />
  );

  const chatPane = (
    <div className="flex min-h-0 flex-col gap-0 md:gap-3">
      <ChatWindow
        conversation={activeConversation}
        title={activeTitle}
        subtitle={activeSubtitle}
        showBackButton={isMobile}
        onBack={() => setMobileView("list")}
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
      {activeConversation ? (
        <MessageInput
          onSend={sendMessage}
          onTyping={() =>
            socket?.emit("typing", {
              conversationId: activeConversation._id,
              toUserId: activePartnerId
            })
          }
          onStopTyping={() =>
            socket?.emit("stop_typing", {
              conversationId: activeConversation._id,
              toUserId: activePartnerId
            })
          }
        />
      ) : null}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-screen p-2 md:p-4"
    >
      {isMobile ? (
        <div className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-app)] p-2 shadow-2xl">
          <header className="mb-2 flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg-sidebar)] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-strong)] text-sm font-bold text-white">
                {user?.username?.slice(0, 1)?.toUpperCase() || "U"}
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">{mobileHeaderTitle}</p>
                <p className="text-[11px] text-[var(--text-subtle)]">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsDark((value) => !value)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)]"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-panel)] text-red-500"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1">{mobileView === "list" ? chatsListPane : chatPane}</div>
        </div>
      ) : (
        <div className="grid h-full grid-cols-1 gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-app)] p-2 shadow-2xl md:grid-cols-[84px_360px_1fr] md:gap-0 md:rounded-3xl md:p-3">
          <Sidebar user={user} onLogout={onLogout} isDark={isDark} onToggleTheme={() => setIsDark((v) => !v)} />
          {chatsListPane}
          {chatPane}
        </div>
      )}
    </motion.div>
  );
}
