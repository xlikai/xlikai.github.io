---
title: "Shell练习2-2"
date: 2026-01-19T10:48:00+08:00
tags: ["Shell", "Linux", ]
categories: ["Linux"]
---

在日常的 Shell 操作中，我们经常需要在深层级的目录之间来回切换。The Missing Semester of Your CS Education 2-2 作业要求编写一个脚本，实现 `marco` 保存当前目录和 `polo` 跳转回保存的目录。


## 脚本源码

可以直接下载或复制以下代码到 `/home/vsat/marco.sh`：

```bash
#!/bin/bash

declare -A MARCO_DIRS
MARCO_DEFAULT="default"
MARCO_HISTORY_FILE="$HOME/.marco_history"

# 1. 持久化加载：启动时读取历史记录
if [[ -f "$MARCO_HISTORY_FILE" ]]; then
    while IFS=: read -r tag path; do
        # 简单校验目录是否存在
        if [[ -d "$path" ]]; then
            MARCO_DIRS["$tag"]="$path"
        fi
    done < "$MARCO_HISTORY_FILE"
fi

# 内部辅助函数：保存历史记录到文件（重写模式，实现清理）
_marco_save_history() {
    # 确保文件存在（如果是空的）
    : > "$MARCO_HISTORY_FILE"
    for tag in "${!MARCO_DIRS[@]}"; do
        echo "$tag:${MARCO_DIRS[$tag]}" >> "$MARCO_HISTORY_FILE"
    done
}

marco(){
	local tag="${1:-$MARCO_DEFAULT}"
	local current_dir="$(pwd)"

	MARCO_DIRS["$tag"]="$current_dir"

    # 调用优化后的保存函数（去重、清理）
	_marco_save_history
	
	echo "✓ Marco[$tag]: 已保存 → $current_dir"
	echo "  可用标签: ${!MARCO_DIRS[@]}"
}

polo() {
    local tag="${1:-$MARCO_DEFAULT}"  # 如果没有指定标签，使用默认

    if [[ -z "${MARCO_DIRS[$tag]}" ]]; then
        echo "✗ Polo[$tag]: 错误！该标签未保存任何目录"
        echo "   可用的标签: ${!MARCO_DIRS[@]}"
        return 1
    fi

    local target_dir="${MARCO_DIRS[$tag]}"

    if [[ ! -d "$target_dir" ]]; then
        echo "✗ Polo[$tag]: 错误！目录不存在: $target_dir"
        # 从数组中移除无效条目并同步到文件
        unset MARCO_DIRS["$tag"]
        _marco_save_history
        return 1
    fi

    if cd "$target_dir"; then
        echo "✓ Polo[$tag]: 已跳转到 → $(pwd)"
    else
        echo "✗ Polo[$tag]: 跳转失败！无权限访问"
        return 1
    fi
}

# 查看所有保存的目录
marco_list() {
    if [[ ${#MARCO_DIRS[@]} -eq 0 ]]; then
        echo "📌 还没有保存任何目录"
        return
    fi

    echo "📌 已保存的目录标签:"
    for tag in "${!MARCO_DIRS[@]}"; do
        if [[ "$tag" == "$MARCO_DEFAULT" ]]; then
            echo "  ★ $tag → ${MARCO_DIRS[$tag]}"
        else
            echo "    $tag → ${MARCO_DIRS[$tag]}"
        fi
    done
}

# 清除指定标签或所有标签
marco_clear() {
    local tag="${1}"

    if [[ -z "$tag" ]]; then
        echo "⚠️  用法错误：请指定要清除的标签，或使用 'all' 清除所有"
        echo "   示例："
        echo "     marco_clear work    # 清除work标签"
        echo "     marco_clear all     # 清除所有标签"
        echo "   当前可用标签：${!MARCO_DIRS[@]}"
    	return 1
    fi

    if [[ "$tag" == "all" ]]; then
        # 增加二次确认，进一步防止误操作
        read -p "⚠️  确认要清除所有保存的目录吗？(y/N) " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            MARCO_DIRS=()
            _marco_save_history
            echo "✓ 已清除所有保存的目录"
        else
            echo "✗ 操作已取消"
        fi
    
    elif [[ -n "${MARCO_DIRS[$tag]}" ]]; then
        unset MARCO_DIRS["$tag"]
        _marco_save_history
        echo "✓ 已清除标签: $tag"
    else
        echo "✗ 标签不存在: $tag"
	echo " 当前可用标签：${!MARCO_DIRS[@]}"
    fi
}

# 2. Tab 自动补全
_polo_completion() {
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"
    # 获取所有的 key
    local tags="${!MARCO_DIRS[@]}"
    # 生成补全列表
    COMPREPLY=( $(compgen -W "${tags}" -- ${cur}) )
}

# 绑定补全函数
complete -F _polo_completion polo
complete -F _polo_completion marco_clear
```

## 编写思路与解析

### 1. 核心数据结构：关联数组
脚本核心依赖于 `declare -A MARCO_DIRS`，这是一个关联数组（Associative Array），键是标签（tag），值是绝对路径。这比简单的两个变量提供了极大的灵活性，允许我们保存多个位置。

### 2. 持久化存储
**问题**：普通的变量在 Shell 关闭后就会消失。
**解决**：
-   **保存**：定义了一个辅助函数 `_marco_save_history`。每当 `marco` 或 `marco_clear` 改变了内存中的数组时，这个函数会将整个数组**重写**到 `~/.marco_history` 文件中。重写（`>`）比追加（`>>`）更干净，能自动清理掉被删除的标签，防止无限增长。
-   **加载**：脚本开头有一段代码检查历史文件是否存在，如果存在，使用 `while read` 循环解析每一行 `tag:path`，并恢复到 `MARCO_DIRS` 数组中。

### 3. 补全
为了提高效率，脚本使用了 Bash 的 `complete` 内置命令。
-   `_polo_completion` 函数利用 `compgen -W` 根据当前的 `MARCO_DIRS` 键生成候选词列表。
-   `complete -F _polo_completion polo` 将这个补全逻辑绑定到了 `polo` 命令。
-   **效果**：输入 `polo w` 然后按下 Tab 键，Shell 会自动补全为 `polo work`。

### 4. 健壮性与安全
-   **目录检查**：在跳转前检查 `-d "$target_dir"`。如果目录被删除了，脚本不仅报错，还会自动清理掉无效的记录。
-   **危险操作确认**：`marco_clear all` 会清空所有记录，因此增加了一个 `read -p`进行二次确认，防止手误。

## 如何使用

**重要：** 因为脚本需要修改当前 Shell 的环境变量（切换目录 `cd`），所以**必须**使用 `source` 或 `.` 来加载它，而不能直接运行。

### 1. 加载脚本
可以在 `.bashrc` 或 `.zshrc` 中添加：
```bash
source /home/vsat/marco.sh
```
或者临时加载：
```bash
source ./marco.sh
```

### 2. 基本用法
```bash
# 保存目录
cd /var/log/nginx
marco log      # 保存当前目录为 log 标签

cd ~/projects/backend
marco proj     # 保存当前目录为 proj 标签

# 跳转
cd /tmp
polo log       # 自动跳转回 /var/log/nginx
# Tips: 此时输入 polo p<Tab> 会自动补全为 proj
polo proj
```

### 3. 管理记录
```bash
marco_list     # 查看所有已保存的标签
marco_clear log # 删除 log 标签
marco_clear all # 清空所有记录
```
