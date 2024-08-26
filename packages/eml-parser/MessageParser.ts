import { simpleParser, type ParsedMail } from 'mailparser';
import * as pdf from "html-pdf";
import MsgReader, { type FieldsData } from "@kenjiuno/msgreader";
import { decompressRTF } from "@kenjiuno/decompressrtf";
import * as iconv from 'iconv-lite';
import * as rtfParser from "rtf-stream-parser";
import { header, from, end, attachments, to, date, bcc, cc, subject } from './src/utils';
import { Readable } from 'stream';
import type { ParseOptions } from './src/interface';
import { stream2Buffer } from './src/utils';
import type { CreateResult } from 'html-pdf';
import type { ReadStream } from 'fs';

export interface UpgradedFieldData extends FieldsData {
	content?: Uint8Array;
	htmlString?: string;
}

export class MessageParser {
	fileReadStream: Readable;
	//@ts-ignore
	parsedMail: UpgradedFieldData;
	constructor(fileReadStream: Readable) {
		this.fileReadStream = fileReadStream;
	}

	

	async parseMessage(options?: ParseOptions) {
		let buffer = await stream2Buffer(this.fileReadStream);
		let emailData = new MsgReader(buffer);
		this.parsedMail = emailData.getFileData();
		//@ts-ignore
		let outputArray = decompressRTF(this.parsedMail.compressedRtf);
		let decompressedRtf = Buffer.from(outputArray).toString("ascii");
		this.parsedMail.attachments = (this.parsedMail.attachments as UpgradedFieldData[])?.map(att => {
			att.content = emailData.getAttachment(att).content;
			return att;
		});
		this.parsedMail.htmlString = rtfParser.deEncapsulateSync(decompressedRtf, { decode: iconv.decode }).text.toString();
		if (options && options.highlightKeywords) {
			if (!Array.isArray(options.highlightKeywords)) throw new Error('err: highlightKeywords is not an array, expected: String[]');
			let flags = 'gi';
			if (options.highlightCaseSensitive) flags = 'g';
			options.highlightKeywords.forEach(keyword => {
				this.parsedMail.htmlString = this.parsedMail.htmlString?.replace(new RegExp(keyword, flags), function (str) { return `<mark>${str}</mark>`; });
			});
		}
		delete this.parsedMail.compressedRtf;
		return this.parsedMail;
	}

	async getMessageHeaders() {
		const result = await this.parseMessage();
		const header = {
			subject: result.subject,
			from: [{
				name: result.senderName,
				address: result.senderEmail
			}],
			bcc: result.recipients?.filter(recipient => recipient.recipType === 'bcc').map(recipient => {
				return {
					name: recipient.name,
					address: recipient.email
				}
			}),
			cc: result.recipients?.filter(recipient => recipient.recipType === 'cc').map(recipient => {
				return {
					name: recipient.name,
					address: recipient.email
				}
			}),
			to: result.recipients?.filter(recipient => recipient.recipType === 'to').map(recipient => {
				return {
					name: recipient.name,
					address: recipient.email
				}
			}),
			date: result.messageDeliveryTime
		}
		return header;
	}

	async getMessageBodyHtml(options?: ParseOptions) {
		const result = await this.parseMessage(options);
		return result.htmlString;
	}

	async getMessageAsHtml(options?: ParseOptions) {
		const result = await this.parseMessage(options);
		if (!result) throw new Error('No message found');
		const bccRecipients = result.recipients?.filter(recipient => recipient.recipType === 'bcc').map(recipient => { return { name: recipient.name, address: recipient.email }; });
		let toRecipients = result.recipients?.filter(recipient => recipient.recipType === 'to').map(recipient => { return { name: recipient.name, address: recipient.email }; });
		let ccRecipients = result.recipients?.filter(recipient => recipient.recipType === 'cc').map(recipient => { return { name: recipient.name, address: recipient.email }; });
		let toHtml = '';
		let ccHtml = '';
		let bccHtml = '';
		toRecipients?.forEach(recipient => {
			toHtml += `<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` + ';';
		});
		bccRecipients?.forEach(recipient => {
			bccHtml += `<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` + ';';
		});
		ccRecipients?.forEach(recipient => {
			ccHtml += `<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` + ';';
		});
		const fromSpan = `<a href=\"mailto:${result.senderEmail ?? result.lastModifierName}\" class=\"mp_address_email\">${result.senderEmail ?? result.lastModifierName}</a></span>`;
		const dateSpan = result.messageDeliveryTime ? `${new Date(result.messageDeliveryTime).toLocaleString()}` : "";
		let headerHtml = `${header}${from(fromSpan)}${date(dateSpan)}`;
		if (toHtml) {
			headerHtml = headerHtml + to(toHtml);
		}
		if (ccHtml) {
			headerHtml = headerHtml + cc(ccHtml);
		}
		if (bccHtml) {
			headerHtml = headerHtml + bcc(bccHtml);
		}
		if (result.attachments) {
			const attachmentsHtml = (result.attachments as UpgradedFieldData[])
				.map(
					(att) =>
						`<a href=\"data:${att.content};base64,${att.content!.toString()}\" download=\"${att.fileName}\">${att.fileName}</a>`,
				)
				.join("<br>");
			headerHtml = headerHtml + attachments(attachmentsHtml);
		}
		headerHtml = headerHtml + end + `<p>${result.htmlString}</p>`;
		return headerHtml;
	}

	async convertMessageToStream(type?: "png" | "jpeg" | "pdf", orientation: "portrait" | "landscape" = "landscape", format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid", options?: ParseOptions) {
		try {
			const html = await this.getMessageAsHtml(options);
			return await new Promise<ReadStream>((resolve, reject) => {
			  pdf.create(html, {type, format, orientation}).toStream((err, res) => {
				if (err) {
				  reject(err);
				} else {
				  resolve(res);
				}
			  });
			});
		  } catch (err) {
			throw err;
		  }
	}

	async getMessageAttachments(options?: ParseOptions) {
		const result = await this.parseMessage(options);
		return result.attachments as UpgradedFieldData[];
	}
}