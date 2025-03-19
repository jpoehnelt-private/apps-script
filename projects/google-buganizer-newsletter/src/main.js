globalThis.DEBUG = true;

function send() {
  MailApp.sendEmail({
    to: 'jpoehnelt@google.com',
    subject: 'Workspace Developer Public Issues',
    htmlBody: globalThis.buildHtml()
  });
}