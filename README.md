# SmartDraw AI Designer

下一代 AI 驱动的在线绘图编辑器，提供类似 draw.io 的专业级流程图、ER 图、UML 图和白板设计体验。

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## 功能特性

- **图形绘制** — 流程图、ER 图、UML 图、思维导图、网络拓扑、BPMN
- **专业编辑器** — 无限画布、缩放/平移、网格吸附、对齐辅助线、小地图
- **连线系统** — 贝塞尔曲线、折线、直线、自动路由、动态锚点、箭头类型切换
- **拖拽操作** — 从左侧面板拖拽图形至画布，dnd-kit 驱动
- **图层系统** — 图层排序、锁定、隐藏、分组
- **多页面** — 新建/删除/复制/切换页面
- **导入导出** — JSON、draw.io XML 导入，PNG/SVG/PDF 导出
- **撤销重做** — 完整的历史记录与操作回放
- **快捷键** — Ctrl+Z/Y/C/V/D、Delete 等常用编辑快捷键
- **自动保存** — 可配置间隔的自动保存（默认 30 秒）
- **深色 UI** — 专业深色模式，draw.io 风格
- **多人协同** — Socket.IO 驱动的实时协同编辑、用户在线状态、光标同步
- **用户系统** — JWT 认证、注册/登录、个人中心、设置管理

## 技术栈

### 前端

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 |
| Vite | 构建工具 |
| TailwindCSS | 样式 |
| React Flow | 画布与节点连线 |
| Zustand | 状态管理 |
| Framer Motion | 动画 |
| dnd-kit | 拖拽系统 |
| Radix UI | 无障碍 UI 原语 |
| Lucide Icons | 图标库 |
| Socket.IO Client | 实时通信 |
| html2canvas + jsPDF | 导出 |

### 后端

| 技术 | 用途 |
|------|------|
| Node.js + Express | HTTP API |
| TypeScript | 类型安全 |
| JWT | 认证 |
| Socket.IO | 实时协同 |
| MySQL 2 | 数据库驱动 |
| bcryptjs | 密码加密 |

### 基础设施

- **MySQL 8.0** — 持久化存储
- **Nginx** — 反向代理与静态资源
- **Docker Compose** — 一键部署

## 项目结构

```
smartdraw-ai-designer/
├── client/                     # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── editor/         # 编辑器组件 (ContextMenu, Import/Export Dialog)
│   │   │   ├── layout/         # 布局组件 (StatusBar, PageTabs)
│   │   │   └── ui/             # UI 原语 (Button, Input, Select, Tooltip...)
│   │   ├── hooks/              # 自定义 Hooks (useSocket, useAutoSave, useExport...)
│   │   ├── pages/              # 页面 (Login, Register, Home, Projects, Settings...)
│   │   ├── store/              # Zustand 状态 (authStore, collaborationStore)
│   │   └── lib/                # 工具函数
│   └── Dockerfile
├── server/                     # Express 后端
│   └── src/
│       ├── routes/             # API 路由 (auth, projects, diagrams, sync, user)
│       ├── middleware/         # 中间件 (auth, errorHandler)
│       ├── socket/             # Socket.IO 协同
│       ├── db.ts               # 数据库连接
│       └── app.ts              # 应用入口
├── database/
│   └── schema.sql              # 数据库表结构
├── docker-compose.yml          # Docker 编排
├── nginx.conf                  # Nginx 配置
└── README.md
```

## 快速开始

### 前置条件

- Node.js >= 18
- MySQL 8.0
- (可选) Docker & Docker Compose

### 本地开发

```bash
# 1. 初始化数据库
mysql -u root -p < database/schema.sql

# 2. 启动后端
cd server
cp .env.example .env   # 编辑数据库连接信息
npm install
npm run dev             # 监听 3001 端口

# 3. 启动前端
cd client
npm install
npm run dev             # 监听 5173 端口
```

### Docker 部署

```bash
# 修改 docker-compose.yml 中的 JWT_SECRET
docker compose up -d

# 访问 http://localhost:80
```

## 环境变量

服务端 `.env`：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3001 |
| DB_HOST | MySQL 地址 | localhost |
| DB_PORT | MySQL 端口 | 3306 |
| DB_USER | 数据库用户 | smartdraw |
| DB_PASSWORD | 数据库密码 | — |
| DB_NAME | 数据库名 | smartdraw |
| JWT_SECRET | JWT 签名密钥 | — |
| CORS_ORIGIN | 允许的前端域名 | http://localhost:5173 |

## API 概览

| 路径 | 说明 |
|------|------|
| `POST /api/auth/register` | 注册 |
| `POST /api/auth/login` | 登录 |
| `GET/POST/PUT/DELETE /api/projects` | 项目 CRUD |
| `GET/POST/PUT/DELETE /api/diagrams` | 图表 CRUD |
| `POST /api/sync` | 操作同步 |
| `GET/PUT /api/user` | 用户信息与设置 |
| `GET /api/health` | 健康检查 |

WebSocket: `ws://localhost:3001` — 协同编辑通道

## 数据库表

| 表 | 说明 |
|------|------|
| users | 用户 |
| projects | 项目 |
| diagrams | 图表 |
| diagram_pages | 页面（多页面支持） |
| diagram_nodes | 节点 |
| diagram_edges | 连线 |
| operation_history | 操作历史（撤销/重做） |
| user_settings | 用户偏好 |
| collaboration_sessions | 协同会话 |
| shape_templates | 图形模板库 |

## License

MIT
