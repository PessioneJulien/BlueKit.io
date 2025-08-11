import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { SubscriptionSyncProvider } from "@/components/providers/SubscriptionSyncProvider";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "BlueKit - Stack Builder Platform",
  description: "Build, share, and discover technology stacks for your next project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-900">
        <AuthProvider>
          <StoreProvider>
            <SubscriptionSyncProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'bg-slate-800 text-white border border-slate-700',
                  duration: 4000,
                }}
              />
            </SubscriptionSyncProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
