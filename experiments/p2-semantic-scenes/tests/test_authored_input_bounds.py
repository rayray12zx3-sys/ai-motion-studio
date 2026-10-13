import importlib.util
import tempfile
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "scripts" / "private_authored_icon_convert.py"
spec = importlib.util.spec_from_file_location("private_icons", SOURCE)
icons = importlib.util.module_from_spec(spec)
spec.loader.exec_module(icons)

class AuthoredInputTests(unittest.TestCase):
    def test_sequence_uses_numeric_order(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            for n in [11, 9, 10]:
                (directory / ("sample_%05d.png" % n)).write_bytes(b"test")
            names = [p.name for p in icons.sources("png-sequence", directory)]
            self.assertEqual(names, ["sample_00009.png","sample_00010.png","sample_00011.png"])

    def test_sequence_refuses_missing_numbers(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            for n in [9, 11]:
                (directory / ("sample_%05d.png" % n)).write_bytes(b"test")
            with self.assertRaises(ValueError):
                icons.sources("png-sequence", directory)

    def test_ae_preset_is_not_authored_gif(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "sample.ffx"
            candidate.write_bytes(b"test")
            with self.assertRaises(ValueError):
                icons.sources("gif", candidate)


    def test_gif_durations_that_exceed_output_frame_cap_are_rejected(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "authored.gif"
            path.write_bytes(b"synthetic-only")
            metadata = {"streams":[{"codec_type":"video", "codec_name":"gif",
                                    "width":100, "height":100, "nb_read_frames":"100"}],
                        "format":{"duration":"11.0"}}
            with patch.object(icons, "inspect", return_value=metadata):
                with self.assertRaisesRegex(ValueError, "silent truncation"):
                    icons.validate("gif", path, icons.PRIVATE / "test" / "candidate.mov")

if __name__ == "__main__":
    unittest.main()
