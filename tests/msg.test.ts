import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { Convert, MessageParser } from "mail-export";
const inputs = path.normalize("tests/inputs/Msg");
const output = path.normalize("tests/outputs/Msg");
const input = "test";

const file = fs.createReadStream(path.join(inputs, `${input}.msg`));
test("MSG to HTML", async () => {
	const emlParser = await MessageParser.init(file);
	const html = await emlParser.getAsHtml();
	expect(html).toBeDefined();
});
test("convert to Buffer", async () => {
	const emlParser = await MessageParser.init(file);
	const html = emlParser.getAsHtml();
	if (!html) throw "unexpected error";
	fs.writeFileSync(path.join(output, "html", `${input}.html`), html);
	const converted = new Convert(html);
	const buffer = await converted.convertToBuffer();
	expect(buffer).toBeDefined();
});
test("Output pdf", async () => {
	const emlParser = await MessageParser.init(file);
	const html = emlParser.getAsHtml();
	if (!html) throw "unexpected error";
	const converted = new Convert(html);
	expect(await converted.createPdf(path.join(output, "pdf", `${input}.pdf`)))
		.pass;
});
