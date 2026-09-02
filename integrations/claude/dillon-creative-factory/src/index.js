#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { z } from 'zod';
import {
  buildCampaignBrief,
  buildWebsitePreview,
  createContentPack,
  createDesignDraft,
  errorResult,
  findFreeAiTool,
  getApprovalBoard,
  getClientBrandKit,
  inspectMedia,
  jsonResult,
  packageClientDelivery,
  researchProspect,
  runVisualQa,
  searchAgentVault
} from './core.js';

const clientId = z.string().min(1).describe('Exact canonical client ID or an exact unique registry alias.');
const artifactAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const readAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const researchAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };

function guarded(handler) {
  return async (args) => {
    try { return jsonResult(await handler(args)); }
    catch (error) { return errorResult(error instanceof Error ? error.message : String(error)); }
  };
}

export function createServer() {
  const server = new McpServer({ name: 'dillon-creative-factory', version: '0.1.0' }, { capabilities: { tools: {} } });

  server.registerTool('get_client_brand_kit', {
    title: 'Get Client Brand Kit',
    description: 'Resolve exactly one active client and return only that client folder’s brand authority, logo/asset candidates, colors, fonts, and voice sources. Stops on ambiguity.',
    inputSchema: z.object({ clientId }), annotations: readAnnotations
  }, guarded(getClientBrandKit));

  server.registerTool('build_campaign_brief', {
    title: 'Build Campaign Brief',
    description: 'Create a private draft campaign brief from one resolved client, supplied first-party/public HTTPS sources, client brand context, and operator notes. Never sends or publishes.',
    inputSchema: z.object({ clientId, campaignName: z.string().min(1), objective: z.string().min(1), audience: z.string().min(1), sourceUrls: z.array(z.string().url()).max(6).default([]), notes: z.string().default('') }), annotations: artifactAnnotations
  }, guarded(buildCampaignBrief));

  server.registerTool('create_content_pack', {
    title: 'Create Content Pack',
    description: 'Create draft blog, email, social carousel, video script, and landing-page artifacts from one supplied source of truth inside the resolved client folder.',
    inputSchema: z.object({ clientId, campaignName: z.string().min(1), sourceText: z.string().min(1).max(60_000), primaryCta: z.string().min(1), channels: z.array(z.enum(['blog', 'email', 'social-carousel', 'video-script', 'landing-page'])).default(['blog', 'email', 'social-carousel', 'video-script', 'landing-page']) }), annotations: artifactAnnotations
  }, guarded(createContentPack));

  server.registerTool('create_design_draft', {
    title: 'Create Design Draft',
    description: 'Create a client-separated Canva or Figma adapter manifest using the resolved brand kit. Returns adapter-not-connected honestly when OAuth is absent.',
    inputSchema: z.object({ clientId, campaignName: z.string().min(1), platform: z.enum(['canva', 'figma']), briefPath: z.string().min(1), format: z.string().default('presentation') }), annotations: artifactAnnotations
  }, guarded(createDesignDraft));

  server.registerTool('find_free_ai_tool', {
    title: 'Find Free AI Tool',
    description: 'Search current Hugging Face Spaces for image, audio, video, 3D, or editing tools. Higgsfield is explicitly excluded from free-tool results.',
    inputSchema: z.object({ query: z.string().min(1), modality: z.enum(['image', 'audio', 'video', '3d', 'editing', 'multimodal']), limit: z.number().int().min(1).max(15).default(8) }), annotations: researchAnnotations
  }, guarded(findFreeAiTool));

  server.registerTool('build_website_preview', {
    title: 'Build Website Preview',
    description: 'Run only the existing npm build script in a site path inside the resolved client folder and write a preview manifest. Never deploys.',
    inputSchema: z.object({ clientId, sitePath: z.string().min(1) }), annotations: artifactAnnotations
  }, guarded(buildWebsitePreview));

  server.registerTool('run_visual_qa', {
    title: 'Run Visual QA',
    description: 'Capture hidden desktop/mobile screenshots and check basic accessibility, console errors, status, and horizontal overflow for a preview URL.',
    inputSchema: z.object({ clientId, url: z.string().url(), label: z.string().default('visual-qa') }), annotations: artifactAnnotations
  }, guarded(runVisualQa));

  server.registerTool('inspect_media', {
    title: 'Inspect Media',
    description: 'Inspect client-local media with ffprobe and optionally extract opening, middle, and closing frames. Reports duration, resolution, audio, and caption streams.',
    inputSchema: z.object({ clientId, mediaPath: z.string().min(1), extractFrames: z.boolean().default(true) }), annotations: artifactAnnotations
  }, guarded(inspectMedia));

  server.registerTool('research_prospect', {
    title: 'Research Prospect',
    description: 'Read one supplied first-party HTTPS business website, return source-linked evidence, and check exact-name duplication against the canonical client registry.',
    inputSchema: z.object({ businessName: z.string().min(1), websiteUrl: z.string().url(), location: z.string().default('') }), annotations: researchAnnotations
  }, guarded(researchProspect));

  server.registerTool('package_client_delivery', {
    title: 'Package Client Delivery',
    description: 'Package client-local artifacts into a manifest or ZIP with hashes. It never emails, uploads, sends, shares, or publishes the package.',
    inputSchema: z.object({ clientId, name: z.string().min(1), artifactPaths: z.array(z.string().min(1)).min(1).max(50), format: z.enum(['zip', 'manifest']).default('zip') }), annotations: artifactAnnotations
  }, guarded(packageClientDelivery));

  server.registerTool('search_agent_vault', {
    title: 'Search Agent Vault',
    description: 'Search only the generated redacted shared agent-vault text layer. Excludes raw credentials, raw communications, raw sessions, and inbox proposals.',
    inputSchema: z.object({ query: z.string().min(2).max(200), limit: z.number().int().min(1).max(30).default(12) }), annotations: readAnnotations
  }, guarded(searchAgentVault));

  server.registerTool('get_approval_board', {
    title: 'Get Approval Board',
    description: 'Read the canonical queue and group work into ready, blocked, and pending-Dillon-approval views. Never mutates queue state.',
    inputSchema: z.object({ clientId: z.string().optional() }), annotations: readAnnotations
  }, guarded(getApprovalBoard));

  return server;
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  serveStdio(createServer, { onerror: (error) => console.error(error) });
}
