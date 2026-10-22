import contextlib
import io
import json
import os
import unittest
from unittest.mock import patch

import s08_app_owned_stage as stage
import s08_drive_bridge as bridge


class PrivateStagingTests(unittest.TestCase):
    def test_never_uses_regular_ready_config(self):
        with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": json.dumps({
            "auth_mode":"oauth_refresh", "scope":bridge.SCOPE})}):
            with self.assertRaisesRegex(bridge.TransferFailure,"PENDING_GRANT_REQUIRED"):
                stage.pending_config()

    def test_only_private_app_created_placeholders_and_no_user_bytes(self):
        payloads = []
        def request(url, token, **kw):
            payloads.append((url,kw.get("payload")))
            if "files?fields=id,name,mimeType" in url:
                data=json.loads(kw["payload"])
                return json.dumps({"id":"A"*30, **data}).encode()
            return json.dumps({"files":[]}).encode()
        with patch.object(bridge,"request",side_effect=request):
            source=stage.prepare_one("fictional-access",stage.INPUT_NAME,stage.INPUT_TYPE)
        self.assertEqual(source,"A"*30)
        self.assertEqual(len(payloads),2)
        self.assertIsNone(payloads[0][1])
        created=json.loads(payloads[1][1])
        self.assertEqual(created,{"name":stage.INPUT_NAME,"mimeType":stage.INPUT_TYPE})
        self.assertNotIn("parents",created)
        self.assertNotIn("content",created)

    def test_duplicate_is_fail_closed(self):
        files={"files":[{"id":"A"*25,"name":stage.INPUT_NAME,"mimeType":stage.INPUT_TYPE,"trashed":False},
                        {"id":"B"*25,"name":stage.INPUT_NAME,"mimeType":stage.INPUT_TYPE,"trashed":False}]}
        with patch.object(bridge,"request",return_value=json.dumps(files).encode()):
            with self.assertRaisesRegex(bridge.TransferFailure,"STAGING_DUPLICATE_REJECTED"):
                stage.exact_app_created("fictional-token",stage.INPUT_NAME,stage.INPUT_TYPE)

    def test_staging_never_logs_ids_or_grant(self):
        cfg={"client_id":"fictional.apps.googleusercontent.com","client_secret":"SECRET",
             "refresh_token":"SECRET"}
        source,folder="A"*25,"B"*25
        source_obj={"id":source,"mimeType":stage.INPUT_TYPE,"trashed":False,"size":"0",
                    "capabilities":{"canDownload":True}}
        folder_obj={"id":folder,"mimeType":stage.FOLDER_TYPE,"trashed":False,
                    "capabilities":{"canAddChildren":True}}
        out=io.StringIO()
        with (patch.object(stage,"pending_config",return_value=cfg),
              patch.object(bridge,"refresh",return_value="fictional-access"),
              patch.object(stage,"prepare_one",side_effect=[source,folder]),
              patch.object(bridge,"request",side_effect=[
                    json.dumps(source_obj).encode(),json.dumps(folder_obj).encode()]),
              contextlib.redirect_stdout(out)):
            stage.stage()
        result=out.getvalue()
        self.assertIn("STAGING_CREATED_AND_ACCESS_VERIFIED",result)
        self.assertNotIn(source,result)
        self.assertNotIn(folder,result)
        self.assertNotIn("SECRET",result)

if __name__ == "__main__":
    unittest.main()
