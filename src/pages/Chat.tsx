import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Search, Send, MoreVertical } from "lucide-react";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("Esther Howard");

  const users = [
    { name: "Esther Howard", company: "Microsoft", time: "1m", avatar: "/placeholder.svg", online: true },
    { name: "Devon Lane", company: "New Mexico", time: "5m", avatar: "/placeholder.svg", online: false },
    { name: "Jenny Wilson", company: "", time: "1h", avatar: "/placeholder.svg", online: true },
    { name: "Annette Black", company: "2464 Royal Ln. Mesa, New...", time: "2h", avatar: "/placeholder.svg", online: false },
    { name: "Marvin McKinney", company: "Amet minim mollit non...", time: "2d", avatar: "/placeholder.svg", online: false },
    { name: "Theresa Webb", company: "177", time: "1w", avatar: "/placeholder.svg", online: false },
  ];

  const messages = [
    { text: "hi good day can you help me ?", sender: "other", time: "10:30 AM" },
    { text: "hi good day can you help me ?", sender: "me", time: "10:35 AM" },
    { text: "Good day to you sir.........", sender: "other", time: "10:40 AM" },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh]">
          {/* Users List */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 h-full">
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-10 bg-background border-border/50 focus:border-primary"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 overflow-y-auto">
                {users.map((user, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedUser(user.name)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser === user.name 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <span className="text-xs text-muted-foreground">{user.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.company}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95 h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={selectedUser} />
                      <AvatarFallback>{selectedUser.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{selectedUser}</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'me' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type here....."
                    className="flex-1 bg-background border-border/50 focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
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