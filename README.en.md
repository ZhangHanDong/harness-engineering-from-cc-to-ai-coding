<p align="center">
  <img src="./book/src/assets/cover-en.jpeg" alt="Harness Engineering cover" width="420">
</p>

[简体中文](./README.md) | [Tiếng Việt](./README.vi.md)

# Harness Engineering: From Claude Code Internals to AI Coding Best Practices

This repository publishes a technical book about Harness Engineering through the lens of Claude Code. The material is derived from the publicly distributed Claude Code `v2.1.88` package and source map reconstruction, then turned into a book focused on reusable engineering patterns rather than product marketing or unofficial feature rumors.

The English edition is currently a scaffolded preview with the full table of contents, cover, and placeholder chapter pages. The Chinese edition remains the canonical version while the English translation is added chapter by chapter.

## Read Online

- English edition (preview): <https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/en/>
- Chinese edition: <https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/>

## What the Book Covers

- Claude Code architecture, the Agent Loop, and tool execution orchestration
- System prompts, tool prompts, and model-specific tuning
- Automatic compaction, token budgeting, and prompt caching
- Permission modes, safety rules, hooks, and user instruction overlays
- Multi-agent orchestration, the skills system, and feature-flag pipelines
- Production-oriented lessons for building AI coding systems

## Audience

- Engineers building AI coding products or agent infrastructure
- Developers who want to understand how Claude Code is put together
- Teams looking for transferable implementation patterns from a real-world agent system

## Local Preview

```bash
mdbook build book
mdbook serve book
```

Default local URL:

- <http://localhost:3000>

## Notes

- This book is based on analysis of publicly distributed artifacts and is intended for research and engineering discussion
- It does not represent official Anthropic documentation or statements
- This repository tracks only the files required to publish the book to GitHub Pages
