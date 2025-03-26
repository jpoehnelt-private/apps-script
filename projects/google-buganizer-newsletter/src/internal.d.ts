declare module "mjml" {
  export function mjml2html(mjml: string): { html: string };
}

declare global {
  var buildHtml: () => string;
}
export {};
