import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => {
    console.log('Adding notification:', notification);
    set((state) => {
      const newUnreadCount = state.unreadCount + 1;
      console.log('New unread count:', newUnreadCount);
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: newUnreadCount,
      };
    });
  },
  
  markAsRead: (notificationId) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      const newUnreadCount = Math.max(0, state.unreadCount - 1);
      console.log('Marking as read, new count:', newUnreadCount);
      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },
  
  markAllAsRead: () => {
    console.log('Marking all as read');
    set((state) => ({
      notifications: state.notifications.map(notif => ({ ...notif, read: true })),
      unreadCount: 0,
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
  
  setUnreadCount: (count) => {
    console.log('Setting unread count to:', count);
    set({ unreadCount: count });
  },
})); 