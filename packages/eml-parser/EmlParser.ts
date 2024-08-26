import { simpleParser, type ParsedMail } from "mailparser";
import type { ParseOptions } from "./src/interface";
import type { Readable } from "stream";

class EmlParser {
	parsedMail: ParsedMail;
	fileReadStream: Readable;
	constructor(fileReadStream: Readable) {
		this.fileReadStream = fileReadStream;
	}
	async parseEml(options?: ParseOptions) {
		if (this.parsedMail) return this.parsedMail;
		const result = await simpleParser(this.fileReadStream);
		if (result) {
			if (options?.ignoreEmbedded) {
				result.attachments = result.attachments.filter(
					(att) => att.contentDisposition === "attachment",
				);
			}
			if (options?.highlightKeywords) {
				if (!Array.isArray(options.highlightKeywords))
					throw new Error(
						"err: highlightKeywords is not an array, expected: String[]",
					);
				let flags = "gi";
				if (options.highlightCaseSensitive) flags = "g";
				options.highlightKeywords.forEach((keyword) => {
					if (result.html) {
						result.html = result.html.replace(
							new RegExp(keyword, flags),
							function (str) {
								return `<mark>${str}</mark>`;
							},
						);
					} else if (result.textAsHtml) {
						result.textAsHtml = result.textAsHtml.replace(
							new RegExp(keyword, flags),
							function (str) {
								return `<mark>${str}</mark>`;
							},
						);
					}
				});
			}
			this.parsedMail = result;
			return result;
		}
	}
}
