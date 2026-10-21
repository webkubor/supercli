/** 工具落地页回归：无脚本正文、真实来源、双语、核验边界和内容转义。 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalog } from "../src/catalog.ts";
import { escapeHtml } from "../src/escape.ts";
import { localizedPage, pageSource } from "./localized-pages.ts";
import { toolMarkup } from "./tool-markup.ts";
const template = readFileSync(
  new URL("../guides.html", import.meta.url),
  "utf8",
);

test("every tool has a bilingual static landing page without the homepage or a modal", () => {
  for (const item of catalog)
    for (const language of ["zh", "en"]) {
      const route = `/tools/${item.id}/`;
      const prefix = language === "en" ? "/en" : "";
      assert.equal(pageSource(route), "guides.html");
      const html = localizedPage(template, route, language);
      assert.doesNotMatch(html, /<dialog|id="catalog"|src="\/src\/main.ts"/);
      assert.equal((html.match(/<h1>/g) ?? []).length, 1);
      assert(html.includes(`href="${escapeHtml(item.docs)}"`));
      if (item.install)
        assert(html.includes(`<code>${escapeHtml(item.install)}</code>`));
      assert(html.includes(`href="${prefix}/?tool=${item.id}#directory"`));
      assert(html.includes(`href="${prefix}/standards"`));
      const share = new URL(
        html
          .match(/href="(https:\/\/twitter.com\/intent\/tweet[^"]*)"/)[1]
          .replaceAll("&amp;", "&"),
      );
      assert.equal(
        share.searchParams.get("url"),
        `https://supercli.site${prefix}${route}`,
      );
      assert(
        html.includes(`href="${prefix}${route}" data-language="${language}"`),
      );
      if (language === "en")
        assert.doesNotMatch(
          html.match(/<main\b.*?<\/main>/s)[0],
          /[\u3400-\u9fff]/,
        );
    }
});

test("tool pages link back to relevant guides and preserve current review evidence", () => {
  const wrangler = catalog.find((item) => item.id === "wrangler");
  for (const language of ["zh", "en"]) {
    const prefix = language === "en" ? "/en" : "";
    const html = toolMarkup(wrangler, language);
    assert(html.includes(`href="${prefix}/guides/cloud-deployment/"`));
    assert(
      html.includes(
        language === "en" ? "Review scope is pending" : "专项核验范围待补充",
      ),
    );
  }
  const reviewed = catalog.find((item) => item.id === "dyt-ashare-cli");
  const html = toolMarkup(reviewed, "en");
  assert.match(html, /supercli\/pull\/4/);
  assert.match(html, /documentation/);
  assert.match(html, /not independently/);
  const changed = toolMarkup({ ...reviewed, install: "changed command" }, "en");
  assert.match(changed, /Review scope is pending/);
  assert.doesNotMatch(changed, /supercli\/pull\/4/);
});

test("missing install and repository stay explicit and catalog content stays escaped", () => {
  const item = { ...catalog[0], install: null, repo: null };
  const html = toolMarkup(item, "en");
  assert.match(html, /No confirmed one-line installation command/);
  assert.doesNotMatch(html, /<code>|Source repository/);
  const attack = '<img src=x onerror="alert(1)">';
  const escaped = toolMarkup(
    { ...item, name: attack, description: attack, install: attack },
    "zh",
  );
  assert(!escaped.includes(attack));
  assert(escaped.includes(escapeHtml(attack)));
});
