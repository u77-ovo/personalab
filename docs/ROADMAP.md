# PersonaLab 2.0 Roadmap

## 已完成：Local Demo 主链路

- Landing、Dashboard、全站桌面/移动导航
- SparkLab Idea Intake、六维评分、历史版本、Blueprint 与 Markdown 导出
- Idea → Project 关联转化
- MirrorLab Project Setup、截图校验、Task、Persona 多选、服务端 Demo 分析、Issue Center
- ProofLab 逐字稿解析、原文 offsets 校验、Issue–Evidence 关系、Action、Markdown Report
- LocalStorage 刷新恢复、Demo/Real 边界、单元测试与生产构建

## 已完成：Real 模式安全底座（尚未连接云项目）

- `APP_MODE=demo|real` 严格校验；Real 缺 Supabase 配置时 fail closed
- Supabase SSR 浏览器/服务端客户端、Next.js 16 `proxy.ts` 会话刷新与工作台保护
- 邮箱密码登录、注册、确认回调入口；未配置时明确回到 Demo
- `/api/runtime/status` 只返回布尔状态，不返回任何 Key
- 逐表 RLS、账号归属函数、私有 Storage bucket 和路径策略迁移
- pgTAP 双账号隔离测试草案（需要 Supabase CLI + Docker 后执行）

## 下一阶段：连接真实 Supabase

1. 用户创建 Supabase 项目，在本机 `.env.local` 填写 URL 与 publishable key。
2. 在空白/一次性项目执行 `0001`、`0002`，运行 pgTAP，修正全部失败后再连接正式资料。
3. 建立服务器 Repository，将 LocalStorage Store 逐模块迁移为数据库持久化。
4. 增加 TXT/MD/CSV 文件导入、私有上传、删除与保留策略。
5. 增加 Playwright Demo 主链路与双账户隔离 E2E。
6. 最后接 OpenAI Responses API 的结构化输出、超时、幂等与预算。

## 已完成：部署前准备

- `.env.local` 等真实配置保持忽略，`.env.example` 可安全提交
- Supabase 新版 publishable / secret key 命名兼容
- “连接已配置”与“RLS / Storage 已验证”分开展示
- `/data-and-privacy` 数据边界与公开测试限制说明
- GitHub Actions 自动执行 lint、typecheck、test、build
- GitHub → Vercel → Supabase 分阶段部署手册

下一操作需要用户选择 GitHub 仓库可见性（推荐 Private），然后创建远端仓库并 Push。

## 发布前 Gate

- Migration 可从空库执行；RLS 默认拒绝并逐表验证。
- 两个账户互相不可读取项目、资料或文件。
- 真实 AI 失败不会静默切换 Demo。
- Preview 与 Production 环境变量分离。
- lint / typecheck / test / build / E2E 均记录真实退出状态。
