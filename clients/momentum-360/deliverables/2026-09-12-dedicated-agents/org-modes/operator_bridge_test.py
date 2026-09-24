"""Offline trust, continuity, cancellation and uncertain-delivery checks."""
import copy
import io
import json
import queue
import sqlite3
import threading
import time
from types import SimpleNamespace

import operator_bridge as op


class Slack:
    def __init__(self):
        self.messages, self.extra_member, self.fail, self.wrong_app = [], False, False, False

    def auth_test(self):
        return {'team_id': op.TEAM, 'user_id': 'UBOT', 'bot_id': 'BBOT'}

    def bots_info(self, **_):
        return {'bot': {'app_id': 'OTHER' if self.wrong_app else op.APP}}

    def conversations_info(self, **_):
        return {'channel': {'is_im': True, 'user': op.OWNER}}

    def conversations_members(self, **_):
        return {'members': [op.OWNER, 'UBOT'] + (['OTHER'] if self.extra_member else [])}

    def chat_postMessage(self, **data):
        message = {**data, 'ts': f'{int(time.time())}.{len(self.messages)+1:06d}', 'user': 'UBOT'}
        message['text'] = message['text'].replace('<', '&lt;').replace('>', '&gt;')
        self.messages.append(message)
        if self.fail:
            raise OSError('simulated ambiguous send')
        return {'ts': message['ts'], 'channel': data['channel']}

    def conversations_replies(self, **_):
        return {'messages': self.messages}

    def api_call(self, *_, **__):
        return {'ok': True}


class Agent:
    calls, result = [], 'READY'

    def run(self, prompt, prior, stop, remember):
        self.calls.append((prompt, prior))
        thread = prior or 'test-thread-' + str(len(self.calls))
        remember(thread)
        return self.result, 'Verified local result.', thread

    def close(self):
        pass


def body(n, text='Do the task', thread=None):
    event = {'type': 'message', 'channel_type': 'im', 'channel': 'DTEST', 'user': op.OWNER,
             'text': text, 'ts': f'{int(time.time())}.{n:06d}'}
    if thread:
        event['thread_ts'] = thread
    return {'type': 'event_callback', 'team_id': op.TEAM, 'api_app_id': op.APP,
            'event_id': 'EvTest' + str(n), 'event': event}


def main():
    client, db = Slack(), sqlite3.connect(':memory:', check_same_thread=False)
    bridge = op.Bridge(client, db, Agent)
    for value in (None, [], {}, {'event': []}):
        assert bridge.receive(value) == 'REJECTED'
    for key, value in [('user', 'OTHER'), ('channel', 'CTEST'), ('channel', []),
                       ('subtype', 'message_changed'), ('edited', {}), ('bot_id', 'BBOT')]:
        bad = body(1); bad['event'][key] = value
        if key == 'edited':
            bad['event'][key] = {'ts': 'changed'}
        assert bridge.receive(bad) == 'REJECTED', key
    for key in ('team_id', 'api_app_id', 'type'):
        bad = body(1); bad[key] = 'OTHER'
        assert bridge.receive(bad) == 'REJECTED'
    client.extra_member = True
    assert bridge.receive(body(1)) == 'REJECTED'
    client.extra_member = False
    assert bridge.receive(body(1, 'xoxb-' + 'a' * 30)) == 'REJECTED'
    first = body(1)
    assert bridge.receive(first) == 'QUEUED'
    assert bridge.receive(first) == 'DUPLICATE'
    changed = copy.deepcopy(first); changed['event']['text'] = 'different'
    assert bridge.receive(changed) == 'REJECTED'
    bridge.process(bridge.jobs.get_nowait())
    assert db.execute('SELECT state FROM operator_events WHERE id=?', ('EvTest1',)).fetchone()[0] == 'DELIVERED'
    assert bridge.receive(body(2, thread=first['event']['ts'])) == 'QUEUED'
    bridge.process(bridge.jobs.get_nowait())
    assert Agent.calls[-1][1] == 'test-thread-1'
    assert bridge.receive(body(3, 'mode sean-operations Decide priorities', first['event']['ts'])) == 'QUEUED'
    bridge.process(bridge.jobs.get_nowait())
    assert 'sean-operations' in Agent.calls[-1][0] and Agent.calls[-1][1] is None
    count = len(Agent.calls)
    assert bridge.receive(body(10, 'modes\n*Sent using* <@U0B7MCP01GT|ChatGPT>')) == 'QUEUED'
    bridge.process(bridge.jobs.get_nowait())
    assert len(Agent.calls) == count and client.messages[-1]['text'].startswith('Active focus: marketing-chief')
    assert bridge.receive(body(4)) == 'QUEUED'
    active = bridge.current_cancel = threading.Event()
    assert bridge.receive(body(5, 'stop')) == 'STOPPED'
    assert active.is_set()
    assert bridge.receive(body(6, 'resume')) == 'RESUMED'
    assert active.is_set(), 'resume must not uncancel an active turn'
    bridge.process(bridge.jobs.get_nowait())
    assert len(Agent.calls) == count, 'cancelled queued task ran after resume'
    native = body(9)
    native['event'] = {'type': 'agent_session_stopped', 'user': op.OWNER, 'channel': 'DTEST',
                       'thread_ts': first['event']['ts'], 'event_ts': native['event']['ts']}
    bridge.current_cancel = threading.Event()
    bridge.current_reply = ('DTEST', first['event']['ts'])
    bridge.current_scope = 'DTEST:dm'
    assert bridge.native_stop(native) == 'STOPPED' and bridge.current_cancel.is_set()
    assert bridge.native_stop(native) == 'DUPLICATE'
    bad_native = copy.deepcopy(native); bad_native['event']['user'] = 'OTHER'
    assert bridge.native_stop(bad_native) == 'REJECTED'
    client.fail = True
    assert bridge.receive(body(7)) == 'QUEUED'
    bridge.process(bridge.jobs.get_nowait())
    sent = len(client.messages)
    assert db.execute("SELECT state FROM operator_events WHERE id='EvTest7'").fetchone()[0] == 'UNCERTAIN'
    assert bridge.receive(body(7)) == 'DUPLICATE' and len(client.messages) == sent
    client.fail = False
    Agent.result = 'NEEDS_ATTENTION'
    assert bridge.receive(body(8)) == 'QUEUED'
    bridge.process(bridge.jobs.get_nowait())
    assert db.execute("SELECT state FROM operator_events WHERE id='EvTest8'").fetchone()[0] == 'NEEDS_ATTENTION'
    assert 'codex://threads/' in client.messages[-1]['text']
    bridge.state('EvTest8', 'RUNNING')
    op.Bridge(client, db, Agent)
    assert db.execute("SELECT state FROM operator_events WHERE id='EvTest8'").fetchone()[0] == 'UNCERTAIN'
    client.wrong_app = True
    try:
        op.Bridge(client, db, Agent)
        raise AssertionError('wrong app accepted')
    except ValueError:
        pass
    rpc = object.__new__(op.Codex)
    rpc.attention, rpc.events, rpc.pending = threading.Event(), queue.Queue(), {}
    rpc.process = SimpleNamespace(stdout=io.StringIO(json.dumps({'id': 99, 'method': 'item/commandExecution/requestApproval'}) + '\n'))
    replies = []; rpc.send = replies.append
    rpc.read()
    assert rpc.attention.is_set() and 'error' in replies[0] and 'result' not in replies[0]
    print('PASS: identity, malformed input, private membership, secret screening, dedupe, continuity, modes, connector attribution, cancellation, uncertainty, approvals')


if __name__ == '__main__':
    main()
