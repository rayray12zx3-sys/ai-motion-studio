"""Four-shot alpha-timeline replay/overlap and reject-by-default tests."""
import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from render_motion_timeline import compile_timeline, render_frame, active_frames


def example(name):
    return json.loads((ROOT / 'examples' / name).read_text())


class TimelineTests(unittest.TestCase):
    def test_two_different_original_four_shot_films(self):
        a = compile_timeline(example('motion-education-four-shots.json'))
        b = compile_timeline(example('motion-creative-four-shots.json'))
        self.assertEqual((len(a['shots']), a['duration_frames']), (4, 415))
        self.assertEqual((len(b['shots']), b['duration_frames']), (4, 441))
        self.assertNotEqual([s['mode'] for s in a['shots']], [s['mode'] for s in b['shots']])
        self.assertNotEqual([s['frames'] for s in a['shots']], [s['frames'] for s in b['shots']])
        self.assertFalse(a['user_media_loaded'])
        self.assertEqual(a['art'], 'PENDING_HUMAN')

    def test_true_two_layer_overlap_on_every_boundary(self):
        for plan in [compile_timeline(example('motion-education-four-shots.json')),
                     compile_timeline(example('motion-creative-four-shots.json'))]:
            self.assertEqual(plan['shots'][0]['start_frame'], 0)
            self.assertEqual(plan['shots'][-1]['end_exclusive'], plan['duration_frames'])
            for index, shot in enumerate(plan['shots']):
                if not index:
                    continue
                prev = plan['shots'][index - 1]
                self.assertEqual(shot['start_frame'],
                                 prev['end_exclusive'] - shot['overlap_in_frames'])
                self.assertEqual(len(active_frames(plan, shot['start_frame'])), 2)
                self.assertEqual(len(active_frames(plan, prev['end_exclusive'] - 1)), 2)
                self.assertEqual(len(active_frames(plan, prev['end_exclusive'])), 1)
                for f in [shot['start_frame'], shot['start_frame'] + 3,
                          shot['start_frame'] + shot['overlap_in_frames'] - 1]:
                    img = render_frame(plan, f)
                    self.assertEqual(img.mode, 'RGBA')
                    self.assertEqual(img.size, (1080, 1920))
                    self.assertEqual(img.getchannel('A').getextrema()[0], 0)
                    self.assertGreater(img.getchannel('A').getextrema()[1], 0)

    def test_random_seek_and_distinct_actual_pixels(self):
        a = compile_timeline(example('motion-education-four-shots.json'))
        b = compile_timeline(example('motion-creative-four-shots.json'))
        frames = [0, 3, 15, 105, 125, 132, 150, 220, 310, 410]
        def digest(p, f):
            return hashlib.sha256(render_frame(p, f).resize((54,96)).tobytes()).hexdigest()
        values = [digest(a, f) for f in frames]
        self.assertGreaterEqual(len(set(values)), 8)
        self.assertEqual(values, [digest(a, f) for f in frames])
        self.assertNotEqual(digest(a,115), digest(b,115))

    def test_rejects_unapproved_media_invalid_timing_and_mutation(self):
        original = example('motion-education-four-shots.json')
        compile_timeline(original)
        mutations = [
            lambda x:x['shots'][1]['spec'].update({'image_url':'https://example.test/a.mov'}),
            lambda x:x['shots'][1]['spec'].update({'mode':'external_video'}),
            lambda x:x['shots'][1].update({'frames':150}),
            lambda x:x['shots'][1].update({'overlap_in_frames':60}),
            lambda x:x['shots'][0].update({'overlap_in_frames':1}),
            lambda x:x['shots'][0].update({'id':x['shots'][1]['id']}),
            lambda x:x['shots'][0].update({'approval':True}),
            lambda x:x.update({'rights_approved':True}),
            lambda x:x.update({'kind':'production-state-engine'}),
        ]
        for mutate in mutations:
            inp = copy.deepcopy(original)
            mutate(inp)
            with self.assertRaises(ValueError): compile_timeline(inp)
        plan = compile_timeline(original)
        with self.assertRaises(ValueError):render_frame(plan,-1)
        with self.assertRaises(ValueError):render_frame(plan,plan['duration_frames'])
        self.assertEqual(original, example('motion-education-four-shots.json'))


if __name__ == '__main__':
    unittest.main()
