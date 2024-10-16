import type { Readable } from "node:stream";
import { format } from "date-fns";
import dedent from "dedent";
import type { MailAddress } from "./types/interface.js";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function stream2Buffer(stream: Readable): Promise<any> {
	return new Promise((resolve, reject) => {
		const _buf: Uint8Array[] = [];

		stream.on("data", (chunk) => _buf.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(_buf)));
		stream.on("error", (err) => reject(err));
	});
}

export const cc = (cc: string) =>
	`<tr><td class="label">Cc:</td><td>${cc}</td></tr>`;

export const bcc = (cci: string) =>
	`<tr><td class="label">Bcc:</td><td>${cci}</td></tr>`;

export const to = (to: string) =>
	`<tr><td class="label">To:</td><td>${to}</td></tr>`;

export const subject = (subject?: string) => {
	if (!subject) return "";
	return `<tr><td class="label">Subject:</td><td>${subject}</td></tr>`;
};

export const attachments = (attachments?: string) => {
	if (!attachments)
		return '<tr><td class="label">Attachments:</td><td>/</td></tr>';
	return `<tr><td class="label">Attachments:</td><td>${attachments}</td></tr>`;
};

export const from = (from?: string) => {
	if (!from) return `<table class="email-info">`;
	return `<div class="header">${from}</div><div class="underline"></div><table class="email-info">`;
};

export const date = (date: Date | string) => {
	if (typeof date === "string")
		return `<tr><td class="label">Sent:</td><td></td></tr>`;

	return `<tr><td class="label">Sent:</td><td>${format(date, "EEEE d MMMM yyyy HH:mm")}</td></tr>`;
};

export const END = "</table><br>";

export function HEADER(title?: string, customStyle?: string) {
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

export function htmlAddress(addresses?: MailAddress[], emailStyle?: string) {
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
