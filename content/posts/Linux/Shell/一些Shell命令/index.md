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
