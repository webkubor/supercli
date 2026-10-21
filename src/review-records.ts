/** 卡片核验与详情记录：只呈现有依据的范围，缺失记录不推断为通过或失败。 */
import { t, msg, locale, language, countLabel } from "./i18n";
import collections from "../data/community.json";
import type { Entry } from "./catalog";
import { maintainerLabels } from "./catalog";
import { escapeHtml as escape } from "./escape";
import {
  reviewFor,
  reviewRecords as records,
  type ReviewRecord,
} from "./review-data";
export { reviewFor, type ReviewRecord } from "./review-data";
const labels: Readonly<Record<string, string>> = {
  source: t("来源与维护方"),
  installation: t("安装方式"),
  purpose: t("用途与限制"),
  maintenance: t("公开维护信息"),
};
/** 来源标记表达维护方，厂商与社区使用等规格视觉，不暗示质量等级。 */
export function sourceBadge(item: Entry): string {
  return msg`<span class="source-badge" data-kind="${escape(item.maintainerType)}" title="维护来源，不代表质量评级"><i data-lucide="${item.maintainerType === "vendor" ? "building-2" : "users"}" aria-hidden="true"></i>${maintainerLabels[item.maintainerType]}</span>`;
}
/** 卡片到详情的证据入口，不将资料核对写成安装实测。 */
export function reviewCard(
  item: Entry,
  candidates: readonly ReviewRecord[] = records,
): string {
  const row = reviewFor(item, candidates);
  return msg`<button class="review-entry" data-review="${escape(item.id)}" aria-label="查看 ${escape(item.name)} 的收录与核验记录"><span><i data-lucide="file-text" aria-hidden="true"></i>收录与核验</span><small>${row ? countLabel(row.checks.length, "checks") : t("范围待补充")}</small><i data-lucide="arrow-up-right" aria-hidden="true"></i></button>`;
}
/** 展示核验时间、审核者、范围与证据；历史记录仅公开收录依据。 */
export function reviewDetail(
  item: Entry,
  candidates: readonly ReviewRecord[] = records,
): string {
  const row = reviewFor(item, candidates);
  const collection = collections.find((record) => record.id === item.id);
  const recorded = row
    ? msg`<p class="review-meta">核验于 <time datetime="${escape(row.reviewedAt)}">${new Date(row.reviewedAt).toLocaleDateString(locale, { timeZone: "Asia/Taipei" })}</time> · 维护者 <a href="https://github.com/${encodeURIComponent(row.reviewer)}" target="_blank" rel="noopener noreferrer">@${escape(row.reviewer)}</a> · <a href="${escape(row.evidence)}" target="_blank" rel="noopener noreferrer">审核依据</a></p><ul class="review-checks">${row.checks.map((check) => msg`<li><div><strong>${escape(labels[check.kind] ?? check.kind)}</strong><span class="review-method">${check.method === "execution" ? t("安装实测") : t("资料核对")}</span></div><p>${escape(t(check.note))}</p>${check.method === "execution" ? msg`<p>环境：${escape(check.environment ?? "")} · 版本：${escape(check.version ?? "")}</p>` : ""}<a href="${escape(check.reference)}" target="_blank" rel="noopener noreferrer">查看本项依据<i data-lucide="arrow-up-right"></i></a></li>`).join("")}</ul>${row.checks.some((check) => check.method === "execution") ? "" : t('<p class="review-boundary">本记录未包含本站独立安装实测。</p>')}`
    : msg`<p>专项核验记录尚在补充。本页不据此声明安装实测通过或项目安全。</p>${collection ? msg`<a href="${escape(collection.evidence)}" target="_blank" rel="noopener noreferrer">查看已有收录依据</a>` : ""}`;
  return msg`<details id="review-record" class="review-record"><summary><i data-lucide="file-text" aria-hidden="true"></i>SuperCLI 收录与核验<span>${row ? msg`${row.checks.length} 项有记录` : t("范围待补充")}</span><i data-lucide="chevron-down" class="review-chevron" aria-hidden="true"></i></summary><div class="review-content">${recorded}<a class="review-standard-link" href="${language === "en" ? "/en/standards" : "/standards"}">查看公开收录标准<i data-lucide="arrow-up-right"></i></a></div></details>`;
}
