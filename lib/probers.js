import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * 带有超时保护的命令安全执行器
 * @param {string} file 
 * @param {string[]} args 
 * @param {number} timeoutMs 
 */
async function runCmd(file, args = [], timeoutMs = 2000) {
  try {
    const { stdout, stderr } = await execFileAsync(file, args, {
      timeout: timeoutMs,
      encoding: 'utf8',
      env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' }
    });
    return { ok: true, stdout: (stdout || '').trim(), stderr: (stderr || '').trim() };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      code: err.code,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || '').trim()
    };
  }
}

/**
 * 获取可执行文件的绝对路径
 * @param {string} bin 
 */
async function resolveBinPath(bin) {
  const res = await runCmd('which', [bin], 1000);
  if (res.ok && res.stdout) {
    return res.stdout.split('\n')[0].trim();
  }
  return null;
}

/**
 * 通用版本号清洗解析器
 * @param {string} rawText 
 */
function parseVersion(rawText) {
  if (!rawText) return '';
  const firstLine = rawText.split('\n')[0].trim();
  const match = firstLine.match(/v?(\d+\.\d+(?:\.\d+)?(?:-[a-zA-Z0-9.]+)?)/i);
  if (match) return match[1].startsWith('v') ? match[1] : `v${match[1]}`;
  return firstLine.slice(0, 30);
}

/**
 * 预置 CLI 工具定义与深度探针
 */
export const CLI_CATALOG = [
  // ── 🐙 版本控制与协作 ──────────────────────────────────────────
  {
    id: 'git',
    name: 'Git',
    command: 'git',
    category: 'vcs',
    categoryLabel: '版本管理',
    icon: '📦',
    description: '分布式版本控制系统：代码追踪、分支管理、变基与历史回滚的核心基石。',
    tags: ['版本控制', '代码管理', '标配工具'],
    installCommand: 'sudo apt install git',
    probe: async () => {
      const path = await resolveBinPath('git');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('git', ['--version']);
      const version = parseVersion(verRes.stdout || verRes.stderr);
      
      const userRes = await runCmd('git', ['config', 'user.name']);
      const emailRes = await runCmd('git', ['config', 'user.email']);
      const userName = userRes.ok ? userRes.stdout : '';
      const userEmail = emailRes.ok ? emailRes.stdout : '';
      
      let details = {};
      let statusLabel = '已就绪';
      if (userName || userEmail) {
        statusLabel = `已配置 (${userName || userEmail})`;
        details = { user: userName, email: userEmail };
      }

      return {
        installed: true,
        version,
        path,
        status: 'ready',
        statusLabel,
        details
      };
    }
  },
  {
    id: 'gh',
    name: 'GitHub CLI',
    command: 'gh',
    category: 'vcs',
    categoryLabel: '版本管理',
    icon: '🐙',
    description: 'GitHub 官方命令行工具：免密操作仓库、创建 Issue、审核 PR 与自动化 Release。',
    tags: ['版本控制', 'GitHub', 'CI/CD'],
    installCommand: 'sudo apt install gh # 或参考 https://cli.github.com',
    probe: async () => {
      const path = await resolveBinPath('gh');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('gh', ['--version']);
      const version = parseVersion(verRes.stdout);
      
      // 深度检测鉴权状态
      const authRes = await runCmd('gh', ['auth', 'status'], 2500);
      const output = `${authRes.stdout}\n${authRes.stderr}`;
      const loggedInMatch = output.match(/Logged in to github\.com account ([^\s(]+)/i) || output.match(/account ([a-zA-Z0-9_-]+)/i);
      
      if (loggedInMatch) {
        return {
          installed: true,
          version,
          path,
          status: 'ready',
          statusLabel: `已登录 (${loggedInMatch[1]})`,
          details: { account: loggedInMatch[1], authenticated: true }
        };
      }

      return {
        installed: true,
        version,
        path,
        status: 'warning',
        statusLabel: '未登录 (需 gh auth login)',
        details: { authenticated: false }
      };
    }
  },

  // ── 💻 编程语言与运行时 ────────────────────────────────────────
  {
    id: 'node',
    name: 'Node.js',
    command: 'node',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '🟢',
    description: '基于 Chrome V8 引擎的 JavaScript 运行时，全栈开发与前端工程基座。',
    tags: ['JavaScript', 'TypeScript', '运行时'],
    installCommand: 'sudo apt install nodejs # 或使用 nvm 安装最新 LTS',
    probe: async () => {
      const path = await resolveBinPath('node');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('node', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'npm',
    name: 'npm',
    command: 'npm',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '📦',
    description: 'Node.js 官方默认包管理器，全球最大的 JavaScript 软件注册表客户端。',
    tags: ['包管理', 'Node.js', '官方标配'],
    installCommand: 'sudo apt install npm',
    probe: async () => {
      const path = await resolveBinPath('npm');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('npm', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'bun',
    name: 'Bun',
    command: 'bun',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '🥟',
    description: '采用 Zig 编写的极速全能 JavaScript/TypeScript 运行时、打包器与包管理器。',
    tags: ['极速运行', 'TypeScript', '现代工具'],
    installCommand: 'curl -fsSL https://bun.sh/install | bash',
    probe: async () => {
      const path = await resolveBinPath('bun');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('bun', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'python3',
    name: 'Python 3',
    command: 'python3',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '🐍',
    description: '强大易读的高级编程语言，AI 大模型、数据科学与系统脚本核心环境。',
    tags: ['Python', 'AI/ML', '脚本环境'],
    installCommand: 'sudo apt install python3 python3-pip',
    probe: async () => {
      const path = await resolveBinPath('python3');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('python3', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout || verRes.stderr),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'pip',
    name: 'pip / pip3',
    command: 'pip3',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '📦',
    description: 'Python 官方包管理工具：支持从 PyPI 安装、构建与管理 Python 依赖库。',
    tags: ['Python', '包管理'],
    installCommand: 'sudo apt install python3-pip',
    probe: async () => {
      const path = await resolveBinPath('pip3') || await resolveBinPath('pip');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd(path, ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'rustc',
    name: 'Rust (rustc)',
    command: 'rustc',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '🦀',
    description: '注重安全、并发与极致性能的现代系统级编程语言编译器。',
    tags: ['Rust', '系统编程', '高性能'],
    installCommand: 'curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    probe: async () => {
      const path = await resolveBinPath('rustc');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('rustc', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'go',
    name: 'Go (golang)',
    command: 'go',
    category: 'runtime',
    categoryLabel: '编程运行时',
    icon: '🐹',
    description: 'Google 开发的高并发、微服务与云原生主力开发语言。',
    tags: ['Golang', '云原生', '微服务'],
    installCommand: 'sudo apt install golang-go # 或从 golang.org 下载最新包',
    probe: async () => {
      const path = await resolveBinPath('go');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('go', ['version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },

  // ── 🌐 浏览器与自动化 ──────────────────────────────────────────
  {
    id: 'playwright',
    name: 'Playwright',
    command: 'playwright',
    category: 'browser',
    categoryLabel: '自动化与网络',
    icon: '🎭',
    description: '微软开源的高可靠端到端跨浏览器自动化框架，支持无头网页渲染与截图交互。',
    tags: ['浏览器自动化', '爬虫/渲染', '多模态'],
    installCommand: 'npm install -g playwright && npx playwright install --with-deps',
    probe: async () => {
      const globalPath = await resolveBinPath('playwright');
      if (globalPath) {
        const verRes = await runCmd(globalPath, ['--version'], 1500);
        return {
          installed: true,
          version: parseVersion(verRes.stdout),
          path: globalPath,
          status: 'ready',
          statusLabel: '已就绪'
        };
      }
      return {
        installed: false,
        status: 'missing',
        statusLabel: '未安装'
      };
    }
  },
  {
    id: 'curl',
    name: 'cURL',
    command: 'curl',
    category: 'browser',
    categoryLabel: '自动化与网络',
    icon: '🌐',
    description: '命令行下利用 URL 语法进行数据传输的多协议利器，支持 HTTP/HTTPS/FTP 等。',
    tags: ['网络请求', 'API 调试', '数据抓取'],
    installCommand: 'sudo apt install curl',
    probe: async () => {
      const path = await resolveBinPath('curl');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('curl', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'wget',
    name: 'Wget',
    command: 'wget',
    category: 'browser',
    categoryLabel: '自动化与网络',
    icon: '📥',
    description: '非交互式命令行文件下载利器，支持断点续传、递归下载与代理模式。',
    tags: ['文件下载', '网络工具', '自动化'],
    installCommand: 'sudo apt install wget',
    probe: async () => {
      const path = await resolveBinPath('wget');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('wget', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'sqlite3',
    name: 'SQLite 3',
    command: 'sqlite3',
    category: 'database',
    categoryLabel: '数据库与存储',
    icon: '🗄️',
    description: '无服务器、零配置的轻量级嵌入式 SQL 数据库引擎，本地持久化与数据分析神器。',
    tags: ['数据库', 'SQL', '嵌入式'],
    installCommand: 'sudo apt install sqlite3',
    probe: async () => {
      const path = await resolveBinPath('sqlite3');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('sqlite3', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'jq',
    name: 'jq',
    command: 'jq',
    category: 'browser',
    categoryLabel: '自动化与网络',
    icon: '🔧',
    description: '轻量级且极度灵活的命令行 JSON 结构化数据提取、转换与清洗处理器。',
    tags: ['JSON 解析', '数据管道', '命令行神兵'],
    installCommand: 'sudo apt install jq',
    probe: async () => {
      const path = await resolveBinPath('jq');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('jq', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout || verRes.stderr),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },

  // ── 🐳 容器与虚拟化 ────────────────────────────────────────────
  {
    id: 'docker',
    name: 'Docker',
    command: 'docker',
    category: 'container',
    categoryLabel: '容器与虚拟化',
    icon: '🐳',
    description: '业界标准的容器化平台：轻量级秒级拉起隔离应用、数据库与沙盒环境。',
    tags: ['容器化', '隔离沙箱', '服务编排'],
    installCommand: 'sudo apt install docker.io && sudo systemctl start docker',
    probe: async () => {
      const path = await resolveBinPath('docker');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('docker', ['--version']);
      const version = parseVersion(verRes.stdout);

      // 深度探测守护进程
      const infoRes = await runCmd('docker', ['info'], 2000);
      if (infoRes.ok) {
        return {
          installed: true,
          version,
          path,
          status: 'ready',
          statusLabel: '运行中 (Daemon 活跃)',
          details: { daemon: 'active' }
        };
      }

      return {
        installed: true,
        version,
        path,
        status: 'warning',
        statusLabel: '已安装 (守护进程未启动或权限受限)',
        details: { daemon: 'inactive' }
      };
    }
  },
  {
    id: 'kubectl',
    name: 'Kubernetes (kubectl)',
    command: 'kubectl',
    category: 'container',
    categoryLabel: '容器与虚拟化',
    icon: '☸️',
    description: 'Kubernetes 集群控制与编排客户端，管理容器化 Pod、Service 与集群状态。',
    tags: ['K8s', '集群编排', '云原生'],
    installCommand: 'sudo apt install kubectl # 或通过 snap install kubectl --classic',
    probe: async () => {
      const path = await resolveBinPath('kubectl');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('kubectl', ['version', '--client=true', '-o', 'yaml'], 2000);
      return {
        installed: true,
        version: parseVersion(verRes.stdout || verRes.stderr),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },

  // ── 🎬 运维与媒体 ──────────────────────────────────────────────
  {
    id: 'ffmpeg',
    name: 'FFmpeg',
    command: 'ffmpeg',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '🎬',
    description: '领先的音视频多媒体录制、转换与流式处理框架，支持视频切帧与音频格式互转。',
    tags: ['音视频处理', '媒体转码', '多模态'],
    installCommand: 'sudo apt install ffmpeg',
    probe: async () => {
      const path = await resolveBinPath('ffmpeg');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('ffmpeg', ['-version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'ripgrep',
    name: 'ripgrep (rg)',
    command: 'rg',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '🔍',
    description: '基于 Rust 的极致高速递归正则代码搜索工具，百兆大型项目秒级检索。',
    tags: ['高速搜索', 'Rust 工具', 'Agent 标配'],
    installCommand: 'sudo apt install ripgrep',
    probe: async () => {
      const path = await resolveBinPath('rg');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('rg', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'tmux',
    name: 'tmux',
    command: 'tmux',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '🪟',
    description: '终端多路复用器：后台守护长驻进程、分屏工作台与断线恢复利器。',
    tags: ['终端分屏', '后台守护', '运维利器'],
    installCommand: 'sudo apt install tmux',
    probe: async () => {
      const path = await resolveBinPath('tmux');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('tmux', ['-V']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'zstd',
    name: 'Zstandard (zstd)',
    command: 'zstd',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '🗜️',
    description: 'Facebook 开源的极速无损压缩算法，DSH 官方会话日志数据库存储标准。',
    tags: ['无损压缩', 'DSH 存储', '极致压缩比'],
    installCommand: 'sudo apt install zstd',
    probe: async () => {
      const path = await resolveBinPath('zstd');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('zstd', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'tree',
    name: 'Tree',
    command: 'tree',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '🌳',
    description: '以树状图格式递归显示目录深度结构的经典可视化工具。',
    tags: ['文件目录', '可视化', '终端工具'],
    installCommand: 'sudo apt install tree',
    probe: async () => {
      const path = await resolveBinPath('tree');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('tree', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  },
  {
    id: 'htop',
    name: 'htop',
    command: 'htop',
    category: 'system',
    categoryLabel: '运维与媒体',
    icon: '📊',
    description: '交互式实时系统进程与资源监控器，直观查看 CPU/内存占用与进程树。',
    tags: ['系统监控', '性能分析', '进程管理'],
    installCommand: 'sudo apt install htop',
    probe: async () => {
      const path = await resolveBinPath('htop');
      if (!path) return { installed: false, status: 'missing', statusLabel: '未安装' };
      const verRes = await runCmd('htop', ['--version']);
      return {
        installed: true,
        version: parseVersion(verRes.stdout),
        path,
        status: 'ready',
        statusLabel: '已就绪'
      };
    }
  }
];

/**
 * 并发探测全量预置 CLI 状态
 */
export async function probeAll() {
  const startTime = Date.now();
  const results = await Promise.allSettled(
    CLI_CATALOG.map(async (def) => {
      try {
        const res = await def.probe();
        return {
          id: def.id,
          name: def.name,
          command: def.command,
          category: def.category,
          categoryLabel: def.categoryLabel,
          icon: def.icon,
          description: def.description,
          tags: def.tags,
          installCommand: def.installCommand,
          ...res
        };
      } catch (err) {
        return {
          id: def.id,
          name: def.name,
          command: def.command,
          category: def.category,
          categoryLabel: def.categoryLabel,
          icon: def.icon,
          description: def.description,
          tags: def.tags,
          installCommand: def.installCommand,
          installed: false,
          status: 'error',
          statusLabel: '探测失败: ' + err.message
        };
      }
    })
  );

  const items = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean);
  const durationMs = Date.now() - startTime;

  // 统计概览
  const total = items.length;
  const readyCount = items.filter(i => i.status === 'ready').length;
  const warningCount = items.filter(i => i.status === 'warning').length;
  const missingCount = items.filter(i => i.status === 'missing').length;

  return {
    summary: {
      total,
      readyCount,
      warningCount,
      missingCount,
      durationMs,
      timestamp: Date.now()
    },
    items
  };
}

/**
 * 探测自定义 CLI 工具
 * @param {string} command 
 */
export async function probeCustomCommand(command) {
  const cleanCmd = (command || '').trim().split(/\s+/)[0];
  if (!cleanCmd || !/^[a-zA-Z0-9._-]+$/.test(cleanCmd)) {
    return { ok: false, error: '非法的命令名称，仅支持字母、数字及 . _ -' };
  }

  const path = await resolveBinPath(cleanCmd);
  if (!path) {
    return {
      ok: true,
      data: {
        id: `custom-${cleanCmd}`,
        name: cleanCmd,
        command: cleanCmd,
        category: 'custom',
        categoryLabel: '自定义命令',
        icon: '⚙️',
        description: '用户自定义添加检测的系统命令。',
        tags: ['自定义'],
        installed: false,
        status: 'missing',
        statusLabel: '未安装',
        installCommand: `sudo apt install ${cleanCmd} # (视具体软件源而定)`
      }
    };
  }

  const verRes = await runCmd(cleanCmd, ['--version']);
  const version = parseVersion(verRes.stdout || verRes.stderr) || '已安装';

  return {
    ok: true,
    data: {
      id: `custom-${cleanCmd}`,
      name: cleanCmd,
      command: cleanCmd,
      category: 'custom',
      categoryLabel: '自定义命令',
      icon: '⚙️',
      description: '用户自定义添加检测的系统命令。',
      tags: ['自定义'],
      installed: true,
      version,
      path,
      status: 'ready',
      statusLabel: '已就绪',
      installCommand: `which ${cleanCmd}`
    }
  };
}

/**
 * 生成 Markdown 格式的系统能力体检报告
 * @param {object} inventoryData 
 */
export function generateMarkdownReport(inventoryData) {
  const { summary, items } = inventoryData;
  const dateStr = new Date(summary.timestamp).toLocaleString();

  let md = `# 📋 系统 CLI 资产清册报告 (CLI Inventory Report)\n\n`;
  md += `> **生成时间**：${dateStr} | **扫描耗时**：${summary.durationMs}ms | **总计工具**：${summary.total} 项\n`;
  md += `> **健康状态**：🟢 已就绪 ${summary.readyCount} | 🟡 需关注 ${summary.warningCount} | ⚪ 未安装 ${summary.missingCount}\n\n`;
  
  md += `| 状态 | 工具名称 | 命令 | 版本 | 路径 | 核心作用 |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const item of items) {
    const statusIcon = item.status === 'ready' ? '🟢' : (item.status === 'warning' ? '🟡' : '⚪');
    const ver = item.version || '--';
    const p = item.path || '--';
    md += `| ${statusIcon} ${item.statusLabel} | **${item.name}** | \`${item.command}\` | ${ver} | \`${p}\` | ${item.description} |\n`;
  }

  md += `\n---\n*由 DeepSeek Harness [dsh-cli-inventory] 插件自动生成*\n`;
  return md;
}
