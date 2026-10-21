/** 内容页增强：场景与工具正文在构建时输出，客户端只负责语言切换。路由：/guides/*、/tools/* 及英文版本。 */
import { setupLanguage } from "./i18n";
import "./style.css";
import "./styles/guides.css";
setupLanguage();
