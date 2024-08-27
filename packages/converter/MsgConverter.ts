import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import { PDFDocument } from "pdf-lib";
import { MessageParser, Convert } from "mail-export";

const filePath = normalize("test_SA.msg");
const email = createReadStream(filePath);
const emailParser = new MessageParser(email);

async function createAttachment() {
	const attachments = await emailParser.getAttachments();
	if (!attachments) throw new Error("No attachments found");
	for (const attachment of attachments) {
		//convert to file with attachment.content as Uint8Array
		if (!attachment || !attachment.content || !attachment.fileName) continue;
		if (attachment.extension === ".pdf") {
			const pdfDoc = await PDFDocument.load(attachment.content);
			const pdfBytes = await pdfDoc.save();
			writeFileSync(attachment.fileName, pdfBytes);

		} else {
			writeFileSync(attachment.fileName, attachment.content);
		}
	}
}

async function createPdfMail() {
	const html = await emailParser.getAsHtml();
	const converter = new Convert(html);
	const pdf = await converter.convertToStream("pdf");
	const writeStream = createWriteStream("test_SA.pdf");
	pdf.pipe(writeStream);
	pdf.on("error", (err:Error) => {
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
createPdfMail();
