import path from "path";
import fs from "node:fs"
import { expect, test, describe } from "bun:test";
import { EmlParser } from "../src/EmlParser"
import { Convert } from "../src/Converter";
const inputs = path.normalize("tests/inputs")
const output = path.normalize("tests/outputs")

describe("EML testing", () => {
	const file = fs.createReadStream(path.join(inputs, "test_SA.eml"))
	test("EML to HTML", async () => {
		const emlParser = new EmlParser(file)
		const html = await emlParser.getAsHtml({ excludeHeader: { embeddedAttachments: true } });
		expect(html).toBeDefined;
	})
	test("convert to Buffer", async () => {
		const emlParser = new EmlParser(file)
		const html = await emlParser.getAsHtml({ excludeHeader: { embeddedAttachments: true } });
		if (!html) throw "unexpected error"
		fs.writeFileSync("new.html", html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined;
	})
	test("Output pdf", async () => {
		const emlParser = new EmlParser(file)
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error"
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "sample.pdf"))).pass;
	})
})