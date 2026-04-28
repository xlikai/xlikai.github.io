---
title: "日常实用 Shell 技巧与命令收集"
date: 2026-04-22T16:15:00+08:00
tags: ["Shell", "Linux"]
categories: ["Linux"]
toc: true
---

在日常的 Shell 操作中，经常会碰到或写出一些有趣且实用的命令。这篇博客用于持续记录学习过程中这些零碎的技巧，以便后续查询和使用。

## 1. 从 Shell 历史文件中找出最常用的命令

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

## 2. fzf 模糊查找工具

`fzf` 是一款极速的命令行模糊搜索工具，能够极大提升终端操作效率。

### 2.1 增强快捷键（需配置 Shell 集成）

在 `~/.bashrc` 或 `~/.zshrc` 中添加 `eval "$(fzf --bash)"` 后，可激活以下快捷键：

| 快捷键 | 功能 | 使用示例 |
| :--- | :--- | :--- |
| `Ctrl-R` | 模糊搜索命令历史并执行 | `Ctrl-R` → 输入关键词 → `Enter` |
| `Ctrl-T` | 搜索当前目录下文件并将路径插入命令行 | `vim ` → `Ctrl-T` → 选择文件 |
| `Alt-C` | 搜索子目录并自动 `cd` 进入 | `Alt-C` → 输入目录名 → `Enter` |

### 2.2 实用单行命令示例

#### 1. 交互式切换目录
```bash
cd "$(find . -type d | fzf)"
```
> **解析**：通过 `find` 递归列出所有子目录，交由 `fzf` 交互选择，最后 `cd` 进入。

#### 2. 交互式选择文件并用 Vim 打开
```bash
# 可将 vim 替换为 nano, code 等
vim "$(find . -type f | fzf)"
```
> **解析**：列出当前目录下所有文件，选择后立即打开。

#### 3. 杀死指定进程（进程名模糊搜索）
```bash
kill -9 "$(ps aux | fzf | awk '{print $2}')"
```
> **解析**：`ps aux` 列出进程 → `fzf` 选中行 → `awk` 提取 PID → `kill` 终止进程。

#### 4. 交互式切换 Git 分支
```bash
git checkout "$(git branch | fzf | sed 's/^[* ]*//')"
```
> **解析**：列出分支并去除当前分支的 `*` 标记，选中后切换。

#### 5. 快速 SSH 登录远程主机
```bash
# 从 ~/.ssh/config 中读取 Host 别名
ssh "$(grep '^Host ' ~/.ssh/config | awk '{print $2}' | fzf)"
```

#### 6. 递归查找文本并交互式查看
```bash
grep -rl "TODO" . | fzf | xargs less
```

#### 7. 多选文件并确认删除
```bash
# 使用 Tab 键进行多选
find . -type f | fzf --multi | xargs rm -i
```

---

## 3. alias 命令别名管理

### 3.1 别名基础操作

#### 1. 定义别名
```bash
# 临时定义（当前会话有效）
alias ll='ls -alF'
alias rm='rm -i'
```

#### 2. 查看别名
```bash
alias       # 查看所有已定义的别名
alias ll    # 查看单个别名定义
```

#### 3. 删除别名
```bash
unalias ll      # 删除指定别名
unalias -a      # 删除所有别名
```

#### 4. 绕过别名执行原生命令
有时需要跳过 `alias`（例如跳过 `rm -i` 的确认提示）：
```bash
\rm 文件名          # 使用反斜杠
command rm 文件名   # 使用 command 命令
/bin/rm 文件名      # 使用绝对路径
```
