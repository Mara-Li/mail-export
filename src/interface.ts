import type { Readable } from "node:stream";
import type { FieldsData } from "@kenjiuno/msgreader";
import type { Attachment, ParsedMail } from "mailparser";
import type { EmlParser } from "./EmlParser";
import type { MessageParser } from "./MessageParser";

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
	/**
	 * Allow to modify the HEADER of the result pdf/html
	 */
	excludeHeader?: Partial<ExcludeHeader>;

	/**
	 * Allow to modify the style in the resulting html
	 */
	customStyle?: string;
}

/**
 * Allow to exclude some HEADER from the html output
 * See {Header} for the list of HEADER
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
	/** Wil ignore only embedded attachments ; Only exist for eml files*/
	embeddedAttachments: boolean;
};

/**
 * An upgraded version of the FieldsData from msgreader
 * Only used for the msg format
 */
export interface MessageFieldData extends FieldsData {
	content?: Uint8Array;
	htmlString?: string;
	filename?: string;
}

/**
 * Parse the adresse into a digestable format
 */
export interface MailAddress {
	name?: string;
	address?: string;
}

/**
 * Header of the mail, with adresse, subject, date
 */
export interface Header {
	subject?: string;
	from?: MailAddress[];
	bcc?: MailAddress[];
	cc?: MailAddress[];
	to?: MailAddress[];
	/**
	 * Doesn't exist in the msg format, only in the eml format
	 */
	replyTo?: MailAddress[];
	date?: string | Date;
	attachments?: Attachment[] | MessageFieldData[];
}

interface Parser {
	fileReadStream: Readable;
	parsedMail: MessageFieldData | ParsedMail;
	options?: ParseOptions;

	/**
	 * Parse the HEADER of the mail, including attachments
	 * @returns {Header} - Header of the mail
	 */

	getHeader(): Header | undefined;
	/**
	 * Get the attachments and their contents
	 */
	getAttachments(): MessageFieldData[] | Attachment[];

	/**
	 * Only return the body of the mail, without formatting the HEADER fields
	 * @returns {string} - The body of the mail as a html string
	 */
	getBodyHtml(): string | undefined;
}

export interface IEml extends Parser {
	/**
	 * Allow to get only the embedded attachments of a eml file
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {Attachment[]} - The embedded attachments
	 */
	getEmbedded(options?: ParseOptions): Attachment[];
	/**
	 * Return the content of the mail as a html string, including HEADER and attachments as field in the html
	 * Attachment can be download if the html is directly written in a file
	 * @param {ParseOptions} options  - Options to modify the parsing behavior
	 * @returns {Promise<string|undefined>} - The mail as a html string
	 */
	getAsHtml(options?: ParseOptions): Promise<string | undefined>;
}

export interface IMsg extends Parser {
	/**
	 * Return the content of the mail as a html string, including HEADER and attachments as field in the html
	 * Attachment can be download if the html is directly written in a file
	 * @param {ParseOptions} options  - Options to modify the parsing behavior
	 * @returns {string} - The mail as a html string
	 */
	getAsHtml(options?: ParseOptions): string | undefined;
}
