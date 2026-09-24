"""Original deterministic synthesized score, inspired by the films' existing synths.
No recordings, samples, external music, or model generation. Separate film cues.
"""
import math, random, wave, array, json
from pathlib import Path
SR=48000
OUT=Path(__file__).parent

def score(name,duration,cues):
    data=array.array('f',[0.0])*(int(duration*SR))
    # Soft A/D/F/G harmonic bed, with a restrained pulse and a clean closing fade.
    chords=[(110,164.81,220),(146.83,220,293.66),(130.81,174.61,261.63),(98,146.83,196)]
    for i in range(len(data)):
        t=i/SR
        env=min(1,t/1.2,max(0,(duration-t)/1.8))
        c=chords[min(3,int(t/(duration/4)))]
        # Crossfade chords to avoid discontinuities.
        prev=chords[max(0,min(3,int(t/(duration/4)))-1)]
        local=t%(duration/4); k=min(1,local/1.2)
        val=sum(math.sin(2*math.pi*f*t)*.013 for f in c)*k+sum(math.sin(2*math.pi*f*t)*.013 for f in prev)*(1-k)
        data[i]=val*env
    events=[]
    for j,t0 in enumerate(cues):
        rng=random.Random(100+j)
        dur=.48
        last=0
        for n in range(int(dur*SR)):
            t=n/SR; idx=int(t0*SR)+n
            if idx>=len(data):break
            noise=rng.uniform(-1,1)
            high=noise-last;last=noise
            env=math.sin(math.pi*t/dur)**2
            data[idx]+=high*env*.016
        freq=[220,293.66,329.63,246.94,174.61,440][j%6]
        for n in range(int(1.5*SR)):
            idx=int((t0+.12)*SR)+n
            if idx>=len(data):break
            t=n/SR; env=min(1,t/.025)*math.exp(-4*t)
            data[idx]+=(math.sin(2*math.pi*freq*t)+.2*math.sin(2*math.pi*freq*2*t))*.035*env
        events.append({'time':t0,'type':'paper brush and soft tonal cue','frequency':freq})
    pcm=array.array('h',(int(max(-1,min(1,x))*32767) for x in data))
    with wave.open(str(OUT/(name+'-score.wav')),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
    return {'film':name,'duration':duration,'peak':max(abs(x) for x in data),'events':events,'provenance':'Original deterministic synthesis; no sampled assets'}

receipts=[score('A',26,[2.2,6.2,10.2,14.2,19.6,21.6]),score('B',25,[2.0,4.4,6.8,9.2,11.6,14.0,19.4]),score('M',30,[.3,4.2,9.6,14.6,19.6,25.7])]
(OUT/'audio-receipt.json').write_text(json.dumps(receipts,indent=2))
print(json.dumps(receipts))

