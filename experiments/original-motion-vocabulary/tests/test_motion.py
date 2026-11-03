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

class DirectorPlanTests(unittest.TestCase):
    def test_two_fully_different_director_plans_share_same_modules(self):
        from render_director_plan import compile_director_plan
        base=Path(__file__).resolve().parents[1]
        edu=json.loads((base/'examples/director-plan-education.json').read_text())
        creative=json.loads((base/'examples/director-plan-creative.json').read_text())
        a=compile_director_plan(edu);b=compile_director_plan(creative)
        self.assertEqual([v['start_frame'] for v in a['shots']],[0,150])
        self.assertEqual(a['duration_frames'],270)
        self.assertEqual(b['duration_frames'],240)
        self.assertEqual(len({v['mode'] for v in a['shots']+b['shots']}),4)
    def test_unapproved_sources_and_duplicate_shots_rejected(self):
        from render_director_plan import compile_director_plan
        spec={'version':1,'shots':[{'id':'a','spec':{'mode':'recall_cycle'}},{'id':'a','spec':{'mode':'cta_reveal'}}]}
        with self.assertRaises(ValueError):compile_director_plan(spec)
        spec['shots'][1]['id']='b';spec['shots'][1]['spec']['image_url']='https://outside.example'
        with self.assertRaises(ValueError):compile_director_plan(spec)
