window.__ModuleLoader__.load({
  id: "dsh-cli-inventory",
  factory: (require) => {
    const React = require("react");
    const ReactDOM = require("react-dom");
    const { useState, useEffect, useMemo, createElement: h } = React;

    const name = "dsh-cli-inventory";
    const inject = ["slots", "locale", "connection"];

    let globalSetModalOpen = null;

    function injectStyles() {
      if (document.getElementById("dsh-cli-inventory-styles")) return;
      const style = document.createElement("style");
      style.id = "dsh-cli-inventory-styles";
      style.innerHTML = `
        /* 浮动入口按钮（位于右侧悬浮或固定在左下角工具栏旁） */
        .dsh-cli-fab-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.1));
          background: var(--dsw-alias-bg-elevated, #242426);
          color: var(--dsw-alias-label-secondary, #e0e0e0);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          user-select: none;
        }
        .dsh-cli-fab-btn:hover {
          background: var(--dsw-alias-bg-hover, #2f2f32);
          border-color: var(--dsw-alias-border-strong, rgba(255, 255, 255, 0.2));
          color: #ffffff;
          transform: translateY(-1px);
        }
        .dsh-cli-fab-btn svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
        }

        /* 模态框全屏遮罩与容器 */
        .dsh-cli-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999998;
          animation: dsh-cli-fade-in 0.2s ease-out;
        }
        @keyframes dsh-cli-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dsh-cli-modal-container {
          width: 90vw;
          max-width: 960px;
          height: 82vh;
          max-height: 820px;
          background: var(--dsw-alias-bg-surface, #1e1e20);
          border: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.12));
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
          overflow: hidden;
          animation: dsh-cli-scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--dsw-alias-label-primary, #f0f0f0);
          font-family: inherit;
        }
        @keyframes dsh-cli-scale-up {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* 模态框头部 */
        .dsh-cli-modal-header {
          padding: 20px 24px 16px 24px;
          border-bottom: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
        }
        .dsh-cli-header-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dsh-cli-header-icon {
          font-size: 24px;
          line-height: 1;
        }
        .dsh-cli-header-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dsh-cli-version-tag {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--dsw-alias-label-tertiary, #999);
          font-family: monospace;
        }
        .dsh-cli-header-desc {
          margin-top: 4px;
          font-size: 13px;
          color: var(--dsw-alias-label-secondary, #a0a0a0);
        }
        .dsh-cli-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dsh-cli-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.12));
          background: var(--dsw-alias-bg-elevated, #2a2a2d);
          color: var(--dsw-alias-label-primary, #ffffff);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dsh-cli-btn:hover {
          background: var(--dsw-alias-bg-hover, #36363a);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .dsh-cli-close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--dsw-alias-label-tertiary, #888);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .dsh-cli-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        /* 搜索与过滤工具栏 */
        .dsh-cli-toolbar {
          padding: 14px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.06));
        }
        .dsh-cli-search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .dsh-cli-search-icon {
          position: absolute;
          left: 14px;
          color: #777;
          pointer-events: none;
          font-size: 14px;
        }
        .dsh-cli-search-input {
          width: 100%;
          height: 38px;
          padding: 0 14px 0 38px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          transition: all 0.15s ease;
        }
        .dsh-cli-search-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.35);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
        }
        .dsh-cli-search-input::placeholder {
          color: #666;
        }

        /* 分类与状态胶囊标签 */
        .dsh-cli-tabs-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .dsh-cli-tabs-row::-webkit-scrollbar { display: none; }
        .dsh-cli-tab-pill {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          color: var(--dsw-alias-label-secondary, #aaa);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .dsh-cli-tab-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .dsh-cli-tab-pill.active {
          background: #ffffff;
          color: #121212;
          font-weight: 600;
        }

        /* 模态框主体滚动区与双列网格 */
        .dsh-cli-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .dsh-cli-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .dsh-cli-grid {
            grid-template-columns: 1fr;
          }
        }

        /* 单个 CLI 卡片样式 (复刻插件市场质感) */
        .dsh-cli-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        .dsh-cli-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        .dsh-cli-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .dsh-cli-card-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dsh-cli-card-icon {
          font-size: 22px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .dsh-cli-card-title-wrap {
          display: flex;
          flex-direction: column;
        }
        .dsh-cli-card-name {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dsh-cli-card-cmd-badge {
          font-size: 11px;
          font-family: monospace;
          color: #888;
        }
        .dsh-cli-card-meta {
          font-size: 12px;
          color: #888;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          font-family: monospace;
        }

        /* 状态微光药丸与操作按钮 */
        .dsh-cli-status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          white-space: nowrap;
        }
        .dsh-cli-status-pill.ready {
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }
        .dsh-cli-status-pill.ready:hover {
          background: rgba(46, 204, 113, 0.25);
        }
        .dsh-cli-status-pill.warning {
          background: rgba(241, 196, 15, 0.15);
          color: #f1c40f;
          border: 1px solid rgba(241, 196, 15, 0.3);
        }
        .dsh-cli-status-pill.missing {
          background: rgba(255, 255, 255, 0.08);
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .dsh-cli-status-pill.missing:hover {
          background: #ffffff;
          color: #121212;
          font-weight: 600;
        }

        .dsh-cli-card-desc {
          font-size: 13px;
          line-height: 1.5;
          color: var(--dsw-alias-label-secondary, #b0b0b0);
        }

        .dsh-cli-card-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .dsh-cli-tag-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.04);
          color: #777;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* 复制成功的轻提示 Toast */
        .dsh-cli-toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: #2ecc71;
          color: #000;
          font-weight: 600;
          font-size: 13px;
          padding: 8px 20px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 999999;
          animation: dsh-cli-toast-in 0.2s ease-out;
        }
        @keyframes dsh-cli-toast-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* 空状态与加载中 */
        .dsh-cli-empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }
        .dsh-cli-empty-state button {
          margin-top: 14px;
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * CLI 资产清册核心看板组件
     */
    function CliInventoryModal({ isOpen, onClose }) {
      const [loading, setLoading] = useState(false);
      const [inventory, setInventory] = useState({ summary: {}, items: [] });
      const [search, setSearch] = useState("");
      const [activeTab, setActiveTab] = useState("all");
      const [toastMsg, setToastMsg] = useState("");

      const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 2000);
      };

      const fetchInventory = async () => {
        setLoading(true);
        try {
          const res = await fetch("/dsh-cli-inventory/rpc", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "get_inventory" })
          });
          const json = await res.json();
          if (json.ok) {
            setInventory(json.data);
          }
        } catch (e) {
          console.error("[dsh-cli-inventory] fetch error:", e);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        if (isOpen) {
          fetchInventory();
        }
      }, [isOpen]);

      // 复制 Markdown 报告
      const handleExport = async () => {
        try {
          const res = await fetch("/dsh-cli-inventory/rpc", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "export_report", payload: { data: inventory } })
          });
          const json = await res.json();
          if (json.ok && json.markdown) {
            await navigator.clipboard.writeText(json.markdown);
            showToast("📋 完整系统 CLI 报告已成功复制到剪贴板！");
          }
        } catch (e) {
          showToast("导出失败: " + e.message);
        }
      };

      // 复制安装或运行指令
      const handleCopyCmd = async (cmd, e) => {
        if (e) e.stopPropagation();
        try {
          await navigator.clipboard.writeText(cmd);
          showToast(`已复制: ${cmd}`);
        } catch (err) {
          showToast("复制失败");
        }
      };

      // 探测自定义命令
      const handleProbeCustom = async (cmdToProbe) => {
        setLoading(true);
        try {
          const res = await fetch("/dsh-cli-inventory/rpc", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "probe_custom", payload: { command: cmdToProbe } })
          });
          const json = await res.json();
          if (json.ok && json.data) {
            setInventory(prev => ({
              ...prev,
              items: [json.data, ...prev.items.filter(i => i.command !== json.data.command)]
            }));
            showToast(`已成功检测自定义命令: ${cmdToProbe}`);
          } else {
            showToast(json.error || "探测失败");
          }
        } catch (e) {
          showToast("探测异常: " + e.message);
        } finally {
          setLoading(false);
        }
      };

      // 过滤项目列表
      const filteredItems = useMemo(() => {
        let items = inventory.items || [];
        
        // 标签筛选
        if (activeTab === "ready") items = items.filter(i => i.status === "ready");
        else if (activeTab === "warning") items = items.filter(i => i.status === "warning");
        else if (activeTab === "missing") items = items.filter(i => i.status === "missing");
        else if (activeTab !== "all") items = items.filter(i => i.category === activeTab);

        // 搜索筛选
        if (search.trim()) {
          const q = search.toLowerCase();
          items = items.filter(i => 
            i.name.toLowerCase().includes(q) ||
            i.command.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
          );
        }

        return items;
      }, [inventory.items, activeTab, search]);

      if (!isOpen) return null;

      const summary = inventory.summary || {};

      return h("div", { className: "dsh-cli-modal-overlay", onClick: onClose },
        h("div", { className: "dsh-cli-modal-container", onClick: (e) => e.stopPropagation() },
          // 1. 头部
          h("div", { className: "dsh-cli-modal-header" },
            h("div", { className: "dsh-cli-header-title-row" },
              h("span", { className: "dsh-cli-header-icon" }, "📋"),
              h("div", null,
                h("div", { className: "dsh-cli-header-title" },
                  "命令行清册",
                  h("span", { className: "dsh-cli-version-tag" }, "v1.0.0"),
                  h("span", { style: { fontSize: "12px", color: "#888", fontWeight: "normal" } }, 
                    `(${summary.total ? `${summary.total} 项工具` : "加载中..."})`
                  )
                ),
                h("div", { className: "dsh-cli-header-desc" }, 
                  "盘点与体检当前系统中 AI Agent 与开发者可用的所有命令行工具"
                )
              )
            ),
            h("div", { className: "dsh-cli-header-actions" },
              h("button", { className: "dsh-cli-btn", onClick: handleExport }, "📋 导出报告"),
              h("button", { className: "dsh-cli-btn", onClick: fetchInventory, disabled: loading }, 
                loading ? "🔄 扫描中..." : "🔄 重新检测"
              ),
              h("button", { className: "dsh-cli-close-btn", onClick: onClose }, "✕")
            )
          ),

          // 2. 工具栏与分类过滤胶囊
          h("div", { className: "dsh-cli-toolbar" },
            h("div", { className: "dsh-cli-search-box" },
              h("span", { className: "dsh-cli-search-icon" }, "🔍"),
              h("input", {
                className: "dsh-cli-search-input",
                placeholder: "搜索命令行工具，例如：git, docker, python, playwright, ffmpeg...",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              })
            ),
            h("div", { className: "dsh-cli-tabs-row" },
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'all' ? 'active' : ''}`, 
                onClick: () => setActiveTab('all') 
              }, `全部 (${summary.total || 0})`),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'ready' ? 'active' : ''}`, 
                onClick: () => setActiveTab('ready') 
              }, `🟢 已就绪 (${summary.readyCount || 0})`),
              summary.warningCount > 0 ? h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'warning' ? 'active' : ''}`, 
                onClick: () => setActiveTab('warning') 
              }, `🟡 需关注 (${summary.warningCount})`) : null,
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'missing' ? 'active' : ''}`, 
                onClick: () => setActiveTab('missing') 
              }, `⚪ 未安装 (${summary.missingCount || 0})`),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'vcs' ? 'active' : ''}`, 
                onClick: () => setActiveTab('vcs') 
              }, "版本管理"),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'runtime' ? 'active' : ''}`, 
                onClick: () => setActiveTab('runtime') 
              }, "编程运行时"),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'browser' ? 'active' : ''}`, 
                onClick: () => setActiveTab('browser') 
              }, "自动化与网络"),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'container' ? 'active' : ''}`, 
                onClick: () => setActiveTab('container') 
              }, "容器与虚拟化"),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'database' ? 'active' : ''}`, 
                onClick: () => setActiveTab('database') 
              }, "数据库与存储"),
              h("div", { 
                className: `dsh-cli-tab-pill ${activeTab === 'system' ? 'active' : ''}`, 
                onClick: () => setActiveTab('system') 
              }, "运维与媒体")
            )
          ),

          // 3. 主体双列网格卡片
          h("div", { className: "dsh-cli-modal-body" },
            h("div", { className: "dsh-cli-grid" },
              filteredItems.map(item => {
                const isReady = item.status === 'ready';
                const isWarning = item.status === 'warning';
                const isMissing = item.status === 'missing';

                return h("div", { key: item.id, className: "dsh-cli-card" },
                  h("div", { className: "dsh-cli-card-top" },
                    h("div", { className: "dsh-cli-card-info" },
                      h("span", { className: "dsh-cli-card-icon" }, item.icon || "⚙️"),
                      h("div", { className: "dsh-cli-card-title-wrap" },
                        h("div", { className: "dsh-cli-card-name" },
                          item.name,
                          h("span", { className: "dsh-cli-card-cmd-badge" }, `(${item.command})`)
                        ),
                        h("div", { className: "dsh-cli-card-meta" },
                          item.version ? h("span", { style: { color: "#2ecc71" } }, item.version) : null,
                          item.path ? h("span", null, `· 📍 ${item.path}`) : null
                        )
                      )
                    ),
                    // 右上角状态药丸
                    h("div", {
                      className: `dsh-cli-status-pill ${item.status}`,
                      onClick: (e) => {
                        if (isMissing && item.installCommand) {
                          handleCopyCmd(item.installCommand, e);
                        } else if (item.path) {
                          handleCopyCmd(item.path, e);
                        }
                      },
                      title: isMissing ? `点击复制安装命令: ${item.installCommand}` : `点击复制路径: ${item.path}`
                    }, 
                      isReady ? `🟢 ${item.statusLabel || '已就绪'}` :
                      (isWarning ? `🟡 ${item.statusLabel || '需关注'}` :
                      `⚪ 复制安装命令`)
                    )
                  ),
                  h("div", { className: "dsh-cli-card-desc" }, item.description),
                  h("div", { className: "dsh-cli-card-tags" },
                    (item.tags || []).map(t => h("span", { key: t, className: "dsh-cli-tag-badge" }, t)),
                    isMissing && item.installCommand ? h("span", {
                      className: "dsh-cli-tag-badge",
                      style: { cursor: "pointer", color: "#3498db" },
                      onClick: (e) => handleCopyCmd(item.installCommand, e)
                    }, `📋 ${item.installCommand.slice(0, 32)}...`) : null
                  )
                );
              }),

              // 搜索无结果时
              filteredItems.length === 0 ? h("div", { className: "dsh-cli-empty-state" },
                h("div", { style: { fontSize: "32px", marginBottom: "8px" } }, "🔍"),
                h("div", { style: { fontSize: "14px", color: "#aaa" } }, 
                  search ? `未在预置清单中匹配到 "${search}"` : "当前分类下暂无工具"
                ),
                search ? h("button", {
                  className: "dsh-cli-btn",
                  onClick: () => handleProbeCustom(search)
                }, `+ 立即探测系统命令 "${search}"`) : null
              ) : null
            )
          )
        ),
        // 轻提示 Toast
        toastMsg ? h("div", { className: "dsh-cli-toast" }, toastMsg) : null
      );
    }

    /**
     * 根应用包装器
     */
    function CliInventoryRoot() {
      const [isOpen, setIsOpen] = useState(false);
      globalSetModalOpen = setIsOpen;

      return h(CliInventoryModal, {
        isOpen,
        onClose: () => setIsOpen(false)
      });
    }

    /**
     * 自动在页面左下角/侧边栏挂载一个快捷触发入口
     */
    function mountTriggerButton() {
      if (document.getElementById("dsh-cli-inventory-trigger-root")) return;

      const container = document.createElement("div");
      container.id = "dsh-cli-inventory-trigger-root";
      container.style.position = "fixed";
      container.style.bottom = "18px";
      container.style.right = "24px";
      container.style.zIndex = "9999";

      const btn = document.createElement("button");
      btn.className = "dsh-cli-fab-btn";
      btn.title = "打开系统 CLI 资产清册 (dsh-cli-inventory)";
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <span>CLI 清册</span>
      `;
      btn.onclick = () => {
        if (globalSetModalOpen) {
          globalSetModalOpen(true);
        }
      };

      container.appendChild(btn);
      document.body.appendChild(container);
    }

    /**
     * 插件初始化生命周期
     */
    function apply(ctx) {
      injectStyles();
      
      // 挂载 React 根节点
      let modalHost = document.getElementById("dsh-cli-inventory-root");
      if (!modalHost) {
        modalHost = document.createElement("div");
        modalHost.id = "dsh-cli-inventory-root";
        document.body.appendChild(modalHost);
      }

      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(modalHost);
        root.render(h(CliInventoryRoot));
      } else {
        ReactDOM.render(h(CliInventoryRoot), modalHost);
      }

      // 挂载右下角快捷入口按钮
      mountTriggerButton();

      ctx.on("dispose", () => {
        const trigger = document.getElementById("dsh-cli-inventory-trigger-root");
        if (trigger) trigger.remove();
        if (modalHost) modalHost.remove();
      });
    }

    return { name, inject, apply };
  }
});
