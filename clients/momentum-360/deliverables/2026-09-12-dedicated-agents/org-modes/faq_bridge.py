"""Momentum team FAQ bot: read-only, channel-facing, corpus-scoped.

Deliberately NOT the Workmate operator. operator_bridge.py answers only Dillon,
only in his verified private DM, and carries his full tool and canonical-state
authority. This answers the whole team in a channel, so it gets none of that:
no tools, no MCP, no writes, no vault access beyond CORPUS, and it cites the
file it answered from or says it does not know.

Run `--ask "question"` to test the answer path with no Slack at all.
"""
import argparse, json, os, re, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from operator_bridge import Codex, SECRET, digest  # transport-free pieces only

VAULT = Path('C:/Users/dillo/repos/dillon-os')
CONFIG = Path(__file__).resolve().parent / 'faq-config.json'

# Secrets must never reach a channel even if a corpus file is edited badly later.
REDACT = '[redacted]'
MAX_QUESTION = 1000
MAX_ANSWER = 3500


def config():
    cfg = json.loads(CONFIG.read_text(encoding='utf-8-sig'))
    root = (VAULT / cfg['corpus']).resolve()
    if not str(root).startswith(str(VAULT.resolve())):
        raise ValueError('corpus must live inside the vault')
    if not root.is_dir():
        raise ValueError(f'corpus folder missing: {root}')
    return cfg, root


def corpus_files(root):
    return sorted(p for p in root.rglob('*.md') if p.is_file())


def prompt_for(question, root, files):
    listing = '\n'.join(f'- {p.relative_to(VAULT).as_posix()}' for p in files)
    return f'''You are the Momentum team FAQ assistant, answering in a shared Slack channel
where anyone on the team, including brand-new hires, can read you.

HARD RULES, in order of priority:
1. Answer ONLY from the files listed below. Read them. Use nothing else, not your
   own knowledge of marketing, not other folders, not the web.
2. If the files do not answer the question, reply with exactly this sentence:
   That is not in the SOPs yet.
   Then name who would know. NEVER guess. A confident wrong answer to a new hire
   about a client process is worse than no answer.
3. Cite the file you used, by name, in the answer.
4. Never output a password, API key, token, cookie, client billing figure, or
   anything that looks like a credential, even if a file contains one. Say the
   file contains a credential and stop.
5. This is a public team channel. Do not repeat client-confidential detail, spend
   figures, or anything about a specific person's performance.
6. Do not use dashes in your answer. Use commas, colons or separate sentences.
7. Be short. A few sentences. This is Slack, not a document.

You have no tools and no authority to change anything. You read and you answer.

Files you may read, all relative to {VAULT.as_posix()}:
{listing}

Team member's question:
{question}'''


def scrub(text):
    return SECRET.sub(REDACT, text or '')[:MAX_ANSWER]


def answer(question, timeout=240):
    cfg, root = config()
    question = (question or '').strip()
    if not question:
        return 'REJECTED: empty question'
    if len(question) > MAX_QUESTION:
        return 'REJECTED: question too long'
    if SECRET.search(question):
        return 'REJECTED: that message looks like it contains a credential, so I did not process it.'
    files = corpus_files(root)
    if not files:
        return f'The corpus folder {cfg["corpus"]} has no .md files in it yet.'
    codex = Codex(operator=False)   # operator=False: no elevated tool surface
    try:
        import threading
        stop = threading.Event()
        state, reply, _thread = codex.run(
            prompt_for(question, root, files), None, stop, lambda _tid: None)
        if state != 'READY' or not reply:
            # READY is Codex.run's success state. STOPPED/NEEDS_ATTENTION mean it
            # wanted an interactive approval, which a channel bot must never grant.
            return f'I could not answer that one ({state}). Try again, or ask Dillon.'
        return scrub(reply)
    finally:
        codex.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ask', help='answer one question and exit, no Slack')
    ap.add_argument('--list-corpus', action='store_true')
    ap.add_argument('--serve', action='store_true')
    args = ap.parse_args()

    if args.list_corpus:
        cfg, root = config()
        files = corpus_files(root)
        print(f'corpus: {cfg["corpus"]}  ({len(files)} files)')
        for p in files:
            print('  ' + p.relative_to(VAULT).as_posix())
        return 0
    if args.ask:
        print(answer(args.ask))
        return 0
    if args.serve:
        cfg, _ = config()
        for name in ('FAQ_SLACK_BOT_TOKEN', 'FAQ_SLACK_APP_TOKEN'):
            if not os.environ.get(name):
                print(f'{name} is not set. The FAQ bot needs its OWN Slack app, '
                      f'separate from Workmate A0C2K8ZU6AU. See faq-setup.md.', file=sys.stderr)
                return 2
        print('Slack transport not wired yet; see faq-setup.md step 3.', file=sys.stderr)
        return 2
    ap.print_help()
    return 1


if __name__ == '__main__':
    raise SystemExit(main())
