import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CSPostHogProvider } from "./providers/posthog"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "ScreenMan - AI Live Audio Research",
	description:
		"A live audio transcriber and web researcher for podcasters and other live audio hosts",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<CSPostHogProvider>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					{children}
				</body>
			</CSPostHogProvider>
		</html>
	)
}
