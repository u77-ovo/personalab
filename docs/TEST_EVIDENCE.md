# Test Evidence

## 2026-11-02 · P01–P05 Local Demo

- 环境：Windows / Node 24 / Next.js 16 / APP_MODE=demo
- 完成功能：Landing、Dashboard、Spark、Mirror、Proof、Reports、Settings、两个 Route Handler、本地持久化、Markdown 导出。
- 未完成：真实 OpenAI、Supabase、登录权限、云端部署、文件型访谈导入、Playwright E2E。
- 安全边界：无密钥；不联网检索；图片限制 MIME 和 5 MB；访谈引用必须通过范围校验；敏感资料提示已展示。
- `npm run lint`：通过，exit 0。
- `npm run typecheck`：通过，exit 0。
- `npm run test`：通过，exit 0；1 个测试文件、3 个测试通过（评分、原文 offsets、篡改引用拒绝）。
- `npm run build`：通过，exit 0；12 个路由生成成功，包含 2 个动态 Route Handler。
- `npm audit --omit=dev --audit-level=high`：通过，生产依赖 0 个已知漏洞。
- Playwright E2E：未配置、未运行；本轮使用真实浏览器手动走查补充，但不等同自动 E2E。
- 浏览器手动主链路：Landing → Spark 评估 → Idea 转 Project → Mirror Demo 预检 → Proof 提取与原文核对 → Action → Report；刷新后 Report 恢复成功。
- 响应式走查：390 × 844 手机视口通过；六项导航可达，Dashboard 3/3 状态可见。
- 浏览器 Console：走查结束时 error 日志为 0。
- 截图证据：`docs/screenshots/dashboard-2.0.png`。

## 2026-11-03 · Real 模式安全底座

- 新增功能：Supabase SSR 客户端、Next.js 16 Proxy、登录/注册/确认回调、配置状态 API、设置页集成状态。
- 配置边界：Demo 无密钥继续运行；Real 缺 URL 或 publishable key 时拒绝受保护工作区；service-role key 不会出现在状态响应。
- 数据库：新增 `0002_security_and_rls.sql`，覆盖 16 张业务表的 RLS、关系归属校验与 10 MB 私有 Storage bucket。
- 数据库验证状态：迁移和 pgTAP 测试已编写，但本机未安装/启动 Supabase 本地栈，也没有用户云项目，因此**未执行**，不能视为已部署或已通过 RLS 验证。
- `npm run lint`：通过，exit 0。
- `npm run typecheck`：通过，exit 0。
- `npm run test`：通过，exit 0；2 个测试文件、7 个测试通过。
- `npm run build`：通过，exit 0；15 个路由，含 5 个动态路由与 Proxy。
- `npm audit --omit=dev --audit-level=high`：通过，生产依赖 0 个已知漏洞。
- 测试工具：Vitest 升级至 5.1.0，旧版 critical 告警已消除；开发工具链仍有 16 个来自 ESLint 依赖树的 moderate 告警，未使用会破坏版本的 `--force` 修复。
- 浏览器实测：`/login` 在未配置时显示 Demo 回退；`/workspace/settings` 正确显示 5 项集成状态；浏览器 console error/warn 为 0。

## 2026-11-03 · 部署前检查

- Git：当前为 `main`，尚无远端；`.env.local` 被忽略，`.env.example` 已放行。
- 本机工具：未安装 GitHub CLI、Vercel CLI；不影响后续使用网页逐步部署。
- 新增：数据与隐私页、RLS / Storage 验证开关、GitHub Actions 质量流程、部署手册。
- `npm run lint`：通过，exit 0。
- `npm run typecheck`：通过，exit 0。
- `npm run test`：通过，exit 0；2 个测试文件、9 个测试通过。
- `npm run build`：通过，exit 0；16 个路由，含数据与隐私页、5 个动态路由与 Proxy。
- 浏览器实测：`/data-and-privacy` 内容与返回入口可达；console error/warn 为 0。
