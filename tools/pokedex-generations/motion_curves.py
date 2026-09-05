"""Reusable NLA curves and core-TRS material drivers from the existing asset pipeline."""
import bpy

def keys(obj,clip,path,points,interpolation='BEZIER'):
    name,start,end=clip
    obj.animation_data_create()
    existing=next((t for t in obj.animation_data.nla_tracks if t.name==name),None)
    action=existing.strips[0].action if existing else bpy.data.actions.new(name+'__'+obj.name)
    obj.animation_data.action=action
    if existing:obj.animation_data.action_slot=existing.strips[0].action_slot
    for frame,value in points:
        setattr(obj,path,value);obj.keyframe_insert(data_path=path,frame=frame,group=obj.name)
    slot=obj.animation_data.action_slot
    for layer in action.layers:
        for strip in layer.strips:
            bag=strip.channelbag(slot)
            for curve in bag.fcurves:
                for point in curve.keyframe_points:
                    point.interpolation=interpolation;point.handle_left_type='AUTO_CLAMPED';point.handle_right_type='AUTO_CLAMPED'
    obj.animation_data.action=None
    if not existing:
        track=obj.animation_data.nla_tracks.new();track.name=name
        strip=track.strips.new(name,start,action);strip.action_slot=slot;strip.action_frame_start=start;strip.action_frame_end=end
        strip.frame_start=start;strip.frame_end=end;strip.extrapolation='NOTHING';strip.blend_type='REPLACE'
    return action

def hold(start,end,value):return [(start,value),(end,value)]

def drive(socket,index,signal,maximum):
    curve=socket.driver_add('default_value',index) if index is not None else socket.driver_add('default_value')
    driver=curve.driver;driver.type='SCRIPTED';var=driver.variables.new();var.name='power';var.type='TRANSFORMS'
    var.targets[0].id=signal;var.targets[0].transform_type='LOC_X';var.targets[0].transform_space='LOCAL_SPACE'
    driver.expression=f'{maximum!r}*max(0,min(1,power))'
