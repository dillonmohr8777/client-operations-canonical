"""Offline acceptance checks: python faq_bridge_test.py. No network or live config edits."""
import copy
import json
from pathlib import Path
import sqlite3
import tempfile
from unittest.mock import patch
import faq_bridge as f

CFG, RESOURCES = f.config()
ACTIVE = dict(CFG, enabled=True, app_id='A1234567890', bot_user_id='U1234567890', allowed_channels=['C1234567890'])

class Slack:
    def __init__(self):
        self.posts = []
        self.guest = False
        self.shared = False
        self.fail_send = False
        self.team = f.TEAM
        self.app = ACTIVE['app_id']
    def conversations_info(self, channel):
        return {'channel': {'id': channel, 'is_member': True, 'is_shared': self.shared}}
    def users_info(self, user):
        return {'user': {'id': user, 'team_id': self.team, 'is_restricted': self.guest}}
    def auth_test(self):
        return {'team_id': self.team, 'bot_id': 'B1234567890', 'user_id': ACTIVE['bot_user_id']}
    def bots_info(self, bot):
        return {'bot': {'app_id': self.app}}
    def chat_postMessage(self, **kw):
        self.posts.append(kw)
        if self.fail_send:
            raise TimeoutError('ambiguous send')
        return {'ok': True, 'channel': kw['channel'], 'ts': '1789500000.123456'}

def body(eid='Ev1', text='Where is onboarding?', user='U9876543210', root=None):
    e = {'type': 'app_mention', 'channel': 'C1234567890', 'user': user,
         'ts': '1789499900.123456', 'text': '<@U1234567890> ' + text}
    if root:
        e['thread_ts'] = root
    return {'team_id': f.TEAM, 'api_app_id': ACTIVE['app_id'], 'event_id': eid, 'event': e}

def bridge(cfg=None, answer=None):
    slack = Slack()
    return f.Bridge(slack, sqlite3.connect(':memory:'), cfg or ACTIVE,
                    answer_fn=answer or (lambda _: 'Reviewed answer')), slack

def state(b, eid='Ev1'):
    return b.db.execute('SELECT state FROM faq_events WHERE event_id=?', (eid,)).fetchone()[0]

def test_source_and_no_operator_import():
    assert len(RESOURCES) >= 20
    assert all(r['source'].startswith('https://') for r in RESOURCES)
    text = Path(f.__file__).read_text(encoding='utf-8')
    assert 'from operator_bridge' not in text and 'subprocess' not in text
    assert f.render(['invented'], RESOURCES) == f.UNKNOWN
    assert f.render(['onboarding'], RESOURCES).startswith(RESOURCES[1]['text'])
    assert '&lt;!channel&gt;' == f.html.escape('<!channel>')

def test_config_fails_closed():
    for changes in ({'team_id': 'T9999999999'}, {'app_id': f.WORKMATE},
                    {'allowed_channels': ['*']}, {'model': 'qwen3.5:397b-cloud'},
                    {'corpus': '../outside.json'}, {'corpus_sha256': 'bad'}):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder) / 'config.json'
            p.write_text(json.dumps(dict(CFG, **changes)), encoding='utf-8')
            try:
                f.config(p)
            except (ValueError, OSError):
                pass
            else:
                raise AssertionError(changes)

def test_input_guards():
    for question in ('', ' ', 'x' * (f.MAX_QUESTION + 1), 'xoxb-1234567890abcdefghijklmnop'):
        assert f.answer(question).startswith('REJECTED')
    assert f.answer('How many vacation days do new hires get?', selector=lambda *a: []) == f.UNKNOWN
    assert set(f.MODES) == {'jason-sales','sean-operations','mac-revenue-reporting','melissa-silber-marketing','melissa-rigby-delivery'}

def test_envelope_guards():
    b, s = bridge()
    cases = [None, [], {}, {'event': []}]
    for key, val in [('team_id','T9999999999'),('api_app_id',f.WORKMATE),('event_id','')]:
        x = body(); x[key] = val; cases.append(x)
    for key, val in [('channel','C9999999999'),('type','message'),('bot_id','B123'),
                     ('subtype','message_changed'),('user',ACTIVE['bot_user_id']),('ts','bad'),
                     ('thread_ts',[]),('text','xoxb-1234567890abcdefghijklmnop'),
                     ('text','Not a mention')]:
        x = body(); x['event'][key] = val; cases.append(x)
    assert all(b.receive(x) == 'REJECTED' for x in cases)
    for cfg in (dict(ACTIVE, enabled=False),dict(ACTIVE,allowed_channels=[]),dict(ACTIVE,app_id=f.WORKMATE)):
        other, _ = bridge(cfg)
        assert other.receive(body()) == 'REJECTED'
    assert not s.posts

def test_guest_and_shared_channel_denied():
    for attr in ('guest','shared'):
        b,s = bridge(); setattr(s,attr,True)
        assert b.receive(body()) == 'REJECTED'

def test_dedupe_send_and_restart():
    b,s = bridge()
    assert b.receive(body()) == 'QUEUED'
    assert b.receive(body()) == 'DUPLICATE'
    with patch.object(f,'config',return_value=(ACTIVE,RESOURCES)):
        b.process(b.jobs.get_nowait())
    assert state(b) == 'POSTED' and len(s.posts) == 1
    assert s.posts[0]['thread_ts'] == body()['event']['ts']
    assert s.posts[0]['unfurl_links'] is False
    assert b.receive(body('Ev2')) == 'QUEUED'
    f.Bridge(s,b.db,ACTIVE)
    assert state(b,'Ev2') == 'UNCERTAIN'
    assert b.receive(body('Ev2')) == 'DUPLICATE'

def test_ambiguous_send_is_not_retried():
    b,s = bridge(); s.fail_send=True
    b.receive(body())
    with patch.object(f,'config',return_value=(ACTIVE,RESOURCES)):
        b.process(b.jobs.get_nowait())
    assert state(b) == 'UNCERTAIN' and len(s.posts) == 1
    assert b.db.execute('SELECT reply_hash FROM faq_events WHERE event_id=?',('Ev1',)).fetchone()[0] == f.digest('Reviewed answer')
    assert b.receive(body()) == 'DUPLICATE'

def test_stream_completion_and_deadline():
    import io
    class Opener:
        def open(self, request, timeout):
            data=json.loads(request.data)
            assert data['stream'] is True and 'tools' not in data
            assert request.full_url == f.OLLAMA + '/api/chat'
            return io.BytesIO(b'{"message":{"content":"draft"}}\n{"done":true}\n')
    with patch.object(f.urllib.request,'build_opener',return_value=Opener()):
        assert f.generate('system',{},'llama3.2:3b',10) == 'draft'
        with patch.object(f.time,'monotonic',side_effect=[0,1000]):
            try: f.generate('system',{},'llama3.2:3b',10)
            except TimeoutError: pass
            else: raise AssertionError('deadline not enforced')

def test_assistant_availability_claims():
    with patch.object(f, 'verify_local_model', return_value=True):
        for claim in ('Answers 24/7', 'Instant answers', 'Comprehensive coverage', 'Always-on help'):
            with patch.object(f, 'generate', return_value=claim):
                assert f.draft('melissa-silber', 'Momentum Answers hero', ACTIVE, RESOURCES, 1).startswith('Draft withheld:')
        with patch.object(f, 'generate', return_value='Find reviewed training resources.'):
            assert f.draft('melissa-silber', 'Momentum Answers hero', ACTIVE, RESOURCES, 1).startswith('DRAFT FOR')
        with patch.object(f, 'generate', return_value='Client provides 24/7 service.'):
            assert f.draft('melissa-silber', 'Client confirmed 24/7 service.', ACTIVE, RESOURCES, 1).startswith('DRAFT FOR')


def test_connector_commands():
    for suffix in ('\n*Sent using* <@U0B7MCP01GT|ChatGPT>', '\n*Sent using* <@U0B7MCP01GT>'):
        b, _ = bridge()
        assert b.receive(body('mode', 'modes' + suffix)) == 'QUEUED'
        assert b.jobs.get_nowait()[4] == 'modes'
        assert b.receive(body('stop', 'stop' + suffix)) == 'STOPPED'
    b, _ = bridge()
    other = 'modes\n*Sent using* <@U5555555555|Other>'
    assert b.receive(body('other', other)) == 'QUEUED'
    assert b.jobs.get_nowait()[4] == other


def test_stop_and_live_disable():
    b,s = bridge()
    b.receive(body())
    assert b.receive(body('stop','stop')) == 'STOPPED'
    with patch.object(f,'config',return_value=(ACTIVE,RESOURCES)):
        b.process(b.jobs.get_nowait())
    assert state(b) == 'CANCELLED' and not s.posts
    b,s = bridge(); b.receive(body())
    with patch.object(f,'config',return_value=(dict(ACTIVE,enabled=False),RESOURCES)):
        b.process(b.jobs.get_nowait())
    assert state(b) == 'CANCELLED' and not s.posts

def test_scope_isolated_draft_continuity():
    seen=[]
    b,s = bridge(answer=lambda q: seen.append(q) or 'DRAFT')
    with patch.object(f,'config',return_value=(ACTIVE,RESOURCES)):
        for eid,q,user in [('Ev1','draft melissa-silber: Need 3 assets.','U9876543210'),
                           ('Ev2','Due Friday.','U9876543210'),
                           ('Ev3','What is my brief?','U5555555555')]:
            assert b.receive(body(eid,q,user)) == 'QUEUED'
            b.process(b.jobs.get_nowait())
    assert 'Need 3 assets.' in seen[1] and 'Due Friday.' in seen[1]
    assert 'Need 3 assets.' not in seen[2]

def test_preflight_wrong_app_and_cloud_rejection():
    s=Slack()
    with patch.object(f,'verify_local_model',return_value=True):
        f.preflight(ACTIVE,s)
        s.app=f.WORKMATE
        try: f.preflight(ACTIVE,s)
        except ValueError: pass
        else: raise AssertionError('Workmate token accepted')
    with patch.object(f,'local_json',return_value={'remote_host':'https://cloud.invalid'}):
        try: f.verify_local_model('llama3.2:3b')
        except ValueError: pass
        else: raise AssertionError('cloud model accepted')

def test_draft_roles_and_no_external_claim():
    with patch.object(f,'generate',return_value='Proposed next steps: confirm the inputs.'), patch.object(f,'verify_local_model',return_value=True):
        for mode in f.MODES:
            result=f.draft(mode,'Prepare the brief.',CFG,RESOURCES,10)
            assert result.startswith('DRAFT FOR ')
            assert result.endswith('No external work has been executed.')

if __name__ == '__main__':
    count=0
    for name, fn in sorted(list(globals().items())):
        if name.startswith('test_') and callable(fn):
            fn(); count+=1; print('PASS',name)
    print(json.dumps({'state':'PASS','checks':count,'live_slack_calls':0,'model_calls':0}))
