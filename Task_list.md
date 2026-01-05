### 🛠️ 当前环境状态存档
1.  **系统环境**：Windows 11 + WSL2 (Ubuntu 22.04)。
2.  **核心引擎**：Hugo Extended **v0.154.2**（已手动升级）。
3.  **博客主题**：PaperMod。
4.  **核心自定义逻辑**：
    *   **图片控制**：通过 `assets/css/extended/custom.css` 强行锁定了封面图高度（250px）和正文图高度。
    *   **首页搜索**：在 `layouts/partials/home_info.html` 植入了带自动延长动画的搜索框。
    *   **无缝搜索**：在 `layouts/_default/search.html` 植入了 JS 脚本，实现了首页输入后跳转自动显示结果。
    *   **视觉统一**：搜索框颜色已适配 PaperMod 的原生主题变量（`--primary`）。