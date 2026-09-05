"""Charizard: original text-specified mesh, never an imported reconstruction."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'charizard','name':'Charizard','nationalDexId':6,'canonicalId':'pokemon:006:standard','form':'standard','heightMeters':1.7,'landmarks':['orange bipedal dragon','long neck and horned head','cream belly','large blue-green inner bat wings','three white claws','long fire-tipped tail'],'location':'Cinder clearing','action':'Flamethrower'}
def build():
    root=group('Charizard');m={k:material(k,v) for k,v in {'orange':(.88,.24,.035),'cream':(.94,.76,.43),'teal':(.025,.32,.36),'ivory':(.97,.96,.83),'black':(.018,.012,.015),'fire':(1,.17,.008),'gold':(1,.68,.015)}.items()}
    loft('tapered dragon torso',[(0,0,.3,.20,.18),(0,0,.6,.49,.37),(0,0,1.0,.50,.38),(0,.02,1.4,.32,.26),(0,0,1.7,.19,.17),(0,-.04,2.05,.16,.14)],m['orange'],root)
    ellipsoid('cream belly',(0,-.296,1.02),(.37,.115,.60),m['cream'],root)
    for color in ['fire','gold']:
        shader=m[color].node_tree.nodes.get('Principled BSDF');shader.inputs['Emission Color'].default_value=m[color].diffuse_color;shader.inputs['Emission Strength'].default_value=.6
    head=group('head',root,(0,-.055,2.13));limbs={'head':head}
    ellipsoid('angular cranium',(0,0,.08),(.24,.20,.27),m['orange'],head)
    ellipsoid('long muzzle',(0,-.22,-.035),(.26,.30,.14),m['orange'],head)
    ellipsoid('lower jaw',(0,-.23,-.13),(.23,.255,.07),m['cream'],head)
    eyes(head,m,.135,-.18,.15,.070)
    for s in [-1,1]:
        tube('angular brow',[(s*.07,-.223,.22),(s*.18,-.203,.25),(s*.21,-.16,.21)],.027,m['orange'],head)
        spike('back swept horn',(s*.17,.05,.24),(s*.22,.14,.52),.082,m['orange'],head)
        ellipsoid('nostril',(s*.115,-.477,.012),(.022,.012,.015),m['black'],head)
        tube('mouth crease',[(s*.025,-.496,-.097),(s*.20,-.41,-.10),(s*.247,-.24,-.08)],.009,m['black'],head)
        spike('visible fang',(s*.19,-.34,-.075),(s*.185,-.34,-.15),.025,m['ivory'],head)
        arm=group('arm.'+('L' if s<0 else 'R'),root,(s*.28,-.015,1.48));limbs[arm.name]=arm
        tube('bent forearm',[(0,0,0),(s*.23,-.05,-.20),(s*.28,-.23,-.31)],.085,m['orange'],arm)
        ellipsoid('palm',(s*.29,-.23,-.31),(.12,.095,.11),m['orange'],arm)
        for i in range(3):spike('hand talon',(s*(.22+i*.06),-.28,-.34),(s*(.23+i*.07),-.36,-.43),.033,m['ivory'],arm)
        leg=group('leg.'+('L' if s<0 else 'R'),root,(s*.34,0,.55));limbs[leg.name]=leg
        ellipsoid('haunch',(s*.06,.01,-.06),(.245,.245,.35),m['orange'],leg)
        ellipsoid('planted foot',(s*.12,-.16,-.39),(.20,.30,.13),m['orange'],leg)
        for i in range(3):spike('toe claw',(s*.12+(i-1)*.12,-.35,-.39),(s*.12+(i-1)*.13,-.55,-.43),.06,m['ivory'],leg)
        w=group('wing.'+('L' if s<0 else 'R'),root,(s*.25,.19,1.58));limbs[w.name]=w
        outline=[(0,0),(s*.55,.78),(s*1.55,1.00),(s*1.25,.50),(s*1.20,-.13),(s*.75,.12),(s*.58,-.42),(s*.28,-.15)]
        wing('blue green wing membrane',outline,m['teal'],w)
        tube('orange wing leading edge',[(0,0,0),(s*.55,0,.78),(s*1.55,0,1.00)],.065,m['orange'],w)
        for x,z in [(1.20,-.13),(.58,-.42)]:tube('wing finger rib',[(s*.55,-.028,.78),(s*x,-.028,z)],.033,m['orange'],w)
        spike('wing thumb',(s*.55,0,.78),(s*.60,0,.96),.045,m['ivory'],w)
    tail=group('tail',root,(0,.26,.55));limbs['tail']=tail
    sweep('long curved tail',[(0,0,0,.23,.20),(.15,.30,-.16,.19,.17),(.43,.57,-.23,.15,.13),(.76,.65,-.12,.10,.10),(.98,.60,.12,.067,.066),(1.04,.56,.50,.038,.04)],m['orange'],tail)
    for x,y,z,scale in [(1.04,.56,.48,1),(.93,.57,.48,.65),(1.14,.56,.49,.8)]:
        loft('flame tongue',[(x,y,z,.10*scale,.075*scale),(x-.035,y,z+.19*scale,.13*scale,.075*scale),(x+.03,y,z+.44*scale,.005,.005)],m['fire'],tail)
    loft('gold flame heart',[(1.04,.49,.47,.07,.03),(1.04,.48,.65,.09,.04),(1.02,.48,.83,.003,.003)],m['gold'],tail)
    socket('mouth',head,(0,-.52,-.06));socket('tail.tip',tail,(1.04,.56,.6));socket('ground',root,(0,0,0))
    return root,limbs
if __name__=='__main__':export(CHARACTER,build,__file__)
