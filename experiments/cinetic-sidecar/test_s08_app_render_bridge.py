import io
import json
import os
import unittest
from unittest.mock import patch

import s08_app_render_bridge as runner
import s08_app_owned_stage as stage
import s08_drive_bridge as bridge


class StagedRenderBridgeTests(unittest.TestCase):
    def setUp(self):
        self.cfg={
            "auth_mode":"oauth_refresh","scope":bridge.SCOPE,"publishing_status":"production",
            "client_id":"fictional.apps.googleusercontent.com",
            "client_secret":"SECRET_FICTIONAL",
            "refresh_token":"SECRET_FICTIONAL",
            "source_file_id":"O"*25,"destination_folder_id":"T"*25
        }
        self.source="S"*25
        self.folder="F"*25
        self.source_obj={"id":self.source, "name":stage.INPUT_NAME,
            "mimeType":stage.INPUT_TYPE, "trashed":False, "size":"305622",
            "parents":[self.folder],"capabilities":{"canDownload":True}}
        self.folder_obj={"id":self.folder, "name":stage.OUTPUT_NAME,
            "mimeType":stage.FOLDER_TYPE, "trashed":False,
            "parents":[self.cfg["destination_folder_id"]],
            "capabilities":{"canAddChildren":True},
            "permissions":[{"type":"user"}]}

    def stage(self,source=None,folder=None):
        with (patch.object(stage,"pending_config",return_value=self.cfg),
              patch.object(bridge,"refresh",return_value="fictional-access"),
              patch.object(stage,"exact_app_created",side_effect=[self.source,self.folder]),
              patch.object(bridge,"request",side_effect=[
                  json.dumps(source or self.source_obj).encode(),
                  json.dumps(folder or self.folder_obj).encode()])):
            return runner.stage_ready_config()

    def test_stage_ready_does_not_change_protected_pending_secret(self):
        with patch.dict(os.environ,{"S08_DRIVE_CONFIG_JSON":"HIDDEN_PENDING_SECRET"}):
            config=self.stage()
            self.assertEqual(config["source_file_id"],self.source)
            self.assertEqual(config["destination_folder_id"],self.folder)
            self.assertEqual(os.environ["S08_DRIVE_CONFIG_JSON"],"HIDDEN_PENDING_SECRET")
            self.assertEqual(self.cfg["source_file_id"],"O"*25)

    def test_source_not_in_owned_folder_denied(self):
        data={**self.source_obj,"parents":["O"*25]}
        with self.assertRaisesRegex(bridge.TransferFailure,"PRIVATE_STAGING_ACCESS_OR_PARENT_INVALID"):
            self.stage(source=data)

    def test_folder_not_inside_private_destination_denied(self):
        data={**self.folder_obj,"parents":["D"*25]}
        with self.assertRaisesRegex(bridge.TransferFailure,"PRIVATE_STAGING_ACCESS_OR_PARENT_INVALID"):
            self.stage(folder=data)

    def test_public_access_to_output_denied(self):
        data={**self.folder_obj,"permissions":[{"type":"anyone"}]}
        with self.assertRaisesRegex(bridge.TransferFailure,"PRIVATE_STAGING_ACCESS_OR_PARENT_INVALID"):
            self.stage(folder=data)

    def test_unexpected_source_size_denied_before_media_download(self):
        data={**self.source_obj,"size":"1"}
        with self.assertRaisesRegex(bridge.TransferFailure,"PRIVATE_STAGING_ACCESS_OR_PARENT_INVALID"):
            self.stage(source=data)

    def test_probe_reads_metadata_without_modifying_secret_or_media(self):
        with patch.object(runner,"stage_ready_config",return_value=self.cfg),patch.object(bridge,"pull") as pull,patch.object(bridge,"push") as push:
            from contextlib import redirect_stdout
            stream=io.StringIO()
            with redirect_stdout(stream):
                runner.command("probe",[])
            pull.assert_not_called()
            push.assert_not_called()
            self.assertEqual(stream.getvalue().strip(),"APP_OWNED_STAGING_METADATA_PASS")

    def test_pending_config_is_required(self):
        with patch.dict(os.environ,{"S08_DRIVE_CONFIG_JSON":json.dumps(self.cfg)}):
            with self.assertRaisesRegex(bridge.TransferFailure,"PENDING_GRANT_REQUIRED"):
                stage.pending_config()


if __name__ == "__main__":
    unittest.main()
