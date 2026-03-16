import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Moon, Sun, Menu } from "lucide-react";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import ProfilePanel from "../components/ProfilePanel";
import { usersApi, conversationsApi, messagesApi, uploadsApi } from "../services/api";
import { useSocket } from "../hooks/useSocket";

const PAGE_SIZE = 20;

const getMessagePreview = (message) => {
  const type = message?.type || "text";
  if (type === "image") {
    return "[Image]";
  }
  if (type === "file") {
    return "[File]";
  }
  return (message?.content || "").trim();
};

export default function Chat({ token, user, onLogout }) {
  const socket = useSocket(token);
  const currentUserId = user?._id || user?.id;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
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
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("pulsechat_theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
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

  const updateConversationFromMessage = (incomingMessage, { incrementUnread = false } = {}) => {
    const conversationId = incomingMessage?.conversationId?.toString?.() || incomingMessage?.conversationId;
    if (!conversationId) {
      return;
    }

    const preview = getMessagePreview(incomingMessage);

    setConversations((previous) => {
      const index = previous.findIndex((conversation) => conversation._id === conversationId);
      if (index === -1) {
        return previous;
      }

      const target = previous[index];
      const updatedConversation = {
        ...target,
        lastMessage: preview,
        unreadCount: incrementUnread ? (target.unreadCount || 0) + 1 : 0,
        updatedAt: incomingMessage?.createdAt || new Date().toISOString()
      };

      return [updatedConversation, ...previous.filter((_, itemIndex) => itemIndex !== index)];
    });
  };

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
      }
    };

    init();
  }, []);

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
        updateConversationFromMessage(message);

        const senderId = message.senderId?._id || message.senderId;
        if (senderId !== currentUserId) {
          socket.emit("message_read", {
            conversationId: activeConversation._id,
            messageId: message._id
          });
        }
      } else {
        updateConversationFromMessage(message, { incrementUnread: true });
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

    updateConversationFromMessage({
      conversationId: activeConversation._id,
      type,
      content,
      createdAt: new Date().toISOString()
    });
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
    setConversations((previous) => {
      const index = previous.findIndex((item) => item._id === conversation._id);
      if (index === -1) {
        return previous;
      }
      const selected = {
        ...previous[index],
        unreadCount: 0
      };
      return [selected, ...previous.filter((_, itemIndex) => itemIndex !== index)];
    });
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

  const chatsListPane = (
    <ChannelList
      conversations={conversations}
      users={users}
      activeConversationId={activeConversation?._id}
      onSelectConversation={selectConversation}
      onStartChat={startChatWithUser}
      mobileMode={isMobile}
      currentUser={user}
      onLogout={onLogout}
      isDark={isDark}
      onToggleTheme={() => setIsDark((v) => !v)}
    />
  );

  const chatPane = (
    <div className="flex h-full flex-col gap-0">
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
        onToggleProfile={() => setIsProfileOpen(!isProfileOpen)}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen bg-[var(--bg-app)] md:p-4 text-[var(--text-main)]"
    >
      <div className="h-full max-w-[1600px] mx-auto flex gap-4 overflow-hidden">
        {isMobile ? (
          <div className="w-full h-full flex flex-col p-2">
            {mobileView === "list" ? chatsListPane : chatPane}
          </div>
        ) : (
          <>
            {/* Column 1: Chats List */}
            <div className="w-80 flex-shrink-0">
              {chatsListPane}
            </div>

            {/* Column 2: Chat Window */}
            <div className="flex-1 min-w-0">
              {chatPane}
            </div>

            {/* Column 3: Profile Panel */}
            <AnimatePresence>
              {isProfileOpen && activeConversation && (
                <ProfilePanel 
                  user={activeConversation.otherParticipant} 
                  isOpen={isProfileOpen} 
                  onClose={() => setIsProfileOpen(false)} 
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}

