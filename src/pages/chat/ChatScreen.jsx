import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Send, User, RefreshCw } from 'lucide-react';

const ChatScreen = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const isCustomer = user?.role === 'CUSTOMER' || user?.role === 'USER';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!isMounted) return;

      if (isCustomer) {
        await findAndConnectToPharmacist();
      } else {
        await fetchConversations();
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [isCustomer]);

  // Auto-refresh only when user is selected
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up auto-refresh if a user is selected
    if (selectedUser) {
      intervalRef.current = setInterval(() => {
        fetchMessages(selectedUser.id, true);
      }, 5000);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedUser?.id]); // Only depend on selectedUser.id

  const findAndConnectToPharmacist = async () => {
    try {
      setLoading(true);
      const pharmacist = await ApiService.get('/chat/pharmacist');
      console.log('Found pharmacist:', pharmacist);
      setSelectedUser(pharmacist);
      await fetchMessages(pharmacist.id);
    } catch (error) {
      console.error('Error finding pharmacist:', error);
      showError('No pharmacist available at the moment');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await ApiService.get('/chat/conversations');
      console.log('Conversations data:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      showError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId, silent = false) => {
    try {
      const data = await ApiService.get(`/chat/conversation/${otherUserId}`);
      setMessages(data || []);
    } catch (error) {
      if (!silent) {
        console.error('Error fetching messages:', error);
        showError('Failed to load messages');
      }
      setMessages([]);
    }
  };

  const handleUserSelect = async (conv) => {
    setSelectedUser(conv);
    await fetchMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    const messageText = newMessage;
    setNewMessage('');

    try {
      await ApiService.post('/chat/send', {
        receiverId: selectedUser.id,
        message: messageText
      });
      await fetchMessages(selectedUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedUser) {
      await fetchMessages(selectedUser.id);
    }
    if (!isCustomer) {
      await fetchConversations();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Chat</h1>
          <p className="text-gray-600 text-sm mt-1">
            {isCustomer ? 'Chat with our pharmacy team' : 'Manage customer conversations'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="secondary">
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="h-[calc(100vh-250px)] flex gap-4">
        {/* Conversation List - Only for Admin/Pharmacist */}
        {!isCustomer && (
          <Card className="w-1/3 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Conversations</h2>
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleUserSelect(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === conv.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {conv.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{conv.fullName}</p>
                        <p className="text-sm text-gray-500">{conv.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Chat Area */}
        <Card className={`${isCustomer ? 'w-full' : 'flex-1'} flex flex-col`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h2>
                    <p className="text-sm text-gray-500">{selectedUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-xs">
                          {!isFromMe && (
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                              {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isFromMe
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                              }`}
                            >
                              <p>{msg.message}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          {isFromMe && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <User className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-lg">
                  {isCustomer ? 'Loading chat...' : 'Select a conversation to start chatting'}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatScreen;