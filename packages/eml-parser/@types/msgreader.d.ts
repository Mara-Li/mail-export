declare module '@kenjiuno/msgreader' {
	interface MsgAttachment {
	  filename: string;
	  content: Buffer;
	  contentType: string;
	}
  
	interface MsgFileData {
	  subject: string;
	  senderName: string;
	  senderEmail: string;
	  recipients: { name: string; email: string }[];
	  date: Date;
	  body: string;
	  attachments: MsgAttachment[];
	}
  
	export { MsgAttachment, MsgFileData };
  }