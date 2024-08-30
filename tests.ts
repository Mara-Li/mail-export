import { log } from "console";
import { create } from "domain";
import path from "node:path";
import PuppeteerHTMLPDF from "puppeteer-html-pdf";

const htmlPDF = new PuppeteerHTMLPDF();
const options = {
	format: "A4",
};
//@ts-ignore
htmlPDF.setOptions(options);

const content = "<style> h1 {color:red;} </style> <h1>Welcome to puppeteer-html-pdf</h1>";

try {
	const f = await htmlPDF.create(content);
} catch (error) {
	console.log("PuppeteerHTMLPDF error", error);
}