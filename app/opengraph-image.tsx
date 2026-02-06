import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Send me a telegram!";
export const size = {
	width: 600,
	height: 315,
};
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 48,
					background: "white",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "black",
					fontWeight: 600,
				}}
			>
				📥 Send me a telegram!
			</div>
		),
		{
			...size,
		}
	);
}
