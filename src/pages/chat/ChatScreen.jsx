import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ApiService from '../../services/api.service';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Send, User, UserPlus } from 'lucide-react';

const ChatScreen = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isCustomer = user?.role === 'CUSTOMER' || user?.role === 'USER';

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

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

  const findPharmacist = async () => {
    try {
      const pharmacist = await ApiService.get('/chat/pharmacist');
      console.log('Found pharmacist:', pharmacist);
      setSelectedUser(pharmacist);
      success('Connected to pharmacist/admin');
    } catch (error) {
      console.error('Error finding pharmacist:', error);
      showError('No pharmacist available at the moment');
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const data = await ApiService.get(`/chat/conversation/${otherUserId}`);
      console.log('Messages data:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages');
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await ApiService.post('/chat/send', {
        receiverId: selectedUser.id,
        message: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
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
        <h1 className="text-3xl font-bold text-gray-800">Chat</h1>
        {isCustomer && conversations.length === 0 && (
          <Button onClick={findPharmacist}>
            <UserPlus size={18} className="mr-2" />
            Connect with Pharmacist
          </Button>
        )}
      </div>

      <div className="h-[calc(100vh-250px)] flex gap-4">
        <Card className="w-1/3 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 text-sm mb-4">No conversations yet</p>
              {isCustomer && (
                <Button size="sm" onClick={findPharmacist}>
                  Start Chat with Pharmacist
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedUser(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === conv.id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
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

        <Card className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
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

              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <Button onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <User className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-lg">Select a conversation to start chatting</p>
                {isCustomer && conversations.length === 0 && (
                  <Button className="mt-4" onClick={findPharmacist}>
                    Connect with Pharmacist
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatScreen;