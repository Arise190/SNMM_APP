# -*- coding: utf-8 -*-
"""
SnackPOS Dev Server — แก้ไฟล์แล้วเบราว์เซอร์รีโหลดอัตโนมัติ
"""

import http.server
import socketserver
import os
import time
import threading
import queue
import webbrowser
from pathlib import Path

PROJECT_DIR = Path(__file__).parent.resolve()
PORT = 8080

_reload_queues = []
_ql = threading.Lock()

RELOAD_JS = b"""<script>
(function() {
  var es = new EventSource('/__livereload');
  es.onmessage = function() { location.reload(); };
  es.onerror = function() {
    es.close();
    setTimeout(function() {
      var es2 = new EventSource('/__livereload');
      es2.onmessage = function() { location.reload(); };
    }, 2000);
  };
})();
</script>"""


def _broadcast():
    with _ql:
        for q in _reload_queues:
            try:
                q.put_nowait(True)
            except queue.Full:
                pass


def _watcher():
    seen = {}
    watch_exts = {'.html', '.js', '.css', '.json'}
    skip_dirs = {'.claude', '.git', '__pycache__'}
    while True:
        for p in PROJECT_DIR.rglob('*'):
            if not p.is_file():
                continue
            if any(d in p.parts for d in skip_dirs):
                continue
            if p.suffix not in watch_exts:
                continue
            try:
                mt = p.stat().st_mtime
                key = str(p)
                if key in seen and seen[key] != mt:
                    print(f'  ↺  {p.name} — รีโหลด...', flush=True)
                    _broadcast()
                seen[key] = mt
            except OSError:
                pass
        time.sleep(0.4)


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def _sse(self):
        q = queue.Queue(maxsize=4)
        with _ql:
            _reload_queues.append(q)
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        try:
            while True:
                try:
                    q.get(timeout=20)
                    self.wfile.write(b'data: reload\n\n')
                except queue.Empty:
                    self.wfile.write(b': ping\n\n')
                self.wfile.flush()
        except Exception:
            pass
        finally:
            with _ql:
                try:
                    _reload_queues.remove(q)
                except ValueError:
                    pass

    def _html(self, filepath):
        try:
            with open(filepath, 'rb') as f:
                body = f.read()
        except OSError:
            self.send_error(404)
            return
        if b'</body>' in body:
            body = body.replace(b'</body>', RELOAD_JS + b'</body>', 1)
        elif b'</html>' in body:
            body = body.replace(b'</html>', RELOAD_JS + b'</html>', 1)
        else:
            body += RELOAD_JS
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split('?')[0] == '/__livereload':
            self._sse()
            return

        fpath = self.translate_path(self.path)
        if os.path.isdir(fpath):
            candidate = os.path.join(fpath, 'index.html')
            if os.path.isfile(candidate):
                fpath = candidate
            else:
                super().do_GET()
                return

        if fpath.lower().endswith('.html') and os.path.isfile(fpath):
            self._html(fpath)
        else:
            super().do_GET()

    def log_message(self, fmt, *args):
        skip = ('.js', '.css', '.png', '.ico', '.woff', '.svg',
                '.webp', '.jpg', '/__livereload', 'sw.js', 'manifest')
        path = str(args[0]) if args else ''
        if any(s in path for s in skip):
            return
        code = args[1] if len(args) > 1 else ''
        print(f'  {code}  {path}', flush=True)


def main():
    threading.Thread(target=_watcher, daemon=True).start()

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    try:
        srv = socketserver.ThreadingTCPServer(('', PORT), DevHandler)
    except OSError:
        print(f'\n  Port {PORT} ถูกใช้งานอยู่แล้ว')
        print('  กรุณาปิด server เก่าก่อน หรือเปลี่ยน PORT ในไฟล์นี้\n')
        input('กด Enter เพื่อออก...')
        return

    url = f'http://localhost:{PORT}'
    print()
    print('  ╔══════════════════════════════════════╗')
    print('  ║       SnackPOS  Dev  Server          ║')
    print(f'  ║   {url}           ║')
    print('  ║   Live Reload: เปิด                  ║')
    print('  ║   Ctrl+C เพื่อหยุด                   ║')
    print('  ╚══════════════════════════════════════╝')
    print()

    threading.Thread(
        target=lambda: (time.sleep(0.8), webbrowser.open(url)),
        daemon=True
    ).start()

    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n  หยุด server แล้ว')
    finally:
        srv.shutdown()


if __name__ == '__main__':
    main()
