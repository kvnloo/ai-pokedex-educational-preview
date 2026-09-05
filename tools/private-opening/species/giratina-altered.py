"""Giratina Altered: original six-legged gray dragon, gold armor and torn wings."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'giratina-altered','name':'Giratina','nationalDexId':487,'canonicalId':'pokemon:487:altered','form':'altered','heightMeters':4.5,'landmarks':['six-legged gray draconic body','gold crowned helmet and red eyes','black and red striped neck','three pairs of gold rib-like collars','two enormous ragged black wings with red thorns','gold-capped clawed feet'],'location':'Distortion threshold','action':'Shadow Force'}
def build():
    root=group('Giratina_Altered');m={k:material(k,v) for k,v in {'gray':(.43,.46,.53),'gold':(.84,.58,.14),'black':(.022,.018,.033),'red':(.65,.017,.038),'ivory':(.94,.86,.61),'wing':(.045,.035,.064)}.items()}
    m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.5
    ellipsoid('massive gray body',(0,.22,1.33),(.72,1.13,.76),m['gray'],root)
    for i in range(9):
        z=1.32+i*.22;rx=.54-i*.0308;y=-.48-i*.0275
        band=loft('striped neck segment',[(0,y,z,rx,rx*.83),(0,y-.0275,z+.22,rx-.0308,(rx-.0308)*.83)],m['red' if i%2 else 'black'],root)
        band.data.materials.append(m['gray'])
        for face in band.data.polygons:
            if face.normal.y>-.25:face.material_index=1
    head=group('head',root,(0,-.76,3.30));limbs={'head':head}
    ellipsoid('gray armored skull',(0,0,.12),(.36,.32,.40),m['gray'],head)
    ellipsoid('black face',(0,-.26,.06),(.28,.17,.29),m['black'],head)
    wing('central gold crown',[(-.10,.24),(-.14,.48),(0,.65),(.14,.48),(.10,.24),(0,.14)],m['gold'],head,.16).location.y=-.10
    wing('gold central mask',[(-.065,.26),(.065,.26),(.08,-.12),(0,-.26),(-.08,-.12)],m['gold'],head,.07).location.y=-.43
    for s in [-1,1]:
        wing('gold side helmet',[(s*.06,.36),(s*.33,.34),(s*.44,.12),(s*.29,-.27),(s*.12,-.22),(s*.23,.02)],m['gold'],head,.16).location.y=-.24
        spike('crown side horn',(s*.29,.015,.35),(s*.51,.045,.69),.11,m['gold'],head)
        wing('sharp crimson eye',[(s*.075,.12),(s*.235,.15),(s*.20,.035),(s*.10,.037)],m['red'],head,.015).location.y=-.411
        ellipsoid('eye slit',(s*.154,-.429,.084),(.011,.003,.029),m['black'],head)
        tube('gold lower jaw',[(s*.27,-.33,-.17),(s*.15,-.42,-.29),(0,-.45,-.31)],.055,m['gold'],head)
        for i,z in enumerate([1.86,2.32,2.78]):
            sweep('gold rib collar',[(s*.29,-.47,z,.10),(s*.60,-.65,z+.06,.11),(s*.68,-.98,z-.01,.08),(s*.37,-1.20,z-.16,.005)],m['gold'],root)
        for i,y in enumerate([-.65,.13,.89]):
            leg=group('leg.'+str(i)+('.L' if s<0 else '.R'),root,(s*.55,y,1.13));limbs[leg.name]=leg
            sweep('bent gray leg',[(0,0,0,.21),(s*.29,.015,-.34,.225),(s*.38,-.055,-.72,.17),(s*.38,-.12,-.91,.16)],m['gray'],leg)
            ellipsoid('black planted foot',(s*.4,-.20,-.99),(.25,.35,.15),m['black'],leg)
            box('gold ankle cuff',(s*.38,-.09,-.74),(.40,.32,.16),m['gold'],leg,.035)
            for j in range(3):spike('gold toe claw',(s*.40+(j-1)*.15,-.42,-1.00),(s*.40+(j-1)*.15,-.60,-1.02),.07,m['gold'],leg)
        w=group('wing.'+('L' if s<0 else 'R'),root,(s*.44,.29,2.12));limbs[w.name]=w
        outline=[(0,0),(s*.54,.60),(s*.87,1.50),(s*1.42,1.70),(s*1.29,.98),(s*2.00,1.12),(s*1.74,.35),(s*2.00,-.13),(s*1.28,-.45),(s*.84,-.22),(s*.34,-.62)]
        wing('ragged black shadow wing',outline,m['black'],w,.085)
        sweep('raised shadow wing ridge',[(0,0,0,.12),(s*.54,0,.60,.12),(s*.87,0,1.50,.08),(s*1.42,0,1.70,.005)],m['wing'],w)
        for x,z,ex,ez in [(1.22,1.40,1.65,1.87),(1.69,.76,2.22,1.05),(1.69,-.11,2.14,-.08)]:
            spike('red wing thorn',(s*x,-.03,z),(s*ex,-.03,ez),.125,m['red'],w)
    tail=group('tail',root,(0,1.15,1.3));limbs['tail']=tail
    sweep('short heavy tail',[(0,0,0,.32),(.11,.49,-.19,.26),(.38,.90,-.53,.18),(.62,1.14,-.79,.005)],m['gray'],tail)
    spike('gold tail point',(.54,1.03,-.67),(.71,1.32,-.87),.12,m['gold'],tail)
    socket('mouth',head,(0,-.46,-.12));socket('ground',root,(0,0,0))
    return root,limbs
if __name__=='__main__':export(CHARACTER,build,__file__)
