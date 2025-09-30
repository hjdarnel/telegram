"use client";

import { testSWF } from "@/actions/test-sfw";
import { useState } from "react";

export default function TestSWF() {
	const [result, setResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const response = await testSWF(null, formData);

		setResult(response);
		setLoading(false);
	};

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Test Toxic Content Detection</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="message"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Test Message:
					</label>
					<textarea
						id="message"
						name="message"
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter a message to test for toxic content..."
						required
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? "Testing..." : "Test Message"}
				</button>
			</form>

			{result && (
				<div className="mt-6 p-4 border rounded-lg">
					<h3 className="font-semibold mb-2">Results:</h3>

					{result.error ? (
						<div className="text-red-600">
							<strong>Error:</strong> {result.error}
						</div>
					) : (
						<div className="space-y-2">
							<div>
								<strong>Original Message:</strong> {result.message}
							</div>

							<div>
								<strong>Is Toxic:</strong> {result.isToxic ? "YES" : "NO"}
							</div>

							<div>
								<strong>Filtered Message:</strong> {result.filteredMessage}
							</div>

							{result.result && result.result[0] && (
								<div>
									<strong>Classification:</strong> {result.result[0].label}(
									{(result.result[0].score * 100).toFixed(2)}% confidence)
								</div>
							)}

							<details className="mt-4">
								<summary className="cursor-pointer text-sm text-gray-600">
									Raw Results (click to expand)
								</summary>
								<pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
									{JSON.stringify(result.result, null, 2)}
								</pre>
							</details>
						</div>
					)}
				</div>
			)}

			<div className="mt-8 text-sm text-gray-600">
				<h4 className="font-medium mb-2">Test Cases to Try:</h4>
				<ul className="list-disc list-inside space-y-1">
					<li>&quot;Hello, how are you today?&quot; (should be non-toxic)</li>
					<li>&quot;This is a lovely day!&quot; (should be non-toxic)</li>
					<li>
						&quot;I hate you and wish you were dead&quot; (should be toxic)
					</li>
					<li>&quot;You stupid idiot&quot; (should be toxic)</li>
				</ul>
			</div>
		</div>
	);
}
