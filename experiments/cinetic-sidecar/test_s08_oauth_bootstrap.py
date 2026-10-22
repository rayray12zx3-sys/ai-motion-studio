import io
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.parse import urlencode
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
    def test_complete_fictional_consent_picker_and_export_flow(self):
        form={'csrf':app.CSRF,'production':'yes','client_id':'fictional-client','client_secret':'GOCSPX-fictional','picker_key':'AIza-fictional','project_number':'123','source_file_id':'fictionalSource12345','destination_folder_id':'fictionalFolder12345'}
        self.assertEqual(self.send('/start',urlencode(form).encode())[0],303)
        token={'scope':app.SCOPE,'access_token':'fictional-access','refresh_token':'fictional-refresh'}
        with patch.object(app.urllib.request.OpenerDirector,'open',return_value=io.BytesIO(json.dumps(token).encode())):
            status,headers,_=self.send('/callback?'+urlencode({'state':app.STATE['oauth_state'],'code':'fictional-code'}))
        self.assertEqual((status,headers['Location']),(303,app.ORIGIN+'/picker'))
        status,_,body=self.send('/picker')
        self.assertEqual(status,200)
        # Google API contract: setFileIds accepts a comma-separated string, not an array.
        self.assertIn(b'.setFileIds(folder?cfg.destination_folder_id:cfg.source_file_id)',body)
        self.assertNotIn(b'fictional-refresh',body)
        bad=urlencode({'csrf':app.CSRF,'selected_source':'unapproved','selected_folder':form['destination_folder_id']}).encode()
        self.assertEqual(self.send('/finish',bad)[0],400)
        good=urlencode({'csrf':app.CSRF,'selected_source':form['source_file_id'],'selected_folder':form['destination_folder_id']}).encode()
        with patch.object(app,'verify_picker_access',return_value=True) as check:
            self.assertEqual(self.send('/finish',good)[0],200)
            check.assert_called_once_with('fictional-access', form['source_file_id'], form['destination_folder_id'])
    def test_picker_preflight_metadata_only_source_and_folder(self):
        source_id='fictionalSource12345'
        folder_id='fictionalFolder12345'
        source={'id':source_id,'mimeType':'application/zip','trashed':False,
                'size':'305622','capabilities':{'canDownload':True}}
        folder={'id':folder_id,'mimeType':'application/vnd.google-apps.folder',
                'trashed':False,'capabilities':{'canAddChildren':True},
                'permissions':[{'type':'user'}]}
        with patch.object(app.urllib.request,'build_opener') as builder:
            opener=builder.return_value
            opener.open.side_effect=[io.BytesIO(json.dumps(source).encode()),
                                     io.BytesIO(json.dumps(folder).encode())]
            self.assertTrue(app.verify_picker_access('fictional-token',source_id,folder_id))
            self.assertEqual(opener.open.call_count,2)
            for call in opener.open.call_args_list:
                req=call.args[0]
                self.assertTrue(req.full_url.startswith('https://www.googleapis.com/drive/v3/files/'))
                self.assertNotIn('alt=media',req.full_url)
                self.assertEqual(req.get_header('Authorization'),'Bearer fictional-token')

    def test_picker_preflight_denies_unreadable_source_and_public_folder(self):
        source_id='fictionalSource12345'
        folder_id='fictionalFolder12345'
        good_source={'id':source_id,'mimeType':'application/zip','trashed':False,
                     'size':'305622','capabilities':{'canDownload':True}}
        folder={'id':folder_id,'mimeType':'application/vnd.google-apps.folder',
                'trashed':False,'capabilities':{'canAddChildren':True},
                'permissions':[{'type':'anyone'}]}
        with patch.object(app.urllib.request,'build_opener') as builder:
            builder.return_value.open.side_effect=[
                io.BytesIO(json.dumps(good_source).encode()),
                io.BytesIO(json.dumps(folder).encode())]
            self.assertFalse(app.verify_picker_access('fictional-token',source_id,folder_id))
        unreadable={**good_source,'capabilities':{'canDownload':False}}
        with patch.object(app.urllib.request,'build_opener') as builder:
            builder.return_value.open.return_value=io.BytesIO(json.dumps(unreadable).encode())
            self.assertFalse(app.verify_picker_access('fictional-token',source_id,folder_id))
            self.assertEqual(builder.return_value.open.call_count,1)

    def test_finish_never_exports_grant_before_actual_drive_access(self):
        app.STATE.update(access_token='fictional-token',refresh_token='SECRET_REFRESH',
            client_id='fictional-client',client_secret='SECRET_CLIENT',
            source_file_id='fictionalSource12345',destination_folder_id='fictionalFolder12345')
        good=urlencode({'csrf':app.CSRF,'selected_source':app.STATE['source_file_id'],
                        'selected_folder':app.STATE['destination_folder_id']}).encode()
        with patch.object(app,'verify_picker_access',return_value=False) as check:
            status,_,body=self.send('/finish',good)
            self.assertEqual(status,400)
            check.assert_called_once()
        self.assertNotIn(b'SECRET_REFRESH',body)
        self.assertNotIn(b'SECRET_CLIENT',body)
        self.assertIn(b'PICKER_GRANT_PREFLIGHT',body)

    def test_rfc6749_optional_scope_accepted_when_granted_scope_unchanged(self):
        # RFC 6749 section 5.1: scope is optional when it equals the request.
        app.STATE.update(oauth_state='fictional-state', client_id='fictional-client',
                         client_secret='fictional-secret', verifier='fictional-verifier')
        token={'access_token':'fictional-access', 'token_type':'Bearer',
               'refresh_token':'fictional-refresh'}
        with patch.object(app.urllib.request.OpenerDirector, 'open',
                          return_value=io.BytesIO(json.dumps(token).encode())):
            status,headers,body=self.send('/callback?state=fictional-state&code=fictional-code')
        self.assertEqual(status,303)
        self.assertEqual(headers['Location'],app.ORIGIN+'/picker')
        self.assertEqual(app.STATE['refresh_token'],'fictional-refresh')
        self.assertNotIn(b'fictional-refresh',body)

    def test_extra_scopes_remain_refused_even_after_optional_scope_fix(self):
        app.STATE.update(oauth_state='fictional-state', client_id='fictional-client',
                         client_secret='fictional-secret', verifier='fictional-verifier')
        token={'access_token':'fictional-access','token_type':'Bearer',
               'refresh_token':'fictional-refresh',
               'scope':app.SCOPE+' https://www.googleapis.com/auth/drive'}
        with patch.object(app.urllib.request.OpenerDirector,'open',
                          return_value=io.BytesIO(json.dumps(token).encode())):
            status,headers,body=self.send('/callback?state=fictional-state&code=fictional-code')
        self.assertEqual(status,303)
        self.assertEqual(headers['Location'],app.ORIGIN+'/error')
        self.assertNotIn('refresh_token',app.STATE)
        self.assertEqual(app.STATE['error_stage'],'SCOPE_OR_REFRESH_TOKEN')

    def test_time_limited_grant_cannot_be_exported_as_long_term(self):
        app.STATE.update(oauth_state='fictional-state',client_id='fictional-client',client_secret='fictional-secret',verifier='fictional-verifier')
        token={'scope':app.SCOPE,'access_token':'fictional-access','refresh_token':'fictional-refresh','refresh_token_expires_in':604800}
        with patch.object(app.urllib.request.OpenerDirector,'open',return_value=io.BytesIO(json.dumps(token).encode())):
            self.assertEqual(self.send('/callback?state=fictional-state&code=fictional-code')[0],303)
        self.assertEqual(app.STATE['error_stage'],'TIME_LIMITED_GRANT')
        self.assertNotIn('refresh_token',app.STATE)

if __name__=='__main__':
    unittest.main()
