import type { DateFormat } from "./options.js";

export interface FormatText {
	END: string;
	dateFormat: DateFormat;
	cc(cc: string): string;
	bcc(cci: string): string;
	to(to: string): string;
	subject(subject?: string): string;
	attachments(attachments?: string): string;
	from(from?: string): string;
	date(date: Date | string): string;
	HEADER(title?: string, customStyle?: string): string;
}
