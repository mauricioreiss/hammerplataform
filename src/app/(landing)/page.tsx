import { redirect } from "next/navigation";
import { getCurrentUser, getPublicPlans } from "@/app/actions";
import { SalesFunnel } from "@/components/landing/sales-funnel";

export default async function LandingPage() {
  const [user, plans] = await Promise.all([getCurrentUser(), getPublicPlans()]);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/aluno");
  }

  return <SalesFunnel plans={plans} />;
}
