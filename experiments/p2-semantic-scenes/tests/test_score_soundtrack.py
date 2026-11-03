import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from score_soundtrack import TRACKS, beat_hypotheses, sha256, verify_inputs, mix

class ScoreTests(unittest.TestCase):
    def test_source_catalog_is_exact_and_limited(self):
        self.assertEqual(set(TRACKS), {'cipher','floating-cities'})
        self.assertEqual({x['bpm'] for x in TRACKS.values()}, {120,150})
        for track in TRACKS.values():
            self.assertEqual(len(track['sha256']),64)
            self.assertTrue(track['page'].startswith('https://incompetech.com/'))
            self.assertGreaterEqual(track['start'],0)

    def test_musical_grid_is_hypothesis_not_audio_evidence(self):
        cues=[{'frame':120,'kind':'transition','reason':'Semantic sequence change'},
              {'frame':165,'kind':'impact','reason':'User explicitly updates state'}]
        d=beat_hypotheses(cues,30,120)
        self.assertEqual(d[0]['distance_to_zero_phase_grid_frames'],0)
        self.assertEqual(d[1]['distance_to_zero_phase_grid_frames'],0)
        different=beat_hypotheses(cues,30,150)
        self.assertEqual(different[1]['distance_to_zero_phase_grid_frames'],3.0)

    def test_wrong_music_or_credit_must_fail_before_any_mix(self):
        with tempfile.TemporaryDirectory() as tmp:
            d=Path(tmp)
            for name in ('video.mp4','music.mp3','credits.md'):
                (d/name).write_bytes(b'unapproved fake file')
            (d/'cues.json').write_text(json.dumps([{
                'frame':15,'kind':'impact','reason':'Visible user action'
            }]))
            with self.assertRaisesRegex(ValueError,'do not match'):
                verify_inputs(d/'video.mp4',d/'music.mp3',d/'credits.md',d/'cues.json','cipher')
            with self.assertRaisesRegex(ValueError,'Unsupported'):
                verify_inputs(d/'video.mp4',d/'music.mp3',d/'credits.md',d/'cues.json','unknown')
            self.assertEqual(sha256(d/'music.mp3'),sha256(d/'video.mp4'))

    def test_protect_inputs_and_preexisting_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            d=Path(tmp)
            for n in ('v.mp4','m.mp3','c.md','cues.json'):
                (d/n).write_text('placeholder')
            with self.assertRaisesRegex(ValueError,'overwrite source'):
                mix(d/'v.mp4',d/'m.mp3',d/'c.md',d/'cues.json','cipher',d/'v.mp4')
            (d/'out.mp4').write_text('valuable previous render')
            with self.assertRaises(FileExistsError):
                mix(d/'v.mp4',d/'m.mp3',d/'c.md',d/'cues.json','cipher',d/'out.mp4')
            self.assertEqual((d/'out.mp4').read_text(),'valuable previous render')

if __name__=='__main__':
    unittest.main()
