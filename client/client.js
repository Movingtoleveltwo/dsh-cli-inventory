window.__ModuleLoader__.load({
  id: "dsh-cli-inventory",
  factory: (require) => {
    const React = require("react");
    const ReactDOM = require("react-dom");
    const { useState, useEffect, useMemo, createElement: h } = React;

    const name = "dsh-cli-inventory";
    const inject = ["slots", "locale", "connection"];

    function injectStyles() {
      if (document.getElementById("dsh-cli-inventory-styles")) return;
      const style = document.createElement("style");
      style.id = "dsh-cli-inventory-styles";
      style.innerHTML = `
        /* CLI 清单设置分区整体容器 */
        .dsh-cli-section-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          color: var(--dsw-alias-label-primary, #f0f0f0);
          font-family: inherit;
        }

        /* 顶部标题与操作栏 */
        .dsh-cli-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08));
        }
        .dsh-cli-section-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .dsh-cli-section-title {
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
        .dsh-cli-section-desc {
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

        /* 搜索与过滤工具栏 */
        .dsh-cli-toolbar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dsh-cli-search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .dsh-cli-search-icon {
          position: absolute;
          left: 12px;
          color: #777;
          pointer-events: none;
          font-size: 14px;
        }
        .dsh-cli-search-input {
          width: 100%;
          height: 36px;
          padding: 0 14px 0 36px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          transition: all 0.15s ease;
        }
        .dsh-cli-search-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
        }
        .dsh-cli-search-input::placeholder {
          color: #666;
        }

        /* 分类与状态胶囊标签 */
        .dsh-cli-tabs-row {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .dsh-cli-tabs-row::-webkit-scrollbar { display: none; }
        .dsh-cli-tab-pill {
          padding: 4px 10px;
          border-radius: 14px;
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

        /* 主体双列网格卡片容器 (自适应可滚动) */
        .dsh-cli-content-scroll {
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
        }
        .dsh-cli-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          padding-bottom: 20px;
        }
        @media (max-width: 900px) {
          .dsh-cli-grid {
            grid-template-columns: 1fr;
          }
        }

        /* 单个 CLI 卡片样式 (复刻插件市场质感) */
        .dsh-cli-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
          transition: all 0.2s ease;
          position: relative;
        }
        .dsh-cli-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .dsh-cli-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .dsh-cli-card-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dsh-cli-card-icon {
          font-size: 20px;
          width: 34px;
          height: 34px;
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
          font-size: 14px;
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
          padding: 3px 8px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
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
          font-size: 12.5px;
          line-height: 1.45;
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
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.04);
          color: #777;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* 复制成功的轻提示 Toast */
        .dsh-cli-toast {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: #2ecc71;
          color: #000;
          font-weight: 600;
          font-size: 13px;
          padding: 8px 18px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 9999999;
          animation: dsh-cli-toast-in 0.2s ease-out;
        }
        @keyframes dsh-cli-toast-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* 空状态 */
        .dsh-cli-empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px 20px;
          color: #888;
        }
        .dsh-cli-empty-state button {
          margin-top: 12px;
        }
      `;
      document.head.appendChild(style);
    }

    /**
     * 设置面板专用的 CLI 清单主组件
     */
    function CliInventorySection() {
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
        fetchInventory();
      }, []);

      // 导出 Markdown 系统报告
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

      // 复制命令或路径
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

      const summary = inventory.summary || {};

      return h("div", { className: "dsh-cli-section-container" },
        // 1. 顶部标题栏
        h("div", { className: "dsh-cli-section-header" },
          h("div", { className: "dsh-cli-section-title-wrap" },
            h("div", { className: "dsh-cli-section-title" },
              "📋 命令行清册 (CLI Inventory)",
              h("span", { className: "dsh-cli-version-tag" }, "v1.0.0"),
              h("span", { style: { fontSize: "12px", color: "#888", fontWeight: "normal" } }, 
                `(${summary.total ? `${summary.total} 项工具` : "加载中..."})`
              )
            ),
            h("div", { className: "dsh-cli-section-desc" }, 
              "盘点与体检当前系统中 AI Agent 与开发者可用的所有命令行工具"
            )
          ),
          h("div", { className: "dsh-cli-header-actions" },
            h("button", { className: "dsh-cli-btn", onClick: handleExport }, "📋 导出报告"),
            h("button", { className: "dsh-cli-btn", onClick: fetchInventory, disabled: loading }, 
              loading ? "🔄 扫描中..." : "🔄 重新检测"
            )
          )
        ),

        // 2. 搜索与过滤工具栏
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
        h("div", { className: "dsh-cli-content-scroll" },
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

            // 搜索无结果
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
        ),
        // 轻提示 Toast
        toastMsg ? h("div", { className: "dsh-cli-toast" }, toastMsg) : null
      );
    }

    /**
     * 插件生命周期：向 DSH 的 settings.section 插槽注入菜单项
     */
    function apply(ctx) {
      injectStyles();

      // 注入到 设置 ➔ 左侧导航栏中
      ctx.slots.inject("settings.section", () => {
        return ctx.slots.register({
          name: "settings.section",
          id: "cli-inventory",
          order: 35, // 排在 插件/Agent预设 与 插件市场 之间
          label: () => "CLI 清单",
          locale: "zh",
          inject: () => ({})
        }, () => h(CliInventorySection));
      });
    }

    return { name, inject, apply };
  }
});
