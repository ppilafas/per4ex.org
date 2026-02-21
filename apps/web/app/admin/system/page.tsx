import { AdminAISettings } from "@/components/admin-ai-settings"
import { AdminChatLog } from "@/components/admin-chat-log"
import { AdminLoginForm } from "@/components/admin-login-form"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAISettings } from "@/lib/ai-config"
import { getSystemInstructions } from "@/lib/system-instructions"

export const dynamic = "force-dynamic"

export default async function AdminSystemPage() {
  const authenticated = await isAdminAuthenticated()

  if (!authenticated) {
    return <AdminLoginForm />
  }

  const settings = await getAISettings()
  const systemInstructions = await getSystemInstructions()

  return (
    <div className="space-y-6">
      <AdminAISettings initialSettings={settings} initialSystemInstructions={systemInstructions} />
      <AdminChatLog />
    </div>
  )
}
