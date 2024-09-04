import { Convert, EmlParser } from "./src";
import fs from "fs";
import path from "path"
const inputs = path.normalize("tests/inputs")
const filePath = path.join(inputs, "test_SA_3.eml");
const file = fs.createReadStream(filePath);
const emlParser = new EmlParser(file)
const html = await emlParser.getAsHtml({ excludeHeader: { embeddedAttachments: true } });
if (!html) throw "unexpected error"
const convert = new Convert(html);
fs.writeFileSync("new.html", convert.html);
await convert.createPdf("sample.pdf", {
	printBackground: true,
	headless: true,
	format: "A4",
	width: "21cm",
	height: "29.7cm",
	margin: {
		top: "1.30cm", left: "1.30cm", right: "1.30cm", bottom: "1.30cm"
	}
})
console.log("done")
