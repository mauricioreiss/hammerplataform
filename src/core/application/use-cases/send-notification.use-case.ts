import { INotificationRepository } from "@/core/application/interfaces/notification.repository";
import { IPushService } from "@/core/application/interfaces/push.service";

export class SendNotificationUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly pushService: IPushService
  ) {}

  async execute(userId: string, title: string, message: string): Promise<void> {
    try {
      // 1. Salva no banco de dados
      await this.notificationRepository.insertNotification(userId, title, message);

      // 2. Busca assinaturas de push do usuario
      const subs = await this.notificationRepository.getPushSubscriptions(userId);

      // 3. Envia o push para cada assinatura
      if (subs && subs.length > 0) {
        await Promise.allSettled(
          subs.map(async (sub) => {
            try {
              await this.pushService.sendPush(sub, title, message);
            } catch (err: any) {
              if (err.message === "EXPIRED_SUBSCRIPTION") {
                await this.notificationRepository.removePushSubscription(sub.endpoint);
              }
            }
          })
        );
      }
    } catch (error) {
      console.error("Erro ao enviar notificacao (SendNotificationUseCase):", error);
      // Non-blocking: falha no push ou notificacao nao deve quebrar a aplicacao
    }
  }
}
