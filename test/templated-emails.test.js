import supertest from "supertest";
import nock from "nock";

process.env.SMTP_FORWARD_ENABLED = "false";

import app from "../app.js";
import {
  getTemplateNotFoundXml,
  getTemplateTextOnlyXml,
  getTemplateXml,
  templatedMessage,
  textOnlyTemplatedMessage,
} from "./fixtures/messages.js";

const localstack = () => nock(process.env.LOCALSTACK_HOST || "http://localhost:4566");

const simpleMessage = {
  Timestamp: "2026-10-13T01:00:00",
  Subject: "Simple email",
  Destination: { ToAddresses: ["jeff@aws.com"] },
  Body: { text_part: null, html_part: "<html>simple</html>" },
};

const mockMessages = (...messages) => localstack().get("/_aws/ses").reply(200, { messages });

const mockTemplate = (name, xml, status = 200) =>
  localstack()
    .post("/", (body) => body.Action === "GetTemplate" && body.TemplateName === name)
    .reply(status, xml);

describe("Templated emails", () => {
  afterEach(() => nock.cleanAll());

  test("GET / lists templated emails alongside other formats", async () => {
    mockMessages(simpleMessage, templatedMessage(), textOnlyTemplatedMessage());
    mockTemplate("jogo-acoes__login-link", getTemplateXml);
    mockTemplate("text-only", getTemplateTextOnlyXml);

    const response = await supertest(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Simple email");
    expect(response.text).toContain("Hello Administrator, your login link");
    expect(response.text).toContain("Plain 1");
    expect(response.text).not.toContain("/emails/1/download");
  });

  test("GET / fetches a template shared by several emails only once", async () => {
    mockMessages(templatedMessage(), templatedMessage({ Id: "second" }));
    const getTemplate = mockTemplate("jogo-acoes__login-link", getTemplateXml);

    const response = await supertest(app).get("/");

    expect(response.status).toBe(200);
    expect(getTemplate.isDone()).toBe(true);
    expect(response.text.match(/Hello Administrator/g)).toHaveLength(2);
  });

  test("GET /emails/:id shows the rendered email, the template name and its data", async () => {
    mockMessages(templatedMessage());
    mockTemplate("jogo-acoes__login-link", getTemplateXml);

    const response = await supertest(app).get("/emails/0");

    expect(response.status).toBe(200);
    expect(response.text).toContain('<a href="/login-links/cbce55b1">Log in</a>');
    expect(response.text).toContain("jogo-acoes__login-link");
    expect(response.text).toContain("&quot;name&quot;: &quot;Administrator&quot;");
  });

  test("GET /emails/:id still loads when the template no longer exists", async () => {
    mockMessages(templatedMessage());
    mockTemplate("jogo-acoes__login-link", getTemplateNotFoundXml, 400);

    const response = await supertest(app).get("/emails/0");

    expect(response.status).toBe(200);
    expect(response.text).toContain("[template not found: jogo-acoes__login-link]");
    expect(response.text).toContain("Administrator");
  });

  test("GET /emails/latest returns the rendered HTML of a templated email", async () => {
    mockMessages(simpleMessage, templatedMessage());
    mockTemplate("jogo-acoes__login-link", getTemplateXml);

    const response = await supertest(app).get("/emails/latest");

    expect(response.status).toBe(200);
    expect(response.text).toBe('<p>Hi Administrator,</p><p><a href="/login-links/cbce55b1">Log in</a></p>');
  });

  test("GET /emails/:id/download rejects templated emails", async () => {
    mockMessages(templatedMessage());

    const response = await supertest(app).get("/emails/0/download");

    expect(response.status).toBe(400);
  });
});
