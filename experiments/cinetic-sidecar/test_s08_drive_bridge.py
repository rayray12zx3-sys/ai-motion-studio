import contextlib
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.request

import s08_drive_bridge as drive

class DriveBridgeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def test_empty_secret_fails_without_echoing_any_data(self):
        with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": ""}):
            with self.assertRaisesRegex(drive.TransferFailure, "MISSING_OR_INVALID"):
                drive.config()

    def test_structural_oauth_credential_parsing(self):
        obj = {"auth_mode": "oauth_refresh", "scope": drive.SCOPE,
               "publishing_status": "production", "client_id": "dummy.apps.googleusercontent.com",
               "client_secret": "dummy-secret", "refresh_token": "dummy-refresh",
               "source_file_id": "A" * 25,
               "destination_folder_id": "B" * 25}
        with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": json.dumps(obj)}), patch.object(drive, "refresh", return_value="dummy-access"):
            token, source, target = drive.config()
            self.assertEqual(token, "dummy-access")
            self.assertEqual(source, obj["source_file_id"])
            self.assertEqual(target, obj["destination_folder_id"])

    def test_short_or_untrusted_drive_ids_rejected(self):
        obj = {"access_token": "dummy",
               "source_file_id": "../../etc/passwd",
               "destination_folder_id": "B" * 25}
        with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": json.dumps(obj)}):
            with self.assertRaisesRegex(drive.TransferFailure, "MISSING_OR_INVALID"):
                drive.config()

    def test_untrusted_api_host_denied_before_network(self):
        with self.assertRaisesRegex(drive.TransferFailure, "UNTRUSTED_DRIVE_ENDPOINT"):
            drive.request("https://malicious.invalid/hook", "dummy-secret")

    def test_oauth_header_never_follows_redirect(self):
        old = urllib.request.Request("https://www.googleapis.com/drive/v3/files",
                                     headers={"Authorization": "Bearer secret-value"})
        r = drive.NoRedirect()
        with self.assertRaisesRegex(drive.TransferFailure, "UNTRUSTED_DOWNLOAD_REDIRECT"):
            r.redirect_request(old, None, 302, "redirect", {},
                               "https://attacker.invalid/file")
        target = r.redirect_request(old, None, 302, "redirect", {},
                  "https://abc.googleusercontent.com/temporary-object")
        self.assertNotIn("authorization", {k.lower() for k in target.headers})

    def test_bad_archive_never_written_even_with_authorized_config(self):
        with patch.object(drive, "config", return_value=("dummy", "A" * 25, "B" * 25)), \
             patch.object(drive, "validate_folder"), \
             patch.object(drive, "request", return_value=b"INVALID_ZIP_BYTES"):
            out = self.root / "sensitive.zip"
            with self.assertRaisesRegex(drive.TransferFailure, "SOURCE_ARCHIVE_DIGEST_FAILED"):
                drive.pull(out)
            self.assertFalse(out.exists())

    def test_legacy_access_token_and_testing_config_refused(self):
        for extra in ({"access_token": "dummy"}, {"auth_mode": "oauth_refresh", "scope": drive.SCOPE, "publishing_status": "testing"}):
            with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": json.dumps({**extra,
                "source_file_id": "A" * 25, "destination_folder_id": "B" * 25})}), patch.object(drive, "refresh") as refresh:
                with self.assertRaises(drive.TransferFailure):
                    drive.config()
                refresh.assert_not_called()

    def test_refresh_redirect_fails_closed(self):
        with self.assertRaisesRegex(drive.TransferFailure, "OAUTH_REDIRECT_REJECTED"):
            drive.RejectRedirect().redirect_request(None, None, 302, "", {}, "https://attacker.invalid")

    def test_refresh_error_never_includes_server_body(self):
        with patch.object(urllib.request, "build_opener", side_effect=ValueError("private secret response")):
            with self.assertRaisesRegex(drive.TransferFailure, "^OAUTH_REFRESH_FAILED_REAUTHORIZE_NO_DETAILS_LOGGED$"):
                drive.refresh({"client_id":"dummy", "client_secret":"dummy", "refresh_token":"dummy"})

    def test_refresh_grant_fixed_endpoint_and_exact_scope(self):
        cfg={"client_id":"dummy", "client_secret":"dummy", "refresh_token":"dummy"}
        obj={"access_token":"synthetic-access","token_type":"Bearer","expires_in":3600,"scope":drive.SCOPE}
        with patch.object(urllib.request,"build_opener") as factory:
            factory.return_value.open.return_value=io.BytesIO(json.dumps(obj).encode())
            self.assertEqual(drive.refresh(cfg),'synthetic-access')
            req=factory.return_value.open.call_args.args[0]
            self.assertEqual(req.full_url,'https://oauth2.googleapis.com/token')
        obj['scope']=drive.SCOPE+' https://www.googleapis.com/auth/drive'
        with patch.object(urllib.request,"build_opener") as factory:
            factory.return_value.open.return_value=io.BytesIO(json.dumps(obj).encode())
            with self.assertRaisesRegex(drive.TransferFailure,'OAUTH_REFRESH_FAILED'):
                drive.refresh(cfg)

    def test_public_or_shared_link_folder_refused(self):
        for kind in ("anyone", "domain", "group"):
            obj = {"id": "B" * 25, "mimeType":"application/vnd.google-apps.folder", "trashed": False,
                "capabilities":{"canAddChildren":True}, "permissions":[{"type":kind}]}
            with patch.object(drive, "request", return_value=json.dumps(obj).encode()):
                with self.assertRaisesRegex(drive.TransferFailure, "PRIVATE_DESTINATION_VALIDATION_FAILED"):
                    drive.validate_folder("dummy", "B" * 25)

    def test_readback_mismatch_is_not_success(self):
        f = self.root / "video.mp4"
        f.write_bytes(b"synthetic")
        with patch.object(drive, "request", side_effect=[json.dumps({"id":"C"*25}).encode(), b"different"]):
            with self.assertRaisesRegex(drive.TransferFailure, "DRIVE_UPLOAD_READBACK_SHA_MISMATCH"):
                drive.upload_one("dummy", "B"*25, f, "synthetic.mp4", "video/mp4")

if __name__ == "__main__":
    unittest.main()
