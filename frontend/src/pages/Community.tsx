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
import { Search, Heart, MessageCircle, Share, Flag, Edit, ChevronDown, ChevronUp, Send, Trash2, MoreHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  avatar: string | null;
  tags: string[];
  likes: number;
  user_has_liked?: boolean;
  comments_count: number;
  created_at: string;
  is_registered_user: boolean;
  user_id: number | null;
  guest_email: string | null;
  is_admin_author?: boolean;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  avatar?: string | null;
  likes?: number;
  user_has_liked?: boolean;
  created_at: string;
  is_registered_user: boolean;
  user_id?: number | null;
  guest_email?: string | null;
  is_admin_author?: boolean;
}

const Community = () => {
  const { isAuthenticated, userId, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "likes">("recent");
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [backendMessage, setBackendMessage] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState("");
  const [commentGuestName, setCommentGuestName] = useState("");
  const [commentGuestEmail, setCommentGuestEmail] = useState("");

  // Options Menu State
  const [activeOptionsPostId, setActiveOptionsPostId] = useState<number | null>(null);
  const [activeOptionsCommentId, setActiveOptionsCommentId] = useState<number | null>(null);

  // Editing state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // Report state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Token ${token}`;

      const response = await fetch(`${backendUrl}/api/community/posts/?sort=${sortBy}`, { headers });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setBackendMessage("Failed to load posts.");
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Token ${token}`;

      const response = await fetch(`${backendUrl}/api/community/posts/${postId}/comments/`, { headers });
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handlePublish = async () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim()) {
      setBackendMessage("Please fill in both title and content.");
      return;
    }

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      setBackendMessage("Name and email are required for guest posts.");
      return;
    }

    if (!isAuthenticated && newQuestionContent.includes('@admin')) {
      setBackendMessage("@admin mentions are only available for registered users.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const response = await fetch(`${backendUrl}/api/community/posts/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newQuestionTitle,
          content: newQuestionContent,
          guest_name: guestName,
          guest_email: guestEmail,
          tags: []
        }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      setNewQuestionTitle("");
      setNewQuestionContent("");
      setGuestName("");
      setGuestEmail("");
      setBackendMessage("Question published!");
      fetchPosts();
      setTimeout(() => setBackendMessage(""), 3000);
    } catch (error: any) {
      setBackendMessage(error.message || "Failed to publish.");
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newComment.trim()) return;

    if (!isAuthenticated && (!commentGuestName.trim() || !commentGuestEmail.trim())) {
      setBackendMessage("Name and email are required for guest comments.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const response = await fetch(`${backendUrl}/api/community/posts/${postId}/comments/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newComment,
          guest_name: commentGuestName,
          guest_email: commentGuestEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment("");
      setCommentGuestName("");
      setCommentGuestEmail("");
      fetchComments(postId);
      fetchPosts();
    } catch (error: any) {
      setBackendMessage(error.message || "Failed to add comment.");
    }
  };

  const toggleComments = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) fetchComments(postId);
    }
  };

  // Ownership checks
  const isPostOwner = (post: Post) => isAuthenticated && post.user_id && userId && post.user_id === userId;
  const isCommentOwner = (comment: Comment) => isAuthenticated && comment.user_id && userId && comment.user_id === userId;
  const canDeletePost = (post: Post) => isPostOwner(post) || isAdmin;
  const canDeleteComment = (comment: Comment) => isCommentOwner(comment) || isAdmin;
  const canEditPost = (post: Post) => isPostOwner(post); // Admin only deletes, per requirements
  const canEditComment = (comment: Comment) => isCommentOwner(comment); // Admin only deletes

  // Like functions
  const handleLikePost = async (postId: number) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/posts/${postId}/like/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes, user_has_liked: data.liked } : p));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleLikeComment = async (commentId: number, postId: number) => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/comments/${commentId}/like/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(c => c.id === commentId ? { ...c, likes: data.likes, user_has_liked: data.liked } : c)
      }));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Edit/Delete handlers...
  const handleEditPost = async () => {
    if (!editingPost) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/posts/${editingPost.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!response.ok) throw new Error();
      setEditingPost(null);
      setBackendMessage("Post updated!");
      fetchPosts();
      setActiveOptionsPostId(null);
      setTimeout(() => setBackendMessage(""), 2000);
    } catch (error) {
      setBackendMessage("Failed to update post.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/posts/${postId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error();
      setBackendMessage("Post deleted!");
      fetchPosts();
      setActiveOptionsPostId(null);
      setTimeout(() => setBackendMessage(""), 2000);
    } catch (error) {
      setBackendMessage("Failed to delete post.");
    }
  };

  const handleEditComment = async () => {
    if (!editingComment) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/comments/${editingComment.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ content: editCommentContent }),
      });
      if (!response.ok) throw new Error();
      setEditingComment(null);
      if (expandedPost) fetchComments(expandedPost);
      setActiveOptionsCommentId(null);
    } catch (error) {
      setBackendMessage("Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/community/comments/${commentId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });
      if (!response.ok) throw new Error();
      fetchComments(postId);
      fetchPosts();
      setActiveOptionsCommentId(null);
    } catch (error) {
      setBackendMessage("Failed to delete comment.");
    }
  };

  const handleReport = async () => {
    if (!selectedPostId || !reportType || !reportDescription) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/reports/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ report_type: reportType, description: `Post ID: ${selectedPostId}. ${reportDescription}` }),
      });
      if (!response.ok) throw new Error();
      setBackendMessage("Report submitted!");
      setReportDialogOpen(false);
      setReportType("");
      setReportDescription("");
      setTimeout(() => setBackendMessage(""), 3000);
    } catch (error) {
      setBackendMessage("Please sign in to report posts.");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => searchQuery ? b.likes - a.likes : 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          {backendMessage && (
            <p className={`my-4 text-center font-medium ${backendMessage.includes('Failed') || backendMessage.includes('required') || backendMessage.includes('sign in') ? 'text-red-500' : 'text-green-500'}`}>
              {backendMessage}
            </p>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4 space-y-6 group">
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start text-primary opacity-60 hover:opacity-100 transition-opacity">Questions</Button>
                  <Button variant="ghost" className="w-full justify-start text-foreground opacity-60 hover:opacity-100 transition-opacity">Tags</Button>
                  <Button variant="ghost" className="w-full justify-start text-foreground opacity-60 hover:opacity-100 transition-opacity">Ranking</Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Community Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Be respectful</p>
                  <p>• No spam</p>
                  <p>• @admin for help (registered only)</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search posts... (results ranked by likes)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border/50 focus:border-primary"
                  />
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "likes")}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ask Question */}
              <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <CardTitle className="text-lg">Ask the Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isAuthenticated && (
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Your Name *</Label><Input placeholder="John Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} /></div>
                      <div><Label>Your Email *</Label><Input type="email" placeholder="john@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} /></div>
                    </div>
                  )}
                  <div><Label>Question Title</Label><Input placeholder="What's your question?" value={newQuestionTitle} onChange={(e) => setNewQuestionTitle(e.target.value)} /></div>
                  <div><Label>Description</Label><Textarea placeholder="Describe your question... (Use @admin for help)" value={newQuestionContent} onChange={(e) => setNewQuestionContent(e.target.value)} className="min-h-[100px]" /></div>
                  <div className="flex justify-end"><Button onClick={handlePublish}>Publish Question</Button></div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
                    <CardContent className="pt-6 relative">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.avatar || undefined} alt={post.author} />
                          <AvatarFallback>{post.author?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-foreground">{post.author}</span>
                              <span className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                            </div>

                            {/* Slide-out Options Menu */}
                            <div className="flex items-center absolute top-4 right-4 bg-background/50 rounded-full transition-all duration-300">
                              {/* Animated Button Container */}
                              <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${activeOptionsPostId === post.id ? 'w-auto opacity-100 pr-2' : 'w-0 opacity-0'}`}>
                                {canEditPost(post) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => { setEditingPost(post); setEditTitle(post.title); setEditContent(post.content); }} className="h-8 w-8 p-0 hover:bg-muted/80">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                )}
                                {canDeletePost(post) && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="h-8 w-8 p-0 hover:bg-muted/80">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>

                              {/* Options Trigger (visible if user has permissions for this post) */}
                              {(canEditPost(post) || canDeletePost(post)) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setActiveOptionsPostId(activeOptionsPostId === post.id ? null : post.id)}
                                  className={`h-8 w-8 p-0 rounded-full transition-transform duration-300 ${activeOptionsPostId === post.id ? 'rotate-90 bg-muted' : ''}`}
                                >
                                  {activeOptionsPostId === post.id ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                              )}

                              {/* Report Flag (visible for non-admin authors and non-owner) */}
                              {isAuthenticated && !post.is_admin_author && !isPostOwner(post) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedPostId(post.id); setReportDialogOpen(true); }} className="h-8 w-8 p-0 ml-1 rounded-full">
                                      <Flag className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Report this post</TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 pr-12">{post.title}</h3>
                          <p className="text-muted-foreground mb-3 whitespace-pre-line">{post.content}</p>

                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag) => <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">{tag}</Badge>)}
                            </div>
                          )}

                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <button onClick={() => handleLikePost(post.id)} className={`flex items-center space-x-1 transition-colors ${post.user_has_liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                              <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                              <span>{post.likes}</span>
                            </button>
                            <button onClick={() => toggleComments(post.id)} className="flex items-center space-x-1 hover:text-primary transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments_count} Comments</span>
                              {expandedPost === post.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <button className="flex items-center space-x-1 hover:text-primary transition-colors"><Share className="h-4 w-4" /><span>Share</span></button>
                          </div>

                          {expandedPost === post.id && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <h4 className="font-medium mb-3">Comments</h4>
                              <div className="space-y-3 mb-4">
                                {comments[post.id]?.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
                                {comments[post.id]?.map((comment) => (
                                  <div key={comment.id} className="flex space-x-2 p-3 bg-muted/30 rounded-lg group/comment relative pr-10">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={comment.avatar || undefined} alt={comment.author} />
                                      <AvatarFallback>{comment.author?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-sm">{comment.author}</span>
                                          <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground pr-8">{comment.content}</p>

                                      <button onClick={() => handleLikeComment(comment.id, post.id)} className={`flex items-center space-x-1 mt-2 text-xs transition-colors ${comment.user_has_liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}>
                                        <Heart className={`h-3 w-3 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                                        <span>{comment.likes || 0}</span>
                                      </button>

                                      {/* Slide-out Comment Options */}
                                      <div className="absolute top-2 right-2 flex items-center">
                                        {/* Animated Container */}
                                        <div className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${activeOptionsCommentId === comment.id ? 'w-auto opacity-100 pr-1' : 'w-0 opacity-0'}`}>
                                          {canEditComment(comment) && (
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingComment(comment); setEditCommentContent(comment.content); }} className="h-6 w-6 p-0 hover:bg-muted/80">
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          )}
                                          {canDeleteComment(comment) && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id, post.id)} className="h-6 w-6 p-0 hover:bg-muted/80">
                                              <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                          )}
                                        </div>

                                        {(canEditComment(comment) || canDeleteComment(comment)) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setActiveOptionsCommentId(activeOptionsCommentId === comment.id ? null : comment.id)}
                                            className={`h-6 w-6 p-0 rounded-full transition-transform duration-300 ${activeOptionsCommentId === comment.id ? 'rotate-90 bg-muted' : ''}`}
                                          >
                                            {activeOptionsCommentId === comment.id ? <X className="h-3 w-3" /> : <MoreHorizontal className="h-3 w-3" />}
                                          </Button>
                                        )}
                                      </div>

                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-3">
                                {!isAuthenticated && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Your name" value={commentGuestName} onChange={(e) => setCommentGuestName(e.target.value)} className="text-sm" />
                                    <Input placeholder="Your email" type="email" value={commentGuestEmail} onChange={(e) => setCommentGuestEmail(e.target.value)} className="text-sm" />
                                  </div>
                                )}
                                <div className="flex space-x-2">
                                  <Input placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)} />
                                  <Button onClick={() => handleAddComment(post.id)} size="icon"><Send className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Post</DialogTitle><DialogDescription>Update your post.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div>
              <div><Label>Content</Label><Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[100px]" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button><Button onClick={handleEditPost}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingComment} onOpenChange={() => setEditingComment(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Comment</DialogTitle></DialogHeader>
            <div><Label>Comment</Label><Textarea value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} /></div>
            <DialogFooter><Button variant="outline" onClick={() => setEditingComment(null)}>Cancel</Button><Button onClick={handleEditComment}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Report Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spam">Spam</SelectItem>
                    <SelectItem value="Harassment">Harassment</SelectItem>
                    <SelectItem value="Inappropriate Content">Inappropriate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea placeholder="Describe the issue..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cancel</Button><Button onClick={handleReport} variant="destructive">Submit</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
        <DarkModeToggle />
      </div>
    </TooltipProvider>
  );
};

export default Community;
