import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import axiosInstance from '../../utils/axiosInstance'; // ← shared instance (withCredentials)

const AIChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const messagesEndRef = useRef(null);
    const historyFetched = useRef(false);

    // Auto-scroll on new messages
    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Fetch history once when chat opens
    useEffect(() => {
        if (user && isOpen && !historyFetched.current) {
            historyFetched.current = true;
            fetchHistory();
        }
    }, [user, isOpen]);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('/ai/chat-history');
            if (res.data.success && res.data.messages.length > 0) {
                setMessages(res.data.messages);
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };

    const handleSend = async () => {
        if (!inputMsg.trim() || loading) return;

        const userMessage = inputMsg.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputMsg('');
        setLoading(true);

        try {
            const res = await axiosInstance.post('/ai/chat', { message: userMessage });
            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: err.response?.status === 401
                        ? 'Please log in to use the AI assistant.'
                        : 'Sorry, I\'m having trouble connecting. Please try again shortly.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-gray-800 w-80 md:w-96 h-[520px] max-h-[80vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">

                    {/* Header */}
                    <div className="bg-yellow-400 dark:bg-yellow-500 p-4 flex justify-between items-center text-black flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            <div>
                                <h3 className="font-semibold text-base leading-tight">AI Career Assistant</h3>
                                <p className="text-xs opacity-75">Powered by Gemini</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-yellow-500 dark:hover:bg-yellow-600 p-1 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                        {messages.length === 0 && !loading && (
                            <div className="text-center text-sm text-gray-500 mt-10">
                                <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">Hi {user?.fullname?.split(' ')[0] || 'there'}! 👋</p>
                                <p className="mt-1 opacity-75">Ask me about jobs, resumes, or interview tips.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 text-black mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                                        msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-tl-none shadow-sm prose prose-sm dark:prose-invert max-w-none'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 text-black">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl px-4 py-3 rounded-tl-none shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                disabled={loading}
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !inputMsg.trim()}
                                className="w-9 h-9 flex items-center justify-center bg-yellow-400 text-black rounded-full hover:bg-yellow-500 disabled:opacity-50 flex-shrink-0 transition-colors"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-yellow-400 text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
                    title="Open AI Assistant"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}
        </div>
    );
};

export default AIChatbotWidget;
