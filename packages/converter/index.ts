import {
	createReadStream,
	createWriteStream,
	writeFileSync,
} from "node:fs";
import { normalize } from "node:path";
const filePath = normalize("test_SA.msg");
const email = createReadStream(filePath);
import { PDFDocument } from "pdf-lib";
import {MessageParser} from "eml-parser/MessageParser";

const attachments = await new MessageParser(email).getMessageAttachments();
if (!attachments) throw new Error("No attachments found");
for (const attachment of attachments) {
	//convert to file with attachment.content as Uint8Array
	if (!attachment || !attachment.content || !attachment.fileName) continue;
	console.log(attachment.extension)
	if (attachment.extension === ".pdf") {
		const pdfDoc = await PDFDocument.load(attachment.content);
		const pdfBytes = await pdfDoc.save();
		writeFileSync(attachment.fileName, pdfBytes);
		console.log("pdf attachment found" + attachment.fileName);
	}
	else {
		console.log("non-pdf attachment found" + attachment.fileName);
		writeFileSync(attachment.fileName, attachment.content);
	}
}

/*
const msgParser = await new MessageParser(email).convertMessageToStream("pdf");
const writeStream = createWriteStream("test_SA.pdf");
msgParser.pipe(writeStream);
msgParser.on("end", () => console.log("done"));
*/