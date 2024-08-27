import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import { EmlParser, Convert } from "mail-export";

const filePath = normalize("tests/inputs/test_SA.eml");
const email = createReadStream(filePath);
const emailParser = new EmlParser(email);

async function createAttachment() {
	const attachments = await emailParser.getAttachments({
		ignoreEmbedded: false,
	});
	if (!attachments) throw new Error("No attachments found");
	for (const attachment of attachments) {
		//convert to file with attachment.content as Uint8Array
		if (!attachment || !attachment.content || !attachment.filename) continue;
		console.log(attachment.contentType);
		writeFileSync(attachment.filename, attachment.content);
	}
}

async function createPdf() {
	const html = await emailParser.getAsHtml({ excludeHeader: { embeddedAttachments: true } });
	if (!html) throw new Error("No message found");
	writeFileSync("test_SA.html", html);
	const converter = new Convert(html);
	const pdf = await converter.convertToStream("pdf");
	const writeStream = createWriteStream("test_SA.pdf");
	pdf.pipe(writeStream);
	pdf.on("error", (err: Error) => {
		console.error(err);
	});
	writeStream.on("error", (err) => {
		console.error(err);
	});
	writeStream.on("finish", () => {
		console.log("pdf created");
	});
}

createAttachment();
createPdf();
