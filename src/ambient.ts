/** 氛围网格点：按行列排布并逐点错峰，形成横向流动的波。 */
import type { Language } from "./translations";

/** 点位按百分比定位，覆盖首屏宽度；沿两条对角线排布，疏密有序。 */
const points: readonly (readonly [number, number])[] = [
  [8, 30], [19, 58], [31, 22], [43, 66], [55, 38], [66, 74],
  [77, 18], [88, 52], [94, 84], [12, 88], [38, 8], [72, 92],
];

/** 波形相位：点与点之间延后固定间隔，让亮点像波一样向右推进。 */
const step = 240;

/** 生成网格点标记；纯装饰，读屏不可见。 */
export function ambientGridMarkup(language: Language): string {
  return `<div class="ambient-grid" aria-hidden="true">${points
    .map(
      ([left, top], index) =>
        `<i style="left:${left}%;top:${top}%;animation-delay:${index * step}ms"></i>`,
    )
    .join("")}</div>`;
}
