---
title: "日常使用的Shell命令收集"
date: 2026-04-28T00:00:00+08:00
tags: ["Shell", "Linux"]
categories: ["Linux"]
toc: true
---

在日常的 Shell 操作中，经常会碰到或写出一些有趣且实用的命令。这篇博客用于持续记录学习过程中这些零碎的技巧，以便后续查询和使用。

## 1.找出最常用的命令
### 第一种方法：从 Shell 历史文件中（不推荐）

```bash
cat ~/.bash_history | awk '{cmd=$0; sub(/^[ \t]+/, "", cmd); if(length(cmd)>0) print cmd}' | sort | uniq -c | sort -nr | head -20
```

**命令解析：**
- `cat ~/.bash_history`：读取历史文件。
- `awk '{...}'`：去掉行首空白，并过滤掉空行（因为历史文件可能有空行）。
- `sort`：排序使相同命令相邻。
- `uniq -c`：统计每条命令出现次数。
- `sort -nr`：按总次数进行降序排列。
- `head -20`：只提取并显示最常用的前 20 条命令。

### 第二种方法： fzf 模糊查找工具（推荐）

`fzf` 是一款极速的命令行模糊搜索工具，能够极大提升终端操作效率。
#### 配置fzf

```bash
# Debian/Ubuntu
sudo apt install fzf

# macOS (Homebrew)
brew install fzf

# Arch Linux
sudo pacman -S fzf
```

#### 增强快捷键（需配置 Shell 集成）

在 `~/.bashrc` 或 `~/.zshrc` 中添加 `eval "$(fzf --bash)"` 后，可激活以下快捷键：

| 快捷键 | 功能 | 使用示例 |
| :--- | :--- | :--- |
| `Ctrl-R` | 模糊搜索命令历史并执行，使用`Tab`多选 | `Ctrl-R` → 输入关键词 → `Enter` | 
| `Ctrl-T` | 搜索当前目录下文件并将路径插入命令行 | `vim ` → `Ctrl-T` → 选择文件 |
| `Alt-C` | 搜索子目录并自动 `cd` 进入 | `Alt-C` → 输入目录名 → `Enter` |

#### 单行命令示例

##### 交互式切换目录
```bash
cd "$(find . -type d | fzf)"
```
> **解析**：通过 `find` 递归列出所有子目录，交由 `fzf` 交互选择，最后 `cd` 进入。

##### 交互式选择文件并用 Vim 打开
```bash
# 可将 vim 替换为 nano, code 等
vim "$(find . -type f | fzf)"
```
> **解析**：列出当前目录下所有文件，选择后立即打开。

---

## 2. alias 命令别名管理

### 别名基础操作

#### 定义别名
持久化别名定义需要写入 Shell 配置文件（如 `~/.bashrc`, `~/.zshrc`）或单独的别名配置文件。
```bash
# 临时定义（当前会话有效）
alias ll='ls -alF'
alias rm='rm -i'
```

#### 查看别名
```bash
alias       # 查看所有已定义的别名
alias ll    # 查看单个别名定义
```

#### 删除别名
```bash
unalias ll      # 删除指定别名
unalias -a      # 删除所有别名
```

#### 绕过别名执行原生命令
```bash
\rm 文件名          # 使用反斜杠
command rm 文件名   # 使用 command 命令
/bin/rm 文件名      # 使用绝对路径
```
## 3. 配置 dotfiles 文件

管理配置文件的最佳实践是建立一个 Git 仓库，并结合符号链接将文件映射到主目录。

### 3.1 建立管理目录与链接
适用于配置文件数量较少的情况。

#### 创建管理目录并移动文件
创建一个统一的目录（如 `~/.dotfiles`）来存放配置文件：

```bash
mkdir -p ~/.dotfiles
# 移动文件，例如 .bashrc
mv ~/.bashrc ~/.dotfiles/bashrc
```

#### 创建符号链接
在原位置创建指向管理目录的链接。建议使用 `-sf` 强制覆盖，或者先备份原文件：

```bash
# 强制创建符号链接
ln -sf ~/.dotfiles/bashrc ~/.bashrc
```

---

### 3.2 远程备份与跨机器同步 (GitHub)

建议将 `~/.dotfiles` 初始化为 Git 仓库并推送到 GitHub 私有仓库，以便于备份和同步。

#### 推送到远程仓库
```bash
cd ~/.dotfiles
git init
git add .
git commit -m "Initial commit of dotfiles"
# 关联你的私有仓库（请替换 "你的用户名"）
git remote add origin git@github.com:你的用户名/dotfiles.git
git branch -M main
git push -u origin main
```

#### 在新机器上恢复
```bash
# 克隆仓库
git clone git@github.com:你的用户名/dotfiles.git ~/.dotfiles

# 应用配置 (创建符号链接)
ln -sf ~/.dotfiles/bashrc ~/.bashrc
```

> [!TIP]
> 也可以编写一个 `setup.sh` 脚本来自动化上述所有步骤。