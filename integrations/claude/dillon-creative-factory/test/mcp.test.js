import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('stdio MCP handshake exposes the complete v1 tool contract', async () => {
  const client = new Client({ name: 'creative-factory-test', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'src', 'index.js')], cwd: root });
  await client.connect(transport);
  try {
    const result = await client.listTools();
    const names = result.tools.map((tool) => tool.name).sort();
    assert.deepEqual(names, [
      'build_campaign_brief', 'build_website_preview', 'create_content_pack', 'create_design_draft',
      'find_free_ai_tool', 'get_approval_board', 'get_client_brand_kit', 'inspect_media',
      'package_client_delivery', 'research_prospect', 'run_visual_qa', 'search_agent_vault'
    ].sort());
    const call = await client.callTool({ name: 'get_client_brand_kit', arguments: { clientId: 'align-hcm' } });
    assert.equal(call.isError, undefined);
    assert.equal(call.structuredContent.client.id, 'align-hcm');
  } finally {
    await transport.close();
  }
});
