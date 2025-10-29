// FILE: src/services/notifications.service.js
import ApiService from './api.service';

export const notificationsService = {
  getUserNotifications: (userId) => {
    return ApiService.get(`/notifications/${userId}`);
  },

  getUnreadNotifications: (userId) => {
    return ApiService.get(`/notifications/${userId}/unread`);
  },

  markAsRead: (notificationId) => {
    return ApiService.put(`/notifications/${notificationId}/read`);
  }
};

export default notificationsService;

