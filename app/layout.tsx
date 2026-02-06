import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Telegram - Darnell.club",
	description: "A Telegram service, sending via thermal printer, run by JS",
	openGraph: {
		title: "Telegram - Darnell.club",
		description: "Send me a telegram!",
		type: "website",
	}
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="https://fav.farm/📤" />
			</head>
			<body className={inter.className}>
				<div className="grid gap-2">{children}</div>
			</body>
		</html>
	);
}
