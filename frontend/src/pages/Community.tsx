import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Search, Heart, MessageCircle, Share } from "lucide-react";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [backendMessage, setBackendMessage] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetch(`${backendUrl}/api/community/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
          setBackendMessage(data.message)
          if(data.posts) setPosts(data.posts)
      })
      .catch((error) =>
        setBackendMessage(`Failed to connect to backend: ${error.message}`)
      );
  }, [backendUrl]);

  const handlePublish = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/api/community/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if required
        },
        body: JSON.stringify({ title: newQuestionTitle, content: newQuestionContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish question');
      }

      const newPost = await response.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewQuestionTitle("");
      setNewQuestionContent("");
      setBackendMessage("Question published successfully!");

    } catch (error) {
      console.error("Error publishing question:", error);
      setBackendMessage("Failed to publish question. Please try again.");
    }
  };

  const handlePostAction = async (postId, action) => {
    try {
      const response = await fetch(`${backendUrl}/api/community/posts/${postId}/${action}/`, {
        method: 'POST',
        headers: {
          // Add auth headers if required
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} post`);
      }

      const updatedPost = await response.json();
      setPosts(posts.map(p => p.id === postId ? updatedPost : p));

    } catch (error) {
      console.error(`Error on ${action} post:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <p className="my-4 text-center text-green-500">{backendMessage}</p>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                  Questions
                </Button>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                  Tags
                </Button>
                <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                  Ranking
                </Button>
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-medium text-foreground mb-2">Personal Navigator</h4>
                  <Button variant="ghost" className="w-full justify-start text-primary">
                    Your questions
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    Your answers
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-foreground hover:text-primary">
                    Your likes & votes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Must-read posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  • Please read rules before you start
                </div>
                <div className="text-sm text-muted-foreground">
                  • When is it helpful of "Additional
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Featured links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-primary cursor-pointer hover:underline">
                  • Algorithm source code on GitHub
                </div>
                <div className="text-sm text-primary cursor-pointer hover:underline">
                  • DigitalOcean Referrals
                </div>
                <div className="text-sm text-primary cursor-pointer hover:underline">
                  • AWS tutorial dashsoard ai
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border/50 focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="bg-primary text-primary-foreground">
                  New
                </Button>
                <Button variant="outline" size="sm" className="border-border/50">
                  Top
                </Button>
                <Button variant="outline" size="sm" className="border-border/50">
                  Hot
                </Button>
                <Button variant="outline" size="sm" className="border-border/50">
                  Closed
                </Button>
              </div>
            </div>

            {/* New Question Form */}
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Question"
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    className="bg-background border-border/50 focus:border-primary"
                  />
                  <Textarea
                    placeholder="Describe your question"
                    value={newQuestionContent}
                    onChange={(e) => setNewQuestionContent(e.target.value)}
                    className="bg-background border-border/50 focus:border-primary min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="border-border/50">
                        Categories
                      </Button>
                    </div>
                    <Button onClick={handlePublish} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Publish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-foreground">{post.author}</span>
                            <span className="text-sm text-muted-foreground">{post.timeAgo}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {post.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <button onClick={() => handlePostAction(post.id, 'like')} className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button onClick={() => handlePostAction(post.id, 'comment')} className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button onClick={() => handlePostAction(post.id, 'share')} className="flex items-center space-x-1 hover:text-primary transition-colors">
                            <Share className="h-4 w-4" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <DarkModeToggle />
    </div>
  );
};

export default Community;
