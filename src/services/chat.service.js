// FILE: src/services/chat.service.js
import ApiService from './api.service';

export const chatService = {
  getPharmacist: () => {
    return ApiService.get('/chat/pharmacist');
  },

  getConversation: (userId) => {
    return ApiService.get(`/chat/conversation/${userId}`);
  },

  sendMessage: (receiverId, message) => {
    return ApiService.post('/chat/send', { receiverId, message });
  },

  getConversations: () => {
    return ApiService.get('/chat/conversations');
  },

  markAsRead: (messageId) => {
    return ApiService.put(`/chat/read/${messageId}`);
  }
};

export default chatService;

