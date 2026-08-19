import { PaymentManager } from "@/components/aluno/payment-manager";
import { getCurrentUser, getAdminPixKey } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function AssinaturaPage() {
  const [user, pixKey] = await Promise.all([
    getCurrentUser(),
    getAdminPixKey(),
  ]);
  if (!user) redirect("/login");

  return <PaymentManager user={user} pixKey={pixKey} />;
}
