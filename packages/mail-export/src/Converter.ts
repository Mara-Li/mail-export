import type { ReadStream } from "fs";
import * as pdf from "html-pdf";

/**
 * Allow to export a html string into a buffer or a stream
 */
export class Convert {
	html: string;
	constructor(html: string) {
		this.html = html;
	}

	private createOption(
		type: "png" | "jpeg" | "pdf",
		option?: pdf.CreateOptions,
	): pdf.CreateOptions {
		if (option) {
			if (!option.orientation) option.orientation = "landscape";
			if (type) option.type = type;
			return option;
		}
		return { type, orientation: "landscape" };
	}

	async convertToStream(
		type: "png" | "jpeg" | "pdf",
		opt?: pdf.CreateOptions,
	): Promise<ReadStream> {
		const options = this.createOption(type, opt);
		try {
			if (!this.html) throw new Error("No message found");
			return await new Promise<ReadStream>((resolve, reject) => {
				pdf.create(this.html, options).toStream((err, stream) => {
					if (err) reject(err);
					resolve(stream);
				});
			});
		} catch (error) {
			throw error;
		}
	}

	async convertToBuffer(
		type: "png" | "jpeg" | "pdf",
		opt?: pdf.CreateOptions,
	): Promise<Buffer> {
		const option = this.createOption(type, opt);
		try {
			if (!this.html) throw new Error("No message found");
			return await new Promise<Buffer>((resolve, reject) => {
				pdf.create(this.html, option).toBuffer((err, buffer) => {
					if (err) reject(err);
					resolve(buffer);
				});
			});
		} catch (error) {
			throw error;
		}
	}
}
