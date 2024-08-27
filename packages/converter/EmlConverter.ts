import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import { PDFDocument } from "pdf-lib";
import { EmlParser } from "mail-export";

const filePath = normalize("test_SA.eml");
const email = createReadStream(filePath);
const emailParser = new EmlParser(email);

async function createAttachment() {
	const attachments = await emailParser.getAttachments();
	if (!attachments) throw new Error("No attachments found");
	for (const attachment of attachments) {
		//convert to file with attachment.content as Uint8Array
		if (!attachment || !attachment.content || !attachment.filename) continue;
		if (attachment.contentType === ".pdf") {
			const pdfDoc = await PDFDocument.load(attachment.content);
			const pdfBytes = await pdfDoc.save();
			writeFileSync(attachment.fileName, pdfBytes);

		} else {
			writeFileSync(attachment.fileName, attachment.content);
		}
	}
}
