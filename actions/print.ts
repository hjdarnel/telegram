"use server";
import { sendToPrinter } from "@/lib/printer";
import { loadImage } from "canvas";
import EscPosEncoder from "esc-pos-encoder";
const encoder = new EscPosEncoder();

export async function testPrinter(formData: FormData) {
	console.log("testing printer");

	const result = encoder
		.initialize()
		.text(`Testing ${new Date()}`)
		.newline()
		.encode();

	await sendToPrinter(result);
	await cutPaper();
}

export async function printImage(base64String: string) {
	console.log("printing image");
	const image = await loadImage(base64String);
	const result = encoder
		.initialize()
		.image(image, image.width, image.height, "floydsteinberg")
		.encode();
	await sendToPrinter(result);
	await cutPaper();
}

export async function cutPaper() {
	const result = encoder
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.cut("full")
		.encode();
	await sendToPrinter(result);
}
