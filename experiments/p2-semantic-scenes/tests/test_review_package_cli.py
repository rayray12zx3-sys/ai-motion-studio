"""Preflight of the optional one-command local review path (no models or media)."""
import subprocess
import sys
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "render_video.py"

class ReviewPackagePreflight(unittest.TestCase):
    def test_smoke_is_not_a_full_film_review(self):
        p = subprocess.run(
            [sys.executable, str(SCRIPT), "board", "--smoke-frames", "12", "--review-package"],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("complete film", p.stderr)

    def test_missing_authorized_spec_is_not_accepted_as_review(self):
        p = subprocess.run([sys.executable, str(SCRIPT), "--review-package"],
                           text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
        self.assertNotEqual(p.returncode, 0)
        self.assertIn("exactly one of board, caption or --spec", p.stderr)

if __name__ == "__main__":
    unittest.main()
