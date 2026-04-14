import Telegram from "@/components/Telegram";
import Link from "next/link";
import React from "react";

export default function Home() {
	return (
		<main className="text-center p-4 md:p-[50px]">
			<h2 className="text-xl md:text-2xl">Send me a telegram!</h2>
			<p className="text-sm md:text-base">
				Type something and it will print on my thermal printer.
			</p>
			<p className="text-sm mb-8">
				<Link href="/custom" className="text-blue-500 hover:text-blue-700 underline">
					Create a custom layout
				</Link>
			</p>
			<div className="max-w-4xl mx-auto">
				<Telegram />
			</div>
		</main>
	);
}
