import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
p=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r71')
d=json.loads((p/'section-profiles.json').read_text())
targets=json.loads((p/'section-targets.json').read_text())['sections']
fig,axes=plt.subplots(3,1,figsize=(10,9),sharex=True,sharey=True)
for ax,r in zip(axes,d['profiles']):
 ax.add_collection(LineCollection([s['UN'] for s in r['segments']],colors='#1265a8',linewidths=1.5))
 target=next(t for t in targets if t['W']==r['W'])['bezier']
 points=[]
 for i in range(101):
  t=i/100;weights=[(1-t)**3,3*(1-t)**2*t,3*(1-t)*t*t,t**3]
  points.append([sum(weights[j]*target[j][k] for j in range(4)) for k in range(2)])
 ax.plot([v[0] for v in points],[v[1] for v in points],color='#c12c38',linestyle='--',label='Proposed mid-surface');ax.legend(loc='lower left')
 ax.set_xlim(.50,1);ax.set_ylim(-.18,.04);ax.set_aspect('equal');ax.grid(alpha=.25)
 ax.set_ylabel('Normal depth N');ax.set_title('Actual mesh section W='+str(r['W']))
axes[-1].set_xlabel('Across-wing U')
fig.suptitle('R71 cross-sections: both skins and guide-cropped supports\nMeasured skins + inferred mid-surface target; not official calibrated geometry')
fig.tight_layout();fig.savefig(p/'section-targets.png',dpi=150)
