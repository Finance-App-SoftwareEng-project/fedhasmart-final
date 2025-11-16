/**
 * Notification Context
 * 
 * Provides real-time notifications for financial activities using Supabase real-time subscriptions.
 * 
 * Features:
 * - Real-time notifications for expenses, income, and goals
 * - Notification management (mark as read, clear all)
 * - Unread count tracking
 * - Automatic cleanup of subscriptions
 * 
 * Uses Supabase real-time to listen for database changes and create notifications
 * when new records are inserted.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './UnifiedAuthContext';

/**
 * Notification interface
 * Represents a single notification in the system
 */
export interface Notification {
  id: string; // Unique identifier
  type: 'expense' | 'income' | 'goal' | 'budget' | 'report'; // Notification category
  title: string; // Notification title
  message: string; // Notification message/content
  timestamp: Date; // When the notification was created
  read: boolean; // Whether the notification has been read
}

/**
 * Notification context interface
 * Provides notification state and management methods
 */
interface NotificationContextType {
  notifications: Notification[]; // All notifications
  unreadCount: number; // Count of unread notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void; // Add new notification
  markAsRead: (id: string) => void; // Mark specific notification as read
  markAllAsRead: () => void; // Mark all notifications as read
  clearAll: () => void; // Clear all notifications
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider Component
 * 
 * Sets up real-time subscriptions to database changes and manages notification state.
 * Automatically creates notifications when new expenses, income, or goals are added.
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUnifiedAuth();

  /**
   * Set up real-time subscriptions for database changes
   * 
   * Listens for INSERT events on expenses, income, and goals tables.
   * Creates notifications automatically when new records are added.
   * 
   * Only subscribes when user is authenticated.
   */
  useEffect(() => {
    if (!user) return;

    // Subscribe to expenses table changes
    // Creates notification when new expense is added
    const expensesSubscription = supabase
      .channel('expenses-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'expenses' },
        (payload) => {
          addNotification({
            type: 'expense',
            title: 'New Expense Added',
            message: `Expense of KES ${payload.new.amount} for ${payload.new.category}`,
          });
        }
      )
      .subscribe();

    // Subscribe to income table changes
    // Creates notification when new income is added
    const incomeSubscription = supabase
      .channel('income-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'income' },
        (payload) => {
          addNotification({
            type: 'income',
            title: 'New Income Added',
            message: `Income of KES ${payload.new.amount} from ${payload.new.source}`,
          });
        }
      )
      .subscribe();

    // Subscribe to goals table changes
    // Creates notification when new goal is created
    const goalsSubscription = supabase
      .channel('goals-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'goals' },
        (payload) => {
          addNotification({
            type: 'goal',
            title: 'New Goal Created',
            message: `Goal "${payload.new.name}" with target KES ${payload.new.target_amount}`,
          });
        }
      )
      .subscribe();

    // Cleanup: unsubscribe from all channels when component unmounts or user changes
    return () => {
      expensesSubscription.unsubscribe();
      incomeSubscription.unsubscribe();
      goalsSubscription.unsubscribe();
    };
  }, [user]);

  /**
   * Add a new notification
   * 
   * Creates a notification with auto-generated ID, timestamp, and unread status.
   * Adds it to the beginning of the notifications array (most recent first).
   * 
   * @param notification - Notification data (without id, timestamp, read)
   */
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(), // Use timestamp as unique ID
      timestamp: new Date(),
      read: false, // New notifications are unread by default
    };
    // Add to beginning of array (most recent first)
    setNotifications((prev) => [newNotification, ...prev]);
  };

  /**
   * Mark a specific notification as read
   * 
   * @param id - Notification ID to mark as read
   */
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  /**
   * Mark all notifications as read
   * Useful for "mark all as read" functionality
   */
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  /**
   * Clear all notifications
   * Removes all notifications from the list
   */
  const clearAll = () => {
    setNotifications([]);
  };

  // Calculate unread notification count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
