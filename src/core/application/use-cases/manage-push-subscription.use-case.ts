import { INotificationRepository, PushSubscriptionData } from "@/core/application/interfaces/notification.repository";

export class ManagePushSubscriptionUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async subscribe(userId: string, subscription: PushSubscriptionData): Promise<void> {
    await this.notificationRepository.savePushSubscription(userId, subscription);
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.notificationRepository.removePushSubscriptionByUserIdAndEndpoint(userId, endpoint);
  }
}
