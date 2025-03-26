globalThis.DEBUG = true;

function send(e) {
  const options = {};

  if (e && e.source === ScriptApp.TriggerSource.TRIGGER) {
    options.to = "workspace-developer-public-issues@google.com";
  }

  MailApp.sendEmail({
    ...options,
    cc: "jpoehnelt@google.com",
    subject:
      "Workspace Developer Issues - Summary - " +
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    htmlBody: globalThis.buildHtml(),
  });
}
