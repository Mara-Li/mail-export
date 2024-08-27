# Mail-Export

Parse .eml/.msg files or convert to pdf, html, jpeg or png format, and extract attachments to files.
Support typescript and javascript.

© [eml-parser](https://github.com/ankit1329/Eml-Parser)

## Installation

```bash
npm install mail-export
```

> [!Note]
> It is possible that you need additional dependencies to use the library.
> For example, pdf-lib is used to convert the email to pdf.

## Convert to PDF

The following script works the same for eml & msg files. It will use the Converter class to convert into a readable stream, that will be used thereafter to create a pdf file.

```typescript
import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import { EmlParser, Convert } from "mail-export";

const filePath = normalize("test_SA_3.eml"); //can also be a .msg file
const emlParser = new EmlParser();
const html = await emailParser.getAsHtml(undefined, true);
if (!html) throw new Error("No message found");
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
```

## Download all attachments
```typescript
import { createReadStream, createWriteStream, writeFileSync } from "node:fs";
import { normalize } from "node:path";
import { EmlParser, Convert } from "mail-export";

const filePath = normalize("test_SA.eml"); //or .msg file
const email = createReadStream(filePath);
const emailParser = new EmlParser(email);
const attachments = await emailParser.getAttachments({
		ignoreEmbedded: false, //does nothing for .msg files
	});
if (!attachments) throw new Error("No attachments found");
for (const attachment of attachments) {
	//convert to file with attachment.content as Uint8Array
	if (!attachment || !attachment.content || !attachment.filename) continue;
	writeFileSync(attachment.filename, attachment.content);
}
```

It will successfully download the attachments to the current directory.

