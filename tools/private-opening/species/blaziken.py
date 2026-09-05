"""Original Blaziken anatomy, feather shapes, red mask and flared fighting legs."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
CHARACTER={'id':'blaziken','name':'Blaziken','nationalDexId':257,'canonicalId':'pokemon:257:standard','form':'standard','heightMeters':1.9,'landmarks':['tall red avian martial artist','cream swept head plumes','red angular face mask and pointed beak','blue eyes','cream chest feather V','long arms with wrist flame cuffs','red flared legs with yellow flame markings','gray clawed hands and feet'],'location':'Ember training court','action':'Blaze Kick'}
def build():
    root=group('Blaziken');m={k:material(k,v) for k,v in {'red':(.71,.055,.035),'cream':(.96,.85,.57),'yellow':(1,.57,.035),'blue':(.025,.44,.63),'ivory':(.98,.94,.81),'black':(.022,.026,.035),'gray':(.25,.28,.30),'fire':(1,.25,.014)}.items()}
    loft('athletic red torso',[(0,0,.84,.16,.12),(0,0,1.10,.19,.13),(0,0,1.38,.29,.16),(0,0,1.58,.30,.17),(0,0,1.68,.11,.10)],m['red'],root)
    ellipsoid('connected feathered neck',(0,0,1.7),(.10,.095,.17),m['cream'],root)
    ellipsoid('connected hip',(0,0,.91),(.235,.145,.16),m['red'],root)
    head=group('head',root,(0,0,1.83));limbs={'head':head}
    ellipsoid('avian cream head',(0,0,.11),(.18,.16,.24),m['cream'],head)
    # Three-dimensional mask follows the pointed bird face rather than a painted texture.
    wing('red forehead crest',[(-.12,.26),(0,.43),(.12,.26),(.065,.09),(0,.04),(-.065,.09)],m['red'],head,.10).location.y=-.10
    for s in [-1,1]:
        sweep('long swept cream head plume',[(s*.115,.04,.18,.09),(s*.26,.10,.28,.10),(s*.43,.19,.41,.085),(s*.61,.28,.48,.002)],m['cream'],head)
        sweep('lower head feather',[(s*.135,.025,.04,.07),(s*.26,.16,-.12,.095),(s*.38,.36,-.42,.002)],m['cream'],head)
        eye=ellipsoid('sharp eye white',(s*.082,-.148,.117),(.064,.009,.034),m['ivory'],head);eye.rotation_euler.y=-s*.25
        ellipsoid('blue iris',(s*.077,-.158,.111),(.021,.004,.028),m['blue'],head)
        ellipsoid('dark pupil',(s*.076,-.162,.112),(.008,.002,.020),m['black'],head)
        tube('red brow',[(s*.025,-.157,.151),(s*.139,-.130,.177)],.022,m['red'],head)
        wing('mask cheek',[ (s*.025,.084),(s*.15,.15),(s*.17,-.023),(s*.045,-.074)],m['red'],head,.037).location.y=-.122
        # Cream V-shaped mantle; individual feather blades have real volume.
        for i in range(3):
            sweep('chest feather',[(s*(.20+i*.035),-.135,1.65,.065),(s*(.13+i*.035),-.19,1.49-i*.035,.055),(s*(.014+i*.065),-.18,1.28-i*.055,.002)],m['cream'],root)
        arm=group('arm.'+('L' if s<0 else 'R'),root,(s*.285,0,1.54));limbs[arm.name]=arm
        ellipsoid('cream upper arm',(s*.071,0,-.14),(.081,.085,.235),m['cream'],arm)
        sweep('red long forearm',[(s*.10,0,-.29,.072),(s*.14,-.06,-.49,.08),(s*.15,-.10,-.64,.082)],m['red'],arm)
        for i in range(4):
            angle=i*math.tau/4;spike('yellow wrist feather',(s*.15+math.cos(angle)*.08,-.10+math.sin(angle)*.07,-.59),(s*.15+math.cos(angle)*.12,-.10+math.sin(angle)*.11,-.42),.037,m['yellow'],arm)
        ellipsoid('gray hand',(s*.15,-.10,-.70),(.076,.065,.09),m['gray'],arm)
        for i in range(3):sweep('clawed finger',[(s*.15+(i-1)*.05,-.12,-.72,.022),(s*.15+(i-1)*.058,-.17,-.81,.020),(s*.15+(i-1)*.055,-.22,-.82,.002)],m['gray'],arm)
        socket('hand.'+('L' if s<0 else 'R'),arm,(s*.15,-.10,-.64))
        leg=group('leg.'+('L' if s<0 else 'R'),root,(s*.145,0,.91));limbs[leg.name]=leg
        loft('long flared red leg',[(0,0,0,.11,.115),(s*.03,0,-.28,.14,.14),(s*.07,0,-.57,.19,.15),(s*.09,-.01,-.78,.23,.19)],m['red'],leg)
        if s>0:socket('kick',leg,(s*.09,-.15,-.80))
        # Yellow flame panels rise from the broad trouser cuffs.
        wing('yellow leg flame',[(-.13,-.72),(-.11,-.44),(-.02,-.58),(.015,-.24),(.065,-.52),(.16,-.39),(.16,-.73)],m['yellow'],leg,.035).location=(s*.065,-.16,0)
        foot=ellipsoid('gray bird foot',(s*.09,-.11,-.83),(.16,.23,.08),m['gray'],leg)
        for i in range(3):spike('long foot talon',(s*.09+(i-1)*.10,-.26,-.83),(s*.09+(i-1)*.11,-.40,-.84),.043,m['gray'],leg)
    spike('pointed beak',(0,-.15,.036),(0,-.26,-.047),.065,m['cream'],head)
    socket('ground',root,(0,0,0));socket('look',head,(0,-.25,.10))
    return root,limbs
def kick_animation(root,limbs):
    base_animation(root,limbs)
    leg=limbs['leg.R'];original=tuple(leg.rotation_euler)
    action=bpy.data.actions.get('special_leg.R');leg.animation_data.action=action
    for f in range(1,33):
        phase=(f-1)/32*math.tau
        leg.rotation_euler=(original[0]-math.sin(phase/2)*1.45,original[1],original[2]+math.sin(phase/2)*.12)
        leg.keyframe_insert(data_path='rotation_euler',frame=f)
    leg.animation_data.action=None;leg.rotation_euler=original;bpy.context.scene.frame_set(1)
if __name__=='__main__':
    import common
    base_animation=common.animate;common.animate=kick_animation
    export(CHARACTER,build,__file__)
