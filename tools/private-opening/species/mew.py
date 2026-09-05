"""Original Mew mesh: small floating pink feline, fine tail and large hind feet."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'mew','name':'Mew','nationalDexId':151,'canonicalId':'pokemon:151:standard','form':'standard','heightMeters':.4,'landmarks':['pale pink feline embryo-like body','broad head and short triangular ears','large blue eyes','tiny forearms','large long oval hind feet','very long thin tail with oval tip'],'location':'Whispering grove','action':'Psychic'}
def build():
    root=group('Mew');m={k:material(k,v) for k,v in {'pink':(.94,.48,.62),'inner':(.69,.24,.38),'blue':(.035,.34,.70),'ivory':(.99,.98,.94),'black':(.024,.024,.048)}.items()}
    ellipsoid('slender pear body',(0,0,.24),(.107,.086,.17),m['pink'],root)
    head=group('head',root,(0,-.024,.43));limbs={'head':head}
    ellipsoid('broad feline head',(0,0,0),(.155,.11,.123),m['pink'],head)
    ellipsoid('short rounded muzzle',(0,-.069,-.037),(.10,.058,.061),m['pink'],head)
    for s in [-1,1]:
        loft('rounded tapered cat ear',[(s*.125,.018,.03,.040,.034),(s*.133,.018,.082,.030,.025),(s*.14,.018,.14,.002,.002)],m['pink'],head)
        ellipsoid('soft inner ear',(s*.134,-.008,.077),(.015,.008,.027),m['inner'],head)
        ellipsoid('large eye white',(s*.067,-.096,.004),(.040,.006,.052),m['ivory'],head)
        ellipsoid('large blue iris',(s*.065,-.102,.004),(.028,.004,.041),m['blue'],head)
        ellipsoid('deep oval pupil',(s*.063,-.106,.006),(.012,.002,.028),m['black'],head)
        ellipsoid('soft eye highlight',(s*.061-.009,-.109,.023),(.008,.002,.012),m['ivory'],head)
        arm=group('arm.'+('L' if s<0 else 'R'),root,(s*.079,-.016,.32));limbs[arm.name]=arm
        tube('tiny bent arm',[(0,0,0),(s*.035,-.025,-.045),(s*.051,-.044,-.065)],.022,m['pink'],arm)
        ellipsoid('tiny three digit paw',(s*.049,-.046,-.07),(.027,.023,.028),m['pink'],arm)
        leg=group('leg.'+('L' if s<0 else 'R'),root,(s*.071,.01,.135));limbs[leg.name]=leg
        ellipsoid('rounded thigh',(s*.023,0,-.033),(.062,.065,.09),m['pink'],leg)
        foot=ellipsoid('long oval hind foot',(s*.04,-.072,-.097),(.059,.127,.046),m['pink'],leg);foot.rotation_euler.z=s*.22
        for i in [-1,1]:tube('toe crease',[(s*.04+i*.017,-.18,-.083),(s*.04+i*.017,-.154,-.074)],.0018,m['inner'],leg)
    tube('subtle smile',[(-.029,-.120,-.043),(0,-.128,-.052),(.029,-.12,-.043)],.0022,m['inner'],head)
    tail=group('tail',root,(0,.072,.17));limbs['tail']=tail
    sweep('long fine curling tail',[(0,0,0,.013),(.12,.13,.025,.012),(.32,.16,.16,.012),(.36,.14,.34,.013),(.28,.11,.45,.014),(.20,.04,.46,.015)],m['pink'],tail)
    ellipsoid('oval tail tip',(.20,.04,.46),(.036,.028,.049),m['pink'],tail)
    socket('aura',root,(0,0,.30));socket('tail.tip',tail,(.20,.04,.46));socket('ground',root,(0,0,0))
    return root,limbs
if __name__=='__main__':export(CHARACTER,build,__file__)
