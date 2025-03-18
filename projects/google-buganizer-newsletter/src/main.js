function send() {
  MailApp.sendEmail({
    to: 'jpoehnelt@google.com',
    subject: 'Workspace Public Issues',
    htmlBody: globalThis.buildHtml()
  });
}