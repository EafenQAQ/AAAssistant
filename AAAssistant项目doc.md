# 你的任务
我要做一个vue3 + supabase的记账本项目，我说思路，请你帮我实现具体代码

# 项目背景

这个项目是我个人使用，目的是为了和我室友两个人方便地记账和计算支出，并在每个月末结算，平均负担这个月的总支出

## supabase数据库结构

我已经在supabase创建了以下几个核心表：

1. **`users` 表** (`auth.users`):
    
    - Supabase 默认提供，存储所有注册用户的信息。
        
    - 字段：`id` (UUID, 主键), `email`, `created_at` 等。
        
2. **`account_books` 表**:
    
    - 表示一个独立的账本。
        
    - 字段：
        
        - `id` (UUID): 主键，账本的唯一标识符。
            
        - `created_at` (timestamp with time zone): 账本创建时间。
            
        - `name` (text): 账本名称 (例如："我和小明的共同账本", "我的个人账本")。
            
        - `owner_id` (UUID): 外键，关联到 `auth.users.id`，表示这个账本的创建者或主要管理者。
            
        - `is_personal` (boolean): 标记这个账本是否是个人账本（不与他人共享）。默认为 `true` 或 `false`，取决于你的默认设置。
            
        - `description` (text): 可选，账本的描述。
            
3. **`book_members` 表 (联结表 / Junction Table)**:
    
    - 这是一个多对多（many-to-many）的联结表，用于记录哪些用户与哪个账本关联（即谁是这个账本的成员，可以查看和记录）。
        
    - 字段：
        
        - `book_id` (UUID): 外键，关联到 `account_books.id`。
            
        - `user_id` (UUID): 外键，关联到 `auth.users.id`。
            
        - `joined_at` (timestamp with time zone): 用户加入账本的时间。
            
        - `role` (text / enum): 可选，用户在账本中的角色（例如：'admin', 'member'）。这对于更精细的权限控制很有用。
            
        - **主键**: `(book_id, user_id)` (联合主键，确保一个用户在一个账本中只有一条记录)。
            
4. **`transactions` 表**:
    
    - 存储具体的记账记录，每条记录属于一个特定的账本。
        
    - 字段：
        
        - `id` (UUID): 主键，交易记录的唯一标识符。
            
        - `created_at` (timestamp with time zone): 记录创建时间。
            
        - `book_id` (UUID): **外键，关联到 `account_books.id`**，表示这笔交易属于哪个账本。
            
        - `payer_id` (UUID): 外键，关联到 `auth.users.id`，表示这笔交易是谁支付的。
            
        - `amount` (NUMERIC(12, 2)): 金额。
            
        - `description` (text): 描述。
            
        - `type` (text): `'expense'` 或 `'income'`。
            
        - `category` (text): 类别。
            
        - `transaction_date` (date): 交易发生日期。
            
        - `notes` (text): 备注。

## UI风格

简约、扁平化的设计理念
遵循以下设计，包括网站颜色，设计风格等：

``` CSS
:root {
  /* 网站主要颜色 */
  --base-color: #ebba80;
  --secondary-color: #dd9d94;
  /* base次要颜色 */
  --base-light: hsl(from var(--base-color) h s calc(l + 10));
  /* base强调色 */
  --base-accent: hsl(from var(--base-color) h s calc(l - 10));
  --base-accent-2: hsl(from var(--base-color) h s calc(l - 20));
  /* secondary次要颜色 */
  --secondary-light: hsl(from var(--secondary-color) h s calc(l + 10));
  /* secondary强调色 */
  --secondary-accent: hsl(from var(--secondary-color) h s calc(l - 10));

  /* 响应式断点 */
  --breakpoint-tablet: 768px;
  --breakpoint-mobile: 480px;

  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* 字体大小系统 */
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.125rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-3xl: 2rem;
  --font-4xl: 2.5rem;

  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

  /* 圆角系统 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 50%;
}

/* 全局重置和基础样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fafafa;
}

main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  min-height: 100vh;
}

/* 标题样式统一 */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.3;
  color: var(--base-accent-2);
}

h1 {
  font-size: var(--font-4xl);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

h2 {
  font-size: var(--font-3xl);
  margin-bottom: var(--spacing-lg);
}

/* 段落样式 */
p {
  margin: 0 0 var(--spacing-md) 0;
}

/* 链接样式统一 */
a {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

/* pill标签样式 */
.pill {
  display: inline-block;
  background: var(--secondary-accent);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  font-size: var(--font-lg);
  font-weight: 500;
  color: white;
  cursor: pointer;
  margin: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  transition: all 0.3s ease;
}

.pill:hover {
  background: var(--base-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式网格布局 */
.layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  main {
    padding: var(--spacing-sm);
  }

  h1 {
    font-size: var(--font-3xl);
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    font-size: var(--font-2xl);
  }

  .layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }

  .pill {
    font-size: var(--font-base);
    padding: var(--spacing-xs) var(--spacing-sm);
    margin: var(--spacing-xs);
  }
}

@media (max-width: 480px) {
  main {
    padding: var(--spacing-xs);
  }

  h1 {
    font-size: var(--font-2xl);
  }

  h2 {
    font-size: var(--font-xl);
  }
}

.page-content {
  /* 响应式的宽度设计 */
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  min-height: 60vh;
}

```

## 核心功能

- 使用supabase的SDK和supabase交互
- 用户只能看到他们是成员的账本。
- 用户只能对他们是成员的账本中的交易记录进行操作。
- 用户可以创建自己的账本，并自动成为该账本的成员。
- 用户可以关联另几个用户，共用一个账本
- 每一条记账记录显示记账者、备注、金额以及支出类别
- **重要**：计算并显示每个月的总支出，每个账本成员的总支出



