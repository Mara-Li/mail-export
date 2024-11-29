import { formatInTimeZone } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import dedent from "dedent";
import type { FormatText } from "./types/Format.js";
import type { MailAddress } from "./types/interface.js";
import type { DateFormat } from "./types/options.js";

export class Format implements FormatText {
	END = "</table><br>";
	dateFormat: DateFormat = {
		format: "EEEE d MMMM yyyy HH:mm",
		locale: enUS,
		timeZone: "UTC",
	};
	constructor(dateFormat?: DateFormat) {
		if (dateFormat) this.dateFormat = dateFormat;
	}

	cc(cc: string) {
		return `<tr><td class="label">Cc:</td><td>${cc}</td></tr>`;
	}
	bcc(cci: string) {
		return `<tr><td class="label">Bcc:</td><td>${cci}</td></tr>`;
	}
	to(to: string) {
		return `<tr><td class="label">To:</td><td>${to}</td></tr>`;
	}
	subject(subject?: string) {
		if (!subject) return "";
		return `<tr><td class="label">Subject:</td><td>${subject}</td></tr>`;
	}

	attachments(attachments?: string) {
		if (!attachments)
			return '<tr><td class="label">Attachments:</td><td>/</td></tr>';
		return `<tr><td class="label">Attachments:</td><td>${attachments}</td></tr>`;
	}

	from(from?: string) {
		if (!from) return `<table class="email-info">`;
		return `<div class="header">${from}</div><div class="underline"></div><table class="email-info">`;
	}

	private formatDate(date: Date) {
		const { format: fmt, locale, timeZone } = this.dateFormat;
		return formatInTimeZone(date, timeZone, fmt, { locale });
	}

	date(date: Date | string) {
		if (typeof date === "string") {
			if (date.trim().length === 0) {
				return `<tr><td class="label">Sent:</td><td></td></tr>`;
			}
			//convert date to Date
			const dated = new Date(date);
			return `<tr><td class="label">Sent:</td><td>${this.formatDate(dated)}</td></tr>`;
		}
		return `<tr><td class="label">Sent:</td><td>${this.formatDate(date)}</td></tr>`;
	}
	HEADER(title?: string, customStyle?: string) {
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
