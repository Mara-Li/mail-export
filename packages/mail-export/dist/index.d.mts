import { Readable as Readable$1 } from "stream";
import { FieldsData } from "@kenjiuno/msgreader";
import { ParsedMail, Attachment, AddressObject } from "mailparser";
import { ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { ReadStream as ReadStream$1 } from "fs";

interface ParseOptions {
	ignoreEmbedded?: boolean;
	highlightKeywords?: string[];
	highlightCaseSensitive?: boolean;
}
interface UpgradedFieldData extends FieldsData {
	content?: Uint8Array;
	htmlString?: string;
}
interface MailAdress {
	name?: string;
	address?: string;
}
interface Header {
	subject?: string;
	from?: MailAdress[];
	bcc?: MailAdress[];
	cc?: MailAdress[];
	to?: MailAdress[];
	date?: string | Date;
}
interface Parser {
	fileReadStream: Readable;
	parsedMail: UpgradedFieldData | ParsedMail;
	parse(
		options?: ParseOptions,
	): Promise<UpgradedFieldData | ParsedMail | undefined>;
	getHeader(options?: ParseOptions): Promise<Header | undefined>;
	getAttachments(
		options?: ParseOptions,
	): Promise<UpgradedFieldData[] | Attachment[]>;
	convertToStream(
		type?: "png" | "jpeg" | "pdf",
		orientation?: "portrait" | "landscape",
		format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid",
		options?: ParseOptions,
	): Promise<ReadStream>;
	_createAdress?(adress?: AddressObject | AddressObject[]): MailAdress[];
}

declare class MessageParser implements Parser {
	fileReadStream: Readable$1;
	parsedMail: UpgradedFieldData;
	constructor(fileReadStream: Readable$1);
	parse(options?: ParseOptions): Promise<UpgradedFieldData>;
	getHeader(options?: ParseOptions): Promise<{
		subject: string | undefined;
		from: {
			name: string | undefined;
			address: string | undefined;
		}[];
		bcc:
			| {
					name: string | undefined;
					address: string | undefined;
			  }[]
			| undefined;
		cc:
			| {
					name: string | undefined;
					address: string | undefined;
			  }[]
			| undefined;
		to:
			| {
					name: string | undefined;
					address: string | undefined;
			  }[]
			| undefined;
		date: string | undefined;
	}>;
	getBodyHtml(options?: ParseOptions): Promise<string | undefined>;
	getAsHtml(options?: ParseOptions): Promise<string>;
	convertToStream(
		type?: "png" | "jpeg" | "pdf",
		orientation?: "portrait" | "landscape",
		format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid",
		options?: ParseOptions,
	): Promise<ReadStream$1>;
	getAttachments(options?: ParseOptions): Promise<UpgradedFieldData[]>;
}

declare class EmlParser implements Parser {
	parsedMail: ParsedMail;
	fileReadStream: Readable$1;
	constructor(fileReadStream: Readable$1);
	parse(options?: ParseOptions): Promise<ParsedMail | undefined>;
	private createAdress;
	getHeader(options?: ParseOptions): Promise<Header | undefined>;
	getBodyHtml(options?: ParseOptions): Promise<string | undefined>;
	getAsHtml(options?: ParseOptions): Promise<string | undefined>;
	convertToStream(
		type?: "png" | "jpeg" | "pdf",
		orientation?: "portrait" | "landscape",
		format?: "A3" | "A4" | "A5" | "Legal" | "Letter" | "Tabloid",
		options?: ParseOptions,
	): Promise<ReadStream$1>;
	getAttachments(options?: ParseOptions): Promise<Attachment[]>;
}

export { EmlParser, MessageParser };
