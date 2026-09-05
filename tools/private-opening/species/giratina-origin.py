"""Giratina Origin: a separately authored limbless serpent and six shadow streamers."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'giratina-origin','name':'Giratina','nationalDexId':487,'canonicalId':'pokemon:487:origin','form':'origin','heightMeters':6.9,'landmarks':['long floating gray serpentine body without legs','gold helmet with red eyes','black and red segmented underside','three gold rib collar pairs','six black streamer tendrils with red spear tips','long tapering curled tail'],'location':'Distortion expanse','action':'Shadow Force'}
def build():
    root=group('Giratina_Origin');m={k:material(k,v) for k,v in {'gray':(.45,.48,.55),'gold':(.85,.61,.17),'black':(.018,.015,.032),'red':(.68,.015,.045),'ivory':(.96,.86,.57)}.items()}
    m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.5
    # Original continuous S-spine, distinct from the Altered body's torso and legs.
    body=sweep('long serpentine torso',[(0,-.10,4.7,.29),(0,-.02,4.05,.40),(0,.04,3.25,.49),(.03,.18,2.45,.51),(.10,.38,1.68,.44),(.38,.70,.92,.35),(.90,.85,.48,.28),(1.44,.81,.27,.22),(2.07,.58,.39,.15),(2.40,.31,.78,.095),(2.37,.08,1.17,.02)],m['gray'],root)
    # Bands are material regions on the continuous authored body itself;
    # no stacked shells can clip through the curved chest.
    body.data.materials.append(m['black']);body.data.materials.append(m['red'])
    for face in body.data.polygons:
        row=(face.index-1)//12
        if len(face.vertices)==4 and 0<=row<24 and face.normal.y<-.22:face.material_index=1+(row//3)%2
    head=group('head',root,(0,-.11,4.78));limbs={'head':head}
    ellipsoid('long armored head',(0,0,.09),(.33,.34,.41),m['gray'],head)
    ellipsoid('shadow face',(0,-.28,.03),(.255,.18,.30),m['black'],head)
    wing('central crown blade',[(-.11,.23),(-.14,.43),(0,.68),(.14,.43),(.11,.23),(0,.11)],m['gold'],head,.16).location.y=-.11
    wing('gold central facial spear',[(-.06,.27),(.06,.27),(.075,-.13),(0,-.31),(-.075,-.13)],m['gold'],head,.07).location.y=-.45
    for s in [-1,1]:
        wing('gold swept helmet',[(s*.07,.34),(s*.29,.39),(s*.44,.13),(s*.31,-.28),(s*.13,-.25),(s*.22,.035)],m['gold'],head,.16).location.y=-.25
        spike('back swept crown horn',(s*.25,.015,.33),(s*.44,.18,.73),.105,m['gold'],head)
        wing('slanted crimson eye',[(s*.074,.12),(s*.224,.15),(s*.185,.035),(s*.10,.035)],m['red'],head,.015).location.y=-.43
        ellipsoid('vertical eye slit',(s*.147,-.444,.085),(.01,.002,.034),m['black'],head)
        tube('gold jaw guard',[(s*.28,-.34,-.18),(s*.15,-.44,-.30),(0,-.47,-.33)],.050,m['gold'],head)
        for i,z in enumerate([3.25,3.78,4.29]):
            sweep('long gold rib collar',[(s*.29,.04,z,.09),(s*.64,-.16,z+.045,.12),(s*.76,-.52,z-.04,.095),(s*.38,-.81,z-.27,.004)],m['gold'],root)
        for i,(z,outerZ,endZ) in enumerate([(4.13,5.15,4.49),(3.39,3.82,2.89),(2.60,2.35,1.45)]):
            tendril=group('tendril.'+str(i)+('.L' if s<0 else '.R'),root,(s*.26,.24,z));limbs[tendril.name]=tendril
            midZ=outerZ-z;tipZ=endZ-z;reach=2.22+i*.14
            obj=sweep('sinuous black shadow streamer',[(0,0,0,.135),(s*.72,.12,midZ*.75,.17),(s*1.60,.17,midZ,.14),(s*reach,-.08,tipZ,.085)],m['black'],tendril);obj.scale.y=.65
            # Distinct wide red spear tip at the end of each black streamer.
            spike('red streamer spear',(s*reach,-.05,tipZ+.03),(s*(reach-.11),-.12,tipZ-.58),.18,m['red'],tendril)
    tail=group('tail_detail',root,(.82,.84,.51))
    for i in range(3):
        x=.40+i*.32;z=-.19 if i<2 else-.13
        spike('gold tail ridge',(x,.03,z+.15),(x+.13,.06,z+.48-i*.045),.09-i*.015,m['gold'],tail)
    socket('mouth',head,(0,-.48,-.16));socket('tail.tip',tail,(1.55,-.76,.66));socket('ground',root,(0,0,0));socket('aura',root,(0,0,3.2))
    return root,limbs
if __name__=='__main__':export(CHARACTER,build,__file__)
