"""Source-safe original motion specimen contract (no private external assets)."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from PIL import ImageFont

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("learning_ui_motion",ROOT/"learning-ui-motion.py")
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class UICompositionTest(unittest.TestCase):
    def setUp(self):
        import subprocess
        self.font=subprocess.check_output(["fc-match","-f","%{file}","Noto Sans CJK TC"],text=True).strip()
        self.fonts={k:ImageFont.truetype(self.font,n) for k,n in
                    {"sm":13,"en":24,"cn":29,"big":62,"title":39}.items()}

    def test_precise_vertical_script_contract(self):
        self.assertEqual((mod.W,mod.H,mod.FPS,mod.N),(540,960,30,95))
        self.assertAlmostEqual(mod.N/mod.FPS,3.1666666666666665)
        self.assertEqual((mod.UI[2]-mod.UI[0],mod.UI[3]-mod.UI[1]),(330,742))

    def test_source_ui_pixels_never_occluded_even_during_fx(self):
        for f in (0,12,28,29,35,45,54,57,65,84,94):
            with self.subTest(frame=f):
                source=mod.render_ui(f,self.fonts)
                frame,overlay=mod.compose(f,self.fonts)
                self.assertEqual(frame.size,(540,960))
                self.assertEqual(source.tobytes(),frame.crop(mod.UI).convert("RGB").tobytes())
                self.assertIsNone(overlay.getchannel("A").crop(mod.UI).getbbox())

    def test_synthetic_ui_changing_state_is_visible_with_no_real_claim(self):
        original=mod.render_ui(0,self.fonts)
        selected=mod.render_ui(45,self.fonts)
        correct=mod.render_ui(65,self.fonts)
        self.assertNotEqual(original.tobytes(),selected.tobytes())
        self.assertNotEqual(selected.tobytes(),correct.tobytes())
        self.assertIsNotNone(mod.overlay(45).getchannel("A").getbbox())
        self.assertIsNotNone(mod.overlay(70).getchannel("A").getbbox())

    def test_no_source_import_in_public_code(self):
        source=(ROOT/"learning-ui-motion.py").read_text(encoding="utf-8")
        self.assertNotIn("drive.google.com",source)
        self.assertNotIn("VocabKnow",source)
        self.assertNotIn("PixVerse",source)
        self.assertNotIn("國際頂尖期刊",source)

if __name__=="__main__":
    unittest.main()
