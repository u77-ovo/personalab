# Architecture Decisions

## ADR-001：先交付诚实可运行的 Local Demo

当前目录没有既有源码，也没有 Supabase/OpenAI 凭据。因此第一阶段采用浏览器 LocalStorage 与服务端 Demo Fixture，所有界面显式标注 Demo，不生成虚假来源。

## ADR-002：证据校验必须在服务端 Route Handler 执行

ProofLab 将原文、引用和 offsets 发送到 `/api/evidence/validate`。只有 `source.slice(startOffset, endOffset) === exactQuote` 时才能标记 verified。前端本地函数保留同一规则并用于单测。

## ADR-003：静态截图预检只形成假设

`/api/demo/simulate` 返回 `sourceKind=ai_inference` 和 `status=unverified_ai_hypothesis`。结果包含替代解释和建议验证，不输出点击成功率、反应时或真人证词。

## ADR-004：云端架构先提供 migration，不虚报已部署

Supabase migration 已覆盖全部业务表 RLS、私有 Storage 与账号路径策略；本轮没有用户云项目，因此没有执行远端迁移或双账号隔离验证。

## ADR-005：Real 模式必须 fail closed

`APP_MODE=real` 缺少 Supabase URL 或 publishable key 时，不允许受保护工作台静默降级到 Demo。Demo 仍可独立运行，状态接口只返回配置布尔值，不返回任何密钥。

## ADR-006：登录边界使用 Supabase SSR 与 Next.js Proxy

浏览器、服务器和 Proxy 分离创建客户端；Proxy 仅保护 `/workspace` 并刷新会话。页面和未来 Server Actions 仍必须各自执行授权检查，不能把 Proxy 当成唯一权限层。
