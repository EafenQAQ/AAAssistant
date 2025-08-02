# AAAssistant - 记账应用

一个基于 Vue 3 + Supabase 的记账应用，支持多人共享账本和月度结算功能。

## 功能特性

- 👤 **用户认证** - 基于 Supabase Auth 的用户注册和登录
- 📚 **账本管理** - 创建个人或共享账本，管理账本成员
- 💰 **记账功能** - 添加支出和收入记录，支持多种分类
- 🔐 **权限控制** - 用户只能访问自己参与的账本和交易记录
- 📊 **月度结算** - 自动计算月度总支出和成员分摊金额
- 📱 **响应式设计** - 支持桌面端和移动端访问

## 技术栈

- **前端**: Vue 3 + Vue Router + Pinia
- **后端**: Supabase (数据库 + 认证)
- **样式**: CSS3 + 响应式设计
- **构建工具**: Vite

## 项目结构

```
src/
├── components/          # 组件
├── stores/             # Pinia 状态管理
├── views/              # 页面视图
├── router/             # 路由配置
├── utils/              # 工具函数
├── styles/             # 全局样式
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 数据库结构

应用使用以下 Supabase 表结构：

- `users` - 用户信息 (Supabase Auth)
- `account_books` - 账本信息
- `book_members` - 账本成员关系
- `transactions` - 交易记录

## 环境配置

1. 克隆项目
```bash
git clone <repository-url>
cd AAAssistant
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 在 Supabase 中创建数据库表：
```sql
-- account_books 表
CREATE TABLE account_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  is_personal BOOLEAN DEFAULT false,
  description TEXT
);

-- book_members 表
CREATE TABLE book_members (
  book_id UUID REFERENCES account_books(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (book_id, user_id)
);

-- transactions 表
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  book_id UUID REFERENCES account_books(id),
  payer_id UUID REFERENCES auth.users(id),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category TEXT,
  transaction_date DATE NOT NULL,
  notes TEXT
);

-- 创建 RLS 策略
ALTER TABLE account_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

## 开发和部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 使用说明

1. **注册/登录**: 用户可以通过邮箱注册账号并登录
2. **创建账本**: 用户可以创建个人账本或共享账本
3. **添加成员**: 对于共享账本，可以添加其他用户作为成员
4. **记账**: 在账本中添加支出或收入记录
5. **查看交易**: 浏览账本中的所有交易记录
6. **月度结算**: 生成月度结算报告，计算成员分摊金额

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
