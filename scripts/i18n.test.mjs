/** 双语搜索、静态收录、工具分享与外部插值的安全行为回归。 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  localizedPage,
  pagePaths,
  pageSource,
  sitemap,
} from "./localized-pages.ts";
import { translate } from "../src/translations.ts";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const catalogData = JSON.parse(read("data/catalog.json"));
const english = JSON.parse(read("data/catalog.en.json"));

test("every catalog entry has a distinct English description and no orphan translations", () => {
  assert.deepEqual(
    Object.keys(english).sort(),
    catalogData.map((item) => item.id).sort(),
  );
  for (const item of catalogData) {
    assert(english[item.id].length > 20);
    assert.doesNotMatch(english[item.id], /[\u3400-\u9fff]/);
  }
});
test("static pages have reciprocal language links, self canonicals, and crawlable content", () => {
  for (const lang of ["zh", "en"])
    for (const path of ["/", "/standards", "/brand", "/tools/wrangler/"]) {
      const template = read(pageSource(path));
      const html = localizedPage(template, path, lang);
      const url = `https://supercli.site${lang === "en" ? "/en" : ""}${path}`;
      assert(html.includes(`<link rel="canonical" href="${url}">`));
      assert(
        html.includes(`hreflang="zh-CN" href="https://supercli.site${path}"`),
      );
      assert(
        html.includes(`hreflang="en" href="https://supercli.site/en${path}"`),
      );
      assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
      assert.match(html, /application\/ld\+json/);
      assert.match(html, /social-card\.png/);
      if (path === "/")
        assert.match(
          html,
          lang === "en" ? /Develop and deploy Workers/ : /在终端开发和部署/,
        );
      if (path.includes("/tools/"))
        assert.match(html, /<title>Wrangler — SuperCLI<\/title>/);
    }
  assert.equal((sitemap().match(/<loc>/g) ?? []).length, pagePaths.length * 2);
  assert.doesNotMatch(sitemap(), /<loc>[^<]*\?/);
});

globalThis.location = { pathname: "/en/" };
const { msg, languageUrl } = await import("../src/i18n.ts");
const { queryEntries, catalog } = await import("../src/catalog.ts");
const { detailMarkup } = await import("../src/html.ts");
const { cardMarkup } = await import("../src/card.ts");
const { xShareUrl, sharePageUrl } = await import("../src/sharing.ts");
test("language switch preserves query, current tool and hash", () => {
  const url = new URL(
    "https://supercli.site/?q=cloud&category=cloud&tool=aws#directory",
  );
  const en = languageUrl(url, "en");
  assert.equal(en.pathname, "/en/");
  assert.equal(en.search, url.search);
  assert.equal(en.hash, url.hash);
  assert.equal(languageUrl(en, "zh").href, url.href);
});
test("search matches both English and Chinese purposes and categories in English", () => {
  assert(
    queryEntries("cloud", "cloud", "", "stars").some(
      (item) => item.id === "tccli",
    ),
  );
  assert(
    queryEntries("云平台", "", "", "stars").some(
      (item) => item.id === "wrangler",
    ),
  );
  assert(
    queryEntries("fuzzy", "", "", "stars").some((item) => item.id === "fzf"),
  );
});
test("English cards and details preserve review boundaries and escape external information", () => {
  const item = catalog.find((item) => item.id === "dyt-ashare-cli");
  const html = detailMarkup(item, null);
  assert.match(html, /independent installation testing/);
  assert.match(html, /Source review/);
  assert.doesNotMatch(html, /[\u3400-\u9fff]/);
  const attack = "<img src=x onerror=alert(1)>";
  assert(
    detailMarkup({ ...item, name: attack, description: attack }, null).includes(
      "&lt;img",
    ),
  );
  assert(
    !cardMarkup({ ...item, description: attack }, 0, "stars").includes(attack),
  );
  assert.equal(msg`<p>安装${"中文外部内容"}</p>`, "<p>Install中文外部内容</p>");
  assert.equal(translate("复制", "zh"), "复制");
});
test("X share encodes titles and URLs and tool links use crawlable localized pages", () => {
  const url = sharePageUrl(
    new URL("https://supercli.site/en/?q=a&tool=gh#directory"),
    "gh",
  );
  assert.equal(url.href, "https://supercli.site/en/tools/gh/");
  const intent = new URL(xShareUrl(url.href, "GitHub CLI & tools #1"));
  assert.equal(intent.origin, "https://twitter.com");
  assert.equal(intent.searchParams.get("url"), url.href);
  assert.equal(intent.searchParams.get("text"), "GitHub CLI & tools #1");
});

test("retrieval indexes include bilingual sources and explicit evidence limits", async () => {
  const { discoveryIndex, llmsIndex } = await import("./discovery-index.ts");
  const snapshot = JSON.parse(discoveryIndex());
  assert.equal(snapshot.tools.length, catalogData.length);
  assert(snapshot.snapshots.github);
  assert(snapshot.snapshots.npm);
  assert(snapshot.limitations.some((note) => note.includes("not zero")));
  assert(!discoveryIndex().includes("locallyInstalled"));
  const tool = snapshot.tools.find((item) => item.id === "dyt-ashare-cli");
  assert(tool.review.checks.every((check) => check.method === "documentation"));
  assert(
    tool.review.checks.every(
      (check) => check.note.en && check.reference.startsWith("https://"),
    ),
  );
  assert.match(llmsIndex(), /independent installation tests/);
});
