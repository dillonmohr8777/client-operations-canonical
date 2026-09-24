"""Localhost-only static server with CORS, so the authenticated browser tab can pull
converted block files straight from disk instead of relaying them through the model."""
import http.server, socketserver, functools, pathlib

ROOT = pathlib.Path(__file__).parent / "wordpress-blocks"
PORT = 8765

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(H, directory=str(ROOT))) as s:
    print(f"serving {ROOT} on http://127.0.0.1:{PORT}", flush=True)
    s.serve_forever()
