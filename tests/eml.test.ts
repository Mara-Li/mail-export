import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { fr } from "date-fns/locale";
import { Convert, EmlParser } from "mail-export";
const inputs = path.normalize("tests/inputs/EML");
const output = path.normalize("tests/outputs/EML");
const input = "Sample";

const file = fs.createReadStream(path.join(inputs, `${input}.eml`));
describe("EML to PDF", async () => {
	const emlParser = await EmlParser.init(file, {
		formatEmailAddress:
			'<a href="mailto:{{email}}" class="mp_address_email">{{email}}</a>',
	});
	test("EML to HTML", async () => {
		const html = await emlParser.getAsHtml({
			excludeHeader: { embeddedAttachments: true },
		});
		expect(html).toBeDefined();
	});
	test("convert to Buffer", async () => {
		const html = await emlParser.getAsHtml({
			excludeHeader: { embeddedAttachments: true },
		});
		if (!html) throw "unexpected error";
		fs.writeFileSync(path.join(output, "html", `${input}.html`), html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined();
	});
	test("Output pdf", async () => {
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "pdf", `${input}.pdf`)))
			.pass;
	});
});

describe("header and attachments", async () => {
	const emlParser = await EmlParser.init(file);
	test("List attachments", async () => {
		const attachments = emlParser.getAttachments();
		console.log(attachments.length);
		expect(attachments).toBeDefined();
	});
});

describe("format date", async () => {
	const date = "2024-11-29T10:32:12.671Z";
	test("complete", async () => {
		const emlForDate = await EmlParser.init(file, {
			dateFormat: {
				locale: fr,
				timeZone: "Europe/Paris",
				format: "dd/MM/yyyy HH:mm",
			},
		});
		const formatted = emlForDate.format.date(date);
		const expected =
			'<tr><td class="label">Sent:</td><td>29/11/2024 11:32</td></tr>';
		expect(formatted).toBe(expected);
	});
	describe("partial", async () => {
		test("no timezone", async () => {
			const emlForDate = await EmlParser.init(file, {
				dateFormat: {
					format: "dd/MM/yyyy HH:mm",
					locale: fr,
				},
			});
			const formatted = emlForDate.format.date(date);
			const expected =
				'<tr><td class="label">Sent:</td><td>29/11/2024 10:32</td></tr>';
			expect(formatted).toBe(expected);
		});
		test("no locale", async () => {
			const emlForDate = await EmlParser.init(file, {
				dateFormat: {
					format: "dd/MM/yyyy HH:mm",
					timeZone: "Europe/Paris",
				},
			});
			const formatted = emlForDate.format.date(date);
			const expected =
				'<tr><td class="label">Sent:</td><td>29/11/2024 11:32</td></tr>';
			expect(formatted).toBe(expected);
		});
		test("no format", async () => {
			const emlForDate = await EmlParser.init(file, {
				dateFormat: {
					locale: fr,
					timeZone: "Europe/Paris",
				},
			});
			const formatted = emlForDate.format.date(date);
			const expected =
				'<tr><td class="label">Sent:</td><td>Vendredi 29 novembre 2024 11:32</td></tr>';
			expect(formatted).toBe(expected);
		});
		test("default", async () => {
			const emlForDate = await EmlParser.init(file);
			const formatted = emlForDate.format.date(date);
			const expected =
				'<tr><td class="label">Sent:</td><td>Friday 29 November 2024 10:32</td></tr>';
			expect(formatted).toBe(expected);
		});
	});
});
