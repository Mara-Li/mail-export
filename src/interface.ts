import type { FieldsData } from "@kenjiuno/msgreader";
import type { Attachment, ParsedMail } from "mailparser";
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
	/**
	 * Allow to modify the header of the result pdf/html
	 */
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
	attachments?: Attachment[] | MessageFieldData[];
}

export interface Parser {
	fileReadStream: Readable;
	parsedMail: MessageFieldData | ParsedMail;
	/**
	 * Primary function, allow to convert the readable into a parsed Mail to allow extracting the content, header...
	 * @note If there already a parsedMail, it will return it directly without re-parsing the file
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 */
	parse(
		options?: ParseOptions,
	): Promise<MessageFieldData | ParsedMail | undefined>;
	/**
	 * Parse the header of the mail, including attachments
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {Header} - Header of the mail
	 */
	getHeader(options?: ParseOptions): Promise<Header | undefined>;
	/**
	 * Get the attachments and their contents
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 */
	getAttachments(
		options?: ParseOptions,
	): Promise<MessageFieldData[] | Attachment[]>;
	/**
	 * Return the content of the mail as a html string, including header and attachments as field in the html
	 * Attachment can be download if the html is directly written in a file
	 * @param {ParseOptions} options  - Options to modify the parsing behavior
	 * @returns {string} - The mail as a html string
	 */
	getAsHtml(options?: ParseOptions): Promise<string | undefined>;
	/**
	 * Only return the body of the mail, without formatting the header fields
	 * @param options {ParseOptions} - Options to modify the parsing behavior
	 * @returns {string} - The body of the mail as a html string
	 */
	getBodyHtml(options?: ParseOptions): Promise<string | undefined>;
}
