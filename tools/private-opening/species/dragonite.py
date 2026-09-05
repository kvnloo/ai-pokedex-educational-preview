"""Dragonite, modeled from textual landmarks with original meshes."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'dragonite','name':'Dragonite','nationalDexId':149,'canonicalId':'pokemon:149:standard','form':'standard','heightMeters':2.2,'landmarks':['round orange dragon','two long thin antennae and small forehead horn','large kind green eyes','cream horizontally segmented belly','small teal inner wings','thick tapered tail','three pale claws per foot'],'location':'Seabreeze cove','action':'Dragon Pulse'}
def build():
    root=group('Dragonite');m={k:material(k,v) for k,v in {'orange':(.93,.44,.075),'cream':(.94,.79,.49),'teal':(.04,.42,.34),'ivory':(.99,.95,.78),'black':(.012,.015,.012),'ridge':(.67,.46,.20)}.items()}
    ellipsoid('round pear torso',(0,0,.95),(.60,.44,.82),m['orange'],root)
    ellipsoid('cream belly',(0,-.355,.94),(.455,.13,.66),m['cream'],root)
    for z in [.50,.69,.89,1.09,1.28]:
        width=.43*math.sqrt(max(.1,1-((z-.94)/.67)**2))
        points=[]
        for i in range(17):
            x=-width+i*width/8;y=-.355-.131*math.sqrt(max(0,1-(x/.455)**2-((z-.94)/.66)**2))-.002;points.append((x,y,z))
        tube('segmented belly seam',points,.008,m['ridge'],root)
    head=group('head',root,(0,-.04,1.74));limbs={'head':head}
    ellipsoid('rounded head',(0,0,.14),(.38,.31,.38),m['orange'],head)
    ellipsoid('broad gentle muzzle',(0,-.23,-.02),(.34,.255,.18),m['orange'],head)
    eyes(head,m,.15,-.276,.22,.085)
    for s in [-1,1]:
        ellipsoid('nostril',(s*.12,-.463,.048),(.018,.011,.014),m['ridge'],head)
        sweep('long antenna',[(s*.20,.01,.39,.022),(s*.22,-.03,.64,.024),(s*.30,-.09,.84,.023),(s*.40,-.16,.85,.014)],m['orange'],head)
        tube('smile crease',[(0,-.477,-.08),(s*.18,-.44,-.083),(s*.29,-.36,-.045)],.007,m['ridge'],head)
        arm=group('arm.'+('L' if s<0 else 'R'),root,(s*.46,-.02,1.45));limbs[arm.name]=arm
        ellipsoid('round arm',(s*.13,-.03,-.21),(.155,.16,.33),m['orange'],arm)
        ellipsoid('hand',(s*.17,-.11,-.43),(.16,.13,.16),m['orange'],arm)
        for i in range(3):spike('small hand claw',(s*.17+(i-1)*.085,-.2,-.48),(s*.17+(i-1)*.09,-.26,-.58),.037,m['ivory'],arm)
        leg=group('leg.'+('L' if s<0 else 'R'),root,(s*.41,0,.49));limbs[leg.name]=leg
        ellipsoid('stout thigh',(s*.06,0,-.03),(.275,.29,.39),m['orange'],leg)
        ellipsoid('broad foot',(s*.11,-.18,-.32),(.24,.33,.16),m['orange'],leg)
        for i in range(3):spike('toe claw',(s*.11+(i-1)*.14,-.43,-.33),(s*.11+(i-1)*.15,-.60,-.35),.064,m['ivory'],leg)
        w=group('wing.'+('L' if s<0 else 'R'),root,(s*.33,.24,1.54));limbs[w.name]=w
        outline=[(0,0),(s*.40,.47),(s*.82,.54),(s*.65,.18),(s*.62,-.23),(s*.36,-.10),(s*.16,-.30)]
        wing('small teal wing',outline,m['teal'],w)
        tube('orange wing edge',[(0,0,0),(s*.40,0,.47),(s*.82,0,.54)],.049,m['orange'],w)
        tube('wing rib',[(s*.40,-.027,.47),(s*.62,-.027,-.23)],.027,m['orange'],w)
    spike('small forehead horn',(0,-.02,.44),(0,-.09,.64),.07,m['cream'],head)
    tail=group('tail',root,(0,.3,.52));limbs['tail']=tail
    sweep('thick long tapered tail',[(0,0,0,.28),(.2,.47,-.2,.26),(.66,.72,-.29,.19),(1.12,.70,-.19,.11),(1.38,.54,.05,.012)],m['orange'],tail)
    socket('mouth',head,(0,-.49,-.04));socket('ground',root,(0,0,0));socket('tail.tip',tail,(1.38,.54,.05))
    return root,limbs
if __name__=='__main__':export(CHARACTER,build,__file__)
