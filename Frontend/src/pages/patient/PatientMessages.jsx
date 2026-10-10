import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientMessages = () => {
  const { user, API_BASE_URL } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/conversations`);
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          setActiveConv(res.data.conversations[0]);
          fetchMessages(res.data.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/messages/${convId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !activeConv) return;

    const recipientId = user.role === 'PATIENT' ? activeConv.therapistId?._id : activeConv.patientId?._id;

    try {
      const res = await axios.post(`${API_BASE_URL}/messages/send`, {
        recipientId,
        content: newText,
      });

      if (res.data.success) {
        setMessages([...messages, res.data.message]);
        setNewText('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const otherUser = activeConv
    ? user.role === 'PATIENT'
      ? activeConv.therapistId
      : activeConv.patientId
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Therapist Communication</h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct messaging with your assigned clinical specialist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[560px]">
        {/* Conversations List */}
        <Card className="p-0 border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-700">
            Conversations
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No active chats</p>
            ) : (
              conversations.map((conv) => {
                const partner = user.role === 'PATIENT' ? conv.therapistId : conv.patientId;
                const isSelected = activeConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveConv(conv);
                      fetchMessages(conv._id);
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isSelected ? 'bg-sky-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Avatar src={partner?.avatar} name={partner?.name} size="md" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{partner?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Active Chat Thread */}
        <Card className="md:col-span-2 p-0 border-slate-200 flex flex-col justify-between">
          {activeConv && otherUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <Avatar src={otherUser?.avatar} name={otherUser?.name} size="sm" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{otherUser?.name}</h4>
                  <p className="text-[10px] text-sky-600 font-semibold">{otherUser?.email}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/30">
                {messages.map((m) => {
                  const isMe = m.senderId === user.id || m.senderId === user._id;
                  return (
                    <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-xs shadow-2xs ${
                          isMe
                            ? 'bg-sky-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span className={`text-[9px] block mt-1 ${isMe ? 'text-sky-200' : 'text-slate-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type a message to your therapist..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Button variant="primary" type="submit" icon={Send} size="sm">
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientMessages;
