# Claude session index

`claude-sessions.json` is a metadata-only inventory of Dillon's local Claude Code session files. It includes every discovered session ID, a source-file entry ID, project key, timestamps, record counts, tool names, git branches, content hash, and one-way digests of the source locator and working directory. The same Claude session ID may legitimately appear in multiple main-agent or subagent files; each source file remains represented without storing its full path.

It deliberately excludes prompts, responses, tool inputs/outputs, attachments, raw communications, credentials, full local paths, and the source JSONL files. Regenerate it with `npm run export:sessions`.
