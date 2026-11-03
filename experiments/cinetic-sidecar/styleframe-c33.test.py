"""Isolated C3.3 styleframe-generation contract; only original synthetic text/art."""
import importlib.util
import json
import re
import tempfile
import unittest
from pathlib import Path

MODULE = Path(__file__).with_name("styleframe-c33.py")
spec = importlib.util.spec_from_file_location("styleframe_c33", MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class StyleframeGate(unittest.TestCase):
    def test_source_outputs_three_distinct_story_looks(self):
        with tempfile.TemporaryDirectory() as temp:
            target = Path(temp)/"frames"
            report = mod.generate(target)
            self.assertEqual(len(report["frames"]),3)
            self.assertEqual(report["user_art_approval"],"PENDING")
            self.assertEqual(report["production_adoption"],"NO")
            self.assertEqual(report["premiere"],"NOT_TESTED")
            files=sorted(target.glob("styleframe-*.svg"))
            self.assertEqual([p.name for p in files],["styleframe-01.svg","styleframe-02.svg","styleframe-03.svg"])
            texts=[p.read_text(encoding="utf-8") for p in files]
            self.assertEqual(len(set(texts)),3)
            for idx,s in enumerate(texts):
                self.assertIn('viewBox="0 0 1280 720"',s)
                self.assertIn(report["frames"][idx]["title"],s)
                self.assertNotIn("<script",s)
                self.assertNotIn("<image",s)
                self.assertNotIn("href=",s)
                self.assertNotIn("https://",s)
                self.assertNotIn("url(http",s)
            self.assertIn("filmstrip",report["frames"][1]["intent"])
            self.assertIn("drop",report["frames"][2]["intent"])
            self.assertEqual(json.loads((target/"styleframes-manifest.json").read_text())["status"],report["status"])
            with self.assertRaises(ValueError):
                mod.generate(target)

if __name__=="__main__":
    unittest.main()
