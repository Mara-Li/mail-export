import type { Readable } from "node:stream";
import { decompressRTF } from "@kenjiuno/decompressrtf";
import MsgReader from "@kenjiuno/msgreader";
import * as iconv from "iconv-lite";
import * as rtfParser from "rtf-stream-parser";
import type {
	Header,
	MessageFieldData,
	ParseOptions,
	Parser,
} from "./interface.js";
import {
	END,
	HEADER,
	attachments,
	bcc,
	cc,
	date,
	from,
	htmlAddress,
	stream2Buffer,
	to,
} from "./utils.js";

export class MessageParser implements Parser {
	fileReadStream: Readable;
	//@ts-ignore
	parsedMail: MessageFieldData;
	constructor(fileReadStream: Readable) {
		this.fileReadStream = fileReadStream;
	}

	async parse(options?: ParseOptions) {
		if (this.parsedMail) return this.parsedMail;
		const buffer = await stream2Buffer(this.fileReadStream);
		const emailData = new MsgReader(buffer);
		const emailFieldsData = emailData.getFileData() as MessageFieldData;
		//@ts-ignore
		const outputArray = decompressRTF(emailFieldsData.compressedRtf);
		const decompressedRtf = Buffer.from(outputArray).toString("ascii");
		emailFieldsData.attachments = (
			emailFieldsData.attachments as MessageFieldData[]
		)?.map((att) => {
			att.content = emailData.getAttachment(att).content;
			att.filename = emailData.getAttachment(att).fileName;
			return att;
		});
		emailFieldsData.htmlString = rtfParser
			.deEncapsulateSync(decompressedRtf, { decode: iconv.decode })
			.text.toString();
		if (options?.highlightKeywords) {
			if (!Array.isArray(options.highlightKeywords))
				throw new Error(
					"err: highlightKeywords is not an array, expected: String[]",
				);
			let flags = "gi";
			if (options.highlightCaseSensitive) flags = "g";
			for (const keyword of options.highlightKeywords) {
				emailFieldsData.htmlString = emailFieldsData.htmlString?.replace(
					new RegExp(keyword, flags),
					(str) => `<mark>${str}</mark>`,
				);
			}
		}
		emailFieldsData.compressedRtf = undefined;
		this.parsedMail = emailFieldsData;
		return emailFieldsData;
	}

	async getHeader(options?: ParseOptions) {
		const result = await this.parse(options);
		const header: Header = {
			subject: result.subject,
			from: [
				{
					name: result.senderName,
					address: result.senderEmail,
				},
			],
			bcc: result.recipients
				?.filter((recipient) => recipient.recipType === "bcc")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			cc: result.recipients
				?.filter((recipient) => recipient.recipType === "cc")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			to: result.recipients
				?.filter((recipient) => recipient.recipType === "to")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			date: result.messageDeliveryTime,
			attachments: result.attachments as MessageFieldData[],
		};
		return header;
	}

	async getBodyHtml(options?: ParseOptions) {
		const result = await this.parse(options);
		return result.htmlString;
	}

	async getAsHtml(options?: ParseOptions) {
		const result = await this.parse(options);
		if (!result) throw new Error("No message found");
		const exclude = options?.excludeHeader;

		const fromSpan = !exclude?.from
			? `<a href=\"mailto:${result.senderEmail ?? result.lastModifierName}\" class=\"mp_address_email\">${result.senderEmail ?? result.lastModifierName}</a></span>`
			: undefined;
		const dateSpan =
			result.messageDeliveryTime && !exclude?.date
				? `${new Date(result.messageDeliveryTime).toLocaleString()}`
				: "";
		let headerHtml = `${HEADER}${from(fromSpan)}${date(dateSpan)}`;

		if (!exclude?.to) {
			const toRecipients = result.recipients
				?.filter((recipient) => recipient.recipType === "to")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const toHtml = htmlAddress(toRecipients);
			headerHtml += to(toHtml);
		}
		if (!exclude?.cc) {
			const ccRecipients = result.recipients
				?.filter((recipient) => recipient.recipType === "cc")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const ccHtml = htmlAddress(ccRecipients);
			headerHtml += cc(ccHtml);
		}
		if (!exclude?.bcc) {
			const bccRecipients = result.recipients
				?.filter((recipient) => recipient.recipType === "bcc")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const bccHtml = htmlAddress(bccRecipients);
			headerHtml += bcc(bccHtml);
		}

		if (!exclude?.attachments) {
			const attachmentsHtml = result?.attachments
				? (result.attachments as MessageFieldData[])
						.map((att) => {
							if (att.content)
								return `<a href=\"data:${att.content};base64,${att.content.toString()}\" download=\"${att.fileName}\">${att.fileName}</a>`;
						})
						.join("<br>")
				: undefined;
			headerHtml += attachments(attachmentsHtml);
		}
		headerHtml += `${END}<p>${result?.htmlString ?? ""}</p>`;
		return headerHtml;
	}
	async getAttachments(options?: ParseOptions) {
		const result = await this.parse(options);
		return result.attachments as MessageFieldData[];
	}
}
