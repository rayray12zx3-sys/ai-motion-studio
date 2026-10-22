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
        obj = {"access_token": "dummy-do-not-print",
               "source_file_id": "A" * 25,
               "destination_folder_id": "B" * 25}
        with patch.dict(os.environ, {"S08_DRIVE_CONFIG_JSON": json.dumps(obj)}):
            token, source, target = drive.config()
            self.assertEqual(token, obj["access_token"])
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
             patch.object(drive, "request", return_value=b"INVALID_ZIP_BYTES"):
            out = self.root / "sensitive.zip"
            with self.assertRaisesRegex(drive.TransferFailure, "SOURCE_ARCHIVE_DIGEST_FAILED"):
                drive.pull(out)
            self.assertFalse(out.exists())

if __name__ == "__main__":
    unittest.main()
