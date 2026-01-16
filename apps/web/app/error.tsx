"use client"

import { useEffect } from "react"
import { ErrorModal } from "@/components/error-modal"

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App route error:", error)
  }, [error])

  return (
    <ErrorModal
      title="Something broke"
      description="A runtime error occurred while rendering this page."
      errorMessage={error?.message}
      onRetry={reset}
      onReload={() => window.location.reload()}
    />
  )
}
