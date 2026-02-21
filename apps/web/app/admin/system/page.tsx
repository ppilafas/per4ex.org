import { AdminAISettings } from "@/components/admin-ai-settings"
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

  return <AdminAISettings initialSettings={settings} initialSystemInstructions={systemInstructions} />
}
