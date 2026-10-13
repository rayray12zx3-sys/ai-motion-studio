"""Only synthetic/private-path tests. No BOOTH bytes, receipts or client footage."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "private_media_overlay.py"
module_spec = importlib.util.spec_from_file_location("p2_private_media", SCRIPT)
mod = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(mod)


def meta(codec="h264", dims=(1080, 1920), pix="yuv420p", frames="90"):
    return {"streams": [{
        "codec_type": "video", "codec_name": codec,
        "width": dims[0], "height": dims[1],
        "pix_fmt": pix, "avg_frame_rate": "30/1",
        "nb_read_frames": frames,
    }]}


class PrivateMediaTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.local = Path(self.tmp.name)
        self.base = self.local / "original.mp4"
        self.asset = self.local / "authorized.png"
        self.base.write_bytes(b"synthetic-base")
        self.asset.write_bytes(b"synthetic-png")
        self.out = mod.PRIVATE / "tests" / "never-publish.mp4"

    def preflight(self, mode="alpha", **kwargs):
        base = kwargs.get("base", self.base)
        asset = kwargs.get("asset", self.asset)
        output = kwargs.get("output", self.out)
        start = kwargs.get("start", 10)
        end = kwargs.get("end", 40)
        opacity = kwargs.get("opacity", 0.5)
        with patch.object(mod, "probe", side_effect=[
            meta(), meta("png", pix="rgba")]):
            return mod.preflight(base, asset, output, mode, start, end, opacity)

    def test_valid_private_png_without_ae(self):
        plan = self.preflight()
        self.assertEqual(plan["frames"], 90)
        self.assertEqual(plan["mode"], "alpha")
        self.assertEqual(plan["end"], 40)
        self.assertEqual(plan["output"], self.out)
        self.assertIn("overlay=0:0", mod.filters(plan))
        self.assertIn("colorchannelmixer=aa=0.500000", mod.filters(plan))

    def test_synthetic_screen_mp4_uses_rgb_and_timing(self):
        self.asset = self.local / "fake-overlay.mp4"
        self.asset.write_bytes(b"synthetic-video")
        with patch.object(mod, "probe", side_effect=[meta(), meta()]):
            plan = mod.preflight(self.base, self.asset, self.out, "screen", 15, 60, .6)
        filt = mod.filters(plan)
        self.assertIn("format=gbrp", filt)
        self.assertIn("blend=all_expr=", filt)
        self.assertIn("between(T,0.500000,1.966667)", filt)
        self.assertIn("0.600000", filt)

    def test_fail_closed_media_format_and_output_scope(self):
        for ext in ("ffx", "gif", "aep", "exe"):
            forbidden = self.local / ("asset." + ext)
            forbidden.write_bytes(b"synthetic")
            with self.assertRaises(ValueError):
                self.preflight(asset=forbidden)
        with self.assertRaises(ValueError):
            self.preflight(output=self.local / "world-readable.mp4")
        with self.assertRaises(ValueError):
            self.preflight(output=self.base)
        with self.assertRaises(ValueError):
            self.preflight(asset="https://vendor.example/license.mp4")

    def test_fail_closed_timings_and_opacity(self):
        for start, end, opacity in [(20, 20, .5), (20, 91, .5),
                                    (-1, 20, .5), (1, 30, float("nan")),
                                    (1, 30, 0), (1, 30, 1.1)]:
            with self.assertRaises(ValueError):
                self.preflight(start=start, end=end, opacity=opacity)

    def test_alpha_black_background_without_real_alpha_rejected(self):
        with patch.object(mod, "probe", side_effect=[
            meta(), meta("png", pix="rgb24")]):
            with self.assertRaises(ValueError):
                mod.preflight(self.base, self.asset, self.out, "alpha", 10, 40, .5)

    def test_immutable_film_profile_requires_full_probed_frame_count(self):
        with patch.object(mod, "probe", return_value=meta(frames="0")):
            with self.assertRaises(ValueError):
                mod.preflight(self.base, self.asset, self.out, "alpha", 10, 40, .5)


if __name__ == "__main__":
    unittest.main()
