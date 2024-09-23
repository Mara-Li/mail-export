import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { Convert } from "../src";
import { EmlParser } from "../src";
const inputs = path.normalize("tests/inputs");
const output = path.normalize("tests/outputs");

describe("EML testing", () => {
	const file = fs.createReadStream(path.join(inputs, "EML", "test_SA.eml"));
	test("EML to HTML", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml({
			excludeHeader: { embeddedAttachments: true },
		});
		expect(html).toBeDefined();
	});
	test("convert to Buffer", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml({
			excludeHeader: { embeddedAttachments: true },
		});
		if (!html) throw "unexpected error";
		fs.writeFileSync("new.html", html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined();
	});
	test("Output pdf", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "sample.pdf"))).pass;
	});
});

describe("MSG testing", () => {
	const file = fs.createReadStream(path.join(inputs, "Msg", "test.msg"));
	test("MSG to HTML", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml();
		expect(html).toBeDefined();
	});
	test("convert to Buffer", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		fs.writeFileSync("new.html", html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined();
	});
	test("Output pdf", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "sample.pdf"))).pass;
	});
});
