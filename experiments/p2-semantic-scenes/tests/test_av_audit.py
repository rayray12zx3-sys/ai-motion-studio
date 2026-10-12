import importlib.util
import unittest
from pathlib import Path

SOURCE=Path(__file__).resolve().parents[1]/'scripts'/'av_audit.py'
loader=importlib.util.spec_from_file_location('p2_av_audit',SOURCE)
av=importlib.util.module_from_spec(loader)
loader.loader.exec_module(av)

class AdvisoryTests(unittest.TestCase):
    def test_identical_and_changed_decoded_frames(self):
        a=bytes([10]*av.RAW_BYTES)
        b=bytes([100]*av.RAW_BYTES)
        self.assertEqual(av.gray_difference(a,a),0.0)
        self.assertEqual(av.gray_difference(a,b),90.0)
        d,blank,means=av.frame_stats(a+b+a)
        self.assertEqual(d,[0.0,90.0,90.0])
        self.assertEqual(blank,[0,1,2])
        self.assertEqual(means,[10.0,100.0,10.0])

    def test_bounded_annotated_cues_and_proximity(self):
        cues=av.inspect_cues([{'frame':35,'kind':'transition','reason':'A prior UI card carries into the next scene'}],120)
        self.assertEqual(len(av.near_cue(38,cues)),1)
        self.assertEqual(len(av.near_cue(48,cues)),0)
        for bad in [
            [{'frame':120,'kind':'transition','reason':'valid long reason'}],
            [{'frame':12,'kind':'strange','reason':'valid long reason'}],
            [{'frame':12,'kind':'transition','reason':'x'}]
        ]:
            with self.assertRaises(ValueError):
                av.inspect_cues(bad,120)

    def test_truncated_real_decode_is_not_a_pass(self):
        with self.assertRaises(ValueError):
            av.frame_stats(bytes(av.RAW_BYTES*3-1))
        with self.assertRaises(ValueError):
            av.gray_difference(b'abc',b'ab')

if __name__=='__main__':
    unittest.main()
