import { probeAll, probeCustomCommand, generateMarkdownReport } from './probers.js';

export const name = 'dsh-cli-inventory';
export const inject = ['webServer'];

export function apply(ctx) {
  const logger = ctx.logger ? ctx.logger(name) : console;

  // 注册 Web 路由端点
  if (ctx.webServer) {
    ctx.webServer.register({
      kind: 'prefix',
      path: '/dsh-cli-inventory',
      handler: async (req, res) => {
        // 设置 CORS 和 JSON 响应头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          return res.end();
        }

        if (req.method === 'POST' && req.url.startsWith('/dsh-cli-inventory/rpc')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { action, payload } = parsed;

              // 1. 获取全量 CLI 资产盘点数据
              if (action === 'get_inventory') {
                const data = await probeAll();
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ ok: true, data }));
              }

              // 2. 自定义命令探测
              if (action === 'probe_custom') {
                const command = payload?.command;
                const result = await probeCustomCommand(command);
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify(result));
              }

              // 3. 导出 Markdown 系统环境报告
              if (action === 'export_report') {
                const inventoryData = payload?.data || (await probeAll());
                const markdown = generateMarkdownReport(inventoryData);
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ ok: true, markdown }));
              }

              // 4. 基础状态心跳
              if (action === 'ping' || action === 'get_info') {
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                return res.end(JSON.stringify({ ok: true, name: 'dsh-cli-inventory', version: '1.0.0' }));
              }

              res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
              return res.end(JSON.stringify({ ok: false, error: `Unknown action: ${action}` }));
            } catch (err) {
              logger.error('RPC Error:', err);
              res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
              return res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });
    logger.info('[dsh-cli-inventory] Web RPC endpoint registered at /dsh-cli-inventory/rpc');
  }
}
