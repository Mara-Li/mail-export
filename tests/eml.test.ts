import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { Convert } from "../dist/Converter.js";
import { EmlParser } from "../dist/EmlParser.js";
const inputs = path.normalize("tests/inputs/EML");
const output = path.normalize("tests/outputs/EML");
const input = "Sample with attachments pdf";

const file = fs.createReadStream(path.join(inputs, `${input}.eml`));
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
test("List attachments", async () => {
	const attachments = emlParser.getAttachments();
	console.log(attachments.length);
	expect(attachments).toBeDefined();
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
	expect(
		converted.createPdf(path.join(output, "pdf", `${input}.pdf`), {
			headless: true,
		}),
	).pass;
});
