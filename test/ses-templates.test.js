import nock from "nock";
import {
  fetchTemplate,
  parseGetTemplateResponse,
  renderTemplatedEmail,
} from "../lib/ses-templates.js";
import {
  getTemplateNotFoundXml,
  getTemplateTextOnlyXml,
  getTemplateXml,
  templatedMessage,
  textOnlyTemplatedMessage,
} from "./fixtures/messages.js";

const host = "http://localstack.test:4566";

describe("parseGetTemplateResponse", () => {
  test("reads every part and decodes XML entities", () => {
    expect(parseGetTemplateResponse(getTemplateXml)).toEqual({
      name: "jogo-acoes__login-link",
      subject: "Hello {{name}}, your login link",
      text: "Hi {{name}}, log in at {{link}}",
      html: '<p>Hi {{name}},</p><p><a href="{{link}}">Log in</a></p>',
    });
  });

  test("leaves an empty part undefined", () => {
    expect(parseGetTemplateResponse(getTemplateTextOnlyXml).html).toBeUndefined();
  });

  test("decodes numeric entities", () => {
    const xml = "<GetTemplateResponse><SubjectPart>Caf&#233; &#x2713;</SubjectPart></GetTemplateResponse>";
    expect(parseGetTemplateResponse(xml).subject).toBe("Café ✓");
  });

  test("returns null for an error response", () => {
    expect(parseGetTemplateResponse(getTemplateNotFoundXml)).toBeNull();
  });
});

describe("fetchTemplate", () => {
  afterEach(() => nock.cleanAll());

  test("asks for the template in the message's region", async () => {
    nock(host)
      .matchHeader("authorization", /\/eu-west-1\/ses\/aws4_request/)
      .post("/", (body) => body.Action === "GetTemplate" && body.TemplateName === "jogo-acoes__login-link")
      .reply(200, getTemplateXml);

    const template = await fetchTemplate(host, "eu-west-1", "jogo-acoes__login-link");
    expect(template.name).toBe("jogo-acoes__login-link");
  });

  test("falls back to us-east-1 when the message has no region", async () => {
    nock(host)
      .matchHeader("authorization", /\/us-east-1\/ses\/aws4_request/)
      .post("/")
      .reply(200, getTemplateXml);

    expect(await fetchTemplate(host, undefined, "jogo-acoes__login-link")).not.toBeNull();
  });

  test("returns null when the template does not exist", async () => {
    nock(host).post("/").reply(400, getTemplateNotFoundXml);
    expect(await fetchTemplate(host, "us-east-1", "nope")).toBeNull();
  });
});

describe("renderTemplatedEmail", () => {
  const loginTemplate = parseGetTemplateResponse(getTemplateXml);

  test("renders subject and HTML with the template data", () => {
    const email = renderTemplatedEmail(templatedMessage(), loginTemplate);
    expect(email).toMatchObject({
      subject: "Hello Administrator, your login link",
      html: '<p>Hi Administrator,</p><p><a href="/login-links/cbce55b1">Log in</a></p>',
      to: ["success+admin@simulator.amazonses.com"],
      attachments: [],
      isDownloadable: false,
      template: { name: "jogo-acoes__login-link" },
    });
    expect(JSON.parse(email.template.data)).toEqual({ name: "Administrator", link: "/login-links/cbce55b1" });
  });

  test("escapes data in the HTML part but not in the subject", () => {
    const email = renderTemplatedEmail(
      templatedMessage({ TemplateData: JSON.stringify({ name: "<b>Ann & Bob</b>", link: "x" }) }),
      loginTemplate,
    );
    expect(email.subject).toBe("Hello <b>Ann & Bob</b>, your login link");
    expect(email.html).toContain("Hi &lt;b&gt;Ann &amp; Bob&lt;/b&gt;,");
  });

  test("shows the text part when the template has no HTML part", () => {
    const email = renderTemplatedEmail(textOnlyTemplatedMessage(), parseGetTemplateResponse(getTemplateTextOnlyXml));
    expect(email.subject).toBe("Plain 1");
    expect(email.html).toBe("<pre>Only text 1</pre>");
    expect(email.cc).toEqual(["c@example.com"]);
  });

  test("escapes the text part when wrapping it in HTML", () => {
    const template = { subject: "s", text: "<script>{{x}}</script>" };
    const email = renderTemplatedEmail(textOnlyTemplatedMessage(), template);
    expect(email.html).toBe("<pre>&#60;script&#62;1&#60;/script&#62;</pre>");
  });

  test("falls back to name and data when the template no longer exists", () => {
    const email = renderTemplatedEmail(templatedMessage(), null);
    expect(email.subject).toBe("[template not found: jogo-acoes__login-link]");
    expect(email.html).toBe("");
    expect(email.template.data).toContain("Administrator");
  });

  test("falls back when the template data is not valid JSON", () => {
    const email = renderTemplatedEmail(templatedMessage({ TemplateData: "not json" }), loginTemplate);
    expect(email.subject).toBe("[template error: jogo-acoes__login-link]");
    expect(email.template.data).toBe("not json");
  });

  test("falls back when the template does not compile", () => {
    const email = renderTemplatedEmail(templatedMessage(), { subject: "{{#if}}" });
    expect(email.subject).toBe("[template error: jogo-acoes__login-link]");
  });
});
