import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import "./globals.css";
import SupabaseAuthProvider from "@/components/client/SupabaseAuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eduvance",
  description: "Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Supabase CDN Script */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
          strategy="beforeInteractive"
        />
        <link rel="icon" href="/BlueSolo.svg" />
        <meta property="theme-color" content="#0c60fb" />
        <meta property="og:image" content="/SmallLogo.svg" />
        <meta property="og:title" content="Eduvance"/>
        <meta property="twitter:title" content="Eduvance"/>
        <meta name="twitter:image" content="/SmallLogo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
