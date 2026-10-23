import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import s08_ephemeral_archive_gate as gate

class ArchiveGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="s08-offline-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def make_zip(self, overrides=None):
        files = {
            "manifest.json": json.dumps({
                "schema": "s08-v22r-private-cinetic-hyperframes-job-v1",
                "frames": 95, "fps": 30, "width": 540, "height": 960,
                "assets": {"layer_"+str(i)+".png":hashlib.sha256(b"synthetic").hexdigest() for i in range(20)}
            }),
            "index.html": '<div data-composition-id="demo" data-no-timeline data-duration="3.1666666667"></div>',
            "scene.js": 'window.addEventListener("hf-seek",()=>{});',
            "test_scene.cjs": "console.log('safe')",
            "test_full_seek.cjs": "console.log('safe')",
        }
        files.update({"inputs/layer_"+str(i)+".png":b"synthetic" for i in range(20)})
        files.update(overrides or {})
        path = self.root / "test.zip"
        with zipfile.ZipFile(path, "w") as z:
            for k, v in files.items():
                z.writestr(k, v)
        gate.EXPECTED_SHA256 = hashlib.sha256(path.read_bytes()).hexdigest()
        self.addCleanup(lambda: setattr(gate, "EXPECTED_SHA256",
                                         "7841ebaf03c9a376d8f80601de3fcc15dc6707efbb4771a48e80a2ca4f4b1ae3"))
        return path

    def test_valid_fixture(self):
        p = self.make_zip()
        out = self.root / "out"
        gate.verify_extract(p, out)
        self.assertTrue((out / "scene.js").is_file())
        with self.assertRaisesRegex(ValueError, "DESTINATION_EXISTS"):
            gate.verify_extract(p, out)

    def test_wrong_digest_fails_closed(self):
        p = self.make_zip()
        gate.EXPECTED_SHA256 = "0" * 64
        with self.assertRaisesRegex(ValueError, "SOURCE_SHA_MISMATCH"):
            gate.verify_extract(p, self.root / "out")

    def test_path_traversal_rejected(self):
        p = self.make_zip({"../escape.txt": "private"})
        with self.assertRaisesRegex(ValueError, "ARCHIVE_MEMBER_REJECTED"):
            gate.verify_extract(p, self.root / "out")
        self.assertFalse((self.root / "escape.txt").exists())

    def test_missing_composition_metadata_rejected(self):
        p = self.make_zip({"index.html": "<html></html>"})
        with self.assertRaisesRegex(ValueError, "SCENE_CONTRACT_INVALID"):
            gate.verify_extract(p, self.root / "out")

    def test_source_asset_digest_rejected(self):
        p = self.make_zip({"manifest.json": json.dumps({
            "schema": "s08-v22r-private-cinetic-hyperframes-job-v1",
            "frames": 95, "fps": 30, "width": 540, "height": 960,
            "assets": {"layer_"+str(i)+".png":"0"*64 for i in range(20)}
        })})
        with self.assertRaisesRegex(ValueError, "ASSET_DIGEST_INVALID"):
            gate.verify_extract(p, self.root / "out")

    def test_missing_assets_rejected(self):
        p = self.make_zip({"manifest.json":json.dumps({
            "schema":"s08-v22r-private-cinetic-hyperframes-job-v1",
            "frames":95,"fps":30,"width":540,"height":960,"assets":{}})})
        with self.assertRaisesRegex(ValueError, "ASSET_COUNT_INVALID"):
            gate.verify_extract(p, self.root / "out")

    def test_symlink_rejected_before_extraction(self):
        p = self.make_zip()
        with zipfile.ZipFile(p, "a") as z:
            i=zipfile.ZipInfo("inputs/link.png")
            i.create_system=3
            i.external_attr=(0o120777 << 16)
            z.writestr(i, "../../escape")
        gate.EXPECTED_SHA256=hashlib.sha256(p.read_bytes()).hexdigest()
        with self.assertRaisesRegex(ValueError, "ARCHIVE_SYMLINK_REJECTED"):
            gate.verify_extract(p, self.root / "out")

if __name__ == "__main__":
    unittest.main()
