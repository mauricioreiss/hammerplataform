export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface INotificationRepository {
  insertNotification(userId: string, title: string, message: string): Promise<void>;
  getPushSubscriptions(userId: string): Promise<PushSubscriptionData[]>;
  savePushSubscription(userId: string, sub: PushSubscriptionData): Promise<void>;
  removePushSubscription(endpoint: string): Promise<void>;
  removePushSubscriptionByUserIdAndEndpoint(userId: string, endpoint: string): Promise<void>;
}
