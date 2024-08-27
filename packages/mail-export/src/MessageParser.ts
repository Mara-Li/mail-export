import * as pdf from "html-pdf";
import MsgReader, { type FieldsData } from "@kenjiuno/msgreader";
import { decompressRTF } from "@kenjiuno/decompressrtf";
import * as iconv from "iconv-lite";
import * as rtfParser from "rtf-stream-parser";
import {
	header,
	from,
	end,
	attachments,
	to,
	date,
	bcc,
	cc,
	htmlAdress,
} from "./utils";
import { Readable } from "stream";
import type {
	Header,
	ParseOptions,
	Parser,
	UpgradedFieldData,
} from "./interface";
import { stream2Buffer } from "./utils";

export class MessageParser implements Parser {
	fileReadStream: Readable;
	//@ts-ignore
	parsedMail: UpgradedFieldData;
	constructor(fileReadStream: Readable) {
		this.fileReadStream = fileReadStream;
	}

	async parse(options?: ParseOptions) {
		if (this.parsedMail) return this.parsedMail;
		let buffer = await stream2Buffer(this.fileReadStream);
		let emailData = new MsgReader(buffer);
		const emailFieldsData = emailData.getFileData() as UpgradedFieldData;
		//@ts-ignore
		let outputArray = decompressRTF(emailFieldsData.compressedRtf);
		let decompressedRtf = Buffer.from(outputArray).toString("ascii");
		emailFieldsData.attachments = (
			emailFieldsData.attachments as UpgradedFieldData[]
		)?.map((att) => {
			att.content = emailData.getAttachment(att).content;
			return att;
		});
		emailFieldsData.htmlString = rtfParser
			.deEncapsulateSync(decompressedRtf, { decode: iconv.decode })
			.text.toString();
		if (options && options.highlightKeywords) {
			if (!Array.isArray(options.highlightKeywords))
				throw new Error(
					"err: highlightKeywords is not an array, expected: String[]",
				);
			let flags = "gi";
			if (options.highlightCaseSensitive) flags = "g";
			options.highlightKeywords.forEach((keyword) => {
				emailFieldsData.htmlString = emailFieldsData.htmlString?.replace(
					new RegExp(keyword, flags),
					function (str) {
						return `<mark>${str}</mark>`;
					},
				);
			});
		}
		delete emailFieldsData.compressedRtf;
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
		let headerHtml = `${header}${from(fromSpan)}${date(dateSpan)}`;

		if (result.recipients) {
			if (!exclude?.to) {
				const toRecipients = result.recipients
					?.filter((recipient) => recipient.recipType === "to")
					.map((recipient) => {
						return { name: recipient.name, address: recipient.email };
					});
				const toHtml = htmlAdress(toRecipients);
				headerHtml += to(toHtml);
			}
			if (!exclude?.cc) {
				const ccRecipients = result.recipients
					?.filter((recipient) => recipient.recipType === "cc")
					.map((recipient) => {
						return { name: recipient.name, address: recipient.email };
					});
				const ccHtml = htmlAdress(ccRecipients);
				headerHtml += cc(ccHtml);
			}
			if (!exclude?.bcc) {
				const bccRecipients = result.recipients
					?.filter((recipient) => recipient.recipType === "bcc")
					.map((recipient) => {
						return { name: recipient.name, address: recipient.email };
					});
				const bccHtml = htmlAdress(bccRecipients);
				headerHtml += bcc(bccHtml);
			}
		}

		if (result.attachments && !exclude?.attachments) {
			const attachmentsHtml = (result.attachments as UpgradedFieldData[])
				.map(
					(att) =>
						`<a href=\"data:${att.content};base64,${att.content!.toString()}\" download=\"${att.fileName}\">${att.fileName}</a>`,
				)
				.join("<br>");
			headerHtml += attachments(attachmentsHtml);
		}
		headerHtml += end + `<p>${result.htmlString}</p>`;
		return headerHtml;
	}
	async getAttachments(options?: ParseOptions) {
		const result = await this.parse(options);
		return result.attachments as UpgradedFieldData[];
	}
}
