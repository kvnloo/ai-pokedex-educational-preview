"""Deterministic 512px microfinish recipes; the caller owns the output directory."""
import bpy
import numpy as np
import math
OUT=None

def image(name,pixels):
    height,width,_=pixels.shape
    im=bpy.data.images.new(name,width=width,height=height,alpha=True)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(pixels.astype(np.float32).ravel())
    im.filepath_raw=str(OUT/'textures'/(name+'.png'));im.file_format='PNG';im.save();im.pack()
    return im

def finish_maps(name,roughness,amplitude,seed,brushed=False):
    rng=np.random.default_rng(seed);size=512
    noise=rng.normal(0,1,(size,size))
    fy=np.fft.fftfreq(size)[:,None];fx=np.fft.fftfreq(size)[None,:]
    kernel=np.exp(-2*math.pi**2*(fx**2*(.7 if brushed else .9)**2+fy**2*(7 if brushed else .9)**2))
    field=np.fft.ifft2(np.fft.fft2(noise)*kernel).real;field/=max(field.std(),1e-9)
    field=np.clip(field,-2.5,2.5)/2.5
    rgba=np.ones((size,size,4));rgba[:,:,:3]=(roughness+field*amplitude)[:,:,None]
    rough=image('pdx-'+name+'-roughness',rgba)
    dx=(np.roll(field,-1,1)-np.roll(field,1,1))*.018
    dy=(np.roll(field,-1,0)-np.roll(field,1,0))*.018
    normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1);normal/=np.linalg.norm(normal,axis=-1)[:,:,None]
    rgba[:,:,:3]=normal*.5+.5
    return rough,image('pdx-'+name+'-normal',rgba)
