import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
p=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r71')
d=json.loads((p/'section-profiles.json').read_text())
fig,axes=plt.subplots(3,1,figsize=(10,9),sharex=True,sharey=True)
for ax,r in zip(axes,d['profiles']):
 ax.add_collection(LineCollection([s['UN'] for s in r['segments']],colors='#1265a8',linewidths=1.5))
 ax.set_xlim(.50,1);ax.set_ylim(-.18,.04);ax.set_aspect('equal');ax.grid(alpha=.25)
 ax.set_ylabel('Normal depth N');ax.set_title('Actual mesh section W='+str(r['W']))
axes[-1].set_xlabel('Across-wing U')
fig.suptitle('R71 cross-sections: both skins and guide-cropped supports\nMeasured geometry - no target curve fitted')
fig.tight_layout();fig.savefig(p/'section-profiles.png',dpi=150)
