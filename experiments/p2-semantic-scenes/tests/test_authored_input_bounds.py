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

if __name__ == "__main__":
    unittest.main()
