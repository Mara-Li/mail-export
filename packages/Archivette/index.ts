import EmlParser from 'eml-parser';
import {createReadStream, createWriteStream, existsSync} from 'node:fs';
import { normalize } from 'node:path';
const filePath = normalize("test_SA.msg");
console.log(filePath, existsSync(filePath));
const email = createReadStream(filePath);
const mailParser = new EmlParser(email);
mailParser.getMessageAttachments().then((files) => {
	console.log(files);
});
const msgParser = await mailParser.convertMessageToStream("pdf");
msgParser.pipe(createWriteStream('email.pdf'));

