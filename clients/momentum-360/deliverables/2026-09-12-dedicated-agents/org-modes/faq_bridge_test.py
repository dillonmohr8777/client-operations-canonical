"""Guard tests for the team FAQ bot. No Slack, no Codex, no network.

These cover the things that must not regress, because this bot talks to the
whole team: it must not process a credential, must not answer an empty or
oversized prompt, must not read outside the corpus, and must redact secrets on
the way out. Run: python faq_bridge_test.py
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import faq_bridge as fb


def test_rejects_credentials_in_question():
    bad = 'is this token still good xoxb-1234567890-abcdefghijklmnop'
    assert fb.answer(bad).startswith('REJECTED'), 'must refuse a question containing a credential'


def test_rejects_empty_and_oversized():
    assert fb.answer('').startswith('REJECTED')
    assert fb.answer('   ').startswith('REJECTED')
    assert fb.answer('x' * (fb.MAX_QUESTION + 1)).startswith('REJECTED')


def test_scrub_redacts_and_truncates():
    assert 'xoxb-' not in fb.scrub('leak xoxb-1234567890-abcdefghijklmnop here')
    assert fb.REDACT in fb.scrub('leak xoxb-1234567890-abcdefghijklmnop here')
    assert len(fb.scrub('y' * (fb.MAX_ANSWER + 500))) <= fb.MAX_ANSWER


def test_corpus_stays_inside_the_vault():
    original = fb.CONFIG.read_text(encoding='utf-8-sig')
    cfg = json.loads(original)
    try:
        cfg['corpus'] = '../../../../../../Windows/System32'
        fb.CONFIG.write_text(json.dumps(cfg), encoding='utf-8')
        try:
            fb.config()
        except ValueError as exc:
            assert 'inside the vault' in str(exc)
        else:
            raise AssertionError('a corpus outside the vault must be refused')
    finally:
        fb.CONFIG.write_text(original, encoding='utf-8')


def test_corpus_resolves_and_is_not_empty():
    cfg, root = fb.config()
    files = fb.corpus_files(root)
    assert files, f'corpus {cfg["corpus"]} resolved but has no .md files'
    assert all(str(p).startswith(str(root)) for p in files)


def test_prompt_carries_the_hard_rules():
    cfg, root = fb.config()
    p = fb.prompt_for('anything', root, fb.corpus_files(root))
    for required in ('not in the SOPs yet', 'NEVER guess', 'no tools',
                     'Do not use dashes', 'Cite the file'):
        assert required in p, f'prompt lost its guard: {required}'


if __name__ == '__main__':
    failed = 0
    for name, fn in sorted(globals().items()):
        if not name.startswith('test_'):
            continue
        try:
            fn()
            print(f'  PASS {name}')
        except AssertionError as exc:
            failed += 1
            print(f'  FAIL {name}: {exc}')
    print('FAILED' if failed else 'all guard tests passed')
    raise SystemExit(1 if failed else 0)
