import { Readable } from "node:stream";
import { JSDOM } from "jsdom";
import {
	type AddressObject,
	type Attachment,
	type ParsedMail,
	simpleParser,
} from "mailparser";
import { extension } from "mime-types";
import type { IEml } from "./types/Parser.js";
import type { Header, MailAddress } from "./types/interface.js";
import type { EmlOptions } from "./types/options.js";
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

export class EmlParser implements IEml {
	fileReadStream: Readable;
	options?: EmlOptions;
	parsedMail!: ParsedMail;

	private constructor(fileReadStream: Readable, options?: EmlOptions) {
		this.fileReadStream = fileReadStream;
		this.options = options;
	}

	/**
	 * Initialize the EmlParser
	 * @param fileReadStream {Readable} - The file to parse
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {Promise<EmlParser>} - The EmlParser instance
	 */
	public static async init(
		fileReadStream: Readable,
		options?: EmlOptions,
	): Promise<EmlParser> {
		return await new EmlParser(fileReadStream, options).parse();
	}

	private async parse() {
		const result = await simpleParser(this.fileReadStream);
		if (result) {
			if (this.options?.ignoreEmbedded) {
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
			if (this.options?.highlightKeywords) {
				if (!Array.isArray(this.options.highlightKeywords))
					throw new Error(
						"err: highlightKeywords is not an array, expected: String[]",
					);
				let flags = "gi";
				if (this.options.highlightCaseSensitive) flags = "g";

				for (const keyword of this.options.highlightKeywords) {
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
			const emlParser = new EmlParser(this.fileReadStream, this.options);
			emlParser.parsedMail = result;
			return emlParser;
		}
		throw new Error("No message found");
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

	getHeader(): Header | undefined {
		const bcc = this.createAddress(this.parsedMail.bcc);
		const cc = this.createAddress(this.parsedMail.cc);
		const to = this.createAddress(this.parsedMail.to);
		const replyTo = this.createAddress(this.parsedMail.replyTo);
		const attachments = this.getAttachments();
		return {
			subject: this.parsedMail.subject,
			from: this.parsedMail.from?.value,
			bcc,
			cc,
			to,
			date: this.parsedMail.date,
			replyTo,
			attachments,
		} as Header;
	}

	getBodyHtml(): string | undefined {
		const replacements = {
			"’": "'",
			"–": "&#9472;",
		};
		let htmlString = this.parsedMail.html || this.parsedMail.textAsHtml;
		if (!htmlString) return undefined;
		for (const key in replacements) {
			htmlString = htmlString.replace(new RegExp(key, "g"), key);
		}
		return htmlString;
	}

	async getAsHtml(options?: EmlOptions): Promise<string | undefined> {
		if (options) this.options = options;
		const exclude = this.options?.excludeHeader;
		const dateMail = this.parsedMail.date
			? new Date(this.parsedMail.date)
			: new Date();
		const fromAddress = !exclude?.from
			? htmlAddress(
					this.createAddress(this.parsedMail.from),
					this.options?.formatEmailAddress,
				)
			: undefined;
		const dateHeader = !exclude?.date ? date(dateMail) : undefined;

		let headerHtml = `${HEADER(this.parsedMail.subject ?? "Email", this.options?.customStyle)}${from(fromAddress)}${dateHeader}`;
		if (!exclude?.to) {
			const toAddress = this.createAddress(this.parsedMail.to);
			const htmlTo = htmlAddress(toAddress, this.options?.formatEmailAddress);
			headerHtml += to(htmlTo);
		}
		if (!exclude?.cc) {
			const ccAddress = this.createAddress(this.parsedMail.cc);
			const htmlCc = htmlAddress(ccAddress, this.options?.formatEmailAddress);
			headerHtml += cc(htmlCc);
		}
		if (!exclude?.bcc) {
			const bccAddress = this.createAddress(this.parsedMail.bcc);
			const htmlBcc = htmlAddress(bccAddress, this.options?.formatEmailAddress);
			headerHtml += bcc(htmlBcc);
		}
		if (!exclude?.attachments) {
			const attachmentsFiles = exclude?.embeddedAttachments
				? this.parsedMail.attachments.filter(
						(att) => att.contentDisposition === "attachment",
					)
				: this.parsedMail.attachments;

			const mappedAttachments = await Promise.all(
				attachmentsFiles.map(async (att) => {
					let filename = att.filename;
					if (!filename) {
						const type = extension(att.contentType);
						if (type === "eml") {
							const content = att.content;
							const parser = await EmlParser.init(
								Readable.from(content),
								this.options,
							);
							const header = parser.getHeader();
							filename = `${header?.subject ?? "sample"}.eml`;
						} else if (type) {
							const index = this.parsedMail.attachments.indexOf(att);
							if (type) filename = `attachment_${index}.${type}`;
						} else {
							const index = this.parsedMail.attachments.indexOf(att);
							filename = `attachment_${index}`;
						}
					}
					return `<a href=\"data:${att.contentType};base64,${att.content.toString("base64")}\" download=\"${filename}\">${filename}</a>`;
				}),
			);
			const attachmentsHtml = mappedAttachments.join("<br>");
			headerHtml += attachments(attachmentsHtml);
		}
		if (this.parsedMail.replyTo && !exclude?.replyTo) {
			const replyToAddress = this.createAddress(this.parsedMail.replyTo);
			const htmlReplyTo = htmlAddress(
				replyToAddress,
				this.options?.formatEmailAddress,
			);
			headerHtml += to(htmlReplyTo);
		}
		if (!exclude?.subject) headerHtml += subject(this.parsedMail.subject);
		const bodyHtml = this.getBodyHtml();
		if (bodyHtml) headerHtml += `${END}<p>${bodyHtml}</p>`;
		return headerHtml;
	}

	getAttachments(): Attachment[] {
		return this.parsedMail.attachments.filter(
			(att) => att.contentDisposition === "attachment",
		);
	}

	getEmbedded(): Attachment[] {
		return this.parsedMail.attachments.filter(
			(att) => att.contentDisposition !== "attachment",
		);
	}
}
