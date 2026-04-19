<p align="center">
  <img src="./book/src/assets/cover-zh.webp" alt="《马书》封面" width="420">
</p>

[English](./README.en.md)

# 驾驭工程：从 Claude Code 源码到 AI 编码最佳实践

中文别名：《马书》

这是一本围绕 Harness Engineering（驾驭工程）的中文技术书。它以 Claude Code `v2.1.88` 的公开发布包与 source map 还原结果为分析材料，不试图复刻官方产品文档，而是从真实工程实现中提炼 AI 编码 Agent 的架构模式、上下文策略、权限体系和生产实践。

## 在线阅读

- 中文版 GitHub Pages：<https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/>
- 英文版 GitHub Pages（预览）：<https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/en/>

## 本书讲什么

- Claude Code 的整体架构、Agent Loop 与工具执行编排
- 系统提示词、工具提示词与模型特定调优
- 自动压缩、微压缩、Token 预算与 Prompt Cache
- 权限模式、规则系统、YOLO 分类器与 Hooks
- 多 Agent 编排、技能系统、Feature Flags 与未发布能力管线
- 面向生产环境的 AI Coding 最佳实践，以及 Claude Code 的局限与启发

## 结构概览

全书目前分为 7 篇正文与 4 个附录，覆盖从底层架构到上层方法论的完整链路：

- 第一篇：架构
- 第二篇：提示工程
- 第三篇：上下文管理
- 第四篇：提示词缓存
- 第五篇：安全与权限
- 第六篇：高级子系统
- 第七篇：AI Agent 构建者的经验教训

## 适合读者

- 正在做 AI Coding、Agent 框架、模型工具调用平台的工程师
- 想系统理解 Claude Code 工程实现细节的开发者
- 希望把源码分析转化为可复用工程模式的团队与研究者

## 本地预览

```bash
mdbook build book
mdbook serve book
```

默认预览地址：

- <http://localhost:3000>

## 说明

- 本书基于公开发布包与 source map 的逆向分析，仅用于技术研究与工程讨论
- 书中内容聚焦工程实现与设计模式，不代表 Anthropic 官方立场
- 本仓库默认只跟踪书籍发布所需文件，以便直接部署到 GitHub Pages
- 英文版站点已经搭好目录、封面和章节占位页，后续将逐章翻译补全
