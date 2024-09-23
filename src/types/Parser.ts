import type { Readable } from "node:stream";
import type { Attachment, ParsedMail } from "mailparser";
import type { Header, MessageFieldData } from "./interface.js";
import type { EmlOptions, MessageOptions } from "./options.js";

type ParseOptions = EmlOptions | MessageOptions;

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
	 * @returns {Attachment[]} - The embedded attachments
	 */
	getEmbedded(): Attachment[];
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
