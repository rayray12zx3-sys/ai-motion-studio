import io
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from email.parser import BytesParser
import s08_oauth_bootstrap as app

class Wire:
    def __init__(self, request):
        self.input=io.BytesIO(request)
        self.output=bytearray()
    def makefile(self,*args):
        return self.input
    def sendall(self,data):
        self.output.extend(data)

class BootstrapBoundaryTests(unittest.TestCase):
    def setUp(self):
        app.STATE.clear()
    def send(self,path='/',payload=None,host='localhost:8765',origin=app.ORIGIN):
        method='POST' if payload is not None else 'GET'
        data=(f'{method} {path} HTTP/1.1\r\nHost: {host}\r\nOrigin: {origin}\r\nConnection: close\r\nContent-Length: {len(payload or b"")}\r\n\r\n').encode()+(payload or b'')
        wire=Wire(data)
        app.Handler(wire,('127.0.0.1',1),object())
        raw=bytes(wire.output)
        head,body=raw.split(b'\r\n\r\n',1)
        status=int(head.split(b' ',2)[1])
        headers=BytesParser().parsebytes(head.split(b'\r\n',1)[1])
        return status,headers,body
    def test_dns_rebinding_host_refused(self):
        self.assertEqual(self.send(host='attacker.invalid')[0],403)
    def test_cross_origin_post_refused(self):
        self.assertEqual(self.send('/start',b'csrf='+app.CSRF.encode(),origin='https://attacker.invalid')[0],400)
    def test_invalid_csrf_refused(self):
        self.assertEqual(self.send('/start',b'csrf=wrong')[0],400)
    def test_callback_errors_do_not_echo_private_query(self):
        status,headers,body=self.send('/callback?state=wrong&code=PRIVATE_FAKE_CODE')
        self.assertEqual(status,303)
        self.assertEqual(headers['Location'],app.ORIGIN+'/error')
        self.assertNotIn(b'PRIVATE_FAKE_CODE',body)
    def test_initial_page_no_store_and_no_credentials(self):
        status,headers,body=self.send()
        self.assertEqual(status,200)
        self.assertEqual(headers['Cache-Control'],'no-store')
        self.assertIn("frame-ancestors 'none'",headers['Content-Security-Policy'])
        self.assertNotIn(b'refresh_token',body)
    def test_oauth_error_keeps_only_allowlisted_code(self):
        app.STATE.update(oauth_state='fictional-state',client_id='fictional-client',client_secret='fictional-secret',verifier='fictional-verifier')
        error=HTTPError('https://oauth2.googleapis.com/token',400,'error',{},io.BytesIO(b'{"error":"invalid_client","error_description":"PRIVATE_FAKE_CREDENTIAL"}'))
        with patch.object(app.urllib.request.OpenerDirector,'open',side_effect=error):
            status,headers,body=self.send('/callback?state=fictional-state&code=PRIVATE_FAKE_CODE')
        self.assertEqual(status,303)
        self.assertEqual(app.STATE['error_stage'],'INVALID_CLIENT')
        status,_,body=self.send('/error')
        self.assertIn(b'INVALID_CLIENT',body)
        self.assertNotIn(b'PRIVATE_FAKE',body)
        self.assertNotIn(b'fictional-secret',body)
    def test_retry_rotates_pkce_without_echoing_credentials(self):
        app.STATE.update(client_id='fictional-client',client_secret='GOCSPX-fictional',picker_key='AIza-fictional',source_file_id='fictionalSource12345',destination_folder_id='fictionalFolder12345',oauth_state='old-state',verifier='old-verifier')
        status,headers,body=self.send('/retry',('csrf='+app.CSRF).encode())
        self.assertEqual(status,303)
        self.assertNotEqual(app.STATE['oauth_state'],'old-state')
        self.assertNotEqual(app.STATE['verifier'],'old-verifier')
        self.assertNotIn('GOCSPX-',headers['Location'])
        self.assertNotIn(b'GOCSPX-',body)

if __name__=='__main__':
    unittest.main()
