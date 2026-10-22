/** 公开收录标准页，只呈现静态标准，不执行项目安装或自动审核。 */
import { setupLanguage } from "./i18n";
import { createIcons, Building2, Users, ArrowUpRight } from "lucide";
import "./style.css";
import { setupTheme } from "./theme";
createIcons({ icons: { Building2, Users, ArrowUpRight } });

setupTheme();
setupLanguage();
