import webpush from "web-push";
import { IPushService } from "@/core/application/interfaces/push.service";
import { PushSubscriptionData } from "@/core/application/interfaces/notification.repository";

export class WebPushService implements IPushService {
  constructor() {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (vapidPublic && vapidPrivate && vapidSubject) {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    }
  }

  async sendPush(subscription: PushSubscriptionData, title: string, message: string): Promise<void> {
    const payload = JSON.stringify({
      title,
      body: message,
      url: "/",
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
        payload
      );
    } catch (err: any) {
      if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 410) {
        throw new Error("EXPIRED_SUBSCRIPTION");
      }
      throw err;
    }
  }
}
