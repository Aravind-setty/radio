import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button'; // Assuming you have a Button component
import { Send } from 'lucide-react';

interface ChatMessage {
    id: string;
    content: string;
    user: {
        username: string;
    };
    createdAt: string;
}

interface ChatProps {
    streamId: string;
}

export default function Chat({ streamId }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const user = useAuthStore((state) => state.user);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        // 1. Fetch History
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${streamId}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to load chat history', err);
            }
        };
        fetchHistory();

        // 2. Connect to Socket Server (Relative path for Nginx)
        socketRef.current = io('/', {
            path: '/socket.io',
            transports: ['websocket'],
            auth: { token }
        });

        // 3. Join Room
        socketRef.current.emit('join_stream_chat', { streamId });

        // 4. Listen for messages
        socketRef.current.on('chat_message', (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_stream_chat', { streamId });
                socketRef.current.disconnect();
            }
        };
    }, [streamId]);

    useEffect(() => {
        // Auto-scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !socketRef.current) return;

        const payload = {
            streamId,
            userId: user.id, // In prod, backend extracts from JWT
            content: newMessage
        };

        socketRef.current.emit('send_message', payload);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-80">
            <div className="p-4 border-b border-gray-800">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    Chat Room
                    <span className="text-xs font-normal text-green-500 bg-green-900/30 px-2 py-0.5 rounded-full">Live</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col">
                        <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                            {msg.user.username}
                            <span className="text-[10px] font-normal text-gray-600 ml-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </span>
                        <span className="text-sm text-gray-200 break-words bg-gray-800/50 p-2 rounded-lg mt-1 inline-block">
                            {msg.content}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Say something..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                />
                <Button type="submit" size="icon" variant="default" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
