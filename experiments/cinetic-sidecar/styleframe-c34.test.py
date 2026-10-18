"""C3.4 art-first contract tests for actual editable SVG scenes."""
import importlib.util
import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("styleframe_c34",ROOT/"styleframe-c34.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SVG="{http://www.w3.org/2000/svg}"

class SceneGate(unittest.TestCase):
    def test_not_three_fixed_ppt_pages(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp)/"c34"
            r=module.generate(folder)
            self.assertEqual(r["safety"]["humanArtApproval"],"PENDING")
            self.assertEqual(r["safety"]["film"],"NOT_RENDERED")
            views=[]
            anchors=[]
            for i in range(1,4):
                s=(folder/("styleframe-%02d.svg"%i)).read_text(encoding="utf-8")
                tree=ET.fromstring(s)
                self.assertEqual(tree.attrib["viewBox"],"0 0 1280 720")
                self.assertEqual(len(tree.findall('.//*[@data-scene-title="true"]')),2,
                                 "each chapter title must be split and attached to different scene objects")
                words=[(g.attrib.get("transform"),(g.find(SVG+"text").text or ""))
                       for g in tree.findall('.//*[@data-scene-title="true"]')]
                self.assertEqual("".join(w[1] for w in words),r["frames"][i-1]["title"])
                anchors.append([x[0] for x in words])
                self.assertNotIn('width="535" height="720" fill="#0c1b25"',s)
                self.assertNotIn('02  /  EDITING',s)
                self.assertNotIn('00:00',s)
                self.assertNotIn("https://",s)
                self.assertNotIn("<image",s)
                self.assertNotIn("<script",s)
                self.assertNotIn("href=",s)
                views.append(s)
            self.assertEqual(len(set(views)),3)
            self.assertEqual(len(set(tuple(a) for a in anchors)),3)
            self.assertIn('rotate(-20)',views[1], "real diagonal-film shot rotations required")
            self.assertIn('stroke="#d5b8a9"',views[2], "scene-specific impact shape required")
            self.assertIn('stroke-width="18"',views[2], "foreground occlusion required")
            self.assertEqual(len(list(folder.glob("styleframe-*.svg"))),3)
            self.assertEqual(json.loads((folder/"styleframes-manifest.json").read_text())["gate"],
                             r["gate"])
            with self.assertRaises(ValueError):
                module.generate(folder)

if __name__=="__main__":
    unittest.main()
