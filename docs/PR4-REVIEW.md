# PR #4 安装方式复核 · 2026-10-21

- 核对目录命令与上游固定版本 de39936ba6be9d71ef5860fe230aa73d05f31544 README 第45–74行一致。
- 只下载并阅读当前 HTTPS 安装脚本，未执行脚本或下载运行 CLI。脚本会安装 CLI、Skill 并修改 shell PATH，上游 README 已披露这些行为；提供 --no-modify-path 选项。
- 本次仅为资料核对，不构成安装实测、签名验证或安全认证。保留 documentation 方法和未实测声明。
- 维护者刷新核验时间及依据至 PR #4，固定完整 README commit，避免沿用 PR #2 的旧安装审核记录。
