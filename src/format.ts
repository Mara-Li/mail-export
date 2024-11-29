import { formatInTimeZone } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import dedent from "dedent";
import type { MailAddress } from "./types/interface.js";
import type { DateFormat } from "./types/options.js";

export class Format {
	END = "</table><br>";
	dateFormat: DateFormat = {
		format: "EEEE d MMMM yyyy HH:mm",
		locale: enUS,
		timeZone: "UTC",
	};
	constructor(dateFormat?: DateFormat) {
		if (dateFormat) this.dateFormat = dateFormat;
	}

	/**
	 * Format the "cc" field in the table
	 * @param {string} cc - The "cc" field of the email
	 */
	cc(cc: string) {
		return `<tr><td class="label">Cc:</td><td>${cc}</td></tr>`;
	}

	/**
	 * Format the "bcc" field in the table
	 * @param {string} bcc - The "bcc" field of the email
	 */
	bcc(bcc: string) {
		return `<tr><td class="label">Bcc:</td><td>${bcc}</td></tr>`;
	}

	/**
	 * Format the "to" field in the table
	 * @param {string} to - The "to" field of the email
	 */
	to(to: string) {
		return `<tr><td class="label">To:</td><td>${to}</td></tr>`;
	}

	/**
	 * Format the "subject" field in the table
	 * @param {string} subject - The "subject" field of the email
	 */
	subject(subject?: string) {
		if (!subject) return "";
		return `<tr><td class="label">Subject:</td><td>${subject}</td></tr>`;
	}

	/**
	 * Format the "attachments" field in the table
	 * @param attachments - The "attachments" field of the email
	 */
	attachments(attachments?: string) {
		if (!attachments)
			return '<tr><td class="label">Attachments:</td><td>/</td></tr>';
		return `<tr><td class="label">Attachments:</td><td>${attachments}</td></tr>`;
	}

	/**
	 * Format the "from" field in the table
	 * @param {string} from
	 */
	from(from?: string) {
		if (!from) return `<table class="email-info">`;
		return `<div class="header">${from}</div><div class="underline"></div><table class="email-info">`;
	}

	private formatDate(date: Date) {
		const { format: fmt, locale, timeZone } = this.dateFormat;
		return formatInTimeZone(date, timeZone, fmt, { locale });
	}

	/**
	 * Format the "date" field in the table with the given format
	 * @param {Date|string} date - The "date" field of the email
	 */
	date(date?: Date | string) {
		const empty = `<tr><td class="label">Sent:</td><td></td></tr>`;
		if (!date) return empty;
		if (typeof date === "string") {
			if (date.trim().length === 0) {
				return empty;
			}
			//convert date to Date
			const dated = new Date(date);
			return `<tr><td class="label">Sent:</td><td>${this.formatDate(dated)}</td></tr>`;
		}
		return `<tr><td class="label">Sent:</td><td>${this.formatDate(date)}</td></tr>`;
	}

	/**
	 * Default CSS for the email and title
	 * @param {string|undefined} title - the "object" field of the email
	 * @param {string|undefined} customStyle - custom CSS for the email
	 */
	defaultHtmlHead(title?: string, customStyle?: string) {
		let header = dedent(`
	<head>
		<title>${title}</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<style>
	`);
		if (customStyle) header += customStyle;
		else {
			header += dedent(`
			@font-face {
				font-family:"Cambria Math";
				panose-1:2 4 5 3 5 4 6 3 2 4;
			}
			@font-face {
				font-family:Aptos;
				panose-1:2 11 0 4 2 2 2 2 2 4;
			}
			body, html {
				font-family: Aptos, Arial, "Cambria Math", sans-serif;
			}
			.header {
				font-weight: bold;
				font-size: 18px;
			}
			.underline {
				border-bottom: 5px solid black;
				margin: 0 0 0.3rem 0;
			}
			.email-info {
				width: 100%;
				border-collapse: collapse;
			}
			.label {
				font-weight: bold;
				width: 100px;
				vertical-align: top;
				padding-right: 2em;
			}
		`);
		}
		header += dedent(`
		</style>
	</head>`);
		return header;
	}

	/**
	 * Format the given address in a format with "mailto" and the class "mp_address_email" (default)
	 * @param {MailAddress[] | undefined} addresses
	 * @param {string} emailStyle - custom style for the email. Needs to use {{name}} and {{email}} as template to
	 * create custom format.
	 * The mail will be joined with "; " as separator
	 */
	htmlAddress(addresses?: MailAddress[], emailStyle?: string) {
		if (!addresses) return "";
		const html: string[] = [];
		for (const address of addresses) {
			if (address.name && address.address) {
				if (emailStyle) {
					html.push(
						emailStyle
							.replaceAll("{{name}}", address.name)
							.replaceAll("{{email}}", address.address),
					);
				} else
					html.push(
						`<a href=\"mailto:${address.address}\" class=\"mp_address_email\">${address.name}</a>`,
					);
			}
		}
		return html.join("; ");
	}
}
