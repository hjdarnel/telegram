import EscPosEncoder from "esc-pos-encoder";

const THERMAL_PRINTER_URL =
	process.env.PRINTER_URL || "http://192.168.1.212:4000";

/**
 * Sends ESC/POS encoded buffer to the thermal printer server over HTTP
 * @param buffer - The ESC/POS encoded buffer to send
 * @returns Promise that resolves when the print job is sent
 */
export async function sendToPrinter(
	buffer: Uint8Array,
): Promise<{ success: boolean; error?: string }> {
	if (process.env.NO_PRINTER === "true") {
		console.log("[🧾 THERMAL] NO_PRINTER is set, skipping print");
		return { success: true };
	}

	try {
		const base64Buffer = Buffer.from(buffer).toString("base64");

		console.log("[🧾 THERMAL] Sending print job to", THERMAL_PRINTER_URL);

		const response = await fetch(`${THERMAL_PRINTER_URL}/data`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				buffer: base64Buffer,
			}),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			console.error("[🧾 THERMAL] Print job failed:", errorData);
			return {
				success: false,
				error: errorData.error || "Failed to send print job",
			};
		}

		const result = await response.json();
		console.log("[🧾 THERMAL] Print job sent successfully:", result);
		return { success: true };
	} catch (error) {
		console.error("[🧾 THERMAL] Error sending to printer:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export const encoder = new EscPosEncoder();
