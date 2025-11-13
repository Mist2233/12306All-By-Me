# Git 提交和上传指南

## 步骤 1：检查 Git 状态

```bash
git status
```

## 步骤 2：添加所有文件

```bash
git add .
```

## 步骤 3：提交更改

```bash
git commit -m "Initial commit: 12306 Front-End Deconstruct Tool

- 完整的网页前端解构功能
- 支持整站爬取和精确 URL 爬取
- 自动下载 CSS、JS、图片、字体等资源
- 路径自动修正和本地化
- 内置异步 HTTP 预览服务器
- 完善的文档和使用指南"
```

## 步骤 4：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名：`12306FrontEndDestruct` 或其他名称
3. 描述：`A powerful web front-end deconstruction tool for extracting HTML, CSS, JavaScript, images, and fonts from websites`
4. 选择 Public 或 Private
5. **不要**初始化 README、.gitignore 或 LICENSE（我们已经有了）
6. 点击 "Create repository"

## 步骤 5：关联远程仓库

```bash
git remote add origin https://github.com/你的用户名/12306FrontEndDestruct.git
```

## 步骤 6：推送到 GitHub

```bash
# 如果你的默认分支是 main
git branch -M main
git push -u origin main

# 如果你的默认分支是 master
git branch -M master
git push -u origin master
```

## 步骤 7：验证上传

访问你的 GitHub 仓库，检查文件是否都已上传。

## 可选：设置仓库信息

在 GitHub 仓库页面：

1. **About** - 添加描述和主题标签
   - 描述：`A powerful web front-end deconstruction tool`
   - Topics: `web-scraping`, `playwright`, `python`, `beautifulsoup`, `frontend`, `web-crawler`

2. **README** - 确认 README.md 正确显示

3. **Settings** > **Social Preview** - 可以添加一个封面图片

## 常见问题

### 问题 1：远程仓库已存在文件

如果 GitHub 仓库已有内容，可能需要先拉取：

```bash
git pull origin main --allow-unrelated-histories
# 解决冲突后
git push -u origin main
```

### 问题 2：推送被拒绝

确保你有推送权限，可能需要配置 SSH 密钥或使用个人访问令牌。

### 问题 3：文件过大

如果 `deconstructed_site/` 很大，确保它在 `.gitignore` 中：

```bash
# .gitignore 已包含
deconstructed_site/
```

## 后续更新

之后的更新可以使用：

```bash
git add .
git commit -m "描述你的更改"
git push
```

## 建议的提交规范

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构代码
- `test:` 测试相关
- `chore:` 构建/工具相关

例如：
```bash
git commit -m "feat: 添加断点续爬功能"
git commit -m "fix: 修复 CSS 资源路径错误"
git commit -m "docs: 更新 README 安装说明"
```
