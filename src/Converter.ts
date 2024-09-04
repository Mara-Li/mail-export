import type { PDFOptions } from "puppeteer";
import PuppeteerHTMLPDF from "puppeteer-html-pdf";
import { Readable } from "stream";

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
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disabled-setupid-sandbox",
			],
		};
		if (!option) return DEFAULT_OPTIONS;
		else Object.assign(DEFAULT_OPTIONS, option);
		if (option.path) delete option.path;
		return option;
	}

	async convertToStream(opt?: PuppeteerHTMLPDFOptions): Promise<Readable> {
		const options = this.createOption(opt);
		try {
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
		} catch (error) {
			throw error;
		}
	}

	async convertToBuffer(opt?: PuppeteerHTMLPDFOptions): Promise<Buffer> {
		const option = this.createOption(opt);
		try {
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
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Create a pdf file from the html string
	 * @param {string} path  - Path to save the pdf file
	 * @param {PuppeteerHTMLPDFOptions} opt - Options to modify the pdf creation
	 * @returns {string} - Path of the pdf created file
	 */
	async createPdf(path: string, opt?: PuppeteerHTMLPDFOptions): Promise<void> {
		const option = this.createOption(opt);
		option.path = path;
		try {
			if (!this.html) throw new Error("No message found");
			return await new Promise<void>((resolve, reject) => {
				const htmlPdf = new PuppeteerHTMLPDF();
				htmlPdf.setOptions(option);
				htmlPdf.create(this.html, (err, buffer) => {
					if (err) reject(err);
					if (!buffer) throw new Error("No buffer found");
					resolve();
				});
			});
		} catch (error) {
			throw error;
		}
	}
}
