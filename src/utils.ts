import type { Readable } from "node:stream";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function stream2Buffer(stream: Readable): Promise<any> {
	return new Promise((resolve, reject) => {
		const _buf: Uint8Array[] = [];

		stream.on("data", (chunk) => _buf.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(_buf)));
		stream.on("error", (err) => reject(err));
	});
}
