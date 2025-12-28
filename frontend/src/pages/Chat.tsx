import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Search, Send, MoreVertical, Reply, Edit, Trash2, Smile, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null); // Store full user object
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [backendMessage, setBackendMessage] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null); // Message replying to
  const [editingMessage, setEditingMessage] = useState<any>(null); // Message being edited
  const [activeReactionId, setActiveReactionId] = useState<number | null>(null); // ID of message with open reaction picker
  const { userEmail, userAvatar } = useAuth();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  // Fetch Users (Contacts)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/signin");
      return;
    }

    fetch(`${backendUrl}/api/chat/`, {
      headers: { 'Authorization': `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contacts");
        return res.json();
      })
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setSelectedUser(data.users[0]); // Default to first contact
        }
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl, navigate]);

  // Fetch Messages when Selected User Change
  useEffect(() => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');

    fetch(`${backendUrl}/api/chat/?recipient=${selectedUser.email || selectedUser.id}`, {
      headers: { 'Authorization': `Token ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(err => console.error("Error fetching messages:", err));
  }, [selectedUser, backendUrl]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Identify if Adding or Editing
    if (editingMessage) {
      handleEditMessageSubmit();
      return;
    }

    const newMessage = {
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      reply_to: replyTo ? replyTo.id : null,
      tempId: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setReplyTo(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.text,
          recipient: selectedUser.email || selectedUser.id,
          reply_to: newMessage.reply_to
        })
      });

      if (!response.ok) throw new Error('Failed to send');

      const actualMessage = await response.json();
      // Replace temp message
      setMessages(prev => prev.map(m => m.tempId === newMessage.tempId ? actualMessage : m));

    } catch (error) {
      console.error("Error sending:", error);
      setMessages(prev => prev.filter(m => m.tempId !== newMessage.tempId));
    }
  };

  const handleEditMessageSubmit = async () => {
    if (!editingMessage || !message.trim()) return;

    const updatedText = message;
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: updatedText } : m));
    setMessage("");
    setEditingMessage(null);

    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/chat/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ id: editingMessage.id, content: updatedText })
      });
    } catch (err) {
      console.error("Edit failed", err);
      // Revert? For now assume success or reload
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    // Optimistic delete
    setMessages(prev => prev.filter(m => m.id !== msgId));

    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/chat/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({ id: msgId })
      });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ProfileSidebar user={{ name: userEmail?.split('@')[0] || "User", email: userEmail || "", avatar: userAvatar || "" }} hideButton={true} />
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
                      {user.online && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>}
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
                    <div key={index} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-4`}>

                      {/* Reply Reference */}
                      {msg.reply_to && (
                        <div className="text-xs text-muted-foreground mb-1 px-2 border-l-2 border-primary/50">
                          Replying to message...
                        </div>
                      )}

                      <div className={`group relative flex items-end gap-2 max-w-[85%] ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>

                        {/* Message Bubble */}
                        <div className={`relative px-4 py-2 rounded-lg ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.time}
                          </p>

                          {/* Reactions Badge */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="absolute -bottom-3 right-0 bg-background/95 border rounded-full px-2 py-0.5 text-xs shadow-sm flex gap-1 items-center z-10 cursor-pointer hover:bg-muted/50">
                              {Array.from(new Set(msg.reactions.map((r: any) => r.emoji))).slice(0, 3).map((e: any) => (
                                <span key={e}>{e}</span>
                              ))}
                              <span className="text-muted-foreground text-[10px]">{msg.reactions.length}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Hover) */}
                        <div className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1 border shadow-sm ${activeReactionId === msg.id ? 'opacity-100' : ''}`}>

                          {/* Emoji Picker Overlay */}
                          {activeReactionId === msg.id && (
                            <div className="absolute bottom-full mb-2 flex gap-1 bg-card border rounded-lg p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                              {['👍', '❤️', '😂', '😮', '😢', '🔥'].map(emoji => (
                                <button
                                  key={emoji}
                                  className="p-1.5 hover:bg-muted rounded text-lg transition-transform hover:scale-110"
                                  onClick={() => { handleReaction(msg.id, emoji); setActiveReactionId(null); }}
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button onClick={() => setActiveReactionId(null)} className="p-1 hover:bg-muted rounded"><X className="h-3 w-3" /></button>
                            </div>
                          )}

                          {/* Reply */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                setReplyTo(msg);
                                setEditingMessage(null);
                              }}>
                                <Reply className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reply</TooltipContent>
                          </Tooltip>

                          {/* Edit/Delete (Me Only) */}
                          {msg.sender === 'me' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                    setEditingMessage(msg);
                                    setMessage(msg.text);
                                    setReplyTo(null);
                                  }}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleDeleteMessage(msg.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {/* Reaction Trigger */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveReactionId(activeReactionId === msg.id ? null : msg.id)}>
                                <Smile className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>React</TooltipContent>
                          </Tooltip>

                        </div>

                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </CardContent>

              {/* Input */}
              <div className="border-t border-border/50 p-4">
                {/* Context Bar (Reply / Edit) */}
                {(replyTo || editingMessage) && (
                  <div className="mb-2 flex items-center justify-between bg-muted/30 p-2 rounded text-xs text-muted-foreground border-l-2 border-primary">
                    <span>
                      {replyTo ? `Replying to: ${replyTo.text.substring(0, 30)}...` : `Editing message...`}
                    </span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => { setReplyTo(null); setEditingMessage(null); setMessage(""); }}>
                      ✕
                    </Button>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={editingMessage ? "Edit message..." : "Type here..."}
                    className="flex-1 bg-background border-border/50 focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Chat;
