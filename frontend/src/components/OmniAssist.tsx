import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isEscalated?: boolean;
}

interface ChatState {
    isOpen: boolean;
    isLoading: boolean;
    messages: Message[];
    sessionId: number | null;
    guestSessionId: string | null;
    isEscalated: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function OmniAssist() {
    const [state, setState] = useState<ChatState>({
        isOpen: false,
        isLoading: false,
        messages: [],
        sessionId: null,
        guestSessionId: null,
        isEscalated: false,
    });
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (state.isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [state.isOpen]);

    // Load existing session on mount
    useEffect(() => {
        const stored = localStorage.getItem('omni_assist_session');
        if (stored) {
            try {
                const { guestSessionId, sessionId } = JSON.parse(stored);
                setState(prev => ({ ...prev, guestSessionId, sessionId }));
            } catch (e) {
                console.error('Failed to load session:', e);
            }
        }
    }, []);

    const toggleChat = () => {
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }));

        // Add welcome message on first open
        if (!state.isOpen && state.messages.length === 0) {
            setState(prev => ({
                ...prev,
                isOpen: true,
                messages: [{
                    id: 'welcome',
                    role: 'assistant',
                    content: "👋 Hello! I'm Omni Assist, your AI support assistant. How can I help you today?",
                    timestamp: new Date(),
                }]
            }));
        }
    };

    const sendMessage = useCallback(async () => {
        if (!inputValue.trim() || state.isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isLoading: true,
        }));
        setInputValue('');

        try {
            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const body: Record<string, unknown> = {
                message: userMessage.content,
            };
            if (state.sessionId) {
                body.session_id = state.sessionId;
            }
            if (state.guestSessionId) {
                body.guest_session_id = state.guestSessionId;
            }

            const response = await fetch(`${API_BASE}/api/omni-assist/chat/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Save session info
            const sessionInfo = {
                sessionId: data.session_id,
                guestSessionId: data.guest_session_id || state.guestSessionId,
            };
            localStorage.setItem('omni_assist_session', JSON.stringify(sessionInfo));

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                isEscalated: data.escalated,
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                sessionId: data.session_id,
                guestSessionId: data.guest_session_id || prev.guestSessionId,
                isEscalated: data.escalated || prev.isEscalated,
                isLoading: false,
            }));

        } catch (error) {
            console.error('Chat error:', error);
            toast({
                title: 'Connection Error',
                description: 'Failed to send message. Please try again.',
                variant: 'destructive',
            });
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [inputValue, state.isLoading, state.sessionId, state.guestSessionId, toast]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Bubble */}
            <div className="fixed bottom-6 right-6 z-50">
                {!state.isOpen && (
                    <Button
                        onClick={toggleChat}
                        size="lg"
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </Button>
                )}
            </div>

            {/* Chat Window */}
            {state.isOpen && (
                <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] z-50 flex flex-col shadow-2xl border-0 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Omni Assist</h3>
                                <p className="text-xs text-white/80">AI Support Assistant</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleChat}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Escalation Banner */}
                    {state.isEscalated && (
                        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs text-yellow-700 dark:text-yellow-400">
                                This chat has been forwarded to our support team
                            </span>
                        </div>
                    )}

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {state.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''
                                        }`}
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback
                                            className={
                                                message.role === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                            }
                                        >
                                            {message.role === 'user' ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Bot className="h-4 w-4" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : message.isEscalated
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-foreground rounded-tl-sm border border-yellow-300 dark:border-yellow-700'
                                                    : 'bg-muted rounded-tl-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <span
                                            className={`text-[10px] mt-1 block ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                                                }`}
                                        >
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {state.isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-background">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={state.isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || state.isLoading}
                                size="icon"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Powered by Omni Assist AI
                        </p>
                    </div>
                </Card>
            )}
        </>
    );
}

export default OmniAssist;
