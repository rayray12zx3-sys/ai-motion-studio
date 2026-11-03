import json
import unittest
from unittest.mock import patch

import s08_v22u_archive_gate as gate
import s08_v22u_stage as staging
import s08_v22u_bridge as bridge
import s08_drive_bridge as private_bridge

class V22sIsolationTests(unittest.TestCase):
    def test_exact_immutable_candidate_hash(self):
        self.assertEqual(gate.EXPECTED_SHA256,
            "1bb6278ccca698dbcb7a656257822865c909abac0f477dcff7c817c806c6cfb0")
        self.assertNotEqual(gate.EXPECTED_SHA256,
            __import__('s08_ephemeral_archive_gate').EXPECTED_SHA256)

    def test_revision_has_separate_private_input(self):
        self.assertNotEqual(staging.NEW_NAME,
            "S08_HF95_APP_OWNED_INPUT_PENDING_20261022.zip")
        self.assertEqual(bridge.NEW_NAME,staging.NEW_NAME)
        self.assertNotEqual(bridge.stage.INPUT_NAME,bridge.NEW_NAME)

    def test_correct_staged_source_is_required(self):
        with patch.object(bridge, "verified_ready", return_value={
            "auth_mode":"oauth_refresh","scope":private_bridge.SCOPE,"publishing_status":"production",
            "client_id":"fictional.apps.googleusercontent.com","client_secret":"fictional",
            "refresh_token":"fictional","source_file_id":"S"*25,"destination_folder_id":"D"*25}):
            with (patch.object(private_bridge,"config",return_value=("fictional-access","S"*25,"D"*25)),
                  patch.object(private_bridge,"validate_folder"),
                  patch.object(private_bridge,"request",return_value=b"WRONG_SOURCE_ZIP")):
                with self.assertRaisesRegex(private_bridge.TransferFailure,"V22U_ARCHIVE_SHA_MISMATCH"):
                    bridge.run("pull",["/tmp/fictional_uncreated_v22u.zip"])

    def test_render_only_prepared_isolated_candidate(self):
        with patch.object(bridge,"verified_ready",return_value={}):
            with self.assertRaisesRegex(private_bridge.TransferFailure,"USAGE"):
                bridge.run("unknown",[])

if __name__=="__main__":
    unittest.main()
