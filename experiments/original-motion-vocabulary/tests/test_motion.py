"""Actual frame raster and independent original-brief reuse, no codec smoke substitution."""
import hashlib,json,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import render_motion as motion

class OriginalMotionTests(unittest.TestCase):
    def test_distinct_briefs_share_one_engine(self):
        root=Path(__file__).resolve().parents[1]
        specs=[motion.validate_spec(json.loads((root/f'examples/recall_revision_{c}.json').read_text())) for c in 'ab']
        renders=[]
        for spec in specs:
            imgs=[]
            for t in [0.2,0.8,1.6,2.4,3.3,4.65]:
                im=motion.canvas();motion.MODES[spec['mode']][0](im,t,spec)
                imgs.append(hashlib.sha256(im.tobytes()).hexdigest())
            self.assertEqual(len(set(imgs)),len(imgs),'Visual frames must genuinely change with time')
            renders.append(imgs)
        self.assertNotEqual(renders[0],renders[1],'Changing authored JSON must visibly affect output')
    def test_unique_motion_across_all_modes(self):
        for k,(draw,duration) in motion.MODES.items():
            with self.subTest(mode=k):
                im=motion.canvas();draw(im,.7,{'mode':k})
                two=motion.canvas();draw(two,min(duration-.1,2.1),{'mode':k})
                self.assertNotEqual(hashlib.sha256(im.tobytes()).digest(),hashlib.sha256(two.tobytes()).digest())
                self.assertTrue(im.getchannel('A').getbbox())
    def test_rejects_unknown_modes_or_external_inputs(self):
        for spec in [{'mode':'unknown'}, {'mode':'recall_cycle','http_source':'https://example.com/foo'},
                     {'mode':'interaction_focus','target_x':2000},
                     {'mode':'recall_cycle','finish':'x'*90}]:
            with self.assertRaises(ValueError):motion.validate_spec(spec)
    def test_seeking_is_deterministic(self):
        s={'mode':'event_reward'}
        def hashed(t):
            im=motion.canvas();motion.MODES[s['mode']][0](im,t,s)
            return hashlib.sha256(im.tobytes()).hexdigest()
        a=hashed(2.2);hashed(1.8);self.assertEqual(a,hashed(2.2))

if __name__=='__main__':unittest.main()
