import { PushSubscriptionData } from "@/core/application/interfaces/notification.repository";

export interface IPushService {
  sendPush(subscription: PushSubscriptionData, title: string, message: string): Promise<void>;
}
