import type { Readable } from "stream";
import type { ParseOptions, Parser, UpgradedFieldData } from "./interface";
import type { ParsedMail } from "mailparser";
import type { ReadStream } from "fs";
import * as pdf from "html-pdf";

export class Convert {
	fileReadStream: Readable;
	parsedMail!: UpgradedFieldData | ParsedMail;
	html: string;
	constructor(fileReadStream: Readable, html: string) {
		this.fileReadStream = fileReadStream;
		this.html = html;
	}
	async convertToStream(
		type?: "png" | "jpeg" | "pdf",
		orientation?: "portrait" | "landscape",
		format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid",
	): Promise<ReadStream> {
		try {
			if (!this.html) throw new Error("No message found");
			return await new Promise<ReadStream>((resolve, reject) => {
				pdf
					.create(this.html, { format, orientation, type })
					.toStream((err, stream) => {
						if (err) reject(err);
						resolve(stream);
					});
			});
		} catch (error) {
			throw error;
		}
	}

	async convertToBuffer(type?: "png" | "jpeg" | "pdf", orientation?: "portrait" | "landscape", format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid", options?: ParseOptions): Promise<Buffer> {
		try {
			if (!this.html) throw new Error("No message found");
			return await new Promise<Buffer>((resolve, reject) => {
				pdf.create(this.html, { format, orientation, type }).toBuffer((err, buffer) => {
					if (err) reject(err);
					resolve(buffer);
				});
			});
		} catch (error) {
			throw error;
		}
	}
}