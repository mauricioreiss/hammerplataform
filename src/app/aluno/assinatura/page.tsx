import { PaymentManager } from "@/components/aluno/payment-manager"
import { currentUser } from "@/lib/mock-data"

export default function AssinaturaPage() {
  return <PaymentManager user={currentUser} />
}
