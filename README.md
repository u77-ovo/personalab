# PersonaLab 2.0

PersonaLab 是一个中文优先的 AI 产品研究工作台：

- **SparkLab**：Idea → 六维机会评估 → MVP Blueprint
- **MirrorLab**：Project → Research Task → Persona 视角 → 待验证 Issue
- **ProofLab**：匿名真实资料 → 可回溯 Evidence → Action → Markdown Report

当前仓库提供可运行的 **Local Demo**，并已加入 Real 模式的安全接入底座。Demo 使用浏览器 LocalStorage 和可重现 Fixture，不会假装执行真实 AI、联网检索、真人研究或云端保存；Real 模式在配置不完整时会拒绝启动受保护工作区。

## Windows 本地启动

```powershell
cd D:\PersonaLab\personalab
npm install
npm run dev
```

浏览器打开 <http://localhost:3000>。

## 质量检查

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Demo 与 Real 的区别

| 能力 | Demo | Real（待接入） |
| --- | --- | --- |
| 数据 | 浏览器 LocalStorage | Supabase PostgreSQL + RLS |
| 图片 | 小图可本地预览 | 私有 Storage + 签名 URL |
| 分析 | 固定 Fixture | OpenAI Responses API 结构化输出 |
| 外部检索 | 明确未执行 | Web Search + 来源与检索日期 |
| 登录权限 | 无需登录 | Supabase Auth + Next.js Proxy 会话校验（底座已实现） |

复制 `.env.example` 为 `.env.local` 后再填写本机密钥。不要把任何密钥粘贴到聊天或提交到 Git。

## 目录

- `src/app`：页面与 Route Handlers
- `src/components`：通用 UI 与工作台布局
- `src/features`：跨页面状态与领域功能
- `src/lib`：数据类型、Demo Fixture、评分、证据校验与 Supabase SSR 客户端
- `src/server`：服务端环境配置校验；不会向浏览器返回密钥
- `supabase/migrations`：数据库结构与逐表 RLS / 私有 Storage 迁移（尚未应用远端）
- `supabase/tests`：需要本地 Supabase + Docker 才能运行的权限隔离测试
- `docs`：路线、决策与测试证据

详细状态见 [docs/ROADMAP.md](docs/ROADMAP.md)、[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) 与 [docs/TEST_EVIDENCE.md](docs/TEST_EVIDENCE.md)。
