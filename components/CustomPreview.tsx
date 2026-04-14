"use client";

interface CustomPreviewProps {
	header: string;
	subheader: string;
	main: string;
	footer: string;
	checklist?: boolean;
}

export function CustomPreview({
	header,
	subheader,
	main,
	footer,
	checklist,
}: CustomPreviewProps) {
	return (
		<div className="bg-white text-black font-mono text-xs p-4 py-6 w-[58ch] mx-auto shadow-lg border border-gray-300">
			{(header || subheader) && (
				<div className="text-center mb-6">
					{header && (
						<h3 className="font-bold text-lg tracking-wider">{header}</h3>
					)}
					{subheader && (
						<div className="mt-1 text-sm">{subheader}</div>
					)}
					<div className="border-b border-dashed border-gray-400 mt-4" />
				</div>
			)}

			<div className="pt-4 mb-6 text-left">
				{checklist && main ? (
					<div className="space-y-1 text-left">
						{main.split("\n").filter(Boolean).map((line, i) => (
							<div key={i} className="flex gap-2">
								<span>[ ]</span>
								<span>{line}</span>
							</div>
						))}
					</div>
				) : (
					<div className="whitespace-pre-wrap break-words">
						{main || "(No content)"}
					</div>
				)}
			</div>

			{footer && (
				<div className="border-t border-dashed border-gray-400 pt-8 text-center">
					<div className="font-bold text-lg">{footer}</div>
				</div>
			)}
		</div>
	);
}
