import fetch from "node-fetch";
import Handlebars from "handlebars";

const DEFAULT_REGION = "us-east-1";

const XML_ENTITIES = {
  lt: "<",
  gt: ">",
  amp: "&",
  quot: '"',
  apos: "'",
};

function decodeXmlEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (entity, code) => {
    if (code[0] === "#") {
      const isHex = code[1] === "x" || code[1] === "X";
      return String.fromCodePoint(parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10));
    }
    return XML_ENTITIES[code] ?? entity;
  });
}

function readXmlElement(xml, name) {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return match ? decodeXmlEntities(match[1]) : undefined;
}

/**
 * Parse the XML body of an SES v1 GetTemplate response.
 * Returns null when the response is an error (e.g. TemplateDoesNotExist).
 */
export function parseGetTemplateResponse(xml) {
  if (!xml.includes("<GetTemplateResponse")) {
    return null;
  }
  return {
    name: readXmlElement(xml, "TemplateName"),
    subject: readXmlElement(xml, "SubjectPart"),
    html: readXmlElement(xml, "HtmlPart"),
    text: readXmlElement(xml, "TextPart"),
  };
}

/**
 * Fetch a template from LocalStack's SES v1 API. Templates are scoped by region,
 * and LocalStack picks the region from the credential scope of the Authorization
 * header (the signature itself is not checked).
 */
export async function fetchTemplate(localstackHost, region, name) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const response = await fetch(`${localstackHost}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `AWS4-HMAC-SHA256 Credential=test/${date}/${region || DEFAULT_REGION}/ses/aws4_request, SignedHeaders=host, Signature=localstack`,
    },
    body: new URLSearchParams({
      Action: "GetTemplate",
      Version: "2010-12-01",
      TemplateName: name,
    }).toString(),
  });
  return parseGetTemplateResponse(await response.text());
}

function formatTemplateData(rawData) {
  try {
    return JSON.stringify(JSON.parse(rawData), null, 2);
  } catch {
    return rawData;
  }
}

function render(source, data, options) {
  return source ? Handlebars.compile(source, options)(data) : undefined;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Build the email object for a message sent with SendTemplatedEmail.
 * `template` is the result of fetchTemplate (null when it no longer exists).
 */
export function renderTemplatedEmail(message, template) {
  const email = {
    timestamp: message.Timestamp,
    to: message.Destination?.ToAddresses,
    cc: message.Destination?.CcAddresses,
    bcc: message.Destination?.BccAddresses,
    attachments: [],
    isDownloadable: false,
    template: {
      name: message.Template,
      data: formatTemplateData(message.TemplateData),
    },
  };

  if (!template) {
    return { ...email, subject: `[template not found: ${message.Template}]`, html: "" };
  }

  try {
    const data = JSON.parse(message.TemplateData || "{}");
    const html = render(template.html, data);
    const text = render(template.text, data, { noEscape: true });
    return {
      ...email,
      subject: render(template.subject, data, { noEscape: true }) ?? "",
      html: html || (text ? `<pre>${escapeHtml(text)}</pre>` : ""),
    };
  } catch (err) {
    console.error(`Failed to render template ${message.Template}:`, err.message);
    return { ...email, subject: `[template error: ${message.Template}]`, html: "" };
  }
}
