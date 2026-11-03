# PersonaLab 正式部署路线

目标架构：**GitHub 保存代码，Vercel 运行 Next.js，Supabase 保存账号、数据库和私有文件。**

## 四个容易混淆的动作

- **保存（Save）**：只把修改写入电脑文件。
- **Commit**：在本地 Git 历史中记录一个版本。
- **Push**：把本地 Commit 上传到 GitHub。
- **Deploy**：Vercel 读取 GitHub 代码，构建并发布网站。

Push 不等于 Deploy；GitHub 也不会自动保存 PersonaLab 用户的研究数据。

## 推荐的安全顺序

### 阶段 1：GitHub 私有仓库

推荐先使用 **Private** 仓库。源代码可以以后公开，但私有仓库更适合尚未完成隐私政策、数据删除和双账号测试的开发阶段。

1. 登录 GitHub，右上角 `+` → `New repository`。
2. Repository name 填写 `personalab`。
3. 选择 `Private`。
4. 不勾选 README、`.gitignore` 或 License，避免和本地已有文件冲突。
5. 创建后保留页面，不要把任何 Token 或密码复制到源码。
6. 将本地 `main` 分支连接并 Push 到该仓库。

当前安全检查：`.env*` 会被 Git 忽略，只有不含真实密钥的 `.env.example` 可以提交。

### 阶段 2：Vercel 先发布 Demo

第一次发布仍使用 `APP_MODE=demo`，先验证页面、路由和移动端，不接收真实访谈资料。

1. 使用 GitHub 账号登录 Vercel。
2. `Add New...` → `Project` → 选择 `personalab`。
3. Framework Preset 应识别为 `Next.js`。
4. Root Directory 保持仓库根目录。
5. 暂时只添加 `APP_MODE=demo`。
6. 点击 Deploy，记录生成的 `https://...vercel.app` 地址。

### 阶段 3：创建 Supabase 项目

1. 创建新项目并选择离主要用户较近、且符合研究数据要求的区域。
2. 数据库密码必须由用户自行保管，不发送到聊天或写入 Git。
3. 从项目的 Connect 面板取得：
   - Project URL
   - Publishable key（`sb_publishable_...`）
4. 不要复制 secret key，除非未来确实有必须绕过 RLS 的服务器管理任务。

### 阶段 4：迁移与隔离验证

按顺序执行：

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_security_and_rls.sql`
3. 双账号测试：账号 A 和账号 B 互相看不到项目、访谈证据与文件。
4. 私有 Storage 测试：文件路径必须是 `<当前用户 id>/...`。
5. 测试全部通过后，才把 `SUPABASE_RLS_VERIFIED` 和 `SUPABASE_STORAGE_VERIFIED` 设为 `true`。

### 阶段 5：Vercel 切换 Real

在 Vercel 的 Production 环境中添加：

```text
APP_MODE=real
NEXT_PUBLIC_SUPABASE_URL=你的项目 URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的 publishable key
SUPABASE_RLS_VERIFIED=true
SUPABASE_STORAGE_VERIFIED=true
APP_BASE_URL=https://你的正式域名
```

重新 Deploy 后，在 Supabase Auth 中把正式域名加入允许的 Site URL / Redirect URLs。

## 发布前禁止事项

- 不提交 `.env.local`、数据库密码、secret/service-role key 或 OpenAI key。
- 不在 RLS 测试前上传真实访谈材料。
- 不把 publishable key 当成权限系统；真正限制数据的是登录身份、表授权和 RLS。
- 不在浏览器代码中调用 OpenAI secret key。
- 不把“网页打开成功”当成“数据隔离验证成功”。
