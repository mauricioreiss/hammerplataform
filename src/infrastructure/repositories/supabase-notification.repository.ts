import { createAdminClient } from "@/lib/supabase/admin";
import { INotificationRepository, PushSubscriptionData } from "@/core/application/interfaces/notification.repository";

export class SupabaseNotificationRepository implements INotificationRepository {
  async insertNotification(userId: string, title: string, message: string): Promise<void> {
    const admin = createAdminClient();
    await admin.from("notifications").insert({ user_id: userId, title, message });
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscriptionData[]> {
    const admin = createAdminClient();
    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error || !subs) return [];

    return subs.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
  }

  async savePushSubscription(userId: string, sub: PushSubscriptionData): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  async removePushSubscription(endpoint: string): Promise<void> {
    const admin = createAdminClient();
    await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  }

  async removePushSubscriptionByUserIdAndEndpoint(userId: string, endpoint: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
