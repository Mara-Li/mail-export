import { Readable } from "node:stream";
import type { PDFOptions } from "puppeteer";
import PuppeteerHTMLPDF from "puppeteer-html-pdf";

/**
 * Allow to export a html string into a buffer or a stream
 */

/**
 * See {@link} https://www.npmjs.com/package/puppeteer-html-pdf
 */
export interface PuppeteerHTMLPDFOptions extends PDFOptions {
	args?: string[];
	headless?: boolean;
	authorization?: string;
	browserWSEndpoint?: string;
	executablePath?: string;
	headers?: { [key: string]: string };
}

export class Convert {
	html: string;
	constructor(html: string) {
		this.html = html
			.replace(
				/Attachments:<\/td><td><a href=".*" download/gi,
				"Attachments:</td><td><a download",
			)
			.replace(
				/@page WordSection.*{.*;}.div.WordSection/gims,
				".div.WordSection",
			);
	}

	private createOption(
		option?: PuppeteerHTMLPDFOptions,
	): PuppeteerHTMLPDFOptions {
		const DEFAULT_OPTIONS: PuppeteerHTMLPDFOptions = {
			format: "A4",
			width: "21cm",
			height: "29.7cm",
			margin: {
				top: "1.30cm",
				left: "1.30cm",
				right: "1.30cm",
				bottom: "1.30cm",
			},
			printBackground: true,
			preferCSSPageSize: true,
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disabled-setupid-sandbox",
				"--font-render-hinting=none",
			],
		};
		if (!option) return DEFAULT_OPTIONS;
		Object.assign(DEFAULT_OPTIONS, option);
		if (option.path) option.path = undefined;
		return option;
	}

	async convertToStream(opt?: PuppeteerHTMLPDFOptions): Promise<Readable> {
		const options = this.createOption(opt);
		if (!this.html) throw new Error("No message found");
		return await new Promise<Readable>((resolve, reject) => {
			const htmlPdf = new PuppeteerHTMLPDF();
			htmlPdf.setOptions(options);
			htmlPdf.create(this.html, (err, buffer) => {
				if (err) reject(err);
				if (!buffer) throw new Error("No buffer found");
				resolve(Readable.from(buffer));
			});
		});
	}

	async convertToBuffer(opt?: PuppeteerHTMLPDFOptions): Promise<Buffer> {
		const option = this.createOption(opt);
		if (!this.html) throw new Error("No message found");
		return await new Promise<Buffer>((resolve, reject) => {
			const htmlPdf = new PuppeteerHTMLPDF();
			htmlPdf.setOptions(option);
			htmlPdf.create(this.html, (err, buffer) => {
				if (err) reject(err);
				if (!buffer) throw new Error("No buffer found");
				resolve(buffer);
			});
		});
	}

	private pdfParseMail(): string {
		const regex =
			/<a href="mailto:(?<mail>.*?)" class="mp_address_email">(?<nom>.*?)<\/a>/gim;

		return this.html.replaceAll(regex, "$2 &lt$1&gt");
	}

	/**
	 * Create a pdf file from the html string
	 */
	async createPdf(path: string, opt?: PuppeteerHTMLPDFOptions): Promise<void> {
		const option = this.createOption(opt);
		option.path = path;
		if (!this.html) throw new Error("No message found");
		return await new Promise<void>((resolve, reject) => {
			const htmlPdf = new PuppeteerHTMLPDF();
			htmlPdf.setOptions(option);
			htmlPdf.create(this.pdfParseMail(), (err, buffer) => {
				if (err) reject(err);
				if (!buffer) throw new Error("No buffer found");
				resolve();
			});
		});
	}
}
