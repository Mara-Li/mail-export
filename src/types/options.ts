interface ParseOptions {
	/**
	 * highlight with <mark></mark> html a specific keyword in the email html content
	 * example: [foo, bar] will highlight foo and bar in the email html content
	 */
	highlightKeywords?: string[];
	/**
	 * The hightlight detection will be case sensitive
	 */
	highlightCaseSensitive?: boolean;
	/**
	 * Allow to modify the style in the resulting html
	 */
	customStyle?: string;
}

export interface EmlOptions extends ParseOptions {
	/**
	 * Ignores embedded attachments while parsing email eml attachments
	 */
	ignoreEmbedded?: boolean;
	/**
	 * Allow to modify the HEADER of the result pdf/html
	 */
	excludeHeader?: Partial<ExcludeHeaderEml>;
}

export interface MessageOptions extends ParseOptions {
	/**
	 * Allow to modify the HEADER of the result pdf/html
	 */
	excludeHeader?: Partial<ExcludeHeader>;
}

/**
 * Allow to exclude some HEADER from the html output
 * See {Header} for the list of HEADER
 */
type ExcludeHeader = {
	bcc: boolean;
	cc: boolean;
	to: boolean;
	from: boolean;
	date: boolean;
	subject: boolean;
	replyTo: boolean;
	/** Will ignore **all** attachments */
	attachments: boolean;
};

type ExcludeHeaderEml = ExcludeHeader & {
	/**
	 * Remove only the embedded attachments listing in the header fields (attachments: ...)
	 * Embedded attachments will still be present in the html content
	 */
	embeddedAttachments: boolean;
};
