import { Readable } from 'stream';
import { Attachment, ParsedMail } from 'mailparser';
import {MsgAttachment, MsgFileData} from '@kenjiuno/msgreader';
  
declare module 'eml-parser' {
  interface ParseOptions {
    ignoreEmbedded?: boolean;
    highlightKeywords?: string[];
    highlightCaseSensitive?: boolean;
  }

  interface EmailHeaders {
    subject: string;
    from: { name: string; address: string }[];
    to: { name: string; address: string }[];
    cc?: { name: string; address: string }[];
    date: Date;
    inReplyTo?: string;
    messageId: string;
  }

  interface MessageHeaders {
    subject: string;
    from: { name: string; address: string }[];
    to: { name: string; address: string }[];
    cc?: { name: string; address: string }[];
    date: Date;
  }

  class EmlParser {
    constructor(fileReadStream: Readable);

    parseEml(options?: ParseOptions): Promise<ParsedMail>;
    parseMsg(options?: ParseOptions): Promise<MsgFileData>;

    getEmailHeaders(): Promise<EmailHeaders>;
    getMessageHeaders(): Promise<MessageHeaders>;

    getEmailBodyHtml(options?: ParseOptions): Promise<string>;
    getMessageBodyHtml(options?: ParseOptions): Promise<string>;

    getEmailAsHtml(options?: ParseOptions): Promise<string>;
    getMessageAsHtml(options?: ParseOptions): Promise<string>;

    convertEmailToStream(type: string, orientation: string, format: string, options?: ParseOptions): Promise<Readable>;
    convertMessageToStream(type: string, orientation: string, format: string, options?: ParseOptions): Promise<Readable>;

    convertEmailToBuffer(type: string, orientation: string, format: string, options?: ParseOptions): Promise<Buffer>;
    convertMessageToBuffer(type: string, orientation: string, format: string, options?: ParseOptions): Promise<Buffer>;

    getEmailAttachments(options?: ParseOptions): Promise<Attachment[]>;
    getMessageAttachments(): Promise<MsgAttachment[]>;

    getEmailEmbeddedFiles(): Promise<Attachment[]>;
  }

  export { EmlParser, ParseOptions, EmailHeaders, MessageHeaders };
}