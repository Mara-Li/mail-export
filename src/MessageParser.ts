import type { Readable } from "node:stream";
import { decompressRTF } from "@kenjiuno/decompressrtf";
import MsgReader, { type FieldsData } from "@kenjiuno/msgreader";
import * as iconv from "iconv-lite";
import { JSDOM } from "jsdom";
import * as rtfParser from "rtf-stream-parser";
import type { IMsg } from "./types/Parser.js";
import type {
	Header,
	MailAddress,
	MessageFieldData,
} from "./types/interface.js";
import type { MessageOptions } from "./types/options.js";
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
	subject,
	to,
} from "./utils.js";

export class MessageParser implements IMsg {
	fileReadStream: Readable;
	parsedMail!: MessageFieldData;
	options?: MessageOptions;
	private constructor(fileReadStream: Readable, options?: MessageOptions) {
		this.fileReadStream = fileReadStream;
		this.options = options;
	}

	/**
	 * Initialize the MessageParser
	 * @param fileReadStream {Readable} - The file to parse
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {Promise<MessageParser>} - The EmlParser instance
	 */
	public static async init(
		fileReadStream: Readable,
		options?: MessageOptions,
	): Promise<MessageParser> {
		return await new MessageParser(fileReadStream, options).parse();
	}

	private async parse() {
		const messageParser = new MessageParser(this.fileReadStream, this.options);
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
		const domParser = new JSDOM(emailFieldsData.htmlString);
		emailFieldsData.htmlString = domParser.window.document.body.innerHTML;
		if (this.options?.highlightKeywords) {
			if (!Array.isArray(this.options.highlightKeywords))
				throw new Error(
					"err: highlightKeywords is not an array, expected: String[]",
				);
			let flags = "gi";
			if (this.options?.highlightCaseSensitive) flags = "g";
			for (const keyword of this.options.highlightKeywords) {
				emailFieldsData.htmlString = emailFieldsData.htmlString?.replace(
					new RegExp(keyword, flags),
					(str) => `<mark>${str}</mark>`,
				);
			}
		}
		emailFieldsData.compressedRtf = undefined;
		messageParser.parsedMail = emailFieldsData;
		return messageParser;
	}

	getHeader() {
		const header: Header = {
			subject: this.parsedMail.subject,
			from: [
				{
					name: this.parsedMail.senderName,
					address: this.parsedMail.senderEmail,
				},
			],
			bcc: this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "bcc")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			cc: this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "cc")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			to: this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "to")
				.map((recipient) => {
					return {
						name: recipient.name,
						address: recipient.email,
					};
				}),
			date: this.parsedMail.messageDeliveryTime,
			attachments: this.parsedMail.attachments as MessageFieldData[],
		};
		return header;
	}

	getBodyHtml() {
		return this.parsedMail.htmlString;
	}

	getAsHtml(options?: MessageOptions) {
		if (options) this.options = options;
		const exclude = this.options?.excludeHeader;

		const fromRecipients: MailAddress[] = [
			{
				name: this.parsedMail.senderEmail ?? this.parsedMail.senderName,
				address: this.parsedMail.senderEmail ?? this.parsedMail.senderName,
			},
		];

		const fromSpan = !exclude?.from
			? htmlAddress(fromRecipients, this.options?.formatEmailAddress)
			: undefined;
		const dateSpan =
			this.parsedMail.messageDeliveryTime && !exclude?.date
				? new Date(this.parsedMail.messageDeliveryTime)
				: new Date();
		let headerHtml = `${HEADER(this.parsedMail.subject ?? "Email", this.options?.customStyle)}${from(fromSpan)}${date(dateSpan)}`;

		if (!exclude?.to) {
			const toRecipients = this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "to")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const toHtml = htmlAddress(
				toRecipients,
				this.options?.formatEmailAddress,
			);
			headerHtml += to(toHtml);
		}
		if (!exclude?.cc) {
			const ccRecipients = this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "cc")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const ccHtml = htmlAddress(
				ccRecipients,
				this.options?.formatEmailAddress,
			);
			headerHtml += cc(ccHtml);
		}
		if (!exclude?.bcc) {
			const bccRecipients = this.parsedMail.recipients
				?.filter((recipient) => recipient.recipType === "bcc")
				.map((recipient) => {
					return { name: recipient.name, address: recipient.email };
				});
			const bccHtml = htmlAddress(
				bccRecipients,
				this.options?.formatEmailAddress,
			);
			headerHtml += bcc(bccHtml);
		}

		if (!exclude?.attachments) {
			const attachmentsHtml = this.parsedMail?.attachments
				? (this.parsedMail.attachments as MessageFieldData[])
						.map((att) => {
							let fileName = att.fileName;
							if (!fileName) {
								const index = this.parsedMail.attachments?.indexOf(att);
								fileName = `attachment_${index}`;
							}
							if (att.content)
								return `<a href=\"data:${att.content};base64,${att.content.toString()}\" download=\"${fileName}\">${fileName}</a>`;
						})
						.join("<br>")
				: undefined;
			headerHtml += attachments(attachmentsHtml);
		}
		if (!exclude?.subject) headerHtml += subject(this.parsedMail.subject);
		headerHtml += `${END}<p>${this.parsedMail?.htmlString ?? ""}</p>`;
		return headerHtml;
	}
	getAttachments() {
		return this.parsedMail.attachments as MessageFieldData[];
	}
}
