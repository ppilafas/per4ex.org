import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono, Archivo_Black } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ClientBootLoader, ClientWidgets } from "@/components/client-widgets";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400", // Archivo Black only has one weight (it's already black/bold)
});

export const metadata = {
  title: "Per4ex.org | Systems Engineer",
  description: "Systems-focused portfolio for AI-related ecosystems.",
  icons: {
    icon: "/catalyst3d.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-background text-foreground relative">
            <ClientBootLoader />
            <Navbar />
            <main className="w-full min-h-screen flex flex-col pt-24">
               <div className="max-w-7xl w-full px-6 flex-1 mx-auto">
        {children}
                 <Footer />
               </div>
            </main>
            <ClientWidgets />
            <Analytics />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}