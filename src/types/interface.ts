import type { FieldsData } from "@kenjiuno/msgreader";
import type { Attachment } from "mailparser";

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
