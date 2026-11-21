# PersonaLab V2.0-student

> PersonaLab 的独立学生科创竞赛分支。

本分支面向学生赛道、大创和科创竞赛，围绕“场景痛点—Persona 分歧—需求假设—原型预演—真人验证—提交表达”组织项目打磨流程。

## 学生版入口

**在线体验：<https://u77-ovo.github.io/personalab/student/>**

静态原型位于 [`public/demo-student/`](public/demo-student/)。下载或克隆本分支后，直接打开 `public/demo-student/index.html` 即可体验。

```bash
git clone --branch personalab-student --single-branch https://github.com/u77-ovo/personalab.git
cd personalab/public/demo-student
```

## 主要功能

- 蓝色主题学生竞赛工作台；
- 项目卡片与赛前验证进度；
- 科创项目蓝图；
- Persona 痛点地图；
- Spark 需求假设梳理；
- Mirror 产品 Demo 预演；
- 真人验证冲刺；
- 提交材料检查和 Markdown 导出；
- 浏览器本地保存，与主站存储相互独立。

## 证据边界

当前版本是离线交互原型。Spark、Mirror、Persona 推演和自动自查用于发现问题、完善测试设计，不代表真实用户研究结论。正式参赛材料仍需补充可追溯资料和真人任务测试。

## 版本关系

- `main`：PersonaLab 主站与公开 Demo；
- `personalab-student`：本学生科创竞赛版；
- 学生版存储键：`personalab.student.v2`。

Pages 部署会保留主站根路径，并将本学生版发布到 `/personalab/student/`。

