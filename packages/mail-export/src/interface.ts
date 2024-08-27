import type { FieldsData } from "@kenjiuno/msgreader";
import type { AddressObject, Attachment, ParsedMail } from "mailparser";
import type { ReadStream } from "node:fs";
import type { Readable } from "node:stream";

export interface ParseOptions {
	/**
	 * Ignores embedded attachments while parsing email eml attachments
	 */
	ignoreEmbedded?: boolean;
	/**
	 * highlight with <mark></mark> html a specific keyword in the email html content
	 * example: [foo, bar] will highlight foo and bar in the email html content
	 */
	highlightKeywords?: string[];
	/**
	 * The hightlight detection will be case sensitive
	 */
	highlightCaseSensitive?: boolean;
	excludeHeader?: Partial<ExcludeHeader>;
}

/**
 * Allow to exclude some header from the html output
 * See {Header} for the list of header
 */
type ExcludeHeader = {
	bcc: boolean;
	cc: boolean;
	to: boolean;
	from: boolean;
	date: boolean;
	subject: boolean;
	replyTo: boolean;
	/** Will ignore **all** attachments */
	attachments: boolean;
	/** Wil ignore only embedded attachments */
	embeddedAttachments: boolean;
};

export interface UpgradedFieldData extends FieldsData {
	content?: Uint8Array;
	htmlString?: string;
}

/**
 * Parse the adresse into a digestable format
 */
export interface MailAdress {
	name?: string;
	address?: string;
}

/**
 * Header of the mail, with adresse, subject, date
 */
export interface Header {
	subject?: string;
	from?: MailAdress[];
	bcc?: MailAdress[];
	cc?: MailAdress[];
	to?: MailAdress[];
	/**
	 * Doesn't exist in the msg format, only in the eml format
	 */
	replyTo?: MailAdress[];
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

	getAsHtml(options?: ParseOptions): Promise<string | undefined>;
	getBodyHtml(options?: ParseOptions): Promise<string | undefined>;
}
