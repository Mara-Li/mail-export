import { Convert, EmlParser } from "./src";
import fs from "fs";
import path from "path"
const inputs = path.normalize("tests/inputs")
const filePath = path.join(inputs, "test_SA.eml");
const file = fs.createReadStream(filePath);
const emlParser = new EmlParser(file)
const html = await emlParser.getAsHtml({ excludeHeader: { embeddedAttachments: true } });
if (!html) throw "unexpected error"
const convert = new Convert(html);
fs.writeFileSync("new.html", convert.html);
await convert.createPdf("sample.pdf", {
	printBackground: true, displayHeaderFooter: false,
	headless: true,
	format: "A4",
	margin: {
		top: "0px", bottom: "0px", left: "0px", right: "0px"
	}
})
console.log("done")
