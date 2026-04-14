import { CustomForm } from "@/components/CustomForm";
import React from "react";

export default function CustomPage() {
	return (
		<main className="text-center p-4 md:p-[50px]">
			<h2 className="text-xl md:text-2xl">Custom Print</h2>
			<p className="text-sm md:text-base mb-8">
				Print a custom message on the thermal printer.
			</p>
			<div className="max-w-4xl mx-auto">
				<CustomForm />
			</div>
		</main>
	);
}
