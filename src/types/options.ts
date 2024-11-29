import type { Locale } from "date-fns";

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
	/**
	 * Set a custom style for the emails adresses. Use {{name}} to insert the name and {{email}} to insert the email.
	 * @example `<a href="mailto:{{email}}" class="mp_address_email">{{name}} <{{email}}> </a>`
	 * */
	formatEmailAddress?: string;
	/**
	 * Allow changing the date format in the resulting html:
	 * - format: the format of the date (see https://date-fns.org/v2.21.3/docs/format)
	 * - locale: the locale of the date (see https://date-fns.org/v2.21.3/docs/I18n)
	 * - timeZone: the timezone of the date (see https://date-fns.org/v2.21.3/docs/Time-Zones)
	 * The date-fns and date-fns-tz libraries are used to format the date and should be used as a Locale!
	 * @example French date in `dd MMMM yy - HH:mm` format in Europe/Paris timezone:
	 * { format: "dd MMMM yy - HH:mm", locale: fr, timeZone: "Europe/Paris" }
	 * @defaultValue { format: "EEEE d MMMM yyyy HH:mm", locale: enUS, timeZone: "UTC" }
	 */
	dateFormat?: Partial<DateFormat>;
}

export type DateFormat = {
	/**
	 * @defaultValue "EEEE d MMMM yyyy HH:mm"
	 */
	format: string;
	/**
	 * @defaultValue enUS
	 */
	locale: Locale;
	/**
	 * @defaultValue "UTC"
	 */
	timeZone: string;
};

export interface EmlOptions extends ParseOptions {
	/**
	 * Ignores embedded attachments while parsing email eml attachments
	 */
	ignoreEmbedded?: boolean;
	/**
	 * Allow to modify the defaultHtmlHead of the result pdf/html
	 */
	excludeHeader?: Partial<ExcludeHeaderEml>;
}

export interface MessageOptions extends ParseOptions {
	/**
	 * Allow to modify the defaultHtmlHead of the result pdf/html
	 */
	excludeHeader?: Partial<ExcludeHeader>;
}

/**
 * Allow to exclude some defaultHtmlHead from the html output
 * See {Header} for the list of defaultHtmlHead
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
