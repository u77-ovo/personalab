# PersonaLab V2.0-student

PersonaLab 的独立学生竞赛原型，以项目卡片为入口，聚焦场景痛点、需求证据、Persona 分歧、Spark 假设梳理、Mirror 原型预演、真人验证冲刺和提交材料准备。

## 文件

- `index.html`：蓝色主题独立入口与学生版导航
- `styles.css`：V1.1 基础交互样式
- `student-blue.css`：V2.0 蓝色视觉、响应式和新增模块样式
- `app.js`：Spark、Mirror、Persona、资料、报告与本地状态
- `student.js`：科创工作台、证据台账、验证冲刺、提交检查与 Markdown 导出
- `assets/`：从主站复用的 PersonaLab Logo 与小P品牌素材

## 数据边界

浏览器存储键为 `personalab.student.v2`，与主站和 V1.1 分开。页面中的示例、Persona 推演、Spark 输出和 Mirror 评分仅用于演示验证流程，不应当作真实用户结论。真实结论需由脱敏来源资料和真人任务测试支持。

## 版本关系

V1.1 已归档到 `../../02_历史版本/V1.1-prototype/`。V2.0 仅保存在 `PersonaLab-student` 分支目录，不修改 `PersonaLab-main`。

## 运行

直接打开 `index.html`，或在上一级目录运行 `node preview-server.js` 后访问 `http://127.0.0.1:4181/`。

