"use client"

import dynamic from "next/dynamic"

const BootLoader = dynamic(
  () => import("@/components/boot-loader").then((m) => m.BootLoader),
  { ssr: false, loading: () => null }
)

const AssistantWidget = dynamic(
  () => import("@/components/assistant-widget").then((m) => m.AssistantWidget),
  { ssr: false, loading: () => null }
)

export function ClientBootLoader() {
  return <BootLoader />
}

export function ClientWidgets() {
  return <AssistantWidget />
}
