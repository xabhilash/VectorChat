import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, UserButton, SignIn } from '@clerk/nextjs'
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
  title: "PDF Chat",
  description: "Chat with your PDF documents using RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="h-full bg-[#fefae0] overflow-hidden">
          <Show when="signed-out">
            <section className="min-h-screen w-full flex items-center justify-center p-4">
              <SignIn />
            </section>
          </Show>
          <Show when="signed-in">
            <div className="fixed top-3 right-3 md:top-4 md:right-4 z-40 bg-white border-4 border-black p-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <UserButton />
            </div>
            {children}
          </Show>
        </body>
      </html>
    </ClerkProvider>
  );
}
