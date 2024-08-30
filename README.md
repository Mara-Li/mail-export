# Mail-Export

Parse .eml/.msg files or convert to pdf, html, jpeg or png format, and extract attachments to files.
Support typescript and javascript.

© [eml-parser](https://github.com/ankit1329/Eml-Parser)

## Installation

```bash
npm install mail-export
```

**Note** : The converter use `puppeteer-html-pdf`, that uses `puppeteer` as a dependency. As a result, you need your own chrome installation, and you can configure the cache as you want using [puppeteer configuration](https://pptr.dev/guides/configuration)

# Example Usage
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
await converter.createPdf(path: "sample.pdf", { format: "A4" });
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

---
# Library
## Interfaces
### ParseOptions 
- **`ignoreEmbedded`** (optional, `boolean`)
  - **Description**: Ignores embedded attachments while parsing email EML attachments.

- **`highlightKeywords`** (optional, `string[]`)
  - **Description**: Highlights specific keywords in the email HTML content using the `<mark></mark>` HTML tag.
  - **Example**: If you provide `['foo', 'bar']`, the keywords `foo` and `bar` will be highlighted in the email HTML content.

- **`highlightCaseSensitive`** (optional, `boolean`)
  - **Description**: Specifies whether the keyword highlighting is case-sensitive.

- **`excludeHeader`** (optional, `Partial<ExcludeHeader>`)
  - **Description**: Allows modification of the header in the resulting PDF/HTML output.

### ExcludeHeader
The `ExcludeHeader` type specifies options for excluding certain headers from the HTML output.
- **`bcc`** (`boolean`)
  - **Description**: Exclude the `bcc` header from the HTML output.

- **`cc`** (`boolean`)
  - **Description**: Exclude the `cc` header from the HTML output.

- **`to`** (`boolean`)
  - **Description**: Exclude the `to` header from the HTML output.

- **`from`** (`boolean`)
  - **Description**: Exclude the `from` header from the HTML output.

- **`date`** (`boolean`)
  - **Description**: Exclude the `date` header from the HTML output.

- **`subject`** (`boolean`)
  - **Description**: Exclude the `subject` header from the HTML output.

- **`replyTo`** (`boolean`)
  - **Description**: Exclude the `replyTo` header from the HTML output.

- **`attachments`** (`boolean`)
  - **Description**: Exclude **all** attachments from the HTML output.

- **`embeddedAttachments`** (`boolean`)
  - **Description**: Exclude only embedded attachments from the HTML output. 
  - **Warning**: This option is only applicable for EML files.

### MessageFields
The `MessageFieldData` interface is an upgraded version of the [`FieldsData` interface from `msgreader`](https://hiraokahypertools.github.io/msgreader/typedoc/interfaces/MsgReader.FieldsData.html). It is specifically used for handling data in the MSG format.

- **`content`** (optional, `Uint8Array`)
  - **Description**: Contains the raw content of the message as a `Uint8Array`.

- **`htmlString`** (optional, `string`)
  - **Description**: Represents the HTML content of the message as a string.

- **`filename`** (optional, `string`)
  - **Description**: The name of the file associated with the message.

### ParseOptions
The `ParseOptions` interface provides configuration options for parsing EML and MSG files, and provide additional functionality such as keyword highlighting and header exclusion for the html output.

- **`ignoreEmbedded`** (optional, `boolean`)
  - **Description**: Ignores embedded attachments.
  - **Important**: This option is only applicable for EML files.

- **`highlightKeywords`** (optional, `string[]`)
  - **Description**: Highlights specific keywords in the email HTML content using the `<mark></mark>` HTML tag.
  - **Example**: Providing `['foo', 'bar']` will highlight the keywords `foo` and `bar` in the email HTML content.

- **`highlightCaseSensitive`** (optional, `boolean`)
  - **Description**: Specifies whether the keyword highlighting should be case-sensitive.

- **`excludeHeader`** (optional, `Partial<ExcludeHeader>`)
  - **Description**: Allows modification of the header in the resulting PDF/HTML output by excluding certain headers.

### ExcludeHeader
The `ExcludeHeader` interface specifies options for excluding certain headers from the HTML/PDF output.

- **`bcc`** (`boolean`)
- **`cc`** (`boolean`)
- **`to`** (`boolean`)
- **`from`** (`boolean`)
- **`date`** (`boolean`)
- **`subject`** (`boolean`)
- **`replyTo`** (`boolean`)
  - **Important**: Only applicable for EML files.
- **`attachments`** (`boolean`)
- **`embeddedAttachments`** (`boolean`)

### MailAdress
The `MailAdress` interface represents a parsed email address in a digestible format.
- **`name`** (optional, `string`)
  - **Description**: The name associated with the email address.

- **`address`** (optional, `string`)
  - **Description**: The actual email address.

### Header
The `Header` interface represents the metadata associated with an email, including sender and recipient information, subject, date, and attachments.

- **`subject`** (optional, `string`)
  - **Description**: The subject of the email.

- **`from`** (optional, `MailAdress[]`)
  - **Description**: The sender(s) of the email.

- **`bcc`** (optional, `MailAdress[]`)
  - **Description**: The BCC (Blind Carbon Copy) recipient(s) of the email.

- **`cc`** (optional, `MailAdress[]`)
  - **Description**: The CC (Carbon Copy) recipient(s) of the email.

- **`to`** (optional, `MailAdress[]`)
  - **Description**: The primary recipient(s) of the email.

- **`replyTo`** (optional, `MailAdress[]`)
  - **Description**: The reply-to address(es) for the email. 
  - **Important**: This property exists only in the EML format.

- **`date`** (optional, `string | Date`)
  - **Description**: The date the email was sent. Can be either a string or a `Date` object.

- **`attachments`** (optional, `Attachment[] | MessageFieldData[]`)
  - **Description**: The attachments included in the email. This can be an array of `Attachment` objects or `MessageFieldData` objects.
  - **Attachments[]**: Represents the attachments for EML files.
  - **MessageFieldData[]**: Represents the attachments for MSG files.

## Implementations
The `Parser` interface provides methods to parse and extract information from email files, including headers, attachments, and content.

The `EmlParser` and `MessageParser` implements the interface `Parser`.

### Usage
- **`EmlParser`**: Used to parse EML files.
	```typescript
	import { EmlParser } from "mail-export";
	const readableStream = createReadStream("email.eml");
	const emlParser = new EmlParser(readableStream);
	```
- **`MessageParser`**: Used to parse MSG files.
	```typescript
	import { MessageParser } from "mail-export";
	const readableStream = createReadStream("email.msg");
	const messageParser = new MessageParser(readableStream);
	```


### Properties
- **`fileReadStream`** (`Readable`)
  - **Description**: The readable stream of the email file to be parsed.

- **`parsedMail`** (`MessageFieldData | ParsedMail`)
  - **Description**: The parsed email data, which could be in the form of `MessageFieldData` or `ParsedMail`.
  - **MessageFieldData**: Represents the parsed email data for MSG files.
  - **ParsedMail**: Represents the parsed email data for EML files.

### Methods
- **`parse(options?: ParseOptions): Promise<MessageFieldData | ParsedMail | undefined>`**
  - **Description**: The primary function for parsing the email file. Converts the readable stream into a parsed email, allowing for content and header extraction.
  - **Note**: If `parsedMail` already exists, this method returns it directly without re-parsing the file.
  - **Parameters**:
    - `options` (optional, `ParseOptions`): Options to modify the parsing behavior.

- **`getHeader(options?: ParseOptions): Promise<Header | undefined>`**
  - **Description**: Parses and returns the header of the email, including any attachments.
  - **Parameters**:
    - `options` (optional, `ParseOptions`): Options to modify the parsing behavior.
  - **Returns**: A `Header` object containing the email's header information.

- **`getAttachments(options?: ParseOptions): Promise<MessageFieldData[] | Attachment[]>`**
  - **Description**: Retrieves the attachments and their contents from the email.
  - **Parameters**:
    - `options` (optional, `ParseOptions`): Options to modify the parsing behavior.
  - **Returns**: An array of `MessageFieldData` or `Attachment` objects representing the email's attachments.

- **`getAsHtml(options?: ParseOptions): Promise<string | undefined>`**
  - **Description**: Returns the email content as an HTML string, including the header and attachments. Attachments can be downloaded if the HTML is directly written to a file.
  - **Parameters**:
    - `options` (optional, `ParseOptions`): Options to modify the parsing behavior.
  - **Returns**: The email as an HTML string.

- **`getBodyHtml(options?: ParseOptions): Promise<string | undefined>`**
  - **Description**: Returns the email content as an HTML string, excluding the header and attachments.
  - **Parameters**:
	- `options` (optional, `ParseOptions`): Options to modify the parsing behavior.
  - **Returns**: The email body as an HTML string.

### EmlParser methods
The `EmlParser` provides additional methods for parsing EML files.
- **`getEmbedded(options?: ParseOptions): Promise<Attachment[]>**
  - **Description**: Retrieves the embedded attachments from the EML file.
  - **Parameters**:
	  - `options` (optional, `ParseOptions`): Options to modify the parsing behavior.
  - **Returns**: An array of `Attachment` objects representing the embedded attachments.

## Convert
The `Convert` class provides methods to convert email content to PDF, buffer or Readable.

It uses, internally `puppeteer-html-pdf` to convert the HTML content to PDF.
For option, you can refer to the [puppeteer-html-pdf documentation](https://www.npmjs.com/package/puppeteer-html-pdf#options).

**Note** : `convertToStream` and `convertToBuffer` remove the `path` option if provided.

Default options:
```ts
{
  format: "A4",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disabled-setupid-sandbox"]
}
```

### Constructor
```typescript
const converter = new Converter(html)
```
- **`html`** : string

### Methods
- **`convertToStream(opt?: PuppeteerHTMLPDFOptions):Promise<Readable>`**
  - **Description**: Convert to a pdf Readable from the buffer sent by `PuppeteerHTMLPDF`
  - **Parameters**:
	  - `opt` (optional, `PuppeteerHTMLPDFOptions`): Option for Puppeteer
  - **Returns**: Readable (Promise)
- **`convertToBuffer(opt?: PuppeteerHTMLPDFOptions):Promise<Buffer>`**
  - **Description**: Convert the HTML to a PDF Buffer
  - **Parameters**:
	  - `opt` (optional, `PuppeteerHTMLPDFOptions`): Option for Puppeteer
  - **Returns**: Buffer (Promise)
- **`createPdf(path: string, opt?: PuppeteerHTMLPDFOptions):Promise<void>`**
  - **Description** : Convert an html to a pdf file, following the `pdf` parameter.
  - **Parameters** :
    - `path` (`string`) : Path to save the PDF.
    - `opt` (optional, `PuppeteerHTMLPDFOptions`): Option for Puppeteer
  - **Returns** : Void