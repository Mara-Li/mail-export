import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { Convert } from "../src";
import { EmlParser } from "../src";
const inputs = path.normalize("tests/inputs");
const output = path.normalize("tests/outputs");

describe("EML testing", async () => {
	const file = fs.createReadStream(path.join(inputs, "EML", "test_SA_2.eml"));
	const emlParser = await EmlParser.init(file, {
		formatEmailAddress: '<a href="mailto:{{email}}">{{email}}</a>',
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
		fs.writeFileSync(path.join(output, "html-eml.html"), html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined();
	});
	test("Output pdf", async () => {
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "sample-eml.pdf"))).pass;
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
		fs.writeFileSync(path.join(output, "html-msg.html"), html);
		const converted = new Convert(html);
		const buffer = await converted.convertToBuffer();
		expect(buffer).toBeDefined();
	});
	test("Output pdf", async () => {
		const emlParser = await EmlParser.init(file);
		const html = await emlParser.getAsHtml();
		if (!html) throw "unexpected error";
		const converted = new Convert(html);
		expect(await converted.createPdf(path.join(output, "sample-msg.pdf"))).pass;
	});
});
