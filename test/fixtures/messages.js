// Fixtures captured from a real LocalStack 4.7 (see specs/001-templated-emails/data-model.md).
import { readFileSync } from "node:fs";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");

export const getTemplateXml = read("./get-template.xml");
export const getTemplateTextOnlyXml = read("./get-template-text-only.xml");
export const getTemplateNotFoundXml = read("./get-template-not-found.xml");

const [loginLinkMessage, textOnlyMessage] = JSON.parse(read("./ses-templated-messages.json")).messages;

// Valid message sent with the "jogo-acoes__login-link" template; override only the field under test.
export const templatedMessage = (overrides = {}) => ({ ...loginLinkMessage, ...overrides });

// Valid message sent with the "text-only" template (no HtmlPart, with CC).
export const textOnlyTemplatedMessage = (overrides = {}) => ({ ...textOnlyMessage, ...overrides });
