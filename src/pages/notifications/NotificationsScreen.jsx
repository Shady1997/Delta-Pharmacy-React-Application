// FILE: src/pages/notifications/NotificationsScreen.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificationsService } from '../../services/notifications.service';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/helpers';

export const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow p-6 ${
              !notification.read ? 'border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600 mt-2">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;