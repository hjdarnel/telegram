"use client";

import { printCustom } from "@/lib/custom";
import { useActionState, useState } from "react";
import { CustomPreview } from "./CustomPreview";

export function CustomForm() {
	const [state, formAction] = useActionState(printCustom, {
		body: "",
		header: "",
		subheader: "",
		main: "",
		footer: "",
	});
	const [previewHeader, setPreviewHeader] = useState("");
	const [previewSubheader, setPreviewSubheader] = useState("");
	const [previewMain, setPreviewMain] = useState("");
	const [previewFooter, setPreviewFooter] = useState("");
	const [checklist, setChecklist] = useState(false);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
				<div className="space-y-3">
					<form action={formAction} className="space-y-3">
						<input
							className="w-full p-2 border border-gray-300 rounded"
							placeholder="Header"
							type="text"
							name="header"
							defaultValue={(state.header as string) || ""}
							onChange={(e) => setPreviewHeader(e.target.value)}
						/>
						<input
							className="w-full p-2 border border-gray-300 rounded"
							placeholder="Subheader"
							type="text"
							name="subheader"
							defaultValue={(state.subheader as string) || ""}
							onChange={(e) => setPreviewSubheader(e.target.value)}
						/>
						<textarea
							className="w-full p-2 border border-gray-300 rounded resize-none"
							placeholder={checklist ? "One item per line" : "Main content"}
							name="main"
							id="main"
							rows={5}
							defaultValue={(state.main as string) || ""}
							onChange={(e) => setPreviewMain(e.target.value)}
						/>
						<label className="flex items-center gap-2 text-sm cursor-pointer">
							<input
								type="checkbox"
								checked={checklist}
								onChange={(e) => setChecklist(e.target.checked)}
								className="w-4 h-4"
							/>
							Format as checklist
						</label>
						<input type="hidden" name="checklist" value={checklist ? "on" : ""} />
						<input
							className="w-full p-2 border border-gray-300 rounded"
							placeholder="Footer"
							type="text"
							name="footer"
							defaultValue={(state.footer as string) || ""}
							onChange={(e) => setPreviewFooter(e.target.value)}
						/>

						<button
							type="submit"
							className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
						>
							Print
						</button>
					</form>

					{state.body && (
						<div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-800 break-all overflow-wrap-anywhere overflow-hidden max-w-full whitespace-pre-wrap">
							{state.body}
						</div>
					)}
				</div>

				<div className="flex justify-center md:justify-start">
					<CustomPreview
						header={previewHeader}
						subheader={previewSubheader}
						main={previewMain}
						footer={previewFooter}
						checklist={checklist}
					/>
				</div>
			</div>
		</div>
	);
}
