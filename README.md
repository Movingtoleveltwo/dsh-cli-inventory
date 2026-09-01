# 📋 dsh-cli-inventory (DeepSeek Harness 命令行资产清册)

> **全景可视化体检系统 CLI 装备库**：为 DeepSeek Harness (DSH) 提供原生的命令行工具资产盘点看板、健康体检、账号登录态检测、一键复制安装及 Markdown 报告导出。

---

## 🌟 核心特性

- **🎯 零上下文污染（0 Token 消耗）**：纯 Web 前端 + 本地轻量 RPC 探针直连，完全不占用大模型宝贵的对话上下文与计算资源。
- **📊 插件市场级双列卡片 UI**：1:1 还原现代暗色网格卡片布局，自带多维分类胶囊标签（版本管理、编程运行时、自动化、容器、数据库、运维媒体）。
- **🔍 深度探针与状态感知**：
  - `gh (GitHub CLI)`：深度检测 `gh auth status` 登录账号与 Token 有效性；
  - `docker`：深度检测 Docker 守护进程（Daemon）是否处于存活运行状态；
  - `git`：检测当前用户的 `user.name` 与 `user.email` 配置；
  - `playwright` / `node` / `python` / `rust` / `go` 等 20+ 款主流开发工具一键体检。
- **⚡ 一键操作**：
  - 缺失工具一键复制安装指令（如 `sudo apt install xxx`）；
  - 路径与版本一键点击复制；
  - 一键导出结构化 Markdown 系统能力体检报告。
- **🛠️ 自定义命令实时探测**：搜索框输入任意未知系统命令，实时探测其在当前环境中的安装状态与绝对路径。

---

## 🚀 安装与加载

本插件遵循标准 DSH / Cordis 插件规范：

1. **添加到项目依赖**：
```bash
pnpm add dsh-cli-inventory
```

2. **在 `cordis.yml` 中引入**：
```yaml
- insert:
    - id: dsh-cli-inventory
      name: dsh-cli-inventory
```

---

## 🏗️ 目录结构

```
dsh-cli-inventory/
├── package.json        # 插件元数据与 DSH 客户端依赖注入声明
├── cordis.patch.yml    # DSH 自动装配补丁
├── README.md           # 中文说明文档
├── LICENSE             # MIT 开源许可证
├── lib/
│   ├── index.js        # 后端 RPC 路由服务 (/dsh-cli-inventory/rpc)
│   └── probers.js      # CLI 探针引擎（并发探测、版本号提取、深度鉴权检测）
└── client/
    └── client.js       # 前端 React 卡片网格界面与样式系统
```

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 授权。
