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

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: "Eduvance",
  description:
    "Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey.",
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: "Eduvance",
    description:
      "Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey.",
    url: "https://eduvance-website-copy.vercel.app/",
    type: "website",
    images: [
      {
        url: "https://eduvance-website-copy.vercel.app/SmallLogo.svg",
        width: 40,
        height: 40,
        alt: "Eduvance Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduvance",
    description:
      "Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey.",
    images: ["https://eduvance-website-copy.vercel.app/SmallLogo.svg"],
  },
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
        {/* <link rel="icon" href="/BlueSolo.svg" />
        <meta property="theme-color" content="#4e8cff"/>
        <meta property="og:url" content="https://eduvance-website-copy.vercel.app/"/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content="https://eduvance-website-copy.vercel.app/SmallLogo.svg"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta property="twitter:domain" content="eduvance.au"/>
        <meta property="twitter:url" content="https://eduvance-website-copy.vercel.app/"/>
        <meta name="twitter:image" content="https://eduvance-website-copy.vercel.app/SmallLogo.svg"/> */}
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
