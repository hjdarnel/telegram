"use server";
import { encoder, sendToPrinter } from "./printer";

function sanitize(text: string): string {
	return text
		.replace(/[\u2018\u2019\u2032]/g, "'")
		.replace(/[\u201C\u201D\u2033]/g, '"')
		.replace(/[\u2013\u2014\u2015]/g, "-")
		.replace(/\u2026/g, "...")
		.replace(/\u2022/g, "*")
		.replace(/[\u00AB\u00BB]/g, '"')
		.replace(/[\u2039\u203A]/g, "'")
		.replace(/\u00A0/g, " ")
		.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
}

export async function printCustom(_prevState: any, data: FormData) {
	const header = sanitize((data.get("header") || "") as string);
	const subheader = sanitize((data.get("subheader") || "") as string);
	const main = sanitize((data.get("main") || "") as string);
	const footer = sanitize((data.get("footer") || "") as string);
	const checklist = data.get("checklist") === "on";

	console.log(`[🧾 CUSTOM] Printing custom message:
Header: ${header}
Subheader: ${subheader}
Main: ${main}
Footer: ${footer}
`);

	const encodedMessage = encoder
		.initialize()
		.bold();

	if (header || subheader) {
		if (header) {
			encodedMessage
				.align("center")
				.height(2)
				.width(2)
				.line(header)
				.width(1)
				.height(1);
		}
		if (subheader) {
			encodedMessage
				.align("center")
				.newline()
				.line(subheader);
		}
		encodedMessage
			.newline()
			.newline()
			.align("center")
			.line("=".repeat(40))
			.newline()
			.newline();
	}

	encodedMessage.align("left");

	if (checklist && main) {
		const lines = main.split("\n").filter(Boolean);
		for (const line of lines) {
			encodedMessage.line(`[ ] ${line}`);
			encodedMessage.newline();
		}
	} else {
		encodedMessage.line(main);
	}

	encodedMessage
		.newline()
		.newline();

	if (footer) {
		encodedMessage
			.align("center")
			.line("=".repeat(40))
			.newline()
			.newline()
			.bold()
			.height(2)
			.width(2)
			.line(footer)
			.height(1)
			.width(1);
	}

	encodedMessage
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.cut("full");

	const finalEncodedMessage = encodedMessage.encode();

	const printResult = await sendToPrinter(finalEncodedMessage);

	if (!printResult.success) {
		console.error(
			"[🧾 CUSTOM] Failed to send to printer:",
			printResult.error,
		);
		return {
			body: `Error sending to printer: ${printResult.error}`,
			header,
			subheader,
			main,
			footer,
			error: true,
		};
	}

	return {
		body: "Printed successfully!",
		header,
		subheader,
		main,
		footer,
	};
}
