import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    Bot,
    MessageSquare,
    AlertTriangle,
    FileText,
    Send,
    RefreshCw,
    ChevronRight,
    Sparkles,
    BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
    id: number;
    user: string;
    status: 'active' | 'escalated' | 'closed';
    escalation_reason: string;
    escalated_at: string | null;
    message_count: number;
    created_at: string;
    updated_at: string;
}

interface ChatMessage {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface Analytics {
    period_days: number;
    sessions: {
        total: number;
        active: number;
        escalated: number;
        closed: number;
        escalation_rate: number;
    };
    messages: {
        total: number;
        from_users: number;
        from_assistant: number;
    };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function AdminAITools() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [summary, setSummary] = useState<string>('');
    const [draftReply, setDraftReply] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'sessions' | 'analytics'>('sessions');
    const { toast } = useToast();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        };
    };

    useEffect(() => {
        fetchSessions();
        fetchAnalytics();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/omni-assist/admin/sessions/?status=all`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/omni-assist/admin/analytics/?days=7`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    };

    const fetchSessionDetail = async (sessionId: number) => {
        try {
            const response = await fetch(`${API_BASE}/api/omni-assist/admin/sessions/${sessionId}/`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch session detail:', error);
        }
    };

    const handleSelectSession = (session: ChatSession) => {
        setSelectedSession(session);
        setSummary('');
        setDraftReply('');
        fetchSessionDetail(session.id);
    };

    const handleSummarize = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/api/omni-assist/admin/sessions/${selectedSession.id}/summarize/`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                }
            );
            if (response.ok) {
                const data = await response.json();
                setSummary(data.summary || 'No summary available.');
                toast({ title: 'Summary Generated', description: 'AI summary is ready.' });
            } else {
                toast({ title: 'Error', description: 'Failed to generate summary.', variant: 'destructive' });
            }
        } catch (error) {
            console.error('Summarization error:', error);
            toast({ title: 'Error', description: 'Failed to generate summary.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDraftReply = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/api/omni-assist/admin/sessions/${selectedSession.id}/draft-reply/`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                }
            );
            if (response.ok) {
                const data = await response.json();
                setDraftReply(data.draft || '');
                toast({ title: 'Draft Created', description: 'AI draft reply is ready for review.' });
            } else {
                toast({ title: 'Error', description: 'Failed to generate draft.', variant: 'destructive' });
            }
        } catch (error) {
            console.error('Draft reply error:', error);
            toast({ title: 'Error', description: 'Failed to generate draft.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignToMe = async () => {
        if (!selectedSession) return;
        try {
            const response = await fetch(
                `${API_BASE}/api/omni-assist/admin/sessions/${selectedSession.id}/assign/`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                }
            );
            if (response.ok) {
                toast({ title: 'Assigned', description: 'Session assigned to you.' });
                fetchSessions();
            }
        } catch (error) {
            console.error('Assignment error:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'escalated':
                return <Badge className="bg-yellow-500/20 text-yellow-600">Escalated</Badge>;
            case 'active':
                return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
            case 'closed':
                return <Badge className="bg-gray-500/20 text-gray-600">Closed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with tabs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-purple-500" />
                        <h2 className="text-xl font-semibold">Omni Assist AI Tools</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === 'sessions' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('sessions')}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Sessions
                        </Button>
                        <Button
                            variant={activeTab === 'analytics' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSessions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {activeTab === 'analytics' && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analytics.sessions.total}</div>
                            <p className="text-sm text-muted-foreground">Total Sessions (7d)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{analytics.sessions.escalated}</div>
                            <p className="text-sm text-muted-foreground">Escalated</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analytics.sessions.escalation_rate}%</div>
                            <p className="text-sm text-muted-foreground">Escalation Rate</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analytics.messages.total}</div>
                            <p className="text-sm text-muted-foreground">Total Messages</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sessions List */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                AI Chat Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                {sessions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground p-4">No AI chat sessions yet.</p>
                                ) : (
                                    sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => handleSelectSession(session)}
                                            className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition ${selectedSession?.id === session.id ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm truncate">{session.user}</span>
                                                {getStatusBadge(session.status)}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                                <span>{session.message_count} messages</span>
                                                <ChevronRight className="h-3 w-3" />
                                            </div>
                                            {session.escalation_reason && (
                                                <p className="text-xs text-yellow-600 mt-1 truncate">
                                                    {session.escalation_reason}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Session Detail */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">
                                {selectedSession ? `Chat with ${selectedSession.user}` : 'Select a session'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedSession ? (
                                <div className="space-y-4">
                                    {/* Action buttons */}
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" onClick={handleSummarize} disabled={loading}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Summarize
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleDraftReply} disabled={loading}>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Draft Reply
                                        </Button>
                                        {selectedSession.status === 'escalated' && (
                                            <Button size="sm" variant="secondary" onClick={handleAssignToMe}>
                                                Assign to Me
                                            </Button>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <ScrollArea className="h-[200px] border rounded-lg p-4 bg-muted/30">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`mb-3 ${msg.role === 'user' ? 'text-right' : ''}`}
                                            >
                                                <span
                                                    className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.role === 'user'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-background border'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </span>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        ))}
                                    </ScrollArea>

                                    {/* Summary */}
                                    {summary && (
                                        <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                                            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                                                <FileText className="h-4 w-4" />
                                                AI Summary
                                            </h4>
                                            <p className="text-sm whitespace-pre-wrap">{summary}</p>
                                        </div>
                                    )}

                                    {/* Draft Reply */}
                                    {draftReply && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-sm flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                Draft Reply (edit before sending)
                                            </h4>
                                            <Textarea
                                                value={draftReply}
                                                onChange={(e) => setDraftReply(e.target.value)}
                                                rows={4}
                                                className="resize-none"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Reply
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setDraftReply('')}>
                                                    Discard
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    <p>Select a session from the list to view details</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default AdminAITools;
