"use client"

import dynamic from "next/dynamic"

const BootLoader = dynamic(
  () => import("@/components/boot-loader").then((m) => m.BootLoader),
  { ssr: false, loading: () => null }
)

const ChatWidget = dynamic(
  () => import("@/components/chat-widget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null }
)

const LiveShowPiP = dynamic(
  () => import("@/components/live-show-pip").then((m) => m.LiveShowPiP),
  { ssr: false, loading: () => null }
)

export function ClientBootLoader() {
  return <BootLoader />
}

export function ClientWidgets() {
  return (
    <>
      <ChatWidget />
      <LiveShowPiP />
    </>
  )
}
