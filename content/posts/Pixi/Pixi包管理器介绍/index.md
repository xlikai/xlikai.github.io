---
title: "Pixi 包管理器介绍与使用技巧"
date: 2026-03-18T13:30:00+08:00
tags: ["Pixi"]
categories: ["技术分享"]
---

经常使用 Python 和 Conda 安装各种包和环境，包管理和环境隔离一直是一个痛点。Conda 生态虽然强大，但原生的 `conda` 速度和包的依赖性有时实在让人崩溃，而 `mamba` 虽然解决了速度问题，但在项目的依赖管理上仍不好用。Pixi 很好的解决了这些问题。

最近我开始了解并使用 **Pixi**，这是一个建立在 Conda 生态基础之上的新型包管理器。今天总结一下 Pixi 的核心优势以及一些实用的使用技巧。

## 什么是 Pixi？

Pixi 是由 prefix.dev 团队开发的一款跨平台、基于 Rust 编写的包管理器。它完全兼容 Conda 体系（支持 Conda-forge 等 conda channel，也可以配合 PyPI 使用），它的设计理念更接近于现代程序的包管理工具，比如 Rust 的 `cargo` 或 Node.js 的 `npm` / `yarn`。

它的核心文件是 `pixi.toml`，通过这个配置文件，你可以将依赖项、虚拟环境配置以及运行任务集成在同一个项目中。

## 为什么选择 Pixi？
prefix.dev 团队在官网上[https://pixi.prefix.dev/latest/]提及的以下优点，目前我还在探索阶段，没有验证。

1. **极其快速**：得益于底层的 Rust 实现，Pixi 在解析依赖树和安装包时的速度非常快。
2. **真正的可重复性（Reproducibility）**：Pixi 会生成 `pixi.lock` 文件。无论是在自己的电脑、同事的电脑，还是 CI/CD 机器上，只要 lock 文件一致，构建出来的环境都是一样的。
3. **无需全局安装环境**：Pixi 的环境是基于每个项目的（存放在项目目录的 `.pixi` 文件夹内），不用担心全局 Conda 环境互相冲突污染的问题了。
4. **内置任务运行器（Task Runner）**：可以直接在 `pixi.toml` 中定义启动脚本或构建过程。
5. **多平台支持**：非常容易在一套配置里为 Windows、macOS (Apple Silicon/Intel) 或 Linux 分配不同的依赖。
## Pixi的安装和补全
### Pixi安装
前往 pixi 工具的官方网站，在 Installation 页面能看到安装的说明，建议直接在命令行里进行安装。 对于 Linux 和 macOS，使用命令

```bash
curl -fsSL https://pixi.sh/install.sh | bash
```

对于 Windows，使用命令

```bash
powershell -ExecutionPolicy Bypass -c "irm -useb https://pixi.sh/install.ps1 | iex"
```
安装完成后，可以在命令行使用 `pixi --version` 来验证安装的版本，之后可以使用 `pixi self-update` 命令来更新 pixi 工具。

### 自动补全
要启用自动补全功能，请按照 shell 的下面说明进行操作。之后，重启 shell 或执行 shell 配置文件。

Bash(大多数 Linux 系统的默认脚本)

在 ~/.bashrc 文件末尾添加以下内容
``` ~/.bashrc
eval "$(pixi completion --shell bash)"
```
Zsh(macOS 默认)

在 ~/.zshrc 文件末尾添加以下内容
``` ~/.zshrc
eval "$(pixi completion --shell zsh)"
```
PowerShell(Windows)

在 Microsoft.PowerShell_profile.ps1 的末尾添加以下内容。您可以通过在 PowerShell 中查询 $PROFILE 变量来检查此文件的位置。通过notepad $PROFILE可以用记事本打开，然后把下面内容另起一行加入即可。
``` powershell
(& pixi completion --shell powershell) | Out-String | Invoke-Expression
```

## 使用技巧

### 1. 初始化项目

如果要在一个新目录启动项目，只需要运行：

```bash
pixi init my_project
cd my_project
```
它会自动生成 `pixi.toml` 和相关忽略设定。如果是在已有项目中，直接在项目根目录运行 `pixi init` 即可。

### 2. 添加与管理依赖

Pixi 可以同时管理 Conda 依赖和 PyPI 依赖：

```bash
# 添加 Conda 包（默认从 conda-forge 寻找）
pixi add python jupyter pandas

# 添加 PyPI 包
pixi add --pypi numpy requests
```

Pixi 会在执行 `pixi add` 的时候，自动更新 `pixi.toml` 并在后台创建和同步隔离环境。请注意，pixi优先向在当前目录寻找 `pixi.toml`,没有则找`pyproject.toml`,都没有则向当前目录的父目录寻找，以此类推，直到找到为止。

### 3. 定义与运行任务（Tasks）

Pixi 内置了任务运行器，这对于团队协作非常方便。你可以直接修改 `pixi.toml` 添加任务：

在Windows Powershell/cmd使用 `type pixi.toml` 可以查看`pixi.toml`文件的内容。在Git Bash 或 WSL则使用`cat pixi.toml`来查看。当然，也可以使用`notepad pixi.toml`或`vim pixi.toml`来用记事本或vim打开它。

```toml
[project]
authors = ["你的名字 <你的邮箱>"]
channels = ["conda-forge"]
name = "hello-world"
platforms = ["windows-64"]
version = "0.1.0"
[tasks]

[dependencies]
```

### 4. 进入交互式 Shell

有时候我们想进入环境手动调试代码，类似于conda activate，可以使用 `shell` 命令：

```bash
pixi shell
```
进入后你就可以自由使用环境里安装好的 `python`，并拥有所需的所有环境变量。

### 5. 全局安装工具 (Global Install)

除了项目级别的环境，我们有时需要可以在全局运行的 CLI 工具（比如 `black`、`httpie` 或 `ripgrep`）。Pixi 也支持全局安装，类似于 `pipx`：

```bash
pixi global install black
```
Pixi 会将其放置在独立的隔离环境中，并将可执行文件链接到全局的 PATH 里，不污染系统环境，且运行飞快。

### 6.conda迁移与他人完美复现
当你想用pixi的时候，就说明你常用的conda让你头疼，这个时候就要考虑环境的迁移和复现他人的代码了请参考[conda与pixi环境迁移与复现](https://emeric53.github.io/technology/conda&pixi/#conda_1)




## 总结

如果你受够了包依赖的冲突，或者想要在你的 Python / C++ 项目中实现类似 Cargo 体验的项目管理系统，强烈推荐尝试一下 [Pixi](https://pixi.sh/)。
