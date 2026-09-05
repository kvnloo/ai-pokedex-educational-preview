"""Fit rigid camera projections to manually annotated, unwarped reference crops."""
import json, math
from pathlib import Path
import numpy as np
from scipy.optimize import least_squares
from PIL import Image, ImageDraw
HERE=Path(__file__).resolve().parent
OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v002')

def basis(az,el,roll):
    a,e,r=np.radians([az,el,roll])
    right=np.array([np.cos(a),np.sin(a),0])
    up=np.array([-np.sin(a)*np.sin(e),np.cos(a)*np.sin(e),np.cos(e)])
    normal=np.cross(right,up)
    return np.array([np.cos(r)*right+np.sin(r)*up,-np.sin(r)*right+np.cos(r)*up,normal])

def project(points,cam):
    az,el,roll,scale,tx,ty,d=cam
    p=np.array(points)@basis(az,el,roll).T
    return np.column_stack((tx+scale*p[:,0]/(1-p[:,2]/d),ty-scale*p[:,1]/(1-p[:,2]/d)))

def corners(w,length,angle,view):
    top=np.array([[-w/2,0,0],[w/2,0,0],[w/2,-length,0],[-w/2,-length,0]])
    a=math.radians(-angle if view=='open' else 0)
    rot=np.array([[1,0,0],[0,math.cos(a),-math.sin(a)],[0,math.sin(a),math.cos(a)]])
    top[:,1]+=.004
    top[:,2]=-.001 if view=='open' else .006
    top=top@rot.T+np.array([0,length/2-.004,.011])
    if view=='closed':return top
    top=top[[3,2,1,0]]
    base=np.array([[-w/2,length/2,.005],[w/2,length/2,.005],[w/2,-length/2,.005],[-w/2,-length/2,.005]])
    return np.concatenate([top,base])

def unproject(pixel, cam, origin, axis_x, axis_y):
    r,up,n=basis(*cam[:3]);scale,tx,ty,dist=cam[3:]
    u=(pixel[0]-tx)/scale;v=(ty-pixel[1])/scale
    eq=np.array([r+u*n/dist,up+v*n/dist])
    axes=np.column_stack((axis_x,axis_y))
    return list(np.linalg.solve(eq@axes,np.array([u,v])-eq@np.array(origin)))

def main():
    refs=json.loads((HERE/'references.json').read_text()); result={}
    for variant,ref in refs.items():
        def residual(p):
            length,angle=p[:2]
            return np.concatenate([(project(corners(ref['width'],length,angle,v),p[2+i*7:9+i*7])-ref[v]['corners']).ravel() for i,v in enumerate(['closed','open'])])
        p0=[.14,108, 5,76,-5,2500,150,220,.8, 4,25,-2,2600,145,355,.8]
        lo=[.11,95,-65,73,-60,1500,50,100,.35,-25,10,-20,1500,50,200,.35]
        hi=[.17,155,65,89,60,4000,250,350,4,25,50,20,4000,250,450,4]
        fit=least_squares(residual,p0,bounds=(lo,hi),max_nfev=5000)
        p=fit.x
        result[variant]={'width':ref['width'],'length':float(p[0]),'angle':float(p[1]),'corner_rms_px':float(np.sqrt(np.mean(fit.fun**2))),'cameras':{v:list(p[2+i*7:9+i*7]) for i,v in enumerate(['closed','open'])}}
        result[variant]['layout']={}
        for view in ['closed','open']:
            a=math.radians(-p[1] if view=='open' else 0)
            lid_origin=[0,p[0]/2-.004+(.001 if view=='open' else -.006)*math.sin(a),.011+(-.001 if view=='open' else .006)*math.cos(a)]
            def local(pixel,base=False):
                xy=unproject(pixel,result[variant]['cameras'][view],[0,0,.0074] if base else lid_origin,[1,0,0],[0,1,0] if base else [0,math.cos(a),math.sin(a)])
                if not base:xy[1]-=.004
                return xy
            result[variant]['layout'][view]={name:local(xy,view=='open' and name in ['ring','dpad','button','hinge_left','hinge_right']) for name,xy in ref[view]['landmarks'].items()}
            if view=='closed':
                result[variant]['layout'][view]['panel_lines']=[[local(xy) for xy in line] for line in ref[view]['panel_lines']]
            im=Image.open(OUT/f'evidence/{variant}-{view}-reference.png').convert('RGB');d=ImageDraw.Draw(im)
            d.line(ref[view]['outline']+[ref[view]['outline'][0]],fill='#00ffb4',width=2)
            for line in ref[view]['panel_lines']:d.line(line,fill='#ffe277',width=2)
            for name,(x,y) in ref[view]['landmarks'].items():
                d.ellipse((x-3,y-3,x+3,y+3),outline='#ff70ef',width=1)
            proj=project(corners(ref['width'],p[0],p[1],view),result[variant]['cameras'][view])
            for x,y in proj:d.line((x-3,y,x+3,y),fill='white',width=1);d.line((x,y-3,x,y+3),fill='white',width=1)
            im.resize((im.width*2,im.height*2)).save(OUT/f'evidence/{variant}-{view}-trace.png')
        print(variant,result[variant])
    (HERE/'contract.json').write_text(json.dumps(result,indent=2)+'\n')
if __name__=='__main__':main()
