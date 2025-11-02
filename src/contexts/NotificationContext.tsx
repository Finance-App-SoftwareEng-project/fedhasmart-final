import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './UnifiedAuthContext';

export interface Notification {
  id: string;
  type: 'expense' | 'income' | 'goal' | 'budget' | 'report';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useUnifiedAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to expenses
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

    // Subscribe to income
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

    // Subscribe to goals
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

    return () => {
      expensesSubscription.unsubscribe();
      incomeSubscription.unsubscribe();
      goalsSubscription.unsubscribe();
    };
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

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
