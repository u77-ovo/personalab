# PersonaLab V2.0-student

> PersonaLab 的独立学生科创竞赛分支。

本分支面向学生赛道、大创和科创竞赛，围绕“场景痛点—Persona 分歧—需求假设—原型预演—真人验证—提交表达”组织项目打磨流程。

## 学生版入口

GitHub Pages 提供静态预览。Spark 和 Mirror 的千问报告需要运行完整的 Next.js 项目。

学生版前端位于 [`public/demo-student/`](public/demo-student/)，千问代理接口位于 `src/app/api/student/research/route.ts`。浏览器不会获得千问 API Key。

```bash
git clone --branch personalab-student --single-branch https://github.com/u77-ovo/personalab.git
cd personalab
npm install
npm run dev
```

打开 <http://localhost:3000/demo-student/index.html>。

复制 `.env.example` 为 `.env.local`，填写百炼业务空间对应的 `QWEN_API_KEY` 和 `QWEN_BASE_URL`，再将 `AI_LIVE_ENABLED` 改为 `true`。不要把 `.env.local` 提交到 Git。

## 主要功能

- 蓝色主题学生竞赛工作台；
- 项目卡片与赛前验证进度；
- 科创项目蓝图；
- Persona 痛点地图；
- Spark 千问需求报告；
- Mirror 千问原型预检报告；
- 可追踪的结构化研究报告：执行摘要、证据审计、证据缺口、验证计划和真人观察指标；
- 真人验证冲刺；
- 提交材料检查和 Markdown 导出；
- 浏览器本地保存，与主站存储相互独立。

## 证据边界

千问生成内容统一视为待验证假设。正式参赛材料仍需补充可追溯资料和真人任务测试。

## 公开免登录部署

在 Vercel 导入本仓库，将生产分支设为 `personalab-student`。把 `QWEN_API_KEY` 与 `QWEN_BASE_URL` 保存到 Production 环境变量，先保留 `AI_LIVE_ENABLED=false`。访客无需 PersonaLab 账号，项目保存在各自的浏览器中。

启用公开 AI 前先设置可执行的全站调用上限，再将 `AI_LIVE_ENABLED` 设为 `true` 并重新部署。使用站点提供的 API Key 时，调用额度由站点方承担。当前应用的每小时 IP 限流只在单个服务实例内生效。

## 版本关系

- `main`：PersonaLab 主站与公开 Demo；
- `personalab-student`：本学生科创竞赛版；
- 学生版存储键：`personalab.student.v2`。

GitHub Pages 只能发布静态预览，不能安全保存千问 Key 或运行 `/api/student/research`。真实 AI 版本请部署到 Vercel。

