# Test Evidence

## 2026-11-24 · 千问真实 AI 接入

- 分支与位置：独立 `personalab-student` 工作树；未覆盖 `main` 分支。
- 新增功能：仅使用千问的服务器端结构化报告接口 `/api/student/research`；Spark 需求探索与 Mirror 原型预检均已接入，旧的浏览器本地模板生成入口已移除。
- 安全边界：API Key 仅从服务器环境变量读取；输入使用 Zod 限长和校验；拒绝明显跨站请求；按 IP 做每小时内存限流；千问内容统一标记为“AI 推测 · 待验证”；无密钥时明确报错，不生成假结果。
- Next.js：从 16.4.4 升级到 16.4.6，已消除生产依赖中的已知安全公告。
- `npm run lint`：通过，exit 0；仅剩 `student-evidence.js` 中 3 个既有未使用函数警告，无 error。
- `npm run typecheck`：通过，exit 0。
- `npm run test`：通过，exit 0；3 个测试文件、12 个测试通过。
- `node --check public/demo-student/app.js`：通过，exit 0。
- `npm run build`：通过，exit 0；`/api/student/research` 为动态 Route Handler。
- `npm audit --omit=dev --json`：通过；生产依赖 0 个已知漏洞。完整开发依赖树仍有 7 个来自 ESLint / TypeScript ESLint 的 moderate 告警。
- 运行态验证：`/demo-student/index.html` 返回 200；未配置千问密钥时，合法请求返回 503 `QWEN_NOT_CONFIGURED`。
- 尚未验证：当前机器没有 `QWEN_API_KEY` 和业务空间 `QWEN_BASE_URL`，因此尚未进行真实扣额度调用；登录、数据库级用户额度、全站预算和图片内容上传尚未接入。

## 2026-11-25 · 千问连通与报告 V2

- 百炼状态：实名认证及模型服务已生效；`qwen3.8-flash` 最小直连返回 200。
- PersonaLab 端到端：`/api/student/research` 的 Spark 与 Mirror 均返回 200；Key 只由服务器读取，浏览器未接触密钥。
- Spark 报告：新增执行摘要、证据覆盖、证据缺口、结构化验证目标/方法/成功信号、模型与生成记录追踪。
- Mirror 报告：新增预检摘要、逐问题验证方法、真人测试观察指标、主持人提示和文本预检边界。
- 报告中心：新增报告总数、真实 AI 报告、高优先级问题、资料关联假设四项汇总，以及每份报告的摘要、模型、生成时间和内容计数。
- Markdown 导出：新增生成信息、执行摘要、AI Persona 边界、证据状态、证据缺口、验证计划、观察指标和主持人提示。
- 历史兼容：旧版 Spark 验证步骤会被转换为兼容的验证计划；旧版 Mirror 缺少的新字段默认使用空数组。
- 真实结构化测试：Spark 返回 2 条假设、3 个证据缺口和 3 项验证计划；Mirror 返回 3 个问题、4 项指标和 4 条主持人提示。
- 浏览器实测：示例项目成功生成千问 Spark 报告；报告概览、证据审计、报告中心均可访问；console error/warn 为 0。
- `npm run typecheck`、`npm run test`、`npm run build`、`node --check public/demo-student/app.js`：全部通过。

## 2026-11-02 · P01–P05 Local Demo

- 环境：Windows / Node 24 / Next.js 16 / APP_MODE=demo
- 完成功能：Landing、Dashboard、Spark、Mirror、Proof、Reports、Settings、两个 Route Handler、本地持久化、Markdown 导出。
- 未完成：带真实 Key 的千问线上调用、Supabase、登录权限、云端部署、文件型访谈导入、Playwright E2E。
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
