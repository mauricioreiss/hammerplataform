import { Shield } from "lucide-react"
import { ChangePasswordForm } from "@/components/aluno/change-password-form"

export default function TrocarSenhaPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white">Troque sua senha</h1>
            <p className="text-zinc-400 text-sm text-center mt-2">
              Por seguranca, defina uma nova senha pessoal antes de continuar.
            </p>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
