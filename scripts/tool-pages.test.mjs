/** 工具落地页回归：无脚本正文、真实来源、双语、核验边界和内容转义。 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalog } from "../src/catalog.ts";
import { escapeHtml } from "../src/escape.ts";
import { localizedPage, pageSource } from "./localized-pages.ts";
import { toolMarkup, inclusionMarkup, faqs } from "./tool-markup.ts";
import community from "../data/community.json" with { type: "json" };
import metrics from "../data/metrics.json" with { type: "json" };
import { discoveryIndex } from "./discovery-index.ts";
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
      if (item.install) {
        // 命令按词分色渲染，正文里不应出现未分词的原始命令。
        assert(html.includes(`data-copy-command="${escapeHtml(item.install)}"`));
        assert.match(html, /class="terminal-window"/);
        assert.match(html, /class="terminal-prompt">\$</);
        assert(!html.includes(`<code>${escapeHtml(item.install)}</code>`));
        const line = html.match(
          /<code class="terminal-line">([\s\S]*?)<\/code>/,
        );
        assert(line, "terminal line");
        const plain = line[1]
          .replace(/<[^>]*>/g, "")
          .replaceAll("&amp;", "&")
          .replaceAll("&lt;", "<")
          .replaceAll("&gt;", ">")
          .replaceAll("&quot;", '"')
          .replaceAll("&#39;", "'");
        assert.equal(plain, `$${item.install}`);
      }
      assert(html.includes(`href="${prefix}/?tool=${item.id}#directory"`));
      assert(html.includes(`href="${prefix}/standards"`));
      const record = community.find((row) => row.id === item.id);
      assert(html.includes(`datetime="${record.addedAt}"`));
      assert(html.includes(`href="${record.evidence}"`));
      assert(html.includes(`https://github.com/${record.curatedBy}`));
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
      const card = `https://supercli.site/og/tools/${item.id}.png`;
      assert(html.includes(`property="og:image" content="${card}"`));
      assert(html.includes(`name="twitter:image" content="${card}"`));
      const faq = html.match(
        /<section class="guide-checklist tool-faq">([\s\S]*?)<\/section>/,
      );
      assert(faq, `${item.id} FAQ section`);
      assert.equal((faq[1].match(/<h3>/g) ?? []).length, 3);
      assert.match(html, /"@type":"FAQPage"/);
      if (language === "en")
        assert.doesNotMatch(
          html.match(/<main\b.*?<\/main>/s)[0],
          /[\u3400-\u9fff]/,
        );
    }
});

test("inclusion attribution does not invent recommendations, release dates or missing records", () => {
  const record = community.find((row) => row.id === "wrangler");
  const html = inclusionMarkup({ id: record.id }, "en");
  assert.match(html, /Curated by/);
  assert.match(html, /not an upstream release/);
  assert.match(html, /not independent installation tests/);
  assert.doesNotMatch(html, /Recommended by/);
  assert.equal(inclusionMarkup({ id: "missing" }, "en"), "");
  const attack = '<img src=x onerror="alert(1)">';
  const recommended = inclusionMarkup({ id: record.id }, "en", [
    { ...record, curatedBy: attack, recommendedBy: attack },
  ]);
  assert.match(recommended, /Recommended by/);
  assert(!recommended.includes(attack));
  assert(recommended.includes(escapeHtml(attack)));
  assert(recommended.includes(encodeURIComponent(attack)));
});

test("public retrieval data uses the same original inclusion records as the static pages", () => {
  const data = JSON.parse(discoveryIndex());
  assert(
    data.limitations.some((note) => note.includes("not upstream releases")),
  );
  for (const tool of data.tools) {
    const record = community.find((row) => row.id === tool.id);
    assert.deepEqual(tool.inclusion, {
      addedAt: record.addedAt,
      curatedBy: record.curatedBy,
      recommendedBy: record.recommendedBy,
      evidence: record.evidence,
    });
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

test("FAQ entries are shared by visible markup and structured data and stay sourced", () => {
  const wrangler = catalog.find((item) => item.id === "wrangler");
  const metric = metrics.repositories.wrangler;
  for (const language of ["zh", "en"]) {
    const entries = faqs(wrangler, language);
    assert.equal(entries.length, 3);
    assert(entries[0].answer.includes(wrangler.install));
    assert(entries[1].answer.includes(metric.repo));
    assert(
      entries[1].answer.includes(
        Intl.NumberFormat(language === "en" ? "en-US" : "zh-CN").format(
          metric.stars,
        ),
      ),
    );
    const html = localizedPage(template, "/tools/wrangler/", language);
    const schemas = [...html.matchAll(
      /<script type="application\/ld\+json">(.*?)<\/script>/gs,
    )].map((match) => JSON.parse(match[1]));
    const faq = schemas.find((node) => node["@type"] === "FAQPage");
    assert(
      faq,
      `FAQPage schema for ${language}`,
    );
    assert.equal(
      faq.url,
      `https://supercli.site${language === "en" ? "/en" : ""}/tools/wrangler/`,
    );
    assert.equal(faq.inLanguage, language === "en" ? "en" : "zh-CN");
    assert.deepEqual(
      faq.mainEntity.map((question) => question.name),
      entries.map((entry) => entry.question),
    );
    for (const [index, question] of faq.mainEntity.entries())
      assert.equal(question.acceptedAnswer.text, entries[index].answer);
    for (const entry of entries) {
      assert(html.includes(escapeHtml(entry.question)));
      assert(html.includes(escapeHtml(entry.answer)));
    }
  }
});

test("FAQ answers stay honest when install or metrics are missing", () => {
  const item = { ...catalog[0], install: null };
  for (const language of ["zh", "en"]) {
    const entries = faqs(item, language);
    assert(
      entries[0].answer.includes(
        language === "en" ? "official documentation" : "官方文档",
      ),
    );
    assert(!entries[0].answer.includes("null"));
    const unranked = faqs({ ...item, id: "missing-metrics" }, language);
    assert(
      unranked[1].answer.includes(
        language === "en" ? "no comparable GitHub metrics" : "暂无可比",
      ),
    );
  }
  const wrangler = catalog.find((entry) => entry.id === "wrangler");
  const attack = '<img src=x onerror="alert(1)">';
  const html = toolMarkup(
    { ...wrangler, name: attack, install: attack },
    "zh",
  );
  assert(!html.includes(attack));
  assert(html.includes(escapeHtml(attack)));
});

test("install commands render as a terminal window with a copyable command", () => {
  const wrangler = catalog.find((item) => item.id === "wrangler");
  for (const language of ["zh", "en"]) {
    const html = toolMarkup(wrangler, language);
    assert.match(html, /class="terminal-window"/);
    assert.match(html, /class="terminal-bar"/);
    assert.match(html, /class="terminal-body"/);
    assert.match(html, /class="terminal-prompt">\$</);
    assert.match(html, /class="terminal-caret"/);
    // 氛围网格是纯装饰，不能进入读屏。
    assert.match(html, /class="ambient-grid" aria-hidden="true"/);
    // 命令按词分色，不允许把整条命令塞进一个未分色的 code。
    assert.match(html, /class="term-command"[^>]*>npm</);
    assert.match(html, /class="term-flag"[^>]*>-g</);
    assert.match(html, /data-copy-command="npm install -g wrangler"/);
    assert.match(html, /class="copy terminal-copy"/);
    // 逐词点亮的错峰序号：每个词都带 --i，供 CSS 计算延迟。
    const words = html.match(/class="term-\w+" style="--i:(\d+)"/g) ?? [];
    assert.equal(words.length, 4);
    assert.deepEqual(
      words.map((word) => Number(word.match(/--i:(\d+)/)[1])),
      [0, 1, 2, 3],
    );
    // 复制按钮的可访问名必须转义，工具名来自外部数据。
    const label = html.match(/terminal-copy" data-copy-command="[^"]*" aria-label="([^"]*)"/);
    assert(label, "copy button label");
    assert(!label[1].includes('"'));
  }
  // 没有安装命令时不输出终端窗口，改用明确的空状态。
  const empty = toolMarkup({ ...wrangler, install: null }, "en");
  assert.match(empty, /class="terminal-empty"/);
  assert.doesNotMatch(empty, /terminal-window/);
  assert.doesNotMatch(empty, /data-copy-command/);
});

test("missing install and repository stay explicit and catalog content stays escaped", () => {
  const item = { ...catalog[0], install: null, repo: null };
  const html = toolMarkup(item, "en");
  assert.match(html, /No confirmed one-line installation command/);
  assert.match(html, /terminal-empty/);
  assert.doesNotMatch(html, /<code>|Source repository/);
  const attack = '<img src=x onerror="alert(1)">';
  const escaped = toolMarkup(
    { ...item, name: attack, description: attack, install: attack },
    "zh",
  );
  assert(!escaped.includes(attack));
  assert(escaped.includes(escapeHtml(attack)));
  // 属性值同样必须转义：未转义的引号会提前闭合属性。
  for (const attribute of escaped.match(/aria-label="[^"]*"/g) ?? [])
    assert(!attribute.includes('onerror="'), attribute);
});
