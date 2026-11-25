# PersonaLab V2.0-student

PersonaLab 的独立科创团队工作台，以项目卡片为入口，聚焦场景痛点、需求证据、Persona 分歧、Spark 假设梳理、Mirror 原型预演、真人验证冲刺和提交材料准备。

本轮迭代增加三步项目创建引导、多项目独立保存、优先任务、项目复制、归档、恢复和永久删除。新用户先看到产品首页，已有项目的用户再次访问时会直接进入项目中心。

## 文件

- `index.html`：蓝色主题独立入口与学生版导航
- `styles.css`：V1.1 基础交互样式
- `student-blue.css`：蓝白橙视觉、响应式、项目中心与三步引导样式
- `app.js`：多项目管理、千问 Spark / Mirror 调用、Persona、资料、报告与本地状态
- `student.js`：科创工作台、证据台账、验证冲刺、提交检查与 Markdown 导出
- `assets/`：从主站复用的 PersonaLab Logo 与小P品牌素材

## 数据边界

当前项目存储键为 `personalab.student.v2`，项目库为 `personalab.student.v2.projects`，与主站和 V1.1 分开。千问生成的 Persona 视角、Spark 假设和 Mirror 问题都是待验证推测，不应当作真实用户结论。真实结论需由脱敏来源资料和真人任务测试支持。

## 版本关系

V1.1 已归档到 `../../02_历史版本/V1.1-prototype/`。V2.0 仅保存在 `PersonaLab-student` 分支目录，不修改 `PersonaLab-main`。

## 运行

从仓库根目录运行 `npm run dev`，访问 `http://localhost:3000/demo-student/index.html`。直接打开 `index.html` 或使用纯静态服务器时，千问接口不可用。
