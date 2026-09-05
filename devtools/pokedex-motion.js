export function createPokedexMotion(stage, report) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let target = {x:0,y:0}, shown = {x:0,y:0}, frame = 0, lastTime = 0;
  let enabled = false, neutral = null, hasSample = false, permissionTimer = 0;
  let gesture = null, onSwipe = () => {};
  const clamp = value => Math.max(-1, Math.min(1, value));

  function paint(time) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const dt = Math.min(.05, Math.max(0, (time - (lastTime || time - 16)) / 1000));
    const amount = 1 - Math.exp(-12 * dt);
    lastTime = time;
    shown.x += (target.x - shown.x) * amount;
    shown.y += (target.y - shown.y) * amount;
    stage.style.setProperty('--look-x', `${(shown.x * 7).toFixed(2)}px`);
    stage.style.setProperty('--look-y', `${(shown.y * 5).toFixed(2)}px`);
    stage.style.setProperty('--tilt-x', `${(-shown.y * 3).toFixed(2)}deg`);
    stage.style.setProperty('--tilt-y', `${(shown.x * 4).toFixed(2)}deg`);
    if (Math.abs(target.x-shown.x) + Math.abs(target.y-shown.y) > .002) frame = requestAnimationFrame(paint);
  }
  function aim(x, y) {
    target = {x:clamp(x), y:clamp(y)};
    if (!frame && !document.hidden && !reduced.matches) frame = requestAnimationFrame(paint);
  }
  function reset() { neutral = null; hasSample = false; aim(0,0); }
  function orientation(event) {
    if (!enabled || reduced.matches || document.hidden || event.beta == null || event.gamma == null) return;
    neutral ||= {beta:event.beta,gamma:event.gamma};
    let x = clamp((event.gamma - neutral.gamma) / 22), y = clamp((event.beta - neutral.beta) / 28);
    const angle = ((screen.orientation?.angle ?? window.orientation ?? 0) + 360) % 360;
    if (angle === 90) [x,y] = [y,-x];
    else if (angle === 270) [x,y] = [-y,x];
    else if (angle === 180) [x,y] = [-x,-y];
    aim(x,y);
    if (!hasSample) { hasSample = true; clearTimeout(permissionTimer); report('Tilt active. Hold the phone comfortably.', true); }
  }
  function disable() {
    enabled = false;
    clearTimeout(permissionTimer);
    window.removeEventListener('deviceorientation', orientation);
    reset();
  }
  async function toggle() {
    if (enabled) {disable(); report('Tilt off. Swipe or use the arrow buttons.',false); return;}
    if (reduced.matches) {report('Motion is off to respect your device preference.',false); return;}
    const sensor = window.DeviceOrientationEvent;
    if (!sensor || !window.isSecureContext) {report('Phone tilt is unavailable here. Swipe or use the arrows.',false); return;}
    try {
      const permission = typeof sensor.requestPermission === 'function' ? await sensor.requestPermission() : 'granted';
      if (permission !== 'granted') {report('Tilt permission was not granted. Swipe still works.',false); return;}
      enabled = true; neutral = null; hasSample = false;
      window.addEventListener('deviceorientation',orientation);
      report('Move your phone gently to calibrate tilt.',true);
      permissionTimer = setTimeout(() => {if (!hasSample) {disable();report('No tilt sensor detected. Swipe or use the arrows.',false);}},4000);
    } catch {disable();report('Tilt is unavailable. Swipe or use the arrows.',false);}
  }
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.pointerType === 'mouse') return;
    gesture = {id:event.pointerId,x:event.clientX,y:event.clientY};
  },{passive:true});
  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' && finePointer.matches && !enabled) {
      const rect = stage.getBoundingClientRect();
      aim(((event.clientX-rect.left)/rect.width-.5)*2,((event.clientY-rect.top)/rect.height-.5)*2);
    }
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    if (Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.25) {if(event.cancelable)event.preventDefault();}
  },{passive:false});
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
    gesture=null;
    if (Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.4) onSwipe(dx<0?1:-1);
  },{passive:true});
  stage.addEventListener('pointercancel',()=>{gesture=null;},{passive:true});
  stage.addEventListener('pointerleave',()=>{gesture=null;if(!enabled)aim(0,0);},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;}
    else {reset();}
  });
  screen.orientation?.addEventListener('change',reset);
  reduced.addEventListener('change',()=>{
    if(reduced.matches){disable();cancelAnimationFrame(frame);frame=0;stage.style.removeProperty('--look-x');stage.style.removeProperty('--look-y');stage.style.removeProperty('--tilt-x');stage.style.removeProperty('--tilt-y');shown={x:0,y:0};report('Motion is off to respect your device preference.',false);}
    else report('Motion is available. Tilt stays off until you enable it.',false);
  });
  return {toggle,reset,setSwipeHandler:handler=>{onSwipe=handler;},reducedMotion:()=>reduced.matches};
}
