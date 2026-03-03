import { existsSync } from "fs";
import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

const CACHE_DIR = path.join(process.cwd(), ".cache", "telegram");

export async function GET() {
	const extensions = ["jpg", "png", "gif", "webp"];

	for (const ext of extensions) {
		const filePath = path.join(CACHE_DIR, `latest.${ext}`);
		if (existsSync(filePath)) {
			try {
				const buffer = await readFile(filePath);
				const mimeTypes: Record<string, string> = {
					jpg: "image/jpeg",
					png: "image/png",
					gif: "image/gif",
					webp: "image/webp",
				};

				return new NextResponse(new Uint8Array(buffer), {
					headers: {
						"Content-Type": mimeTypes[ext] || "image/jpeg",
						"Cache-Control": "no-cache, no-store, must-revalidate",
					},
				});
			} catch (error) {
				console.error("[📷 API] Error reading cached image:", error);
			}
		}
	}

	return NextResponse.json({ error: "No cached image" }, { status: 404 });
}
