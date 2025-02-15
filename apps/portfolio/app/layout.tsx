import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "A K M Elias - Senior Software Engineer",
  description: "Portfolio of A K M Elias, Senior Software Engineer specializing in PHP, Laravel, JavaScript, and Vue",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-green-500 p-4`}>{children}</body>
    </html>
  )
}



import './globals.css'