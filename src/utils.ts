import type { Readable } from "node:stream";
import type { MailAddress } from "./interface";

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

export const date = (date: string) =>
	`<tr><td class="label">Date:</td><td>${date}</td></tr>`;

export const end = "</table>";

export const header = `<head>
    <style>
        
        @font-face
                {font-family:"Cambria Math";
                panose-1:2 4 5 3 5 4 6 3 2 4;
                mso-font-charset:0;
                mso-generic-font-family:roman;
                mso-font-pitch:variable;
                mso-font-signature:-536869121 1107305727 33554432 0 415 0;}
        @font-face
                {font-family:Aptos;
                panose-1:2 11 0 4 2 2 2 2 2 4;
                mso-font-charset:0;
                mso-generic-font-family:swiss;
                mso-font-pitch:variable;
                mso-font-signature:536871559 3 0 0 415 0;}
        body, html {
            font-family: Aptos, sans-serif;
        }
        .header {
            font-weight: bold;
            font-size: 18px;
        }
        .underline {
            border-bottom: 1px solid black;
            margin: 10px 0;
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
</head>`;
export function htmlAddress(addresses?: MailAddress[]) {
	if (!addresses) return "";
	const html: string[] = [];
	for (const address of addresses) {
		if (address.name && address.address)
			html.push(
				`<a href=\"mailto:${address.address}\" class=\"mp_address_email\">${address.name}</a>`,
			);
	}
	return html.join("; ");
}
