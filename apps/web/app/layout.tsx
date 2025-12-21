import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { BootLoader } from "@/components/boot-loader";
import { ChatWidget } from "@/components/chat-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Per4ex.org | Systems Engineer",
  description: "Systems-focused portfolio for AI-related ecosystems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row bg-background text-foreground`}
      >
        <BootLoader />
        <Sidebar />
        <MobileNav />
        <main className="flex-1 md:pl-[280px] w-full min-h-screen flex flex-col pt-16 md:pt-0">
           <div className="max-w-[1100px] w-full px-6 md:px-10 py-8 md:py-12 flex-1 mx-auto">
             {children}
             <Footer />
           </div>
        </main>
        {process.env.NODE_ENV === 'development' && <ChatWidget />}
        <Analytics />
      </body>
    </html>
  );
}
