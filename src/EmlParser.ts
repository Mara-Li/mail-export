import { Readable } from "node:stream";
import { JSDOM } from "jsdom";
import {
	type AddressObject,
	type Attachment,
	type ParsedMail,
	simpleParser,
} from "mailparser";
import { extension } from "mime-types";
import type { Header, MailAddress, ParseOptions, Parser } from "./interface.js";
import {
	END,
	HEADER,
	attachments,
	bcc,
	cc,
	date,
	from,
	htmlAddress,
	subject,
	to,
} from "./utils.js";

export class EmlParser implements Parser {
	parsedMail!: ParsedMail;
	fileReadStream: Readable;
	constructor(fileReadStream: Readable) {
		this.fileReadStream = fileReadStream;
	}
	async parse(options?: ParseOptions) {
		if (this.parsedMail) return this.parsedMail;
		const result = await simpleParser(this.fileReadStream);
		if (result) {
			if (options?.ignoreEmbedded) {
				result.attachments = result.attachments.filter(
					(att) => att.contentDisposition === "attachment",
				);
			}
			if (result.html) {
				const domParser = new JSDOM(result.html);
				//remove all <style>
				const styles = domParser.window.document.querySelectorAll("style");
				// biome-ignore lint/complexity/noForEach: <explanation>
				styles.forEach((style) => style.remove());
				result.html = domParser.window.document.body.innerHTML;
			} else if (result.textAsHtml) {
				const domParser = new JSDOM(result.textAsHtml).window.document;
				const styles = domParser.querySelectorAll("style");
				// biome-ignore lint/complexity/noForEach: <explanation>
				styles.forEach((style) => style.remove());
				result.textAsHtml = domParser.body.innerHTML;
			}
			if (options?.highlightKeywords) {
				if (!Array.isArray(options.highlightKeywords))
					throw new Error(
						"err: highlightKeywords is not an array, expected: String[]",
					);
				let flags = "gi";
				if (options.highlightCaseSensitive) flags = "g";

				for (const keyword of options.highlightKeywords) {
					if (result.html) {
						result.html = result.html.replace(
							new RegExp(keyword, flags),
							(str) => `<mark>${str}</mark>`,
						);
					} else if (result.textAsHtml) {
						result.textAsHtml = result.textAsHtml.replace(
							new RegExp(keyword, flags),
							(str) => `<mark>${str}</mark>`,
						);
					}
				}
			}
			this.parsedMail = result;
			return result;
		}
	}

	private createAddress(
		address?: AddressObject | AddressObject[],
	): MailAddress[] {
		if (!address) return [];
		const result = Array.isArray(address) ? address : [address];
		const mails: MailAddress[] = [];
		for (const addressObject of result) {
			if (addressObject.value) {
				for (const email of addressObject.value) {
					mails.push({
						name: email.name,
						address: email.address,
					});
				}
			}
		}
		return mails;
	}

	async getHeader(options?: ParseOptions): Promise<Header | undefined> {
		const result = await this.parse(options);
		if (!result) return undefined;
		const bcc = this.createAddress(result.bcc);
		const cc = this.createAddress(result.cc);
		const to = this.createAddress(result.to);
		const replyTo = this.createAddress(result.replyTo);
		const attachments = await this.getAttachments(options);
		return {
			subject: result.subject,
			from: result.from?.value,
			bcc,
			cc,
			to,
			date: result.date,
			replyTo,
			attachments,
		} as Header;
	}

	async getBodyHtml(options?: ParseOptions): Promise<string | undefined> {
		const result = await this.parse(options);
		if (!result) return undefined;
		const replacements = {
			"’": "'",
			"–": "&#9472;",
		};
		let htmlString = result.html || result.textAsHtml;
		if (!htmlString) return undefined;
		for (const key in replacements) {
			htmlString = htmlString.replace(new RegExp(key, "g"), key);
		}
		return htmlString;
	}

	async getAsHtml(parseOptions?: ParseOptions): Promise<string | undefined> {
		const exclude = parseOptions?.excludeHeader;
		const result = await this.parse(parseOptions);
		if (!result) throw new Error("No message found");
		const dateMail = result.date ? new Date(result.date) : new Date();
		const fromAddress = !exclude?.from
			? htmlAddress(this.createAddress(result.from))
			: undefined;
		const dateHeader = !exclude?.date ? date(dateMail) : undefined;

		let headerHtml = `${HEADER(result.subject ?? "Email", parseOptions?.customStyle)}${from(fromAddress)}${dateHeader}`;
		if (!exclude?.to) {
			const toAdress = this.createAddress(result.to);
			const htmlTo = htmlAddress(toAdress);
			headerHtml += to(htmlTo);
		}
		if (!exclude?.cc) {
			const ccAddress = this.createAddress(result.cc);
			const htmlCc = htmlAddress(ccAddress);
			headerHtml += cc(htmlCc);
		}
		if (!exclude?.bcc) {
			const bccAddress = this.createAddress(result.bcc);
			const htmlBcc = htmlAddress(bccAddress);
			headerHtml += bcc(htmlBcc);
		}
		if (!exclude?.attachments) {
			const attachmentsFiles = exclude?.embeddedAttachments
				? result.attachments.filter(
						(att) => att.contentDisposition === "attachment",
					)
				: result.attachments;

			const mappedAttachments = await Promise.all(
				attachmentsFiles.map(async (att) => {
					let filename = att.filename;
					if (!filename) {
						const type = extension(att.contentType);
						if (type === "eml") {
							const content = att.content;
							const parser = new EmlParser(Readable.from(content));
							const header = await parser.getHeader();
							filename = `${header?.subject ?? "sample"}.eml`;
						} else if (type) {
							const index = result.attachments.indexOf(att);
							if (type) filename = `attachment_${index}.${type}`;
						} else {
							const index = result.attachments.indexOf(att);
							filename = `attachment_${index}`;
						}
					}
					return `<a href=\"data:${att.contentType};base64,${att.content.toString("base64")}\" download=\"${filename}\">${filename}</a>`;
				}),
			);
			const attachmentsHtml = mappedAttachments.join("<br>");
			headerHtml += attachments(attachmentsHtml);
		}
		if (result.replyTo && !exclude?.replyTo) {
			const replyToAddress = this.createAddress(result.replyTo);
			const htmlReplyTo = htmlAddress(replyToAddress);
			headerHtml += to(htmlReplyTo);
		}
		if (!exclude?.subject) headerHtml += subject(result.subject);
		const bodyHtml = await this.getBodyHtml(parseOptions);
		if (bodyHtml) headerHtml += `${END}<p>${bodyHtml}</p>`;
		return headerHtml;
	}

	async getAttachments(options?: ParseOptions): Promise<Attachment[]> {
		const result = await this.parse(options);
		if (!result) return [];
		return result.attachments.filter(
			(att) => att.contentDisposition === "attachment",
		);
	}

	/**
	 * Allow to get only the embedded attachments of a eml file
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {Promise<Attachment[]>} - The embedded attachments
	 */
	async getEmbedded(options?: ParseOptions): Promise<Attachment[]> {
		const result = await this.parse(options);
		if (!result) return [];
		if (options?.ignoreEmbedded)
			return result.attachments.filter(
				(att) => att.contentDisposition !== "attachment",
			);
		return result.attachments;
	}
}
