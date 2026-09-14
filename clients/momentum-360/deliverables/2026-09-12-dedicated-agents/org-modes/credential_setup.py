"""One-use loopback form: browser clipboard -> existing Windows credential helper."""
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from pathlib import Path
import re
import secrets
import subprocess
import sys
import threading
from urllib.parse import parse_qs

ROOT = Path(__file__).resolve().parents[5]
SAVE = """
$ErrorActionPreference='Stop'
. '__HELPER__'
$values=[Console]::In.ReadToEnd() | ConvertFrom-Json
Set-MarketingChiefSitesCredential -Target 'MarketingChief-Workmate-Bot-A0C2K8ZU6AU' -Token $values.bot -UserName 'momentum-workmate'
Set-MarketingChiefSitesCredential -Target 'MarketingChief-Workmate-Socket-A0C2K8ZU6AU' -Token $values.socket -UserName 'momentum-workmate'
$values=$null
""".replace('__HELPER__', str(ROOT / 'scripts/MarketingChief.SitesBridgeCredential.ps1').replace("'", "''"))


def valid(values):
    return (set(values) == {'bot', 'socket'}
            and all(isinstance(values[k], list) and len(values[k]) == 1 for k in values)
            and re.fullmatch(r'xoxb-[A-Za-z0-9_-]{27,507}', values['bot'][0]) is not None
            and re.fullmatch(r'xapp-[A-Za-z0-9_-]{27,507}', values['socket'][0]) is not None)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log bodies, token fields, or the one-use route.

    def reply(self, code, body):
        self.send_response(code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(body.encode())

    def local(self):
        return self.path == self.server.route and self.headers.get('Host') == self.server.host

    def do_GET(self):
        if not self.local():
            return self.reply(404, 'Not found')
        self.reply(200, '''<!doctype html><meta charset=utf-8><title>Connect Momentum Workmate</title>
<h1>Connect Momentum Workmate</h1><p>App A0C2K8ZU6AU. Tokens go directly to Windows Credential Manager on this PC.</p>
<p>No credential file or chat output. This form closes after saving.</p>
<form method=post autocomplete=off><p><label>Slack bot token <input type=password name=bot autocomplete=off required></label></p>
<p><label>Socket Mode token <input type=password name=socket autocomplete=off required></label></p>
<button type=submit>Save to Windows Credential Manager</button></form>''')

    def do_POST(self):
        if not self.local() or self.headers.get('Origin') != 'http://' + self.server.host:
            return self.reply(403, 'Request origin rejected')
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 1 <= size <= 4096 or self.headers.get_content_type() != 'application/x-www-form-urlencoded':
                return self.reply(400, 'Invalid form')
            values = parse_qs(self.rfile.read(size).decode('utf-8'), strict_parsing=True)
            if not valid(values):
                return self.reply(400, 'Token format rejected. No values displayed.')
            result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', SAVE],
                input=json.dumps({k: v[0] for k, v in values.items()}), text=True,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30,
                creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            values.clear()
            if result.returncode:
                return self.reply(500, 'Secure storage failed. No values displayed.')
        except (ValueError, OSError, subprocess.SubprocessError):
            return self.reply(500, 'Secure storage failed. No values displayed.')
        self.reply(200, '<h1>Credentials saved securely</h1><p>Momentum Workmate credentials are in Windows Credential Manager. No service was started by this form.</p>')
        print(json.dumps({'state': 'CREDENTIALS_SAVED', 'app': 'A0C2K8ZU6AU'}), flush=True)
        threading.Thread(target=self.server.shutdown, daemon=True).start()


if __name__ == '__main__':
    if '--self-test' in sys.argv:
        good = {'bot': ['xoxb-' + 'a' * 30], 'socket': ['xapp-' + 'b' * 30]}
        assert valid(good)
        assert not valid({**good, 'extra': ['bad']})
        assert not valid({**good, 'bot': ['xapp-' + 'a' * 30]})
        assert not valid({**good, 'socket': good['socket'] * 2})
        assert (ROOT / 'scripts/MarketingChief.SitesBridgeCredential.ps1').is_file()
        print('PASS: exact credential fields, prefixes, multiplicity and helper route')
    else:
        server = HTTPServer(('127.0.0.1', 0), Handler)
        server.host = '127.0.0.1:' + str(server.server_port)
        server.route = '/' + secrets.token_urlsafe(32)
        print('http://' + server.host + server.route, flush=True)
        timer = threading.Timer(600, server.shutdown); timer.daemon = True; timer.start()
        try:
            server.serve_forever()
        finally:
            timer.cancel(); server.server_close()
