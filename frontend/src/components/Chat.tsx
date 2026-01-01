import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Trash2, Edit2, X, Check } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  user: {
    username: string;
  };
  createdAt: string;
  editedAt?: string;
}

interface ChatProps {
  streamId: string;
}

export default function Chat({ streamId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [userCount, setUserCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const user = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Fetch History
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${streamId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();

    // 2. Connect to Socket Server (Relative path for Nginx)
    socketRef.current = io("/", {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
    });

    // 3. Join Room
    socketRef.current.emit("join_stream_chat", { streamId });

    // 4. Listen for messages
    socketRef.current.on("chat_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // 5. Listen for user presence
    socketRef.current.on("user_joined", (data: { username: string }) => {
      console.log(`${data.username} joined the chat`);
      setUserCount((prev) => prev + 1);
    });

    socketRef.current.on("user_left", (data: { username: string }) => {
      console.log(`${data.username} left the chat`);
      setUserCount((prev) => Math.max(0, prev - 1));
    });

    // 6. Listen for typing indicators
    socketRef.current.on("user_typing", (data: { username: string }) => {
      setTypingUsers((prev) => new Set(prev).add(data.username));
    });

    socketRef.current.on(
      "user_stopped_typing",
      (data: { username: string }) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(data.username);
          return updated;
        });
      }
    );

    // 7. Listen for message edits
    socketRef.current.on("message_edited", (data: ChatMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.id ? { ...msg, ...data } : msg))
      );
    });

    // 8. Listen for message deletes
    socketRef.current.on("message_deleted", (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_stream_chat", { streamId });
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [streamId]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Emit typing event
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socketRef.current?.emit("typing", { streamId });
    }

    // Debounce stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && socketRef.current) {
        socketRef.current.emit("stopped_typing", { streamId });
        setIsTyping(false);
      }
    }, 2000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !socketRef.current) return;

    const payload = {
      streamId,
      content: newMessage,
    };

    socketRef.current.emit("send_message", payload);
    setNewMessage("");
    setIsTyping(false);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingId(messageId);
    setEditingContent(content);
  };

  const saveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await api.patch(`/chat/${messageId}`, {
        content: editingContent,
      });

      socketRef.current?.emit("edit_message", {
        messageId,
        content: editingContent,
        streamId,
      });

      setEditingId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to edit message", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/chat/${messageId}`);

      socketRef.current?.emit("delete_message", {
        messageId,
        streamId,
      });
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-80">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          Chat Room
          <span className="text-xs font-normal text-green-500 bg-green-900/30 px-2 py-0.5 rounded-full">
            {userCount} online
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="group">
            {editingId === msg.id ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => saveEdit(msg.id)}
                  className="p-1 hover:bg-green-600 rounded transition"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 hover:bg-red-600 rounded transition"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  {msg.user.username}
                  <span className="text-[10px] font-normal text-gray-600 ml-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.editedAt && " (edited)"}
                  </span>
                </span>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-200 whitespace-normal bg-gray-800/50 p-2 rounded-lg mt-1 inline-block flex-1">
                    {msg.content}
                  </span>
                  {user && msg.user.username === user.username && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 mt-1 transition-opacity">
                      <button
                        onClick={() => handleEditMessage(msg.id, msg.content)}
                        className="p-1 hover:bg-blue-600 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3 text-blue-400" />
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 hover:bg-red-600 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="text-xs text-gray-500 italic">
            {Array.from(typingUsers).join(", ")}{" "}
            {typingUsers.size === 1 ? "is" : "are"} typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-gray-800 flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={handleMessageChange}
          placeholder="Say something..."
          className="flex-1 bg-gray-800 border-gray-700 text-white"
        />
        <Button
          type="submit"
          size="icon"
          variant="default"
          disabled={!newMessage.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
