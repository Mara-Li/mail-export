import {
	simpleParser,
	type AddressObject,
	type Attachment,
	type EmailAddress,
	type ParsedMail,
} from "mailparser";
import type {
	Header,
	MailAdress,
	ParseOptions,
	Parser,
} from "./interface";
import type { Readable } from "stream";
import {
	attachments,
	bcc,
	cc,
	date,
	end,
	from,
	header,
	htmlAdress,
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

	private createAdress(adress?: AddressObject | AddressObject[]): MailAdress[] {
		if (!adress) return [];
		const result = Array.isArray(adress) ? adress : [adress];
		const mails: MailAdress[] = [];
		for (const adress of result) {
			if (adress.value) {
				adress.value.forEach((email: EmailAddress) => {
					mails.push({
						name: email.name,
						address: email.address,
					});
				});
			}
		}
		return mails;
	}

	async getHeader(options?: ParseOptions): Promise<Header | undefined> {
		const result = await this.parse(options);
		if (!result) return undefined;
		const bcc = this.createAdress(result.bcc);
		const cc = this.createAdress(result.cc);
		const to = this.createAdress(result.to);
		const replyTo = this.createAdress(result.replyTo);
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
		let replacements = {
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
		const dateMail = result.date
			? new Date(result.date).toLocaleString()
			: new Date().toLocaleString();
		const fromAdress = !exclude?.from
			? htmlAdress(this.createAdress(result.from))
			: undefined;
		const dateHeader = !exclude?.date ? date(dateMail) : undefined;

		let headerHtml = `${header}${from(fromAdress)}${dateHeader}`;
		if (result.to && !exclude?.to) {
			const toAdress = this.createAdress(result.to);
			const htmlTo = htmlAdress(toAdress);
			headerHtml += to(htmlTo);
		}
		if (result.cc && !exclude?.cc) {
			const ccAdress = this.createAdress(result.cc);
			const htmlCc = htmlAdress(ccAdress);
			headerHtml += cc(htmlCc);
		}
		if (result.bcc && !exclude?.bcc) {
			const bccAdress = this.createAdress(result.bcc);
			const htmlBcc = htmlAdress(bccAdress);
			headerHtml += bcc(htmlBcc);
		}
		if (result.attachments && !exclude?.attachments) {
			const attachmentsFiles = exclude?.embeddedAttachments
				? result.attachments.filter(
					(att) => att.contentDisposition === "attachment",
				)
				: result.attachments;
			const attachmentsHtml = attachmentsFiles
				.map((att) => {
					return `<a href=\"data:${att.contentType};base64,${att.content.toString("base64")}\" download=\"${att.filename}\">${att.filename}</a>`;
				})
				.join("<br>");
			headerHtml += attachments(attachmentsHtml);
		}
		if (result.replyTo && !exclude?.replyTo) {
			const replyToAdress = this.createAdress(result.replyTo);
			const htmlReplyTo = htmlAdress(replyToAdress);
			headerHtml += to(htmlReplyTo);
		}
		if (result.subject && !exclude?.subject)
			headerHtml += subject(result.subject);
		const bodyHtml = await this.getBodyHtml(parseOptions);
		if (bodyHtml) headerHtml += end + `<p>${bodyHtml}</p>`;
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
