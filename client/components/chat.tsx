'use client';

import * as React from "react";
import { Send, FileText, User, Bot, Loader2, Menu } from "lucide-react";

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface MessageType {
    role: 'user' | 'assistant';
    content?: string;
    docs?: Doc[];
}

interface ChatCompProps {
    onMenuClick?: () => void;
}

const ChatComp: React.FC<ChatCompProps> = ({ onMenuClick }) => {
    const [message, setMessage] = React.useState<string>('');
    const [messageHistory, setMessageHistory] = React.useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messageHistory, isLoading]);

    const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;
        const currentMessage = message;
        setMessage('');
        setMessageHistory((prev) => [...prev, { role: 'user', content: currentMessage }]);
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/chat?message=${encodeURIComponent(currentMessage)}`);
            const data = await res.json();
            setMessageHistory((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.message,
                    docs: data?.docs,
                },
            ]);
        } catch (err) {
            setMessageHistory((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Something went wrong. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fefae0] p-3 sm:p-4 md:p-6">
            <div className="mb-3 md:mb-4 bg-[#ffd60a] border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden flex-shrink-0 bg-white border-[3px] border-black w-10 h-10 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                        aria-label="Open upload panel"
                    >
                        <Menu className="w-5 h-5" strokeWidth={3} />
                    </button>
                )}
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black truncate">
                        PDF Chat
                    </h1>
                    <p className="text-xs md:text-sm font-bold text-black/80 mt-0.5 md:mt-1 hidden sm:block">
                        Ask anything about your uploaded document
                    </p>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-white border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-3 md:mb-4 space-y-3 md:space-y-4"
            >
                {messageHistory.length === 0 && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className="bg-[#90e0ef] border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                            <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" strokeWidth={3} />
                            <p className="font-black uppercase text-base md:text-lg">No messages yet</p>
                            <p className="font-bold text-xs md:text-sm">Type a question to get started</p>
                        </div>
                    </div>
                )}

                {messageHistory.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2 md:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#06d6a0] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                <Bot className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                            </div>
                        )}

                        <div className={`max-w-[80%] md:max-w-[75%] min-w-0 ${msg.role === 'user' ? 'order-1' : ''}`}>
                            <div
                                className={`border-4 border-black p-2.5 md:p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                    msg.role === 'user'
                                        ? 'bg-[#ff006e] text-white'
                                        : 'bg-[#caf0f8] text-black'
                                }`}
                            >
                                <p className="font-medium whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
                                    {msg.content}
                                </p>
                            </div>

                            {msg.role === 'assistant' && msg.docs && msg.docs.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="font-black uppercase text-[10px] md:text-xs tracking-wider">
                                        Sources ({msg.docs.length})
                                    </p>
                                    {msg.docs.map((doc, idx) => {
                                        const source = doc.metadata?.source?.split(/[\\/]/).pop() ?? 'document';
                                        const page = doc.metadata?.loc?.pageNumber;
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-[#fdf0d5] border-[3px] border-black p-2 md:p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                            >
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" strokeWidth={3} />
                                                    <span className="font-black text-[10px] md:text-xs uppercase truncate min-w-0">
                                                        {source}
                                                    </span>
                                                    {page !== undefined && (
                                                        <span className="bg-black text-white text-[9px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 uppercase">
                                                            Page {page}
                                                        </span>
                                                    )}
                                                </div>
                                                {doc.pageContent && (
                                                    <p className="text-[11px] md:text-xs font-medium text-black/80 line-clamp-3 leading-snug">
                                                        {doc.pageContent}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#ffb703] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] order-2">
                                <User className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 md:gap-3 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-[#06d6a0] border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <Bot className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                        </div>
                        <div className="bg-[#caf0f8] border-4 border-black p-2.5 md:p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                            <span className="font-black uppercase text-xs md:text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 md:gap-3">
                <input
                    type="text"
                    placeholder="Write your query..."
                    className="flex-1 min-w-0 bg-white border-4 border-black px-3 md:px-4 py-2.5 md:py-3 font-bold text-sm md:text-base placeholder:text-black/50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="flex-shrink-0 bg-[#8338ec] text-white border-4 border-black px-3 md:px-6 py-2.5 md:py-3 font-black uppercase tracking-wide text-sm md:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span className="hidden sm:inline">Send</span>
                    <Send className="w-4 h-4" strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default ChatComp;
