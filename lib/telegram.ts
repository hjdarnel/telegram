"use server";
import path from "path";
import { loadImage } from "canvas";
import { mkdir, writeFile } from "fs/promises";
import { headers } from "next/headers";
import { encoder, sendToPrinter } from "./printer";
import { checkSWF } from "./sfw";

const rateLimit = new Map<string | null, number>();

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

async function cacheImage(imageData: string, baseUrl: string): Promise<string | null> {

	try {
		// Extract base64 data from data URL
		const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
		if (!matches) {
			console.warn("[📷 CACHE] Invalid image data URL");
			return null;
		}

		const buffer = Buffer.from(matches[2], "base64");

		if (buffer.length > MAX_IMAGE_SIZE) {
			console.warn(`[📷 CACHE] Image too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB), skipping`);
			return null;
		}

		const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
		const dir = path.join(process.cwd(), ".cache", "telegram");
		await mkdir(dir, { recursive: true });

		const filename = `latest.${ext}`;
		await writeFile(path.join(dir, filename), buffer);
		console.log(`[📷 CACHE] Cached image (${(buffer.length / 1024).toFixed(1)}KB)`);

		return `${baseUrl}/api/telegram-image`;
	} catch (error) {
		console.error("[📷 CACHE] Error caching image:", error);
		return null;
	}
}

async function notifyHomeAssistant(name: string, imageUrl?: string | null) {
	const hassUrl = process.env.HASS_URL;
	const hassToken = process.env.HASS_TOKEN;
	const hassNotifyEntity = process.env.HASS_NOTIFY_ENTITY;

	if (!hassUrl || !hassToken || !hassNotifyEntity) {
		console.warn("[🏠 HASS] Missing HASS_URL, HASS_TOKEN, or HASS_NOTIFY_ENTITY, skipping notification");
		return;
	}

	try {
		const notificationData: Record<string, unknown> = {
			push: {
				"interruption-level": "time-sensitive",
			},
			group: "telegram-notifications",
		};

		if (imageUrl) {
			notificationData.image = imageUrl;
		}

		const response = await fetch(
			`${hassUrl}/api/services/notify/${hassNotifyEntity}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${hassToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: `Received a telegram from ${name || "Anonymous"}`,
					title: "📬 New Telegram Arrived!",
					data: notificationData,
				}),
			}
		);

		if (!response.ok) {
			console.error("[🏠 HASS] Notification failed:", response.status, await response.text());
		} else {
			console.log("[🏠 HASS] Notification sent successfully");
		}
	} catch (error) {
		console.error("[🏠 HASS] Error sending notification:", error);
	}
}

export async function printTelegram(_prevState: any, data: FormData) {
	const ip =
		(await headers()).get("x-forwarded-for") ||
		(await headers()).get("x-real-ip");

	const lastRequest = rateLimit.get(ip);
	console.log({
		ip,
		lastRequest,
		lastRequestIso: lastRequest
			? new Date(lastRequest).toLocaleString("en-US", {
					timeZone: "America/Chicago",
				})
			: "N/A",
		nowIso: new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }),
	});

	if (lastRequest && Date.now() - lastRequest < 15000) {
		console.log("Rate limited");
		return {
			body: "Rate limited",
		};
	}

	rateLimit.set(ip, Date.now());
	const message = (data.get("message") || "").slice(0, 10000) as string;
	const name = (data.get("name") || "").slice(0, 30) as string;
	const imageData = data.get("image") as string | null;

	console.log(`
Printing message:
${name}: ${message}
`);

	// Check for toxic content
	const result = await checkSWF(message as string);
	const isToxic =
		result &&
		result.length > 0 &&
		result[0].label === "toxic" &&
		result[0].score > 0.85;

	const printedMessage = isToxic
		? `REDACTED! Toxic score of ${Math.round(result[0].score * 100)}%`
		: message;

	if (isToxic) {
		console.log("💀", result[0].score, message);
		return {
			body: printedMessage,
		};
	}
	const encodedMessage = encoder
		.initialize()
		.bold()
		.align("center")
		.height(2)
		.width(2)
		.line("TELEGRAM")
		.width(1)
		.height(1)
		.newline()
		.newline()
		.align("left")
		.line(
			`SENT: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}`,
		)
		.newline()
		.line(`FROM: ${name?.toUpperCase() || "ANONYMOUS"}`)
		.newline()
		.newline()
		.align("center")
		.line("=".repeat(40))
		.newline()
		.newline()
		.line("MESSAGE:")
		.align("left")
		.line(`${message}`)
		.newline()
		.newline();

	// Handle optional image printing
	if (imageData) {
		try {
			const image = await loadImage(imageData);
			encodedMessage
				.align("center")
				.line("=".repeat(40))
				.newline()
				.newline()
				.line("IMAGE:")
				.newline()
				.image(image, image.width, image.height, "floydsteinberg")
				.newline()
				.newline();
		} catch (error) {
			console.error("Error processing image for printing:", error);
			encodedMessage
				.align("center")
				.line("=".repeat(40))
				.newline()
				.newline()
				.line("IMAGE: [Error processing image]")
				.newline()
				.newline();
		}
	}

	encodedMessage
		.align("center")
		.line("=".repeat(40))
		.newline()
		.newline()
		.height(2)
		.width(2)
		.line("TELEGRAM RECEIVED")
		.height(1)
		.width(1)
		.newline()
		.line(`ID: ${Date.now().toString().slice(-8)}`)
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.newline()
		.cut("full");

	const finalEncodedMessage = encodedMessage.encode();

	// Send to thermal printer server over HTTP
	const printResult = await sendToPrinter(finalEncodedMessage);

	if (!printResult.success) {
		console.error(
			"[🧾 TELEGRAM] Failed to send to printer:",
			printResult.error,
		);
		return {
			body: `Error sending to printer: ${printResult.error}`,
			message,
			name,
			error: true,
		};
	}

	// Cache image and notify Home Assistant
	let imageUrl: string | null = null;
	if (imageData) {
		const appUrl = process.env.APP_URL;
		if (appUrl) {
			imageUrl = await cacheImage(imageData, appUrl);
		} else {
			console.warn("[📷 CACHE] APP_URL not set, skipping image in notification");
		}
	}
	await notifyHomeAssistant(name, imageUrl);

	return {
		body: `Printed message: ${message}${imageData ? " (with image)" : ""}`,
		message,
		name,
	};
}
