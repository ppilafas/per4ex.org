"use client"

import { useEffect } from "react"
import { ErrorModal } from "@/components/error-modal"

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error("Global app error:", error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorModal
          title="Critical error"
          description="The application encountered a critical error and needs to reload."
          errorMessage={error?.message}
          onReload={() => window.location.reload()}
        />
      </body>
    </html>
  )
}
