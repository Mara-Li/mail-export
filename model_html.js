export const cc = function (cc) {
	return `<tr><td class="label">Cc:</td><td>${cc}</td></tr>`;
};

export const bcc = function (cci) {
	return `<tr><td class="label">Bcc:</td><td>${cci}</td></tr>`;
};

export const to = function (to) {
	return `<tr><td class="label">To:</td><td>${to}</td></tr>`;
};

export const subject = function (subject) {
	return `<tr><td class="label">Subject:</td><td>${subject}</td></tr>`;
};

export const attachments = function (attachments) {
	return `<tr><td class="label">Attachments:</td><td>${attachments}</td></tr>`;
};

export const from = function (from) {
	return `<div class="header">${from}</div><div class="underline"></div><table class="email-info">`;
};

export const date = function (date) {
	return `<tr><td class="label">Date:</td><td>${date}</td></tr>`;
};

export const end = `</table>`;

export const header = `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Layout</title>
    <style>
        @font-face
                {font-family:"Cambria Math";
                panose-1:2 4 5 3 5 4 6 3 2 4;
                mso-font-charset:0;
                mso-generic-font-family:roman;
                mso-font-pitch:variable;
                mso-font-signature:-536869121 1107305727 33554432 0 415 0;}
        @font-face
                {font-family:Aptos;
                panose-1:2 11 0 4 2 2 2 2 2 4;
                mso-font-charset:0;
                mso-generic-font-family:swiss;
                mso-font-pitch:variable;
                mso-font-signature:536871559 3 0 0 415 0;}
        body {
            font-family: Aptos, sans-serif;
        }
        .header {
            font-weight: bold;
            font-size: 18px;
        }
        .underline {
            border-bottom: 3px solid black;
            margin: 10px 0;
        }
        .email-info {
            width: 100%;
            border-collapse: collapse;
        }
        .label {
            font-weight: bold;
            width: 100px;
            vertical-align: top;
			padding-right: 2em;
        }
    </style>
</head>`;
