import type { FieldsData } from "@kenjiuno/msgreader";
import type { AddressObject, Attachment, ParsedMail } from "mailparser";
import type { ReadStream } from "node:fs";
import type { Readable } from "node:stream";

export interface ParseOptions {
	/**
	 * Ignores embedded attachments while parsing email eml attachments
	 */
	ignoreEmbedded?: boolean;
	highlightKeywords?: string[];
	highlightCaseSensitive?: boolean;
}
export interface UpgradedFieldData extends FieldsData {
	content?: Uint8Array;
	htmlString?: string;
}

export interface MailAdress {
	name?: string;
	address?: string;
}

export interface Header {
	subject?: string;
	from?: MailAdress[];
	bcc?: MailAdress[];
	cc?: MailAdress[];
	to?: MailAdress[];
	date?: string | Date;
}

export interface Parser {
	fileReadStream: Readable;
	parsedMail: UpgradedFieldData | ParsedMail;
	parse(
		options?: ParseOptions,
	): Promise<UpgradedFieldData | ParsedMail | undefined>;
	getHeader(options?: ParseOptions): Promise<Header | undefined>;
	getAttachments(
		options?: ParseOptions,
	): Promise<UpgradedFieldData[] | Attachment[]>;
	
	getAsHtml(options?: ParseOptions, embedded?: boolean): Promise<string | undefined>;
	getBodyHtml(options?: ParseOptions): Promise<string | undefined>;

	
}
