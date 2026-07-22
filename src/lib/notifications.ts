export type NotificationCategory = 'order' | 'offer' | 'negotiation';
export type NotificationActor = 'seller' | 'buyer' | 'system';
export type NotificationStatus = 'pending' | 'accepted' | 'countered' | 'declined' | 'rejected' | 'read' | 'timed-out';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  relatedId?: string;
  actor: NotificationActor;
  status: NotificationStatus;
  createdAt: string;
  read: boolean;
}

export function createNotification(input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
  return {
    id: `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  };
}

export function addNotification(notifications: AppNotification[], notification: AppNotification): AppNotification[] {
  return [notification, ...notifications].slice(0, 20);
}

export function markNotificationRead(notifications: AppNotification[], id: string): AppNotification[] {
  return notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true, status: 'read' } : notification
  );
}

export function markAllNotificationsRead(notifications: AppNotification[]): AppNotification[] {
  return notifications.map((notification) => ({ ...notification, read: true, status: 'read' }));
}

export function getUnreadNotificationCount(notifications: AppNotification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}
