import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { WebVitals } from "@/lib/axiom/client"
import MainLayout from "./(main)/layout"

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
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <div className="relative flex min-h-screen flex-col bg-background">
                        <MainLayout>
                            {children}
                        </MainLayout>
                        <Toaster />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}

