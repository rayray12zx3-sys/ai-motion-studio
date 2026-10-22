#!/usr/bin/env python3
"""One-time localhost consent + Picker. No private media or credential files.

Only the resulting config should be pasted into the protected GitHub environment.
Credentials live in memory until process termination; HTTP access logs are disabled.
"""
import base64
import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer
import html
import json
import secrets
import time
from urllib.parse import parse_qs, urlencode, urlsplit
import urllib.request

ORIGIN = 'http://localhost:8765'
SCOPE = 'https://www.googleapis.com/auth/drive.file'
STATE = {}
CSRF = secrets.token_urlsafe(32)
START = time.monotonic()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise ValueError('REDIRECT_REFUSED')


def page(body):
    return ('<!doctype html><html lang="zh-Hant"><meta charset="utf-8">'
        '<meta name="referrer" content="no-referrer"><title>S08 私人授權</title>'
        '<body><h1>S08 一次性授權</h1>' + body + '</body></html>').encode()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # A callback query contains an authorization code.

    def reply(self, content, code=200, location=None):
        self.send_response(code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Connection', 'close')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'none'")
        if location:
            self.send_header('Location', location)
        self.end_headers()
        self.wfile.write(content)
        self.wfile.flush()

    def safe(self):
        return (self.headers.get('Host') == 'localhost:8765' and
                time.monotonic() - START < 3600)

    def do_GET(self):
        if not self.safe():
            self.reply(page('拒絕不符的本機要求。'), 403)
            return
        parsed = urlsplit(self.path)
        if parsed.path == '/callback':
            try:
                q = parse_qs(parsed.query)
                if not secrets.compare_digest(q.get('state', [''])[0], STATE.pop('oauth_state')):
                    raise ValueError()
                payload = urlencode({'client_id':STATE['client_id'], 'client_secret':STATE['client_secret'],
                    'code':q['code'][0], 'redirect_uri':ORIGIN+'/callback',
                    'grant_type':'authorization_code','code_verifier':STATE.pop('verifier')}).encode()
                req = urllib.request.Request('https://oauth2.googleapis.com/token', data=payload,
                    headers={'Content-Type':'application/x-www-form-urlencoded'})
                with urllib.request.build_opener(NoRedirect()).open(req, timeout=30) as r:
                    raw = r.read(65537)
                if len(raw) > 65536:
                    raise ValueError()
                token = json.loads(raw)
                if set(token['scope'].split()) != {SCOPE} or not token.get('refresh_token'):
                    raise ValueError()
                if token.get('refresh_token_expires_in'):
                    raise ValueError('TIME_LIMITED_GRANT_NOT_LONG_TERM')
                STATE.update(access_token=token['access_token'], refresh_token=token['refresh_token'])
                self.reply(b'', 303, ORIGIN+'/picker')
            except Exception:
                self.reply(page('授權交換未完成。未輸出詳細錯誤或憑證；請重新授權。'), 400)
            return
        if parsed.path == '/picker' and STATE.get('access_token'):
            # Tokens stay in this private loopback page. No media bytes are fetched.
            opts = json.dumps({k:STATE[k] for k in ('access_token','picker_key','project_number','source_file_id','destination_folder_id')})
            self.reply(page('''<p>依序只選取原 ZIP 及目標資料夾，不下載內容。</p>
<button id="source">選取原 ZIP</button><button id="folder">選取目標資料夾</button>
<p id="status"></p><form method="post" action="/finish"><input type="hidden" name="csrf" value="'''+CSRF+'''">
<input type="hidden" name="selected_source" id="ss"><input type="hidden" name="selected_folder" id="sf">
<button>完成並準備 GitHub environment secret</button></form>
<script>const cfg='''+opts+'''; function pick(folder){
const view=new google.picker.DocsView().setIncludeFolders(folder).setSelectFolderEnabled(folder).setFileIds([folder?cfg.destination_folder_id:cfg.source_file_id]);
if(folder)view.setMimeTypes('application/vnd.google-apps.folder');
new google.picker.PickerBuilder().addView(view).setOAuthToken(cfg.access_token).setDeveloperKey(cfg.picker_key)
.setAppId(cfg.project_number).setOrigin(location.origin).setCallback(d=>{if(d.action==='picked'){
const id=d.docs[0].id; if(id!==(folder?cfg.destination_folder_id:cfg.source_file_id)){document.getElementById('status').textContent='選取不符，拒絕。';return;}
document.getElementById(folder?'sf':'ss').value=id;document.getElementById('status').textContent=folder?'資料夾已選取':'來源已選取';}}).build().setVisible(true);}
function loaded(){gapi.load('picker',()=>{document.getElementById('source').onclick=()=>pick(false);document.getElementById('folder').onclick=()=>pick(true);});}
</script><script src="https://apis.google.com/js/api.js?onload=loaded"></script>'''))
            return
        self.reply(page('''<p>只要求 drive.file；應用程式必須已設為正式版。憑證只保留於本機記憶體。</p>
<form method="post" action="/start"><input type="hidden" name="csrf" value="'''+CSRF+'''">
<label>Client ID <input name="client_id" required></label><br>
<label>Client secret <input type="password" name="client_secret" required autocomplete="off"></label><br>
<label>Picker key <input type="password" name="picker_key" required autocomplete="off"></label><br>
<label>Project number <input name="project_number" required></label><br>
<label>Source file ID <input name="source_file_id" required></label><br>
<label>Destination folder ID <input name="destination_folder_id" required></label><br>
<label><input type="checkbox" name="production" value="yes" required>已在 Google 確認為正式版</label><br>
<button>前往 Google 同意畫面</button></form>'''))

    def do_POST(self):
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if not 0 < n < 32768:
                raise ValueError()
            q = parse_qs(self.rfile.read(n).decode())
            if not self.safe() or self.headers.get('Origin') != ORIGIN:
                raise ValueError()
            if not secrets.compare_digest(q['csrf'][0], CSRF):
                raise ValueError()
            if self.path == '/start':
                if q.get('production') != ['yes']:
                    raise ValueError()
                import re
                for k in ('client_id','client_secret','picker_key','project_number','source_file_id','destination_folder_id'):
                    value = q[k][0]
                    if not value or len(value) > 4096 or any(ord(x)<32 for x in value):
                        raise ValueError()
                    STATE[k] = value
                for k in ('source_file_id','destination_folder_id'):
                    if not re.fullmatch(r'[A-Za-z0-9_-]{15,160}', STATE[k]):
                        raise ValueError()
                STATE['oauth_state'] = secrets.token_urlsafe(32)
                STATE['verifier'] = secrets.token_urlsafe(64)
                challenge = base64.urlsafe_b64encode(hashlib.sha256(STATE['verifier'].encode()).digest()).rstrip(b'=').decode()
                url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode({
                    'client_id':STATE['client_id'], 'redirect_uri':ORIGIN+'/callback',
                    'response_type':'code', 'scope':SCOPE, 'access_type':'offline',
                    'prompt':'consent', 'state':STATE['oauth_state'],
                    'code_challenge':challenge,'code_challenge_method':'S256'})
                self.reply(b'',303,url)
            elif self.path == '/finish':
                if (q.get('selected_source') != [STATE['source_file_id']] or
                    q.get('selected_folder') != [STATE['destination_folder_id']]):
                    raise ValueError()
                config = {k:STATE[k] for k in ('client_id','client_secret','refresh_token','source_file_id','destination_folder_id')}
                config.update(auth_mode='oauth_refresh', scope=SCOPE, publishing_status='production')
                # Masked textarea prevents accidental UI snapshots from exposing credentials.
                self.reply(page('<p>僅複製到 GitHub s08-ephemeral-media environment 的 S08_DRIVE_CONFIG_JSON。</p>'
                    '<button id="copy">複製受保護設定</button><p id="s"></p><script>const secret='+json.dumps(json.dumps(config))+';'
                    'document.getElementById("copy").onclick=async()=>{await navigator.clipboard.writeText(secret);document.getElementById("s").textContent="已複製，請勿貼入聊天或公開內容";};</script>'))
            else:
                raise ValueError()
        except Exception:
            self.reply(page('要求遭拒絕；未輸出憑證或私人檔案資訊。'),400)


if __name__ == '__main__':
    print('S08 authorization UI: http://localhost:8765 (memory only; stop after secret provisioning)')
    server = HTTPServer(('127.0.0.1',8765),Handler)
    server.timeout = 1
    try:
        while time.monotonic()-START < 3600:
            server.handle_request()
    finally:
        STATE.clear()
        server.server_close()
