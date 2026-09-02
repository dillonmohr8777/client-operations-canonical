# Claude session index

`claude-sessions.json` is a metadata-only inventory of Dillon's local Claude Code sessions. It includes every discovered session ID, project key, timestamps, record counts, tool names, git branches, content hash, and a one-way digest of the working directory.

It deliberately excludes prompts, responses, tool inputs/outputs, attachments, raw communications, credentials, full local paths, and the source JSONL files. Regenerate it with `npm run export:sessions`.
