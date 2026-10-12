#!/usr/bin/env python3
"""Original synthetic sound design. No samples, stock audio, or third-party recordings."""
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter,sosfilt
R=48000;D=12;N=R*D;t=np.arange(N,dtype=np.float64)/R
root=Path(__file__).parent/'artifacts';root.mkdir(exist_ok=True)

def tone(freq,dur=.24,vol=.16,glide=.7):
 s=np.arange(int(R*dur))/R;env=(1-np.exp(-s*130))*np.exp(-s/(dur*.30));
 f=freq*(1+glide*(1-s/dur));phase=2*np.pi*np.cumsum(f)/R
 return vol*env*(np.sin(phase)+.2*np.sin(phase*2.002))

def tick(dur=.095,vol=.24):
 count=int(dur*R);tt=np.arange(count)/R
 # Deterministically synthesized short click; not an audio file.
 noise=(np.sin(2*np.pi*4321*tt)+.7*np.sin(2*np.pi*2770*tt))*.5
 return vol*np.exp(-tt*49)*noise

def add(buffer,start,wave):
 idx=int(start*R); end=min(idx+len(wave),len(buffer));
 if end>idx:buffer[idx:end]+=wave[:end-idx]

for kind in ['thread','focus']:
 a=np.zeros(N,dtype=np.float64)
 if kind=='thread':
  # A quiet non-melodic pulse at 120 BPM, musically grounded but not borrowed.
  for i in range(24):
   pos=.50*i;add(a,pos,tone(88 if i%4==0 else 110,.18,.075 if i%4 else .13,.36))
   if i%2==0:add(a,pos,tick(.07,.042))
  for hit,f in [(2.43,290),(3.1,245),(4.34,275),(5.05,330),(6.98,235),(8.42,520),(9.70,280)]:
   add(a,hit,tone(f,.22,.14,.5));add(a,hit,tick(.045,.095))
  # Distinct soft outro dyad from synthetically modulated oscillators.
  outro=np.arange(int(R*1.65))/R
  env=(1-np.exp(-outro*12))*np.exp(-outro*2.5)
  add(a,10.1,.07*env*(np.sin(2*np.pi*196*outro)+.4*np.sin(2*np.pi*293.66*outro)))
 else:
  # This editorial variant is intentionally slow and quiet, NOT a copy of
  # the source site's realtime film (which was silent).
  amb=.018*np.sin(2*np.pi*67.0*t)*(.5+.5*np.sin(2*np.pi*.11*t))
  a+=amb
  for hit,f in [(1.66,185),(3.7,160),(5.50,195),(6.48,250),(8.02,310),(9.65,178)]:
   add(a,hit,tone(f,.45,.07,.18))
  for hit in [3.7,5.50,8.02,9.65]:add(a,hit,tick(.14,.06))
 a=a/(max(1.0,np.max(np.abs(a))/.67));a=np.tanh(a*1.3)/1.3
 # Bring quiet original synthesized events into an audible, safe stereo range.
 # The final tracks contain no speech; retain dynamic soft textures without clipping.
 target_peak=.40 if kind=='thread' else .34
 a*=target_peak/max(1e-9,float(np.max(np.abs(a))))
 # Stereo kept phase-aligned; slight amplitude difference only, no fake width
 stereo=np.column_stack([a*.97,a])
 path=root/(kind+'_audio.wav');sf.write(path,stereo,R,subtype='PCM_16')
 print(kind,path,len(a)/R,np.max(abs(a)),flush=True)