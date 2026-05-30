import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { WebVitals } from "@/lib/axiom/client"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "AceYourHireVue - AI-Powered Interview Preparation",
    description: "Practice and perfect your one-way video interviews with AI-driven feedback and analysis",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <WebVitals />
            <body className={inter.className}>
                <ClerkProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <div className="relative flex min-h-screen flex-col bg-background">
                            <Header />
                            <main className="flex-1 flex justify-center">
                                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                                    {children}
                                </div>
                            </main>
                            <Footer />
                            <Toaster />
                        </div>
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}

