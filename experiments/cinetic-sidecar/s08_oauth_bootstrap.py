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
import urllib.error

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
        '<meta name="referrer" content="strict-origin-when-cross-origin"><title>S08 私人授權</title>'
        '<body><h1>S08 一次性授權</h1>' + body + '</body></html>').encode()


def verify_picker_access(token, source_id, folder_id):
    """Read only metadata for the TWO explicit Picker selections.

    Prove that the drive.file grant can download the original ZIP and add
    children to the restricted destination BEFORE exporting refresh secrets.
    No ZIP bytes, Drive listing, file names, token details or error bodies.
    """
    def metadata(file_id):
        import re
        if not re.fullmatch(r'[A-Za-z0-9_-]{15,160}', file_id):
            return None
        fields = 'id,mimeType,trashed,size,capabilities(canDownload,canAddChildren),permissions(type)'
        url = ('https://www.googleapis.com/drive/v3/files/' + file_id +
               '?fields=' + fields)
        req = urllib.request.Request(url, headers={
            'Authorization': 'Bearer ' + token, 'Accept': 'application/json'})
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=20) as r:
            data = r.read(65537)
        if len(data) > 65536:
            return None
        obj = json.loads(data)
        return obj if isinstance(obj, dict) and obj.get('id') == file_id else None

    try:
        source = metadata(source_id)
        if (not source or source.get('trashed', True) or
            source.get('mimeType') != 'application/zip' or
            str(source.get('size')) != '305622' or
            not source.get('capabilities', {}).get('canDownload')):
            return False
        folder = metadata(folder_id)
        if (not folder or folder.get('trashed', True) or
            folder.get('mimeType') != 'application/vnd.google-apps.folder' or
            not folder.get('capabilities', {}).get('canAddChildren') or
            not isinstance(folder.get('permissions'), list) or
            not folder['permissions'] or
            any(p.get('type') != 'user' for p in folder['permissions'])):
            return False
        return True
    except Exception:
        # Deliberately do not print remote responses, IDs or OAuth credentials.
        return False


class Handler(BaseHTTPRequestHandler):
    def config_page(self, pending=False):
        config = {k:STATE[k] for k in ('client_id','client_secret','refresh_token','source_file_id','destination_folder_id')}
        config.update(auth_mode='oauth_refresh', scope=SCOPE, publishing_status='production')
        if pending:
            # Intentionally incompatible with the media bridge's ready-config schema.
            # Preserve the grant without authorizing any private input or rendering.
            config = {'status':'PENDING_FILE_GRANT','protected_oauth_config':config}
        self.reply(page('<p>'+('待驗證授權：不可啟用渲染。' if pending else '檔案權限預檢完成。')+
            '僅複製到 GitHub s08-ephemeral-media environment 的 S08_DRIVE_CONFIG_JSON。</p>'
            '<button id="copy">複製受保護設定</button><p id="s"></p><script>const secret='+json.dumps(json.dumps(config))+';'
            'document.getElementById("copy").onclick=async()=>{await navigator.clipboard.writeText(secret);document.getElementById("s").textContent="已複製，請勿貼入聊天或公開內容";};</script>'))

    def log_message(self, *args):
        pass  # A callback query contains an authorization code.

    def reply(self, content, code=200, location=None):
        self.send_response(code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Connection', 'close')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
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
            stage = 'STATE_CHECK'
            try:
                q = parse_qs(parsed.query)
                incoming = q.get('state', [''])[0]
                digest = hashlib.sha256(incoming.encode()).hexdigest()
                if (STATE.get('access_token') and STATE.get('completed_state_digest') == digest):
                    self.reply(b'',303,ORIGIN+'/picker')
                    return
                if not secrets.compare_digest(incoming, STATE.get('oauth_state','')) or not incoming:
                    raise ValueError()
                STATE.pop('oauth_state')
                payload = urlencode({'client_id':STATE['client_id'], 'client_secret':STATE['client_secret'],
                    'code':q['code'][0], 'redirect_uri':ORIGIN+'/callback',
                    'grant_type':'authorization_code','code_verifier':STATE.pop('verifier')}).encode()
                req = urllib.request.Request('https://oauth2.googleapis.com/token', data=payload,
                    headers={'Content-Type':'application/x-www-form-urlencoded'})
                stage = 'TOKEN_ENDPOINT'
                with urllib.request.build_opener(NoRedirect()).open(req, timeout=30) as r:
                    raw = r.read(65537)
                if len(raw) > 65536:
                    raise ValueError()
                token = json.loads(raw)
                stage = 'SCOPE_OR_REFRESH_TOKEN'
                if (set(token.get('scope', SCOPE).split()) != {SCOPE} or
                    not token.get('refresh_token')):
                    raise ValueError()
                if token.get('refresh_token_expires_in'):
                    stage = 'TIME_LIMITED_GRANT'
                    raise ValueError('TIME_LIMITED_GRANT_NOT_LONG_TERM')
                STATE.update(access_token=token['access_token'], refresh_token=token['refresh_token'])
                STATE['completed_state_digest'] = digest
                self.reply(b'', 303, ORIGIN+'/picker')
            except Exception as exc:
                if isinstance(exc, urllib.error.HTTPError):
                    # Only fixed public OAuth error names; never echo descriptions/body.
                    try:
                        code = json.loads(exc.read(4096)).get('error')
                        if code in {'invalid_client','invalid_grant','invalid_request','access_denied','unauthorized_client'}:
                            stage = code.upper()
                    except Exception:
                        pass
                STATE['error_stage'] = stage
                self.reply(b'', 303, ORIGIN+'/error')
            return
        if parsed.path == '/error':
            self.reply(page('授權交換未完成：'+html.escape(STATE.get('error_stage','UNKNOWN'))+
                '。未顯示憑證或伺服器回應。<form method="post" action="/retry">'
                '<input type="hidden" name="csrf" value="'+CSRF+'">'
                '<button>以記憶體中相同設定重新授權</button></form>'),400)
            return
        if parsed.path == '/picker' and STATE.get('access_token'):
            # Tokens stay in this private loopback page. No media bytes are fetched.
            opts = json.dumps({k:STATE[k] for k in ('access_token','picker_key','project_number','source_file_id','destination_folder_id')})
            self.reply(page('''<p>依序只選取原 ZIP 及目標資料夾，不下載內容。</p>
<button id="source">選取原 ZIP</button><button id="folder">選取目標資料夾</button>
<button id="browse">從指定資料夾選取原 ZIP</button>
<p id="status"></p><form method="post" action="/finish"><input type="hidden" name="csrf" value="'''+CSRF+'''">
<input type="hidden" name="selected_source" id="ss"><input type="hidden" name="selected_folder" id="sf">
<button>完成並準備 GitHub environment secret</button></form>
<form method="post" action="/preserve"><input type="hidden" name="csrf" value="'''+CSRF+'''">
<button>僅保存待驗證授權，不啟用渲染</button></form>
<script>const cfg='''+opts+'''; function pick(folder,browse=false){
const view=new google.picker.DocsView().setIncludeFolders(folder).setSelectFolderEnabled(folder);
if(browse)view.setParent(cfg.destination_folder_id);else view.setFileIds(folder?cfg.destination_folder_id:cfg.source_file_id);
if(folder)view.setMimeTypes('application/vnd.google-apps.folder');
new google.picker.PickerBuilder().addView(view).setOAuthToken(cfg.access_token).setDeveloperKey(cfg.picker_key)
.setAppId(cfg.project_number).setOrigin(location.origin).setCallback(d=>{if(d.action==='picked'){
const id=d.docs[0].id; if(id!==(folder?cfg.destination_folder_id:cfg.source_file_id)){document.getElementById('status').textContent='選取不符，拒絕。';return;}
document.getElementById(folder?'sf':'ss').value=id;document.getElementById('status').textContent=folder?'資料夾已選取':'來源已選取';}}).build().setVisible(true);}
function loaded(){gapi.load('picker',()=>{document.getElementById('source').onclick=()=>pick(false);document.getElementById('folder').onclick=()=>pick(true);document.getElementById('browse').onclick=()=>pick(false,true);});}
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
        stage = 'BODY'
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if not 0 < n < 32768:
                raise ValueError()
            q = parse_qs(self.rfile.read(n).decode())
            stage = 'ORIGIN'
            if not self.safe() or self.headers.get('Origin') != ORIGIN:
                raise ValueError()
            stage = 'CSRF'
            if not secrets.compare_digest(q['csrf'][0], CSRF):
                raise ValueError()
            stage = 'FORM'
            if self.path in ('/start','/retry'):
                if self.path == '/start':
                    if q.get('production') != ['yes']:
                        raise ValueError()
                    for k in ('client_id','client_secret','picker_key','project_number','source_file_id','destination_folder_id'):
                        value = q[k][0]
                        if not value or len(value) > 4096 or any(ord(x)<32 for x in value):
                            raise ValueError()
                        STATE[k] = value
                import re
                if not STATE.get('client_secret','').startswith('GOCSPX-') or not STATE.get('picker_key','').startswith('AIza'):
                    raise ValueError()
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
            elif self.path == '/preserve':
                stage = 'PRESERVE_PENDING_GRANT'
                if not STATE.get('access_token') or not STATE.get('refresh_token'):
                    raise ValueError()
                self.config_page(pending=True)
            elif self.path == '/finish':
                if (q.get('selected_source') != [STATE['source_file_id']] or
                    q.get('selected_folder') != [STATE['destination_folder_id']]):
                    raise ValueError()
                stage = 'PICKER_GRANT_PREFLIGHT'
                if (not STATE.get('access_token') or
                    not verify_picker_access(STATE['access_token'],
                        STATE['source_file_id'], STATE['destination_folder_id'])):
                    raise ValueError()
                self.config_page()
            else:
                raise ValueError()
        except Exception:
            self.reply(page('要求遭拒絕（'+stage+'）；未輸出憑證或私人檔案資訊。'),400)


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

