import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Search, Send, MoreHorizontal, Reply, Edit, Trash2, Smile, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// TypeScript Types
interface Reaction {
  emoji: string;
  user: string;
}

interface Message {
  id?: number;
  tempId?: number;
  text: string;
  sender: "me" | "other";
  time: string;
  reply_to?: number | null;
  is_read?: boolean;
  reactions?: Reaction[];
}

interface User {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  online?: boolean;
  time?: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "🎉", "🙏", "😮"];

const Chat = () => {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [activeReactionId, setActiveReactionId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { userEmail, userAvatar } = useAuth();
  const navigate = useNavigate();
  const editInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  // Fetch Users (Contacts)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/chat/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contacts");
        return res.json();
      })
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setSelectedUser(data.users[0]);
        }
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl, navigate]);

  // Fetch Messages when Selected User Changes
  useEffect(() => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token");

    fetch(`${backendUrl}/api/chat/?recipient=${selectedUser.email || selectedUser.id}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [selectedUser, backendUrl]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const newMessage: Message = {
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "me",
      reply_to: replyTo ? replyTo.id : null,
      tempId: Date.now(),
      reactions: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setReplyTo(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.text,
          recipient: selectedUser.email || selectedUser.id,
          reply_to: newMessage.reply_to,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      const actualMessage = await response.json();
      setMessages((prev) => prev.map((m) => (m.tempId === newMessage.tempId ? actualMessage : m)));
    } catch (error) {
      console.error("Error sending:", error);
      setMessages((prev) => prev.filter((m) => m.tempId !== newMessage.tempId));
    }
  };

  const startEditing = (msg: Message) => {
    if (msg.id) {
      setEditingMessageId(msg.id);
      setEditText(msg.text);
    }
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleEditMessageSubmit = async (msgId: number) => {
    if (!editText.trim()) return;

    const originalMessage = messages.find((m) => m.id === msgId);
    if (!originalMessage) return;

    // Optimistic update
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, text: editText } : m)));
    setEditingMessageId(null);
    setEditText("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/chat/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ id: msgId, content: editText }),
      });

      if (!response.ok) throw new Error("Edit failed");
    } catch (err) {
      console.error("Edit failed", err);
      // Revert on error
      setMessages((prev) => prev.map((m) => (m.id === msgId ? originalMessage : m)));
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    const originalMessage = messages.find((m) => m.id === msgId);

    // Optimistic delete
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setDeleteConfirmId(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/chat/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ id: msgId }),
      });

      if (!response.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Delete failed", err);
      // Revert on error
      if (originalMessage) {
        setMessages((prev) => [...prev, originalMessage].sort((a, b) => (a.id || 0) - (b.id || 0)));
      }
    }
  };

  const handleReaction = async (msgId: number, emoji: string) => {
    const token = localStorage.getItem("token");
    const currentUser = userEmail || "me";

    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;

        const reactions = msg.reactions || [];
        const existingIndex = reactions.findIndex((r) => r.emoji === emoji && r.user === currentUser);

        if (existingIndex >= 0) {
          // Remove reaction
          return { ...msg, reactions: reactions.filter((_, i) => i !== existingIndex) };
        } else {
          // Add reaction
          return { ...msg, reactions: [...reactions, { emoji, user: currentUser }] };
        }
      })
    );

    setActiveReactionId(null);

    try {
      const response = await fetch(`${backendUrl}/api/chat/messages/${msgId}/react/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error("Reaction failed");

      const data = await response.json();
      // Update with server response
      setMessages((prev) =>
        prev.map((msg) => (msg.id === msgId ? { ...msg, reactions: data.reactions } : msg))
      );
    } catch (err) {
      console.error("Reaction failed", err);
      // Revert handled by the server state on next fetch
    }
  };

  const getReactionSummary = (reactions: Reaction[]) => {
    const emojiCounts: { [key: string]: number } = {};
    reactions.forEach((r) => {
      emojiCounts[r.emoji] = (emojiCounts[r.emoji] || 0) + 1;
    });
    return Object.entries(emojiCounts);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProfileSidebar
        user={{ name: userEmail?.split("@")[0] || "User", email: userEmail || "", avatar: userAvatar || "" }}
        hideButton={true}
      />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
          {/* Users List */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 h-full">
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-10 bg-background border-border/50" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto">
                {users.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUser?.email === user.email
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                      }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 h-full flex flex-col">
              {/* Header */}
              <CardHeader className="border-b border-border/50 py-3">
                <div className="flex items-center space-x-3">
                  {selectedUser && (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedUser.name}</p>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                <TooltipProvider>
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || msg.tempId || index}
                      className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"} mb-4`}
                    >
                      {/* Reply Reference */}
                      {msg.reply_to && (
                        <div className="text-xs text-muted-foreground mb-1 px-2 border-l-2 border-primary/50">
                          Replying to message...
                        </div>
                      )}

                      <div
                        className={`group relative flex items-end gap-2 max-w-[85%] ${msg.sender === "me" ? "flex-row-reverse" : "flex-row"
                          }`}
                      >
                        {/* Message Bubble */}
                        <div
                          className={`relative px-4 py-2 rounded-lg ${msg.sender === "me"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                            }`}
                        >
                          {/* Inline Edit Mode */}
                          {editingMessageId === msg.id ? (
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <Input
                                ref={editInputRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleEditMessageSubmit(msg.id!);
                                  if (e.key === "Escape") cancelEditing();
                                }}
                                className="h-7 text-sm bg-background text-foreground"
                                aria-label="Edit message"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleEditMessageSubmit(msg.id!)}
                                aria-label="Save edit"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={cancelEditing}
                                aria-label="Cancel edit"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                              <p
                                className={`text-[10px] mt-1 text-right ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`}
                              >
                                {msg.time}
                              </p>
                            </>
                          )}

                          {/* Reactions Badge */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="absolute -bottom-3 right-0 bg-background/95 border rounded-full px-2 py-0.5 text-xs shadow-sm flex gap-1 items-center z-10">
                              {getReactionSummary(msg.reactions)
                                .slice(0, 3)
                                .map(([emoji, count]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => msg.id && handleReaction(msg.id, emoji)}
                                    className="hover:scale-110 transition-transform cursor-pointer"
                                    aria-label={`${emoji} reaction, ${count} ${count === 1 ? "person" : "people"}`}
                                  >
                                    {emoji}
                                    {count > 1 && <span className="text-muted-foreground ml-0.5">{count}</span>}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Hover) */}
                        <div
                          className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1 border shadow-sm ${activeReactionId === msg.id ? "opacity-100" : ""
                            }`}
                        >
                          {/* Emoji Picker Overlay */}
                          {activeReactionId === msg.id && (
                            <div
                              className="absolute bottom-full mb-2 flex gap-1 bg-card border rounded-lg p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200"
                              role="menu"
                              aria-label="Emoji reactions"
                            >
                              {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  role="menuitem"
                                  className="p-1.5 hover:bg-muted rounded text-lg transition-transform hover:scale-110"
                                  onClick={() => msg.id && handleReaction(msg.id, emoji)}
                                  aria-label={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                onClick={() => setActiveReactionId(null)}
                                className="p-1 hover:bg-muted rounded"
                                aria-label="Close emoji picker"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Reply */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setReplyTo(msg);
                                  setEditingMessageId(null);
                                }}
                                aria-label="Reply to message"
                              >
                                <Reply className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reply</TooltipContent>
                          </Tooltip>

                          {/* Reaction Trigger */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setActiveReactionId(activeReactionId === msg.id ? null : msg.id!)}
                                aria-label="Add reaction"
                                aria-expanded={activeReactionId === msg.id}
                              >
                                <Smile className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>React</TooltipContent>
                          </Tooltip>

                          {/* Options Menu (Edit/Delete - Me Only) */}
                          {msg.sender === "me" && msg.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  aria-label="Message options"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => startEditing(msg)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteConfirmId(msg.id!)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </CardContent>

              {/* Input */}
              <div className="border-t border-border/50 p-4">
                {/* Context Bar (Reply) */}
                {replyTo && (
                  <div className="mb-2 flex items-center justify-between bg-muted/30 p-2 rounded text-xs text-muted-foreground border-l-2 border-primary">
                    <span>Replying to: {replyTo.text.substring(0, 30)}...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => setReplyTo(null)}
                      aria-label="Cancel reply"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 bg-background border-border/50 focus:border-primary"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    aria-label="Message input"
                  />
                  <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90" aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteMessage(deleteConfirmId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
          </div>
  );
};

export default Chat;
