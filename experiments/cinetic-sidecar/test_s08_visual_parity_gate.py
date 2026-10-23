"""Fictional in-memory RGB fixtures only: no private media or network."""
import unittest
import s08_visual_parity_gate as gate

class PrivateParityGateSafetyTests(unittest.TestCase):
    def test_same_frames_pass_exact(self):
        frame=bytes(gate.FRAME_BYTES)
        ref={i:frame for i in gate.KEY_FRAMES}
        metrics=gate.compare(ref,ref)
        self.assertEqual(metrics,{'card':0.0,'road':0.0,'full':0.0})
        self.assertTrue(all(metrics[k]<=gate.LIMITS[k] for k in gate.LIMITS))

    def test_visible_internal_card_regression_is_rejected(self):
        frame=bytes(gate.FRAME_BYTES)
        ghost=bytearray(frame)
        x1,x2,y1,y2=gate.ROIS['card']
        for y in range(y1,y2):
            at=(y*gate.WIDTH+x1)*3
            ghost[at:at+(x2-x1)*3]=b'\xff'*((x2-x1)*3)
        ref={i:frame for i in gate.KEY_FRAMES}
        candidate={i:bytes(ghost) for i in gate.KEY_FRAMES}
        metrics=gate.compare(ref,candidate)
        self.assertGreater(metrics['card'],gate.LIMITS['card'])
        self.assertEqual(metrics['road'],0)
        self.assertFalse(all(metrics[k]<=gate.LIMITS[k] for k in gate.LIMITS))

    def test_wrong_dimensions_and_missing_frames_fail_closed(self):
        with self.assertRaisesRegex(ValueError,'INVALID_RAW_FRAME_DIMENSIONS'):
            gate.roi_error(b'bad',bytes(gate.FRAME_BYTES),gate.ROIS['card'])
        with self.assertRaisesRegex(ValueError,'MISSING_FRAMES'):
            gate.compare({}, {})

if __name__=='__main__':
    unittest.main()
