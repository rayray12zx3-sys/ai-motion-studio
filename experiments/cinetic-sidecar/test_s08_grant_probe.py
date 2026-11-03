import contextlib
import io
import json
import unittest
from unittest.mock import patch
import s08_grant_probe as app


class GrantProbeTests(unittest.TestCase):
    def run_probe(self, config, fail=False):
        out=io.StringIO()
        with patch.dict(app.os.environ,{'S08_DRIVE_CONFIG_JSON':json.dumps(config)}), patch.object(app.bridge,'config',return_value=('FAKE_PRIVATE_TOKEN','fictionalSource12345','fictionalFolder12345')), patch.object(app.bridge,'validate_folder'), patch.object(app.bridge,'request') as request,contextlib.redirect_stdout(out):
            if fail:
                request.side_effect=RuntimeError('FAKE_PRIVATE_TOKEN private-id')
            else:
                request.return_value=json.dumps({'id':'fictionalSource12345','mimeType':'application/zip','trashed':False,'size':'305622','capabilities':{'canDownload':True}}).encode()
            result=app.probe()
        return result,out.getvalue(),request.call_args_list
    def test_metadata_only_no_media_or_upload_and_no_secret_output(self):
        result,out,calls=self.run_probe({'status':'PENDING_FILE_GRANT','protected_oauth_config':{}})
        self.assertEqual(result,0)
        self.assertIn('OAUTH_REFRESH_PASS',out)
        self.assertNotIn('FAKE_PRIVATE_TOKEN',out)
        self.assertEqual(len(calls),1)
        self.assertIn('?fields=',calls[0].args[0])
        self.assertNotIn('alt=media',calls[0].args[0])
        self.assertNotIn('payload',calls[0].kwargs)
    def test_private_errors_are_not_echoed(self):
        result,out,_=self.run_probe({'status':'PENDING_FILE_GRANT','protected_oauth_config':{}},True)
        self.assertEqual(result,3)
        self.assertNotIn('FAKE_PRIVATE_TOKEN',out)
        self.assertNotIn('private-id',out)
    def test_non_pending_config_is_refused_before_network(self):
        result,out,calls=self.run_probe({'status':'OTHER'})
        self.assertEqual(result,2)
        self.assertEqual(calls,[])

if __name__=='__main__':
    unittest.main()
