import { simpleParser } from "mailparser";
import pdf from "html-pdf";
import MsgReader from "@kenjiuno/msgreader";
import { decompressRTF } from "@kenjiuno/decompressrtf";
import iconv from "iconv-lite";
import rtfParser from "rtf-stream-parser";
import {
	header,
	from,
	end,
	attachments,
	to,
	date,
	bcc,
	cc,
	subject,
} from "./model_html";

const isStringsArray = (arr) => arr.every((i) => typeof i === "string");

function stream2buffer(stream) {
	return new Promise((resolve, reject) => {
		const _buf = [];

		stream.on("data", (chunk) => _buf.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(_buf)));
		stream.on("error", (err) => reject(err));
	});
}

class EmlParser {
	constructor(fileReadStream) {
		this.parsedEmail;

		this.parseEml = (options) => {
			return new Promise((resolve, reject) => {
				if (this.parsedEmail) {
					resolve(this.parsedEmail);
				} else {
					simpleParser(fileReadStream, {})
						.then((result) => {
							if (options && options.ignoreEmbedded) {
								result.attachments = result.attachments.filter(
									(att) => att.contentDisposition === "attachment",
								);
							}
							if (options && options.highlightKeywords) {
								if (!Array.isArray(options.highlightKeywords))
									throw new Error(
										"err: highlightKeywords is not an array, expected: String[]",
									);
								if (!isStringsArray(options.highlightKeywords))
									throw new Error(
										"err: highlightKeywords contains non-string values, expected: String[]",
									);
								let flags = "gi";
								if (options.highlightCaseSensitive) flags = "g";
								options.highlightKeywords.forEach((keyword) => {
									if (result.html) {
										result.html = result.html.replace(
											new RegExp(keyword, flags),
											function (str) {
												return `<mark>${str}</mark>`;
											},
										);
									} else if (result.textAsHtml) {
										result.textAsHtml = result.textAsHtml.replace(
											new RegExp(keyword, flags),
											function (str) {
												return `<mark>${str}</mark>`;
											},
										);
									}
								});
							}
							this.parsedEmail = result;
							resolve(this.parsedEmail);
						})
						.catch((err) => {
							reject(err);
						});
				}
			});
		};

		this.parseMsg = async (options) => {
			let buffer = await stream2buffer(fileReadStream);
			let emailData = new MsgReader(buffer);
			this.parsedEmail = emailData.getFileData();
			let outputArray = decompressRTF(this.parsedEmail.compressedRtf);
			let decompressedRtf = Buffer.from(outputArray).toString("ascii");
			this.parsedEmail.html = rtfParser.deEncapsulateSync(decompressedRtf, {
				decode: iconv.decode,
			}).text;

			this.parsedEmail.attachments = this.parsedEmail.attachments.map((att) => {
				att.content = emailData.getAttachment(att).content;
				return att;
			});

			if (options && options.highlightKeywords) {
				if (!Array.isArray(options.highlightKeywords))
					throw new Error(
						"err: highlightKeywords is not an array, expected: String[]",
					);
				if (!isStringsArray(options.highlightKeywords))
					throw new Error(
						"err: highlightKeywords contains non-string values, expected: String[]",
					);
				let flags = "gi";
				if (options.highlightCaseSensitive) flags = "g";
				options.highlightKeywords.forEach((keyword) => {
					this.parsedEmail.html = this.parsedEmail.html.replace(
						new RegExp(keyword, flags),
						function (str) {
							return `<mark>${str}</mark>`;
						},
					);
				});
			}
			delete this.parsedEmail.compressedRtf;
			return this.parsedEmail;
		};

		this.getEmailHeaders = () => {
			return new Promise((resolve, reject) => {
				this.parseEml()
					.then((result) => {
						let headers = {
							subject: result.subject,
							from: result.from.value,
							to: result.to.value,
							cc: result.cc?.value,
							bcc: result.bcc?.value,
							date: result.date,
							inReplyTo: result?.inReplyTo,
							messageId: result.messageId,
						};
						resolve(headers);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getMessageHeaders = () => {
			return new Promise((resolve, reject) => {
				this.parseMsg()
					.then((result) => {
						console.log(result);
						let headers = {
							subject: result.subject,
							from: [
								{
									name: result.senderName,
									address: result.senderEmail,
								},
							],
							bcc: result.recipients
								.filter((recipient) => recipient.recipType === "bcc")
								.map((recipient) => {
									return { name: recipient.name, address: recipient.email };
								}),
							to: result.recipients
								.filter((recipient) => recipient.recipType === "to")
								.map((recipient) => {
									return { name: recipient.name, address: recipient.email };
								}),
							cc: result.recipients
								.filter((recipient) => recipient.recipType === "cc")
								.map((recipient) => {
									return { name: recipient.name, address: recipient.email };
								}),
							date: result.messageDeliveryTime,
						};
						resolve(headers);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getEmailBodyHtml = (options) => {
			let replacements = {
				"’": "'",
				"–": "&#9472;",
			};
			return new Promise((resolve, reject) => {
				this.parseEml(options)
					.then((result) => {
						let htmlString = result.html || result.textAsHtml;
						if (!htmlString) {
							resolve("");
						}
						for (var key in replacements) {
							let re = new RegExp(key, "gi");
							htmlString = htmlString.replace(re, replacements[key]);
						}
						resolve(htmlString);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getMessageBodyHtml = (options) => {
			return new Promise((resolve, reject) => {
				this.parseMsg(options)
					.then((result) => {
						resolve(result.html);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getEmailAsHtml = (options) => {
			return new Promise((resolve, reject) => {
				this.parseEml(options)
					.then((result) => {
						let headerHtml = `${header}${from(result.from.html)}${date(new Date(result.date).toLocaleString())}`;

						if (result.to) {
							headerHtml = headerHtml + to(result.to.html);
						}
						if (result.cc) {
							headerHtml = headerHtml + cc(result.cc.html);
						}
						if (result.bcc) {
							headerHtml = headerHtml + bcc(result.bcc.html);
						}
						if (result.attachments) {
							headerHtml = headerHtml + attachments(attachments);
						}
						headerHtml = headerHtml + subject(result.subject.html);
						this.getEmailBodyHtml()
							.then((bodyHtml) => {
								resolve(headerHtml + end + `<p>${bodyHtml}</p>`);
							})
							.catch((err) => {
								reject(err);
							});
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getMessageAsHtml = (options) => {
			return new Promise((resolve, reject) => {
				this.parseMsg(options)
					.then((result) => {
						const bccRecipients = result.recipients
							.filter((recipient) => recipient.recipType === "bcc")
							.map((recipient) => {
								return { name: recipient.name, address: recipient.email };
							});
						let toRecipients = result.recipients
							.filter((recipient) => recipient.recipType === "to")
							.map((recipient) => {
								return { name: recipient.name, address: recipient.email };
							});
						let ccRecipients = result.recipients
							.filter((recipient) => recipient.recipType === "cc")
							.map((recipient) => {
								return { name: recipient.name, address: recipient.email };
							});
						let toHtml = "";
						let ccHtml = "";
						let bccHtml = "";
						toRecipients.forEach((recipient) => {
							toHtml +=
								`<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` +
								";";
						});
						bccRecipients.forEach((recipient) => {
							bccHtml +=
								`<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` +
								";";
						});
						ccRecipients.forEach((recipient) => {
							ccHtml +=
								`<a href=\"mailto:${recipient.address}\" class=\"mp_address_email\">${recipient.address}</a>` +
								";";
						});
						const fromSpan = `<a href=\"mailto:${result.senderEmail ?? result.lastModifierName}\" class=\"mp_address_email\">${result.senderEmail ?? result.lastModifierName}</a></span>`;
						const dateSpan = `${new Date(result.messageDeliveryTime).toLocaleString()}`;
						let headerHtml = `${header}${from(fromSpan)}${date(dateSpan)}`;
						if (toHtml) {
							headerHtml = headerHtml + to(toHtml);
						}
						if (ccHtml) {
							headerHtml = headerHtml + cc(ccHtml);
						}
						if (bccHtml) {
							headerHtml = headerHtml + bcc(bccHtml);
						}
						if (result.attachments) {
							const attachmentsHtml = result.attachments
								.map(
									(att) =>
										`<a href=\"data:${att.contentType};base64,${att.content.toString("base64")}\" download=\"${att.fileName}\">${att.fileName}</a>`,
								)
								.join("<br>");
							headerHtml = headerHtml + attachments(attachmentsHtml);
						}

						headerHtml = headerHtml + subject(result.subject);
						resolve(headerHtml + end + `<p>${result.html}</p>`);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.convertEmailToStream = (type, orientation, format, outerOptions) => {
			return new Promise((resolve, reject) => {
				let options = {
					orientation: orientation || "landscape", // potrait | landscape
				};
				if (type) {
					options.type = type;
				}
				if (format) {
					options.format = format; // A3, A4, A5, Legal, Letter, Tabloid
				}
				this.getEmailAsHtml(outerOptions)
					.then((html) => {
						pdf.create(html, options).toStream(function (err, res) {
							if (err) {
								reject(err);
							}
							resolve(res);
						});
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.convertMessageToStream = (type, orientation, format, outerOptions) => {
			return new Promise((resolve, reject) => {
				let options = {
					orientation: orientation || "landscape", // potrait | landscape
				};
				if (type) {
					options.type = type;
				}
				if (format) {
					options.format = format; // A3, A4, A5, Legal, Letter, Tabloid
				}
				this.getMessageAsHtml(outerOptions)
					.then((html) => {
						pdf.create(html, options).toStream(function (err, res) {
							if (err) {
								reject(err);
							}
							resolve(res);
						});
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.convertEmailToBuffer = (type, orientation, format, outerOptions) => {
			return new Promise((resolve, reject) => {
				let options = {
					orientation: orientation || "landscape", // potrait | landscape
				};
				if (type) {
					options.type = type;
				}
				if (format) {
					options.format = format; // A3, A4, A5, Legal, Letter, Tabloid
				}
				this.getEmailAsHtml(outerOptions)
					.then((html) => {
						pdf.create(html, options).toBuffer(function (err, res) {
							if (err) {
								reject(err);
							}
							resolve(res);
						});
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.convertMessageToBuffer = (type, orientation, format, outerOptions) => {
			return new Promise((resolve, reject) => {
				let options = {
					orientation: orientation || "landscape", // potrait | landscape
				};
				if (type) {
					options.type = type;
				}
				if (format) {
					options.format = format; // A3, A4, A5, Legal, Letter, Tabloid
				}
				this.getMessageAsHtml(outerOptions)
					.then((html) => {
						pdf.create(html, options).toBuffer(function (err, res) {
							if (err) {
								reject(err);
							}
							resolve(res);
						});
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getEmailAttachments = (options) => {
			return new Promise((resolve, reject) => {
				this.parseEml()
					.then((result) => {
						if (options && options.ignoreEmbedded) {
							result.attachments = result.attachments.filter(
								(att) => att.contentDisposition === "attachment",
							);
						}
						resolve(result.attachments);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getMessageAttachments = () => {
			return new Promise((resolve, reject) => {
				this.parseMsg()
					.then((result) => {
						resolve(result.attachments);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};

		this.getEmailEmbeddedFiles = () => {
			return new Promise((resolve, reject) => {
				this.parseEml()
					.then((result) => {
						result.attachments = result.attachments.filter(
							(att) => att.contentDisposition !== "attachment",
						);
						resolve(result.attachments);
					})
					.catch((err) => {
						reject(err);
					});
			});
		};
	}
}

export default EmlParser;
