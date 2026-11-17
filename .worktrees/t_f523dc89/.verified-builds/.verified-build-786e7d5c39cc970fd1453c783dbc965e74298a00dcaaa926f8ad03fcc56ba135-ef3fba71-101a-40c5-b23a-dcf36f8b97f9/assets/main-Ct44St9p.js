(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ru="185",Rp=0,Gu=1,Cp=2,ia=1,Ip=2,Jr=3,Li=0,_n=1,hn=2,Ii=0,Js=1,zn=2,Wu=3,Xu=4,Pp=5,ds=100,Lp=101,Np=102,Dp=103,Up=104,Fp=200,Op=201,Bp=202,kp=203,Qc=204,jc=205,zp=206,Hp=207,Vp=208,Gp=209,Wp=210,Xp=211,qp=212,$p=213,Yp=214,el=0,tl=1,nl=2,nr=3,il=4,sl=5,rl=6,al=7,Gh=0,Kp=1,Zp=2,fi=0,Wh=1,Xh=2,qh=3,au=4,$h=5,Yh=6,Kh=7,qu="attached",Jp="detached",Zh=300,ms=301,ir=302,jo=303,ec=304,Oo=306,sr=1e3,di=1001,Ao=1002,Jt=1003,Jh=1004,Qr=1005,Qt=1006,_o=1007,Ai=1008,In=1009,Qh=1010,jh=1011,ha=1012,ou=1013,pi=1014,Gn=1015,Ni=1016,cu=1017,lu=1018,fa=1020,ef=35902,tf=35899,nf=1021,sf=1022,Wn=1023,Di=1026,fs=1027,uu=1028,du=1029,gs=1030,hu=1031,fu=1033,yo=33776,Mo=33777,So=33778,wo=33779,ol=35840,cl=35841,ll=35842,ul=35843,dl=36196,hl=37492,fl=37496,pl=37488,ml=37489,Ro=37490,gl=37491,xl=37808,vl=37809,_l=37810,yl=37811,Ml=37812,Sl=37813,wl=37814,bl=37815,El=37816,Tl=37817,Al=37818,Rl=37819,Cl=37820,Il=37821,Pl=36492,Ll=36494,Nl=36495,Dl=36283,Ul=36284,Co=36285,Fl=36286,pa=2300,ma=2301,tc=2302,$u=2303,Yu=2400,Ku=2401,Zu=2402,Qp=2500,jp=0,rf=1,Ol=2,em=3200,Bl=0,tm=1,ji="",Vt="srgb",Pn="srgb-linear",Io="linear",At="srgb",As=7680,Ju=519,nm=512,im=513,sm=514,pu=515,rm=516,am=517,mu=518,om=519,kl=35044,Qu="300 es",hi=2e3,ga=2001;function cm(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function lm(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function xa(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function um(){const i=xa("canvas");return i.style.display="block",i}const ju={};function Po(...i){const e="THREE."+i.shift();console.log(e,...i)}function af(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ve(...i){i=af(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Je(...i){i=af(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Qs(...i){const e=i.join(" ");e in ju||(ju[e]=!0,Ve(...i))}function dm(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const hm={[el]:tl,[nl]:rl,[il]:al,[nr]:sl,[tl]:el,[rl]:nl,[al]:il,[sl]:nr};class _s{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const un=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ed=1234567;const sa=Math.PI/180,rr=180/Math.PI;function Xn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(un[i&255]+un[i>>8&255]+un[i>>16&255]+un[i>>24&255]+"-"+un[e&255]+un[e>>8&255]+"-"+un[e>>16&15|64]+un[e>>24&255]+"-"+un[t&63|128]+un[t>>8&255]+"-"+un[t>>16&255]+un[t>>24&255]+un[n&255]+un[n>>8&255]+un[n>>16&255]+un[n>>24&255]).toLowerCase()}function ct(i,e,t){return Math.max(e,Math.min(t,i))}function gu(i,e){return(i%e+e)%e}function fm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function pm(i,e,t){return i!==e?(t-i)/(e-i):0}function ra(i,e,t){return(1-t)*i+t*e}function mm(i,e,t,n){return ra(i,e,1-Math.exp(-t*n))}function gm(i,e=1){return e-Math.abs(gu(i,e*2)-e)}function xm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function vm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function _m(i,e){return i+Math.floor(Math.random()*(e-i+1))}function ym(i,e){return i+Math.random()*(e-i)}function Mm(i){return i*(.5-Math.random())}function Sm(i){i!==void 0&&(ed=i);let e=ed+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function wm(i){return i*sa}function bm(i){return i*rr}function Em(i){return(i&i-1)===0&&i!==0}function Tm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Am(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Rm(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),u=a((e+n)/2),d=r((e-n)/2),h=a((e-n)/2),f=r((n-e)/2),m=a((n-e)/2);switch(s){case"XYX":i.set(o*u,c*d,c*h,o*l);break;case"YZY":i.set(c*h,o*u,c*d,o*l);break;case"ZXZ":i.set(c*d,c*h,o*u,o*l);break;case"XZX":i.set(o*u,c*m,c*f,o*l);break;case"YXY":i.set(c*f,o*u,c*m,o*l);break;case"ZYZ":i.set(c*m,c*f,o*u,o*l);break;default:Ve("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Qn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Rt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const xu={DEG2RAD:sa,RAD2DEG:rr,generateUUID:Xn,clamp:ct,euclideanModulo:gu,mapLinear:fm,inverseLerp:pm,lerp:ra,damp:mm,pingpong:gm,smoothstep:xm,smootherstep:vm,randInt:_m,randFloat:ym,randFloatSpread:Mm,seededRandom:Sm,degToRad:wm,radToDeg:bm,isPowerOfTwo:Em,ceilPowerOfTwo:Tm,floorPowerOfTwo:Am,setQuaternionFromProperEuler:Rm,normalize:Rt,denormalize:Qn};class Te{static{Te.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class mi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],f=r[a+1],m=r[a+2],y=r[a+3];if(d!==y||c!==h||l!==f||u!==m){let p=c*h+l*f+u*m+d*y;p<0&&(h=-h,f=-f,m=-m,y=-y,p=-p);let g=1-o;if(p<.9995){const M=Math.acos(p),S=Math.sin(M);g=Math.sin(g*M)/S,o=Math.sin(o*M)/S,c=c*g+h*o,l=l*g+f*o,u=u*g+m*o,d=d*g+y*o}else{c=c*g+h*o,l=l*g+f*o,u=u*g+m*o,d=d*g+y*o;const M=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=M,l*=M,u*=M,d*=M}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],c=n[s+1],l=n[s+2],u=n[s+3],d=r[a],h=r[a+1],f=r[a+2],m=r[a+3];return e[t]=o*m+u*d+c*f-l*h,e[t+1]=c*m+u*h+l*d-o*f,e[t+2]=l*m+u*f+o*h-c*d,e[t+3]=u*m-o*d-c*h-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(s/2),d=o(r/2),h=c(n/2),f=c(s/2),m=c(r/2);switch(a){case"XYZ":this._x=h*u*d+l*f*m,this._y=l*f*d-h*u*m,this._z=l*u*m+h*f*d,this._w=l*u*d-h*f*m;break;case"YXZ":this._x=h*u*d+l*f*m,this._y=l*f*d-h*u*m,this._z=l*u*m-h*f*d,this._w=l*u*d+h*f*m;break;case"ZXY":this._x=h*u*d-l*f*m,this._y=l*f*d+h*u*m,this._z=l*u*m+h*f*d,this._w=l*u*d-h*f*m;break;case"ZYX":this._x=h*u*d-l*f*m,this._y=l*f*d+h*u*m,this._z=l*u*m-h*f*d,this._w=l*u*d+h*f*m;break;case"YZX":this._x=h*u*d+l*f*m,this._y=l*f*d+h*u*m,this._z=l*u*m-h*f*d,this._w=l*u*d-h*f*m;break;case"XZY":this._x=h*u*d-l*f*m,this._y=l*f*d-h*u*m,this._z=l*u*m+h*f*d,this._w=l*u*d+h*f*m;break;default:Ve("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],d=t[10],h=n+o+d;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-c)*f,this._y=(r-l)*f,this._z=(a-s)*f}else if(n>o&&n>d){const f=2*Math.sqrt(1+n-o-d);this._w=(u-c)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+l)/f}else if(o>d){const f=2*Math.sqrt(1+o-n-d);this._w=(r-l)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(c+u)/f}else{const f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+l)/f,this._y=(c+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-n*l,this._z=r*u+a*l+n*c-s*o,this._w=a*u-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){const l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{static{P.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(td.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(td.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),u=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+c*l+a*d-o*u,this.y=n+c*u+o*l-r*d,this.z=s+c*d+r*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return nc.copy(this).projectOnVector(e),this.sub(nc)}reflect(e){return this.sub(nc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const nc=new P,td=new mi;class it{static{it.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],d=n[7],h=n[2],f=n[5],m=n[8],y=s[0],p=s[3],g=s[6],M=s[1],S=s[4],v=s[7],T=s[2],E=s[5],A=s[8];return r[0]=a*y+o*M+c*T,r[3]=a*p+o*S+c*E,r[6]=a*g+o*v+c*A,r[1]=l*y+u*M+d*T,r[4]=l*p+u*S+d*E,r[7]=l*g+u*v+d*A,r[2]=h*y+f*M+m*T,r[5]=h*p+f*S+m*E,r[8]=h*g+f*v+m*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-n*r*u+n*o*c+s*r*l-s*a*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],d=u*a-o*l,h=o*c-u*r,f=l*r-a*c,m=t*d+n*h+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/m;return e[0]=d*y,e[1]=(s*l-u*n)*y,e[2]=(o*n-s*a)*y,e[3]=h*y,e[4]=(u*t-s*c)*y,e[5]=(s*r-o*t)*y,e[6]=f*y,e[7]=(n*c-l*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return Qs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ic.makeScale(e,t)),this}rotate(e){return Qs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ic.makeRotation(-e)),this}translate(e,t){return Qs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ic.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ic=new it,nd=new it().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),id=new it().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Cm(){const i={enabled:!0,workingColorSpace:Pn,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===At&&(s.r=Pi(s.r),s.g=Pi(s.g),s.b=Pi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===At&&(s.r=js(s.r),s.g=js(s.g),s.b=js(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ji?Io:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Qs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Qs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Pn]:{primaries:e,whitePoint:n,transfer:Io,toXYZ:nd,fromXYZ:id,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Vt},outputColorSpaceConfig:{drawingBufferColorSpace:Vt}},[Vt]:{primaries:e,whitePoint:n,transfer:At,toXYZ:nd,fromXYZ:id,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Vt}}}),i}const dt=Cm();function Pi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function js(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Rs;class Im{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Rs===void 0&&(Rs=xa("canvas")),Rs.width=e.width,Rs.height=e.height;const s=Rs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Rs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=xa("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Pi(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Pi(t[n]/255)*255):t[n]=Pi(t[n]);return{data:t,width:e.width,height:e.height}}else return Ve("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Pm=0;class vu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Pm++}),this.uuid=Xn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(sc(s[a].image)):r.push(sc(s[a]))}else r=sc(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function sc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Im.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ve("Texture: Unable to serialize Texture."),{})}let Lm=0;const rc=new P;class jt extends _s{constructor(e=jt.DEFAULT_IMAGE,t=jt.DEFAULT_MAPPING,n=di,s=di,r=Qt,a=Ai,o=Wn,c=In,l=jt.DEFAULT_ANISOTROPY,u=ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Lm++}),this.uuid=Xn(),this.name="",this.source=new vu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Te(0,0),this.repeat=new Te(1,1),this.center=new Te(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new it,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(rc).x}get height(){return this.source.getSize(rc).y}get depth(){return this.source.getSize(rc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Ve(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case sr:e.x=e.x-Math.floor(e.x);break;case di:e.x=e.x<0?0:1;break;case Ao:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case sr:e.y=e.y-Math.floor(e.y);break;case di:e.y=e.y<0?0:1;break;case Ao:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}jt.DEFAULT_IMAGE=null;jt.DEFAULT_MAPPING=Zh;jt.DEFAULT_ANISOTROPY=1;class It{static{It.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],u=c[4],d=c[8],h=c[1],f=c[5],m=c[9],y=c[2],p=c[6],g=c[10];if(Math.abs(u-h)<.01&&Math.abs(d-y)<.01&&Math.abs(m-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+y)<.1&&Math.abs(m+p)<.1&&Math.abs(l+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const S=(l+1)/2,v=(f+1)/2,T=(g+1)/2,E=(u+h)/4,A=(d+y)/4,_=(m+p)/4;return S>v&&S>T?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=E/n,r=A/n):v>T?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=E/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=A/r,s=_/r),this.set(n,s,r,t),this}let M=Math.sqrt((p-m)*(p-m)+(d-y)*(d-y)+(h-u)*(h-u));return Math.abs(M)<.001&&(M=1),this.x=(p-m)/M,this.y=(d-y)/M,this.z=(h-u)/M,this.w=Math.acos((l+f+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ct(this.x,e.x,t.x),this.y=ct(this.y,e.y,t.y),this.z=ct(this.z,e.z,t.z),this.w=ct(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ct(this.x,e,t),this.y=ct(this.y,e,t),this.z=ct(this.z,e,t),this.w=ct(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ct(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Nm extends _s{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new It(0,0,e,t),this.scissorTest=!1,this.viewport=new It(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new jt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Qt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new vu(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class jn extends Nm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class of extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Dm extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Jt,this.minFilter=Jt,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class rt{static{rt.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,c,l,u,d,h,f,m,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,u,d,h,f,m,y,p)}set(e,t,n,s,r,a,o,c,l,u,d,h,f,m,y,p){const g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=l,g[6]=u,g[10]=d,g[14]=h,g[3]=f,g[7]=m,g[11]=y,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/Cs.setFromMatrixColumn(e,0).length(),r=1/Cs.setFromMatrixColumn(e,1).length(),a=1/Cs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const h=a*u,f=a*d,m=o*u,y=o*d;t[0]=c*u,t[4]=-c*d,t[8]=l,t[1]=f+m*l,t[5]=h-y*l,t[9]=-o*c,t[2]=y-h*l,t[6]=m+f*l,t[10]=a*c}else if(e.order==="YXZ"){const h=c*u,f=c*d,m=l*u,y=l*d;t[0]=h+y*o,t[4]=m*o-f,t[8]=a*l,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=f*o-m,t[6]=y+h*o,t[10]=a*c}else if(e.order==="ZXY"){const h=c*u,f=c*d,m=l*u,y=l*d;t[0]=h-y*o,t[4]=-a*d,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*u,t[9]=y-h*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const h=a*u,f=a*d,m=o*u,y=o*d;t[0]=c*u,t[4]=m*l-f,t[8]=h*l+y,t[1]=c*d,t[5]=y*l+h,t[9]=f*l-m,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const h=a*c,f=a*l,m=o*c,y=o*l;t[0]=c*u,t[4]=y-h*d,t[8]=m*d+f,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=f*d+m,t[10]=h-y*d}else if(e.order==="XZY"){const h=a*c,f=a*l,m=o*c,y=o*l;t[0]=c*u,t[4]=-d,t[8]=l*u,t[1]=h*d+y,t[5]=a*u,t[9]=f*d-m,t[2]=m*d-f,t[6]=o*u,t[10]=y*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Um,e,Fm)}lookAt(e,t,n){const s=this.elements;return Tn.subVectors(e,t),Tn.lengthSq()===0&&(Tn.z=1),Tn.normalize(),Wi.crossVectors(n,Tn),Wi.lengthSq()===0&&(Math.abs(n.z)===1?Tn.x+=1e-4:Tn.z+=1e-4,Tn.normalize(),Wi.crossVectors(n,Tn)),Wi.normalize(),Fa.crossVectors(Tn,Wi),s[0]=Wi.x,s[4]=Fa.x,s[8]=Tn.x,s[1]=Wi.y,s[5]=Fa.y,s[9]=Tn.y,s[2]=Wi.z,s[6]=Fa.z,s[10]=Tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],d=n[5],h=n[9],f=n[13],m=n[2],y=n[6],p=n[10],g=n[14],M=n[3],S=n[7],v=n[11],T=n[15],E=s[0],A=s[4],_=s[8],R=s[12],N=s[1],D=s[5],k=s[9],Z=s[13],ee=s[2],C=s[6],z=s[10],L=s[14],q=s[3],K=s[7],ae=s[11],ue=s[15];return r[0]=a*E+o*N+c*ee+l*q,r[4]=a*A+o*D+c*C+l*K,r[8]=a*_+o*k+c*z+l*ae,r[12]=a*R+o*Z+c*L+l*ue,r[1]=u*E+d*N+h*ee+f*q,r[5]=u*A+d*D+h*C+f*K,r[9]=u*_+d*k+h*z+f*ae,r[13]=u*R+d*Z+h*L+f*ue,r[2]=m*E+y*N+p*ee+g*q,r[6]=m*A+y*D+p*C+g*K,r[10]=m*_+y*k+p*z+g*ae,r[14]=m*R+y*Z+p*L+g*ue,r[3]=M*E+S*N+v*ee+T*q,r[7]=M*A+S*D+v*C+T*K,r[11]=M*_+S*k+v*z+T*ae,r[15]=M*R+S*Z+v*L+T*ue,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],d=e[6],h=e[10],f=e[14],m=e[3],y=e[7],p=e[11],g=e[15],M=c*f-l*h,S=o*f-l*d,v=o*h-c*d,T=a*f-l*u,E=a*h-c*u,A=a*d-o*u;return t*(y*M-p*S+g*v)-n*(m*M-p*T+g*E)+s*(m*S-y*T+g*A)-r*(m*v-y*E+p*A)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],u=e[10];return t*(a*u-o*l)-n*(r*u-o*c)+s*(r*l-a*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],d=e[9],h=e[10],f=e[11],m=e[12],y=e[13],p=e[14],g=e[15],M=t*o-n*a,S=t*c-s*a,v=t*l-r*a,T=n*c-s*o,E=n*l-r*o,A=s*l-r*c,_=u*y-d*m,R=u*p-h*m,N=u*g-f*m,D=d*p-h*y,k=d*g-f*y,Z=h*g-f*p,ee=M*Z-S*k+v*D+T*N-E*R+A*_;if(ee===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/ee;return e[0]=(o*Z-c*k+l*D)*C,e[1]=(s*k-n*Z-r*D)*C,e[2]=(y*A-p*E+g*T)*C,e[3]=(h*E-d*A-f*T)*C,e[4]=(c*N-a*Z-l*R)*C,e[5]=(t*Z-s*N+r*R)*C,e[6]=(p*v-m*A-g*S)*C,e[7]=(u*A-h*v+f*S)*C,e[8]=(a*k-o*N+l*_)*C,e[9]=(n*N-t*k-r*_)*C,e[10]=(m*E-y*v+g*M)*C,e[11]=(d*v-u*E-f*M)*C,e[12]=(o*R-a*D-c*_)*C,e[13]=(t*D-n*R+s*_)*C,e[14]=(y*S-m*T-p*M)*C,e[15]=(u*T-d*S+h*M)*C,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,u=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+n,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,u=a+a,d=o+o,h=r*l,f=r*u,m=r*d,y=a*u,p=a*d,g=o*d,M=c*l,S=c*u,v=c*d,T=n.x,E=n.y,A=n.z;return s[0]=(1-(y+g))*T,s[1]=(f+v)*T,s[2]=(m-S)*T,s[3]=0,s[4]=(f-v)*E,s[5]=(1-(h+g))*E,s[6]=(p+M)*E,s[7]=0,s[8]=(m+S)*A,s[9]=(p-M)*A,s[10]=(1-(h+y))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Cs.set(s[0],s[1],s[2]).length();const o=Cs.set(s[4],s[5],s[6]).length(),c=Cs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Kn.copy(this);const l=1/a,u=1/o,d=1/c;return Kn.elements[0]*=l,Kn.elements[1]*=l,Kn.elements[2]*=l,Kn.elements[4]*=u,Kn.elements[5]*=u,Kn.elements[6]*=u,Kn.elements[8]*=d,Kn.elements[9]*=d,Kn.elements[10]*=d,t.setFromRotationMatrix(Kn),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=hi,c=!1){const l=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s);let m,y;if(c)m=r/(a-r),y=a*r/(a-r);else if(o===hi)m=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===ga)m=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=hi,c=!1){const l=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),f=-(n+s)/(n-s);let m,y;if(c)m=1/(a-r),y=a/(a-r);else if(o===hi)m=-2/(a-r),y=-(a+r)/(a-r);else if(o===ga)m=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=m,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Cs=new P,Kn=new rt,Um=new P(0,0,0),Fm=new P(1,1,1),Wi=new P,Fa=new P,Tn=new P,sd=new rt,rd=new mi;class ts{constructor(e=0,t=0,n=0,s=ts.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-ct(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(ct(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Ve("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return sd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(sd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rd.setFromEuler(this),this.setFromQuaternion(rd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ts.DEFAULT_ORDER="XYZ";class cf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Om=0;const ad=new P,Is=new mi,yi=new rt,Oa=new P,Nr=new P,Bm=new P,km=new mi,od=new P(1,0,0),cd=new P(0,1,0),ld=new P(0,0,1),ud={type:"added"},zm={type:"removed"},Ps={type:"childadded",child:null},ac={type:"childremoved",child:null};class Ut extends _s{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Om++}),this.uuid=Xn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ut.DEFAULT_UP.clone();const e=new P,t=new ts,n=new mi,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new it}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=Ut.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.multiply(Is),this}rotateOnWorldAxis(e,t){return Is.setFromAxisAngle(e,t),this.quaternion.premultiply(Is),this}rotateX(e){return this.rotateOnAxis(od,e)}rotateY(e){return this.rotateOnAxis(cd,e)}rotateZ(e){return this.rotateOnAxis(ld,e)}translateOnAxis(e,t){return ad.copy(e).applyQuaternion(this.quaternion),this.position.add(ad.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(od,e)}translateY(e){return this.translateOnAxis(cd,e)}translateZ(e){return this.translateOnAxis(ld,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Oa.copy(e):Oa.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Nr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yi.lookAt(Nr,Oa,this.up):yi.lookAt(Oa,Nr,this.up),this.quaternion.setFromRotationMatrix(yi),s&&(yi.extractRotation(s.matrixWorld),Is.setFromRotationMatrix(yi),this.quaternion.premultiply(Is.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ud),Ps.child=e,this.dispatchEvent(Ps),Ps.child=null):Je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(zm),ac.child=e,this.dispatchEvent(ac),ac.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ud),Ps.child=e,this.dispatchEvent(Ps),Ps.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Nr,e,Bm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Nr,km,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const d=c[l];r(e.shapes,d)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=s,n;function a(o){const c=[];for(const l in o){const u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}Ut.DEFAULT_UP=new P(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ot extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Hm={type:"move"};class oc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ot,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ot,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ot,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const y of e.hand.values()){const p=t.getJointPose(y,n),g=this._getHandJoint(l,y);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}const u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,m=.005;l.inputState.pinching&&h>f+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=f-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Hm)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ot;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const lf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xi={h:0,s:0,l:0},Ba={h:0,s:0,l:0};function cc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class qe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Vt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,dt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=dt.workingColorSpace){return this.r=e,this.g=t,this.b=n,dt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=dt.workingColorSpace){if(e=gu(e,1),t=ct(t,0,1),n=ct(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=cc(a,r,e+1/3),this.g=cc(a,r,e),this.b=cc(a,r,e-1/3)}return dt.colorSpaceToWorking(this,s),this}setStyle(e,t=Vt){function n(r){r!==void 0&&parseFloat(r)<1&&Ve("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ve("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ve("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Vt){const n=lf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ve("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}copyLinearToSRGB(e){return this.r=js(e.r),this.g=js(e.g),this.b=js(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Vt){return dt.workingToColorSpace(dn.copy(this),e),Math.round(ct(dn.r*255,0,255))*65536+Math.round(ct(dn.g*255,0,255))*256+Math.round(ct(dn.b*255,0,255))}getHexString(e=Vt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=dt.workingColorSpace){dt.workingToColorSpace(dn.copy(this),t);const n=dn.r,s=dn.g,r=dn.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let c,l;const u=(o+a)/2;if(o===a)c=0,l=0;else{const d=a-o;switch(l=u<=.5?d/(a+o):d/(2-a-o),a){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=dt.workingColorSpace){return dt.workingToColorSpace(dn.copy(this),t),e.r=dn.r,e.g=dn.g,e.b=dn.b,e}getStyle(e=Vt){dt.workingToColorSpace(dn.copy(this),e);const t=dn.r,n=dn.g,s=dn.b;return e!==Vt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Xi),this.setHSL(Xi.h+e,Xi.s+t,Xi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Xi),e.getHSL(Ba);const n=ra(Xi.h,Ba.h,t),s=ra(Xi.s,Ba.s,t),r=ra(Xi.l,Ba.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const dn=new qe;qe.NAMES=lf;class _u{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new qe(e),this.near=t,this.far=n}clone(){return new _u(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class uf extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ts,this.environmentIntensity=1,this.environmentRotation=new ts,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Zn=new P,Mi=new P,lc=new P,Si=new P,Ls=new P,Ns=new P,dd=new P,uc=new P,dc=new P,hc=new P,fc=new It,pc=new It,mc=new It;class Hn{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Zn.subVectors(e,t),s.cross(Zn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Zn.subVectors(s,t),Mi.subVectors(n,t),lc.subVectors(e,t);const a=Zn.dot(Zn),o=Zn.dot(Mi),c=Zn.dot(lc),l=Mi.dot(Mi),u=Mi.dot(lc),d=a*l-o*o;if(d===0)return r.set(0,0,0),null;const h=1/d,f=(l*c-o*u)*h,m=(a*u-o*c)*h;return r.set(1-f-m,m,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Si)===null?!1:Si.x>=0&&Si.y>=0&&Si.x+Si.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,Si)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Si.x),c.addScaledVector(a,Si.y),c.addScaledVector(o,Si.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return fc.setScalar(0),pc.setScalar(0),mc.setScalar(0),fc.fromBufferAttribute(e,t),pc.fromBufferAttribute(e,n),mc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(fc,r.x),a.addScaledVector(pc,r.y),a.addScaledVector(mc,r.z),a}static isFrontFacing(e,t,n,s){return Zn.subVectors(n,t),Mi.subVectors(e,t),Zn.cross(Mi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Zn.subVectors(this.c,this.b),Mi.subVectors(this.a,this.b),Zn.cross(Mi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Hn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Hn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Hn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Hn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Hn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Ls.subVectors(s,n),Ns.subVectors(r,n),uc.subVectors(e,n);const c=Ls.dot(uc),l=Ns.dot(uc);if(c<=0&&l<=0)return t.copy(n);dc.subVectors(e,s);const u=Ls.dot(dc),d=Ns.dot(dc);if(u>=0&&d<=u)return t.copy(s);const h=c*d-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(Ls,a);hc.subVectors(e,r);const f=Ls.dot(hc),m=Ns.dot(hc);if(m>=0&&f<=m)return t.copy(r);const y=f*l-c*m;if(y<=0&&l>=0&&m<=0)return o=l/(l-m),t.copy(n).addScaledVector(Ns,o);const p=u*m-f*d;if(p<=0&&d-u>=0&&f-m>=0)return dd.subVectors(r,s),o=(d-u)/(d-u+(f-m)),t.copy(s).addScaledVector(dd,o);const g=1/(p+y+h);return a=y*g,o=h*g,t.copy(n).addScaledVector(Ls,a).addScaledVector(Ns,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class qn{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Jn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Jn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Jn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Jn):Jn.fromBufferAttribute(r,a),Jn.applyMatrix4(e.matrixWorld),this.expandByPoint(Jn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ka.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ka.copy(n.boundingBox)),ka.applyMatrix4(e.matrixWorld),this.union(ka)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Jn),Jn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Dr),za.subVectors(this.max,Dr),Ds.subVectors(e.a,Dr),Us.subVectors(e.b,Dr),Fs.subVectors(e.c,Dr),qi.subVectors(Us,Ds),$i.subVectors(Fs,Us),ss.subVectors(Ds,Fs);let t=[0,-qi.z,qi.y,0,-$i.z,$i.y,0,-ss.z,ss.y,qi.z,0,-qi.x,$i.z,0,-$i.x,ss.z,0,-ss.x,-qi.y,qi.x,0,-$i.y,$i.x,0,-ss.y,ss.x,0];return!gc(t,Ds,Us,Fs,za)||(t=[1,0,0,0,1,0,0,0,1],!gc(t,Ds,Us,Fs,za))?!1:(Ha.crossVectors(qi,$i),t=[Ha.x,Ha.y,Ha.z],gc(t,Ds,Us,Fs,za))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Jn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(wi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),wi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),wi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),wi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),wi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),wi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),wi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),wi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(wi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const wi=[new P,new P,new P,new P,new P,new P,new P,new P],Jn=new P,ka=new qn,Ds=new P,Us=new P,Fs=new P,qi=new P,$i=new P,ss=new P,Dr=new P,za=new P,Ha=new P,rs=new P;function gc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){rs.fromArray(i,r);const o=s.x*Math.abs(rs.x)+s.y*Math.abs(rs.y)+s.z*Math.abs(rs.z),c=e.dot(rs),l=t.dot(rs),u=n.dot(rs);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}const Kt=new P,Va=new Te;let Vm=0;class fn extends _s{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=kl,this.updateRanges=[],this.gpuType=Gn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Va.fromBufferAttribute(this,t),Va.applyMatrix3(e),this.setXY(t,Va.x,Va.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix3(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Rt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),s=Rt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),s=Rt(s,this.array),r=Rt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==kl&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class df extends fn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class hf extends fn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class pt extends fn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Gm=new qn,Ur=new P,xc=new P;class gi{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Gm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ur.subVectors(e,this.center);const t=Ur.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ur,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ur.copy(e.center).add(xc)),this.expandByPoint(Ur.copy(e.center).sub(xc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Wm=0;const Bn=new rt,vc=new Ut,Os=new P,An=new qn,Fr=new qn,sn=new P;class Gt extends _s{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wm++}),this.uuid=Xn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(cm(e)?hf:df)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new it().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Bn.makeRotationFromQuaternion(e),this.applyMatrix4(Bn),this}rotateX(e){return Bn.makeRotationX(e),this.applyMatrix4(Bn),this}rotateY(e){return Bn.makeRotationY(e),this.applyMatrix4(Bn),this}rotateZ(e){return Bn.makeRotationZ(e),this.applyMatrix4(Bn),this}translate(e,t,n){return Bn.makeTranslation(e,t,n),this.applyMatrix4(Bn),this}scale(e,t,n){return Bn.makeScale(e,t,n),this.applyMatrix4(Bn),this}lookAt(e){return vc.lookAt(e),vc.updateMatrix(),this.applyMatrix4(vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Os).negate(),this.translate(Os.x,Os.y,Os.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new pt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ve("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];An.setFromBufferAttribute(r),this.morphTargetsRelative?(sn.addVectors(this.boundingBox.min,An.min),this.boundingBox.expandByPoint(sn),sn.addVectors(this.boundingBox.max,An.max),this.boundingBox.expandByPoint(sn)):(this.boundingBox.expandByPoint(An.min),this.boundingBox.expandByPoint(An.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new gi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(An.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Fr.setFromBufferAttribute(o),this.morphTargetsRelative?(sn.addVectors(An.min,Fr.min),An.expandByPoint(sn),sn.addVectors(An.max,Fr.max),An.expandByPoint(sn)):(An.expandByPoint(Fr.min),An.expandByPoint(Fr.max))}An.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)sn.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(sn));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)sn.fromBufferAttribute(o,l),c&&(Os.fromBufferAttribute(e,l),sn.add(Os)),s=Math.max(s,n.distanceToSquared(sn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new fn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],c=[];for(let _=0;_<n.count;_++)o[_]=new P,c[_]=new P;const l=new P,u=new P,d=new P,h=new Te,f=new Te,m=new Te,y=new P,p=new P;function g(_,R,N){l.fromBufferAttribute(n,_),u.fromBufferAttribute(n,R),d.fromBufferAttribute(n,N),h.fromBufferAttribute(r,_),f.fromBufferAttribute(r,R),m.fromBufferAttribute(r,N),u.sub(l),d.sub(l),f.sub(h),m.sub(h);const D=1/(f.x*m.y-m.x*f.y);isFinite(D)&&(y.copy(u).multiplyScalar(m.y).addScaledVector(d,-f.y).multiplyScalar(D),p.copy(d).multiplyScalar(f.x).addScaledVector(u,-m.x).multiplyScalar(D),o[_].add(y),o[R].add(y),o[N].add(y),c[_].add(p),c[R].add(p),c[N].add(p))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let _=0,R=M.length;_<R;++_){const N=M[_],D=N.start,k=N.count;for(let Z=D,ee=D+k;Z<ee;Z+=3)g(e.getX(Z+0),e.getX(Z+1),e.getX(Z+2))}const S=new P,v=new P,T=new P,E=new P;function A(_){T.fromBufferAttribute(s,_),E.copy(T);const R=o[_];S.copy(R),S.sub(T.multiplyScalar(T.dot(R))).normalize(),v.crossVectors(E,R);const D=v.dot(c[_])<0?-1:1;a.setXYZW(_,S.x,S.y,S.z,D)}for(let _=0,R=M.length;_<R;++_){const N=M[_],D=N.start,k=N.count;for(let Z=D,ee=D+k;Z<ee;Z+=3)A(e.getX(Z+0)),A(e.getX(Z+1)),A(e.getX(Z+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new fn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const s=new P,r=new P,a=new P,o=new P,c=new P,l=new P,u=new P,d=new P;if(e)for(let h=0,f=e.count;h<f;h+=3){const m=e.getX(h+0),y=e.getX(h+1),p=e.getX(h+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,p),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,m),c.fromBufferAttribute(n,y),l.fromBufferAttribute(n,p),o.add(u),c.add(u),l.add(u),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(p,l.x,l.y,l.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)sn.fromBufferAttribute(e,t),sn.normalize(),e.setXYZ(t,sn.x,sn.y,sn.z)}toNonIndexed(){function e(o,c){const l=o.array,u=o.itemSize,d=o.normalized,h=new l.constructor(c.length*u);let f=0,m=0;for(let y=0,p=c.length;y<p;y++){o.isInterleavedBufferAttribute?f=c[y]*o.data.stride+o.offset:f=c[y]*u;for(let g=0;g<u;g++)h[m++]=l[f++]}return new fn(h,u,d)}if(this.index===null)return Ve("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Gt,n=this.index.array,s=this.attributes;for(const o in s){const c=s[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let u=0,d=l.length;u<d;u++){const h=l[u],f=e(h,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let d=0,h=l.length;d<h;d++){const f=l[d];u.push(f.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const l in s){const u=s[l];this.setAttribute(l,u.clone(t))}const r=e.morphAttributes;for(const l in r){const u=[],d=r[l];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,u=a.length;l<u;l++){const d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ff{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=kl,this.updateRanges=[],this.version=0,this.uuid=Xn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Xn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const gn=new P;class ar{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyMatrix4(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyNormalMatrix(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.transformDirection(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Rt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Rt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),s=Rt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Rt(t,this.array),n=Rt(n,this.array),s=Rt(s,this.array),r=Rt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Po("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new fn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ar(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Po("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let Xm=0;class ei extends _s{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xm++}),this.uuid=Xn(),this.name="",this.type="Material",this.blending=Js,this.side=Li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Qc,this.blendDst=jc,this.blendEquation=ds,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new qe(0,0,0),this.blendAlpha=0,this.depthFunc=nr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ju,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=As,this.stencilZFail=As,this.stencilZPass=As,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Ve(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Js&&(n.blending=this.blending),this.side!==Li&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Qc&&(n.blendSrc=this.blendSrc),this.blendDst!==jc&&(n.blendDst=this.blendDst),this.blendEquation!==ds&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==nr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ju&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==As&&(n.stencilFail=this.stencilFail),this.stencilZFail!==As&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==As&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new qe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Te().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Te().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class va extends ei{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new qe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Bs;const Or=new P,ks=new P,zs=new P,Hs=new Te,Br=new Te,pf=new rt,Ga=new P,kr=new P,Wa=new P,hd=new Te,_c=new Te,fd=new Te;class Lo extends Ut{constructor(e=new va){if(super(),this.isSprite=!0,this.type="Sprite",Bs===void 0){Bs=new Gt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new ff(t,5);Bs.setIndex([0,1,2,0,2,3]),Bs.setAttribute("position",new ar(n,3,0,!1)),Bs.setAttribute("uv",new ar(n,2,3,!1))}this.geometry=Bs,this.material=e,this.center=new Te(.5,.5),this.count=1}raycast(e,t){e.camera===null&&Je('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ks.setFromMatrixScale(this.matrixWorld),pf.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),zs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ks.multiplyScalar(-zs.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;Xa(Ga.set(-.5,-.5,0),zs,a,ks,s,r),Xa(kr.set(.5,-.5,0),zs,a,ks,s,r),Xa(Wa.set(.5,.5,0),zs,a,ks,s,r),hd.set(0,0),_c.set(1,0),fd.set(1,1);let o=e.ray.intersectTriangle(Ga,kr,Wa,!1,Or);if(o===null&&(Xa(kr.set(-.5,.5,0),zs,a,ks,s,r),_c.set(0,1),o=e.ray.intersectTriangle(Ga,Wa,kr,!1,Or),o===null))return;const c=e.ray.origin.distanceTo(Or);c<e.near||c>e.far||t.push({distance:c,point:Or.clone(),uv:Hn.getInterpolation(Or,Ga,kr,Wa,hd,_c,fd,new Te),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Xa(i,e,t,n,s,r){Hs.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Br.x=r*Hs.x-s*Hs.y,Br.y=s*Hs.x+r*Hs.y):Br.copy(Hs),i.copy(e),i.x+=Br.x,i.y+=Br.y,i.applyMatrix4(pf)}const bi=new P,yc=new P,qa=new P,Yi=new P,Mc=new P,$a=new P,Sc=new P;class Bo{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,bi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=bi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(bi.copy(this.origin).addScaledVector(this.direction,t),bi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){yc.copy(e).add(t).multiplyScalar(.5),qa.copy(t).sub(e).normalize(),Yi.copy(this.origin).sub(yc);const r=e.distanceTo(t)*.5,a=-this.direction.dot(qa),o=Yi.dot(this.direction),c=-Yi.dot(qa),l=Yi.lengthSq(),u=Math.abs(1-a*a);let d,h,f,m;if(u>0)if(d=a*c-o,h=a*o-c,m=r*u,d>=0)if(h>=-m)if(h<=m){const y=1/u;d*=y,h*=y,f=d*(d+a*h+2*o)+h*(a*d+h+2*c)+l}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*c)+l;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*c)+l;else h<=-m?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-c),r),f=-d*d+h*(h+2*c)+l):h<=m?(d=0,h=Math.min(Math.max(-r,-c),r),f=h*(h+2*c)+l):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-c),r),f=-d*d+h*(h+2*c)+l);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(yc).addScaledVector(qa,h),f}intersectSphere(e,t){bi.subVectors(e.center,this.origin);const n=bi.dot(this.direction),s=bi.dot(bi)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c;const l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return l>=0?(n=(e.min.x-h.x)*l,s=(e.max.x-h.x)*l):(n=(e.max.x-h.x)*l,s=(e.min.x-h.x)*l),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,c=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,c=(e.min.z-h.z)*d),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,bi)!==null}intersectTriangle(e,t,n,s,r){Mc.subVectors(t,e),$a.subVectors(n,e),Sc.crossVectors(Mc,$a);let a=this.direction.dot(Sc),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Yi.subVectors(this.origin,e);const c=o*this.direction.dot($a.crossVectors(Yi,$a));if(c<0)return null;const l=o*this.direction.dot(Mc.cross(Yi));if(l<0||c+l>a)return null;const u=-o*Yi.dot(Sc);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Bt extends ei{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ts,this.combine=Gh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const pd=new rt,as=new Bo,Ya=new gi,md=new P,Ka=new P,Za=new P,Ja=new P,wc=new P,Qa=new P,gd=new P,ja=new P;class ye extends Ut{constructor(e=new Gt,t=new Bt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Qa.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const u=o[c],d=r[c];u!==0&&(wc.fromBufferAttribute(d,e),a?Qa.addScaledVector(wc,u):Qa.addScaledVector(wc.sub(t),u))}t.add(Qa)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ya.copy(n.boundingSphere),Ya.applyMatrix4(r),as.copy(e.ray).recast(e.near),!(Ya.containsPoint(as.origin)===!1&&(as.intersectSphere(Ya,md)===null||as.origin.distanceToSquared(md)>(e.far-e.near)**2))&&(pd.copy(r).invert(),as.copy(e.ray).applyMatrix4(pd),!(n.boundingBox!==null&&as.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,as)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,y=h.length;m<y;m++){const p=h[m],g=a[p.materialIndex],M=Math.max(p.start,f.start),S=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let v=M,T=S;v<T;v+=3){const E=o.getX(v),A=o.getX(v+1),_=o.getX(v+2);s=eo(this,g,e,n,l,u,d,E,A,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const m=Math.max(0,f.start),y=Math.min(o.count,f.start+f.count);for(let p=m,g=y;p<g;p+=3){const M=o.getX(p),S=o.getX(p+1),v=o.getX(p+2);s=eo(this,a,e,n,l,u,d,M,S,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let m=0,y=h.length;m<y;m++){const p=h[m],g=a[p.materialIndex],M=Math.max(p.start,f.start),S=Math.min(c.count,Math.min(p.start+p.count,f.start+f.count));for(let v=M,T=S;v<T;v+=3){const E=v,A=v+1,_=v+2;s=eo(this,g,e,n,l,u,d,E,A,_),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const m=Math.max(0,f.start),y=Math.min(c.count,f.start+f.count);for(let p=m,g=y;p<g;p+=3){const M=p,S=p+1,v=p+2;s=eo(this,a,e,n,l,u,d,M,S,v),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}}function qm(i,e,t,n,s,r,a,o){let c;if(e.side===_n?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===Li,o),c===null)return null;ja.copy(o),ja.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(ja);return l<t.near||l>t.far?null:{distance:l,point:ja.clone(),object:i}}function eo(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,Ka),i.getVertexPosition(c,Za),i.getVertexPosition(l,Ja);const u=qm(i,e,t,n,Ka,Za,Ja,gd);if(u){const d=new P;Hn.getBarycoord(gd,Ka,Za,Ja,d),s&&(u.uv=Hn.getInterpolatedAttribute(s,o,c,l,d,new Te)),r&&(u.uv1=Hn.getInterpolatedAttribute(r,o,c,l,d,new Te)),a&&(u.normal=Hn.getInterpolatedAttribute(a,o,c,l,d,new P),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:c,c:l,normal:new P,materialIndex:0};Hn.getNormal(Ka,Za,Ja,h.normal),u.face=h,u.barycoord=d}return u}const zr=new It,xd=new It,vd=new It,$m=new It,_d=new rt,to=new P,bc=new gi,yd=new rt,Ec=new Bo;class Ym extends ye{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=qu,this.bindMatrix=new rt,this.bindMatrixInverse=new rt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new qn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,to),this.boundingBox.expandByPoint(to)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new gi),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,to),this.boundingSphere.expandByPoint(to)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),bc.copy(this.boundingSphere),bc.applyMatrix4(s),e.ray.intersectsSphere(bc)!==!1&&(yd.copy(s).invert(),Ec.copy(e.ray).applyMatrix4(yd),!(this.boundingBox!==null&&Ec.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ec)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new It,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===qu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Jp?this.bindMatrixInverse.copy(this.bindMatrix).invert():Ve("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;xd.fromBufferAttribute(s.attributes.skinIndex,e),vd.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(zr.copy(t),t.set(0,0,0,0)):(zr.set(...t,1),t.set(0,0,0)),zr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const a=vd.getComponent(r);if(a!==0){const o=xd.getComponent(r);_d.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector($m.copy(zr).applyMatrix4(_d),a)}}return t.isVector4&&(t.w=zr.w),t.applyMatrix4(this.bindMatrixInverse)}}class mf extends Ut{constructor(){super(),this.isBone=!0,this.type="Bone"}}class yu extends jt{constructor(e=null,t=1,n=1,s,r,a,o,c,l=Jt,u=Jt,d,h){super(null,a,o,c,l,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Md=new rt,Km=new rt;class Mu{constructor(e=[],t=[]){this.uuid=Xn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Ve("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new rt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new rt;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Km;Md.multiplyMatrices(o,t[r]),Md.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new Mu(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new yu(t,e,e,Wn,Gn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let a=t[r];a===void 0&&(Ve("Skeleton: No bone found with UUID:",r),a=new mf),this.bones.push(a),this.boneInverses.push(new rt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const a=t[s];e.bones.push(a.uuid);const o=n[s];e.boneInverses.push(o.toArray())}return e}}class zl extends fn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Vs=new rt,Sd=new rt,no=[],wd=new qn,Zm=new rt,Hr=new ye,Vr=new gi;class Jm extends ye{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new zl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Zm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vs),wd.copy(e.boundingBox).applyMatrix4(Vs),this.boundingBox.union(wd)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new gi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Vs),Vr.copy(e.boundingSphere).applyMatrix4(Vs),this.boundingSphere.union(Vr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(Hr.geometry=this.geometry,Hr.material=this.material,Hr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vr.copy(this.boundingSphere),Vr.applyMatrix4(n),e.ray.intersectsSphere(Vr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Vs),Sd.multiplyMatrices(n,Vs),Hr.matrixWorld=Sd,Hr.raycast(e,no);for(let a=0,o=no.length;a<o;a++){const c=no[a];c.instanceId=r,c.object=this,t.push(c)}no.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new zl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new yu(new Float32Array(s*this.count),s,this.count,uu,Gn));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<n.length;l++)a+=n[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;return r[c]=o,r.set(n,c+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Tc=new P,Qm=new P,jm=new it;class us{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Tc.subVectors(n,t).cross(Qm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Tc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||jm.getNormalMatrix(e),s=this.coplanarPoint(Tc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const os=new gi,e0=new Te(.5,.5),io=new P;class Su{constructor(e=new us,t=new us,n=new us,s=new us,r=new us,a=new us){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=hi,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],d=r[5],h=r[6],f=r[7],m=r[8],y=r[9],p=r[10],g=r[11],M=r[12],S=r[13],v=r[14],T=r[15];if(s[0].setComponents(l-a,f-u,g-m,T-M).normalize(),s[1].setComponents(l+a,f+u,g+m,T+M).normalize(),s[2].setComponents(l+o,f+d,g+y,T+S).normalize(),s[3].setComponents(l-o,f-d,g-y,T-S).normalize(),n)s[4].setComponents(c,h,p,v).normalize(),s[5].setComponents(l-c,f-h,g-p,T-v).normalize();else if(s[4].setComponents(l-c,f-h,g-p,T-v).normalize(),t===hi)s[5].setComponents(l+c,f+h,g+p,T+v).normalize();else if(t===ga)s[5].setComponents(c,h,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(e){os.center.set(0,0,0);const t=e0.distanceTo(e.center);return os.radius=.7071067811865476+t,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(io.x=s.normal.x>0?e.max.x:e.min.x,io.y=s.normal.y>0?e.max.y:e.min.y,io.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(io)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class gf extends ei{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new qe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const No=new P,Do=new P,bd=new rt,Gr=new Bo,so=new gi,Ac=new P,Ed=new P;class wu extends Ut{constructor(e=new Gt,t=new gf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)No.fromBufferAttribute(t,s-1),Do.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=No.distanceTo(Do);e.setAttribute("lineDistance",new pt(n,1))}else Ve("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),so.copy(n.boundingSphere),so.applyMatrix4(s),so.radius+=r,e.ray.intersectsSphere(so)===!1)return;bd.copy(s).invert(),Gr.copy(e.ray).applyMatrix4(bd);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),m=Math.min(u.count,a.start+a.count);for(let y=f,p=m-1;y<p;y+=l){const g=u.getX(y),M=u.getX(y+1),S=ro(this,e,Gr,c,g,M,y);S&&t.push(S)}if(this.isLineLoop){const y=u.getX(m-1),p=u.getX(f),g=ro(this,e,Gr,c,y,p,m-1);g&&t.push(g)}}else{const f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let y=f,p=m-1;y<p;y+=l){const g=ro(this,e,Gr,c,y,y+1,y);g&&t.push(g)}if(this.isLineLoop){const y=ro(this,e,Gr,c,m-1,f,m-1);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function ro(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(No.fromBufferAttribute(o,s),Do.fromBufferAttribute(o,r),t.distanceSqToSegment(No,Do,Ac,Ed)>n)return;Ac.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(Ac);if(!(l<e.near||l>e.far))return{distance:l,point:Ed.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const Td=new P,Ad=new P;class t0 extends wu{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Td.fromBufferAttribute(t,s),Ad.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Td.distanceTo(Ad);e.setAttribute("lineDistance",new pt(n,1))}else Ve("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class n0 extends wu{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class bu extends ei{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new qe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Rd=new rt,Hl=new Bo,ao=new gi,oo=new P;class xf extends Ut{constructor(e=new Gt,t=new bu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ao.copy(n.boundingSphere),ao.applyMatrix4(s),ao.radius+=r,e.ray.intersectsSphere(ao)===!1)return;Rd.copy(s).invert(),Hl.copy(e.ray).applyMatrix4(Rd);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,d=n.attributes.position;if(l!==null){const h=Math.max(0,a.start),f=Math.min(l.count,a.start+a.count);for(let m=h,y=f;m<y;m++){const p=l.getX(m);oo.fromBufferAttribute(d,p),Cd(oo,p,c,s,e,t,this)}}else{const h=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let m=h,y=f;m<y;m++)oo.fromBufferAttribute(d,m),Cd(oo,m,c,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Cd(i,e,t,n,s,r,a){const o=Hl.distanceSqToPoint(i);if(o<t){const c=new P;Hl.closestPointToPoint(i,c),c.applyMatrix4(n);const l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class vf extends jt{constructor(e=[],t=ms,n,s,r,a,o,c,l,u){super(e,t,n,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class or extends jt{constructor(e,t,n,s,r,a,o,c,l){super(e,t,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class cr extends jt{constructor(e,t,n=pi,s,r,a,o=Jt,c=Jt,l,u=Di,d=1){if(u!==Di&&u!==fs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:d};super(h,s,r,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vu(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class i0 extends cr{constructor(e,t=pi,n=ms,s,r,a=Jt,o=Jt,c,l=Di){const u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class _f extends jt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Zt extends Gt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],u=[],d=[];let h=0,f=0;m("z","y","x",-1,-1,n,t,e,a,r,0),m("z","y","x",1,-1,n,t,-e,a,r,1),m("x","z","y",1,1,e,n,t,s,a,2),m("x","z","y",1,-1,e,n,-t,s,a,3),m("x","y","z",1,-1,e,t,n,s,r,4),m("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new pt(l,3)),this.setAttribute("normal",new pt(u,3)),this.setAttribute("uv",new pt(d,2));function m(y,p,g,M,S,v,T,E,A,_,R){const N=v/A,D=T/_,k=v/2,Z=T/2,ee=E/2,C=A+1,z=_+1;let L=0,q=0;const K=new P;for(let ae=0;ae<z;ae++){const ue=ae*D-Z;for(let he=0;he<C;he++){const Pe=he*N-k;K[y]=Pe*M,K[p]=ue*S,K[g]=ee,l.push(K.x,K.y,K.z),K[y]=0,K[p]=0,K[g]=E>0?1:-1,u.push(K.x,K.y,K.z),d.push(he/A),d.push(1-ae/_),L+=1}}for(let ae=0;ae<_;ae++)for(let ue=0;ue<A;ue++){const he=h+ue+C*ae,Pe=h+ue+C*(ae+1),st=h+(ue+1)+C*(ae+1),$e=h+(ue+1)+C*ae;c.push(he,Pe,$e),c.push(Pe,st,$e),q+=6}o.addGroup(f,q,R),f+=q,h+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class ui extends Gt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],c=[],l=new P,u=new Te;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let d=0,h=3;d<=t;d++,h+=3){const f=n+d/t*s;l.x=e*Math.cos(f),l.y=e*Math.sin(f),a.push(l.x,l.y,l.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,c.push(u.x,u.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new pt(a,3)),this.setAttribute("normal",new pt(o,3)),this.setAttribute("uv",new pt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ui(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class pn extends Gt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],h=[],f=[];let m=0;const y=[],p=n/2;let g=0;M(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new pt(d,3)),this.setAttribute("normal",new pt(h,3)),this.setAttribute("uv",new pt(f,2));function M(){const v=new P,T=new P;let E=0;const A=(t-e)/n;for(let _=0;_<=r;_++){const R=[],N=_/r,D=N*(t-e)+e;for(let k=0;k<=s;k++){const Z=k/s,ee=Z*c+o,C=Math.sin(ee),z=Math.cos(ee);T.x=D*C,T.y=-N*n+p,T.z=D*z,d.push(T.x,T.y,T.z),v.set(C,A,z).normalize(),h.push(v.x,v.y,v.z),f.push(Z,1-N),R.push(m++)}y.push(R)}for(let _=0;_<s;_++)for(let R=0;R<r;R++){const N=y[R][_],D=y[R+1][_],k=y[R+1][_+1],Z=y[R][_+1];(e>0||R!==0)&&(u.push(N,D,Z),E+=3),(t>0||R!==r-1)&&(u.push(D,k,Z),E+=3)}l.addGroup(g,E,0),g+=E}function S(v){const T=m,E=new Te,A=new P;let _=0;const R=v===!0?e:t,N=v===!0?1:-1;for(let k=1;k<=s;k++)d.push(0,p*N,0),h.push(0,N,0),f.push(.5,.5),m++;const D=m;for(let k=0;k<=s;k++){const ee=k/s*c+o,C=Math.cos(ee),z=Math.sin(ee);A.x=R*z,A.y=p*N,A.z=R*C,d.push(A.x,A.y,A.z),h.push(0,N,0),E.x=C*.5+.5,E.y=z*.5*N+.5,f.push(E.x,E.y),m++}for(let k=0;k<s;k++){const Z=T+k,ee=D+k;v===!0?u.push(ee,ee+1,Z):u.push(ee+1,ee,Z),_+=3}l.addGroup(g,_,v===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class hr extends pn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new hr(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ea extends Gt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],a=[];o(s),l(n),u(),this.setAttribute("position",new pt(r,3)),this.setAttribute("normal",new pt(r.slice(),3)),this.setAttribute("uv",new pt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){const S=new P,v=new P,T=new P;for(let E=0;E<t.length;E+=3)f(t[E+0],S),f(t[E+1],v),f(t[E+2],T),c(S,v,T,M)}function c(M,S,v,T){const E=T+1,A=[];for(let _=0;_<=E;_++){A[_]=[];const R=M.clone().lerp(v,_/E),N=S.clone().lerp(v,_/E),D=E-_;for(let k=0;k<=D;k++)k===0&&_===E?A[_][k]=R:A[_][k]=R.clone().lerp(N,k/D)}for(let _=0;_<E;_++)for(let R=0;R<2*(E-_)-1;R++){const N=Math.floor(R/2);R%2===0?(h(A[_][N+1]),h(A[_+1][N]),h(A[_][N])):(h(A[_][N+1]),h(A[_+1][N+1]),h(A[_+1][N]))}}function l(M){const S=new P;for(let v=0;v<r.length;v+=3)S.x=r[v+0],S.y=r[v+1],S.z=r[v+2],S.normalize().multiplyScalar(M),r[v+0]=S.x,r[v+1]=S.y,r[v+2]=S.z}function u(){const M=new P;for(let S=0;S<r.length;S+=3){M.x=r[S+0],M.y=r[S+1],M.z=r[S+2];const v=p(M)/2/Math.PI+.5,T=g(M)/Math.PI+.5;a.push(v,1-T)}m(),d()}function d(){for(let M=0;M<a.length;M+=6){const S=a[M+0],v=a[M+2],T=a[M+4],E=Math.max(S,v,T),A=Math.min(S,v,T);E>.9&&A<.1&&(S<.2&&(a[M+0]+=1),v<.2&&(a[M+2]+=1),T<.2&&(a[M+4]+=1))}}function h(M){r.push(M.x,M.y,M.z)}function f(M,S){const v=M*3;S.x=e[v+0],S.y=e[v+1],S.z=e[v+2]}function m(){const M=new P,S=new P,v=new P,T=new P,E=new Te,A=new Te,_=new Te;for(let R=0,N=0;R<r.length;R+=9,N+=6){M.set(r[R+0],r[R+1],r[R+2]),S.set(r[R+3],r[R+4],r[R+5]),v.set(r[R+6],r[R+7],r[R+8]),E.set(a[N+0],a[N+1]),A.set(a[N+2],a[N+3]),_.set(a[N+4],a[N+5]),T.copy(M).add(S).add(v).divideScalar(3);const D=p(T);y(E,N+0,M,D),y(A,N+2,S,D),y(_,N+4,v,D)}}function y(M,S,v,T){T<0&&M.x===1&&(a[S]=M.x-1),v.x===0&&v.z===0&&(a[S]=T/2/Math.PI+.5)}function p(M){return Math.atan2(M.z,-M.x)}function g(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ea(e.vertices,e.indices,e.radius,e.detail)}}class Ta extends Ea{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ta(e.radius,e.detail)}}class xi{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ve("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);const u=n[s],h=n[s+1]-u,f=(a-u)/h;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new Te:new P);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new P,s=[],r=[],a=[],o=new P,c=new rt;for(let f=0;f<=e;f++){const m=f/e;s[f]=this.getTangentAt(m,new P)}r[0]=new P,a[0]=new P;let l=Number.MAX_VALUE;const u=Math.abs(s[0].x),d=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=l&&(l=u,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),h<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();const m=Math.acos(ct(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(ct(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(c.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Eu extends xi{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Te){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),h=c-this.aX,f=l-this.aY;c=h*u-f*d+this.aX,l=h*d+f*u+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class s0 extends Eu{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Tu(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,u,d){let h=(a-r)/l-(o-r)/(l+u)+(o-a)/u,f=(o-a)/u-(c-a)/(u+d)+(c-o)/d;h*=u,f*=u,s(a,o,h,f)},calc:function(r){const a=r*r,o=a*r;return i+e*r+t*a+n*o}}}const Id=new P,Pd=new P,Rc=new Tu,Cc=new Tu,Ic=new Tu;class ys extends xi{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new P){const n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,u;this.closed||o>0?l=s[(o-1)%r]:(Pd.subVectors(s[0],s[1]).add(s[0]),l=Pd);const d=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Id.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Id),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let m=Math.pow(l.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(h),f),p=Math.pow(h.distanceToSquared(u),f);y<1e-4&&(y=1),m<1e-4&&(m=y),p<1e-4&&(p=y),Rc.initNonuniformCatmullRom(l.x,d.x,h.x,u.x,m,y,p),Cc.initNonuniformCatmullRom(l.y,d.y,h.y,u.y,m,y,p),Ic.initNonuniformCatmullRom(l.z,d.z,h.z,u.z,m,y,p)}else this.curveType==="catmullrom"&&(Rc.initCatmullRom(l.x,d.x,h.x,u.x,this.tension),Cc.initCatmullRom(l.y,d.y,h.y,u.y,this.tension),Ic.initCatmullRom(l.z,d.z,h.z,u.z,this.tension));return n.set(Rc.calc(c),Cc.calc(c),Ic.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Ld(i,e,t,n,s){const r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function r0(i,e){const t=1-i;return t*t*e}function a0(i,e){return 2*(1-i)*i*e}function o0(i,e){return i*i*e}function aa(i,e,t,n){return r0(i,e)+a0(i,t)+o0(i,n)}function c0(i,e){const t=1-i;return t*t*t*e}function l0(i,e){const t=1-i;return 3*t*t*i*e}function u0(i,e){return 3*(1-i)*i*i*e}function d0(i,e){return i*i*i*e}function oa(i,e,t,n,s){return c0(i,e)+l0(i,t)+u0(i,n)+d0(i,s)}class yf extends xi{constructor(e=new Te,t=new Te,n=new Te,s=new Te){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Te){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(oa(e,s.x,r.x,a.x,o.x),oa(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class h0 extends xi{constructor(e=new P,t=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new P){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(oa(e,s.x,r.x,a.x,o.x),oa(e,s.y,r.y,a.y,o.y),oa(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Mf extends xi{constructor(e=new Te,t=new Te){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Te){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Te){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class f0 extends xi{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Sf extends xi{constructor(e=new Te,t=new Te,n=new Te){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Te){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(aa(e,s.x,r.x,a.x),aa(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class wf extends xi{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(aa(e,s.x,r.x,a.x),aa(e,s.y,r.y,a.y),aa(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class bf extends xi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Te){const n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],u=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(Ld(o,c.x,l.x,u.x,d.x),Ld(o,c.y,l.y,u.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new Te().fromArray(s))}return this}}var Vl=Object.freeze({__proto__:null,ArcCurve:s0,CatmullRomCurve3:ys,CubicBezierCurve:yf,CubicBezierCurve3:h0,EllipseCurve:Eu,LineCurve:Mf,LineCurve3:f0,QuadraticBezierCurve:Sf,QuadraticBezierCurve3:wf,SplineCurve:bf});class p0 extends xi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Vl[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let l=0;l<c.length;l++){const u=c[l];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new Vl[s.type]().fromJSON(s))}return this}}class Nd extends p0{constructor(e){super(),this.type="Path",this.currentPoint=new Te,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Mf(this.currentPoint.clone(),new Te(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new Sf(this.currentPoint.clone(),new Te(e,t),new Te(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){const o=new yf(this.currentPoint.clone(),new Te(e,t),new Te(n,s),new Te(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new bf(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){const o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+o,t+c,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,c){const l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,n,s,r,a,o,c),this}absellipse(e,t,n,s,r,a,o,c){const l=new Eu(e,t,n,s,r,a,o,c);if(this.curves.length>0){const d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);const u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class fr extends Nd{constructor(e){super(e),this.uuid=Xn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new Nd().fromJSON(s))}return this}}function m0(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Ef(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,c,l;if(n&&(r=y0(i,e,r,t)),i.length>80*t){o=i[0],c=i[1];let u=o,d=c;for(let h=t;h<s;h+=t){const f=i[h],m=i[h+1];f<o&&(o=f),m<c&&(c=m),f>u&&(u=f),m>d&&(d=m)}l=Math.max(u-o,d-c),l=l!==0?32767/l:0}return _a(r,a,t,o,c,l,0),a}function Ef(i,e,t,n,s){let r;if(s===P0(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Dd(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Dd(a/n|0,i[a],i[a+1],r);return r&&lr(r,r.next)&&(Ma(r),r=r.next),r}function xs(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(lr(t,t.next)||Ht(t.prev,t,t.next)===0)){if(Ma(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function _a(i,e,t,n,s,r,a){if(!i)return;!a&&r&&E0(i,n,s,r);let o=i;for(;i.prev!==i.next;){const c=i.prev,l=i.next;if(r?x0(i,n,s,r):g0(i)){e.push(c.i,i.i,l.i),Ma(i),i=l.next,o=l.next;continue}if(i=l,i===o){a?a===1?(i=v0(xs(i),e),_a(i,e,t,n,s,r,2)):a===2&&_0(i,e,t,n,s,r):_a(xs(i),e,t,n,s,r,1);break}}}function g0(i){const e=i.prev,t=i,n=i.next;if(Ht(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,c=t.y,l=n.y,u=Math.min(s,r,a),d=Math.min(o,c,l),h=Math.max(s,r,a),f=Math.max(o,c,l);let m=n.next;for(;m!==e;){if(m.x>=u&&m.x<=h&&m.y>=d&&m.y<=f&&jr(s,o,r,c,a,l,m.x,m.y)&&Ht(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function x0(i,e,t,n){const s=i.prev,r=i,a=i.next;if(Ht(s,r,a)>=0)return!1;const o=s.x,c=r.x,l=a.x,u=s.y,d=r.y,h=a.y,f=Math.min(o,c,l),m=Math.min(u,d,h),y=Math.max(o,c,l),p=Math.max(u,d,h),g=Gl(f,m,e,t,n),M=Gl(y,p,e,t,n);let S=i.prevZ,v=i.nextZ;for(;S&&S.z>=g&&v&&v.z<=M;){if(S.x>=f&&S.x<=y&&S.y>=m&&S.y<=p&&S!==s&&S!==a&&jr(o,u,c,d,l,h,S.x,S.y)&&Ht(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=f&&v.x<=y&&v.y>=m&&v.y<=p&&v!==s&&v!==a&&jr(o,u,c,d,l,h,v.x,v.y)&&Ht(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=g;){if(S.x>=f&&S.x<=y&&S.y>=m&&S.y<=p&&S!==s&&S!==a&&jr(o,u,c,d,l,h,S.x,S.y)&&Ht(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=M;){if(v.x>=f&&v.x<=y&&v.y>=m&&v.y<=p&&v!==s&&v!==a&&jr(o,u,c,d,l,h,v.x,v.y)&&Ht(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function v0(i,e){let t=i;do{const n=t.prev,s=t.next.next;!lr(n,s)&&Af(n,t,t.next,s)&&ya(n,s)&&ya(s,n)&&(e.push(n.i,t.i,s.i),Ma(t),Ma(t.next),t=i=s),t=t.next}while(t!==i);return xs(t)}function _0(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&R0(a,o)){let c=Rf(a,o);a=xs(a,a.next),c=xs(c,c.next),_a(a,e,t,n,s,r,0),_a(c,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function y0(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,c=r<a-1?e[r+1]*n:i.length,l=Ef(i,o,c,n,!1);l===l.next&&(l.steiner=!0),s.push(A0(l))}s.sort(M0);for(let r=0;r<s.length;r++)t=S0(s[r],t);return t}function M0(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function S0(i,e){const t=w0(i,e);if(!t)return e;const n=Rf(t,i);return xs(n,n.next),xs(t,t.next)}function w0(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(lr(i,t))return t;do{if(lr(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,a=t.x<t.next.x?t:t.next,d===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,c=a.x,l=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=c&&n!==t.x&&Tf(s<l?n:r,s,c,l,s<l?r:n,s,t.x,t.y)){const d=Math.abs(s-t.y)/(n-t.x);ya(t,i)&&(d<u||d===u&&(t.x>a.x||t.x===a.x&&b0(a,t)))&&(a=t,u=d)}t=t.next}while(t!==o);return a}function b0(i,e){return Ht(i.prev,i,e.prev)<0&&Ht(e.next,i,i.next)<0}function E0(i,e,t,n){let s=i;do s.z===0&&(s.z=Gl(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,T0(s)}function T0(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let l=0;l<t&&(o++,a=a.nextZ,!!a);l++);let c=t;for(;o>0||c>0&&a;)o!==0&&(c===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Gl(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function A0(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Tf(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function jr(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Tf(i,e,t,n,s,r,a,o)}function R0(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!C0(i,e)&&(ya(i,e)&&ya(e,i)&&I0(i,e)&&(Ht(i.prev,i,e.prev)||Ht(i,e.prev,e))||lr(i,e)&&Ht(i.prev,i,i.next)>0&&Ht(e.prev,e,e.next)>0)}function Ht(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function lr(i,e){return i.x===e.x&&i.y===e.y}function Af(i,e,t,n){const s=lo(Ht(i,e,t)),r=lo(Ht(i,e,n)),a=lo(Ht(t,n,i)),o=lo(Ht(t,n,e));return!!(s!==r&&a!==o||s===0&&co(i,t,e)||r===0&&co(i,n,e)||a===0&&co(t,i,n)||o===0&&co(t,e,n))}function co(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function lo(i){return i>0?1:i<0?-1:0}function C0(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Af(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function ya(i,e){return Ht(i.prev,i,i.next)<0?Ht(i,e,i.next)>=0&&Ht(i,i.prev,e)>=0:Ht(i,e,i.prev)<0||Ht(i,i.next,e)<0}function I0(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Rf(i,e){const t=Wl(i.i,i.x,i.y),n=Wl(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Dd(i,e,t,n){const s=Wl(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ma(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Wl(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function P0(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class L0{static triangulate(e,t,n=2){return m0(e,t,n)}}class ca{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return ca.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Ud(e),Fd(n,e);let a=e.length;t.forEach(Ud);for(let c=0;c<t.length;c++)s.push(a),a+=t[c].length,Fd(n,t[c]);const o=L0.triangulate(n,s);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}}function Ud(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Fd(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class ko extends Ea{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ko(e.radius,e.detail)}}class Aa extends Ea{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Aa(e.radius,e.detail)}}class pr extends Gt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,u=c+1,d=e/o,h=t/c,f=[],m=[],y=[],p=[];for(let g=0;g<u;g++){const M=g*h-a;for(let S=0;S<l;S++){const v=S*d-r;m.push(v,-M,0),y.push(0,0,1),p.push(S/o),p.push(1-g/c)}}for(let g=0;g<c;g++)for(let M=0;M<o;M++){const S=M+l*g,v=M+l*(g+1),T=M+1+l*(g+1),E=M+1+l*g;f.push(S,v,E),f.push(v,T,E)}this.setIndex(f),this.setAttribute("position",new pt(m,3)),this.setAttribute("normal",new pt(y,3)),this.setAttribute("uv",new pt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pr(e.width,e.height,e.widthSegments,e.heightSegments)}}class Sa extends Gt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);const o=[],c=[],l=[],u=[];let d=e;const h=(t-e)/s,f=new P,m=new Te;for(let y=0;y<=s;y++){for(let p=0;p<=n;p++){const g=r+p/n*a;f.x=d*Math.cos(g),f.y=d*Math.sin(g),c.push(f.x,f.y,f.z),l.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,u.push(m.x,m.y)}d+=h}for(let y=0;y<s;y++){const p=y*(n+1);for(let g=0;g<n;g++){const M=g+p,S=M,v=M+n+1,T=M+n+2,E=M+1;o.push(S,v,E),o.push(v,T,E)}}this.setIndex(o),this.setAttribute("position",new pt(c,3)),this.setAttribute("normal",new pt(l,3)),this.setAttribute("uv",new pt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Sa(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Ms extends Gt{constructor(e=new fr([new Te(0,.5),new Te(-.5,-.5),new Te(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],s=[],r=[],a=[];let o=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(o,c,u),o+=c,c=0;this.setIndex(n),this.setAttribute("position",new pt(s,3)),this.setAttribute("normal",new pt(r,3)),this.setAttribute("uv",new pt(a,2));function l(u){const d=s.length/3,h=u.extractPoints(t);let f=h.shape;const m=h.holes;ca.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,g=m.length;p<g;p++){const M=m[p];ca.isClockWise(M)===!0&&(m[p]=M.reverse())}const y=ca.triangulateShape(f,m);for(let p=0,g=m.length;p<g;p++){const M=m[p];f=f.concat(M)}for(let p=0,g=f.length;p<g;p++){const M=f[p];s.push(M.x,M.y,0),r.push(0,0,1),a.push(M.x,M.y)}for(let p=0,g=y.length;p<g;p++){const M=y[p],S=M[0]+d,v=M[1]+d,T=M[2]+d;n.push(S,v,T),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return N0(t,e)}static fromJSON(e,t){const n=[];for(let s=0,r=e.shapes.length;s<r;s++){const a=t[e.shapes[s]];n.push(a)}return new Ms(n,e.curveSegments)}}function N0(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){const s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}class ns extends Gt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const u=[],d=new P,h=new P,f=[],m=[],y=[],p=[];for(let g=0;g<=n;g++){const M=[],S=g/n,v=a+S*o,T=e*Math.cos(v),E=Math.sqrt(e*e-T*T);let A=0;g===0&&a===0?A=.5/t:g===n&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){const R=_/t,N=s+R*r;d.x=-E*Math.cos(N),d.y=T,d.z=E*Math.sin(N),m.push(d.x,d.y,d.z),h.copy(d).normalize(),y.push(h.x,h.y,h.z),p.push(R+A,1-S),M.push(l++)}u.push(M)}for(let g=0;g<n;g++)for(let M=0;M<t;M++){const S=u[g][M+1],v=u[g][M],T=u[g+1][M],E=u[g+1][M+1];(g!==0||a>0)&&f.push(S,v,E),(g!==n-1||c<Math.PI)&&f.push(v,T,E)}this.setIndex(f),this.setAttribute("position",new pt(m,3)),this.setAttribute("normal",new pt(y,3)),this.setAttribute("uv",new pt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ns(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ui extends Gt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);const c=[],l=[],u=[],d=[],h=new P,f=new P,m=new P;for(let y=0;y<=n;y++){const p=a+y/n*o;for(let g=0;g<=s;g++){const M=g/s*r;f.x=(e+t*Math.cos(p))*Math.cos(M),f.y=(e+t*Math.cos(p))*Math.sin(M),f.z=t*Math.sin(p),l.push(f.x,f.y,f.z),h.x=e*Math.cos(M),h.y=e*Math.sin(M),m.subVectors(f,h).normalize(),u.push(m.x,m.y,m.z),d.push(g/s),d.push(y/n)}}for(let y=1;y<=n;y++)for(let p=1;p<=s;p++){const g=(s+1)*y+p-1,M=(s+1)*(y-1)+p-1,S=(s+1)*(y-1)+p,v=(s+1)*y+p;c.push(g,M,v),c.push(M,S,v)}this.setIndex(c),this.setAttribute("position",new pt(l,3)),this.setAttribute("normal",new pt(u,3)),this.setAttribute("uv",new pt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ui(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ra extends Gt{constructor(e=new wf(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new P,c=new P,l=new Te;let u=new P;const d=[],h=[],f=[],m=[];y(),this.setIndex(m),this.setAttribute("position",new pt(d,3)),this.setAttribute("normal",new pt(h,3)),this.setAttribute("uv",new pt(f,2));function y(){for(let S=0;S<t;S++)p(S);p(r===!1?t:0),M(),g()}function p(S){u=e.getPointAt(S/t,u);const v=a.normals[S],T=a.binormals[S];for(let E=0;E<=s;E++){const A=E/s*Math.PI*2,_=Math.sin(A),R=-Math.cos(A);c.x=R*v.x+_*T.x,c.y=R*v.y+_*T.y,c.z=R*v.z+_*T.z,c.normalize(),h.push(c.x,c.y,c.z),o.x=u.x+n*c.x,o.y=u.y+n*c.y,o.z=u.z+n*c.z,d.push(o.x,o.y,o.z)}}function g(){for(let S=1;S<=t;S++)for(let v=1;v<=s;v++){const T=(s+1)*(S-1)+(v-1),E=(s+1)*S+(v-1),A=(s+1)*S+v,_=(s+1)*(S-1)+v;m.push(T,E,_),m.push(E,A,_)}}function M(){for(let S=0;S<=t;S++)for(let v=0;v<=s;v++)l.x=S/t,l.y=v/s,f.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Ra(new Vl[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}function ur(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Od(s))s.isRenderTargetTexture?(Ve("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Od(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function xn(i){const e={};for(let t=0;t<i.length;t++){const n=ur(i[t]);for(const s in n)e[s]=n[s]}return e}function Od(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function D0(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Cf(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:dt.workingColorSpace}const U0={clone:ur,merge:xn};var F0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,O0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ti extends ei{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=F0,this.fragmentShader=O0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ur(e.uniforms),this.uniformsGroups=D0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new qe().setHex(s.value);break;case"v2":this.uniforms[n].value=new Te().fromArray(s.value);break;case"v3":this.uniforms[n].value=new P().fromArray(s.value);break;case"v4":this.uniforms[n].value=new It().fromArray(s.value);break;case"m3":this.uniforms[n].value=new it().fromArray(s.value);break;case"m4":this.uniforms[n].value=new rt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class B0 extends ti{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class lt extends ei{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new qe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Bl,this.normalScale=new Te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ts,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ln extends lt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Te(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ct(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new qe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new qe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new qe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class k0 extends ei{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=em,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class z0 extends ei{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function uo(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function H0(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Bd(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)s[a++]=i[o+c]}return s}function V0(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}class mr{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class G0 extends mr{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yu,endingEnd:Yu}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ku:r=e,o=2*t-n;break;case Zu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Ku:a=e,c=2*n-t;break;case Zu:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}const l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,m=(n-t)/(s-t),y=m*m,p=y*m,g=-h*p+2*h*y-h*m,M=(1+h)*p+(-1.5-2*h)*y+(-.5+h)*m+1,S=(-1-f)*p+(1.5+f)*y+.5*m,v=f*p-f*y;for(let T=0;T!==o;++T)r[T]=g*a[u+T]+M*a[l+T]+S*a[c+T]+v*a[d+T];return r}}class W0 extends mr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(n-t)/(s-t),d=1-u;for(let h=0;h!==o;++h)r[h]=a[l+h]*d+a[c+h]*u;return r}}class X0 extends mr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class q0 extends mr{interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this.inTangents,d=this.outTangents;if(!u||!d){const m=(n-t)/(s-t),y=1-m;for(let p=0;p!==o;++p)r[p]=a[l+p]*y+a[c+p]*m;return r}const h=o*2,f=e-1;for(let m=0;m!==o;++m){const y=a[l+m],p=a[c+m],g=f*h+m*2,M=d[g],S=d[g+1],v=e*h+m*2,T=u[v],E=u[v+1];let A=(n-t)/(s-t),_,R,N,D,k;for(let Z=0;Z<8;Z++){_=A*A,R=_*A,N=1-A,D=N*N,k=D*N;const C=k*t+3*D*A*M+3*N*_*T+R*s-n;if(Math.abs(C)<1e-10)break;const z=3*D*(M-t)+6*N*A*(T-M)+3*_*(s-T);if(Math.abs(z)<1e-10)break;A=A-C/z,A=Math.max(0,Math.min(1,A))}r[m]=k*y+3*D*A*S+3*N*_*E+R*p}return r}}class ni{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=uo(t,this.TimeBufferType),this.values=uo(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:uo(e.times,Array),values:uo(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new X0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new W0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new G0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new q0(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case pa:t=this.InterpolantFactoryMethodDiscrete;break;case ma:t=this.InterpolantFactoryMethodLinear;break;case tc:t=this.InterpolantFactoryMethodSmooth;break;case $u:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ve("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return pa;case this.InterpolantFactoryMethodLinear:return ma;case this.InterpolantFactoryMethodSmooth:return tc;case this.InterpolantFactoryMethodBezier:return $u}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Je("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(Je("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){Je("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Je("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&lm(s))for(let o=0,c=s.length;o!==c;++o){const l=s[o];if(isNaN(l)){Je("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===tc,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(s)c=!0;else{const d=o*n,h=d-n,f=d+n;for(let m=0;m!==n;++m){const y=t[d+m];if(y!==t[h+m]||y!==t[f+m]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const d=o*n,h=a*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}ni.prototype.ValueTypeName="";ni.prototype.TimeBufferType=Float32Array;ni.prototype.ValueBufferType=Float32Array;ni.prototype.DefaultInterpolation=ma;class gr extends ni{constructor(e,t,n){super(e,t,n)}}gr.prototype.ValueTypeName="bool";gr.prototype.ValueBufferType=Array;gr.prototype.DefaultInterpolation=pa;gr.prototype.InterpolantFactoryMethodLinear=void 0;gr.prototype.InterpolantFactoryMethodSmooth=void 0;class If extends ni{constructor(e,t,n,s){super(e,t,n,s)}}If.prototype.ValueTypeName="color";class wa extends ni{constructor(e,t,n,s){super(e,t,n,s)}}wa.prototype.ValueTypeName="number";class $0 extends mr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t);let l=e*o;for(let u=l+o;l!==u;l+=4)mi.slerpFlat(r,0,a,l-o,a,l,c);return r}}class ba extends ni{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new $0(this.times,this.values,this.getValueSize(),e)}}ba.prototype.ValueTypeName="quaternion";ba.prototype.InterpolantFactoryMethodSmooth=void 0;class xr extends ni{constructor(e,t,n){super(e,t,n)}}xr.prototype.ValueTypeName="string";xr.prototype.ValueBufferType=Array;xr.prototype.DefaultInterpolation=pa;xr.prototype.InterpolantFactoryMethodLinear=void 0;xr.prototype.InterpolantFactoryMethodSmooth=void 0;class Uo extends ni{constructor(e,t,n,s){super(e,t,n,s)}}Uo.prototype.ValueTypeName="vector";class Y0{constructor(e="",t=-1,n=[],s=Qp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Xn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Z0(n[a]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(ni.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const u=H0(c);c=Bd(c,1,u),l=Bd(l,1,u),!s&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new wa(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],u=l.name.match(r);if(u&&u.length>1){const d=u[1];let h=s[d];h||(s[d]=h=[]),h.push(l)}}const a=[];for(const o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function K0(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return wa;case"vector":case"vector2":case"vector3":case"vector4":return Uo;case"color":return If;case"quaternion":return ba;case"bool":case"boolean":return gr;case"string":return xr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Z0(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=K0(i.type);if(i.times===void 0){const t=[],n=[];V0(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const Ri={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(kd(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!kd(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function kd(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class J0{constructor(e,t,n){const s=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,d){return l.push(u,d),this},this.removeHandler=function(u){const d=l.indexOf(u);return d!==-1&&l.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=l.length;d<h;d+=2){const f=l[d],m=l[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Q0=new J0;class vr{constructor(e){this.manager=e!==void 0?e:Q0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}vr.DEFAULT_MATERIAL_NAME="__DEFAULT";const Ei={};class j0 extends Error{constructor(e,t){super(e),this.response=t}}class Pf extends vr{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Ri.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Ei[e]!==void 0){Ei[e].push({onLoad:t,onProgress:n,onError:s});return}Ei[e]=[],Ei[e].push({onLoad:t,onProgress:n,onError:s});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Ve("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=Ei[e],d=l.body.getReader(),h=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=h?parseInt(h):0,m=f!==0;let y=0;const p=new ReadableStream({start(g){M();function M(){d.read().then(({done:S,value:v})=>{if(S)g.close();else{y+=v.byteLength;const T=new ProgressEvent("progress",{lengthComputable:m,loaded:y,total:f});for(let E=0,A=u.length;E<A;E++){const _=u[E];_.onProgress&&_.onProgress(T)}g.enqueue(v),M()}},S=>{g.error(S)})}}});return new Response(p)}else throw new j0(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return l.json();default:if(o==="")return l.text();{const d=/charset="?([^;"\s]*)"?/i.exec(o),h=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(h);return l.arrayBuffer().then(m=>f.decode(m))}}}).then(l=>{Ri.add(`file:${e}`,l);const u=Ei[e];delete Ei[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onLoad&&f.onLoad(l)}}).catch(l=>{const u=Ei[e];if(u===void 0)throw this.manager.itemError(e),l;delete Ei[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Gs=new WeakMap;class eg extends vr{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Ri.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let d=Gs.get(a);d===void 0&&(d=[],Gs.set(a,d)),d.push({onLoad:t,onError:s})}return a}const o=xa("img");function c(){u(),t&&t(this);const d=Gs.get(this)||[];for(let h=0;h<d.length;h++){const f=d[h];f.onLoad&&f.onLoad(this)}Gs.delete(this),r.manager.itemEnd(e)}function l(d){u(),s&&s(d),Ri.remove(`image:${e}`);const h=Gs.get(this)||[];for(let f=0;f<h.length;f++){const m=h[f];m.onError&&m.onError(d)}Gs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ri.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class tg extends vr{constructor(e){super(e)}load(e,t,n,s){const r=new jt,a=new eg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class Ca extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new qe(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Lf extends Ca{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new qe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Pc=new rt,zd=new P,Hd=new P;class Au{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Te(512,512),this.mapType=In,this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Su,this._frameExtents=new Te(1,1),this._viewportCount=1,this._viewports=[new It(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;zd.setFromMatrixPosition(e.matrixWorld),t.position.copy(zd),Hd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Hd),t.updateMatrixWorld(),Pc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Pc,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===ga||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Pc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ho=new P,fo=new mi,ri=new P;class Nf extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=hi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ho,fo,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ho,fo,ri.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ho,fo,ri),ri.x===1&&ri.y===1&&ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ho,fo,ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ki=new P,Vd=new Te,Gd=new Te;class vn extends Nf{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=rr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(sa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(sa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ki.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ki.x,Ki.y).multiplyScalar(-e/Ki.z),Ki.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ki.x,Ki.y).multiplyScalar(-e/Ki.z)}getViewSize(e,t){return this.getViewBounds(e,Vd,Gd),t.subVectors(Gd,Vd)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(sa*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class ng extends Au{constructor(){super(new vn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=rr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Df extends Ca{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new ng}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class ig extends Au{constructor(){super(new vn(90,1,.5,500)),this.isPointLightShadow=!0}}class Fi extends Ca{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ig}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Ia extends Nf{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class sg extends Au{constructor(){super(new Ia(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ea extends Ca{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new sg}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class rg extends Ca{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class la{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Lc=new WeakMap;class ag extends vr{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Ve("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Ve("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Ri.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(l=>{Lc.has(a)===!0?(s&&s(Lc.get(a)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(l),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);return}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){Ri.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e)}).catch(function(l){s&&s(l),Lc.set(c,l),Ri.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Ri.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Ws=-90,Xs=1;class og extends Ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new vn(Ws,Xs,e,t);s.layers=this.layers,this.add(s);const r=new vn(Ws,Xs,e,t);r.layers=this.layers,this.add(r);const a=new vn(Ws,Xs,e,t);a.layers=this.layers,this.add(a);const o=new vn(Ws,Xs,e,t);o.layers=this.layers,this.add(o);const c=new vn(Ws,Xs,e,t);c.layers=this.layers,this.add(c);const l=new vn(Ws,Xs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===hi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ga)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class cg extends vn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Ru="\\[\\]\\.:\\/",lg=new RegExp("["+Ru+"]","g"),Cu="[^"+Ru+"]",ug="[^"+Ru.replace("\\.","")+"]",dg=/((?:WC+[\/:])*)/.source.replace("WC",Cu),hg=/(WCOD+)?/.source.replace("WCOD",ug),fg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Cu),pg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Cu),mg=new RegExp("^"+dg+hg+fg+pg+"$"),gg=["material","materials","bones","map"];class xg{constructor(e,t,n){const s=n||Ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Ct{constructor(e,t,n){this.path=t,this.parsedPath=n||Ct.parseTrackName(t),this.node=Ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Ct.Composite(e,t,n):new Ct(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(lg,"")}static parseTrackName(e){const t=mg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=n.nodeName.substring(s+1);gg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=Ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ve("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Je("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Je("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Je("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Je("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Je("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const a=e[s];if(a===void 0){const l=t.nodeName;Je("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Ct.Composite=xg;Ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ct.prototype.GetterByBindingType=[Ct.prototype._getValue_direct,Ct.prototype._getValue_array,Ct.prototype._getValue_arrayElement,Ct.prototype._getValue_toArray];Ct.prototype.SetterByBindingTypeAndVersioning=[[Ct.prototype._setValue_direct,Ct.prototype._setValue_direct_setNeedsUpdate,Ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ct.prototype._setValue_array,Ct.prototype._setValue_array_setNeedsUpdate,Ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ct.prototype._setValue_arrayElement,Ct.prototype._setValue_arrayElement_setNeedsUpdate,Ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ct.prototype._setValue_fromArray,Ct.prototype._setValue_fromArray_setNeedsUpdate,Ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Uf{static{Uf.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}}function Wd(i,e,t,n){const s=vg(n);switch(t){case nf:return i*e;case uu:return i*e/s.components*s.byteLength;case du:return i*e/s.components*s.byteLength;case gs:return i*e*2/s.components*s.byteLength;case hu:return i*e*2/s.components*s.byteLength;case sf:return i*e*3/s.components*s.byteLength;case Wn:return i*e*4/s.components*s.byteLength;case fu:return i*e*4/s.components*s.byteLength;case yo:case Mo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case So:case wo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case cl:case ul:return Math.max(i,16)*Math.max(e,8)/4;case ol:case ll:return Math.max(i,8)*Math.max(e,8)/2;case dl:case hl:case pl:case ml:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fl:case Ro:case gl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case xl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case vl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case _l:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case yl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ml:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Sl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case wl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case bl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case El:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Tl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Al:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Rl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Cl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Il:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Pl:case Ll:case Nl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Dl:case Ul:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Co:case Fl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function vg(i){switch(i){case In:case Qh:return{byteLength:1,components:1};case ha:case jh:case Ni:return{byteLength:2,components:1};case cu:case lu:return{byteLength:2,components:4};case pi:case ou:case Gn:return{byteLength:4,components:1};case ef:case tf:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ru}}));typeof window<"u"&&(window.__THREE__?Ve("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ru);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Ff(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function _g(i){const e=new WeakMap;function t(o,c){const l=o.array,u=o.usage,d=l.byteLength,h=i.createBuffer();i.bindBuffer(c,h),i.bufferData(c,l,u),o.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,c,l){const u=c.array,d=c.updateRanges;if(i.bindBuffer(l,o),d.length===0)i.bufferSubData(l,0,u);else{d.sort((f,m)=>f.start-m.start);let h=0;for(let f=1;f<d.length;f++){const m=d[h],y=d[f];y.start<=m.start+m.count+1?m.count=Math.max(m.count,y.start+y.count-m.start):(++h,d[h]=y)}d.length=h+1;for(let f=0,m=d.length;f<m;f++){const y=d[f];i.bufferSubData(l,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var yg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Mg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Sg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,wg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Eg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Tg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ag=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Rg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Cg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ig=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Lg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ng=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Dg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ug=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Fg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Og=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,kg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,zg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Hg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Vg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Gg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Wg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Xg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,qg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$g=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Kg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Jg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Qg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,jg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ex=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,tx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,nx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ix=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ax=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ox=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,cx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ux=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,dx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,hx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,fx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,px=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,mx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gx=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xx=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,vx=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,_x=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,yx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Mx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sx=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,wx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,bx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ex=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ax=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Rx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ix=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Px=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Lx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Nx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Dx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ux=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fx=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ox=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,kx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,zx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Gx=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Wx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,$x=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Yx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Kx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Zx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ev=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,tv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,nv=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,iv=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,sv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,rv=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,av=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ov=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,cv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,lv=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,uv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,dv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,hv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,pv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,mv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,gv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,_v=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const yv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Mv=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wv=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ev=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Av=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Rv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Cv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Iv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Pv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lv=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Nv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Dv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Uv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fv=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ov=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bv=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,kv=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Hv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Vv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Xv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$v=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yv=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Kv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Qv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,jv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ot={alphahash_fragment:yg,alphahash_pars_fragment:Mg,alphamap_fragment:Sg,alphamap_pars_fragment:wg,alphatest_fragment:bg,alphatest_pars_fragment:Eg,aomap_fragment:Tg,aomap_pars_fragment:Ag,batching_pars_vertex:Rg,batching_vertex:Cg,begin_vertex:Ig,beginnormal_vertex:Pg,bsdfs:Lg,iridescence_fragment:Ng,bumpmap_pars_fragment:Dg,clipping_planes_fragment:Ug,clipping_planes_pars_fragment:Fg,clipping_planes_pars_vertex:Og,clipping_planes_vertex:Bg,color_fragment:kg,color_pars_fragment:zg,color_pars_vertex:Hg,color_vertex:Vg,common:Gg,cube_uv_reflection_fragment:Wg,defaultnormal_vertex:Xg,displacementmap_pars_vertex:qg,displacementmap_vertex:$g,emissivemap_fragment:Yg,emissivemap_pars_fragment:Kg,colorspace_fragment:Zg,colorspace_pars_fragment:Jg,envmap_fragment:Qg,envmap_common_pars_fragment:jg,envmap_pars_fragment:ex,envmap_pars_vertex:tx,envmap_physical_pars_fragment:hx,envmap_vertex:nx,fog_vertex:ix,fog_pars_vertex:sx,fog_fragment:rx,fog_pars_fragment:ax,gradientmap_pars_fragment:ox,lightmap_pars_fragment:cx,lights_lambert_fragment:lx,lights_lambert_pars_fragment:ux,lights_pars_begin:dx,lights_toon_fragment:fx,lights_toon_pars_fragment:px,lights_phong_fragment:mx,lights_phong_pars_fragment:gx,lights_physical_fragment:xx,lights_physical_pars_fragment:vx,lights_fragment_begin:_x,lights_fragment_maps:yx,lights_fragment_end:Mx,lightprobes_pars_fragment:Sx,logdepthbuf_fragment:wx,logdepthbuf_pars_fragment:bx,logdepthbuf_pars_vertex:Ex,logdepthbuf_vertex:Tx,map_fragment:Ax,map_pars_fragment:Rx,map_particle_fragment:Cx,map_particle_pars_fragment:Ix,metalnessmap_fragment:Px,metalnessmap_pars_fragment:Lx,morphinstance_vertex:Nx,morphcolor_vertex:Dx,morphnormal_vertex:Ux,morphtarget_pars_vertex:Fx,morphtarget_vertex:Ox,normal_fragment_begin:Bx,normal_fragment_maps:kx,normal_pars_fragment:zx,normal_pars_vertex:Hx,normal_vertex:Vx,normalmap_pars_fragment:Gx,clearcoat_normal_fragment_begin:Wx,clearcoat_normal_fragment_maps:Xx,clearcoat_pars_fragment:qx,iridescence_pars_fragment:$x,opaque_fragment:Yx,packing:Kx,premultiplied_alpha_fragment:Zx,project_vertex:Jx,dithering_fragment:Qx,dithering_pars_fragment:jx,roughnessmap_fragment:ev,roughnessmap_pars_fragment:tv,shadowmap_pars_fragment:nv,shadowmap_pars_vertex:iv,shadowmap_vertex:sv,shadowmask_pars_fragment:rv,skinbase_vertex:av,skinning_pars_vertex:ov,skinning_vertex:cv,skinnormal_vertex:lv,specularmap_fragment:uv,specularmap_pars_fragment:dv,tonemapping_fragment:hv,tonemapping_pars_fragment:fv,transmission_fragment:pv,transmission_pars_fragment:mv,uv_pars_fragment:gv,uv_pars_vertex:xv,uv_vertex:vv,worldpos_vertex:_v,background_vert:yv,background_frag:Mv,backgroundCube_vert:Sv,backgroundCube_frag:wv,cube_vert:bv,cube_frag:Ev,depth_vert:Tv,depth_frag:Av,distance_vert:Rv,distance_frag:Cv,equirect_vert:Iv,equirect_frag:Pv,linedashed_vert:Lv,linedashed_frag:Nv,meshbasic_vert:Dv,meshbasic_frag:Uv,meshlambert_vert:Fv,meshlambert_frag:Ov,meshmatcap_vert:Bv,meshmatcap_frag:kv,meshnormal_vert:zv,meshnormal_frag:Hv,meshphong_vert:Vv,meshphong_frag:Gv,meshphysical_vert:Wv,meshphysical_frag:Xv,meshtoon_vert:qv,meshtoon_frag:$v,points_vert:Yv,points_frag:Kv,shadow_vert:Zv,shadow_frag:Jv,sprite_vert:Qv,sprite_frag:jv},Ie={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new it}},envmap:{envMap:{value:null},envMapRotation:{value:new it},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new it}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new it}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new it},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new it},normalScale:{value:new Te(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new it},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new it}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new it}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new it}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0},uvTransform:{value:new it}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new Te(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}}},li={basic:{uniforms:xn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:ot.meshbasic_vert,fragmentShader:ot.meshbasic_frag},lambert:{uniforms:xn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new qe(0)},envMapIntensity:{value:1}}]),vertexShader:ot.meshlambert_vert,fragmentShader:ot.meshlambert_frag},phong:{uniforms:xn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ot.meshphong_vert,fragmentShader:ot.meshphong_frag},standard:{uniforms:xn([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag},toon:{uniforms:xn([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new qe(0)}}]),vertexShader:ot.meshtoon_vert,fragmentShader:ot.meshtoon_frag},matcap:{uniforms:xn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:ot.meshmatcap_vert,fragmentShader:ot.meshmatcap_frag},points:{uniforms:xn([Ie.points,Ie.fog]),vertexShader:ot.points_vert,fragmentShader:ot.points_frag},dashed:{uniforms:xn([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ot.linedashed_vert,fragmentShader:ot.linedashed_frag},depth:{uniforms:xn([Ie.common,Ie.displacementmap]),vertexShader:ot.depth_vert,fragmentShader:ot.depth_frag},normal:{uniforms:xn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:ot.meshnormal_vert,fragmentShader:ot.meshnormal_frag},sprite:{uniforms:xn([Ie.sprite,Ie.fog]),vertexShader:ot.sprite_vert,fragmentShader:ot.sprite_frag},background:{uniforms:{uvTransform:{value:new it},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ot.background_vert,fragmentShader:ot.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new it}},vertexShader:ot.backgroundCube_vert,fragmentShader:ot.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ot.cube_vert,fragmentShader:ot.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ot.equirect_vert,fragmentShader:ot.equirect_frag},distance:{uniforms:xn([Ie.common,Ie.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ot.distance_vert,fragmentShader:ot.distance_frag},shadow:{uniforms:xn([Ie.lights,Ie.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:ot.shadow_vert,fragmentShader:ot.shadow_frag}};li.physical={uniforms:xn([li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new it},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new it},clearcoatNormalScale:{value:new Te(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new it},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new it},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new it},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new it},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new it},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new it},transmissionSamplerSize:{value:new Te},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new it},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new it},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new it},anisotropyVector:{value:new Te},anisotropyMap:{value:null},anisotropyMapTransform:{value:new it}}]),vertexShader:ot.meshphysical_vert,fragmentShader:ot.meshphysical_frag};const po={r:0,b:0,g:0},e_=new rt,Of=new it;Of.set(-1,0,0,0,1,0,0,0,1);function t_(i,e,t,n,s,r){const a=new qe(0);let o=s===!0?0:1,c,l,u=null,d=0,h=null;function f(M){let S=M.isScene===!0?M.background:null;if(S&&S.isTexture){const v=M.backgroundBlurriness>0;S=e.get(S,v)}return S}function m(M){let S=!1;const v=f(M);v===null?p(a,o):v&&v.isColor&&(p(v,1),S=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(M,S){const v=f(S);v&&(v.isCubeTexture||v.mapping===Oo)?(l===void 0&&(l=new ye(new Zt(1,1,1),new ti({name:"BackgroundCubeMaterial",uniforms:ur(li.backgroundCube.uniforms),vertexShader:li.backgroundCube.vertexShader,fragmentShader:li.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(e_.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Of),l.material.toneMapped=dt.getTransfer(v.colorSpace)!==At,(u!==v||d!==v.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=v,d=v.version,h=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new ye(new pr(2,2),new ti({name:"BackgroundMaterial",uniforms:ur(li.background.uniforms),vertexShader:li.background.vertexShader,fragmentShader:li.background.fragmentShader,side:Li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=dt.getTransfer(v.colorSpace)!==At,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||d!==v.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,d=v.version,h=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,S){M.getRGB(po,Cf(i)),t.buffers.color.setClear(po.r,po.g,po.b,S,r)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,S=1){a.set(M),o=S,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,p(a,o)},render:m,addToRenderList:y,dispose:g}}function n_(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,a=!1;function o(D,k,Z,ee,C){let z=!1;const L=d(D,ee,Z,k);r!==L&&(r=L,l(r.object)),z=f(D,ee,Z,C),z&&m(D,ee,Z,C),C!==null&&e.update(C,i.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,v(D,k,Z,ee),C!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(C).buffer))}function c(){return i.createVertexArray()}function l(D){return i.bindVertexArray(D)}function u(D){return i.deleteVertexArray(D)}function d(D,k,Z,ee){const C=ee.wireframe===!0;let z=n[k.id];z===void 0&&(z={},n[k.id]=z);const L=D.isInstancedMesh===!0?D.id:0;let q=z[L];q===void 0&&(q={},z[L]=q);let K=q[Z.id];K===void 0&&(K={},q[Z.id]=K);let ae=K[C];return ae===void 0&&(ae=h(c()),K[C]=ae),ae}function h(D){const k=[],Z=[],ee=[];for(let C=0;C<t;C++)k[C]=0,Z[C]=0,ee[C]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:k,enabledAttributes:Z,attributeDivisors:ee,object:D,attributes:{},index:null}}function f(D,k,Z,ee){const C=r.attributes,z=k.attributes;let L=0;const q=Z.getAttributes();for(const K in q)if(q[K].location>=0){const ue=C[K];let he=z[K];if(he===void 0&&(K==="instanceMatrix"&&D.instanceMatrix&&(he=D.instanceMatrix),K==="instanceColor"&&D.instanceColor&&(he=D.instanceColor)),ue===void 0||ue.attribute!==he||he&&ue.data!==he.data)return!0;L++}return r.attributesNum!==L||r.index!==ee}function m(D,k,Z,ee){const C={},z=k.attributes;let L=0;const q=Z.getAttributes();for(const K in q)if(q[K].location>=0){let ue=z[K];ue===void 0&&(K==="instanceMatrix"&&D.instanceMatrix&&(ue=D.instanceMatrix),K==="instanceColor"&&D.instanceColor&&(ue=D.instanceColor));const he={};he.attribute=ue,ue&&ue.data&&(he.data=ue.data),C[K]=he,L++}r.attributes=C,r.attributesNum=L,r.index=ee}function y(){const D=r.newAttributes;for(let k=0,Z=D.length;k<Z;k++)D[k]=0}function p(D){g(D,0)}function g(D,k){const Z=r.newAttributes,ee=r.enabledAttributes,C=r.attributeDivisors;Z[D]=1,ee[D]===0&&(i.enableVertexAttribArray(D),ee[D]=1),C[D]!==k&&(i.vertexAttribDivisor(D,k),C[D]=k)}function M(){const D=r.newAttributes,k=r.enabledAttributes;for(let Z=0,ee=k.length;Z<ee;Z++)k[Z]!==D[Z]&&(i.disableVertexAttribArray(Z),k[Z]=0)}function S(D,k,Z,ee,C,z,L){L===!0?i.vertexAttribIPointer(D,k,Z,C,z):i.vertexAttribPointer(D,k,Z,ee,C,z)}function v(D,k,Z,ee){y();const C=ee.attributes,z=Z.getAttributes(),L=k.defaultAttributeValues;for(const q in z){const K=z[q];if(K.location>=0){let ae=C[q];if(ae===void 0&&(q==="instanceMatrix"&&D.instanceMatrix&&(ae=D.instanceMatrix),q==="instanceColor"&&D.instanceColor&&(ae=D.instanceColor)),ae!==void 0){const ue=ae.normalized,he=ae.itemSize,Pe=e.get(ae);if(Pe===void 0)continue;const st=Pe.buffer,$e=Pe.type,j=Pe.bytesPerElement,me=$e===i.INT||$e===i.UNSIGNED_INT||ae.gpuType===ou;if(ae.isInterleavedBufferAttribute){const de=ae.data,He=de.stride,Qe=ae.offset;if(de.isInstancedInterleavedBuffer){for(let Xe=0;Xe<K.locationSize;Xe++)g(K.location+Xe,de.meshPerAttribute);D.isInstancedMesh!==!0&&ee._maxInstanceCount===void 0&&(ee._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let Xe=0;Xe<K.locationSize;Xe++)p(K.location+Xe);i.bindBuffer(i.ARRAY_BUFFER,st);for(let Xe=0;Xe<K.locationSize;Xe++)S(K.location+Xe,he/K.locationSize,$e,ue,He*j,(Qe+he/K.locationSize*Xe)*j,me)}else{if(ae.isInstancedBufferAttribute){for(let de=0;de<K.locationSize;de++)g(K.location+de,ae.meshPerAttribute);D.isInstancedMesh!==!0&&ee._maxInstanceCount===void 0&&(ee._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let de=0;de<K.locationSize;de++)p(K.location+de);i.bindBuffer(i.ARRAY_BUFFER,st);for(let de=0;de<K.locationSize;de++)S(K.location+de,he/K.locationSize,$e,ue,he*j,he/K.locationSize*de*j,me)}}else if(L!==void 0){const ue=L[q];if(ue!==void 0)switch(ue.length){case 2:i.vertexAttrib2fv(K.location,ue);break;case 3:i.vertexAttrib3fv(K.location,ue);break;case 4:i.vertexAttrib4fv(K.location,ue);break;default:i.vertexAttrib1fv(K.location,ue)}}}}M()}function T(){R();for(const D in n){const k=n[D];for(const Z in k){const ee=k[Z];for(const C in ee){const z=ee[C];for(const L in z)u(z[L].object),delete z[L];delete ee[C]}}delete n[D]}}function E(D){if(n[D.id]===void 0)return;const k=n[D.id];for(const Z in k){const ee=k[Z];for(const C in ee){const z=ee[C];for(const L in z)u(z[L].object),delete z[L];delete ee[C]}}delete n[D.id]}function A(D){for(const k in n){const Z=n[k];for(const ee in Z){const C=Z[ee];if(C[D.id]===void 0)continue;const z=C[D.id];for(const L in z)u(z[L].object),delete z[L];delete C[D.id]}}}function _(D){for(const k in n){const Z=n[k],ee=D.isInstancedMesh===!0?D.id:0,C=Z[ee];if(C!==void 0){for(const z in C){const L=C[z];for(const q in L)u(L[q].object),delete L[q];delete C[z]}delete Z[ee],Object.keys(Z).length===0&&delete n[k]}}}function R(){N(),a=!0,r!==s&&(r=s,l(r.object))}function N(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:R,resetDefaultState:N,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:y,enableAttribute:p,disableUnusedAttributes:M}}function i_(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),t.update(l,n,u))}function o(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let f=0;f<u;f++)h+=l[f];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function s_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==Wn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const _=A===Ni&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==In&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Gn&&!_)}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const u=c(l);u!==l&&(Ve("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Ve("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:m,maxTextureSize:y,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:M,maxVaryings:S,maxFragmentUniforms:v,maxSamples:T,samples:E}}function r_(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new us,o=new it,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){const m=d.clippingPlanes,y=d.clipIntersection,p=d.clipShadows,g=i.get(d);if(!s||m===null||m.length===0||r&&!p)r?u(null):l();else{const M=r?0:n,S=M*4;let v=g.clippingState||null;c.value=v,v=u(m,h,S,f);for(let T=0;T!==S;++T)v[T]=t[T];g.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,m){const y=d!==null?d.length:0;let p=null;if(y!==0){if(p=c.value,m!==!0||p===null){const g=f+y*4,M=h.matrixWorldInverse;o.getNormalMatrix(M),(p===null||p.length<g)&&(p=new Float32Array(g));for(let S=0,v=f;S!==y;++S,v+=4)a.copy(d[S]).applyMatrix4(M,o),a.normal.toArray(p,v),p[v+3]=a.constant}c.value=p,c.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,p}}const es=4,Xd=[.125,.215,.35,.446,.526,.582],hs=20,a_=256,Wr=new Ia,qd=new qe;let Nc=null,Dc=0,Uc=0,Fc=!1;const o_=new P;class $d{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=o_}=r;Nc=this._renderer.getRenderTarget(),Dc=this._renderer.getActiveCubeFace(),Uc=this._renderer.getActiveMipmapLevel(),Fc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Kd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Nc,Dc,Uc),this._renderer.xr.enabled=Fc,e.scissorTest=!1,qs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ms||e.mapping===ir?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Nc=this._renderer.getRenderTarget(),Dc=this._renderer.getActiveCubeFace(),Uc=this._renderer.getActiveMipmapLevel(),Fc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Qt,minFilter:Qt,generateMipmaps:!1,type:Ni,format:Wn,colorSpace:Pn,depthBuffer:!1},s=Yd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Yd(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=c_(r)),this._blurMaterial=u_(r,e,t),this._ggxMaterial=l_(r,e,t)}return s}_compileMaterial(e){const t=new ye(new Gt,e);this._renderer.compile(t,Wr)}_sceneToCubeUV(e,t,n,s,r){const c=new vn(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(qd),d.toneMapping=fi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ye(new Zt,new Bt({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1})));const y=this._backgroundBox,p=y.material;let g=!1;const M=e.background;M?M.isColor&&(p.color.copy(M),e.background=null,g=!0):(p.color.copy(qd),g=!0);for(let S=0;S<6;S++){const v=S%3;v===0?(c.up.set(0,l[S],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[S],r.y,r.z)):v===1?(c.up.set(0,0,l[S]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[S],r.z)):(c.up.set(0,l[S],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[S]));const T=this._cubeSize;qs(s,v*T,S>2?T:0,T,T),d.setRenderTarget(s),g&&d.render(y,c),d.render(e,c)}d.toneMapping=f,d.autoClear=h,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===ms||e.mapping===ir;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Kd());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;qs(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Wr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const c=a.uniforms,l=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-u*u),h=0+l*1.25,f=d*h,{_lodMax:m}=this,y=this._sizeLods[n],p=3*y*(n>m-es?n-m+es:0),g=4*(this._cubeSize-y);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=m-t,qs(r,p,g,3*y,2*y),s.setRenderTarget(r),s.render(o,Wr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=m-n,qs(e,p,g,3*y,2*y),s.setRenderTarget(e),s.render(o,Wr)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Je("blur direction must be either latitudinal or longitudinal!");const u=3,d=this._lodMeshes[s];d.material=l;const h=l.uniforms,f=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*hs-1),y=r/m,p=isFinite(r)?1+Math.floor(u*y):hs;p>hs&&Ve(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${hs}`);const g=[];let M=0;for(let A=0;A<hs;++A){const _=A/y,R=Math.exp(-_*_/2);g.push(R),A===0?M+=R:A<p&&(M+=2*R)}for(let A=0;A<g.length;A++)g[A]=g[A]/M;h.envMap.value=e.texture,h.samples.value=p,h.weights.value=g,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:S}=this;h.dTheta.value=m,h.mipInt.value=S-n;const v=this._sizeLods[s],T=3*v*(s>S-es?s-S+es:0),E=4*(this._cubeSize-v);qs(t,T,E,3*v,2*v),c.setRenderTarget(t),c.render(d,Wr)}}function c_(i){const e=[],t=[],n=[];let s=i;const r=i-es+1+Xd.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let c=1/o;a>i-es?c=Xd[a-i+es-1]:a===0&&(c=0),t.push(c);const l=1/(o-2),u=-l,d=1+l,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,m=6,y=3,p=2,g=1,M=new Float32Array(y*m*f),S=new Float32Array(p*m*f),v=new Float32Array(g*m*f);for(let E=0;E<f;E++){const A=E%3*2/3-1,_=E>2?0:-1,R=[A,_,0,A+2/3,_,0,A+2/3,_+1,0,A,_,0,A+2/3,_+1,0,A,_+1,0];M.set(R,y*m*E),S.set(h,p*m*E);const N=[E,E,E,E,E,E];v.set(N,g*m*E)}const T=new Gt;T.setAttribute("position",new fn(M,y)),T.setAttribute("uv",new fn(S,p)),T.setAttribute("faceIndex",new fn(v,g)),n.push(new ye(T,null)),s>es&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Yd(i,e,t){const n=new jn(i,e,t);return n.texture.mapping=Oo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function qs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function l_(i,e,t){return new ti({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:a_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:zo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function u_(i,e,t){const n=new Float32Array(hs),s=new P(0,1,0);return new ti({name:"SphericalGaussianBlur",defines:{n:hs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function Kd(){return new ti({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function Zd(){return new ti({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function zo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Bf extends jn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new vf(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Zt(5,5,5),r=new ti({name:"CubemapFromEquirect",uniforms:ur(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:_n,blending:Ii});r.uniforms.tEquirect.value=t;const a=new ye(s,r),o=t.minFilter;return t.minFilter===Ai&&(t.minFilter=Qt),new og(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function d_(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,f=!1){return h==null?null:f?a(h):r(h)}function r(h){if(h&&h.isTexture){const f=h.mapping;if(f===jo||f===ec)if(e.has(h)){const m=e.get(h).texture;return o(m,h.mapping)}else{const m=h.image;if(m&&m.height>0){const y=new Bf(m.height);return y.fromEquirectangularTexture(i,h),e.set(h,y),h.addEventListener("dispose",l),o(y.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const f=h.mapping,m=f===jo||f===ec,y=f===ms||f===ir;if(m||y){let p=t.get(h);const g=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==g)return n===null&&(n=new $d(i)),p=m?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{const M=h.image;return m&&M&&M.height>0||y&&M&&c(M)?(n===null&&(n=new $d(i)),p=m?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function o(h,f){return f===jo?h.mapping=ms:f===ec&&(h.mapping=ir),h}function c(h){let f=0;const m=6;for(let y=0;y<m;y++)h[y]!==void 0&&f++;return f===m}function l(h){const f=h.target;f.removeEventListener("dispose",l);const m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function u(h){const f=h.target;f.removeEventListener("dispose",u);const m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function h_(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Qs("WebGLRenderer: "+n+" extension not supported."),s}}}function f_(i,e,t,n){const s={},r=new WeakMap;function a(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const m in h.attributes)e.remove(h.attributes[m]);h.removeEventListener("dispose",a),delete s[h.id];const f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function c(d){const h=d.attributes;for(const f in h)e.update(h[f],i.ARRAY_BUFFER)}function l(d){const h=[],f=d.index,m=d.attributes.position;let y=0;if(m===void 0)return;if(f!==null){const M=f.array;y=f.version;for(let S=0,v=M.length;S<v;S+=3){const T=M[S+0],E=M[S+1],A=M[S+2];h.push(T,E,E,A,A,T)}}else{const M=m.array;y=m.version;for(let S=0,v=M.length/3-1;S<v;S+=3){const T=S+0,E=S+1,A=S+2;h.push(T,E,E,A,A,T)}}const p=new(m.count>=65535?hf:df)(h,1);p.version=y;const g=r.get(d);g&&e.remove(g),r.set(d,p)}function u(d){const h=r.get(d);if(h){const f=d.index;f!==null&&h.version<f.version&&l(d)}else l(d);return r.get(d)}return{get:o,update:c,getWireframeAttribute:u}}function p_(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function c(d,h){i.drawElements(n,h,r,d*a),t.update(h,n,1)}function l(d,h,f){f!==0&&(i.drawElementsInstanced(n,h,r,d*a,f),t.update(h,n,f))}function u(d,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let y=0;for(let p=0;p<f;p++)y+=h[p];t.update(y,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function m_(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Je("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function g_(i,e,t){const n=new WeakMap,s=new It;function r(a,o,c){const l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0;let h=n.get(o);if(h===void 0||h.count!==d){let N=function(){_.dispose(),n.delete(o),o.removeEventListener("dispose",N)};var f=N;h!==void 0&&h.texture.dispose();const m=o.morphAttributes.position!==void 0,y=o.morphAttributes.normal!==void 0,p=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],S=o.morphAttributes.color||[];let v=0;m===!0&&(v=1),y===!0&&(v=2),p===!0&&(v=3);let T=o.attributes.position.count*v,E=1;T>e.maxTextureSize&&(E=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const A=new Float32Array(T*E*4*d),_=new of(A,T,E,d);_.type=Gn,_.needsUpdate=!0;const R=v*4;for(let D=0;D<d;D++){const k=g[D],Z=M[D],ee=S[D],C=T*E*4*D;for(let z=0;z<k.count;z++){const L=z*R;m===!0&&(s.fromBufferAttribute(k,z),A[C+L+0]=s.x,A[C+L+1]=s.y,A[C+L+2]=s.z,A[C+L+3]=0),y===!0&&(s.fromBufferAttribute(Z,z),A[C+L+4]=s.x,A[C+L+5]=s.y,A[C+L+6]=s.z,A[C+L+7]=0),p===!0&&(s.fromBufferAttribute(ee,z),A[C+L+8]=s.x,A[C+L+9]=s.y,A[C+L+10]=s.z,A[C+L+11]=ee.itemSize===4?s.w:1)}}h={count:d,texture:_,size:new Te(T,E)},n.set(o,h),o.addEventListener("dispose",N)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let m=0;for(let p=0;p<l.length;p++)m+=l[p];const y=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(i,"morphTargetBaseInfluence",y),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function x_(i,e,t,n,s){let r=new WeakMap;function a(l){const u=s.render.frame,d=l.geometry,h=e.get(l,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function o(){r=new WeakMap}function c(l){const u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const v_={[Wh]:"LINEAR_TONE_MAPPING",[Xh]:"REINHARD_TONE_MAPPING",[qh]:"CINEON_TONE_MAPPING",[au]:"ACES_FILMIC_TONE_MAPPING",[Yh]:"AGX_TONE_MAPPING",[Kh]:"NEUTRAL_TONE_MAPPING",[$h]:"CUSTOM_TONE_MAPPING"};function __(i,e,t,n,s,r){const a=new jn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new cr(e,t):void 0}),o=new jn(e,t,{type:Ni,depthBuffer:!1,stencilBuffer:!1}),c=new Gt;c.setAttribute("position",new pt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new pt([0,2,0,0,2,0],2));const l=new B0({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new ye(c,l),d=new Ia(-1,1,1,-1,0,1);let h=null,f=null,m=!1,y,p=null,g=[],M=!1;this.setSize=function(S,v){a.setSize(S,v),o.setSize(S,v);for(let T=0;T<g.length;T++){const E=g[T];E.setSize&&E.setSize(S,v)}},this.setEffects=function(S){g=S,M=g.length>0&&g[0].isRenderPass===!0;const v=a.width,T=a.height;for(let E=0;E<g.length;E++){const A=g[E];A.setSize&&A.setSize(v,T)}},this.begin=function(S,v){if(m||S.toneMapping===fi&&g.length===0)return!1;if(p=v,v!==null){const T=v.width,E=v.height;(a.width!==T||a.height!==E)&&this.setSize(T,E)}return M===!1&&S.setRenderTarget(a),y=S.toneMapping,S.toneMapping=fi,!0},this.hasRenderPass=function(){return M},this.end=function(S,v){S.toneMapping=y,m=!0;let T=a,E=o;for(let A=0;A<g.length;A++){const _=g[A];if(_.enabled!==!1&&(_.render(S,E,T,v),_.needsSwap!==!1)){const R=T;T=E,E=R}}if(h!==S.outputColorSpace||f!==S.toneMapping){h=S.outputColorSpace,f=S.toneMapping,l.defines={},dt.getTransfer(h)===At&&(l.defines.SRGB_TRANSFER="");const A=v_[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,S.setRenderTarget(p),S.render(u,d),p=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}const kf=new jt,Xl=new cr(1,1),zf=new of,Hf=new Dm,Vf=new vf,Jd=[],Qd=[],jd=new Float32Array(16),eh=new Float32Array(9),th=new Float32Array(4);function _r(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Jd[s];if(r===void 0&&(r=new Float32Array(s),Jd[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function en(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function tn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ho(i,e){let t=Qd[e];t===void 0&&(t=new Int32Array(e),Qd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function y_(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function M_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2fv(this.addr,e),tn(t,e)}}function S_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(en(t,e))return;i.uniform3fv(this.addr,e),tn(t,e)}}function w_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4fv(this.addr,e),tn(t,e)}}function b_(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(en(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),tn(t,e)}else{if(en(t,n))return;th.set(n),i.uniformMatrix2fv(this.addr,!1,th),tn(t,n)}}function E_(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(en(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),tn(t,e)}else{if(en(t,n))return;eh.set(n),i.uniformMatrix3fv(this.addr,!1,eh),tn(t,n)}}function T_(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(en(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),tn(t,e)}else{if(en(t,n))return;jd.set(n),i.uniformMatrix4fv(this.addr,!1,jd),tn(t,n)}}function A_(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function R_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2iv(this.addr,e),tn(t,e)}}function C_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;i.uniform3iv(this.addr,e),tn(t,e)}}function I_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4iv(this.addr,e),tn(t,e)}}function P_(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function L_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;i.uniform2uiv(this.addr,e),tn(t,e)}}function N_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;i.uniform3uiv(this.addr,e),tn(t,e)}}function D_(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;i.uniform4uiv(this.addr,e),tn(t,e)}}function U_(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Xl.compareFunction=t.isReversedDepthBuffer()?mu:pu,r=Xl):r=kf,t.setTexture2D(e||r,s)}function F_(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Hf,s)}function O_(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Vf,s)}function B_(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||zf,s)}function k_(i){switch(i){case 5126:return y_;case 35664:return M_;case 35665:return S_;case 35666:return w_;case 35674:return b_;case 35675:return E_;case 35676:return T_;case 5124:case 35670:return A_;case 35667:case 35671:return R_;case 35668:case 35672:return C_;case 35669:case 35673:return I_;case 5125:return P_;case 36294:return L_;case 36295:return N_;case 36296:return D_;case 35678:case 36198:case 36298:case 36306:case 35682:return U_;case 35679:case 36299:case 36307:return F_;case 35680:case 36300:case 36308:case 36293:return O_;case 36289:case 36303:case 36311:case 36292:return B_}}function z_(i,e){i.uniform1fv(this.addr,e)}function H_(i,e){const t=_r(e,this.size,2);i.uniform2fv(this.addr,t)}function V_(i,e){const t=_r(e,this.size,3);i.uniform3fv(this.addr,t)}function G_(i,e){const t=_r(e,this.size,4);i.uniform4fv(this.addr,t)}function W_(i,e){const t=_r(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function X_(i,e){const t=_r(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function q_(i,e){const t=_r(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function $_(i,e){i.uniform1iv(this.addr,e)}function Y_(i,e){i.uniform2iv(this.addr,e)}function K_(i,e){i.uniform3iv(this.addr,e)}function Z_(i,e){i.uniform4iv(this.addr,e)}function J_(i,e){i.uniform1uiv(this.addr,e)}function Q_(i,e){i.uniform2uiv(this.addr,e)}function j_(i,e){i.uniform3uiv(this.addr,e)}function ey(i,e){i.uniform4uiv(this.addr,e)}function ty(i,e,t){const n=this.cache,s=e.length,r=Ho(t,s);en(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Xl:a=kf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function ny(i,e,t){const n=this.cache,s=e.length,r=Ho(t,s);en(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Hf,r[a])}function iy(i,e,t){const n=this.cache,s=e.length,r=Ho(t,s);en(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Vf,r[a])}function sy(i,e,t){const n=this.cache,s=e.length,r=Ho(t,s);en(n,r)||(i.uniform1iv(this.addr,r),tn(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||zf,r[a])}function ry(i){switch(i){case 5126:return z_;case 35664:return H_;case 35665:return V_;case 35666:return G_;case 35674:return W_;case 35675:return X_;case 35676:return q_;case 5124:case 35670:return $_;case 35667:case 35671:return Y_;case 35668:case 35672:return K_;case 35669:case 35673:return Z_;case 5125:return J_;case 36294:return Q_;case 36295:return j_;case 36296:return ey;case 35678:case 36198:case 36298:case 36306:case 35682:return ty;case 35679:case 36299:case 36307:return ny;case 35680:case 36300:case 36308:case 36293:return iy;case 36289:case 36303:case 36311:case 36292:return sy}}class ay{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=k_(t.type)}}class oy{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ry(t.type)}}class cy{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Oc=/(\w+)(\])?(\[|\.)?/g;function nh(i,e){i.seq.push(e),i.map[e.id]=e}function ly(i,e,t){const n=i.name,s=n.length;for(Oc.lastIndex=0;;){const r=Oc.exec(n),a=Oc.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){nh(t,l===void 0?new ay(o,i,e):new oy(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new cy(o),nh(t,d)),t=d}}}class bo{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);ly(o,c,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function ih(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const uy=37297;let dy=0;function hy(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const sh=new it;function fy(i){dt._getMatrix(sh,dt.workingColorSpace,i);const e=`mat3( ${sh.elements.map(t=>t.toFixed(4))} )`;switch(dt.getTransfer(i)){case Io:return[e,"LinearTransferOETF"];case At:return[e,"sRGBTransferOETF"];default:return Ve("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function rh(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+hy(i.getShaderSource(e),o)}else return r}function py(i,e){const t=fy(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const my={[Wh]:"Linear",[Xh]:"Reinhard",[qh]:"Cineon",[au]:"ACESFilmic",[Yh]:"AgX",[Kh]:"Neutral",[$h]:"Custom"};function gy(i,e){const t=my[e];return t===void 0?(Ve("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const mo=new P;function xy(){dt.getLuminanceCoefficients(mo);const i=mo.x.toFixed(4),e=mo.y.toFixed(4),t=mo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function vy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ta).join(`
`)}function _y(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function yy(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ta(i){return i!==""}function ah(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function oh(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const My=/^[ \t]*#include +<([\w\d./]+)>/gm;function ql(i){return i.replace(My,wy)}const Sy=new Map;function wy(i,e){let t=ot[e];if(t===void 0){const n=Sy.get(e);if(n!==void 0)t=ot[n],Ve('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return ql(t)}const by=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ch(i){return i.replace(by,Ey)}function Ey(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function lh(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Ty={[ia]:"SHADOWMAP_TYPE_PCF",[Jr]:"SHADOWMAP_TYPE_VSM"};function Ay(i){return Ty[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Ry={[ms]:"ENVMAP_TYPE_CUBE",[ir]:"ENVMAP_TYPE_CUBE",[Oo]:"ENVMAP_TYPE_CUBE_UV"};function Cy(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Ry[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const Iy={[ir]:"ENVMAP_MODE_REFRACTION"};function Py(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Iy[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Ly={[Gh]:"ENVMAP_BLENDING_MULTIPLY",[Kp]:"ENVMAP_BLENDING_MIX",[Zp]:"ENVMAP_BLENDING_ADD"};function Ny(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Ly[i.combine]||"ENVMAP_BLENDING_NONE"}function Dy(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Uy(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=Ay(t),l=Cy(t),u=Py(t),d=Ny(t),h=Dy(t),f=vy(t),m=_y(r),y=s.createProgram();let p,g,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(ta).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(ta).join(`
`),g.length>0&&(g+=`
`)):(p=[lh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ta).join(`
`),g=[lh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==fi?"#define TONE_MAPPING":"",t.toneMapping!==fi?ot.tonemapping_pars_fragment:"",t.toneMapping!==fi?gy("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ot.colorspace_pars_fragment,py("linearToOutputTexel",t.outputColorSpace),xy(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ta).join(`
`)),a=ql(a),a=ah(a,t),a=oh(a,t),o=ql(o),o=ah(o,t),o=oh(o,t),a=ch(a),o=ch(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",t.glslVersion===Qu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Qu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const S=M+p+a,v=M+g+o,T=ih(s,s.VERTEX_SHADER,S),E=ih(s,s.FRAGMENT_SHADER,v);s.attachShader(y,T),s.attachShader(y,E),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function A(D){if(i.debug.checkShaderErrors){const k=s.getProgramInfoLog(y)||"",Z=s.getShaderInfoLog(T)||"",ee=s.getShaderInfoLog(E)||"",C=k.trim(),z=Z.trim(),L=ee.trim();let q=!0,K=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,T,E);else{const ae=rh(s,T,"vertex"),ue=rh(s,E,"fragment");Je("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+C+`
`+ae+`
`+ue)}else C!==""?Ve("WebGLProgram: Program Info Log:",C):(z===""||L==="")&&(K=!1);K&&(D.diagnostics={runnable:q,programLog:C,vertexShader:{log:z,prefix:p},fragmentShader:{log:L,prefix:g}})}s.deleteShader(T),s.deleteShader(E),_=new bo(s,y),R=yy(s,y)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let R;this.getAttributes=function(){return R===void 0&&A(this),R};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(y,uy)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=dy++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=E,this}let Fy=0;class Oy{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new By(e),t.set(e,n)),n}}class By{constructor(e){this.id=Fy++,this.code=e,this.usedTimes=0}}function ky(i){return i===gs||i===Ro||i===Co}function zy(i,e,t,n,s,r){const a=new cf,o=new Oy,c=new Set,l=[],u=new Map,d=n.logarithmicDepthBuffer;let h=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(_){return c.add(_),_===0?"uv":`uv${_}`}function y(_,R,N,D,k,Z){const ee=D.fog,C=k.geometry,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?D.environment:null,L=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,q=e.get(_.envMap||z,L),K=q&&q.mapping===Oo?q.image.height:null,ae=f[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&Ve("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));const ue=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,he=ue!==void 0?ue.length:0;let Pe=0;C.morphAttributes.position!==void 0&&(Pe=1),C.morphAttributes.normal!==void 0&&(Pe=2),C.morphAttributes.color!==void 0&&(Pe=3);let st,$e,j,me;if(ae){const Be=li[ae];st=Be.vertexShader,$e=Be.fragmentShader}else{st=_.vertexShader,$e=_.fragmentShader;const Be=o.getVertexShaderStage(_),Nt=o.getFragmentShaderStage(_);o.update(_,Be,Nt),j=Be.id,me=Nt.id}const de=i.getRenderTarget(),He=i.state.buffers.depth.getReversed(),Qe=k.isInstancedMesh===!0,Xe=k.isBatchedMesh===!0,wt=!!_.map,at=!!_.matcap,le=!!q,Se=!!_.aoMap,Ye=!!_.lightMap,V=!!_.bumpMap&&_.wireframe===!1,ht=!!_.normalMap,Ge=!!_.displacementMap,_t=!!_.emissiveMap,vt=!!_.metalnessMap,Pt=!!_.roughnessMap,H=_.anisotropy>0,Wt=_.clearcoat>0,mt=_.dispersion>0,w=_.iridescence>0,x=_.sheen>0,O=_.transmission>0,G=H&&!!_.anisotropyMap,$=Wt&&!!_.clearcoatMap,pe=Wt&&!!_.clearcoatNormalMap,oe=Wt&&!!_.clearcoatRoughnessMap,Q=w&&!!_.iridescenceMap,ne=w&&!!_.iridescenceThicknessMap,xe=x&&!!_.sheenColorMap,De=x&&!!_.sheenRoughnessMap,we=!!_.specularMap,ve=!!_.specularColorMap,ze=!!_.specularIntensityMap,Ue=O&&!!_.transmissionMap,je=O&&!!_.thicknessMap,B=!!_.gradientMap,Me=!!_.alphaMap,se=_.alphaTest>0,be=!!_.alphaHash,Ee=!!_.extensions;let ce=fi;_.toneMapped&&(de===null||de.isXRRenderTarget===!0)&&(ce=i.toneMapping);const Oe={shaderID:ae,shaderType:_.type,shaderName:_.name,vertexShader:st,fragmentShader:$e,defines:_.defines,customVertexShaderID:j,customFragmentShaderID:me,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:Xe,batchingColor:Xe&&k._colorsTexture!==null,instancing:Qe,instancingColor:Qe&&k.instanceColor!==null,instancingMorph:Qe&&k.morphTexture!==null,outputColorSpace:de===null?i.outputColorSpace:de.isXRRenderTarget===!0?de.texture.colorSpace:dt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:wt,matcap:at,envMap:le,envMapMode:le&&q.mapping,envMapCubeUVHeight:K,aoMap:Se,lightMap:Ye,bumpMap:V,normalMap:ht,displacementMap:Ge,emissiveMap:_t,normalMapObjectSpace:ht&&_.normalMapType===tm,normalMapTangentSpace:ht&&_.normalMapType===Bl,packedNormalMap:ht&&_.normalMapType===Bl&&ky(_.normalMap.format),metalnessMap:vt,roughnessMap:Pt,anisotropy:H,anisotropyMap:G,clearcoat:Wt,clearcoatMap:$,clearcoatNormalMap:pe,clearcoatRoughnessMap:oe,dispersion:mt,iridescence:w,iridescenceMap:Q,iridescenceThicknessMap:ne,sheen:x,sheenColorMap:xe,sheenRoughnessMap:De,specularMap:we,specularColorMap:ve,specularIntensityMap:ze,transmission:O,transmissionMap:Ue,thicknessMap:je,gradientMap:B,opaque:_.transparent===!1&&_.blending===Js&&_.alphaToCoverage===!1,alphaMap:Me,alphaTest:se,alphaHash:be,combine:_.combine,mapUv:wt&&m(_.map.channel),aoMapUv:Se&&m(_.aoMap.channel),lightMapUv:Ye&&m(_.lightMap.channel),bumpMapUv:V&&m(_.bumpMap.channel),normalMapUv:ht&&m(_.normalMap.channel),displacementMapUv:Ge&&m(_.displacementMap.channel),emissiveMapUv:_t&&m(_.emissiveMap.channel),metalnessMapUv:vt&&m(_.metalnessMap.channel),roughnessMapUv:Pt&&m(_.roughnessMap.channel),anisotropyMapUv:G&&m(_.anisotropyMap.channel),clearcoatMapUv:$&&m(_.clearcoatMap.channel),clearcoatNormalMapUv:pe&&m(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&m(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&m(_.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&m(_.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&m(_.sheenColorMap.channel),sheenRoughnessMapUv:De&&m(_.sheenRoughnessMap.channel),specularMapUv:we&&m(_.specularMap.channel),specularColorMapUv:ve&&m(_.specularColorMap.channel),specularIntensityMapUv:ze&&m(_.specularIntensityMap.channel),transmissionMapUv:Ue&&m(_.transmissionMap.channel),thicknessMapUv:je&&m(_.thicknessMap.channel),alphaMapUv:Me&&m(_.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(ht||H),vertexNormals:!!C.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!C.attributes.uv&&(wt||Me),fog:!!ee,useFog:_.fog===!0,fogExp2:!!ee&&ee.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||C.attributes.normal===void 0&&ht===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:He,skinning:k.isSkinnedMesh===!0,hasPositionAttribute:C.attributes.position!==void 0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:Pe,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:Z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:ce,decodeVideoTexture:wt&&_.map.isVideoTexture===!0&&dt.getTransfer(_.map.colorSpace)===At,decodeVideoTextureEmissive:_t&&_.emissiveMap.isVideoTexture===!0&&dt.getTransfer(_.emissiveMap.colorSpace)===At,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===hn,flipSided:_.side===_n,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:Ee&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ee&&_.extensions.multiDraw===!0||Xe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Oe.vertexUv1s=c.has(1),Oe.vertexUv2s=c.has(2),Oe.vertexUv3s=c.has(3),c.clear(),Oe}function p(_){const R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(const N in _.defines)R.push(N),R.push(_.defines[N]);return _.isRawShaderMaterial===!1&&(g(R,_),M(R,_),R.push(i.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function g(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function M(_,R){a.disableAll(),R.instancing&&a.enable(0),R.instancingColor&&a.enable(1),R.instancingMorph&&a.enable(2),R.matcap&&a.enable(3),R.envMap&&a.enable(4),R.normalMapObjectSpace&&a.enable(5),R.normalMapTangentSpace&&a.enable(6),R.clearcoat&&a.enable(7),R.iridescence&&a.enable(8),R.alphaTest&&a.enable(9),R.vertexColors&&a.enable(10),R.vertexAlphas&&a.enable(11),R.vertexUv1s&&a.enable(12),R.vertexUv2s&&a.enable(13),R.vertexUv3s&&a.enable(14),R.vertexTangents&&a.enable(15),R.anisotropy&&a.enable(16),R.alphaHash&&a.enable(17),R.batching&&a.enable(18),R.dispersion&&a.enable(19),R.batchingColor&&a.enable(20),R.gradientMap&&a.enable(21),R.packedNormalMap&&a.enable(22),R.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),R.fog&&a.enable(0),R.useFog&&a.enable(1),R.flatShading&&a.enable(2),R.logarithmicDepthBuffer&&a.enable(3),R.reversedDepthBuffer&&a.enable(4),R.skinning&&a.enable(5),R.morphTargets&&a.enable(6),R.morphNormals&&a.enable(7),R.morphColors&&a.enable(8),R.premultipliedAlpha&&a.enable(9),R.shadowMapEnabled&&a.enable(10),R.doubleSided&&a.enable(11),R.flipSided&&a.enable(12),R.useDepthPacking&&a.enable(13),R.dithering&&a.enable(14),R.transmission&&a.enable(15),R.sheen&&a.enable(16),R.opaque&&a.enable(17),R.pointsUvs&&a.enable(18),R.decodeVideoTexture&&a.enable(19),R.decodeVideoTextureEmissive&&a.enable(20),R.alphaToCoverage&&a.enable(21),R.numLightProbeGrids>0&&a.enable(22),R.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function S(_){const R=f[_.type];let N;if(R){const D=li[R];N=U0.clone(D.uniforms)}else N=_.uniforms;return N}function v(_,R){let N=u.get(R);return N!==void 0?++N.usedTimes:(N=new Uy(i,R,_,s),l.push(N),u.set(R,N)),N}function T(_){if(--_.usedTimes===0){const R=l.indexOf(_);l[R]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function E(_){o.remove(_)}function A(){o.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:S,acquireProgram:v,releaseProgram:T,releaseShaderCache:E,programs:l,dispose:A}}function Hy(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Vy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function uh(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function dh(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function o(h,f,m,y,p,g){let M=i[e];return M===void 0?(M={id:h.id,object:h,geometry:f,material:m,materialVariant:a(h),groupOrder:y,renderOrder:h.renderOrder,z:p,group:g},i[e]=M):(M.id=h.id,M.object=h,M.geometry=f,M.material=m,M.materialVariant=a(h),M.groupOrder=y,M.renderOrder=h.renderOrder,M.z=p,M.group=g),e++,M}function c(h,f,m,y,p,g){const M=o(h,f,m,y,p,g);m.transmission>0?n.push(M):m.transparent===!0?s.push(M):t.push(M)}function l(h,f,m,y,p,g){const M=o(h,f,m,y,p,g);m.transmission>0?n.unshift(M):m.transparent===!0?s.unshift(M):t.unshift(M)}function u(h,f,m){t.length>1&&t.sort(h||Vy),n.length>1&&n.sort(f||uh),s.length>1&&s.sort(f||uh),m&&(t.reverse(),n.reverse(),s.reverse())}function d(){for(let h=e,f=i.length;h<f;h++){const m=i[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:d,sort:u}}function Gy(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new dh,i.set(n,[a])):s>=r.length?(a=new dh,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Wy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new qe};break;case"SpotLight":t={position:new P,direction:new P,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Xy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Te,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let qy=0;function $y(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Yy(i){const e=new Wy,t=Xy(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new P);const s=new P,r=new rt,a=new rt;function o(l){let u=0,d=0,h=0;for(let R=0;R<9;R++)n.probe[R].set(0,0,0);let f=0,m=0,y=0,p=0,g=0,M=0,S=0,v=0,T=0,E=0,A=0;l.sort($y);for(let R=0,N=l.length;R<N;R++){const D=l[R],k=D.color,Z=D.intensity,ee=D.distance;let C=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===gs?C=D.shadow.map.texture:C=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=k.r*Z,d+=k.g*Z,h+=k.b*Z;else if(D.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(D.sh.coefficients[z],Z);A++}else if(D.isDirectionalLight){const z=e.get(D);if(z.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){const L=D.shadow,q=t.get(D);q.shadowIntensity=L.intensity,q.shadowBias=L.bias,q.shadowNormalBias=L.normalBias,q.shadowRadius=L.radius,q.shadowMapSize=L.mapSize,n.directionalShadow[f]=q,n.directionalShadowMap[f]=C,n.directionalShadowMatrix[f]=D.shadow.matrix,M++}n.directional[f]=z,f++}else if(D.isSpotLight){const z=e.get(D);z.position.setFromMatrixPosition(D.matrixWorld),z.color.copy(k).multiplyScalar(Z),z.distance=ee,z.coneCos=Math.cos(D.angle),z.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),z.decay=D.decay,n.spot[y]=z;const L=D.shadow;if(D.map&&(n.spotLightMap[T]=D.map,T++,L.updateMatrices(D),D.castShadow&&E++),n.spotLightMatrix[y]=L.matrix,D.castShadow){const q=t.get(D);q.shadowIntensity=L.intensity,q.shadowBias=L.bias,q.shadowNormalBias=L.normalBias,q.shadowRadius=L.radius,q.shadowMapSize=L.mapSize,n.spotShadow[y]=q,n.spotShadowMap[y]=C,v++}y++}else if(D.isRectAreaLight){const z=e.get(D);z.color.copy(k).multiplyScalar(Z),z.halfWidth.set(D.width*.5,0,0),z.halfHeight.set(0,D.height*.5,0),n.rectArea[p]=z,p++}else if(D.isPointLight){const z=e.get(D);if(z.color.copy(D.color).multiplyScalar(D.intensity),z.distance=D.distance,z.decay=D.decay,D.castShadow){const L=D.shadow,q=t.get(D);q.shadowIntensity=L.intensity,q.shadowBias=L.bias,q.shadowNormalBias=L.normalBias,q.shadowRadius=L.radius,q.shadowMapSize=L.mapSize,q.shadowCameraNear=L.camera.near,q.shadowCameraFar=L.camera.far,n.pointShadow[m]=q,n.pointShadowMap[m]=C,n.pointShadowMatrix[m]=D.shadow.matrix,S++}n.point[m]=z,m++}else if(D.isHemisphereLight){const z=e.get(D);z.skyColor.copy(D.color).multiplyScalar(Z),z.groundColor.copy(D.groundColor).multiplyScalar(Z),n.hemi[g]=z,g++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ie.LTC_FLOAT_1,n.rectAreaLTC2=Ie.LTC_FLOAT_2):(n.rectAreaLTC1=Ie.LTC_HALF_1,n.rectAreaLTC2=Ie.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;const _=n.hash;(_.directionalLength!==f||_.pointLength!==m||_.spotLength!==y||_.rectAreaLength!==p||_.hemiLength!==g||_.numDirectionalShadows!==M||_.numPointShadows!==S||_.numSpotShadows!==v||_.numSpotMaps!==T||_.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=y,n.rectArea.length=p,n.point.length=m,n.hemi.length=g,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=v+T-E,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,_.directionalLength=f,_.pointLength=m,_.spotLength=y,_.rectAreaLength=p,_.hemiLength=g,_.numDirectionalShadows=M,_.numPointShadows=S,_.numSpotShadows=v,_.numSpotMaps=T,_.numLightProbes=A,n.version=qy++)}function c(l,u){let d=0,h=0,f=0,m=0,y=0;const p=u.matrixWorldInverse;for(let g=0,M=l.length;g<M;g++){const S=l[g];if(S.isDirectionalLight){const v=n.directional[d];v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),d++}else if(S.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(p),v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),f++}else if(S.isRectAreaLight){const v=n.rectArea[m];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(p),a.identity(),r.copy(S.matrixWorld),r.premultiply(p),a.extractRotation(r),v.halfWidth.set(S.width*.5,0,0),v.halfHeight.set(0,S.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),m++}else if(S.isPointLight){const v=n.point[h];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(p),h++}else if(S.isHemisphereLight){const v=n.hemi[y];v.direction.setFromMatrixPosition(S.matrixWorld),v.direction.transformDirection(p),y++}}}return{setup:o,setupView:c,state:n}}function hh(i){const e=new Yy(i),t=[],n=[],s=[];function r(h){d.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function c(h){s.push(h)}function l(){e.setup(t)}function u(h){e.setupView(t,h)}const d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function Ky(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new hh(i),e.set(s,[o])):r>=a.length?(o=new hh(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Zy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Jy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Qy=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],jy=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],fh=new rt,Xr=new P,Bc=new P;function eM(i,e,t){let n=new Su;const s=new Te,r=new Te,a=new It,o=new k0,c=new z0,l={},u=t.maxTextureSize,d={[Li]:_n,[_n]:Li,[hn]:hn},h=new ti({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Te},radius:{value:4}},vertexShader:Zy,fragmentShader:Jy}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const m=new Gt;m.setAttribute("position",new fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new ye(m,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ia;let g=this.type;this.render=function(E,A,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===Ip&&(Ve("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=ia);const R=i.getRenderTarget(),N=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Ii),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const Z=g!==this.type;Z&&A.traverse(function(ee){ee.material&&(Array.isArray(ee.material)?ee.material.forEach(C=>C.needsUpdate=!0):ee.material.needsUpdate=!0)});for(let ee=0,C=E.length;ee<C;ee++){const z=E[ee],L=z.shadow;if(L===void 0){Ve("WebGLShadowMap:",z,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;s.copy(L.mapSize);const q=L.getFrameExtents();s.multiply(q),r.copy(L.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/q.x),s.x=r.x*q.x,L.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/q.y),s.y=r.y*q.y,L.mapSize.y=r.y));const K=i.state.buffers.depth.getReversed();if(L.camera._reversedDepth=K,L.map===null||Z===!0){if(L.map!==null&&(L.map.depthTexture!==null&&(L.map.depthTexture.dispose(),L.map.depthTexture=null),L.map.dispose()),this.type===Jr){if(z.isPointLight){Ve("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}L.map=new jn(s.x,s.y,{format:gs,type:Ni,minFilter:Qt,magFilter:Qt,generateMipmaps:!1}),L.map.texture.name=z.name+".shadowMap",L.map.depthTexture=new cr(s.x,s.y,Gn),L.map.depthTexture.name=z.name+".shadowMapDepth",L.map.depthTexture.format=Di,L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Jt,L.map.depthTexture.magFilter=Jt}else z.isPointLight?(L.map=new Bf(s.x),L.map.depthTexture=new i0(s.x,pi)):(L.map=new jn(s.x,s.y),L.map.depthTexture=new cr(s.x,s.y,pi)),L.map.depthTexture.name=z.name+".shadowMap",L.map.depthTexture.format=Di,this.type===ia?(L.map.depthTexture.compareFunction=K?mu:pu,L.map.depthTexture.minFilter=Qt,L.map.depthTexture.magFilter=Qt):(L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Jt,L.map.depthTexture.magFilter=Jt);L.camera.updateProjectionMatrix()}const ae=L.map.isWebGLCubeRenderTarget?6:1;for(let ue=0;ue<ae;ue++){if(L.map.isWebGLCubeRenderTarget)i.setRenderTarget(L.map,ue),i.clear();else{ue===0&&(i.setRenderTarget(L.map),i.clear());const he=L.getViewport(ue);a.set(r.x*he.x,r.y*he.y,r.x*he.z,r.y*he.w),k.viewport(a)}if(z.isPointLight){const he=L.camera,Pe=L.matrix,st=z.distance||he.far;st!==he.far&&(he.far=st,he.updateProjectionMatrix()),Xr.setFromMatrixPosition(z.matrixWorld),he.position.copy(Xr),Bc.copy(he.position),Bc.add(Qy[ue]),he.up.copy(jy[ue]),he.lookAt(Bc),he.updateMatrixWorld(),Pe.makeTranslation(-Xr.x,-Xr.y,-Xr.z),fh.multiplyMatrices(he.projectionMatrix,he.matrixWorldInverse),L._frustum.setFromProjectionMatrix(fh,he.coordinateSystem,he.reversedDepth)}else L.updateMatrices(z);n=L.getFrustum(),v(A,_,L.camera,z,this.type)}L.isPointLightShadow!==!0&&this.type===Jr&&M(L,_),L.needsUpdate=!1}g=this.type,p.needsUpdate=!1,i.setRenderTarget(R,N,D)};function M(E,A){const _=e.update(y);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new jn(s.x,s.y,{format:gs,type:Ni})),h.uniforms.shadow_pass.value=E.map.depthTexture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(A,null,_,h,y,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(A,null,_,f,y,null)}function S(E,A,_,R){let N=null;const D=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(D!==void 0)N=D;else if(N=_.isPointLight===!0?c:o,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const k=N.uuid,Z=A.uuid;let ee=l[k];ee===void 0&&(ee={},l[k]=ee);let C=ee[Z];C===void 0&&(C=N.clone(),ee[Z]=C,A.addEventListener("dispose",T)),N=C}if(N.visible=A.visible,N.wireframe=A.wireframe,R===Jr?N.side=A.shadowSide!==null?A.shadowSide:A.side:N.side=A.shadowSide!==null?A.shadowSide:d[A.side],N.alphaMap=A.alphaMap,N.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,N.map=A.map,N.clipShadows=A.clipShadows,N.clippingPlanes=A.clippingPlanes,N.clipIntersection=A.clipIntersection,N.displacementMap=A.displacementMap,N.displacementScale=A.displacementScale,N.displacementBias=A.displacementBias,N.wireframeLinewidth=A.wireframeLinewidth,N.linewidth=A.linewidth,_.isPointLight===!0&&N.isMeshDistanceMaterial===!0){const k=i.properties.get(N);k.light=_}return N}function v(E,A,_,R,N){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&N===Jr)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);const Z=e.update(E),ee=E.material;if(Array.isArray(ee)){const C=Z.groups;for(let z=0,L=C.length;z<L;z++){const q=C[z],K=ee[q.materialIndex];if(K&&K.visible){const ae=S(E,K,R,N);E.onBeforeShadow(i,E,A,_,Z,ae,q),i.renderBufferDirect(_,null,Z,ae,E,q),E.onAfterShadow(i,E,A,_,Z,ae,q)}}}else if(ee.visible){const C=S(E,ee,R,N);E.onBeforeShadow(i,E,A,_,Z,C,null),i.renderBufferDirect(_,null,Z,C,E,null),E.onAfterShadow(i,E,A,_,Z,C,null)}}const k=E.children;for(let Z=0,ee=k.length;Z<ee;Z++)v(k[Z],A,_,R,N)}function T(E){E.target.removeEventListener("dispose",T);for(const _ in l){const R=l[_],N=E.target.uuid;N in R&&(R[N].dispose(),delete R[N])}}}function tM(i,e){function t(){let B=!1;const Me=new It;let se=null;const be=new It(0,0,0,0);return{setMask:function(Ee){se!==Ee&&!B&&(i.colorMask(Ee,Ee,Ee,Ee),se=Ee)},setLocked:function(Ee){B=Ee},setClear:function(Ee,ce,Oe,Be,Nt){Nt===!0&&(Ee*=Be,ce*=Be,Oe*=Be),Me.set(Ee,ce,Oe,Be),be.equals(Me)===!1&&(i.clearColor(Ee,ce,Oe,Be),be.copy(Me))},reset:function(){B=!1,se=null,be.set(-1,0,0,0)}}}function n(){let B=!1,Me=!1,se=null,be=null,Ee=null;return{setReversed:function(ce){if(Me!==ce){const Oe=e.get("EXT_clip_control");ce?Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.ZERO_TO_ONE_EXT):Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.NEGATIVE_ONE_TO_ONE_EXT),Me=ce;const Be=Ee;Ee=null,this.setClear(Be)}},getReversed:function(){return Me},setTest:function(ce){ce?de(i.DEPTH_TEST):He(i.DEPTH_TEST)},setMask:function(ce){se!==ce&&!B&&(i.depthMask(ce),se=ce)},setFunc:function(ce){if(Me&&(ce=hm[ce]),be!==ce){switch(ce){case el:i.depthFunc(i.NEVER);break;case tl:i.depthFunc(i.ALWAYS);break;case nl:i.depthFunc(i.LESS);break;case nr:i.depthFunc(i.LEQUAL);break;case il:i.depthFunc(i.EQUAL);break;case sl:i.depthFunc(i.GEQUAL);break;case rl:i.depthFunc(i.GREATER);break;case al:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}be=ce}},setLocked:function(ce){B=ce},setClear:function(ce){Ee!==ce&&(Ee=ce,Me&&(ce=1-ce),i.clearDepth(ce))},reset:function(){B=!1,se=null,be=null,Ee=null,Me=!1}}}function s(){let B=!1,Me=null,se=null,be=null,Ee=null,ce=null,Oe=null,Be=null,Nt=null;return{setTest:function(bt){B||(bt?de(i.STENCIL_TEST):He(i.STENCIL_TEST))},setMask:function(bt){Me!==bt&&!B&&(i.stencilMask(bt),Me=bt)},setFunc:function(bt,wn,yn){(se!==bt||be!==wn||Ee!==yn)&&(i.stencilFunc(bt,wn,yn),se=bt,be=wn,Ee=yn)},setOp:function(bt,wn,yn){(ce!==bt||Oe!==wn||Be!==yn)&&(i.stencilOp(bt,wn,yn),ce=bt,Oe=wn,Be=yn)},setLocked:function(bt){B=bt},setClear:function(bt){Nt!==bt&&(i.clearStencil(bt),Nt=bt)},reset:function(){B=!1,Me=null,se=null,be=null,Ee=null,ce=null,Oe=null,Be=null,Nt=null}}}const r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap;let u={},d={},h={},f=new WeakMap,m=[],y=null,p=!1,g=null,M=null,S=null,v=null,T=null,E=null,A=null,_=new qe(0,0,0),R=0,N=!1,D=null,k=null,Z=null,ee=null,C=null;const z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let L=!1,q=0;const K=i.getParameter(i.VERSION);K.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(K)[1]),L=q>=1):K.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),L=q>=2);let ae=null,ue={};const he=i.getParameter(i.SCISSOR_BOX),Pe=i.getParameter(i.VIEWPORT),st=new It().fromArray(he),$e=new It().fromArray(Pe);function j(B,Me,se,be){const Ee=new Uint8Array(4),ce=i.createTexture();i.bindTexture(B,ce),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Oe=0;Oe<se;Oe++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(Me,0,i.RGBA,1,1,be,0,i.RGBA,i.UNSIGNED_BYTE,Ee):i.texImage2D(Me+Oe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ee);return ce}const me={};me[i.TEXTURE_2D]=j(i.TEXTURE_2D,i.TEXTURE_2D,1),me[i.TEXTURE_CUBE_MAP]=j(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),me[i.TEXTURE_2D_ARRAY]=j(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),me[i.TEXTURE_3D]=j(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),de(i.DEPTH_TEST),a.setFunc(nr),V(!1),ht(Gu),de(i.CULL_FACE),Se(Ii);function de(B){u[B]!==!0&&(i.enable(B),u[B]=!0)}function He(B){u[B]!==!1&&(i.disable(B),u[B]=!1)}function Qe(B,Me){return h[B]!==Me?(i.bindFramebuffer(B,Me),h[B]=Me,B===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=Me),B===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=Me),!0):!1}function Xe(B,Me){let se=m,be=!1;if(B){se=f.get(Me),se===void 0&&(se=[],f.set(Me,se));const Ee=B.textures;if(se.length!==Ee.length||se[0]!==i.COLOR_ATTACHMENT0){for(let ce=0,Oe=Ee.length;ce<Oe;ce++)se[ce]=i.COLOR_ATTACHMENT0+ce;se.length=Ee.length,be=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,be=!0);be&&i.drawBuffers(se)}function wt(B){return y!==B?(i.useProgram(B),y=B,!0):!1}const at={[ds]:i.FUNC_ADD,[Lp]:i.FUNC_SUBTRACT,[Np]:i.FUNC_REVERSE_SUBTRACT};at[Dp]=i.MIN,at[Up]=i.MAX;const le={[Fp]:i.ZERO,[Op]:i.ONE,[Bp]:i.SRC_COLOR,[Qc]:i.SRC_ALPHA,[Wp]:i.SRC_ALPHA_SATURATE,[Vp]:i.DST_COLOR,[zp]:i.DST_ALPHA,[kp]:i.ONE_MINUS_SRC_COLOR,[jc]:i.ONE_MINUS_SRC_ALPHA,[Gp]:i.ONE_MINUS_DST_COLOR,[Hp]:i.ONE_MINUS_DST_ALPHA,[Xp]:i.CONSTANT_COLOR,[qp]:i.ONE_MINUS_CONSTANT_COLOR,[$p]:i.CONSTANT_ALPHA,[Yp]:i.ONE_MINUS_CONSTANT_ALPHA};function Se(B,Me,se,be,Ee,ce,Oe,Be,Nt,bt){if(B===Ii){p===!0&&(He(i.BLEND),p=!1);return}if(p===!1&&(de(i.BLEND),p=!0),B!==Pp){if(B!==g||bt!==N){if((M!==ds||T!==ds)&&(i.blendEquation(i.FUNC_ADD),M=ds,T=ds),bt)switch(B){case Js:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case zn:i.blendFunc(i.ONE,i.ONE);break;case Wu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Je("WebGLState: Invalid blending: ",B);break}else switch(B){case Js:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case zn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Wu:Je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Xu:Je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Je("WebGLState: Invalid blending: ",B);break}S=null,v=null,E=null,A=null,_.set(0,0,0),R=0,g=B,N=bt}return}Ee=Ee||Me,ce=ce||se,Oe=Oe||be,(Me!==M||Ee!==T)&&(i.blendEquationSeparate(at[Me],at[Ee]),M=Me,T=Ee),(se!==S||be!==v||ce!==E||Oe!==A)&&(i.blendFuncSeparate(le[se],le[be],le[ce],le[Oe]),S=se,v=be,E=ce,A=Oe),(Be.equals(_)===!1||Nt!==R)&&(i.blendColor(Be.r,Be.g,Be.b,Nt),_.copy(Be),R=Nt),g=B,N=!1}function Ye(B,Me){B.side===hn?He(i.CULL_FACE):de(i.CULL_FACE);let se=B.side===_n;Me&&(se=!se),V(se),B.blending===Js&&B.transparent===!1?Se(Ii):Se(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);const be=B.stencilWrite;o.setTest(be),be&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),_t(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):He(i.SAMPLE_ALPHA_TO_COVERAGE)}function V(B){D!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),D=B)}function ht(B){B!==Rp?(de(i.CULL_FACE),B!==k&&(B===Gu?i.cullFace(i.BACK):B===Cp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):He(i.CULL_FACE),k=B}function Ge(B){B!==Z&&(L&&i.lineWidth(B),Z=B)}function _t(B,Me,se){B?(de(i.POLYGON_OFFSET_FILL),(ee!==Me||C!==se)&&(ee=Me,C=se,a.getReversed()&&(Me=-Me),i.polygonOffset(Me,se))):He(i.POLYGON_OFFSET_FILL)}function vt(B){B?de(i.SCISSOR_TEST):He(i.SCISSOR_TEST)}function Pt(B){B===void 0&&(B=i.TEXTURE0+z-1),ae!==B&&(i.activeTexture(B),ae=B)}function H(B,Me,se){se===void 0&&(ae===null?se=i.TEXTURE0+z-1:se=ae);let be=ue[se];be===void 0&&(be={type:void 0,texture:void 0},ue[se]=be),(be.type!==B||be.texture!==Me)&&(ae!==se&&(i.activeTexture(se),ae=se),i.bindTexture(B,Me||me[B]),be.type=B,be.texture=Me)}function Wt(){const B=ue[ae];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function mt(){try{i.compressedTexImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function w(){try{i.compressedTexImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function x(){try{i.texSubImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function O(){try{i.texSubImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function $(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function pe(){try{i.texStorage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function oe(){try{i.texStorage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function Q(){try{i.texImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function ne(){try{i.texImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function xe(B){return d[B]!==void 0?d[B]:i.getParameter(B)}function De(B,Me){d[B]!==Me&&(i.pixelStorei(B,Me),d[B]=Me)}function we(B){st.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),st.copy(B))}function ve(B){$e.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),$e.copy(B))}function ze(B,Me){let se=l.get(Me);se===void 0&&(se=new WeakMap,l.set(Me,se));let be=se.get(B);be===void 0&&(be=i.getUniformBlockIndex(Me,B.name),se.set(B,be))}function Ue(B,Me){const be=l.get(Me).get(B);c.get(Me)!==be&&(i.uniformBlockBinding(Me,be,B.__bindingPointIndex),c.set(Me,be))}function je(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},ae=null,ue={},h={},f=new WeakMap,m=[],y=null,p=!1,g=null,M=null,S=null,v=null,T=null,E=null,A=null,_=new qe(0,0,0),R=0,N=!1,D=null,k=null,Z=null,ee=null,C=null,st.set(0,0,i.canvas.width,i.canvas.height),$e.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:de,disable:He,bindFramebuffer:Qe,drawBuffers:Xe,useProgram:wt,setBlending:Se,setMaterial:Ye,setFlipSided:V,setCullFace:ht,setLineWidth:Ge,setPolygonOffset:_t,setScissorTest:vt,activeTexture:Pt,bindTexture:H,unbindTexture:Wt,compressedTexImage2D:mt,compressedTexImage3D:w,texImage2D:Q,texImage3D:ne,pixelStorei:De,getParameter:xe,updateUBOMapping:ze,uniformBlockBinding:Ue,texStorage2D:pe,texStorage3D:oe,texSubImage2D:x,texSubImage3D:O,compressedTexSubImage2D:G,compressedTexSubImage3D:$,scissor:we,viewport:ve,reset:je}}function nM(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Te,u=new WeakMap,d=new Set;let h;const f=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(w,x){return m?new OffscreenCanvas(w,x):xa("canvas")}function p(w,x,O){let G=1;const $=mt(w);if(($.width>O||$.height>O)&&(G=O/Math.max($.width,$.height)),G<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const pe=Math.floor(G*$.width),oe=Math.floor(G*$.height);h===void 0&&(h=y(pe,oe));const Q=x?y(pe,oe):h;return Q.width=pe,Q.height=oe,Q.getContext("2d").drawImage(w,0,0,pe,oe),Ve("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+pe+"x"+oe+")."),Q}else return"data"in w&&Ve("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),w;return w}function g(w){return w.generateMipmaps}function M(w){i.generateMipmap(w)}function S(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(w,x,O,G,$,pe=!1){if(w!==null){if(i[w]!==void 0)return i[w];Ve("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let oe;G&&(oe=e.get("EXT_texture_norm16"),oe||Ve("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=x;if(x===i.RED&&(O===i.FLOAT&&(Q=i.R32F),O===i.HALF_FLOAT&&(Q=i.R16F),O===i.UNSIGNED_BYTE&&(Q=i.R8),O===i.UNSIGNED_SHORT&&oe&&(Q=oe.R16_EXT),O===i.SHORT&&oe&&(Q=oe.R16_SNORM_EXT)),x===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(Q=i.R8UI),O===i.UNSIGNED_SHORT&&(Q=i.R16UI),O===i.UNSIGNED_INT&&(Q=i.R32UI),O===i.BYTE&&(Q=i.R8I),O===i.SHORT&&(Q=i.R16I),O===i.INT&&(Q=i.R32I)),x===i.RG&&(O===i.FLOAT&&(Q=i.RG32F),O===i.HALF_FLOAT&&(Q=i.RG16F),O===i.UNSIGNED_BYTE&&(Q=i.RG8),O===i.UNSIGNED_SHORT&&oe&&(Q=oe.RG16_EXT),O===i.SHORT&&oe&&(Q=oe.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(Q=i.RG8UI),O===i.UNSIGNED_SHORT&&(Q=i.RG16UI),O===i.UNSIGNED_INT&&(Q=i.RG32UI),O===i.BYTE&&(Q=i.RG8I),O===i.SHORT&&(Q=i.RG16I),O===i.INT&&(Q=i.RG32I)),x===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),O===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),O===i.UNSIGNED_INT&&(Q=i.RGB32UI),O===i.BYTE&&(Q=i.RGB8I),O===i.SHORT&&(Q=i.RGB16I),O===i.INT&&(Q=i.RGB32I)),x===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),O===i.UNSIGNED_INT&&(Q=i.RGBA32UI),O===i.BYTE&&(Q=i.RGBA8I),O===i.SHORT&&(Q=i.RGBA16I),O===i.INT&&(Q=i.RGBA32I)),x===i.RGB&&(O===i.UNSIGNED_SHORT&&oe&&(Q=oe.RGB16_EXT),O===i.SHORT&&oe&&(Q=oe.RGB16_SNORM_EXT),O===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),O===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),x===i.RGBA){const ne=pe?Io:dt.getTransfer($);O===i.FLOAT&&(Q=i.RGBA32F),O===i.HALF_FLOAT&&(Q=i.RGBA16F),O===i.UNSIGNED_BYTE&&(Q=ne===At?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT&&oe&&(Q=oe.RGBA16_EXT),O===i.SHORT&&oe&&(Q=oe.RGBA16_SNORM_EXT),O===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function T(w,x){let O;return w?x===null||x===pi||x===fa?O=i.DEPTH24_STENCIL8:x===Gn?O=i.DEPTH32F_STENCIL8:x===ha&&(O=i.DEPTH24_STENCIL8,Ve("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===pi||x===fa?O=i.DEPTH_COMPONENT24:x===Gn?O=i.DEPTH_COMPONENT32F:x===ha&&(O=i.DEPTH_COMPONENT16),O}function E(w,x){return g(w)===!0||w.isFramebufferTexture&&w.minFilter!==Jt&&w.minFilter!==Qt?Math.log2(Math.max(x.width,x.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?x.mipmaps.length:1}function A(w){const x=w.target;x.removeEventListener("dispose",A),R(x),x.isVideoTexture&&u.delete(x),x.isHTMLTexture&&d.delete(x)}function _(w){const x=w.target;x.removeEventListener("dispose",_),D(x)}function R(w){const x=n.get(w);if(x.__webglInit===void 0)return;const O=w.source,G=f.get(O);if(G){const $=G[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&N(w),Object.keys(G).length===0&&f.delete(O)}n.remove(w)}function N(w){const x=n.get(w);i.deleteTexture(x.__webglTexture);const O=w.source,G=f.get(O);delete G[x.__cacheKey],a.memory.textures--}function D(w){const x=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(x.__webglFramebuffer[G]))for(let $=0;$<x.__webglFramebuffer[G].length;$++)i.deleteFramebuffer(x.__webglFramebuffer[G][$]);else i.deleteFramebuffer(x.__webglFramebuffer[G]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[G])}else{if(Array.isArray(x.__webglFramebuffer))for(let G=0;G<x.__webglFramebuffer.length;G++)i.deleteFramebuffer(x.__webglFramebuffer[G]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let G=0;G<x.__webglColorRenderbuffer.length;G++)x.__webglColorRenderbuffer[G]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[G]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const O=w.textures;for(let G=0,$=O.length;G<$;G++){const pe=n.get(O[G]);pe.__webglTexture&&(i.deleteTexture(pe.__webglTexture),a.memory.textures--),n.remove(O[G])}n.remove(w)}let k=0;function Z(){k=0}function ee(){return k}function C(w){k=w}function z(){const w=k;return w>=s.maxTextures&&Ve("WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),k+=1,w}function L(w){const x=[];return x.push(w.wrapS),x.push(w.wrapT),x.push(w.wrapR||0),x.push(w.magFilter),x.push(w.minFilter),x.push(w.anisotropy),x.push(w.internalFormat),x.push(w.format),x.push(w.type),x.push(w.generateMipmaps),x.push(w.premultiplyAlpha),x.push(w.flipY),x.push(w.unpackAlignment),x.push(w.colorSpace),x.join()}function q(w,x){const O=n.get(w);if(w.isVideoTexture&&H(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&O.__version!==w.version){const G=w.image;if(G===null)Ve("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Ve("WebGLRenderer: Texture marked for update but image is incomplete");else{He(O,w,x);return}}else w.isExternalTexture&&(O.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+x)}function K(w,x){const O=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&O.__version!==w.version){He(O,w,x);return}else w.isExternalTexture&&(O.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+x)}function ae(w,x){const O=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&O.__version!==w.version){He(O,w,x);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+x)}function ue(w,x){const O=n.get(w);if(w.isCubeDepthTexture!==!0&&w.version>0&&O.__version!==w.version){Qe(O,w,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+x)}const he={[sr]:i.REPEAT,[di]:i.CLAMP_TO_EDGE,[Ao]:i.MIRRORED_REPEAT},Pe={[Jt]:i.NEAREST,[Jh]:i.NEAREST_MIPMAP_NEAREST,[Qr]:i.NEAREST_MIPMAP_LINEAR,[Qt]:i.LINEAR,[_o]:i.LINEAR_MIPMAP_NEAREST,[Ai]:i.LINEAR_MIPMAP_LINEAR},st={[nm]:i.NEVER,[om]:i.ALWAYS,[im]:i.LESS,[pu]:i.LEQUAL,[sm]:i.EQUAL,[mu]:i.GEQUAL,[rm]:i.GREATER,[am]:i.NOTEQUAL};function $e(w,x){if(x.type===Gn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Qt||x.magFilter===_o||x.magFilter===Qr||x.magFilter===Ai||x.minFilter===Qt||x.minFilter===_o||x.minFilter===Qr||x.minFilter===Ai)&&Ve("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,he[x.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,he[x.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,he[x.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,Pe[x.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,Pe[x.minFilter]),x.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,st[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Jt||x.minFilter!==Qr&&x.minFilter!==Ai||x.type===Gn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");i.texParameterf(w,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function j(w,x){let O=!1;w.__webglInit===void 0&&(w.__webglInit=!0,x.addEventListener("dispose",A));const G=x.source;let $=f.get(G);$===void 0&&($={},f.set(G,$));const pe=L(x);if(pe!==w.__cacheKey){$[pe]===void 0&&($[pe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,O=!0),$[pe].usedTimes++;const oe=$[w.__cacheKey];oe!==void 0&&($[w.__cacheKey].usedTimes--,oe.usedTimes===0&&N(x)),w.__cacheKey=pe,w.__webglTexture=$[pe].texture}return O}function me(w,x,O){return Math.floor(Math.floor(w/O)/x)}function de(w,x,O,G){const pe=w.updateRanges;if(pe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,O,G,x.data);else{pe.sort((De,we)=>De.start-we.start);let oe=0;for(let De=1;De<pe.length;De++){const we=pe[oe],ve=pe[De],ze=we.start+we.count,Ue=me(ve.start,x.width,4),je=me(we.start,x.width,4);ve.start<=ze+1&&Ue===je&&me(ve.start+ve.count-1,x.width,4)===Ue?we.count=Math.max(we.count,ve.start+ve.count-we.start):(++oe,pe[oe]=ve)}pe.length=oe+1;const Q=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),xe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let De=0,we=pe.length;De<we;De++){const ve=pe[De],ze=Math.floor(ve.start/4),Ue=Math.ceil(ve.count/4),je=ze%x.width,B=Math.floor(ze/x.width),Me=Ue,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,je),t.pixelStorei(i.UNPACK_SKIP_ROWS,B),t.texSubImage2D(i.TEXTURE_2D,0,je,B,Me,se,O,G,x.data)}w.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Q),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,xe)}}function He(w,x,O){let G=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(G=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(G=i.TEXTURE_3D);const $=j(w,x),pe=x.source;t.bindTexture(G,w.__webglTexture,i.TEXTURE0+O);const oe=n.get(pe);if(pe.version!==oe.__version||$===!0){if(t.activeTexture(i.TEXTURE0+O),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const se=dt.getPrimaries(dt.workingColorSpace),be=x.colorSpace===ji?null:dt.getPrimaries(x.colorSpace),Ee=x.colorSpace===ji||se===be?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let ne=p(x.image,!1,s.maxTextureSize);ne=Wt(x,ne);const xe=r.convert(x.format,x.colorSpace),De=r.convert(x.type);let we=v(x.internalFormat,xe,De,x.normalized,x.colorSpace,x.isVideoTexture);$e(G,x);let ve;const ze=x.mipmaps,Ue=x.isVideoTexture!==!0,je=oe.__version===void 0||$===!0,B=pe.dataReady,Me=E(x,ne);if(x.isDepthTexture)we=T(x.format===fs,x.type),je&&(Ue?t.texStorage2D(i.TEXTURE_2D,1,we,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,we,ne.width,ne.height,0,xe,De,null));else if(x.isDataTexture)if(ze.length>0){Ue&&je&&t.texStorage2D(i.TEXTURE_2D,Me,we,ze[0].width,ze[0].height);for(let se=0,be=ze.length;se<be;se++)ve=ze[se],Ue?B&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ve.width,ve.height,xe,De,ve.data):t.texImage2D(i.TEXTURE_2D,se,we,ve.width,ve.height,0,xe,De,ve.data);x.generateMipmaps=!1}else Ue?(je&&t.texStorage2D(i.TEXTURE_2D,Me,we,ne.width,ne.height),B&&de(x,ne,xe,De)):t.texImage2D(i.TEXTURE_2D,0,we,ne.width,ne.height,0,xe,De,ne.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ue&&je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Me,we,ze[0].width,ze[0].height,ne.depth);for(let se=0,be=ze.length;se<be;se++)if(ve=ze[se],x.format!==Wn)if(xe!==null)if(Ue){if(B)if(x.layerUpdates.size>0){const Ee=Wd(ve.width,ve.height,x.format,x.type);for(const ce of x.layerUpdates){const Oe=ve.data.subarray(ce*Ee/ve.data.BYTES_PER_ELEMENT,(ce+1)*Ee/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,ce,ve.width,ve.height,1,xe,Oe)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,ve.width,ve.height,ne.depth,xe,ve.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,we,ve.width,ve.height,ne.depth,0,ve.data,0,0);else Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?B&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,ve.width,ve.height,ne.depth,xe,De,ve.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,we,ve.width,ve.height,ne.depth,0,xe,De,ve.data)}else{Ue&&je&&t.texStorage2D(i.TEXTURE_2D,Me,we,ze[0].width,ze[0].height);for(let se=0,be=ze.length;se<be;se++)ve=ze[se],x.format!==Wn?xe!==null?Ue?B&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,ve.width,ve.height,xe,ve.data):t.compressedTexImage2D(i.TEXTURE_2D,se,we,ve.width,ve.height,0,ve.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?B&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,ve.width,ve.height,xe,De,ve.data):t.texImage2D(i.TEXTURE_2D,se,we,ve.width,ve.height,0,xe,De,ve.data)}else if(x.isDataArrayTexture)if(Ue){if(je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Me,we,ne.width,ne.height,ne.depth),B)if(x.layerUpdates.size>0){const se=Wd(ne.width,ne.height,x.format,x.type);for(const be of x.layerUpdates){const Ee=ne.data.subarray(be*se/ne.data.BYTES_PER_ELEMENT,(be+1)*se/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,be,ne.width,ne.height,1,xe,De,Ee)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,we,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(x.isData3DTexture)Ue?(je&&t.texStorage3D(i.TEXTURE_3D,Me,we,ne.width,ne.height,ne.depth),B&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,xe,De,ne.data)):t.texImage3D(i.TEXTURE_3D,0,we,ne.width,ne.height,ne.depth,0,xe,De,ne.data);else if(x.isFramebufferTexture){if(je)if(Ue)t.texStorage2D(i.TEXTURE_2D,Me,we,ne.width,ne.height);else{let se=ne.width,be=ne.height;for(let Ee=0;Ee<Me;Ee++)t.texImage2D(i.TEXTURE_2D,Ee,we,se,be,0,xe,De,null),se>>=1,be>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){const se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),ne.parentNode!==se){se.appendChild(ne),d.add(x),se.onpaint=be=>{const Ee=be.changedElements;for(const ce of d)Ee.includes(ce.image)&&(ce.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{const Ee=i.RGBA,ce=i.RGBA,Oe=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ee,ce,Oe,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ze.length>0){if(Ue&&je){const se=mt(ze[0]);t.texStorage2D(i.TEXTURE_2D,Me,we,se.width,se.height)}for(let se=0,be=ze.length;se<be;se++)ve=ze[se],Ue?B&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,xe,De,ve):t.texImage2D(i.TEXTURE_2D,se,we,xe,De,ve);x.generateMipmaps=!1}else if(Ue){if(je){const se=mt(ne);t.texStorage2D(i.TEXTURE_2D,Me,we,se.width,se.height)}B&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,xe,De,ne)}else t.texImage2D(i.TEXTURE_2D,0,we,xe,De,ne);g(x)&&M(G),oe.__version=pe.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function Qe(w,x,O){if(x.image.length!==6)return;const G=j(w,x),$=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+O);const pe=n.get($);if($.version!==pe.__version||G===!0){t.activeTexture(i.TEXTURE0+O);const oe=dt.getPrimaries(dt.workingColorSpace),Q=x.colorSpace===ji?null:dt.getPrimaries(x.colorSpace),ne=x.colorSpace===ji||oe===Q?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);const xe=x.isCompressedTexture||x.image[0].isCompressedTexture,De=x.image[0]&&x.image[0].isDataTexture,we=[];for(let ce=0;ce<6;ce++)!xe&&!De?we[ce]=p(x.image[ce],!0,s.maxCubemapSize):we[ce]=De?x.image[ce].image:x.image[ce],we[ce]=Wt(x,we[ce]);const ve=we[0],ze=r.convert(x.format,x.colorSpace),Ue=r.convert(x.type),je=v(x.internalFormat,ze,Ue,x.normalized,x.colorSpace),B=x.isVideoTexture!==!0,Me=pe.__version===void 0||G===!0,se=$.dataReady;let be=E(x,ve);$e(i.TEXTURE_CUBE_MAP,x);let Ee;if(xe){B&&Me&&t.texStorage2D(i.TEXTURE_CUBE_MAP,be,je,ve.width,ve.height);for(let ce=0;ce<6;ce++){Ee=we[ce].mipmaps;for(let Oe=0;Oe<Ee.length;Oe++){const Be=Ee[Oe];x.format!==Wn?ze!==null?B?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe,0,0,Be.width,Be.height,ze,Be.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe,je,Be.width,Be.height,0,Be.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe,0,0,Be.width,Be.height,ze,Ue,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe,je,Be.width,Be.height,0,ze,Ue,Be.data)}}}else{if(Ee=x.mipmaps,B&&Me){Ee.length>0&&be++;const ce=mt(we[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,be,je,ce.width,ce.height)}for(let ce=0;ce<6;ce++)if(De){B?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,we[ce].width,we[ce].height,ze,Ue,we[ce].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,je,we[ce].width,we[ce].height,0,ze,Ue,we[ce].data);for(let Oe=0;Oe<Ee.length;Oe++){const Nt=Ee[Oe].image[ce].image;B?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe+1,0,0,Nt.width,Nt.height,ze,Ue,Nt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe+1,je,Nt.width,Nt.height,0,ze,Ue,Nt.data)}}else{B?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,ze,Ue,we[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,je,ze,Ue,we[ce]);for(let Oe=0;Oe<Ee.length;Oe++){const Be=Ee[Oe];B?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe+1,0,0,ze,Ue,Be.image[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Oe+1,je,ze,Ue,Be.image[ce])}}}g(x)&&M(i.TEXTURE_CUBE_MAP),pe.__version=$.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function Xe(w,x,O,G,$,pe){const oe=r.convert(O.format,O.colorSpace),Q=r.convert(O.type),ne=v(O.internalFormat,oe,Q,O.normalized,O.colorSpace),xe=n.get(x),De=n.get(O);if(De.__renderTarget=x,!xe.__hasExternalTextures){const we=Math.max(1,x.width>>pe),ve=Math.max(1,x.height>>pe);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,pe,ne,we,ve,x.depth,0,oe,Q,null):t.texImage2D($,pe,ne,we,ve,0,oe,Q,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),Pt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,G,$,De.__webglTexture,0,vt(x)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,G,$,De.__webglTexture,pe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function wt(w,x,O){if(i.bindRenderbuffer(i.RENDERBUFFER,w),x.depthBuffer){const G=x.depthTexture,$=G&&G.isDepthTexture?G.type:null,pe=T(x.stencilBuffer,$),oe=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Pt(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,vt(x),pe,x.width,x.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,vt(x),pe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,pe,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,oe,i.RENDERBUFFER,w)}else{const G=x.textures;for(let $=0;$<G.length;$++){const pe=G[$],oe=r.convert(pe.format,pe.colorSpace),Q=r.convert(pe.type),ne=v(pe.internalFormat,oe,Q,pe.normalized,pe.colorSpace);Pt(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,vt(x),ne,x.width,x.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,vt(x),ne,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ne,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function at(w,x,O){const G=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const $=n.get(x.depthTexture);if($.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),G){if($.__webglInit===void 0&&($.__webglInit=!0,x.depthTexture.addEventListener("dispose",A)),$.__webglTexture===void 0){$.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),$e(i.TEXTURE_CUBE_MAP,x.depthTexture);const xe=r.convert(x.depthTexture.format),De=r.convert(x.depthTexture.type);let we;x.depthTexture.format===Di?we=i.DEPTH_COMPONENT24:x.depthTexture.format===fs&&(we=i.DEPTH24_STENCIL8);for(let ve=0;ve<6;ve++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,we,x.width,x.height,0,xe,De,null)}}else q(x.depthTexture,0);const pe=$.__webglTexture,oe=vt(x),Q=G?i.TEXTURE_CUBE_MAP_POSITIVE_X+O:i.TEXTURE_2D,ne=x.depthTexture.format===fs?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Di)Pt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,pe,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,pe,0);else if(x.depthTexture.format===fs)Pt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,Q,pe,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,ne,Q,pe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function le(w){const x=n.get(w),O=w.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==w.depthTexture){const G=w.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),G){const $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,G.removeEventListener("dispose",$)};G.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=G}if(w.depthTexture&&!x.__autoAllocateDepthBuffer)if(O)for(let G=0;G<6;G++)at(x.__webglFramebuffer[G],w,G);else{const G=w.texture.mipmaps;G&&G.length>0?at(x.__webglFramebuffer[0],w,0):at(x.__webglFramebuffer,w,0)}else if(O){x.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[G]),x.__webglDepthbuffer[G]===void 0)x.__webglDepthbuffer[G]=i.createRenderbuffer(),wt(x.__webglDepthbuffer[G],w,!1);else{const $=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=x.__webglDepthbuffer[G];i.bindRenderbuffer(i.RENDERBUFFER,pe),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,pe)}}else{const G=w.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),wt(x.__webglDepthbuffer,w,!1);else{const $=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pe=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,pe),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,pe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Se(w,x,O){const G=n.get(w);x!==void 0&&Xe(G.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&le(w)}function Ye(w){const x=w.texture,O=n.get(w),G=n.get(x);w.addEventListener("dispose",_);const $=w.textures,pe=w.isWebGLCubeRenderTarget===!0,oe=$.length>1;if(oe||(G.__webglTexture===void 0&&(G.__webglTexture=i.createTexture()),G.__version=x.version,a.memory.textures++),pe){O.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer[Q]=[];for(let ne=0;ne<x.mipmaps.length;ne++)O.__webglFramebuffer[Q][ne]=i.createFramebuffer()}else O.__webglFramebuffer[Q]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer=[];for(let Q=0;Q<x.mipmaps.length;Q++)O.__webglFramebuffer[Q]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(oe)for(let Q=0,ne=$.length;Q<ne;Q++){const xe=n.get($[Q]);xe.__webglTexture===void 0&&(xe.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&Pt(w)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let Q=0;Q<$.length;Q++){const ne=$[Q];O.__webglColorRenderbuffer[Q]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[Q]);const xe=r.convert(ne.format,ne.colorSpace),De=r.convert(ne.type),we=v(ne.internalFormat,xe,De,ne.normalized,ne.colorSpace,w.isXRRenderTarget===!0),ve=vt(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,ve,we,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Q,i.RENDERBUFFER,O.__webglColorRenderbuffer[Q])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),wt(O.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(pe){t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture),$e(i.TEXTURE_CUBE_MAP,x);for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)Xe(O.__webglFramebuffer[Q][ne],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ne);else Xe(O.__webglFramebuffer[Q],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);g(x)&&M(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(oe){for(let Q=0,ne=$.length;Q<ne;Q++){const xe=$[Q],De=n.get(xe);let we=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(we=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(we,De.__webglTexture),$e(we,xe),Xe(O.__webglFramebuffer,w,xe,i.COLOR_ATTACHMENT0+Q,we,0),g(xe)&&M(we)}t.unbindTexture()}else{let Q=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Q=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Q,G.__webglTexture),$e(Q,x),x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)Xe(O.__webglFramebuffer[ne],w,x,i.COLOR_ATTACHMENT0,Q,ne);else Xe(O.__webglFramebuffer,w,x,i.COLOR_ATTACHMENT0,Q,0);g(x)&&M(Q),t.unbindTexture()}w.depthBuffer&&le(w)}function V(w){const x=w.textures;for(let O=0,G=x.length;O<G;O++){const $=x[O];if(g($)){const pe=S(w),oe=n.get($).__webglTexture;t.bindTexture(pe,oe),M(pe),t.unbindTexture()}}}const ht=[],Ge=[];function _t(w){if(w.samples>0){if(Pt(w)===!1){const x=w.textures,O=w.width,G=w.height;let $=i.COLOR_BUFFER_BIT;const pe=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=n.get(w),Q=x.length>1;if(Q)for(let xe=0;xe<x.length;xe++)t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer);const ne=w.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let xe=0;xe<x.length;xe++){if(w.resolveDepthBuffer&&(w.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),Q){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,oe.__webglColorRenderbuffer[xe]);const De=n.get(x[xe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,De,0)}i.blitFramebuffer(0,0,O,G,0,0,O,G,$,i.NEAREST),c===!0&&(ht.length=0,Ge.length=0,ht.push(i.COLOR_ATTACHMENT0+xe),w.depthBuffer&&w.resolveDepthBuffer===!1&&(ht.push(pe),Ge.push(pe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ge)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ht))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Q)for(let xe=0;xe<x.length;xe++){t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.RENDERBUFFER,oe.__webglColorRenderbuffer[xe]);const De=n.get(x[xe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.TEXTURE_2D,De,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&c){const x=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function vt(w){return Math.min(s.maxSamples,w.samples)}function Pt(w){const x=n.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function H(w){const x=a.render.frame;u.get(w)!==x&&(u.set(w,x),w.update())}function Wt(w,x){const O=w.colorSpace,G=w.format,$=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||O!==Pn&&O!==ji&&(dt.getTransfer(O)===At?(G!==Wn||$!==In)&&Ve("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Je("WebGLTextures: Unsupported texture color space:",O)),x}function mt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(l.width=w.naturalWidth||w.width,l.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(l.width=w.displayWidth,l.height=w.displayHeight):(l.width=w.width,l.height=w.height),l}this.allocateTextureUnit=z,this.resetTextureUnits=Z,this.getTextureUnits=ee,this.setTextureUnits=C,this.setTexture2D=q,this.setTexture2DArray=K,this.setTexture3D=ae,this.setTextureCube=ue,this.rebindTextures=Se,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=V,this.updateMultisampleRenderTarget=_t,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=Xe,this.useMultisampledRTT=Pt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function iM(i,e){function t(n,s=ji){let r;const a=dt.getTransfer(s);if(n===In)return i.UNSIGNED_BYTE;if(n===cu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===lu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ef)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===tf)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Qh)return i.BYTE;if(n===jh)return i.SHORT;if(n===ha)return i.UNSIGNED_SHORT;if(n===ou)return i.INT;if(n===pi)return i.UNSIGNED_INT;if(n===Gn)return i.FLOAT;if(n===Ni)return i.HALF_FLOAT;if(n===nf)return i.ALPHA;if(n===sf)return i.RGB;if(n===Wn)return i.RGBA;if(n===Di)return i.DEPTH_COMPONENT;if(n===fs)return i.DEPTH_STENCIL;if(n===uu)return i.RED;if(n===du)return i.RED_INTEGER;if(n===gs)return i.RG;if(n===hu)return i.RG_INTEGER;if(n===fu)return i.RGBA_INTEGER;if(n===yo||n===Mo||n===So||n===wo)if(a===At)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===yo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===So)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===yo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Mo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===So)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===wo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ol||n===cl||n===ll||n===ul)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ol)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ll)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ul)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===dl||n===hl||n===fl||n===pl||n===ml||n===Ro||n===gl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===dl||n===hl)return a===At?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===fl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===pl)return r.COMPRESSED_R11_EAC;if(n===ml)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ro)return r.COMPRESSED_RG11_EAC;if(n===gl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===xl||n===vl||n===_l||n===yl||n===Ml||n===Sl||n===wl||n===bl||n===El||n===Tl||n===Al||n===Rl||n===Cl||n===Il)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===xl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===vl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===_l)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===yl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ml)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Sl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===wl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===bl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===El)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Tl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Al)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Rl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Cl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Il)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Pl||n===Ll||n===Nl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Pl)return a===At?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ll)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Nl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Dl||n===Ul||n===Co||n===Fl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Dl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ul)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Co)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Fl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===fa?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const sM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rM=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class aM{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new _f(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new ti({vertexShader:sM,fragmentShader:rM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ye(new pr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class oM extends _s{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,d=null,h=null,f=null,m=null;const y=typeof XRWebGLBinding<"u",p=new aM,g={},M=t.getContextAttributes();let S=null,v=null;const T=[],E=[],A=new Te;let _=null;const R=new vn;R.viewport=new It;const N=new vn;N.viewport=new It;const D=[R,N],k=new cg;let Z=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let me=T[j];return me===void 0&&(me=new oc,T[j]=me),me.getTargetRaySpace()},this.getControllerGrip=function(j){let me=T[j];return me===void 0&&(me=new oc,T[j]=me),me.getGripSpace()},this.getHand=function(j){let me=T[j];return me===void 0&&(me=new oc,T[j]=me),me.getHandSpace()};function C(j){const me=E.indexOf(j.inputSource);if(me===-1)return;const de=T[me];de!==void 0&&(de.update(j.inputSource,j.frame,l||a),de.dispatchEvent({type:j.type,data:j.inputSource}))}function z(){s.removeEventListener("select",C),s.removeEventListener("selectstart",C),s.removeEventListener("selectend",C),s.removeEventListener("squeeze",C),s.removeEventListener("squeezestart",C),s.removeEventListener("squeezeend",C),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",L);for(let j=0;j<T.length;j++){const me=E[j];me!==null&&(E[j]=null,T[j].disconnect(me))}Z=null,ee=null,p.reset();for(const j in g)delete g[j];e.setRenderTarget(S),f=null,h=null,d=null,s=null,v=null,$e.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&Ve("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&Ve("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(j){l=j},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",C),s.addEventListener("selectstart",C),s.addEventListener("selectend",C),s.addEventListener("squeeze",C),s.addEventListener("squeezestart",C),s.addEventListener("squeezeend",C),s.addEventListener("end",z),s.addEventListener("inputsourceschange",L),M.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let de=null,He=null,Qe=null;M.depth&&(Qe=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,de=M.stencil?fs:Di,He=M.stencil?fa:pi);const Xe={colorFormat:t.RGBA8,depthFormat:Qe,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Xe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new jn(h.textureWidth,h.textureHeight,{format:Wn,type:In,depthTexture:new cr(h.textureWidth,h.textureHeight,He,void 0,void 0,void 0,void 0,void 0,void 0,de),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const de={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,de),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new jn(f.framebufferWidth,f.framebufferHeight,{format:Wn,type:In,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),$e.setContext(s),$e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function L(j){for(let me=0;me<j.removed.length;me++){const de=j.removed[me],He=E.indexOf(de);He>=0&&(E[He]=null,T[He].disconnect(de))}for(let me=0;me<j.added.length;me++){const de=j.added[me];let He=E.indexOf(de);if(He===-1){for(let Xe=0;Xe<T.length;Xe++)if(Xe>=E.length){E.push(de),He=Xe;break}else if(E[Xe]===null){E[Xe]=de,He=Xe;break}if(He===-1)break}const Qe=T[He];Qe&&Qe.connect(de)}}const q=new P,K=new P;function ae(j,me,de){q.setFromMatrixPosition(me.matrixWorld),K.setFromMatrixPosition(de.matrixWorld);const He=q.distanceTo(K),Qe=me.projectionMatrix.elements,Xe=de.projectionMatrix.elements,wt=Qe[14]/(Qe[10]-1),at=Qe[14]/(Qe[10]+1),le=(Qe[9]+1)/Qe[5],Se=(Qe[9]-1)/Qe[5],Ye=(Qe[8]-1)/Qe[0],V=(Xe[8]+1)/Xe[0],ht=wt*Ye,Ge=wt*V,_t=He/(-Ye+V),vt=_t*-Ye;if(me.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(vt),j.translateZ(_t),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Qe[10]===-1)j.projectionMatrix.copy(me.projectionMatrix),j.projectionMatrixInverse.copy(me.projectionMatrixInverse);else{const Pt=wt+_t,H=at+_t,Wt=ht-vt,mt=Ge+(He-vt),w=le*at/H*Pt,x=Se*at/H*Pt;j.projectionMatrix.makePerspective(Wt,mt,w,x,Pt,H),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function ue(j,me){me===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(me.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let me=j.near,de=j.far;p.texture!==null&&(p.depthNear>0&&(me=p.depthNear),p.depthFar>0&&(de=p.depthFar)),k.near=N.near=R.near=me,k.far=N.far=R.far=de,(Z!==k.near||ee!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),Z=k.near,ee=k.far),k.layers.mask=j.layers.mask|6,R.layers.mask=k.layers.mask&-5,N.layers.mask=k.layers.mask&-3;const He=j.parent,Qe=k.cameras;ue(k,He);for(let Xe=0;Xe<Qe.length;Xe++)ue(Qe[Xe],He);Qe.length===2?ae(k,R,N):k.projectionMatrix.copy(R.projectionMatrix),he(j,k,He)};function he(j,me,de){de===null?j.matrix.copy(me.matrixWorld):(j.matrix.copy(de.matrixWorld),j.matrix.invert(),j.matrix.multiply(me.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(me.projectionMatrix),j.projectionMatrixInverse.copy(me.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=rr*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(h===null&&f===null))return c},this.setFoveation=function(j){c=j,h!==null&&(h.fixedFoveation=j),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=j)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(k)},this.getCameraTexture=function(j){return g[j]};let Pe=null;function st(j,me){if(u=me.getViewerPose(l||a),m=me,u!==null){const de=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let He=!1;de.length!==k.cameras.length&&(k.cameras.length=0,He=!0);for(let at=0;at<de.length;at++){const le=de[at];let Se=null;if(f!==null)Se=f.getViewport(le);else{const V=d.getViewSubImage(h,le);Se=V.viewport,at===0&&(e.setRenderTargetTextures(v,V.colorTexture,V.depthStencilTexture),e.setRenderTarget(v))}let Ye=D[at];Ye===void 0&&(Ye=new vn,Ye.layers.enable(at),Ye.viewport=new It,D[at]=Ye),Ye.matrix.fromArray(le.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(le.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(Se.x,Se.y,Se.width,Se.height),at===0&&(k.matrix.copy(Ye.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),He===!0&&k.cameras.push(Ye)}const Qe=s.enabledFeatures;if(Qe&&Qe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();const at=d.getDepthInformation(de[0]);at&&at.isValid&&at.texture&&p.init(at,s.renderState)}if(Qe&&Qe.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let at=0;at<de.length;at++){const le=de[at].camera;if(le){let Se=g[le];Se||(Se=new _f,g[le]=Se);const Ye=d.getCameraImage(le);Se.sourceTexture=Ye}}}}for(let de=0;de<T.length;de++){const He=E[de],Qe=T[de];He!==null&&Qe!==void 0&&Qe.update(He,me,l||a)}Pe&&Pe(j,me),me.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:me}),m=null}const $e=new Ff;$e.setAnimationLoop(st),this.setAnimationLoop=function(j){Pe=j},this.dispose=function(){}}}const cM=new rt,Gf=new it;Gf.set(-1,0,0,0,1,0,0,0,1);function lM(i,e){function t(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,Cf(i)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function s(p,g,M,S,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),d(p,g)):g.isMeshPhongMaterial?(r(p,g),u(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),h(p,g),g.isMeshPhysicalMaterial&&f(p,g,v)):g.isMeshMatcapMaterial?(r(p,g),m(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),y(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(a(p,g),g.isLineDashedMaterial&&o(p,g)):g.isPointsMaterial?c(p,g,M,S):g.isSpriteMaterial?l(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,t(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===_n&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,t(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===_n&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,t(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,t(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);const M=e.get(g),S=M.envMap,v=M.envMapRotation;S&&(p.envMap.value=S,p.envMapRotation.value.setFromMatrix4(cM.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Gf),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,p.aoMapTransform))}function a(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform))}function o(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function c(p,g,M,S){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*M,p.scale.value=S*.5,g.map&&(p.map.value=g.map,t(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function l(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function u(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function d(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function h(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,M){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===_n&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=M.texture,p.transmissionSamplerSize.value.set(M.width,M.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function y(p,g){const M=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(M.matrixWorld),p.nearDistance.value=M.shadow.camera.near,p.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function uM(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(v,T){const E=T.program;n.uniformBlockBinding(v,E)}function l(v,T){let E=s[v.id];E===void 0&&(p(v),E=u(v),s[v.id]=E,v.addEventListener("dispose",M));const A=T.program;n.updateUBOMapping(v,A);const _=e.render.frame;r[v.id]!==_&&(h(v),r[v.id]=_)}function u(v){const T=d();v.__bindingPointIndex=T;const E=i.createBuffer(),A=v.__size,_=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,A,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,E),E}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){const T=s[v.id],E=v.uniforms,A=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,R=E.length;_<R;_++){const N=E[_];if(Array.isArray(N))for(let D=0,k=N.length;D<k;D++)f(N[D],_,D,A);else f(N,_,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,T,E,A){if(y(v,T,E,A)===!0){const _=v.__offset,R=v.value;if(Array.isArray(R)){let N=0;for(let D=0;D<R.length;D++){const k=R[D],Z=g(k);m(k,v.__data,N),typeof k!="number"&&typeof k!="boolean"&&!k.isMatrix3&&!ArrayBuffer.isView(k)&&(N+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(R,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,v.__data)}}function m(v,T,E){typeof v=="number"||typeof v=="boolean"?T[0]=v:v.isMatrix3?(T[0]=v.elements[0],T[1]=v.elements[1],T[2]=v.elements[2],T[3]=0,T[4]=v.elements[3],T[5]=v.elements[4],T[6]=v.elements[5],T[7]=0,T[8]=v.elements[6],T[9]=v.elements[7],T[10]=v.elements[8],T[11]=0):ArrayBuffer.isView(v)?T.set(new v.constructor(v.buffer,v.byteOffset,T.length)):v.toArray(T,E)}function y(v,T,E,A){const _=v.value,R=T+"_"+E;if(A[R]===void 0)return typeof _=="number"||typeof _=="boolean"?A[R]=_:ArrayBuffer.isView(_)?A[R]=_.slice():A[R]=_.clone(),!0;{const N=A[R];if(typeof _=="number"||typeof _=="boolean"){if(N!==_)return A[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(N.equals(_)===!1)return N.copy(_),!0}}return!1}function p(v){const T=v.uniforms;let E=0;const A=16;for(let R=0,N=T.length;R<N;R++){const D=Array.isArray(T[R])?T[R]:[T[R]];for(let k=0,Z=D.length;k<Z;k++){const ee=D[k],C=Array.isArray(ee.value)?ee.value:[ee.value];for(let z=0,L=C.length;z<L;z++){const q=C[z],K=g(q),ae=E%A,ue=ae%K.boundary,he=ae+ue;E+=ue,he!==0&&A-he<K.storage&&(E+=A-he),ee.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),ee.__offset=E,E+=K.storage}}}const _=E%A;return _>0&&(E+=A-_),v.__size=E,v.__cache={},this}function g(v){const T={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(T.boundary=4,T.storage=4):v.isVector2?(T.boundary=8,T.storage=8):v.isVector3||v.isColor?(T.boundary=16,T.storage=12):v.isVector4?(T.boundary=16,T.storage=16):v.isMatrix3?(T.boundary=48,T.storage=48):v.isMatrix4?(T.boundary=64,T.storage=64):v.isTexture?Ve("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(T.boundary=16,T.storage=v.byteLength):Ve("WebGLRenderer: Unsupported uniform value type.",v),T}function M(v){const T=v.target;T.removeEventListener("dispose",M);const E=a.indexOf(T.__bindingPointIndex);a.splice(E,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function S(){for(const v in s)i.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:c,update:l,dispose:S}}const dM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let ai=null;function hM(){return ai===null&&(ai=new yu(dM,16,16,gs,Ni),ai.name="DFG_LUT",ai.minFilter=Qt,ai.magFilter=Qt,ai.wrapS=di,ai.wrapT=di,ai.generateMipmaps=!1,ai.needsUpdate=!0),ai}class Wf{constructor(e={}){const{canvas:t=um(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=In}=e;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;const y=f,p=new Set([fu,hu,du]),g=new Set([In,pi,ha,fa,cu,lu]),M=new Uint32Array(4),S=new Int32Array(4),v=new P;let T=null,E=null;const A=[],_=[];let R=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=fi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const N=this;let D=!1,k=null,Z=null,ee=null,C=null;this._outputColorSpace=Vt;let z=0,L=0,q=null,K=-1,ae=null;const ue=new It,he=new It;let Pe=null;const st=new qe(0);let $e=0,j=t.width,me=t.height,de=1,He=null,Qe=null;const Xe=new It(0,0,j,me),wt=new It(0,0,j,me);let at=!1;const le=new Su;let Se=!1,Ye=!1;const V=new rt,ht=new P,Ge=new It,_t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let vt=!1;function Pt(){return q===null?de:1}let H=n;function Wt(b,U){return t.getContext(b,U)}try{const b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ru}`),t.addEventListener("webglcontextlost",Nt,!1),t.addEventListener("webglcontextrestored",bt,!1),t.addEventListener("webglcontextcreationerror",wn,!1),H===null){const U="webgl2";if(H=Wt(U,b),H===null)throw Wt(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(b){throw Je("WebGLRenderer: "+b.message),b}let mt,w,x,O,G,$,pe,oe,Q,ne,xe,De,we,ve,ze,Ue,je,B,Me,se,be,Ee,ce;function Oe(){mt=new h_(H),mt.init(),be=new iM(H,mt),w=new s_(H,mt,e,be),x=new tM(H,mt),w.reversedDepthBuffer&&h&&x.buffers.depth.setReversed(!0),Z=H.createFramebuffer(),ee=H.createFramebuffer(),C=H.createFramebuffer(),O=new m_(H),G=new Hy,$=new nM(H,mt,x,G,w,be,O),pe=new d_(N),oe=new _g(H),Ee=new n_(H,oe),Q=new f_(H,oe,O,Ee),ne=new x_(H,Q,oe,Ee,O),B=new g_(H,w,$),ze=new r_(G),xe=new zy(N,pe,mt,w,Ee,ze),De=new lM(N,G),we=new Gy,ve=new Ky(mt),je=new t_(N,pe,x,ne,m,c),Ue=new eM(N,ne,w),ce=new uM(H,O,w,x),Me=new i_(H,mt,O),se=new p_(H,mt,O),O.programs=xe.programs,N.capabilities=w,N.extensions=mt,N.properties=G,N.renderLists=we,N.shadowMap=Ue,N.state=x,N.info=O}Oe(),y!==In&&(R=new __(y,t.width,t.height,o,s,r));const Be=new oM(N,H);this.xr=Be,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){const b=mt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=mt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return de},this.setPixelRatio=function(b){b!==void 0&&(de=b,this.setSize(j,me,!1))},this.getSize=function(b){return b.set(j,me)},this.setSize=function(b,U,Y=!0){if(Be.isPresenting){Ve("WebGLRenderer: Can't change size while VR device is presenting.");return}j=b,me=U,t.width=Math.floor(b*de),t.height=Math.floor(U*de),Y===!0&&(t.style.width=b+"px",t.style.height=U+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set(j*de,me*de).floor()},this.setDrawingBufferSize=function(b,U,Y){j=b,me=U,de=Y,t.width=Math.floor(b*Y),t.height=Math.floor(U*Y),this.setViewport(0,0,b,U)},this.setEffects=function(b){if(y===In){Je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let U=0;U<b.length;U++)if(b[U].isOutputPass===!0){Ve("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ue)},this.getViewport=function(b){return b.copy(Xe)},this.setViewport=function(b,U,Y,W){b.isVector4?Xe.set(b.x,b.y,b.z,b.w):Xe.set(b,U,Y,W),x.viewport(ue.copy(Xe).multiplyScalar(de).round())},this.getScissor=function(b){return b.copy(wt)},this.setScissor=function(b,U,Y,W){b.isVector4?wt.set(b.x,b.y,b.z,b.w):wt.set(b,U,Y,W),x.scissor(he.copy(wt).multiplyScalar(de).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(b){x.setScissorTest(at=b)},this.setOpaqueSort=function(b){He=b},this.setTransparentSort=function(b){Qe=b},this.getClearColor=function(b){return b.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(b=!0,U=!0,Y=!0){let W=0;if(b){let X=!1;if(q!==null){const Ae=q.texture.format;X=p.has(Ae)}if(X){const Ae=q.texture.type,fe=g.has(Ae),Re=je.getClearColor(),Fe=je.getClearAlpha(),ke=Re.r,et=Re.g,nt=Re.b;fe?(M[0]=ke,M[1]=et,M[2]=nt,M[3]=Fe,H.clearBufferuiv(H.COLOR,0,M)):(S[0]=ke,S[1]=et,S[2]=nt,S[3]=Fe,H.clearBufferiv(H.COLOR,0,S))}else W|=H.COLOR_BUFFER_BIT}U&&(W|=H.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(W|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&H.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),k=b},this.dispose=function(){t.removeEventListener("webglcontextlost",Nt,!1),t.removeEventListener("webglcontextrestored",bt,!1),t.removeEventListener("webglcontextcreationerror",wn,!1),je.dispose(),we.dispose(),ve.dispose(),G.dispose(),pe.dispose(),ne.dispose(),Ee.dispose(),ce.dispose(),xe.dispose(),Be.dispose(),Be.removeEventListener("sessionstart",ii),Be.removeEventListener("sessionend",vi),mn.stop()};function Nt(b){b.preventDefault(),Po("WebGLRenderer: Context Lost."),D=!0}function bt(){Po("WebGLRenderer: Context Restored."),D=!1;const b=O.autoReset,U=Ue.enabled,Y=Ue.autoUpdate,W=Ue.needsUpdate,X=Ue.type;Oe(),O.autoReset=b,Ue.enabled=U,Ue.autoUpdate=Y,Ue.needsUpdate=W,Ue.type=X}function wn(b){Je("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function yn(b){const U=b.target;U.removeEventListener("dispose",yn),yr(U)}function yr(b){Mr(b),G.remove(b)}function Mr(b){const U=G.get(b).programs;U!==void 0&&(U.forEach(function(Y){xe.releaseProgram(Y)}),b.isShaderMaterial&&xe.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,Y,W,X,Ae){U===null&&(U=_t);const fe=X.isMesh&&X.matrixWorld.determinantAffine()<0,Re=$n(b,U,Y,W,X);x.setMaterial(W,fe);let Fe=Y.index,ke=1;if(W.wireframe===!0){if(Fe=Q.getWireframeAttribute(Y),Fe===void 0)return;ke=2}const et=Y.drawRange,nt=Y.attributes.position;let Ne=et.start*ke,gt=(et.start+et.count)*ke;Ae!==null&&(Ne=Math.max(Ne,Ae.start*ke),gt=Math.min(gt,(Ae.start+Ae.count)*ke)),Fe!==null?(Ne=Math.max(Ne,0),gt=Math.min(gt,Fe.count)):nt!=null&&(Ne=Math.max(Ne,0),gt=Math.min(gt,nt.count));const yt=gt-Ne;if(yt<0||yt===1/0)return;Ee.setup(X,W,Re,Y,Fe);let Et,Mt=Me;if(Fe!==null&&(Et=oe.get(Fe),Mt=se,Mt.setIndex(Et)),X.isMesh)W.wireframe===!0?(x.setLineWidth(W.wireframeLinewidth*Pt()),Mt.setMode(H.LINES)):Mt.setMode(H.TRIANGLES);else if(X.isLine){let Dt=W.linewidth;Dt===void 0&&(Dt=1),x.setLineWidth(Dt*Pt()),X.isLineSegments?Mt.setMode(H.LINES):X.isLineLoop?Mt.setMode(H.LINE_LOOP):Mt.setMode(H.LINE_STRIP)}else X.isPoints?Mt.setMode(H.POINTS):X.isSprite&&Mt.setMode(H.TRIANGLES);if(X.isBatchedMesh)if(mt.get("WEBGL_multi_draw"))Mt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{const Dt=X._multiDrawStarts,Ce=X._multiDrawCounts,nn=X._multiDrawCount,Ke=Fe?oe.get(Fe).bytesPerElement:1,ft=G.get(W).currentProgram.getUniforms();for(let bn=0;bn<nn;bn++)ft.setValue(H,"_gl_DrawID",bn),Mt.render(Dt[bn]/Ke,Ce[bn])}else if(X.isInstancedMesh)Mt.renderInstances(Ne,yt,X.count);else if(Y.isInstancedBufferGeometry){const Dt=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Ce=Math.min(Y.instanceCount,Dt);Mt.renderInstances(Ne,yt,Ce)}else Mt.render(Ne,yt)};function ws(b,U,Y){b.transparent===!0&&b.side===hn&&b.forceSinglePass===!1?(b.side=_n,b.needsUpdate=!0,ki(b,U,Y),b.side=Li,b.needsUpdate=!0,ki(b,U,Y),b.side=hn):ki(b,U,Y)}this.compile=function(b,U,Y=null){Y===null&&(Y=b),E=ve.get(Y),E.init(U),_.push(E),Y.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(E.pushLight(X),X.castShadow&&E.pushShadow(X))}),b!==Y&&b.traverseVisible(function(X){X.isLight&&X.layers.test(U.layers)&&(E.pushLight(X),X.castShadow&&E.pushShadow(X))}),E.setupLights();const W=new Set;return b.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;const Ae=X.material;if(Ae)if(Array.isArray(Ae))for(let fe=0;fe<Ae.length;fe++){const Re=Ae[fe];ws(Re,Y,X),W.add(Re)}else ws(Ae,Y,X),W.add(Ae)}),E=_.pop(),W},this.compileAsync=function(b,U,Y=null){const W=this.compile(b,U,Y);return new Promise(X=>{function Ae(){if(W.forEach(function(fe){G.get(fe).currentProgram.isReady()&&W.delete(fe)}),W.size===0){X(b);return}setTimeout(Ae,10)}mt.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let bs=null;function La(b){bs&&bs(b)}function ii(){mn.stop()}function vi(){mn.start()}const mn=new Ff;mn.setAnimationLoop(La),typeof self<"u"&&mn.setContext(self),this.setAnimationLoop=function(b){bs=b,Be.setAnimationLoop(b),b===null?mn.stop():mn.start()},Be.addEventListener("sessionstart",ii),Be.addEventListener("sessionend",vi),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){Je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;k!==null&&k.renderStart(b,U);const Y=Be.enabled===!0&&Be.isPresenting===!0,W=R!==null&&(q===null||Y)&&R.begin(N,q);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(U),U=Be.getCamera()),b.isScene===!0&&b.onBeforeRender(N,b,U,q),E=ve.get(b,_.length),E.init(U),E.state.textureUnits=$.getTextureUnits(),_.push(E),V.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),le.setFromProjectionMatrix(V,hi,U.reversedDepth),Ye=this.localClippingEnabled,Se=ze.init(this.clippingPlanes,Ye),T=we.get(b,A.length),T.init(),A.push(T),Be.enabled===!0&&Be.isPresenting===!0){const fe=N.xr.getDepthSensingMesh();fe!==null&&si(fe,U,-1/0,N.sortObjects)}si(b,U,0,N.sortObjects),T.finish(),N.sortObjects===!0&&T.sort(He,Qe,U.reversedDepth),vt=Be.enabled===!1||Be.isPresenting===!1||Be.hasDepthSensing()===!1,vt&&je.addToRenderList(T,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Se===!0&&ze.beginShadows();const X=E.state.shadowsArray;if(Ue.render(X,b,U),Se===!0&&ze.endShadows(),(W&&R.hasRenderPass())===!1){const fe=T.opaque,Re=T.transmissive;if(E.setupLights(),U.isArrayCamera){const Fe=U.cameras;if(Re.length>0)for(let ke=0,et=Fe.length;ke<et;ke++){const nt=Fe[ke];is(fe,Re,b,nt)}vt&&je.render(b);for(let ke=0,et=Fe.length;ke<et;ke++){const nt=Fe[ke];Sr(T,b,nt,nt.viewport)}}else Re.length>0&&is(fe,Re,b,U),vt&&je.render(b),Sr(T,b,U)}q!==null&&L===0&&($.updateMultisampleRenderTarget(q),$.updateRenderTargetMipmap(q)),W&&R.end(N),b.isScene===!0&&b.onAfterRender(N,b,U),Ee.resetDefaultState(),K=-1,ae=null,_.pop(),_.length>0?(E=_[_.length-1],$.setTextureUnits(E.state.textureUnits),Se===!0&&ze.setGlobalState(N.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?T=A[A.length-1]:T=null,k!==null&&k.renderEnd()};function si(b,U,Y,W){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)Y=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLightProbeGrid)E.pushLightProbeGrid(b);else if(b.isLight)E.pushLight(b),b.castShadow&&E.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||le.intersectsSprite(b)){W&&Ge.setFromMatrixPosition(b.matrixWorld).applyMatrix4(V);const fe=ne.update(b),Re=b.material;Re.visible&&T.push(b,fe,Re,Y,Ge.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||le.intersectsObject(b))){const fe=ne.update(b),Re=b.material;if(W&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Ge.copy(b.boundingSphere.center)):(fe.boundingSphere===null&&fe.computeBoundingSphere(),Ge.copy(fe.boundingSphere.center)),Ge.applyMatrix4(b.matrixWorld).applyMatrix4(V)),Array.isArray(Re)){const Fe=fe.groups;for(let ke=0,et=Fe.length;ke<et;ke++){const nt=Fe[ke],Ne=Re[nt.materialIndex];Ne&&Ne.visible&&T.push(b,fe,Ne,Y,Ge.z,nt)}}else Re.visible&&T.push(b,fe,Re,Y,Ge.z,null)}}const Ae=b.children;for(let fe=0,Re=Ae.length;fe<Re;fe++)si(Ae[fe],U,Y,W)}function Sr(b,U,Y,W){const{opaque:X,transmissive:Ae,transparent:fe}=b;E.setupLightsView(Y),Se===!0&&ze.setGlobalState(N.clippingPlanes,Y),W&&x.viewport(ue.copy(W)),X.length>0&&Oi(X,U,Y),Ae.length>0&&Oi(Ae,U,Y),fe.length>0&&Oi(fe,U,Y),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function is(b,U,Y,W){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[W.id]===void 0){const Ne=mt.has("EXT_color_buffer_half_float")||mt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[W.id]=new jn(1,1,{generateMipmaps:!0,type:Ne?Ni:In,minFilter:Ai,samples:Math.max(4,w.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:dt.workingColorSpace})}const Ae=E.state.transmissionRenderTarget[W.id],fe=W.viewport||ue;Ae.setSize(fe.z*N.transmissionResolutionScale,fe.w*N.transmissionResolutionScale);const Re=N.getRenderTarget(),Fe=N.getActiveCubeFace(),ke=N.getActiveMipmapLevel();N.setRenderTarget(Ae),N.getClearColor(st),$e=N.getClearAlpha(),$e<1&&N.setClearColor(16777215,.5),N.clear(),vt&&je.render(Y);const et=N.toneMapping;N.toneMapping=fi;const nt=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),E.setupLightsView(W),Se===!0&&ze.setGlobalState(N.clippingPlanes,W),Oi(b,Y,W),$.updateMultisampleRenderTarget(Ae),$.updateRenderTargetMipmap(Ae),mt.has("WEBGL_multisampled_render_to_texture")===!1){let Ne=!1;for(let gt=0,yt=U.length;gt<yt;gt++){const Et=U[gt],{object:Mt,geometry:Dt,material:Ce,group:nn}=Et;if(Ce.side===hn&&Mt.layers.test(W.layers)){const Ke=Ce.side;Ce.side=_n,Ce.needsUpdate=!0,Bi(Mt,Y,W,Dt,Ce,nn),Ce.side=Ke,Ce.needsUpdate=!0,Ne=!0}}Ne===!0&&($.updateMultisampleRenderTarget(Ae),$.updateRenderTargetMipmap(Ae))}N.setRenderTarget(Re,Fe,ke),N.setClearColor(st,$e),nt!==void 0&&(W.viewport=nt),N.toneMapping=et}function Oi(b,U,Y){const W=U.isScene===!0?U.overrideMaterial:null;for(let X=0,Ae=b.length;X<Ae;X++){const fe=b[X],{object:Re,geometry:Fe,group:ke}=fe;let et=fe.material;et.allowOverride===!0&&W!==null&&(et=W),Re.layers.test(Y.layers)&&Bi(Re,U,Y,Fe,et,ke)}}function Bi(b,U,Y,W,X,Ae){b.onBeforeRender(N,U,Y,W,X,Ae),b.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),X.onBeforeRender(N,U,Y,W,b,Ae),X.transparent===!0&&X.side===hn&&X.forceSinglePass===!1?(X.side=_n,X.needsUpdate=!0,N.renderBufferDirect(Y,U,W,X,b,Ae),X.side=Li,X.needsUpdate=!0,N.renderBufferDirect(Y,U,W,X,b,Ae),X.side=hn):N.renderBufferDirect(Y,U,W,X,b,Ae),b.onAfterRender(N,U,Y,W,X,Ae)}function ki(b,U,Y){U.isScene!==!0&&(U=_t);const W=G.get(b),X=E.state.lights,Ae=E.state.shadowsArray,fe=X.state.version,Re=xe.getParameters(b,X.state,Ae,U,Y,E.state.lightProbeGridArray),Fe=xe.getProgramCacheKey(Re);let ke=W.programs;W.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?U.environment:null,W.fog=U.fog;const et=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;W.envMap=pe.get(b.envMap||W.environment,et),W.envMapRotation=W.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,ke===void 0&&(b.addEventListener("dispose",yn),ke=new Map,W.programs=ke);let nt=ke.get(Fe);if(nt!==void 0){if(W.currentProgram===nt&&W.lightsStateVersion===fe)return Nn(b,Re),nt}else Re.uniforms=xe.getUniforms(b),k!==null&&b.isNodeMaterial&&k.build(b,Y,Re),b.onBeforeCompile(Re,N),nt=xe.acquireProgram(Re,Fe),ke.set(Fe,nt),W.uniforms=Re.uniforms;const Ne=W.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ne.clippingPlanes=ze.uniform),Nn(b,Re),W.needsLights=Fn(b),W.lightsStateVersion=fe,W.needsLights&&(Ne.ambientLightColor.value=X.state.ambient,Ne.lightProbe.value=X.state.probe,Ne.directionalLights.value=X.state.directional,Ne.directionalLightShadows.value=X.state.directionalShadow,Ne.spotLights.value=X.state.spot,Ne.spotLightShadows.value=X.state.spotShadow,Ne.rectAreaLights.value=X.state.rectArea,Ne.ltc_1.value=X.state.rectAreaLTC1,Ne.ltc_2.value=X.state.rectAreaLTC2,Ne.pointLights.value=X.state.point,Ne.pointLightShadows.value=X.state.pointShadow,Ne.hemisphereLights.value=X.state.hemi,Ne.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Ne.spotLightMatrix.value=X.state.spotLightMatrix,Ne.spotLightMap.value=X.state.spotLightMap,Ne.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=E.state.lightProbeGridArray.length>0,W.currentProgram=nt,W.uniformsList=null,nt}function Es(b){if(b.uniformsList===null){const U=b.currentProgram.getUniforms();b.uniformsList=bo.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function Nn(b,U){const Y=G.get(b);Y.outputColorSpace=U.outputColorSpace,Y.batching=U.batching,Y.batchingColor=U.batchingColor,Y.instancing=U.instancing,Y.instancingColor=U.instancingColor,Y.instancingMorph=U.instancingMorph,Y.skinning=U.skinning,Y.morphTargets=U.morphTargets,Y.morphNormals=U.morphNormals,Y.morphColors=U.morphColors,Y.morphTargetsCount=U.morphTargetsCount,Y.numClippingPlanes=U.numClippingPlanes,Y.numIntersection=U.numClipIntersection,Y.vertexAlphas=U.vertexAlphas,Y.vertexTangents=U.vertexTangents,Y.toneMapping=U.toneMapping}function Dn(b,U){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;v.setFromMatrixPosition(U.matrixWorld);for(let Y=0,W=b.length;Y<W;Y++){const X=b[Y];if(X.texture!==null&&X.boundingBox.containsPoint(v))return X}return null}function $n(b,U,Y,W,X){U.isScene!==!0&&(U=_t),$.resetTextureUnits();const Ae=U.fog,fe=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?U.environment:null,Re=q===null?N.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:dt.workingColorSpace,Fe=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,ke=pe.get(W.envMap||fe,Fe),et=W.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,nt=!!Y.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ne=!!Y.morphAttributes.position,gt=!!Y.morphAttributes.normal,yt=!!Y.morphAttributes.color;let Et=fi;W.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Et=N.toneMapping);const Mt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Dt=Mt!==void 0?Mt.length:0,Ce=G.get(W),nn=E.state.lights;if(Se===!0&&(Ye===!0||b!==ae)){const xt=b===ae&&W.id===K;ze.setState(W,b,xt)}let Ke=!1;W.version===Ce.__version?(Ce.needsLights&&Ce.lightsStateVersion!==nn.state.version||Ce.outputColorSpace!==Re||X.isBatchedMesh&&Ce.batching===!1||!X.isBatchedMesh&&Ce.batching===!0||X.isBatchedMesh&&Ce.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Ce.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Ce.instancing===!1||!X.isInstancedMesh&&Ce.instancing===!0||X.isSkinnedMesh&&Ce.skinning===!1||!X.isSkinnedMesh&&Ce.skinning===!0||X.isInstancedMesh&&Ce.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ce.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ce.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ce.instancingMorph===!1&&X.morphTexture!==null||Ce.envMap!==ke||W.fog===!0&&Ce.fog!==Ae||Ce.numClippingPlanes!==void 0&&(Ce.numClippingPlanes!==ze.numPlanes||Ce.numIntersection!==ze.numIntersection)||Ce.vertexAlphas!==et||Ce.vertexTangents!==nt||Ce.morphTargets!==Ne||Ce.morphNormals!==gt||Ce.morphColors!==yt||Ce.toneMapping!==Et||Ce.morphTargetsCount!==Dt||!!Ce.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(Ke=!0):(Ke=!0,Ce.__version=W.version);let ft=Ce.currentProgram;Ke===!0&&(ft=ki(W,U,X),k&&W.isNodeMaterial&&k.onUpdateProgram(W,ft,Ce));let bn=!1,Yn=!1,_i=!1;const St=ft.getUniforms(),Ft=Ce.uniforms;if(x.useProgram(ft.program)&&(bn=!0,Yn=!0,_i=!0),W.id!==K&&(K=W.id,Yn=!0),Ce.needsLights){const xt=Dn(E.state.lightProbeGridArray,X);Ce.lightProbeGrid!==xt&&(Ce.lightProbeGrid=xt,Yn=!0)}if(bn||ae!==b){x.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),St.setValue(H,"projectionMatrix",b.projectionMatrix),St.setValue(H,"viewMatrix",b.matrixWorldInverse);const Mn=St.map.cameraPosition;Mn!==void 0&&Mn.setValue(H,ht.setFromMatrixPosition(b.matrixWorld)),w.logarithmicDepthBuffer&&St.setValue(H,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&St.setValue(H,"isOrthographic",b.isOrthographicCamera===!0),ae!==b&&(ae=b,Yn=!0,_i=!0)}if(Ce.needsLights&&(nn.state.directionalShadowMap.length>0&&St.setValue(H,"directionalShadowMap",nn.state.directionalShadowMap,$),nn.state.spotShadowMap.length>0&&St.setValue(H,"spotShadowMap",nn.state.spotShadowMap,$),nn.state.pointShadowMap.length>0&&St.setValue(H,"pointShadowMap",nn.state.pointShadowMap,$)),X.isSkinnedMesh){St.setOptional(H,X,"bindMatrix"),St.setOptional(H,X,"bindMatrixInverse");const xt=X.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),St.setValue(H,"boneTexture",xt.boneTexture,$))}X.isBatchedMesh&&(St.setOptional(H,X,"batchingTexture"),St.setValue(H,"batchingTexture",X._matricesTexture,$),St.setOptional(H,X,"batchingIdTexture"),St.setValue(H,"batchingIdTexture",X._indirectTexture,$),St.setOptional(H,X,"batchingColorTexture"),X._colorsTexture!==null&&St.setValue(H,"batchingColorTexture",X._colorsTexture,$));const On=Y.morphAttributes;if((On.position!==void 0||On.normal!==void 0||On.color!==void 0)&&B.update(X,Y,ft),(Yn||Ce.receiveShadow!==X.receiveShadow)&&(Ce.receiveShadow=X.receiveShadow,St.setValue(H,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&U.environment!==null&&(Ft.envMapIntensity.value=U.environmentIntensity),Ft.dfgLUT!==void 0&&(Ft.dfgLUT.value=hM()),Yn){if(St.setValue(H,"toneMappingExposure",N.toneMappingExposure),Ce.needsLights&&Un(Ft,_i),Ae&&W.fog===!0&&De.refreshFogUniforms(Ft,Ae),De.refreshMaterialUniforms(Ft,W,de,me,E.state.transmissionRenderTarget[b.id]),Ce.needsLights&&Ce.lightProbeGrid){const xt=Ce.lightProbeGrid;Ft.probesSH.value=xt.texture,Ft.probesMin.value.copy(xt.boundingBox.min),Ft.probesMax.value.copy(xt.boundingBox.max),Ft.probesResolution.value.copy(xt.resolution)}bo.upload(H,Es(Ce),Ft,$)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(bo.upload(H,Es(Ce),Ft,$),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&St.setValue(H,"center",X.center),St.setValue(H,"modelViewMatrix",X.modelViewMatrix),St.setValue(H,"normalMatrix",X.normalMatrix),St.setValue(H,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){const xt=W.uniformsGroups;for(let Mn=0,ln=xt.length;Mn<ln;Mn++){const zi=xt[Mn];ce.update(zi,ft),ce.bind(zi,ft)}}return ft}function Un(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function Fn(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(b,U,Y){const W=G.get(b);W.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),G.get(b.texture).__webglTexture=U,G.get(b.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Y,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,U){const Y=G.get(b);Y.__webglFramebuffer=U,Y.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,Y=0){q=b,z=U,L=Y;let W=null,X=!1,Ae=!1;if(b){const Re=G.get(b);if(Re.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(H.FRAMEBUFFER,Re.__webglFramebuffer),ue.copy(b.viewport),he.copy(b.scissor),Pe=b.scissorTest,x.viewport(ue),x.scissor(he),x.setScissorTest(Pe),K=-1;return}else if(Re.__webglFramebuffer===void 0)$.setupRenderTarget(b);else if(Re.__hasExternalTextures)$.rebindTextures(b,G.get(b.texture).__webglTexture,G.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const et=b.depthTexture;if(Re.__boundDepthTexture!==et){if(et!==null&&G.has(et)&&(b.width!==et.image.width||b.height!==et.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(b)}}const Fe=b.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(Ae=!0);const ke=G.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(ke[U])?W=ke[U][Y]:W=ke[U],X=!0):b.samples>0&&$.useMultisampledRTT(b)===!1?W=G.get(b).__webglMultisampledFramebuffer:Array.isArray(ke)?W=ke[Y]:W=ke,ue.copy(b.viewport),he.copy(b.scissor),Pe=b.scissorTest}else ue.copy(Xe).multiplyScalar(de).floor(),he.copy(wt).multiplyScalar(de).floor(),Pe=at;if(Y!==0&&(W=Z),x.bindFramebuffer(H.FRAMEBUFFER,W)&&x.drawBuffers(b,W),x.viewport(ue),x.scissor(he),x.setScissorTest(Pe),X){const Re=G.get(b.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+U,Re.__webglTexture,Y)}else if(Ae){const Re=U;for(let Fe=0;Fe<b.textures.length;Fe++){const ke=G.get(b.textures[Fe]);H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0+Fe,ke.__webglTexture,Y,Re)}}else if(b!==null&&Y!==0){const Re=G.get(b.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,Re.__webglTexture,Y)}K=-1},this.readRenderTargetPixels=function(b,U,Y,W,X,Ae,fe,Re=0){if(!(b&&b.isWebGLRenderTarget)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Fe=G.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&fe!==void 0&&(Fe=Fe[fe]),Fe){x.bindFramebuffer(H.FRAMEBUFFER,Fe);try{const ke=b.textures[Re],et=ke.format,nt=ke.type;if(b.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+Re),!w.textureFormatReadable(et)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!w.textureTypeReadable(nt)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-W&&Y>=0&&Y<=b.height-X&&H.readPixels(U,Y,W,X,be.convert(et),be.convert(nt),Ae)}finally{const ke=q!==null?G.get(q).__webglFramebuffer:null;x.bindFramebuffer(H.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(b,U,Y,W,X,Ae,fe,Re=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Fe=G.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&fe!==void 0&&(Fe=Fe[fe]),Fe)if(U>=0&&U<=b.width-W&&Y>=0&&Y<=b.height-X){x.bindFramebuffer(H.FRAMEBUFFER,Fe);const ke=b.textures[Re],et=ke.format,nt=ke.type;if(b.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+Re),!w.textureFormatReadable(et))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!w.textureTypeReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ne=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,Ne),H.bufferData(H.PIXEL_PACK_BUFFER,Ae.byteLength,H.STREAM_READ),H.readPixels(U,Y,W,X,be.convert(et),be.convert(nt),0);const gt=q!==null?G.get(q).__webglFramebuffer:null;x.bindFramebuffer(H.FRAMEBUFFER,gt);const yt=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await dm(H,yt,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,Ne),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,Ae),H.deleteBuffer(Ne),H.deleteSync(yt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,U=null,Y=0){const W=Math.pow(2,-Y),X=Math.floor(b.image.width*W),Ae=Math.floor(b.image.height*W),fe=U!==null?U.x:0,Re=U!==null?U.y:0;$.setTexture2D(b,0),H.copyTexSubImage2D(H.TEXTURE_2D,Y,0,0,fe,Re,X,Ae),x.unbindTexture()},this.copyTextureToTexture=function(b,U,Y=null,W=null,X=0,Ae=0){let fe,Re,Fe,ke,et,nt,Ne,gt,yt;const Et=b.isCompressedTexture?b.mipmaps[Ae]:b.image;if(Y!==null)fe=Y.max.x-Y.min.x,Re=Y.max.y-Y.min.y,Fe=Y.isBox3?Y.max.z-Y.min.z:1,ke=Y.min.x,et=Y.min.y,nt=Y.isBox3?Y.min.z:0;else{const Ft=Math.pow(2,-X);fe=Math.floor(Et.width*Ft),Re=Math.floor(Et.height*Ft),b.isDataArrayTexture?Fe=Et.depth:b.isData3DTexture?Fe=Math.floor(Et.depth*Ft):Fe=1,ke=0,et=0,nt=0}W!==null?(Ne=W.x,gt=W.y,yt=W.z):(Ne=0,gt=0,yt=0);const Mt=be.convert(U.format),Dt=be.convert(U.type);let Ce;U.isData3DTexture?($.setTexture3D(U,0),Ce=H.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?($.setTexture2DArray(U,0),Ce=H.TEXTURE_2D_ARRAY):($.setTexture2D(U,0),Ce=H.TEXTURE_2D),x.activeTexture(H.TEXTURE0),x.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,U.flipY),x.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),x.pixelStorei(H.UNPACK_ALIGNMENT,U.unpackAlignment);const nn=x.getParameter(H.UNPACK_ROW_LENGTH),Ke=x.getParameter(H.UNPACK_IMAGE_HEIGHT),ft=x.getParameter(H.UNPACK_SKIP_PIXELS),bn=x.getParameter(H.UNPACK_SKIP_ROWS),Yn=x.getParameter(H.UNPACK_SKIP_IMAGES);x.pixelStorei(H.UNPACK_ROW_LENGTH,Et.width),x.pixelStorei(H.UNPACK_IMAGE_HEIGHT,Et.height),x.pixelStorei(H.UNPACK_SKIP_PIXELS,ke),x.pixelStorei(H.UNPACK_SKIP_ROWS,et),x.pixelStorei(H.UNPACK_SKIP_IMAGES,nt);const _i=b.isDataArrayTexture||b.isData3DTexture,St=U.isDataArrayTexture||U.isData3DTexture;if(b.isDepthTexture){const Ft=G.get(b),On=G.get(U),xt=G.get(Ft.__renderTarget),Mn=G.get(On.__renderTarget);x.bindFramebuffer(H.READ_FRAMEBUFFER,xt.__webglFramebuffer),x.bindFramebuffer(H.DRAW_FRAMEBUFFER,Mn.__webglFramebuffer);for(let ln=0;ln<Fe;ln++)_i&&(H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,G.get(b).__webglTexture,X,nt+ln),H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,G.get(U).__webglTexture,Ae,yt+ln)),H.blitFramebuffer(ke,et,fe,Re,Ne,gt,fe,Re,H.DEPTH_BUFFER_BIT,H.NEAREST);x.bindFramebuffer(H.READ_FRAMEBUFFER,null),x.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else if(X!==0||b.isRenderTargetTexture||G.has(b)){const Ft=G.get(b),On=G.get(U);x.bindFramebuffer(H.READ_FRAMEBUFFER,ee),x.bindFramebuffer(H.DRAW_FRAMEBUFFER,C);for(let xt=0;xt<Fe;xt++)_i?H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,Ft.__webglTexture,X,nt+xt):H.framebufferTexture2D(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,Ft.__webglTexture,X),St?H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,On.__webglTexture,Ae,yt+xt):H.framebufferTexture2D(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,On.__webglTexture,Ae),X!==0?H.blitFramebuffer(ke,et,fe,Re,Ne,gt,fe,Re,H.COLOR_BUFFER_BIT,H.NEAREST):St?H.copyTexSubImage3D(Ce,Ae,Ne,gt,yt+xt,ke,et,fe,Re):H.copyTexSubImage2D(Ce,Ae,Ne,gt,ke,et,fe,Re);x.bindFramebuffer(H.READ_FRAMEBUFFER,null),x.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else St?b.isDataTexture||b.isData3DTexture?H.texSubImage3D(Ce,Ae,Ne,gt,yt,fe,Re,Fe,Mt,Dt,Et.data):U.isCompressedArrayTexture?H.compressedTexSubImage3D(Ce,Ae,Ne,gt,yt,fe,Re,Fe,Mt,Et.data):H.texSubImage3D(Ce,Ae,Ne,gt,yt,fe,Re,Fe,Mt,Dt,Et):b.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,Ae,Ne,gt,fe,Re,Mt,Dt,Et.data):b.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,Ae,Ne,gt,Et.width,Et.height,Mt,Et.data):H.texSubImage2D(H.TEXTURE_2D,Ae,Ne,gt,fe,Re,Mt,Dt,Et);x.pixelStorei(H.UNPACK_ROW_LENGTH,nn),x.pixelStorei(H.UNPACK_IMAGE_HEIGHT,Ke),x.pixelStorei(H.UNPACK_SKIP_PIXELS,ft),x.pixelStorei(H.UNPACK_SKIP_ROWS,bn),x.pixelStorei(H.UNPACK_SKIP_IMAGES,Yn),Ae===0&&U.generateMipmaps&&H.generateMipmap(Ce),x.unbindTexture()},this.initRenderTarget=function(b){G.get(b).__webglFramebuffer===void 0&&$.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?$.setTextureCube(b,0):b.isData3DTexture?$.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?$.setTexture2DArray(b,0):$.setTexture2D(b,0),x.unbindTexture()},this.resetState=function(){z=0,L=0,q=null,x.reset(),Ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return hi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=dt._getDrawingBufferColorSpace(e),t.unpackColorSpace=dt._getUnpackColorSpace()}}const $l=.85,Xf=1;function qf(i){const e=Math.min(1,Math.max(0,i));return $l+e*(Xf-$l)}function fM(i){return Math.min(Xf,Math.max($l,i))}const pM="typeless";function $f(i){return i===pM||i==="???"}function Iu(i,e,t){if($f(i))return 1;const n=t[i];if(!n)throw new Error(`typeChart missing attacker row: ${i}`);let s=1;for(const r of e){const a=n[r];if(a===void 0)throw new Error(`typeChart missing cell: ${i} → ${r}`);s*=a}return s}function Yf(i,e){if($f(i))return 1;for(let t=0;t<e.length;t++)if(e[t]===i)return 1.5;return 1}function Kf(i){const e=i.critical??1,{level:t,attack:n,defense:s,power:r,stab:a,typeEffectiveness:o,random:c}=i;if(r<=0||o===0||n<=0||s<=0||t<=0)return{damage:0,base:0,stab:a,typeEffectiveness:o,random:c,critical:e};const l=Math.floor(2*t/5+2),d=Math.floor(l*n/s*r/50)+2,h=d*a*o*e*c;return{damage:Math.max(0,Math.floor(h)),base:d,stab:a,typeEffectiveness:o,random:c,critical:e}}const Zf=6;function Yl(i){const e=Math.max(1,i|0);return Math.max(20,e*20)}function mM(i,e=50){return Math.max(1,Math.floor(e*Math.max(1,i)/7))}function $s(i,e,t){return t==="hp"?Math.floor(2*i*e/100)+e+10:Math.floor(2*i*e/100)+5}function gM(i=[]){return i.slice(0,Zf)}function Kl(i){return i.length<Zf}function xM(i,e){return Kl(i)?(i.push(e),!0):!1}function kc(i){for(const e of i)vM(e.battler)}function vM(i){if(i.hp=i.maxHp,i.fainted=!1,i.stages&&(i.stages.atk=0,i.stages.def=0,i.stages.spa=0,i.stages.spd=0,i.stages.spe=0),i.movePp&&i.moves)for(let e=0;e<i.moves.length;e++)i.movePp[e]=i.moves[e].pp}function Zl(i){const e=[];for(let t=0;t<i.length;t++){const n=i[t]?.battler;n&&n.hp>0&&!n.fainted&&e.push(t)}return e}function Jf(i){const e=i.findIndex(t=>t.battler.hp>0&&!t.battler.fainted);return e>=0?e:0}function Pa(i,e,t){let n;t!=null&&i[t]?n=i[t]:n=i.find(s=>s.battler.id===e.id),n||(n=i[0]),n&&(n.battler.hp=e.hp,n.battler.fainted=!!e.fainted||e.hp<=0,e.movePp&&(n.battler.movePp=e.movePp.slice()),e.xp!=null&&(n.battler.xp=e.xp),e.xpToNext!=null&&(n.battler.xpToNext=e.xpToNext),e.level!=null&&(n.battler.level=e.level),e.maxHp!=null&&(n.battler.maxHp=e.maxHp),e.stats&&(n.battler.stats={...e.stats}),e.baseStats&&(n.battler.baseStats={...e.baseStats}))}function Qf(i){const e=i.battler;return{...e,stats:{...e.stats},moves:e.moves.slice(),types:e.types.slice(),movePp:e.movePp?e.movePp.slice():e.moves.map(t=>t.pp),stages:e.stages?{...e.stages}:{atk:0,def:0,spa:0,spd:0,spe:0},hp:e.hp,maxHp:e.maxHp,fainted:e.fainted,xp:e.xp??0,xpToNext:e.xpToNext??Yl(e.level),baseStats:e.baseStats?{...e.baseStats}:void 0}}function _M(i,e){const t=[],n=Math.max(0,Math.floor(e));let s=0;for(i.xp=(i.xp??0)+n,i.xpToNext=i.xpToNext??Yl(i.level),t.push(`${i.name} gained ${n} XP!`);i.xp>=i.xpToNext&&i.level<100;){if(i.xp-=i.xpToNext,i.level+=1,s+=1,i.xpToNext=Yl(i.level),i.baseStats){const r=i.maxHp,a=i.baseStats;i.stats={hp:$s(a.hp,i.level,"hp"),atk:$s(a.atk,i.level,"other"),def:$s(a.def,i.level,"other"),spa:$s(a.spa,i.level,"other"),spd:$s(a.spd,i.level,"other"),spe:$s(a.spe,i.level,"other")},i.maxHp=i.stats.hp;const o=i.maxHp-r;o>0&&!i.fainted&&(i.hp=Math.min(i.maxHp,i.hp+o))}t.push(`${i.name} grew to level ${i.level}!`)}return{xpGained:n,levelsGained:s,newLevel:i.level,leveledUp:s>0,messages:t}}const Ci=Object.freeze({id:"field:route-3:echoing-stone",locationId:"location:kanto:route-3",rulesetVersion:1,stagger:Object.freeze({stat:"spe",stageDelta:-1}),accessibleSummary:"Echoing Stone: a sound move raises the stone ring and charges Echo. The next contact move before the ring settles consumes Echo and lowers its target’s Speed by one stage."}),ph=Object.freeze({riseMs:420,settleMs:280});function yM(i){if(i===Ci.locationId)return{id:Ci.id,rulesetVersion:Ci.rulesetVersion,echo:null}}function MM(i,e,t,n){const s=i.field;if(s){if(n.tags?.includes("contact")&&s.echo){const r=t==="player"?i.player:i.foe,a=r.stages??={atk:0,def:0,spa:0,spd:0,spe:0},o=a.spe;a.spe=Math.max(-6,o+Ci.stagger.stageDelta);const c=a.spe-o;s.echo=null,i.log.push({type:"field",fieldId:s.id,rulesetVersion:s.rulesetVersion,fieldAction:"echo-consumed",side:t,turn:i.turn,stageStat:Ci.stagger.stat,stageDelta:c,message:`Echo consumed. The stone ring drops and ${r.name}'s Speed falls by one stage.`})}n.tags?.includes("sound")&&(s.echo={chargedBy:e,expiresAfterTurn:i.turn+1},i.log.push({type:"field",fieldId:s.id,rulesetVersion:s.rulesetVersion,fieldAction:"echo-charged",side:e,turn:i.turn,message:`Echo charged. The stone ring rises; the next contact move through turn ${i.turn+1} will stagger its target.`}))}}function SM(i){const e=i.field;!e?.echo||i.turn<e.echo.expiresAfterTurn||(e.echo=null,i.log.push({type:"field",fieldId:e.id,rulesetVersion:e.rulesetVersion,fieldAction:"echo-settled",turn:i.turn,message:"Echo faded. The stone ring settles; no stagger is charged."}))}const zc={id:"struggle",name:"Struggle",type:"typeless",category:"physical",power:50,accuracy:null,priority:0};function jf(i){const e={player:Jl(i.player),foe:Jl(i.foe),turn:0,over:!1,log:[],typeChart:i.typeChart,playerPartyIndex:i.playerPartyIndex,needsForceSwitch:!1,locationId:i.locationId,field:yM(i.locationId)};return zt(e,{type:"battle-start",message:`${e.player.name} vs ${e.foe.name}`}),e}function wM(i,e,t,n){const s=Jf(i),r=i[s];if(!r)throw new Error("empty party");const a=Qf(r);return jf({player:a,foe:Jl(e),typeChart:t,playerPartyIndex:s,locationId:n})}function Jl(i){return{...i,stats:{...i.stats},moves:i.moves.slice(),types:i.types.slice(),movePp:i.movePp?i.movePp.slice():i.moves.map(e=>e.pp),stages:i.stages?{...i.stages}:{atk:0,def:0,spa:0,spd:0,spe:0},baseStats:i.baseStats?{...i.baseStats}:void 0}}function ep(i){return i.stages||(i.stages={atk:0,def:0,spa:0,spd:0,spe:0}),i.stages}function zt(i,e){i.log.push(e)}function bM(i){return i==="player"?"foe":"player"}function Ql(i,e){return e==="player"?i.player:i.foe}function EM(i){const e=Math.max(-6,Math.min(6,i|0));return e>=0?(2+e)/2:2/(2-e)}function dr(i,e){const t=i.stats[e],n=ep(i);return Math.max(1,Math.floor(t*EM(n[e])))}function Ys(i,e,t){return t==="hp"?Math.floor(2*i*e/100)+e+10:Math.floor(2*i*e/100)+5}function TM(i){const{baseStats:e,level:t}=i,n={hp:Ys(e.hp,t,"hp"),atk:Ys(e.atk,t,"other"),def:Ys(e.def,t,"other"),spa:Ys(e.spa,t,"other"),spd:Ys(e.spd,t,"other"),spe:Ys(e.spe,t,"other")},s=n.hp,r=i.hp!=null?Math.max(0,Math.min(s,i.hp)):s;return{id:i.id,name:i.name,speciesId:i.speciesId,types:i.types.slice(),level:t,hp:r,maxHp:s,stats:n,moves:i.moves,fainted:r<=0,movePp:i.moves.map(a=>a.pp),stages:{atk:0,def:0,spa:0,spd:0,spe:0},xp:i.xp??0,xpToNext:t*20,baseStats:{...e}}}function tp(i,e){if(e===!0||e===1.5||e===2)return{isCrit:!0,multiplier:typeof e=="number"&&e>1?e:1.5};if(e===!1||e===1)return{isCrit:!1,multiplier:1};const t=i<1/16;return{isCrit:t,multiplier:t?1.5:1}}function AM(i,e,t,n){const s=e.priority,r=t.priority;if(s>r)return["player","foe"];if(r>s)return["foe","player"];const a=dr(i.player,"spe"),o=dr(i.foe,"spe");return a>o?["player","foe"]:o>a?["foe","player"]:(n??0)<.5?["player","foe"]:["foe","player"]}function ua(i){return(i.rng??Math.random)()}function np(i,e,t){if(i.over)return i;if(t<0||t>=e.length)throw new Error(`Invalid party index ${t}`);const n=e[t];if(!n||n.battler.hp<=0||n.battler.fainted)return zt(i,{type:"message",message:"That creature can't battle!"}),i;Pa(e,i.player,i.playerPartyIndex);const s=Qf(n);return i.player=s,i.playerPartyIndex=t,i.player.stages={atk:0,def:0,spa:0,spd:0,spe:0},i.needsForceSwitch=!1,zt(i,{type:"switch",side:"player",partyIndex:t,message:`Go! ${s.name}!`}),i}function mh(i,e,t){if(i.over)return!1;Pa(e,i.player,i.playerPartyIndex),Zl(e).filter(r=>r!==i.playerPartyIndex||e[r].battler.hp>0);const n=Zl(e);if(n.length===0)return i.over=!0,i.winner="foe",i.needsForceSwitch=!1,zt(i,{type:"battle-end",winner:"foe",message:"You lose!"}),!1;const s=t!=null&&n.includes(t)?t:n[0];return np(i,e,s),!0}function RM(i,e,t,n,s){const r=Ql(i,e),a=ep(r),o=a[t],c=Math.max(-6,Math.min(6,o+n));a[t]=c;const l=c-o;if(l===0){zt(i,{type:"status",side:e,stageStat:t,stageDelta:0,message:`${r.name}'s ${t.toUpperCase()} won't go any ${n<0?"lower":"higher"}!`});return}const u=l<0?"fell":"rose",d=Math.abs(l)>=2?" sharply":"";zt(i,{type:"status",side:e,stageStat:t,stageDelta:l,message:`${r.name}'s ${t.toUpperCase()} ${u}${d}! (${s})`})}function CM(i){if(!i)return null;const e=/^(lower|raise)-([a-z]+)-(\d+)$/i.exec(i);if(!e)return null;const t=e[1].toLowerCase()==="lower"?-1:1,n=e[2].toLowerCase(),r={atk:"atk",attack:"atk",def:"def",defense:"def",spa:"spa",spd:"spd",spe:"spe",speed:"spe"}[n];if(!r)return null;const a=Math.max(1,Number(e[3])||1);return{stat:r,delta:t*a}}function Hc(i){return(!i.movePp||i.movePp.length!==i.moves.length)&&(i.movePp=i.moves.map(e=>e.pp)),i.movePp}function jl(i){return i.liveRolls===!0?!0:i.liveRolls===!1?!1:i.random==null&&i.damageRandoms==null}function IM(i,e,t){let n;if(i.damageRandoms&&i.damageRandoms[t]!=null)n=i.damageRandoms[t];else if(i.random!=null)n=i.random;else return qf(ua(i));return fM(n)}function PM(i,e){return i.critRolls&&i.critRolls[e]!=null?i.critRolls[e]:i.critRoll!=null?i.critRoll:i.forceCrit!=null?1:jl(i)?ua(i):1}function LM(i,e){if(i.over)return i;if(i.needsForceSwitch)return zt(i,{type:"message",message:"Choose a creature to send out!"}),i;i.turn+=1;const t=i.player.moves[e.playerMoveIndex],n=i.foe.moves[e.foeMoveIndex];if(!t||!n)throw new Error("Invalid move index");const s=Hc(i.player),r=Hc(i.foe),a=s[e.playerMoveIndex]<=0,o=r[e.foeMoveIndex]<=0,c=a?zc:t,l=o?zc:n;a&&zt(i,{type:"message",side:"player",message:`${i.player.name} has no PP left for ${t.name}!`}),o&&zt(i,{type:"message",side:"foe",message:`${i.foe.name} has no PP left for ${n.name}!`});const u=e.speedTieRoll??(jl(e)?ua(e):void 0),d=AM(i,c,l,u);let h=0,f=0;for(const m of d){if(i.over||i.needsForceSwitch)break;const y=Ql(i,m);if(y.fainted||y.hp<=0)continue;const p=m==="player"?e.playerMoveIndex:e.foeMoveIndex,g=m==="player"?a:o,M=g?zc:m==="player"?t:n,S=Hc(y);if(!g){if(S[p]<=0)continue;S[p]-=1}const v=bM(m),T=Ql(i,v);if(zt(i,{type:"move",side:m,moveId:M.id,message:`${y.name} used ${M.name}!`}),MM(i,m,v,M),M.accuracy!=null&&!e.forceAccuracyHit){const L=e.accuracyRolls&&e.accuracyRolls.length>0;if(L||jl(e)){let q;if(L?q=e.accuracyRolls[h++]??ua(e):(q=ua(e),h++),q*100>=M.accuracy){zt(i,{type:"miss",side:m,moveId:M.id,message:`${y.name}'s attack missed!`}),f++;continue}}}if(M.category==="status"||M.power==null||M.power<=0){const L=CM(M.effect);if(L){const q=L.delta<0?v:m;RM(i,q,L.stat,L.delta,M.name)}else zt(i,{type:"message",side:m,message:`${M.name} had no effect.`});f++;continue}const E=M.category==="physical"?"atk":"spa",A=M.category==="physical"?"def":"spd",_=dr(y,E),R=dr(T,A),N=Yf(M.type,y.types),D=Iu(M.type,T.types,i.typeChart),k=PM(e,f),Z=tp(k,e.forceCrit),ee=IM(e,m,f),C=Kf({level:y.level,attack:_,defense:R,power:M.power,stab:N,typeEffectiveness:D,random:ee,critical:Z.multiplier});Z.isCrit&&zt(i,{type:"crit",side:v,moveId:M.id,critical:!0,message:"A critical hit!"});const z=Math.min(C.damage,Math.max(0,T.hp));if(T.hp=Math.max(0,T.hp-z),zt(i,{type:"damage",side:v,damage:z,effectiveness:D,critical:Z.isCrit,moveId:M.id,message:DM(y.name,T.name,z,D,Z.isCrit)}),M.id==="struggle"&&!y.fainted&&y.hp>0){const L=Math.max(1,Math.floor(y.maxHp/4)),q=Math.min(L,y.hp);y.hp=Math.max(0,y.hp-q),zt(i,{type:"damage",side:m,damage:q,moveId:M.id,message:`${y.name} is hurt by recoil!`}),y.hp<=0&&(y.fainted=!0,zt(i,{type:"faint",side:m,message:`${y.name} fainted!`}),m==="foe"?i.over||(i.over=!0,i.winner="player",zt(i,{type:"battle-end",winner:"player",message:"You win!"})):gh(i,e.party))}T.hp<=0&&(T.fainted=!0,zt(i,{type:"faint",side:v,message:`${T.name} fainted!`}),v==="foe"?(i.over=!0,i.winner=m,zt(i,{type:"battle-end",winner:m,message:"You win!"})):gh(i,e.party)),f++}return SM(i),i}function gh(i,e){if(e&&e.length>0&&(Pa(e,i.player,i.playerPartyIndex),Zl(e).length>0)){i.needsForceSwitch=!0,i.over=!1,i.winner=void 0,zt(i,{type:"force-switch",side:"player",message:"Send out a creature!"});return}i.over=!0,i.winner="foe",i.needsForceSwitch=!1,zt(i,{type:"battle-end",winner:"foe",message:"You lose!"})}function NM(i,e={}){const t=[];if(i.winner!=="player")return{xpGained:0,leveledUp:!1,newLevel:i.player.level,messages:["No rewards — battle not won."]};const n=mM(i.foe.level,e.baseExp??50),s=_M(i.player,n);for(const r of s.messages)t.push(r),r.includes("grew to level")?zt(i,{type:"level-up",side:"player",level:i.player.level,message:r}):zt(i,{type:"xp",side:"player",xp:n,message:r});return e.party&&Pa(e.party,i.player,i.playerPartyIndex),{xpGained:s.xpGained,leveledUp:s.leveledUp,newLevel:s.newLevel,messages:t}}function DM(i,e,t,n,s){let r="";return s&&(r+=" A critical hit!"),n===0?r+=" It had no effect!":n>1?r+=" It's super effective!":n<1&&(r+=" It's not very effective..."),`${i} hit ${e} for ${t}.${r}`}function UM(i){const e=i.movePp;for(let t=0;t<i.moves.length;t++){const n=i.moves[t];if(!(e&&e[t]<=0)&&n.category!=="status"&&n.power!=null&&n.power>0)return t}for(let t=0;t<i.moves.length;t++)if(!e||e[t]>0)return t;return 0}function xh(i,e,t){const n=i.movePp;let s=-1,r=-1;for(let a=0;a<i.moves.length;a++){if(n&&n[a]<=0)continue;const o=i.moves[a];let c=0;if(o.category==="status")c=1;else if(o.power!=null&&o.power>0){const l=Iu(o.type,e.types,t);c=10+o.power*l,l>1&&(c+=20)}c>r&&(r=c,s=a)}return s>=0?s:UM(i)}function FM(i){const e=String(i.id??i.slug??"");if(!e)throw new Error("move missing id/slug");return{id:e,slug:typeof i.slug=="string"?i.slug:e,moveId:typeof i.moveId=="number"?i.moveId:void 0,name:String(i.name??e),type:String(i.type),category:i.category,power:i.power??null,accuracy:i.accuracy??null,pp:Number(i.pp??10),priority:Number(i.priority??0),target:typeof i.target=="string"?i.target:void 0,effect:typeof i.effect=="string"?i.effect:void 0,tags:Array.isArray(i.tags)?i.tags.filter(t=>t==="sound"||t==="contact"):void 0,description:typeof i.description=="string"?i.description:void 0}}function OM(i){const e=String(i.id??i.slug??"");if(!e)throw new Error("species missing id/slug");const t=i.learnset??i.moves??[],n=typeof i.catchRate=="number"?i.catchRate:typeof i.captureRate=="number"?i.captureRate:void 0,s=typeof i.baseExp=="number"?i.baseExp:typeof i.baseExperience=="number"?i.baseExperience:void 0;return{id:e,slug:typeof i.slug=="string"?i.slug:e,speciesId:typeof i.speciesId=="number"?i.speciesId:void 0,name:String(i.name??e),types:i.types.slice(),baseStats:i.baseStats,moves:t.slice(),role:typeof i.role=="string"?i.role:void 0,color:typeof i.color=="string"?i.color:void 0,flavor:typeof i.flavor=="string"?i.flavor:void 0,catchRate:n,baseExp:s}}const vh=28,BM=3.2,kM=4.5,_h=.72,zM=.28,HM={KeyW:"w",KeyA:"a",KeyS:"s",KeyD:"d",ArrowUp:"arrowup",ArrowDown:"arrowdown",ArrowLeft:"arrowleft",ArrowRight:"arrowright",ShiftLeft:"shift",ShiftRight:"shift",KeyE:"e"},VM=new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift","e"]);function yh(i){const e=i.code?HM[i.code]:void 0;if(e)return e;const t=i.key?.toLowerCase();return t&&VM.has(t)?t:null}function GM(i){let e=i;for(;e>Math.PI;)e-=Math.PI*2;for(;e<-Math.PI;)e+=Math.PI*2;return e}function WM(i,e,t){const n=GM(e-i);return i+n*Math.min(1,Math.max(0,t))}function XM(){return[{id:"house",minX:4.7,maxX:5.75,minZ:5.2,maxZ:6.05},{id:"gym",minX:-6.35,maxX:-5.15,minZ:2.55,maxZ:3.75},{id:"elite",minX:-6.85,maxX:-5.65,minZ:-.35,maxZ:.85}]}function qM(i){return{pos:i?.pos??{x:0,z:2.5},yaw:i?.yaw??Math.PI,targetYaw:i?.targetYaw??i?.yaw??Math.PI,vel:i?.vel??{x:0,z:0},speedNow:i?.speedNow??0,speed:i?.speed??3.2,runMultiplier:i?.runMultiplier??1.65,runBlend:i?.runBlend??0,bounds:i?.bounds??{minX:-8,maxX:8,minZ:-8,maxZ:8},grass:i?.grass??{cx:0,cz:-1.2,half:2.6,encounterChance:.22},obstacles:i?.obstacles??XM(),keys:i?.keys??new Set,analog:i?.analog??{x:0,z:0,interact:!1},grassSteps:0,grassDroughtMeters:0,encounterCooldown:i?.encounterCooldown??0,gaitDist:i?.gaitDist??0,footPhase:i?.footPhase??0,grassRustleT:i?.grassRustleT??0}}function $M(i,e=window){const t=r=>{const a=yh(r);a&&(i.add(a),(a.startsWith("arrow")||a==="w"||a==="a"||a==="s"||a==="d")&&r.preventDefault())},n=r=>{const a=yh(r);a&&i.delete(a)},s=()=>i.clear();return e.addEventListener("keydown",t),e.addEventListener("keyup",n),e.addEventListener("blur",s),()=>{e.removeEventListener("keydown",t),e.removeEventListener("keyup",n),e.removeEventListener("blur",s)}}const ip=.95;function YM(i,e){return!(!(Math.abs(i.x-e.cx)<=e.half&&Math.abs(i.z-e.cz)<=e.half)||Math.abs(i.x-e.cx)<ip)}function KM(i,e){i.x=Math.max(e.minX,Math.min(e.maxX,i.x)),i.z=Math.max(e.minZ,Math.min(e.maxZ,i.z))}function sp(i,e){return{minX:i.minX-e,maxX:i.maxX+e,minZ:i.minZ-e,maxZ:i.maxZ+e,id:i.id}}function Eo(i,e,t){return i>=t.minX&&i<=t.maxX&&e>=t.minZ&&e<=t.maxZ}function ZM(i,e,t,n=zM){let s=!1;for(const r of t){const a=sp(r,n);if(!Eo(i.x,i.z,a))continue;s=!0;const o={x:e.x,z:i.z},c={x:i.x,z:e.z},l=!Eo(o.x,o.z,a),u=!Eo(c.x,c.z,a);if(l&&!u)i.x=e.x;else if(u&&!l)i.z=e.z;else if(l&&u)Math.abs(i.x-e.x)<Math.abs(i.z-e.z)?i.x=e.x:i.z=e.z;else{const d=i.x-a.minX,h=a.maxX-i.x,f=i.z-a.minZ,m=a.maxZ-i.z,y=Math.min(d,h,f,m);y===d?i.x=a.minX-1e-4:y===h?i.x=a.maxX+1e-4:y===f?i.z=a.minZ-1e-4:i.z=a.maxZ+1e-4}}return s}function JM(i,e,t,n,s,r=1.6){let o=n;for(let c=1;c<=10;c++){const l=c/10*n,u=i-Math.sin(t)*l,d=e-Math.cos(t)*l;for(const h of s){const f=sp(h,.35);if(Eo(u,d,f))return o=Math.max(r,l-n/10),o}}return o}function QM(i,e,t=1.55){let n,s=t*t;for(const r of e){if(!r.id||r.id!=="gym"&&r.id!=="elite")continue;const a=(r.minX+r.maxX)*.5,o=(r.minZ+r.maxZ)*.5,c=(i.x-a)**2+(i.z-o)**2;c<=s&&(s=c,n=r.id)}return n}function jM(i,e,t=Math.random){i.encounterCooldown>0&&(i.encounterCooldown=Math.max(0,i.encounterCooldown-e));const n=i.keys;let s=i.analog.x,r=i.analog.z;(n.has("w")||n.has("arrowup"))&&(r-=1),(n.has("s")||n.has("arrowdown"))&&(r+=1),(n.has("a")||n.has("arrowleft"))&&(s-=1),(n.has("d")||n.has("arrowright"))&&(s+=1);const a=Math.hypot(s,r),o=n.has("shift")&&a>0,c=o?1:0,l=o?BM:kM;i.runBlend=Math.max(0,Math.min(1,i.runBlend+(c-i.runBlend)*Math.min(1,l*e)));const u=i.speed*(1+(i.runMultiplier-1)*i.runBlend);if(a>0){const E=s/a,A=r/a;i.targetYaw=Math.atan2(E,A);const _=E*u,R=A*u;i.vel.x+=(_-i.vel.x)*Math.min(1,vh*e),i.vel.z+=(R-i.vel.z)*Math.min(1,vh*e)}else{const E=Math.exp(-18*e);i.vel.x*=E,i.vel.z*=E,Math.hypot(i.vel.x,i.vel.z)<.05&&(i.vel.x=0,i.vel.z=0)}const d=Math.hypot(i.vel.x,i.vel.z);if(d>u&&d>1e-6){const E=u/d;i.vel.x*=E,i.vel.z*=E}i.speedNow=Math.hypot(i.vel.x,i.vel.z);const h=i.pos.x,f=i.pos.z;i.pos.x+=i.vel.x*e,i.pos.z+=i.vel.z*e,KM(i.pos,i.bounds);const m=ZM(i.pos,{x:h,z:f},i.obstacles);(i.pos.x===i.bounds.minX||i.pos.x===i.bounds.maxX)&&(i.vel.x=0),(i.pos.z===i.bounds.minZ||i.pos.z===i.bounds.maxZ)&&(i.vel.z=0),m&&(Math.abs(i.pos.x-h)<1e-6&&(i.vel.x=0),Math.abs(i.pos.z-f)<1e-6&&(i.vel.z=0));const y=Math.hypot(i.pos.x-h,i.pos.z-f),p=y>1e-4;i.speedNow>.15&&(i.yaw=WM(i.yaw,i.targetYaw,1-Math.exp(-10*e)));let g=!1;p?(i.gaitDist+=y,i.gaitDist>=_h&&(i.gaitDist-=_h,i.footPhase=1-i.footPhase,g=!0)):i.gaitDist=0;const M=YM(i.pos,i.grass);let S=!1,v=!1;if(M&&p?(i.grassRustleT+=e,i.grassRustleT>=.28&&(i.grassRustleT=0,v=!0)):M||(i.grassRustleT=0),p&&M&&i.encounterCooldown<=0){i.grassSteps+=1,i.grassDroughtMeters+=y;const E=4,A=24;if(i.grassSteps>=E){const _=Math.min(1.35,.45+(i.grassSteps-E)*.12),R=i.grass.encounterChance*_*Math.min(1,e*4);(i.grassDroughtMeters>=A||t()<R)&&(S=!0,i.grassSteps=0,i.grassDroughtMeters=0,i.encounterCooldown=1.35)}}else M||(i.grassSteps=0,i.grassDroughtMeters=0);const T=QM(i.pos,i.obstacles);return{moved:p,inGrass:M,encounter:S,pos:{x:i.pos.x,z:i.pos.z},footPlant:g,grassRustle:v,speed:i.speedNow,nearInteract:T}}function eS(){return{cx:4.5,cz:4.5,radius:1.55}}function tS(i,e){const t=i.x-e.cx,n=i.z-e.cz;return t*t+n*n<=e.radius*e.radius}function nS(i){return Math.max(0,Math.min(1,i))}function rp(i){let e=i>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function oi(i,e,t,n,s,r={}){return{kind:"tone",at:i,duration:e,frequency:t,gain:n,wave:s,...r}}function Zi(i,e,t,n,s,r,a={}){return{kind:"noise",at:i,duration:e,frequency:t,gain:n,filter:s,q:r,...a}}function qr(i,e,t){const n=t.panWidth??.1,s=e.map((r,a)=>oi(a*t.step,t.duration,r,t.gain*t.intensity,t.wave,{pan:(a-(e.length-1)/2)*n}));return{cue:i,duration:(e.length-1)*t.step+t.duration+.06,events:s}}function iS(i,e={}){const t=nS(e.intensity??1),n=rp(e.seed??1),s=r=>(n()*2-1)*r;switch(i){case"starter-confirm":return qr(i,[392,523.25,659.25],{gain:.105,step:.1,duration:.32,wave:"triangle",intensity:t,panWidth:.11});case"step":return{cue:i,duration:.12,events:[Zi(0,.055,1150+s(120),.027*t,"bandpass",.7,{pan:s(.24)}),oi(0,.07,92+s(5),.018*t,"sine")]};case"grass-rustle":return{cue:i,duration:.34,events:[Zi(0,.24,1850+s(260),.045*t,"bandpass",.85,{endFrequency:980+s(120),pan:s(.35)}),Zi(.08,.19,2550+s(320),.025*t,"highpass",.45,{pan:s(.4)})]};case"encounter":return{cue:i,duration:.72,events:[oi(0,.42,146.83,.11*t,"sawtooth",{endFrequency:587.33+s(12)}),oi(.2,.3,440,.08*t,"triangle",{pan:-.16}),oi(.31,.3,659.25,.08*t,"triangle",{pan:.16})]};case"battle-start":return qr(i,[196,293.66,392,587.33],{gain:.085,step:.075,duration:.24,wave:"sawtooth",intensity:t,panWidth:.08});case"move":return{cue:i,duration:.31,events:[oi(0,.24,185+s(18),.075*t,"sawtooth",{endFrequency:720+s(85),pan:s(.25)}),Zi(.04,.16,1350+s(180),.026*t,"bandpass",1.2)]};case"hit":return{cue:i,duration:.24,events:[Zi(0,.13,620+s(90),.12*t,"lowpass",.75,{endFrequency:170,pan:s(.18)}),oi(0,.18,78+s(5),.12*t,"sine",{endFrequency:52})]};case"catch-throw":return{cue:i,duration:.48,events:[oi(0,.4,330+s(9),.07*t,"sine",{endFrequency:1174.66+s(22),pan:-.28}),Zi(.07,.22,2100,.02*t,"highpass",.5,{pan:.22})]};case"catch-shake":return{cue:i,duration:.27,events:[Zi(0,.075,760+s(75),.07*t,"bandpass",1.6,{pan:-.22}),oi(.045,.13,210+s(8),.045*t,"triangle",{pan:.18}),Zi(.11,.07,980+s(80),.045*t,"bandpass",1.2,{pan:.24})]};case"catch-success":return qr(i,[523.25,659.25,783.99,987.77],{gain:.13,step:.12,duration:.28,wave:"triangle",intensity:t,panWidth:.08});case"heal":return qr(i,[392,493.88,587.33,783.99],{gain:.09,step:.09,duration:.48,wave:"sine",intensity:t,panWidth:.12});case"victory":return qr(i,[261.63,329.63,392,523.25,659.25],{gain:.105,step:.11,duration:.36,wave:"triangle",intensity:t,panWidth:.07});case"ui-confirm":return{cue:i,duration:.15,events:[oi(0,.11,698.46,.042*t,"sine",{endFrequency:880})]}}}function Mh(i,e={}){const t=rp(e.seed??1),n=()=>(t()*2-1)*4;switch(i){case"starter":return{scene:i,crossfadeMs:720,voices:[{kind:"tone",frequency:98,gain:.028,wave:"sine",detune:n(),tremoloHz:.09,tremoloDepth:.18},{kind:"tone",frequency:146.83,gain:.018,wave:"triangle",detune:n(),tremoloHz:.13,tremoloDepth:.22},{kind:"noise",gain:.013,filter:"lowpass",frequency:820,q:.45,driftHz:.06,driftDepth:180}]};case"explore":return{scene:i,crossfadeMs:900,voices:[{kind:"tone",frequency:110,gain:.022,wave:"sine",detune:n(),tremoloHz:.08,tremoloDepth:.16},{kind:"tone",frequency:164.81,gain:.012,wave:"triangle",detune:n(),tremoloHz:.11,tremoloDepth:.2},{kind:"noise",gain:.021,filter:"bandpass",frequency:1380,q:.36,driftHz:.05,driftDepth:420}]};case"battle":return{scene:i,crossfadeMs:360,voices:[{kind:"tone",frequency:73.42,gain:.035,wave:"sawtooth",detune:n(),tremoloHz:2.4,tremoloDepth:.42},{kind:"tone",frequency:110,gain:.021,wave:"triangle",detune:n(),tremoloHz:1.2,tremoloDepth:.3},{kind:"noise",gain:.018,filter:"lowpass",frequency:460,q:.75,driftHz:.32,driftDepth:120}]}}}function Sh(i){return Math.max(0,Math.min(1,i))}function sS(){const i=globalThis,e=i.AudioContext??i.webkitAudioContext;if(!e)throw new Error("WebAudio AudioContext is unavailable");return new e({latencyHint:"interactive"})}function kt(i,e,t){i.cancelScheduledValues(t),i.setValueAtTime(e,t)}function Vc(i,e,t,n=.04){i.cancelScheduledValues(t),i.setValueAtTime(Math.max(1e-4,i.value),t),i.exponentialRampToValueAtTime(Math.max(1e-4,e),t+n)}function Gc(i,e=0){try{i.stop(e)}catch{}}function cs(i){try{i.disconnect()}catch{}}function rS(i={}){const e=i.contextFactory??sS,t=i.seed??334462;let n=null,s=null,r=null,a=null,o=null,c=null,l=null,u=!1,d=Sh(i.masterGain??.72),h=0,f=0,m=!1,y=0;const p=new Set,g=()=>m?"closed":n?.state??"uninitialized",M=()=>({contextState:g(),scene:l,muted:u,masterGain:d,cueCount:h,activeVoices:f+p.size,disposed:m}),S=(C,z)=>{if(!n)throw new Error("soundscape context unavailable");const L=Math.max(1,Math.ceil(n.sampleRate*C)),q=n.createBuffer(1,L,n.sampleRate),K=q.getChannelData(0);let ae=z>>>0,ue=0;for(let he=0;he<K.length;he+=1){ae=ae+1831565813|0;let Pe=Math.imul(ae^ae>>>15,1|ae);Pe=Pe+Math.imul(Pe^Pe>>>7,61|Pe)^Pe;const st=((Pe^Pe>>>14)>>>0)/2147483648-1;ue=ue*.18+st*.82,K[he]=ue*.72}return q},v=()=>{if(m)throw new Error("procedural soundscape is disposed");if(n)return n;n=e();const C=n.currentTime;return s=n.createGain(),r=n.createDynamicsCompressor(),a=n.createGain(),o=n.createGain(),kt(s.gain,u?1e-4:d,C),kt(a.gain,1,C),kt(o.gain,1,C),kt(r.threshold,-18,C),kt(r.knee,16,C),kt(r.ratio,5,C),kt(r.attack,.008,C),kt(r.release,.2,C),a.connect(s),o.connect(s),s.connect(r),r.connect(n.destination),n},T=async()=>{const C=v();return C.state==="suspended"&&await C.resume(),M()},E=(C,z)=>{if(!C||!n)return;const L=n.currentTime;Vc(C.gain.gain,1e-4,L,Math.max(.02,z));const q=L+Math.max(.03,z)+.04;for(const K of C.sources)Gc(K,q);globalThis.setTimeout(()=>{for(const K of C.nodes)cs(K)},Math.ceil((z+.08)*1e3))},A=C=>{if(!n||!a)throw new Error("soundscape graph unavailable");const z=Mh(C,{seed:t+y}),L=n.currentTime,q=z.crossfadeMs/1e3,K=n.createGain();kt(K.gain,1e-4,L),K.gain.exponentialRampToValueAtTime(1,L+Math.max(.03,q)),K.connect(a);const ae=[],ue=[K];for(let he=0;he<z.voices.length;he+=1){const Pe=z.voices[he];if(Pe.kind==="tone"){const st=n.createOscillator(),$e=n.createGain(),j=n.createOscillator(),me=n.createGain();st.type=Pe.wave,kt(st.frequency,Pe.frequency,L),kt(st.detune,Pe.detune,L),kt($e.gain,Math.max(1e-4,Pe.gain*(1-Pe.tremoloDepth)),L),j.type="sine",kt(j.frequency,Pe.tremoloHz,L),kt(me.gain,Pe.gain*Pe.tremoloDepth,L),j.connect(me),me.connect($e.gain),st.connect($e),$e.connect(K),st.start(L),j.start(L),ae.push(st,j),ue.push(st,$e,j,me)}else{const st=n.createBufferSource(),$e=n.createBiquadFilter(),j=n.createGain(),me=n.createOscillator(),de=n.createGain();st.buffer=S(4,t+y*97+he*811),st.loop=!0,$e.type=Pe.filter,kt($e.frequency,Pe.frequency,L),kt($e.Q,Pe.q,L),kt(j.gain,Pe.gain,L),me.type="sine",kt(me.frequency,Pe.driftHz,L),kt(de.gain,Pe.driftDepth,L),me.connect(de),de.connect($e.frequency),st.connect($e),$e.connect(j),j.connect(K),st.start(L),me.start(L),ae.push(st,me),ue.push(st,$e,j,me,de)}}return{sources:ae,nodes:ue,gain:K,voiceCount:z.voices.length}},_=async C=>{if(await T(),l===C&&c)return M();y+=1;const z=c,L=Mh(C,{seed:t+y});return c=A(C),f=c.voiceCount,l=C,E(z,L.crossfadeMs/1e3),M()},R=(C,z,L)=>{if(!n||!o)throw new Error("soundscape cue graph unavailable");const q=[C,z];if(C.connect(z),L!=null&&typeof n.createStereoPanner=="function"){const K=n.createStereoPanner();K.pan.setValueAtTime(Math.max(-1,Math.min(1,L)),n.currentTime),z.connect(K),K.connect(o),q.push(K)}else z.connect(o);return q},N=(C,z)=>{if(!n)throw new Error("soundscape context unavailable");const L=n.currentTime+.012+C.at,q=L+Math.max(.025,C.duration),K=n.createGain();kt(K.gain,1e-4,L),K.gain.exponentialRampToValueAtTime(Math.max(1e-4,C.gain),L+Math.min(.018,C.duration*.25)),K.gain.exponentialRampToValueAtTime(1e-4,q);let ae,ue;if(C.kind==="tone"){const he=n.createOscillator();he.type=C.wave,kt(he.frequency,Math.max(1,C.frequency),L),C.endFrequency!=null&&he.frequency.exponentialRampToValueAtTime(Math.max(1,C.endFrequency),q),ae=he,ue=R(he,K,C.pan)}else{const he=n.createBufferSource(),Pe=n.createBiquadFilter();he.buffer=S(Math.max(.08,C.duration+.03),z),Pe.type=C.filter,kt(Pe.frequency,Math.max(20,C.frequency),L),kt(Pe.Q,Math.max(1e-4,C.q),L),C.endFrequency!=null&&Pe.frequency.exponentialRampToValueAtTime(Math.max(20,C.endFrequency),q),he.connect(Pe),ue=[he,Pe,...R(Pe,K,C.pan).slice(1)],ae=he}p.add(ae),ae.onended=()=>{p.delete(ae);for(const he of ue)cs(he)},ae.start(L),ae.stop(q+.025)};return{resume:T,setScene:_,cue:async(C,z={})=>{await T();const L=z.seed??t+h*4099+17,q=iS(C,{seed:L,intensity:z.intensity});for(let K=0;K<q.events.length;K+=1)N(q.events[K],L+K*131);return h+=1,M()},setMuted:C=>{u=C,n&&s&&Vc(s.gain,u?1e-4:d,n.currentTime,.035)},setMasterGain:C=>{d=Sh(C),n&&s&&!u&&Vc(s.gain,d,n.currentTime,.035)},snapshot:M,dispose:()=>{if(!m){if(m=!0,c){for(const C of c.sources)Gc(C);for(const C of c.nodes)cs(C)}c=null,f=0;for(const C of p)Gc(C);p.clear(),cs(a),cs(o),cs(s),cs(r),n&&n.state!=="closed"&&n.close(),l=null}}}}function aS(i){let e=i>>>0;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function oS(i){const e=Math.max(1,i.maxHp),t=Math.max(0,Math.min(e,i.hp)),n=Math.max(1,Math.min(255,i.catchRate)),s=i.ballMod??1,r=Math.floor((3*e-2*t)*n*s/(3*e));return Math.max(0,Math.min(255,r))}function cS(i){if(i>=255)return 1;if(i<=0)return 0;const e=255/i,t=Math.floor(65536/Math.pow(e,.1875));return Math.min(1,Math.max(0,t/65536))}function lS(i){const e=oS(i),t=["You threw a Catch Sphere!"],n=aS(i.seed??1);let s=0;const r=()=>i.rolls&&s<i.rolls.length?i.rolls[s++]:n();if(e>=255)return t.push("… … … Gotcha!"),{caught:!0,shakes:3,aValue:e,messages:t};const a=cS(e);let o=0;for(let c=0;c<3;c++)if(r()<a)o+=1,t.push(c===0?"…shake…":c===1?"…shake shake…":"…shake shake shake…");else return t.push("Oh no! It broke free!"),{caught:!1,shakes:o,aValue:e,messages:t};return t.push("Gotcha!"),{caught:!0,shakes:3,aValue:e,messages:t}}function uS(i){return i==="starter"?45:i==="wild"?190:120}function dS(i){return typeof i.catchRate=="number"&&Number.isFinite(i.catchRate)?Math.max(1,Math.min(255,Math.floor(i.catchRate))):uS(i.role)}const Ji={},wh=new WeakMap;function hS(){throw new Error("Procedural creature construction is excluded from the canonical private build")}function Cn(i){let e=wh.get(i);return e||(e={idlePhase:0,active:"idle",elapsed:0},wh.set(i,e)),e}function bh(i){i.active="attack",i.elapsed=0}function Wc(i){i.active="faint",i.elapsed=0}function Xc(i,e,t,n){e.elapsed+=t,e.active==="idle"&&(i.rotation.y+=Math.sin(n*.001+e.idlePhase)*t*.01),e.active==="attack"&&e.elapsed>.5&&(e.active="idle"),e.active==="faint"&&(i.rotation.z=Math.min(Math.PI/2,e.elapsed*2.5))}function Eh(i,e){if(e===jp)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Ol||e===rf){let t=i.getIndex();if(t===null){const a=[],o=i.getAttribute("position");if(o!==void 0){for(let c=0;c<o.count;c++)a.push(c);i.setIndex(a),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,s=[];if(e===Ol)for(let a=1;a<=n;a++)s.push(t.getX(0)),s.push(t.getX(a)),s.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(s.push(t.getX(a)),s.push(t.getX(a+1)),s.push(t.getX(a+2))):(s.push(t.getX(a+2)),s.push(t.getX(a+1)),s.push(t.getX(a)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function fS(i){const e=new Map,t=new Map,n=i.clone();return ap(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;const r=s,a=e.get(s),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function ap(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)ap(i.children[n],e.children[n],t)}class pS extends vr{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new _S(t)}),this.register(function(t){return new yS(t)}),this.register(function(t){return new CS(t)}),this.register(function(t){return new IS(t)}),this.register(function(t){return new PS(t)}),this.register(function(t){return new SS(t)}),this.register(function(t){return new wS(t)}),this.register(function(t){return new bS(t)}),this.register(function(t){return new ES(t)}),this.register(function(t){return new vS(t)}),this.register(function(t){return new TS(t)}),this.register(function(t){return new MS(t)}),this.register(function(t){return new RS(t)}),this.register(function(t){return new AS(t)}),this.register(function(t){return new gS(t)}),this.register(function(t){return new Th(t,ut.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Th(t,ut.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new LS(t)})}load(e,t,n,s){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const l=la.extractUrlBase(e);a=la.resolveURL(l,this.path)}else a=la.extractUrlBase(e);this.manager.itemStart(e);const o=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Pf(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,a,function(u){t(u),r.manager.itemEnd(e)},o)}catch(u){o(u)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r;const a={},o={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===op){try{a[ut.KHR_BINARY_GLTF]=new NS(e)}catch(d){s&&s(d);return}r=JSON.parse(a[ut.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new qS(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const d=this.pluginCallbacks[u](l);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[d.name]=d,a[d.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){const d=r.extensionsUsed[u],h=r.extensionsRequired||[];switch(d){case ut.KHR_MATERIALS_UNLIT:a[d]=new xS;break;case ut.KHR_DRACO_MESH_COMPRESSION:a[d]=new DS(r,this.dracoLoader);break;case ut.KHR_TEXTURE_TRANSFORM:a[d]=new US;break;case ut.KHR_MESH_QUANTIZATION:a[d]=new FS;break;default:h.indexOf(d)>=0&&o[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}l.setExtensions(a),l.setPlugins(o),l.parse(n,s)}parseAsync(e,t){const n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}}function mS(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function qt(i,e,t){const n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}const ut={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class gS{constructor(e){this.parser=e,this.name=ut.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let s=t.cache.get(n);if(s)return s;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const u=new qe(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],Pn);const d=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new ea(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Fi(u),l.distance=d;break;case"spot":l=new Df(u),l.distance=d,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),ci(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(c){return n._getNodeRef(t.cache,o,c)})}}class xS{constructor(){this.name=ut.KHR_MATERIALS_UNLIT}getMaterialType(){return Bt}extendParams(e,t,n){const s=[];e.color=new qe(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Pn),e.opacity=a[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Vt))}return Promise.all(s)}}class vS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}}class _S{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){const r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Te(r,r)}return Promise.all(s)}}class yS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_DISPERSION}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}}class MS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}}class SS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_SHEEN}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];if(t.sheenColor=new qe(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){const r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Pn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Vt)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}}class wS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}}class bS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_VOLUME}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;const r=n.attenuationColor||[1,1,1];return t.attenuationColor=new qe().setRGB(r[0],r[1],r[2],Pn),Promise.all(s)}}class ES{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_IOR}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}}class TS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_SPECULAR}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));const r=n.specularColorFactor||[1,1,1];return t.specularColor=new qe().setRGB(r[0],r[1],r[2],Pn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Vt)),Promise.all(s)}}class AS{constructor(e){this.parser=e,this.name=ut.EXT_MATERIALS_BUMP}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}}class RS{constructor(e){this.parser=e,this.name=ut.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return qt(this.parser,e,this.name)!==null?Ln:null}extendMaterialParams(e,t){const n=qt(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}}class CS{constructor(e){this.parser=e,this.name=ut.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;const r=s.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class IS{constructor(e){this.parser=e,this.name=ut.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=s.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class PS{constructor(e){this.parser=e,this.name=ut.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=s.images[a.source];let c=n.textureLoader;if(o.uri){const l=n.options.manager.getHandler(o.uri);l!==null&&(c=l)}return n.loadTextureImage(e,a.source,c)}}class Th{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const c=s.byteOffset||0,l=s.byteLength||0,u=s.count,d=s.byteStride,h=new Uint8Array(o,c,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(u,d,h,s.mode,s.filter).then(function(f){return f.buffer}):a.ready.then(function(){const f=new ArrayBuffer(u*d);return a.decodeGltfBuffer(new Uint8Array(f),u,d,h,s.mode,s.filter),f})})}else return null}}class LS{constructor(e){this.name=ut.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const s=t.meshes[n.mesh];for(const l of s.primitives)if(l.mode!==kn.TRIANGLES&&l.mode!==kn.TRIANGLE_STRIP&&l.mode!==kn.TRIANGLE_FAN&&l.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],c={};for(const l in a)o.push(this.parser.getDependency("accessor",a[l]).then(u=>(c[l]=u,c[l])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(l=>{const u=l.pop(),d=u.isGroup?u.children:[u],h=l[0].count,f=[];for(const m of d){const y=new rt,p=new P,g=new mi,M=new P(1,1,1),S=new Jm(m.geometry,m.material,h);for(let v=0;v<h;v++)c.TRANSLATION&&p.fromBufferAttribute(c.TRANSLATION,v),c.ROTATION&&g.fromBufferAttribute(c.ROTATION,v),c.SCALE&&M.fromBufferAttribute(c.SCALE,v),S.setMatrixAt(v,y.compose(p,g,M));for(const v in c)if(v==="_COLOR_0"){const T=c[v];S.instanceColor=new zl(T.array,T.itemSize,T.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&m.geometry.setAttribute(v,c[v]);Ut.prototype.copy.call(S,m),this.parser.assignFinalMaterial(S),f.push(S)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}}const op="glTF",$r=12,Ah={JSON:1313821514,BIN:5130562};class NS{constructor(e){this.name=ut.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,$r),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==op)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const s=this.header.length-$r,r=new DataView(e,$r);let a=0;for(;a<s;){const o=r.getUint32(a,!0);a+=4;const c=r.getUint32(a,!0);if(a+=4,c===Ah.JSON){const l=new Uint8Array(e,$r+a,o);this.content=n.decode(l)}else if(c===Ah.BIN){const l=$r+a;this.body=e.slice(l,l+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class DS{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ut.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},c={},l={};for(const u in a){const d=eu[u]||u.toLowerCase();o[d]=a[u]}for(const u in e.attributes){const d=eu[u]||u.toLowerCase();if(a[u]!==void 0){const h=n.accessors[e.attributes[u]],f=er[h.componentType];l[d]=f.name,c[d]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(d,h){s.decodeDracoFile(u,function(f){for(const m in f.attributes){const y=f.attributes[m],p=c[m];p!==void 0&&(y.normalized=p)}d(f)},o,l,Pn,h)})})}}class US{constructor(){this.name=ut.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class FS{constructor(){this.name=ut.KHR_MESH_QUANTIZATION}}class cp extends mr{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let a=0;a!==s;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=o*2,l=o*3,u=s-t,d=(n-t)/u,h=d*d,f=h*d,m=e*l,y=m-l,p=-2*f+3*h,g=f-h,M=1-p,S=g-h+d;for(let v=0;v!==o;v++){const T=a[y+v+o],E=a[y+v+c]*u,A=a[m+v+o],_=a[m+v]*u;r[v]=M*T+S*E+p*A+g*_}return r}}const OS=new mi;class BS extends cp{interpolate_(e,t,n,s){const r=super.interpolate_(e,t,n,s);return OS.fromArray(r).normalize().toArray(r),r}}const kn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},er={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Rh={9728:Jt,9729:Qt,9984:Jh,9985:_o,9986:Qr,9987:Ai},Ch={33071:di,33648:Ao,10497:sr},qc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},eu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Qi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},kS={CUBICSPLINE:void 0,LINEAR:ma,STEP:pa},$c={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function zS(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new lt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Li})),i.DefaultMaterial}function ls(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ci(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function HS(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,u=e.length;l<u;l++){const d=e[l];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(s=!0),d.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);const a=[],o=[],c=[];for(let l=0,u=e.length;l<u;l++){const d=e[l];if(n){const h=d.POSITION!==void 0?t.getDependency("accessor",d.POSITION):i.attributes.position;a.push(h)}if(s){const h=d.NORMAL!==void 0?t.getDependency("accessor",d.NORMAL):i.attributes.normal;o.push(h)}if(r){const h=d.COLOR_0!==void 0?t.getDependency("accessor",d.COLOR_0):i.attributes.color;c.push(h)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c)]).then(function(l){const u=l[0],d=l[1],h=l[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=d),r&&(i.morphAttributes.color=h),i.morphTargetsRelative=!0,i})}function VS(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function GS(i){let e;const t=i.extensions&&i.extensions[ut.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Yc(t.attributes):e=i.indices+":"+Yc(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Yc(i.targets[n]);return e}function Yc(i){let e="";const t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function tu(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function WS(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const XS=new rt;class qS{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new mS,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,a=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const c=o.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&a<98?this.textureLoader=new tg(this.options.manager):this.textureLoader=new ag(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Pf(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][s.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:s.asset,parser:n,userData:{}};return ls(r,o,s),ci(o,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(o)})).then(function(){for(const c of o.scenes)c.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){const a=t[s].joints;for(let o=0,c=a.length;o<c;o++)e[a[o]].isBone=!0}for(let s=0,r=e.length;s<r;s++){const a=e[s];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const s=n.clone(),r=(a,o)=>{const c=this.associations.get(a);c!=null&&this.associations.set(o,c);for(const[l,u]of a.children.entries())r(u,o.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const s=e(t[n]);if(s)return s}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let s=0;s<t.length;s++){const r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[ut.KHR_BINARY_GLTF].body);const s=this.options;return new Promise(function(r,a){n.load(la.resolveURL(t.uri,s.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){const t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){const a=qc[s.type],o=er[s.componentType],c=s.normalized===!0,l=new o(s.count*a);return Promise.resolve(new fn(l,a,c))}const r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],c=qc[s.type],l=er[s.componentType],u=l.BYTES_PER_ELEMENT,d=u*c,h=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,m=s.normalized===!0;let y,p;if(f&&f!==d){const g=Math.floor(h/f),M="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+g+":"+s.count;let S=t.cache.get(M);S||(y=new l(o,g*f,s.count*f/u),S=new ff(y,f/u),t.cache.add(M,S)),p=new ar(S,c,h%f/u,m)}else o===null?y=new l(s.count*c):y=new l(o,h,s.count*c),p=new fn(y,c,m);if(s.sparse!==void 0){const g=qc.SCALAR,M=er[s.sparse.indices.componentType],S=s.sparse.indices.byteOffset||0,v=s.sparse.values.byteOffset||0,T=new M(a[1],S,s.sparse.count*g),E=new l(a[2],v,s.sparse.count*c);o!==null&&(p=new fn(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let A=0,_=T.length;A<_;A++){const R=T[A];if(p.setX(R,E[A*c]),c>=2&&p.setY(R,E[A*c+1]),c>=3&&p.setZ(R,E[A*c+2]),c>=4&&p.setW(R,E[A*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=m}return p})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const c=n.manager.getHandler(a.uri);c!==null&&(o=c)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const s=this,r=this.json,a=r.textures[e],o=r.images[t],c=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=a.name||o.name||"",u.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(u.name=o.uri);const h=(r.samplers||{})[a.sampler]||{};return u.magFilter=Rh[h.magFilter]||Qt,u.minFilter=Rh[h.minFilter]||Ai,u.wrapS=Ch[h.wrapS]||sr,u.wrapT=Ch[h.wrapT]||sr,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Jt&&u.minFilter!==Qt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());const a=s.images[e],o=self.URL||self.webkitURL;let c=a.uri||"",l=!1;if(a.bufferView!==void 0)c=n.getDependency("bufferView",a.bufferView).then(function(d){l=!0;const h=new Blob([d],{type:a.mimeType});return c=o.createObjectURL(h),c});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(c).then(function(d){return new Promise(function(h,f){let m=h;t.isImageBitmapLoader===!0&&(m=function(y){const p=new jt(y);p.needsUpdate=!0,h(p)}),t.load(la.resolveURL(d,r.path),m,void 0,f)})}).then(function(d){return l===!0&&o.revokeObjectURL(c),ci(d,a),d.userData.mimeType=a.mimeType||WS(a.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[ut.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[ut.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const c=r.associations.get(a);a=r.extensions[ut.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,c)}}return s!==void 0&&(a.colorSpace=s),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new bu,ei.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(o,c)),n=c}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let c=this.cache.get(o);c||(c=new gf,ei.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(o,c)),n=c}if(s||r||a){let o="ClonedMaterial:"+n.uuid+":";s&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let c=this.cache.get(o);c||(c=n.clone(),r&&(c.vertexColors=!0),a&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(o,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return lt}loadMaterial(e){const t=this,n=this.json,s=this.extensions,r=n.materials[e];let a;const o={},c=r.extensions||{},l=[];if(c[ut.KHR_MATERIALS_UNLIT]){const d=s[ut.KHR_MATERIALS_UNLIT];a=d.getMaterialType(),l.push(d.extendParams(o,r,t))}else{const d=r.pbrMetallicRoughness||{};if(o.color=new qe(1,1,1),o.opacity=1,Array.isArray(d.baseColorFactor)){const h=d.baseColorFactor;o.color.setRGB(h[0],h[1],h[2],Pn),o.opacity=h[3]}d.baseColorTexture!==void 0&&l.push(t.assignTexture(o,"map",d.baseColorTexture,Vt)),o.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,o.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(o,"metalnessMap",d.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",d.metallicRoughnessTexture))),a=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=hn);const u=r.alphaMode||$c.OPAQUE;if(u===$c.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,u===$c.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==Bt&&(l.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new Te(1,1),r.normalTexture.scale!==void 0)){const d=r.normalTexture.scale;o.normalScale.set(d,d)}if(r.occlusionTexture!==void 0&&a!==Bt&&(l.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==Bt){const d=r.emissiveFactor;o.emissive=new qe().setRGB(d[0],d[1],d[2],Pn)}return r.emissiveTexture!==void 0&&a!==Bt&&l.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,Vt)),Promise.all(l).then(function(){const d=new a(o);return r.name&&(d.name=r.name),ci(d,r),t.associations.set(d,{materials:e}),r.extensions&&ls(s,d,r),d})}createUniqueName(e){const t=Ct.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,s=this.primitiveCache;function r(o){return n[ut.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(c){return Ih(c,o,t)})}const a=[];for(let o=0,c=e.length;o<c;o++){const l=e[o],u=GS(l),d=s[u];if(d)a.push(d.promise);else{let h;l.extensions&&l.extensions[ut.KHR_DRACO_MESH_COMPRESSION]?h=r(l):h=Ih(new Gt,l,t),s[u]={primitive:l,promise:h},a.push(h)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,s=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let c=0,l=a.length;c<l;c++){const u=a[c].material===void 0?zS(this.cache):this.getDependency("material",a[c].material);o.push(u)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(c){const l=c.slice(0,c.length-1),u=c[c.length-1],d=[];for(let f=0,m=u.length;f<m;f++){const y=u[f],p=a[f];let g;const M=l[f];if(p.mode===kn.TRIANGLES||p.mode===kn.TRIANGLE_STRIP||p.mode===kn.TRIANGLE_FAN||p.mode===void 0)g=r.isSkinnedMesh===!0?new Ym(y,M):new ye(y,M),g.isSkinnedMesh===!0&&g.normalizeSkinWeights(),p.mode===kn.TRIANGLE_STRIP?g.geometry=Eh(g.geometry,rf):p.mode===kn.TRIANGLE_FAN&&(g.geometry=Eh(g.geometry,Ol));else if(p.mode===kn.LINES)g=new t0(y,M);else if(p.mode===kn.LINE_STRIP)g=new wu(y,M);else if(p.mode===kn.LINE_LOOP)g=new n0(y,M);else if(p.mode===kn.POINTS)g=new xf(y,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(g.geometry.morphAttributes).length>0&&VS(g,r),g.name=t.createUniqueName(r.name||"mesh_"+e),ci(g,r),p.extensions&&ls(s,g,p),t.assignFinalMaterial(g),d.push(g)}for(let f=0,m=d.length;f<m;f++)t.associations.set(d[f],{meshes:e,primitives:f});if(d.length===1)return r.extensions&&ls(s,d[0],r),d[0];const h=new Ot;r.extensions&&ls(s,h,r),t.associations.set(h,{meshes:e});for(let f=0,m=d.length;f<m;f++)h.add(d[f]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new vn(xu.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Ia(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ci(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){const r=s.pop(),a=s,o=[],c=[];for(let l=0,u=a.length;l<u;l++){const d=a[l];if(d){o.push(d);const h=new rt;r!==null&&h.fromArray(r.array,l*16),c.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Mu(o,c)})}loadAnimation(e){const t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,a=[],o=[],c=[],l=[],u=[];for(let d=0,h=s.channels.length;d<h;d++){const f=s.channels[d],m=s.samplers[f.sampler],y=f.target,p=y.node,g=s.parameters!==void 0?s.parameters[m.input]:m.input,M=s.parameters!==void 0?s.parameters[m.output]:m.output;y.node!==void 0&&(a.push(this.getDependency("node",p)),o.push(this.getDependency("accessor",g)),c.push(this.getDependency("accessor",M)),l.push(m),u.push(y))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(d){const h=d[0],f=d[1],m=d[2],y=d[3],p=d[4],g=[];for(let S=0,v=h.length;S<v;S++){const T=h[S],E=f[S],A=m[S],_=y[S],R=p[S];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();const N=n._createAnimationTracks(T,E,A,_,R);if(N)for(let D=0;D<N.length;D++)g.push(N[D])}const M=new Y0(r,void 0,g);return ci(M,s),M})}createNodeMesh(e){const t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let c=0,l=s.weights.length;c<l;c++)o.morphTargetInfluences[c]=s.weights[c]}),a})}loadNode(e){const t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=s.children||[];for(let l=0,u=o.length;l<u;l++)a.push(n.getDependency("node",o[l]));const c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(a),c]).then(function(l){const u=l[0],d=l[1],h=l[2];h!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(h,XS)});for(let f=0,m=d.length;f<m;f++)u.add(d[f]);if(u.userData.pivot!==void 0&&d.length>0){const f=u.userData.pivot,m=d[0];u.pivot=new P().fromArray(f),u.position.x-=f[0],u.position.y-=f[1],u.position.z-=f[2],m.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?s.createUniqueName(r.name):"",o=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&o.push(c),r.camera!==void 0&&o.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let u;if(r.isBone===!0?u=new mf:l.length>1?u=new Ot:l.length===1?u=l[0]:u=new Ut,u!==l[0])for(let d=0,h=l.length;d<h;d++)u.add(l[d]);if(r.name&&(u.userData.name=r.name,u.name=a),ci(u,r),r.extensions&&ls(n,u,r),r.matrix!==void 0){const d=new rt;d.fromArray(r.matrix),u.applyMatrix4(d)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){const d=s.associations.get(u);s.associations.set(u,{...d})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],s=this,r=new Ot;n.name&&(r.name=s.createUniqueName(n.name)),ci(r,n),n.extensions&&ls(t,r,n);const a=n.nodes||[],o=[];for(let c=0,l=a.length;c<l;c++)o.push(s.getDependency("node",a[c]));return Promise.all(o).then(function(c){for(let u=0,d=c.length;u<d;u++){const h=c[u];h.parent!==null?r.add(fS(h)):r.add(h)}const l=u=>{const d=new Map;for(const[h,f]of s.associations)(h instanceof ei||h instanceof jt)&&d.set(h,f);return u.traverse(h=>{const f=s.associations.get(h);f!=null&&d.set(h,f)}),d};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){const a=[],o=e.name?e.name:e.uuid,c=[];function l(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}Qi[r.path]===Qi.weights?(l(e),e.isGroup&&e.children.forEach(l)):c.push(o);let u;switch(Qi[r.path]){case Qi.weights:u=wa;break;case Qi.rotation:u=ba;break;case Qi.translation:case Qi.scale:u=Uo;break;default:switch(n.itemSize){case 1:u=wa;break;case 2:case 3:default:u=Uo;break}break}const d=s.interpolation!==void 0?kS[s.interpolation]:ma,h=this._getArrayFromAccessor(n);for(let f=0,m=c.length;f<m;f++){const y=new u(c[f]+"."+Qi[r.path],t.array,h,d);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(y),a.push(y)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=tu(t.constructor),s=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const s=this instanceof ba?BS:cp;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function $S(i,e,t){const n=e.attributes,s=new qn;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],c=o.min,l=o.max;if(c!==void 0&&l!==void 0){if(s.set(new P(c[0],c[1],c[2]),new P(l[0],l[1],l[2])),o.normalized){const u=tu(er[o.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new P,c=new P;for(let l=0,u=r.length;l<u;l++){const d=r[l];if(d.POSITION!==void 0){const h=t.json.accessors[d.POSITION],f=h.min,m=h.max;if(f!==void 0&&m!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(m[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(m[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(m[2]))),h.normalized){const y=tu(er[h.componentType]);c.multiplyScalar(y)}o.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(o)}i.boundingBox=s;const a=new gi;s.getCenter(a.center),a.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=a}function Ih(i,e,t){const n=e.attributes,s=[];function r(a,o){return t.getDependency("accessor",a).then(function(c){i.setAttribute(o,c)})}for(const a in n){const o=eu[a]||a.toLowerCase();o in i.attributes||s.push(r(n[a],o))}if(e.indices!==void 0&&!i.index){const a=t.getDependency("accessor",e.indices).then(function(o){i.setIndex(o)});s.push(a)}return dt.workingColorSpace!==Pn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${dt.workingColorSpace}" not supported.`),ci(i,e),$S(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?HS(i,e.targets,t):i})}const YS=new TextEncoder,lp=new WeakMap,Ph=new WeakMap,Lh=new WeakMap,Nh=new WeakSet,Dh=new WeakSet;async function Vn(i){const e=typeof i=="string"?YS.encode(i):i,t=await crypto.subtle.digest("SHA-256",Uint8Array.from(e).buffer);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}function ps(i){return Array.isArray(i)?`[${i.map(ps).join(",")}]`:i&&typeof i=="object"?`{${Object.entries(i).sort(([e],[t])=>e.localeCompare(t)).map(([e,t])=>`${JSON.stringify(e)}:${ps(t)}`).join(",")}}`:JSON.stringify(i)}function Fo(i){const e=i instanceof ar?i.data.array:i.array;return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}function KS(i){return ArrayBuffer.isView(i)?new Uint8Array(i.buffer,i.byteOffset,i.byteLength):i instanceof ArrayBuffer?new Uint8Array(i):null}async function Uh(i){const e=i,t=KS(e?.data);if(t)return{width:e?.width,height:e?.height,depth:e?.depth??null,sha256:await Vn(t)};if(typeof document<"u"&&i&&(typeof ImageBitmap<"u"&&i instanceof ImageBitmap||typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement)){const s=i,r=document.createElement("canvas");r.width=s.width,r.height=s.height;const a=r.getContext("2d",{willReadFrequently:!0});if(!a)throw new Error("unsupported canonical texture: 2D pixels unavailable");try{a.drawImage(s,0,0);const o=a.getImageData(0,0,s.width,s.height).data;return{width:s.width,height:s.height,sha256:await Vn(new Uint8Array(o.buffer,o.byteOffset,o.byteLength))}}catch(o){throw new Error("unsupported canonical texture: pixels are not synchronously readable",{cause:o})}}throw new Error("unsupported canonical texture: immutable source bytes required")}async function ZS(i){if(Dh.has(i)||(Dh.add(i),i.addEventListener("dispose",()=>Nh.add(i))),Nh.has(i))throw new Error("canonical texture was disposed");const e=Array.isArray(i.image)?i.image:[i.image];return{uuid:i.uuid,sourceUuid:i.source.uuid,version:i.version,format:i.format,internalFormat:i.internalFormat,type:i.type,colorSpace:i.colorSpace,channel:i.channel,mapping:i.mapping,wrapS:i.wrapS,wrapT:i.wrapT,wrapR:i.wrapR??null,magFilter:i.magFilter,minFilter:i.minFilter,anisotropy:i.anisotropy,flipY:i.flipY,premultiplyAlpha:i.premultiplyAlpha,unpackAlignment:i.unpackAlignment,generateMipmaps:i.generateMipmaps,offset:i.offset.toArray(),repeat:i.repeat.toArray(),center:i.center.toArray(),rotation:i.rotation,matrixAutoUpdate:i.matrixAutoUpdate,matrix:i.matrix.toArray(),images:await Promise.all(e.map(Uh)),mipmaps:await Promise.all(i.mipmaps.map(Uh))}}async function JS(i){i.updateWorldMatrix(!0,!0);const e=new P;return i.matrixWorld.decompose(new P,new mi,e),Vn(ps({parentUuid:i.parent?.uuid??null,matrixAutoUpdate:i.matrixAutoUpdate,position:i.position.toArray(),quaternion:i.quaternion.toArray(),scale:i.scale.toArray(),matrix:i.matrix.toArray(),matrixWorld:i.matrixWorld.toArray(),effectiveWorldScale:e.toArray()}))}async function QS(i){i.updateWorldMatrix(!0,!0);const e=[],t=async(n,s,r)=>{const a=new P().setFromMatrixScale(n.matrixWorld),o=n,c=n,l=n;e.push({path:s,uuidLineage:[...r,n.uuid],uuid:n.uuid,canonicalSourceMeshUuid:n.userData.canonicalSourceMeshUuid??null,parentUuid:n.parent?.uuid??null,type:n.type,matrixAutoUpdate:n.matrixAutoUpdate,matrixWorldAutoUpdate:n.matrixWorldAutoUpdate,position:n.position.toArray(),quaternion:n.quaternion.toArray(),scale:n.scale.toArray(),matrix:n.matrix.toArray(),matrixWorld:n.matrixWorld.toArray(),effectiveWorldScale:a.toArray(),visible:n.visible,layers:n.layers.mask,renderOrder:n.renderOrder,frustumCulled:n.frustumCulled,castShadow:n.castShadow,receiveShadow:n.receiveShadow,morphTargetInfluences:o.morphTargetInfluences?[...o.morphTargetInfluences]:null,bindMode:c.isSkinnedMesh?c.bindMode:null,bindMatrix:c.isSkinnedMesh?c.bindMatrix.toArray():null,bindMatrixInverse:c.isSkinnedMesh?c.bindMatrixInverse.toArray():null,skeleton:c.isSkinnedMesh?{boneInverses:c.skeleton.boneInverses.map(u=>u.toArray()),boneMatrices:c.skeleton.boneMatrices?await Vn(new Uint8Array(c.skeleton.boneMatrices.buffer)):null}:null,instanceMatrix:l.isInstancedMesh?await Vn(Fo(l.instanceMatrix)):null,instanceColor:l.isInstancedMesh&&l.instanceColor?await Vn(Fo(l.instanceColor)):null,count:l.isInstancedMesh?l.count:null});for(let u=0;u<n.children.length;u+=1){const d=n.children[u];await t(d,`${s}/${u}:${d.name||d.type}`,[...r,n.uuid])}};return await t(i,`0:${i.name||i.type}`,[]),Vn(ps(e))}async function up(i){const e=[],t=[],n=[],s=async(r,a)=>{const o=r;if(o.isMesh){const c=o.geometry,l={};for(const[d,h]of Object.entries(c.attributes).sort(([f],[m])=>f.localeCompare(m)))l[d]={itemSize:h.itemSize,normalized:h.normalized,count:h.count,sha256:await Vn(Fo(h))};e.push({path:a,sourceMeshUuid:r.userData.canonicalSourceMeshUuid,geometryUuid:c.uuid,attributes:l,index:c.index?{count:c.index.count,sha256:await Vn(Fo(c.index))}:null,morphAttributes:Object.keys(c.morphAttributes).sort()});for(const d of Array.isArray(o.material)?o.material:[o.material]){const h=d,f=["map","alphaMap","aoMap","bumpMap","emissiveMap","envMap","lightMap","metalnessMap","normalMap","roughnessMap"],m=Object.fromEntries(await Promise.all(f.map(async y=>{const p=h[y];return[y,p?await ZS(p):null]})));t.push({path:a,uuid:d.uuid,type:d.type,defines:h.defines??null,color:h.color?.getHexString()??null,emissive:h.emissive?.getHexString()??null,transparent:d.transparent,side:d.side,vertexColors:d.vertexColors,alphaTest:d.alphaTest,blending:d.blending,roughness:h.roughness??null,metalness:h.metalness??null,maps:m})}const u=o;u.isSkinnedMesh&&n.push({path:a,bindMode:u.bindMode,bones:u.skeleton.bones.map(d=>({name:d.name,uuid:d.uuid}))})}await Promise.all(r.children.map((c,l)=>s(c,`${a}/${l}:${c.name||c.type}`)))};return await s(i,`0:${i.name||i.type}`),{geometrySha256:await Vn(ps(e)),materialSha256:await Vn(ps(t)),skeletonSignature:await Vn(ps(n))}}async function jS(i,e){i.traverse(n=>{n.isMesh&&(n.userData.canonicalSourceMeshUuid=n.uuid)});const t={...e,templateRootUuid:i.uuid,...await up(i)};return i.userData.canonicalBinding=t,t}function ew(i,e,t){const n=e.userData.canonicalBinding;if(!n)throw new Error("Canonical template provenance missing");i.userData.canonicalBinding=structuredClone(n),i.userData.scale=t,i.userData.renderRootUuid=i.uuid,lp.set(i,i.scale.toArray())}async function go(i,e){const t=i.userData.canonicalBinding;if(!t)throw new Error("canonical binding missing");if(t.speciesId!==e.speciesId)throw new Error("species lineage mismatch");if(t.sourceSha256!==e.sourceSha256)throw new Error("source SHA mismatch");if(i.userData.scale!==e.scale)throw new Error("canonical scale mismatch");if(i.userData.renderRootUuid!==i.uuid&&t.templateRootUuid!==i.uuid)throw new Error("render UUID lineage mismatch");const n=await up(i);if(n.geometrySha256!==t.geometrySha256)throw new Error("geometry lineage mismatch");if(n.materialSha256!==t.materialSha256)throw new Error("material lineage mismatch");if(n.skeletonSignature!==t.skeletonSignature)throw new Error("skeleton lineage mismatch");const s=lp.get(i);if(!s||i.scale.toArray().some((l,u)=>l!==s[u]))throw new Error("transform lineage mismatch: effective canonical scale changed");const r=await JS(i),a=Ph.get(i);if(a&&a!==r)throw new Error("transform lineage mismatch");Ph.set(i,r);const o=await QS(i),c=Lh.get(i);if(c&&c!==o)throw new Error("render tree lineage mismatch");return Lh.set(i,o),{...t,scale:e.scale,renderRootUuid:i.uuid,transformSha256:r}}const tw=["bulbasaur","charmander","squirtle","pidgey","caterpie","geodude"],nu=Object.freeze({bulbasaur:"cad6e93a2e77d21148f932c27688ff07c5028eb87f3ba9f891a2f3f5ad8e1354",charmander:"82c90f71d325d3e93803978cb66e8b6eaceeda5d4280706d9eb388a81975acd2",squirtle:"b41a8ef1fc5caef02ea38eca7fa795ba974645f090e8a0574509d58c381e5805",pidgey:"1685b6f5b9215645d274d31480cf9de8c26011aa7e424700f38b9d70cae4e261",caterpie:"0a2093b6a4053a075c515591ae9a8f9c88b27fa66c27b72493cdac3648e247f2",geodude:"f337566e5eece5d263cd7725d65563d31c0418fd138fa45663be679728d8d809"}),dp=new Map;function nw(i,e){const t=new Ot;t.name=`canonical:${e}`,t.add(i),i.updateWorldMatrix(!0,!0);const n=new qn().setFromObject(i,!0);if(n.isEmpty())throw new Error(`Canonical private asset ${e} has empty geometry`);const s=n.getSize(new P),r=Math.max(s.x,s.y,s.z),a=Math.min(s.x,s.y,s.z);if(!Number.isFinite(r)||r<=0||a/r<=.12)throw new Error(`Canonical private asset ${e} failed geometry extent gate`);const o=1.25/r;i.scale.setScalar(o),i.updateWorldMatrix(!0,!0);const c=new qn().setFromObject(i,!0),l=c.getCenter(new P);return i.position.x-=l.x,i.position.z-=l.z,i.position.y-=c.min.y,i.traverse(u=>{const d=u;d.isMesh&&(d.castShadow=!0,d.receiveShadow=!0)}),t.userData.speciesId=e,t.userData.identityPlane="canonical-private-local",t.userData.liveMeshPath=`promoted-glb:hunyuan:${e}`,t}async function iw(i){const e=new pS;for(const t of i){if(!tw.includes(t))throw new Error(`Canonical private species ${t} is not allowlisted; stand-in fallback forbidden`);let n;try{const r=await fetch(`/private-assets/${t}.glb`,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const a=await r.arrayBuffer(),o=await crypto.subtle.digest("SHA-256",a);if([...new Uint8Array(o)].map(l=>l.toString(16).padStart(2,"0")).join("")!==nu[t])throw new Error(`source SHA mismatch for ${t}`);n=await e.parseAsync(a,"/private-assets/")}catch(r){throw new Error(`Canonical private asset missing for ${t}; stand-in fallback forbidden`,{cause:r})}const s=nw(n.scene,t);await jS(s,{speciesId:t,sourceSha256:nu[t],sourceSceneUuid:n.scene.uuid,animationVariant:n.animations.map(r=>r.name||r.uuid).join("|")||"none"}),dp.set(t,s)}}function hp(i,e=1){const t=dp.get(i);if(!t)throw new Error(`Canonical private asset ${i} was not preloaded; stand-in fallback forbidden`);const n=t.clone(!0);return n.scale.multiplyScalar(e),n.userData.speciesId=i,ew(n,t,e),n}function sw(i){const e=new Map,t=(n,s)=>{const r=`${n}@${s.toFixed(3)}`;e.set(r,{speciesId:n,scale:s,key:r})};for(const n of i.starterChoices)t(n,.9);for(const n of i.wildEncounters)t(n.species,1.02);return i.gym&&t(i.gym.species,1.02),[...e.values()]}async function rw(i){if(!(i.renderer instanceof Wf))throw new Error("Canonical prewarm production authority requires THREE.WebGLRenderer");if(!i.curtainOpaque())throw new Error("Canonical battle prewarm requires an opaque boot curtain");if(i.plan.length===0)throw new Error("Canonical battle prewarm plan is empty");const e=performance.now(),t=new uf;t.background=new qe(65793),t.add(new Lf(16777215,3158064,3));const n=new Ia(-4,4,2,-2,.1,20);n.position.set(0,1,6),n.lookAt(0,.6,0),n.updateMatrixWorld(!0);const s=new Ot;s.name="canonical-battle-prewarm";const r=[],a=[];for(const[d,h]of i.plan.entries()){const f=`${h.speciesId}@${h.scale.toFixed(3)}`;if(h.key!==f)throw new Error(`exact prewarm key mismatch: expected ${f}, received ${h.key}`);const m=nu[h.speciesId];if(!m)throw new Error(`Canonical source SHA unavailable for ${h.speciesId}`);const y=i.makeMesh(h.speciesId,h.scale);y.position.x+=(d-(i.plan.length-1)/2)*1.15,y.userData.prewarmKey=h.key,s.add(y),a.push({mesh:y,entry:h,sourceSha256:m})}t.add(s),t.updateMatrixWorld(!0);for(const{mesh:d,entry:h,sourceSha256:f}of a)r.push(await go(d,{speciesId:h.speciesId,sourceSha256:f,scale:h.scale}));const o=i.renderer,c=new jn(128,64,{depthBuffer:!0,stencilBuffer:!1,colorSpace:Vt}),l=o.getRenderTarget(),u=o.getContext();try{for(const{mesh:T,entry:E,sourceSha256:A}of a)await go(T,{speciesId:E.speciesId,sourceSha256:A,scale:E.scale});const d=o.info.programs?.length??0,h=performance.now();u.getExtension("KHR_parallel_shader_compile")?await o.compileAsync(t,n):o.compile(t,n);const f=performance.now();if((o.info.programs?.length??0)<=d)throw new Error("Canonical compile produced no observable WebGL program");o.setRenderTarget(c),o.setClearColor(0,0),o.clear(!0,!0,!0),t.updateMatrixWorld(!0);for(const{mesh:T,entry:E,sourceSha256:A}of a)await go(T,{speciesId:E.speciesId,sourceSha256:A,scale:E.scale});const y=o.info.render.calls;o.render(t,n);const p=performance.now(),g=o.info.render.calls-y;if(g<=0)throw new Error("Canonical hidden draw produced no renderer draw call");u.finish();const M=new Uint8Array(c.width*c.height*4);o.readRenderTargetPixels(c,0,0,c.width,c.height,M);const S=performance.now();let v=0;for(let T=0;T<M.length;T+=4)(M[T]!==0||M[T+1]!==0||M[T+2]!==0||M[T+3]!==0)&&(v+=1);if(v===0)throw new Error("Canonical hidden draw produced no observable framebuffer pixels");if(u.getError()!==u.NO_ERROR)throw new Error("Canonical hidden draw ended with a WebGL error");for(const{mesh:T,entry:E,sourceSha256:A}of a)await go(T,{speciesId:E.speciesId,sourceSha256:A,scale:E.scale});if(!i.curtainOpaque())throw new Error("Canonical battle prewarm boot curtain released before observed draw completion");return{completed:!0,keys:i.plan.map(T=>T.key),meshCount:s.children.length,bindings:r,renderer:"THREE.WebGLRenderer",drawCalls:g,nonClearPixels:v,completionBoundary:"gl.finish+readPixels-observed-not-independent-gpu-attestation",compileMs:f-h,drawSubmitMs:p-f,gpuObservedMs:S-p,totalMs:S-e}}finally{o.setRenderTarget(l),c.dispose()}}const vs={id:"medium-1080p",width:1920,height:1080,maxPixelRatio:1,antialias:!1,warmupFrames:120},Kc={p99_ms_max:16.7,long_frame_ms:50,long_frame_max_count:0},aw=16384;class ow{capacity;warmupFrames;buf;cursor=0;filled=0;totalSeen=0;warmupSkipped=0;maxMs=0;sumMs=0;over167=0;over50=0;recording=!0;presetId=null;constructor(e){this.capacity=e?.capacity??aw,this.warmupFrames=e?.warmupFrames??vs.warmupFrames,this.presetId=e?.presetId??null,this.buf=new Float32Array(this.capacity)}reset(e){this.cursor=0,this.filled=0,this.totalSeen=0,this.warmupSkipped=0,this.maxMs=0,this.sumMs=0,this.over167=0,this.over50=0,this.recording=!0,e!==void 0&&(this.presetId=e),this.buf.fill(0)}push(e){if(!this.recording||!Number.isFinite(e)||e<0)return;if(this.totalSeen+=1,this.totalSeen<=this.warmupFrames){this.warmupSkipped+=1;return}const t=e;this.buf[this.cursor%this.capacity]=t,this.cursor+=1,this.filled<this.capacity&&(this.filled+=1),this.sumMs+=t,t>this.maxMs&&(this.maxMs=t),t>16.7&&(this.over167+=1),t>Kc.long_frame_ms&&(this.over50+=1)}stop(){this.recording=!1}start(){this.recording=!0}get sampleCount(){return this.filled}sorted(){const e=this.filled,t=new Float32Array(e);return e===0||(e<this.capacity?t.set(this.buf.subarray(0,e)):t.set(this.buf),t.sort()),t}percentile(e,t){const n=e.length;if(n===0)return 0;if(n===1)return e[0];const s=Math.min(n-1,Math.max(0,Math.ceil(t/100*n)-1));return e[s]}snapshot(){const e=this.sorted(),t=e.length,n=this.percentile(e,99),s=t===0?0:this.maxMs,r=t===0?0:this.sumMs/t,a=t>0&&n<=Kc.p99_ms_max,o=this.over50<=Kc.long_frame_max_count;return{samples:this.totalSeen,counted:t,warmupSkipped:this.warmupSkipped,p50_ms:Yr(this.percentile(e,50)),p95_ms:Yr(this.percentile(e,95)),p99_ms:Yr(n),max_ms:Yr(s),mean_ms:Yr(r),frames_over_16_7ms:this.over167,frames_over_50ms:this.over50,gate_p99_ok:a,gate_long_ok:o,gates_ok:a&&o&&t>0,presetId:this.presetId}}}function Yr(i){return Math.round(i*1e3)/1e3}new ow({warmupFrames:vs.warmupFrames,presetId:vs.id});function cw(i,e=vs,t=typeof devicePixelRatio<"u"?devicePixelRatio:1){const n=Math.min(t,e.maxPixelRatio);i.setPixelRatio(n),i.setSize(e.width,e.height,!1)}function lw(i){const e=new URLSearchParams(i.startsWith("?")?i.slice(1):i),t=e.get("preset")||e.get("quality");return t==="medium"||t==="medium-1080p"||t===vs.id?vs:null}const tr={path:{centerline:[{x:.02,z:10.8,halfWidth:1.76},{x:-.48,z:7.75,halfWidth:1.66},{x:.58,z:5.1,halfWidth:1.6},{x:-.62,z:2.25,halfWidth:1.72},{x:.7,z:-.65,halfWidth:1.76},{x:-.52,z:-3.75,halfWidth:1.7},{x:.62,z:-6.55,halfWidth:1.56},{x:-.88,z:-9.35,halfWidth:1.46},{x:-1.08,z:-12.42,halfWidth:1.72}]},terrainMasses:[{id:"near-west-shadow-bank",depthBand:"near",color:3429448,elevation:.004,points:[{x:-18.2,z:13.8},{x:-7.1,z:14.1},{x:-3.9,z:10.4},{x:-4.8,z:6.2},{x:-7.8,z:3.7},{x:-13.8,z:4.2},{x:-18.6,z:7.1},{x:-19.1,z:11.2}]},{id:"near-east-moss-fan",depthBand:"near",color:3823945,elevation:.006,points:[{x:3.2,z:13.9},{x:17.8,z:13.4},{x:19,z:7.3},{x:15.1,z:2.2},{x:9.3,z:1.4},{x:5.1,z:5},{x:2.8,z:9.2}]},{id:"moonwell-lodge-shelf",depthBand:"mid",color:5467735,elevation:.012,points:[{x:1.8,z:8.7},{x:5.1,z:9.9},{x:10.8,z:8.6},{x:12.6,z:5.4},{x:10.7,z:2.2},{x:7.2,z:.8},{x:3.9,z:2},{x:2,z:4.7},{x:1.2,z:6.5}]},{id:"lantern-shoulder",depthBand:"mid",color:4547665,elevation:.015,points:[{x:-11.4,z:6.7},{x:-6.2,z:7.8},{x:-2.2,z:5.6},{x:-2.8,z:.6},{x:-8.5,z:-.8},{x:-12.2,z:2.6}]},{id:"whispergrass-west-fold",depthBand:"mid",color:4022093,elevation:.019,points:[{x:-8.8,z:2.5},{x:-4.1,z:3.6},{x:-1.2,z:1.8},{x:-.9,z:-1.1},{x:-2,z:-4.7},{x:-5.6,z:-6.2},{x:-9.9,z:-4.8},{x:-11.6,z:-2.2},{x:-11,z:.1},{x:-9.7,z:1.3}]},{id:"whispergrass-east-fold",depthBand:"mid",color:4810322,elevation:.022,points:[{x:1,z:2.3},{x:4.2,z:3.3},{x:9.7,z:1.5},{x:11.3,z:-2.4},{x:8,z:-5.5},{x:3,z:-5.9},{x:.9,z:-3.1},{x:.4,z:-.3}]},{id:"destination-basin",depthBand:"far",color:5860716,elevation:.026,points:[{x:-10.5,z:-4},{x:-6.8,z:-3.3},{x:-2.5,z:-5.1},{x:1.4,z:-4.5},{x:7.8,z:-6.1},{x:10.9,z:-10.6},{x:8.7,z:-15.7},{x:2.7,z:-18.1},{x:-4.2,z:-17.2},{x:-10.4,z:-13.5},{x:-12.3,z:-8.1}]},{id:"far-west-violet-moor",depthBand:"far",color:5465448,elevation:.018,points:[{x:-18.8,z:-2.4},{x:-11.2,z:-1},{x:-8.7,z:-6.2},{x:-10.8,z:-12.9},{x:-15.4,z:-16.8},{x:-19.5,z:-12.2},{x:-20.1,z:-6.5}]},{id:"far-east-blue-moor",depthBand:"far",color:5794413,elevation:.014,points:[{x:8.1,z:-2.6},{x:14.4,z:-1.2},{x:19.2,z:-4.7},{x:19.8,z:-11.1},{x:16,z:-16.2},{x:10.8,z:-17.8},{x:7.7,z:-14.8},{x:9.1,z:-9.7},{x:7,z:-6.3}]}],grassClusters:[{id:"west-copper-turn",x:-1.78,z:1.24,radiusX:.64,radiusZ:.3,count:18,seed:29089,heightMin:.72,heightMax:1.34,silhouettes:["fan","ribbon-left","spear"]},{id:"west-lantern-pocket",x:-2.08,z:.02,radiusX:.72,radiusZ:.38,count:23,seed:29090,heightMin:.54,heightMax:1.08,silhouettes:["ribbon-right","spear"]},{id:"west-middle-hook",x:-1.76,z:-1.26,radiusX:.68,radiusZ:.4,count:20,seed:29091,heightMin:.7,heightMax:1.46,silhouettes:["ribbon-left","ribbon-right","fan"]},{id:"west-deep-crescent",x:-2.18,z:-2.58,radiusX:.8,radiusZ:.46,count:27,seed:29092,heightMin:.5,heightMax:1.14,silhouettes:["spear","fan","ribbon-right"]},{id:"west-exit-tuft",x:-1.62,z:-3.52,radiusX:.52,radiusZ:.26,count:12,seed:29093,heightMin:.66,heightMax:1.38,silhouettes:["fan","ribbon-left"]},{id:"east-entry-fan",x:2.18,z:.58,radiusX:.72,radiusZ:.32,count:17,seed:29105,heightMin:.54,heightMax:1.02,silhouettes:["fan","spear","ribbon-right"]},{id:"east-blue-pocket",x:1.82,z:-.58,radiusX:.68,radiusZ:.38,count:24,seed:29106,heightMin:.7,heightMax:1.4,silhouettes:["ribbon-left","spear"]},{id:"east-narrow-turn",x:2.18,z:-1.86,radiusX:.76,radiusZ:.34,count:18,seed:29107,heightMin:.52,heightMax:1.16,silhouettes:["ribbon-right","fan"]},{id:"east-deep-island",x:1.86,z:-3.14,radiusX:.72,radiusZ:.44,count:29,seed:29108,heightMin:.66,heightMax:1.5,silhouettes:["spear","ribbon-left","ribbon-right","fan"]}],destination:{x:-1.08,z:-12.42,openingWidth:2.36,openingHeight:2.82}},fp={globalEmissiveMax:.015};function iu(i){let e=i>>>0;return()=>{e+=1831565813;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Ss(i,e=!0,t=!0){i.traverse(n=>{n.isMesh&&(n.castShadow=e,n.receiveShadow=t)})}function Fh(i=128){const e=document.createElement("canvas");e.width=i,e.height=i;const t=e.getContext("2d");if(!t)return new or(e);const n=t.createRadialGradient(i/2,i/2,0,i/2,i/2,i/2);n.addColorStop(0,"rgba(255,255,255,1)"),n.addColorStop(.3,"rgba(255,255,255,.72)"),n.addColorStop(.72,"rgba(255,255,255,.13)"),n.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=n,t.fillRect(0,0,i,i);const s=new or(e);return s.colorSpace=Vt,s.needsUpdate=!0,s}function uw(){const i=document.createElement("canvas");i.width=256,i.height=128;const e=i.getContext("2d");if(!e)return new or(i);e.clearRect(0,0,i.width,i.height);const t=[[62,76,43],[106,55,54],[156,66,48],[194,82,35],[126,86,66]];for(const[s,r,a]of t){const o=e.createRadialGradient(s,r,0,s,r,a);o.addColorStop(0,"rgba(255,238,224,.72)"),o.addColorStop(.55,"rgba(240,207,210,.38)"),o.addColorStop(1,"rgba(225,190,204,0)"),e.fillStyle=o,e.fillRect(s-a,r-a,a*2,a*2)}const n=new or(i);return n.colorSpace=Vt,n.needsUpdate=!0,n}function pp(i=8,e=1){const t=tr.path.centerline,n=new ys(t.map(c=>new P(c.x,0,c.z)),!1,"centripetal",.42),s=(t.length-1)*i,r=[],a=[],o=[];for(let c=0;c<=s;c++){const l=c/s,u=n.getPoint(l),d=n.getTangent(l).normalize(),h=l*(t.length-1),f=Math.min(t.length-2,Math.floor(h)),m=h-f,y=xu.lerp(t[f].halfWidth,t[f+1].halfWidth,m)*e,p=new P(d.z,0,-d.x).normalize();r.push(u),a.push(u.clone().addScaledVector(p,y)),o.push(u.clone().addScaledVector(p,-y))}return{center:r,left:a,right:o}}function Oh(i=1){const{left:e,right:t}=pp(8,i),n=new fr;n.moveTo(e[0].x,-e[0].z);for(const r of e.slice(1))n.lineTo(r.x,-r.z);for(const r of[...t].reverse())n.lineTo(r.x,-r.z);n.closePath();const s=new Ms(n,12);return s.rotateX(-Math.PI/2),s.computeVertexNormals(),s}function dw(i){const e=new ys(i.map(s=>new P(s.x,0,s.z)),!0,"centripetal",.42).getPoints(i.length*6),t=new fr;t.moveTo(e[0].x,-e[0].z);for(const s of e.slice(1))t.lineTo(s.x,-s.z);t.closePath();const n=new Ms(t,8);return n.rotateX(-Math.PI/2),n.computeVertexNormals(),n}function xo(i){if(i==="spear"){const n=new hr(.075,1,4);return n.translate(0,.5,0),n}const e=new fr;if(i==="fan")e.moveTo(-.035,0),e.bezierCurveTo(-.08,.23,-.24,.38,-.2,.58),e.lineTo(-.07,.5),e.lineTo(0,.84),e.lineTo(.075,.5),e.lineTo(.21,.58),e.bezierCurveTo(.23,.36,.08,.2,.035,0);else{const n=i==="ribbon-left"?-1:1;e.moveTo(-.038,0),e.bezierCurveTo(-.055,.32,n*.15-.04,.68,n*.18,.98),e.bezierCurveTo(n*.11,.73,.045,.32,.038,0)}e.closePath();const t=new Ms(e,5);return t.computeVertexNormals(),t}function hw(i){const e=iu(i.seed^99539473),t=[],n=11;for(let o=0;o<n;o++){const c=o/n*Math.PI*2,l=.82+e()*.3;t.push(new P(i.x+Math.cos(c)*i.radiusX*l,0,i.z+Math.sin(c)*i.radiusZ*l))}const s=new ys(t,!0,"centripetal",.45).getPoints(44),r=new fr;r.moveTo(s[0].x,-s[0].z);for(const o of s.slice(1))r.lineTo(o.x,-o.z);r.closePath();const a=new Ms(r,4);return a.rotateX(-Math.PI/2),a}function Bh(i,e,t,n){const s=new ye(new Ta(.72,1),e);return s.position.copy(t),s.scale.copy(n),s.rotation.set((i()-.5)*.24,i()*Math.PI,(i()-.5)*.2),s.castShadow=!0,s.receiveShadow=!0,s}function fw(i,e,t,n,s,r,a){const o=new Ot;o.position.set(t,0,n),o.rotation.y=e()*Math.PI*2;const c=new lt({color:5784632,roughness:.96,metalness:0}),l=new lt({color:r,roughness:.86,metalness:0,emissive:r,emissiveIntensity:.008}),u=new ye(new pn(.2,.34,2.5,a?7:10),c);u.position.y=1.18,u.rotation.z=(e()-.5)*.09,o.add(u);for(let h=0;h<3;h++){const f=new ye(new pn(.07,.12,1.05,7),c);f.position.set((h-1)*.12,1.82+h*.16,0),f.rotation.z=(h-1)*.62,o.add(f)}const d=[[-.62,2.3,.08,.9],[.05,2.72,-.12,1.15],[.7,2.32,.02,.92],[.12,2.12,.38,.82]];for(const[h,f,m,y]of d){const p=new ye(new ko(.82,a?1:2),l);p.position.set(h,f,m),p.scale.set(1.15*y,.88*y,y),p.rotation.y=e()*Math.PI,o.add(p)}return o.scale.setScalar(s),Ss(o,!a,!0),i.add(o),o}function pw(i,e){const t=new Ot;t.name="moonwell-lodge",t.position.set(5.25,0,5.78);const n=new lt({color:8491416,roughness:.9,metalness:.02}),s=new lt({color:14075566,roughness:.84,metalness:0}),r=new lt({color:5783867,roughness:.9,metalness:0}),a=new lt({color:9326406,roughness:.72,metalness:.02}),o=new Bt({color:16766349,transparent:!0,opacity:.86}),c=new ye(new Zt(1.25,.28,1.02),n);c.position.y=.14,t.add(c);const l=new ye(new Zt(1.18,.92,.94),s);l.position.y=.72,t.add(l);for(const S of[-.51,.51]){const v=new ye(new Zt(.1,.98,.98),r);v.position.set(S,.73,0),t.add(v)}const u=new ye(new Zt(1.2,.1,.99),r);u.position.y=.75,t.add(u);const d=new ye(new Zt(1.48,.1,.78),a);d.position.set(0,1.32,-.34),d.rotation.x=.62,t.add(d);const h=d.clone();h.position.z=.34,h.rotation.x=-.62,t.add(h);const f=new ye(new Zt(.5,.42,.035),r);f.position.set(0,.83,-.49),t.add(f);const m=new ye(new pr(.38,.3),o);m.position.set(0,.83,-.512),m.rotation.y=Math.PI,t.add(m);const y=new ye(new Zt(.035,.34,.028),r);y.position.set(0,.83,-.53),t.add(y);const p=new ye(new Zt(.42,.035,.028),r);p.position.set(0,.83,-.53),t.add(p);const g=new ye(new Zt(.22,.64,.22),n);g.position.set(.38,1.6,.12),t.add(g);const M=new Fi(16758876,e?.9:1.35,5.5,2);M.position.set(0,.95,-.7),t.add(M),Ss(t,!e,!0),i.add(t)}function kh(i,e,t,n,s,r,a){const o=new Ot;o.position.set(e,0,t);const c=new lt({color:3160895,roughness:.72,metalness:.18}),l=new lt({color:n,emissive:s,emissiveIntensity:.08,roughness:.46,metalness:.46}),u=new ye(new pn(.36,.48,.28,10),c);u.position.y=.14,o.add(u);const d=new ye(new pn(.13,.2,r,10),l);d.position.y=.28+r/2,o.add(d);for(let g=0;g<3;g++){const M=new ye(new Ui(.18,.025,6,18),l);M.rotation.x=Math.PI/2,M.position.y=.65+g*.42,o.add(M)}const h=new ye(new Zt(.92,.1,.12),c);h.position.set(.22,r+.25,0),o.add(h);const f=new ye(new Ui(.15,.035,6,18,Math.PI),l);f.position.set(.59,r+.06,0),f.rotation.z=Math.PI,o.add(f);const m=new ye(new Aa(.32,1),l);m.position.set(.59,r-.22,0),o.add(m);const y=new ye(new ns(.18,a?10:18,a?8:12),new Bt({color:n,transparent:!0,opacity:.94}));y.position.set(.59,r-.22,0),o.add(y);const p=new Fi(n,a?1.1:1.75,5,1.8);return p.position.copy(y.position),o.add(p),Ss(o,!a,!0),i.add(o),{root:o,orb:y}}function mw(i,e){const t=new Ot;t.name="hollow-observatory",t.position.set(tr.destination.x,.1,-18.15);const n=new lt({color:6582651,roughness:.94,metalness:.01}),s=new lt({color:8678245,roughness:.64,metalness:.24,emissive:2889492,emissiveIntensity:fp.globalEmissiveMax}),r=new ye(new pn(1.18,1.58,4.15,e?8:14),n);r.position.y=2.08,t.add(r);const a=new ye(new pn(1.7,1.7,.18,18),s);a.position.y=3.52,t.add(a);const o=new ye(new ns(1.34,18,10,0,Math.PI*2,0,Math.PI/2),s);o.position.y=4.17,t.add(o);const c=new ye(new hr(.14,1.72,8),s);c.position.y=5.72,t.add(c);for(const l of[-.48,0,.48]){const u=new ye(new pr(.2,.46),new Bt({color:15250543,transparent:!0,opacity:.68}));u.position.set(l,2.58,1.22),t.add(u)}Ss(t,!1,!0),i.add(t)}function gw(i,e){const t=tr.destination,n=new Ot;n.name="observatory-threshold-entrance",n.position.set(t.x,0,t.z);const s=new lt({color:4018262,roughness:.91,metalness:.03}),r=new lt({color:7438468,roughness:.82,metalness:.04}),a=new Bt({color:1055264,side:hn}),o=new Bt({color:16098911,transparent:!0,opacity:.72}),c=t.openingWidth*.5,l=t.openingHeight-c,u=c+.31;for(const p of[-1,1]){const g=new ye(new Zt(.54,l+.2,.72),s);g.position.set(p*u,(l+.2)*.5,0),g.rotation.z=p*.018,n.add(g);const M=new ye(new Ta(.48,0),r);M.position.set(p*u,.28,.03),M.scale.set(1,.62,.9),n.add(M);const S=new ye(new ns(.095,e?8:12,8),new Bt({color:15905647}));S.position.set(p*(c+.05),l-.16,.39),n.add(S)}const d=new ye(new Ui(c,.16,e?6:9,e?28:42,Math.PI),r);d.position.set(0,l,.02),n.add(d);const h=new fr;h.moveTo(-c,0),h.lineTo(-c,l),h.absarc(0,l,c,Math.PI,0,!0),h.lineTo(c,0),h.closePath();const f=new ye(new Ms(h,8),a);f.position.set(0,.035,-.39),n.add(f);const m=new ye(new Zt(t.openingWidth*.76,.055,.42),o);m.position.set(0,.07,.14),n.add(m);const y=new Fi(16753759,e?.72:1.05,4.6,2.1);y.position.set(0,.92,-.08),n.add(y),Ss(n,!e,!0),f.castShadow=!1,m.castShadow=!1,i.add(n)}function xw(i,e){i.traverse(t=>{if(t.isAmbientLight){const n=t;n.color.setHex(11453148),n.intensity=e?.24:.27}else if(t.isHemisphereLight){const n=t;n.color.setHex(12175842),n.groundColor.setHex(1584693),n.intensity=e?.6:.66}else if(t.isDirectionalLight){const n=t,s=n.color.getHex();s===16768955?n.intensity=e?1.14:1.3:s===16749945?n.intensity=e?.3:.38:s===7904212?n.intensity=e?.46:.54:s===15004159&&(n.intensity=e?.14:.19)}})}function vw(i,e){const t=new lt({color:2439997,roughness:.8,metalness:.08}),n=new lt({color:5467496,roughness:.7,metalness:.12}),s=new lt({color:14070894,emissive:6240541,emissiveIntensity:.34,roughness:.42,metalness:.54}),r=new ye(new pn(4.08,4.46,.22,72),t);r.position.set(0,.07,.54),r.receiveShadow=!0,i.add(r);const a=new ye(new Ui(4.08,.045,10,96),s);a.rotation.x=Math.PI/2,a.position.set(0,.19,.54),i.add(a);for(let l=0;l<3;l++){const u=new ye(new Zt(2.65+l*.55,.09,.34),n);u.position.set(0,.035+l*.035,3.08-l*.28),i.add(u)}for(const l of[-3.55,3.55]){const u=new ye(new pn(.19,.28,2.65,10),n);u.position.set(l,1.32,-.18),i.add(u);const d=new ye(new Aa(.32,0),s);d.position.set(l,2.72,-.18),i.add(d);const h=new Fi(16761469,e?1.1:1.6,6,2);h.position.set(l,2.65,.24),i.add(h)}const o=new ys([new P(-3.52,2.72,-.18),new P(-1.85,3.72,-.38),new P(0,4.02,-.46),new P(1.85,3.72,-.38),new P(3.52,2.72,-.18)]),c=new ye(new Ra(o,56,.055,8,!1),s);i.add(c);for(const l of[-2.15,0,2.15]){const u=new ye(new hr(.78,4.3,28,1,!0),new Bt({color:l<-1?16749416:l>1?9557900:7522815,transparent:!0,opacity:.055,side:hn,depthWrite:!1,blending:zn}));u.position.set(l,2.35,.42),i.add(u)}Ss(i,!e,!0)}function _w(i,e){const{useMedium:t,grassPathHalf:n}=e,s=iu(7999975),r=new Ot;r.name="lumen-hollow-world",i.add(r),xw(i,t),i.background=new qe(6321551),i.fog=new _u(7440022,t?10.5:12.5,t?34:40);const a=new ye(new ns(66,t?24:48,t?12:24),new ti({side:_n,depthWrite:!1,uniforms:{zenith:{value:new qe(1847638)},upper:{value:new qe(4743042)},horizon:{value:new qe(12023670)},nadir:{value:new qe(9268338)},sunColor:{value:new qe(16765338)},sunDir:{value:new P(-.5,.19,-.86).normalize()}},vertexShader:`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 zenith;
        uniform vec3 upper;
        uniform vec3 horizon;
        uniform vec3 nadir;
        uniform vec3 sunColor;
        uniform vec3 sunDir;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 col = mix(nadir, horizon, smoothstep(0.0, 0.42, h));
          col = mix(col, upper, smoothstep(0.38, 0.72, h));
          col = mix(col, zenith, smoothstep(0.68, 1.0, h));
          float sun = pow(max(dot(normalize(vDir), sunDir), 0.0), 210.0);
          float haze = pow(max(dot(normalize(vDir), sunDir), 0.0), 18.0) * 0.13;
          col += sunColor * (sun * 1.35 + haze);
          gl_FragColor = vec4(col, 1.0);
        }
      `}));a.renderOrder=-100,r.add(a);const o=uw(),c=[],l=[[-17,11.2,-31,11],[4,13.5,-40,15],[20,9.8,-30,9],[-27,8.4,-10,8],[29,12.9,-20,12],[8,9.1,27,10]];for(const[w,x,O,G]of l){const $=new Lo(new va({map:o,color:14274263,transparent:!0,opacity:.27,depthWrite:!1,fog:!1}));$.position.set(w,x,O),$.scale.set(G*1.9,G,1),r.add($),c.push($)}const u=new Lo(new va({map:Fh(),color:16763269,transparent:!0,opacity:.44,depthWrite:!1,blending:zn,fog:!1}));u.position.set(-22,9.5,-40),u.scale.set(7.1,7.1,1),r.add(u);const d=new lt({color:2704444,roughness:.99,metalness:0}),h=new ye(new ui(19.5,t?56:96),d);h.rotation.x=-Math.PI/2,h.position.y=-.025,h.receiveShadow=!0,h.name="cool-shadow-field",r.add(h);for(const w of tr.terrainMasses){const x=new ye(dw(w.points),new lt({color:w.color,roughness:w.depthBand==="far"?.99:.96,metalness:0}));x.name=`terrain-mass-${w.id}`,x.position.y=w.elevation,x.receiveShadow=!0,x.castShadow=!1,r.add(x)}const f=new ye(Oh(),new lt({color:12164467,roughness:.97,metalness:0}));f.name="winding-lantern-route",f.position.y=.045,f.receiveShadow=!0,r.add(f);const m=new ye(Oh(.39),new lt({color:12888706,roughness:.99,metalness:0}));m.name="worn-route-core",m.position.y=.052,m.receiveShadow=!0,r.add(m);const y=new lt({color:7432280,roughness:.99,metalness:0}),p=pp(),g=[[[0,13],[20,31],[39,51],[57,p.left.length]],[[5,17],[25,37],[45,58]]];for(const[w,x]of[p.left,p.right].entries())for(const[O,G]of g[w]){const $=x.slice(O,G);if($.length<2)continue;const pe=new ys($.map(Q=>new P(Q.x,.072,Q.z)),!1,"centripetal",.4),oe=new ye(new Ra(pe,Math.max(8,$.length*2),.025,5,!1),y);oe.name=`weathered-route-edge-${w}-${O}`,oe.receiveShadow=!0,oe.castShadow=!1,r.add(oe)}const M=new lt({color:9536365,roughness:.98,metalness:0}),S=[[-2.02,9.1,.3,.14,.22],[1.55,8.55,.18,.1,.28],[-1.88,7.2,.2,.09,.17],[1.96,6.45,.28,.13,.19],[-1.24,5.35,.16,.08,.24],[2.18,4.65,.24,.1,.34],[-2.32,3.15,.34,.14,.2],[1.22,2.42,.18,.09,.16],[-1.1,1.12,.22,.1,.3],[2.34,.48,.31,.13,.2],[-1.42,-.86,.19,.08,.27],[2.13,-1.42,.26,.12,.18],[-2.08,-2.76,.32,.13,.23],[1.1,-3.58,.17,.08,.25],[-1.22,-4.82,.24,.11,.17],[2.12,-5.52,.3,.12,.26],[-1.05,-6.68,.16,.08,.22],[1.45,-7.45,.28,.13,.19],[-2.12,-8.52,.2,.09,.31],[.82,-9.28,.34,.14,.21],[-2.62,-10.42,.26,.11,.2],[.54,-11.08,.18,.09,.28],[-2.72,-12,.32,.13,.18],[.48,-12.24,.22,.1,.3]];for(let w=0;w<S.length;w++){if(t&&w%3===1)continue;const[x,O,G,$,pe]=S[w],oe=Bh(s,M,new P(x,.065,O),new P(G,$,pe));oe.castShadow=!1,r.add(oe)}const v={near:new lt({color:3165e3,roughness:.93,metalness:0}),mid:new lt({color:4742751,roughness:.96,metalness:0}),far:new lt({color:6648956,roughness:.99,metalness:0})},T=new ko(1.45,1),E=[["west-foreground-bank","near",-14.2,6.2,.34,3.2,.58,1.9,.18],["east-foreground-bank","near",14.3,8,.32,3.6,.55,2.1,-.12],["west-lantern-berm","mid",-11.2,-.8,.36,2.8,.64,1.5,.44],["east-moonwell-berm","mid",12,-2.6,.34,3.1,.58,1.65,-.24],["west-route-fold","mid",-10.8,-6.8,.3,2.5,.5,1.35,.63],["east-route-fold","mid",11,-8.1,.31,2.8,.52,1.45,-.38],["west-gate-frame","far",-8.8,-13.5,.42,2.6,.78,1.6,.2],["east-gate-frame","far",8.7,-14.8,.44,3,.8,1.75,-.34],["west-horizon-step","far",-13.2,-15.2,.62,4.6,1.18,2.6,.48],["east-horizon-step","far",12.1,-17,.66,5.2,1.1,2.8,-.22]];for(const[w,x,O,G,$,pe,oe,Q,ne]of E){const xe=new ye(T,v[x]);xe.name=`authored-ridge-${w}`,xe.position.set(O,$,G),xe.scale.set(pe,oe,Q),xe.rotation.y=ne,xe.castShadow=!t&&x!=="far",xe.receiveShadow=!0,r.add(xe)}const A=new lt({color:5398879,roughness:.9,metalness:.02}),_=new lt({color:6773589,roughness:.91,metalness:.01}),R=[[-9.2,-5.1,1,2.15,.9,1.05],[9,-6.9,.9,2.75,1.05,1.25],[7.7,8.25,.58,1.25,.64,.86],[-8.45,7,.68,1.55,.72,.96],[-4.5,-10.9,.52,1.1,.58,.78]];for(const[w,x,O,G,$,pe]of R)r.add(Bh(s,x<0?A:_,new P(w,O*.5,x),new P(G,$,pe)));const N=[[-9.4,3.1,1.22,2113337],[-7.6,7.9,.86,3428420],[-11,-2.6,1.05,2705987],[-6.9,-8.6,.76,3822416],[9.7,1.2,.96,3232069],[7.4,8.5,.78,4678476],[10.8,-4.2,1.13,2837573],[5.4,-10.7,.7,4610648],[-3.9,-12.8,.62,5464931],[3.8,-14.1,.68,5859691],[13.4,-10.2,.88,4940385]];for(const[w,x,O,G]of N)fw(r,s,w,x,O,G,t);pw(r,t);const D=new Ot;D.position.set(4.5,0,4.5);const k=new lt({color:7901331,roughness:.8,metalness:.06}),Z=new ye(new pn(1.28,1.42,.16,48),k);Z.position.y=.08,D.add(Z);const ee=new ye(new ui(1.16,48),new Ln({color:7649473,emissive:1594218,emissiveIntensity:.12,roughness:.2,metalness:.08,transmission:t?0:.14,transparent:!0,opacity:.9,depthWrite:!0}));ee.rotation.x=-Math.PI/2,ee.position.y=.175,D.add(ee);const C=new ye(new Sa(1.2,1.52,48),new Bt({color:12121087,transparent:!0,opacity:.3,side:hn,depthWrite:!1,blending:zn}));C.rotation.x=-Math.PI/2,C.position.y=.19,D.add(C);for(let w=0;w<12;w++){const x=w/12*Math.PI*2,O=new ye(new Zt(.43,.22,.3),k);O.position.set(Math.cos(x)*1.37,.23,Math.sin(x)*1.37),O.rotation.y=-x,D.add(O)}const z=new Fi(8374757,t?.68:.96,5.2,2.2);z.position.y=.85,D.add(z),Ss(D,!t,!0),r.add(D);const L=kh(r,-5.75,3.15,16765295,9197596,1.72,t),q=kh(r,-6.25,.25,11967743,5057672,1.92,t),K=L.orb,ae=q.orb;mw(r,t),gw(r,t);const ue=new Df(16751719,t?.62:.86,14,Math.PI*.21,.88,2.2);ue.name="localized-sunset-route-rim",ue.position.set(-4.8,4.6,-4.8),ue.target.position.set(.1,.25,1.2),ue.castShadow=!1,r.add(ue,ue.target);const he=new Ot;he.name="whispergrass-field",r.add(he);const Pe=new lt({color:2838850,roughness:.99,metalness:0});for(const w of tr.grassClusters){const x=new ye(hw(w),Pe);x.name=`grass-cluster-footprint-${w.id}`,x.position.y=.052,x.receiveShadow=!0,he.add(x)}const $e=[3302734,4224855,2841160,5079644,4287827,5999206].map(w=>new lt({color:w,roughness:.9,metalness:0,side:hn})),j=[],me=[],de={spear:xo("spear"),"ribbon-left":xo("ribbon-left"),"ribbon-right":xo("ribbon-right"),fan:xo("fan")};let He=0;const Qe=Math.PI*(3-Math.sqrt(5));for(const w of tr.grassClusters){const x=iu(w.seed),O=t?Math.max(8,Math.round(w.count*.52)):w.count;let G=0,$=0;for(;G<O&&$<O*14;){const pe=$++,oe=pe*Qe+(x()-.5)*.5,Q=Math.sqrt((pe+.35)/(O*1.25)),ne=Math.min(1,Q)*(.76+x()*.25),xe=w.x+Math.cos(oe)*w.radiusX*ne,De=w.z+Math.sin(oe)*w.radiusZ*ne;if(Math.abs(xe)<n+.015||[-2.18,0,2.18].some(Me=>Math.hypot(xe-Me,De-.55)<.9))continue;const ve=w.silhouettes[(G+Math.floor(x()*w.silhouettes.length))%w.silhouettes.length],ze=(He+w.seed)%$e.length,Ue=new ye(de[ve],$e[ze]),je=xu.lerp(w.heightMin,w.heightMax,x())*.84,B=.7+x()*.44;Ue.name=`grass-${w.id}-${ve}`,Ue.position.set(xe,.055,De),Ue.scale.set(B,je,.72+x()*.46),Ue.rotation.set((x()-.5)*.15,x()*Math.PI*2,(x()-.5)*.28),Ue.castShadow=!t&&He%11===0,Ue.receiveShadow=!t,me.push(Ue.rotation.z),j.push(Ue),he.add(Ue),G++,He++}}const Xe=[15119982,10471900,13149656].map(w=>new Bt({color:w,transparent:!0,opacity:.68,side:hn})),wt=[[-4.8,4.4,.055,.85,0],[-5.15,4.62,.052,.64,2],[-3.92,3.84,.058,.72,1],[3.18,6.25,.06,.9,1],[3.52,6.48,.052,.66,2],[6.18,4.04,.06,.8,0],[6.48,3.7,.05,.58,1],[-3,.22,.052,.76,2],[3.08,-.9,.055,.7,0],[-3.18,-2.7,.058,.92,1],[3.3,-3.55,.05,.62,2],[-2.72,-5.45,.055,.72,0],[2.7,-6.15,.052,.82,1],[-3.36,-7.72,.06,.66,2],[2.1,-8.22,.052,.76,0],[-3.14,-10.22,.056,.86,1],[.98,-10.9,.052,.62,2],[-3.26,-11.55,.055,.72,0]];for(let w=0;w<wt.length;w++){if(t&&w%2===1)continue;const[x,O,G,$,pe]=wt[w],oe=new ye(new ui(G,6),Xe[pe]);oe.position.set(x,.085+w%3*.028,O),oe.scale.setScalar($),oe.rotation.set(-Math.PI/2+(w%5-2)*.035,0,w*1.17),r.add(oe)}const at=new Gt,le=t?32:72,Se=new Float32Array(le*3);for(let w=0;w<le;w++)Se[w*3]=(s()*2-1)*10,Se[w*3+1]=.35+s()*3.3,Se[w*3+2]=-10+s()*20;at.setAttribute("position",new fn(Se,3));const Ye=new xf(at,new bu({color:16767889,size:t?.075:.095,transparent:!0,opacity:.65,alphaMap:Fh(64),depthWrite:!1,blending:zn,sizeAttenuation:!0}));r.add(Ye);const V=new Ot;V.name="battle-clearing",V.visible=!1;const ht=new lt({color:2506552,roughness:.78,metalness:.06,emissive:1060391,emissiveIntensity:fp.globalEmissiveMax,transparent:!0,opacity:.96}),Ge=new ye(new pn(4.2,4.55,.14,72),ht);Ge.position.set(0,.05,.25),Ge.receiveShadow=!0,V.add(Ge);const _t=new Bt({color:9296322,transparent:!0,opacity:.38,depthWrite:!1,blending:zn}),vt=new ye(new Ui(3.72,.04,8,96),_t);vt.rotation.x=Math.PI/2,vt.position.set(0,.15,.25),V.add(vt);for(const w of[-.72,1.35]){const x=new ye(new Sa(.66,.76,48),_t.clone());x.rotation.x=-Math.PI/2,x.position.set(w<0?-1.58:1.77,.155,w),V.add(x)}const Pt=new Fi(8115400,t?.65:1.05,9,2);Pt.position.set(0,2.8,.3),V.add(Pt),r.add(V);let H="starter";const Wt=w=>{H=w,V.visible=w==="battle",he.visible=w!=="battle"};return Wt("starter"),{root:r,battleArena:V,healGlow:C,gymOrb:K,eliteOrb:ae,grassBlades:j,grassBaseRot:me,setMode:Wt,tick:(w,x,O)=>{O!==H&&Wt(O),C.material.opacity=.22+Math.sin(w*2.35)*.075,ee.position.y=.176+Math.sin(w*1.55)*.008,K.position.y=1.5+Math.sin(w*2.05)*.055,ae.position.y=1.7+Math.sin(w*1.72+1.1)*.065,Ye.rotation.y=Math.sin(w*.08)*.12,Ye.material.opacity=.31+Math.sin(w*.65)*.075;for(let G=0;G<c.length;G++)c[G].position.x+=Math.sin(w*.035+G*1.9)*.0015;V.visible&&(vt.rotation.z=w*.055,_t.opacity=.31+Math.sin(w*2.1)*.08,Pt.intensity=(t?.65:1.05)+Math.sin(w*1.5)*.12)}}}const mp=Object.freeze({anticipationMs:120,travelMs:100,contactMs:64,recoilMs:190,settleMs:126,totalMs:600});function yw(i){const e=mp,t=Math.max(0,i),n=e.anticipationMs,s=n+e.travelMs,r=s+e.contactMs,a=r+e.recoilMs;return t<n?{phase:"anticipation",progress:t/e.anticipationMs}:t<s?{phase:"travel",progress:(t-n)/e.travelMs}:t<r?{phase:"contact",progress:(t-s)/e.contactMs}:t<a?{phase:"recoil",progress:(t-r)/e.recoilMs}:t<e.totalMs?{phase:"settle",progress:(t-a)/e.settleMs}:{phase:"idle",progress:1}}function zh(){const i=document.createElement("canvas");i.width=64,i.height=64;const e=i.getContext("2d");if(!e)return new or(i);const t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.24,"rgba(255,255,255,.82)"),t.addColorStop(.62,"rgba(255,255,255,.2)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);const n=new or(i);return n.colorSpace=Vt,n.needsUpdate=!0,n}const Mw={hit:16773580,se:16765276,nve:9357567,crit:16741213,catch:10485728};function Sw(){const i=new Ot;i.name="lumen-catch-orb";const e=new ye(new ns(.15,20,14,0,Math.PI*2,0,Math.PI/2),new Ln({color:15097680,roughness:.27,metalness:.4,clearcoat:.72,clearcoatRoughness:.22,emissive:4592142,emissiveIntensity:.16})),t=new ye(new ns(.15,20,14,0,Math.PI*2,Math.PI/2,Math.PI/2),new Ln({color:15855332,roughness:.32,metalness:.24,clearcoat:.58,clearcoatRoughness:.26})),n=new ye(new Ui(.151,.018,8,28),new lt({color:2503482,roughness:.36,metalness:.72}));n.rotation.x=Math.PI/2;const s=new ye(new pn(.036,.036,.022,18),new lt({color:13499135,emissive:7526886,emissiveIntensity:.62,roughness:.2,metalness:.34}));return s.rotation.x=Math.PI/2,s.position.z=.15,i.add(e,t,n,s),i.traverse(r=>{r.isMesh&&(r.castShadow=!0)}),i}function ww(i,e=!1){const t=new Ot;t.name="cinematic-effects",i.add(t);const n=new ye(new Sa(.28,.34,40),new Bt({color:16777215,transparent:!0,opacity:0,side:hn,depthWrite:!1,blending:zn}));n.visible=!1,t.add(n);let s=0,r=0;const a=new Lo(new va({map:zh(),color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:zn}));a.visible=!1,t.add(a);let o=0,c=0;const l=new Fi(16777215,0,e?3.5:5,2);t.add(l);let u=1;const d=[],h=e?10:18;for(let C=0;C<h;C++){const z=new Bt({color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:zn}),L=new ye(new Aa(.055,0),z);L.visible=!1,t.add(L),d.push({mesh:L,velocity:new P,life:.34,age:1})}const f=zh(),m=[],y=e?8:16;for(let C=0;C<y;C++){const z=new Lo(new va({map:f,color:12121855,transparent:!0,opacity:0,depthWrite:!1,blending:zn}));z.visible=!1,t.add(z),m.push({sprite:z,life:.28,age:1})}let p=0,g=0;const M=new Bt({color:12121855,transparent:!0,opacity:0,depthWrite:!1,blending:zn}),S=new ye(new pn(.045,.12,1,10,1,!0),M);S.name="attack-direction-ribbon",S.visible=!1,S.renderOrder=8,t.add(S);const v=new ye(new hr(.18,.42,12),M.clone());v.name="attack-direction-head",v.visible=!1,v.renderOrder=9,t.add(v);const T=new P,E=new P,A=new P,_=new P,R=new P(0,1,0),N=(C,z)=>{const L=Mw[z],q=z==="crit"||z==="catch"?h:Math.ceil(h*.68);for(let K=0;K<q;K++){const ae=d[g%d.length];g++;const ue=K/q*Math.PI*2+g%5*.17,he=1.4+K*37%11*.12;ae.mesh.position.copy(C),ae.mesh.position.x+=Math.cos(ue)*.05,ae.mesh.position.y+=Math.sin(ue*1.7)*.04,ae.mesh.position.z+=Math.sin(ue)*.05,ae.mesh.scale.setScalar(z==="crit"?1.35:z==="catch"?1.15:.9),ae.mesh.material.color.setHex(L),ae.mesh.material.opacity=.95,ae.mesh.visible=!0,ae.velocity.set(Math.cos(ue)*he,Math.sin(ue*2.2)*.55+.75,Math.sin(ue)*he*.72),ae.age=0,ae.life=z==="catch"?.58:z==="crit"?.44:.34}n.position.copy(C),n.position.z+=.05,n.scale.setScalar(.34),n.material.color.setHex(L),n.material.opacity=.78,n.visible=!0,s=0,r=z==="catch"?.68:.42,a.position.copy(C),a.scale.setScalar(z==="crit"||z==="catch"?1.65:1.05),a.material.color.setHex(L),a.material.opacity=z==="crit"?.86:.68,a.visible=!0,o=0,c=z==="catch"?.58:.26,l.position.copy(C),l.color.setHex(L),l.intensity=z==="crit"||z==="catch"?3.1:1.8,u=0},D=(C,z=12121855)=>{const L=m[p%m.length];p++,L.sprite.position.copy(C),L.sprite.position.x+=(p*37%9-4)*.006,L.sprite.position.y+=(p*17%7-3)*.006;const q=.13+p%4*.018;L.sprite.scale.set(q,q,1),L.sprite.material.color.setHex(z),L.sprite.material.opacity=.7,L.sprite.visible=!0,L.age=0,L.life=.24+p%3*.035};return{root:t,burst:N,trail:D,directedTrail:(C,z,L,q=16757855)=>{const K=Math.max(0,Math.min(1,L)),ae=K*K*(3-2*K),ue=Math.max(0,ae-.38);E.lerpVectors(C,z,ae),T.lerpVectors(C,z,ue),E.y+=Math.sin(ae*Math.PI)*.24,T.y+=Math.sin(ue*Math.PI)*.24,A.subVectors(E,T);const he=Math.max(.035,A.length()),Pe=A.normalize();_.addVectors(T,E).multiplyScalar(.5),S.position.copy(_),S.quaternion.setFromUnitVectors(R,Pe),S.scale.set(1+Math.sin(K*Math.PI)*.45,he,1),S.material.color.setHex(q),S.material.opacity=.84+Math.sin(K*Math.PI)*.14,S.visible=!0,v.position.copy(E),v.quaternion.setFromUnitVectors(R,Pe),v.scale.setScalar(.82+Math.sin(K*Math.PI)*.42),v.material.color.setHex(q),v.material.opacity=.94,v.visible=!0,D(E,q)},clearDirectedTrail:()=>{S.visible=!1,S.material.opacity=0,v.visible=!1,v.material.opacity=0},tick:(C,z)=>{for(const L of d){if(!L.mesh.visible)continue;L.age+=C;const q=L.age/L.life;L.mesh.position.addScaledVector(L.velocity,C),L.velocity.y-=C*2.8,L.mesh.rotation.x+=C*9,L.mesh.rotation.y+=C*13,L.mesh.material.opacity=Math.max(0,1-q),L.mesh.scale.multiplyScalar(Math.max(.88,1-C*2.4)),q>=1&&(L.mesh.visible=!1)}for(const L of m){if(!L.sprite.visible)continue;L.age+=C;const q=L.age/L.life;L.sprite.position.y+=C*.3,L.sprite.material.opacity=Math.max(0,(1-q)*.7),L.sprite.scale.multiplyScalar(1+C*1.6),q>=1&&(L.sprite.visible=!1)}if(n.visible){s+=C;const L=s/r;n.scale.setScalar(.34+L*4.2),n.material.opacity=Math.max(0,(1-L)*.78),n.rotation.z=z*.4,L>=1&&(n.visible=!1)}if(a.visible){o+=C;const L=o/c;a.material.opacity=Math.max(0,(1-L)*.72),a.scale.multiplyScalar(1+C*2.2),L>=1&&(a.visible=!1)}u+=C,l.intensity*=Math.exp(-C*12),u>.4&&(l.intensity=0)}}}const bw=JSON.parse('[{"connections":[{"direction":"north","id":"edge:red-blue:pallet-town:route-1","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"}],"gameId":"game:red-blue","id":"map:red-blue:pallet-town","locationId":"location:kanto:pallet-town","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:pallet-town:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-1:pallet-town","toMap":"map:red-blue:route-1"}]},{"connections":[{"direction":"south","id":"edge:red-blue:route-1:pallet-town","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pallet-town"},{"direction":"north","id":"edge:red-blue:route-1:viridian-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"}],"gameId":"game:red-blue","id":"map:red-blue:route-1","locationId":"location:kanto:route-1","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:route-1:pallet-town","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:pallet-town:route-1","toMap":"map:red-blue:pallet-town"},{"id":"warp:red-blue:route-1:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:viridian-city:route-1","toMap":"map:red-blue:viridian-city"}]},{"connections":[{"direction":"south","id":"edge:red-blue:viridian-city:route-1","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"},{"direction":"north","id":"edge:red-blue:viridian-city:route-2-south","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"}],"gameId":"game:red-blue","id":"map:red-blue:viridian-city","locationId":"location:kanto:viridian-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:viridian-city:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-1:viridian-city","toMap":"map:red-blue:route-1"},{"id":"warp:red-blue:viridian-city:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-2-south:viridian-city","toMap":"map:red-blue:route-2-south"}]},{"connections":[{"direction":"south","id":"edge:red-blue:route-2-south:viridian-city","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"},{"direction":"north","id":"edge:red-blue:route-2-south:viridian-forest","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"}],"gameId":"game:red-blue","id":"map:red-blue:route-2-south","locationId":"location:kanto:route-2-south","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:route-2-south:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:viridian-city:route-2-south","toMap":"map:red-blue:viridian-city"},{"id":"warp:red-blue:route-2-south:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:viridian-forest:route-2-south","toMap":"map:red-blue:viridian-forest"}]},{"connections":[{"direction":"south","id":"edge:red-blue:viridian-forest:route-2-south","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"},{"direction":"north","id":"edge:red-blue:viridian-forest:route-2-north","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"}],"gameId":"game:red-blue","id":"map:red-blue:viridian-forest","locationId":"location:kanto:viridian-forest","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:viridian-forest:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-2-south:viridian-forest","toMap":"map:red-blue:route-2-south"},{"id":"warp:red-blue:viridian-forest:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-2-north:viridian-forest","toMap":"map:red-blue:route-2-north"}]},{"connections":[{"direction":"south","id":"edge:red-blue:route-2-north:viridian-forest","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"},{"direction":"north","id":"edge:red-blue:route-2-north:pewter-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:red-blue","id":"map:red-blue:route-2-north","locationId":"location:kanto:route-2-north","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:route-2-north:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:viridian-forest:route-2-north","toMap":"map:red-blue:viridian-forest"},{"id":"warp:red-blue:route-2-north:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-north","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:pewter-city:route-2-north","toMap":"map:red-blue:pewter-city"}]},{"connections":[{"direction":"south","id":"edge:red-blue:pewter-city:route-2-north","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"},{"direction":"east","id":"edge:red-blue:pewter-city:route-3","offset":[1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-east","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-3"}],"gameId":"game:red-blue","id":"map:red-blue:pewter-city","locationId":"location:kanto:pewter-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:pewter-city:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-south","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-2-north:pewter-city","toMap":"map:red-blue:route-2-north"},{"id":"warp:red-blue:pewter-city:route-3","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-east","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:route-3:pewter-city","toMap":"map:red-blue:route-3"}]},{"connections":[{"direction":"west","id":"edge:red-blue:route-3:pewter-city","offset":[-1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#connection-west","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:red-blue","id":"map:red-blue:route-3","locationId":"location:kanto:route-3","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:red-blue:route-3:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#entrance-west","sourceId":"source:pret-pokered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:red-blue:pewter-city:route-3","toMap":"map:red-blue:pewter-city"}]},{"connections":[{"direction":"north","id":"edge:yellow:pallet-town:route-1","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"}],"gameId":"game:yellow","id":"map:yellow:pallet-town","locationId":"location:kanto:pallet-town","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:pallet-town:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-1:pallet-town","toMap":"map:yellow:route-1"}]},{"connections":[{"direction":"south","id":"edge:yellow:route-1:pallet-town","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pallet-town"},{"direction":"north","id":"edge:yellow:route-1:viridian-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"}],"gameId":"game:yellow","id":"map:yellow:route-1","locationId":"location:kanto:route-1","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:route-1:pallet-town","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:pallet-town:route-1","toMap":"map:yellow:pallet-town"},{"id":"warp:yellow:route-1:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:viridian-city:route-1","toMap":"map:yellow:viridian-city"}]},{"connections":[{"direction":"south","id":"edge:yellow:viridian-city:route-1","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"},{"direction":"north","id":"edge:yellow:viridian-city:route-2-south","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"}],"gameId":"game:yellow","id":"map:yellow:viridian-city","locationId":"location:kanto:viridian-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:viridian-city:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-1:viridian-city","toMap":"map:yellow:route-1"},{"id":"warp:yellow:viridian-city:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-2-south:viridian-city","toMap":"map:yellow:route-2-south"}]},{"connections":[{"direction":"south","id":"edge:yellow:route-2-south:viridian-city","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"},{"direction":"north","id":"edge:yellow:route-2-south:viridian-forest","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"}],"gameId":"game:yellow","id":"map:yellow:route-2-south","locationId":"location:kanto:route-2-south","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:route-2-south:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:viridian-city:route-2-south","toMap":"map:yellow:viridian-city"},{"id":"warp:yellow:route-2-south:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:viridian-forest:route-2-south","toMap":"map:yellow:viridian-forest"}]},{"connections":[{"direction":"south","id":"edge:yellow:viridian-forest:route-2-south","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"},{"direction":"north","id":"edge:yellow:viridian-forest:route-2-north","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"}],"gameId":"game:yellow","id":"map:yellow:viridian-forest","locationId":"location:kanto:viridian-forest","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:viridian-forest:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-2-south:viridian-forest","toMap":"map:yellow:route-2-south"},{"id":"warp:yellow:viridian-forest:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-2-north:viridian-forest","toMap":"map:yellow:route-2-north"}]},{"connections":[{"direction":"south","id":"edge:yellow:route-2-north:viridian-forest","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"},{"direction":"north","id":"edge:yellow:route-2-north:pewter-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:yellow","id":"map:yellow:route-2-north","locationId":"location:kanto:route-2-north","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:route-2-north:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:viridian-forest:route-2-north","toMap":"map:yellow:viridian-forest"},{"id":"warp:yellow:route-2-north:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-north","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:pewter-city:route-2-north","toMap":"map:yellow:pewter-city"}]},{"connections":[{"direction":"south","id":"edge:yellow:pewter-city:route-2-north","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"},{"direction":"east","id":"edge:yellow:pewter-city:route-3","offset":[1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-east","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-3"}],"gameId":"game:yellow","id":"map:yellow:pewter-city","locationId":"location:kanto:pewter-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:pewter-city:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-south","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-2-north:pewter-city","toMap":"map:yellow:route-2-north"},{"id":"warp:yellow:pewter-city:route-3","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-east","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:route-3:pewter-city","toMap":"map:yellow:route-3"}]},{"connections":[{"direction":"west","id":"edge:yellow:route-3:pewter-city","offset":[-1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#connection-west","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:yellow","id":"map:yellow:route-3","locationId":"location:kanto:route-3","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:yellow:route-3:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#entrance-west","sourceId":"source:pret-pokeyellow","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:yellow:pewter-city:route-3","toMap":"map:yellow:pewter-city"}]},{"connections":[{"direction":"north","id":"edge:firered-leafgreen:pallet-town:route-1","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:pallet-town","locationId":"location:kanto:pallet-town","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:pallet-town:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pallet-town#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-1:pallet-town","toMap":"map:firered-leafgreen:route-1"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:route-1:pallet-town","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pallet-town"},{"direction":"north","id":"edge:firered-leafgreen:route-1:viridian-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:route-1","locationId":"location:kanto:route-1","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:route-1:pallet-town","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:pallet-town:route-1","toMap":"map:firered-leafgreen:pallet-town"},{"id":"warp:firered-leafgreen:route-1:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-1#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:viridian-city:route-1","toMap":"map:firered-leafgreen:viridian-city"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:viridian-city:route-1","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-1"},{"direction":"north","id":"edge:firered-leafgreen:viridian-city:route-2-south","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:viridian-city","locationId":"location:kanto:viridian-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:viridian-city:route-1","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-1:viridian-city","toMap":"map:firered-leafgreen:route-1"},{"id":"warp:firered-leafgreen:viridian-city:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-city#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-2-south:viridian-city","toMap":"map:firered-leafgreen:route-2-south"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:route-2-south:viridian-city","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-city"},{"direction":"north","id":"edge:firered-leafgreen:route-2-south:viridian-forest","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:route-2-south","locationId":"location:kanto:route-2-south","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:route-2-south:viridian-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:viridian-city:route-2-south","toMap":"map:firered-leafgreen:viridian-city"},{"id":"warp:firered-leafgreen:route-2-south:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-south#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:viridian-forest:route-2-south","toMap":"map:firered-leafgreen:viridian-forest"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:viridian-forest:route-2-south","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-south"},{"direction":"north","id":"edge:firered-leafgreen:viridian-forest:route-2-north","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:viridian-forest","locationId":"location:kanto:viridian-forest","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:viridian-forest:route-2-south","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-2-south:viridian-forest","toMap":"map:firered-leafgreen:route-2-south"},{"id":"warp:firered-leafgreen:viridian-forest:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/viridian-forest#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-2-north:viridian-forest","toMap":"map:firered-leafgreen:route-2-north"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:route-2-north:viridian-forest","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:viridian-forest"},{"direction":"north","id":"edge:firered-leafgreen:route-2-north:pewter-city","offset":[0,1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#connection-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:route-2-north","locationId":"location:kanto:route-2-north","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:route-2-north:viridian-forest","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:viridian-forest:route-2-north","toMap":"map:firered-leafgreen:viridian-forest"},{"id":"warp:firered-leafgreen:route-2-north:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-2-north#entrance-north","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:pewter-city:route-2-north","toMap":"map:firered-leafgreen:pewter-city"}]},{"connections":[{"direction":"south","id":"edge:firered-leafgreen:pewter-city:route-2-north","offset":[0,-1],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-2-north"},{"direction":"east","id":"edge:firered-leafgreen:pewter-city:route-3","offset":[1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#connection-east","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:route-3"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:pewter-city","locationId":"location:kanto:pewter-city","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:pewter-city:route-2-north","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-south","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-2-north:pewter-city","toMap":"map:firered-leafgreen:route-2-north"},{"id":"warp:firered-leafgreen:pewter-city:route-3","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/pewter-city#entrance-east","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:route-3:pewter-city","toMap":"map:firered-leafgreen:route-3"}]},{"connections":[{"direction":"west","id":"edge:firered-leafgreen:route-3:pewter-city","offset":[-1,0],"oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#connection-west","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"to":"location:kanto:pewter-city"}],"gameId":"game:firered-leafgreen","id":"map:firered-leafgreen:route-3","locationId":"location:kanto:route-3","plane":"game","provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"warps":[{"id":"warp:firered-leafgreen:route-3:pewter-city","kind":"boundary-entrance","oneWay":false,"provenance":{"confidence":"high","extractionMethod":"manual factual transcription","licenseClass":"research-facts","locator":"maps/route-3#entrance-west","sourceId":"source:pret-pokefirered","sourceRevision":"accessed-2026-08-24"},"reciprocalWarpId":"warp:firered-leafgreen:pewter-city:route-3","toMap":"map:firered-leafgreen:pewter-city"}]}]'),Ew={maps:bw},Tw=[{arcId:"arc:ash:kanto:indigo",id:"story-event:ash:ep001:depart-pallet",locationId:"location:kanto:pallet-town",order:1,plane:"anime",provenance:{confidence:"medium",extractionMethod:"manual factual transcription",licenseClass:"CC-BY-SA-facts-paraphrase",locator:"Ash_Ketchum#EP001",sourceId:"source:bulbapedia-ash-kanto",sourceRevision:"accessed-2026-08-24"},summary:"Ash begins his journey from Pallet Town."},{arcId:"arc:ash:kanto:indigo",id:"story-event:ash:ep001:route-1-crisis",locationId:"location:kanto:route-1",order:2,plane:"anime",provenance:{confidence:"medium",extractionMethod:"manual factual transcription",licenseClass:"CC-BY-SA-facts-paraphrase",locator:"Ash_Ketchum#EP001",sourceId:"source:bulbapedia-ash-kanto",sourceRevision:"accessed-2026-08-24"},summary:"A flock encounter turns the first trip north into an emergency."},{arcId:"arc:ash:kanto:indigo",id:"story-event:ash:ep002:viridian-arrival",locationId:"location:kanto:viridian-city",order:3,plane:"anime",provenance:{confidence:"medium",extractionMethod:"manual factual transcription",licenseClass:"CC-BY-SA-facts-paraphrase",locator:"Ash_Ketchum#EP002",sourceId:"source:bulbapedia-ash-kanto",sourceRevision:"accessed-2026-08-24"},summary:"Ash reaches Viridian City seeking help before continuing."},{arcId:"arc:ash:kanto:indigo",id:"story-event:ash:ep003:forest-companion",locationId:"location:kanto:viridian-forest",order:4,plane:"anime",provenance:{confidence:"medium",extractionMethod:"manual factual transcription",licenseClass:"CC-BY-SA-facts-paraphrase",locator:"Ash_Ketchum#EP003",sourceId:"source:bulbapedia-ash-kanto",sourceRevision:"accessed-2026-08-24"},summary:"The forest journey adds a companion and a first capture milestone."},{arcId:"arc:ash:kanto:indigo",id:"story-event:ash:ep005:pewter-gym",locationId:"location:kanto:pewter-city",order:5,plane:"anime",provenance:{confidence:"medium",extractionMethod:"manual factual transcription",licenseClass:"CC-BY-SA-facts-paraphrase",locator:"Ash_Ketchum#EP005",sourceId:"source:bulbapedia-ash-kanto",sourceRevision:"accessed-2026-08-24"},summary:"Ash challenges the Pewter Gym and then continues with Brock."}],Aw={events:Tw},Rw="game:yellow",Cw=["location:kanto:pallet-town","location:kanto:route-1","location:kanto:viridian-city","location:kanto:route-2-south","location:kanto:viridian-forest","location:kanto:route-2-north","location:kanto:pewter-city","location:kanto:route-3"],Iw={distributableAssetsOnly:!0,privateAssetsInPublicArtifactsAllowed:!1,privateCanonicalAssetsAllowed:!0},Pw="world-slice:kanto:pallet-pewter",da={activeGameId:Rw,path:Cw,presentationPolicy:Iw,sliceId:Pw};function Lw(i,e,t){const n=i.filter(o=>o.gameId===e),s=new Map(n.map(o=>[o.locationId,o]));if(!s.has(t))throw new Error(`Missing graph origin ${t} for ${e}`);const r={[t]:[0,0]},a=[t];for(;a.length>0;){const o=a.shift(),c=s.get(o);if(!c)throw new Error(`Connection references missing source ${o}`);const[l,u]=r[o];for(const d of c.connections){if(!s.has(d.to))throw new Error(`Connection references missing target ${d.to}`);const h=[l+d.offset[0],u+d.offset[1]],f=r[d.to];if(f&&(f[0]!==h[0]||f[1]!==h[1]))throw new Error(`Conflicting graph coordinate for ${d.to}`);f||(r[d.to]=h,a.push(d.to))}}if(Object.keys(r).length!==n.length)throw new Error(`Disconnected ${e} graph: reached ${Object.keys(r).length}/${n.length}`);return r}const gp=da.path,Nw=Lw(Ew.maps,da.activeGameId,gp[0]),rn=Object.freeze({sliceId:da.sliceId,activeGameId:da.activeGameId,path:gp,coordinates:Nw,events:[...Aw.events].sort((i,e)=>i.order-e.order),presentationPolicy:da.presentationPolicy});function Dw(i,e){if(!i||typeof i!="object"||Array.isArray(i))return;const t=i,s=[...typeof t.starterSpeciesId=="string"?[t.starterSpeciesId]:[],...Array.isArray(t.partySpeciesIds)?t.partySpeciesIds.filter(r=>typeof r=="string"):[]].find(r=>!e.has(r));if(s)throw new Error(`Private canonical save invalidated: species ${s} cannot be migrated or relabelled`)}function Uw(i,e,t,n){const s=i.getItem(e);if(s===null)return{invalidated:!1};try{return Dw(JSON.parse(s),n),{invalidated:!1}}catch{return i.removeItem(e),i.setItem(t,JSON.stringify({version:1,action:"invalidated",reason:"non-canonical-species"})),{invalidated:!0}}}function Fw(i){let e=(i.keys.has("d")||i.keys.has("arrowright")?1:0)-(i.keys.has("a")||i.keys.has("arrowleft")?1:0),t=(i.keys.has("s")||i.keys.has("arrowdown")?1:0)-(i.keys.has("w")||i.keys.has("arrowup")?1:0);e+=i.touch?.x??0,t+=i.touch?.y??0,e+=i.gamepad?.x??0,t+=i.gamepad?.y??0;const n=Math.hypot(e,t);return n>1&&(e/=n,t/=n),{x:e,y:t,interact:i.keys.has("e")||i.gamepad?.interact===!0}}function Ow(i,e){const t=e[i];if(!t||i==="distributable")throw new Error(`Runtime asset profile ${i} unavailable`);return{profile:i,markerHref:t.markerHref,policy:t.policy}}function Bw(i){return[...new Uint8Array(i)].map(e=>e.toString(16).padStart(2,"0")).join("")}async function kw(i,e,t){if(i.git.sha!==e)throw new Error("compiled Git SHA mismatch");if(i.git.dirty)throw new Error("dirty build cannot be certified");await Promise.all(Object.entries(i.files).map(async([n,s])=>{const r=await t(n);if(r.byteLength!==s.bytes)throw new Error(`served byte mismatch: ${n}`);if(Bw(await crypto.subtle.digest("SHA-256",r))!==s.sha256)throw new Error(`served byte mismatch: ${n}`)}))}async function zw(i,e,t=document.baseURI){await kw(i,e,async n=>{const s=await fetch(new URL(n,t),{cache:"no-store",integrity:`sha256-${Hw(i.files[n].sha256)}`});if(!s.ok)throw new Error(`served build file unavailable: ${n} (${s.status})`);return s.arrayBuffer()})}function Hw(i){const e=i.match(/.{2}/g)?.map(n=>Number.parseInt(n,16))??[];let t="";for(const n of e)t+=String.fromCharCode(n);return btoa(t)}const Hh=document.getElementById("boot-fill"),Vh=document.getElementById("boot-status"),na=document.getElementById("boot");function vo(i,e){Hh&&(Hh.style.width=`${Math.round(i*100)}%`),Vh&&(Vh.textContent=e)}function Vw(i){console.error(i);const e=document.getElementById("fatal"),t=document.getElementById("fatal-text");t&&(t.textContent=String(i?.stack??i)),e?.classList.add("show"),na?.classList.add("done")}const Gw={excludedStandin5:"excludedStandin4"},Ks={...Ji,excludedStandin5:Ji.excludedStandin4??6077546,excludedStandin1:Ji.excludedStandin1??15235136,excludedStandin3:Ji.excludedStandin3??4892904,excludedStandin2:Ji.excludedStandin2??15261908,excludedStandin6:Ji.excludedStandin6??13227082,excludedStandin7:Ji.excludedStandin7??13226208,excludedStandin8:Ji.excludedStandin8??6965882};function Rn(i){try{performance.mark(i)}catch{}}function Zc(i,e,t,n){try{performance.measure(i,e,t);const s=performance.getEntriesByName(i),r=s[s.length-1];if(r){const a=r.duration<=n;console.info(`[mode5] ${i}: ${r.duration.toFixed(1)}ms (budget ${n}ms) ${a?"OK":"OVER"}`)}}catch{}}function Kr(i){return new Promise(e=>setTimeout(e,i))}function Ti(i,e,t){return Math.max(e,Math.min(t,i))}function Jc(i,e){const t=Ti(i/Math.max(1,e),0,1);return Math.round(180+t*720)}const su=new Map;let Zs="distributable";function To(i,e){const t=`${i}@${e.toFixed(3)}`,n=su.get(t);if(n)return n;const s=Gw[i]??i,r=hS(s,e,{idlePhaseSeed:Math.random()*Math.PI*2+i.length});return r.userData.speciesId=i,su.set(t,r),r}function Zr(i,e=1){if(Zs==="private-local")return hp(i,e);const t=To(i,e).clone(!0);t.userData.speciesId=i;const n=Cn(t);return n&&(n.idlePhase=Math.random()*Math.PI*2+i.length),t}function Ww(i){return i===!0||typeof i=="number"&&i>1}async function Xw(){const i="private-local";let e=null;{const I=await fetch("/build-manifest.json",{cache:"no-store"});if(!I.ok)throw new Error(`Exact private build manifest unavailable (${I.status})`);const F=await I.json();if(F.schemaVersion!==1||F.privateCanonical!==!0||!/^[a-f0-9]{40}$/.test(F.git?.sha??"")||F.git.dirty||Object.keys(F.files??{}).length===0)throw new Error("Exact private build manifest is invalid or dirty");await zw(F,"f6081a2d7aea9fdd2a89071d78cf2057fbdc6d11"),e=Object.freeze(F)}const t=Ow(i,{distributable:{markerHref:"/content/game/runtime-assets/distributable.json",policy:"distributable"},"private-local":{markerHref:"/content/game/runtime-assets/private-local.json",policy:"private-only"}}),n=await fetch(t.markerHref,{cache:"no-store"});if(!n.ok)throw new Error(`Runtime asset contract missing for ${t.profile}`);const s=await n.json();if(s.profile!==t.profile||s.policy!==t.policy||s.bytesEmbedded===!0)throw new Error(`Runtime asset contract rejected for ${t.profile}`);Zs=t.profile,document.body.dataset.assetProfile=t.profile;for(let I=localStorage.length-1;I>=0;I--){const F=localStorage.key(I);F?.startsWith("twilight:")&&F!==`twilight:${rn.sliceId}:save-v1`&&localStorage.removeItem(F)}const r="/content/game/kanto-private.json";vo(.08,"Loading canonical Kanto pack");const a=await fetch(r);if(!a.ok)throw new Error(`${r} missing (${a.status})`);const o=await a.json(),c=o.moves.map(I=>FM(I)),l=new Map(c.map(I=>[I.id,I])),u=o.species.map(I=>OM(I)),d=new Map(u.map(I=>[I.id,I]));{const I=new Set(u.map(J=>J.id));Uw(localStorage,`twilight:${rn.sliceId}:save-v1`,`twilight:${rn.sliceId}:canonical-migration-v1`,I);const F=new Set([...o.route.starterChoices,...o.route.wildEncounters.map(J=>J.species),...o.route.gym?[o.route.gym.species]:[]]);await iw([...F])}vo(.25,"Init renderer");const h=document.getElementById("viewport");if(!h)throw new Error("#viewport missing");const f=lw(typeof location<"u"?location.search:""),m=f?.id===vs.id||typeof location<"u"&&/preset=medium/i.test(location.search),y=m?!1:f?.antialias??!0,p=m?f?.maxPixelRatio??1:Math.min(2,f?.maxPixelRatio??2),g=new Wf({canvas:h,antialias:y,powerPreference:m?"low-power":"high-performance"});m&&f?(cw(g,f),g.setSize(f.width,f.height,!1),g.setPixelRatio(Math.min(devicePixelRatio,p))):(g.setPixelRatio(Math.min(devicePixelRatio,p)),g.setSize(window.innerWidth,window.innerHeight)),g.outputColorSpace=Vt,g.toneMapping=au,g.toneMappingExposure=m?1.22:1.35,g.shadowMap.enabled=!0,g.shadowMap.type=ia;const M=document.createElement("div");M.id="graphics-recovery-notice",M.hidden=!0,M.setAttribute("role","status"),M.textContent="Graphics paused — restoring the route…",Object.assign(M.style,{position:"fixed",inset:"auto 50% 1.25rem auto",transform:"translateX(50%)",zIndex:"10000",padding:".65rem 1rem",borderRadius:"999px",color:"#f7f0df",background:"rgba(8, 14, 20, .88)",font:"600 13px/1.2 system-ui, sans-serif",pointerEvents:"none"}),document.body.appendChild(M);const S=new uf,v=new vn(44,window.innerWidth/window.innerHeight,.1,120);window.innerWidth<window.innerHeight&&(v.fov=76),v.position.set(0,2.25,6.4);const T=new P(0,.9,.45);v.lookAt(T),h.addEventListener("webglcontextlost",I=>{I.preventDefault(),M.hidden=!1,document.body.dataset.graphics="recovering"}),h.addEventListener("webglcontextrestored",()=>{g.resetState(),g.compile(S,v),M.hidden=!0,document.body.dataset.graphics="ready"});const E={yaw:Math.PI,pos:new P(0,2.35,5.75),look:new P(0,.92,0),dist:5.35,height:2.32,ready:!1},A={base:new P(.18,2.24,7.34),punch:0,lowAngle:0,lookY:.88,orbit:0},_=new rg(13162734,m?.28:.32);S.add(_);const R=new Lf(16767167,2376507,m?.68:.78);R.position.set(0,12,0),S.add(R);const N=new ea(16768955,m?1.28:1.62);N.position.set(-9,13,-8),N.castShadow=!0;const D=m?512:1024;N.shadow.mapSize.set(D,D),N.shadow.camera.near=.5,N.shadow.camera.far=m?34:52;const k=m?10:15;N.shadow.camera.left=-k,N.shadow.camera.right=k,N.shadow.camera.top=k,N.shadow.camera.bottom=-k,N.shadow.bias=-65e-5,N.shadow.normalBias=.025,S.add(N);const Z=new ea(7904212,m?.42:.52);Z.position.set(8,5,9),S.add(Z);const ee=new ea(16749945,m?.52:.68);ee.position.set(-7,3,-10),S.add(ee);const C=new ea(15004159,m?.18:.26);C.position.set(0,3,7),S.add(C);const z=_w(S,{useMedium:m,grassPathHalf:ip});z.setMode("starter");const{grassBlades:L,grassBaseRot:q}=z,K=new Ot;K.name="field:route-3:echoing-stone:ring";const ae=[];for(let I=0;I<10;I++){const F=I/10*Math.PI*2+I%2*.035,J=new ye(new Ta(.18+I%3*.025,0),new lt({color:7695714,roughness:.92,metalness:0}));J.position.set(Math.cos(F)*(2.15+I%2*.12),-.16,Math.sin(F)*(1.24+I%3*.06)),J.rotation.set(I*.19,F,I*.11),J.castShadow=!0,K.add(J),ae.push(J)}K.visible=!1,S.add(K);let ue=0,he=0;const Pe=[];for(let I=0;I<10;I++){const F=new ye(new ui(.06,6),new Bt({color:9426074,transparent:!0,opacity:.55,depthWrite:!1}));F.rotation.x=-Math.PI/2,F.visible=!1,S.add(F),Pe.push(F)}let st=0;const $e=[];function j(I,F){const J=Pe[st%Pe.length];st++,J.visible=!0,J.position.set(I+(Math.random()-.5)*.35,.08,F+(Math.random()-.5)*.35),J.scale.setScalar(.5+Math.random()*.6),J.material.opacity=.6,$e.push({mesh:J,t:0,life:.28+Math.random()*.12,vy:.55+Math.random()*.4})}const me=new Bt({color:1712152,transparent:!0,opacity:.35,depthWrite:!1}),de=new ye(new ui(.45,16),me);de.rotation.x=-Math.PI/2,de.position.y=.03,S.add(de);const He=new ye(new ui(.42,16),me.clone());He.rotation.x=-Math.PI/2,He.position.y=.03,He.visible=!1,S.add(He);const Qe=[];for(let I=0;I<12;I++){const F=new ye(new ui(.12,8),new Bt({color:14207144,transparent:!0,opacity:.55,depthWrite:!1}));F.rotation.x=-Math.PI/2,F.visible=!1,S.add(F),Qe.push(F)}let Xe=0;const wt=[];function at(I,F,J,te=!1,ie=0){const re=Qe[Xe%Qe.length];Xe++,re.visible=!0;const ge=(.85+Math.random()*.55)*(1+ie*.45);re.position.set(I+J*.14,.05,F),re.scale.setScalar(ge);const _e=re.material;_e.color.setHex(te?6986328:14207144),_e.opacity=.55+ie*.15,wt.push({mesh:re,t:0,life:.42+ie*.12,vy:.35+ie*.25})}let le=null,Se=null,Ye="starter",V=null,ht=o.route.starterChoices[0],Ge=!1,_t="wild",vt=0,Pt=!1,H=0,Wt=0,mt=0,w=0,x=0,O=-1;const G=`twilight:${rn.sliceId}:save-v1`,$=()=>({sliceId:rn.sliceId,currentLocationId:rn.path[0],visitedLocationIds:[rn.path[0]],storyEventIds:[],traversedMeters:0,saveRevision:0}),oe=(()=>{try{const I=JSON.parse(localStorage.getItem(G)??"null"),F=I?rn.path.indexOf(I.currentLocationId??""):-1;if(I?.sliceId!==rn.sliceId||F<0)return $();const J=rn.events.map(te=>te.id);return{sliceId:rn.sliceId,currentLocationId:rn.path[F],visitedLocationIds:rn.path.slice(0,F+1),storyEventIds:J.filter(te=>I.storyEventIds?.includes(te)),traversedMeters:Math.max(0,Number(I.traversedMeters)||0),saveRevision:Math.max(0,Number(I.saveRevision)||0)}}catch{return $()}})();let Q=oe.visitedLocationIds.length>1;const ne=()=>{oe.saveRevision+=1;try{localStorage.setItem(G,JSON.stringify(oe))}catch{}},xe=I=>{for(const J of rn.events)J.locationId===I&&!oe.storyEventIds.includes(J.id)&&oe.storyEventIds.push(J.id);const F=new Map(rn.events.map(J=>[J.id,J.order]));oe.storyEventIds.sort((J,te)=>(F.get(J)??0)-(F.get(te)??0))},De=rS({seed:1953982828,masterGain:.27}),we=(I,F)=>{(async()=>{try{await De.setScene(I),F&&await De.cue(F)}catch{}})()},ve=(I,F=.65)=>{De.snapshot().contextState!=="uninitialized"&&De.cue(I,{intensity:F}).catch(()=>{})},ze=new Ot;ze.name="companion-ceremony",vw(ze,m);const Ue=[],je=[],B=[],Me=[-2.18,0,2.18],se=new lt({color:2439482,roughness:.76,metalness:.14}),be=new lt({color:14728563,emissive:8409382,emissiveIntensity:.34,roughness:.4,metalness:.48});for(let I=0;I<o.route.starterChoices.length;I++){const F=o.route.starterChoices[I],J=Me[I]??(I-1)*2.15,te=new Ot;te.position.set(J,0,.55);const ie=new ye(new pn(.84,.98,.22,48),se);ie.position.y=.13,ie.receiveShadow=!0,te.add(ie);const re=new ye(new Ui(.69,.032,8,48),be.clone());re.rotation.x=Math.PI/2,re.position.y=.25,te.add(re),B.push(re);const ge=new ye(new ui(.52,24),new Bt({color:528655,transparent:!0,opacity:.32,depthWrite:!1}));ge.rotation.x=-Math.PI/2,ge.position.set(0,.255,.04),te.add(ge);const _e=new ys([new P(-.62,.22,-.14),new P(-.78,1.25,-.16),new P(0,2.02,-.18),new P(.78,1.25,-.16),new P(.62,.22,-.14)]),We=new ye(new Ra(_e,32,.035,8,!1),be.clone());We.castShadow=!0,te.add(We);const tt=Zr(F,F==="excludedStandin1"?.86:1.24);tt.position.set(0,.27,.04);const Le=Cn(tt);Le&&(Le.baseY=.27,F==="excludedStandin1"&&(Le.baseRotY=-.5)),tt.userData.stageBaseY=.27,tt.userData.stageIndex=I,Cr(tt),te.add(tt),Ue.push(tt);const Ze=Ks[F]??16764808,Tt=new Fi(Ze,I===0?2.4:1.5,5.5,1.8);Tt.position.set(0,1.45,1.05),te.add(Tt),je.push(Tt),ze.add(te)}S.add(ze),document.body.dataset.mode="starter";const Ee={player:new P(.98,0,1.04),foe:new P(-1.48,0,-.86)};let ce=0,Oe=0,Be=0,Nt=0,bt=0,wn=0,yn=0,yr=0,Mr=0,ws=0,bs=0,La=0,ii=1,vi=1,mn=0,si=0,Sr=0,is="idle",Oi=null,Bi=0,ki=0,Es="idle",Nn=0,Dn=0,$n=-1;document.body.dataset.attackPhase="idle",document.body.dataset.attackSide="none",document.body.dataset.payoff="idle";const Un=Sw();Un.visible=!1,S.add(Un);const Fn=ww(S,m),b=new P;let U=null;const Y={x:0,y:0},W=document.getElementById("touch-pad"),X=I=>{if(!W)return;const F=W.getBoundingClientRect();Y.x=Ti((I.clientX-(F.left+F.width/2))/(F.width*.35),-1,1),Y.y=Ti((I.clientY-(F.top+F.height/2))/(F.height*.35),-1,1)};W?.addEventListener("pointerdown",I=>{W.setPointerCapture(I.pointerId),X(I)}),W?.addEventListener("pointermove",I=>{W.hasPointerCapture(I.pointerId)&&X(I)});const Ae=()=>{Y.x=0,Y.y=0};W?.addEventListener("pointerup",Ae),W?.addEventListener("pointercancel",Ae);let fe=[];const Re=eS();let Fe=0,ke=0,et=!0,nt=0,Ne=0;const gt=document.getElementById("loc-label");gt&&(gt.textContent=oe.currentLocationId.split(":").at(-1).replaceAll("-"," "));const yt=document.getElementById("starter-overlay"),Et=document.getElementById("starter-row"),Mt=document.getElementById("battle-root"),Dt=document.getElementById("battle-msg"),Ce=document.getElementById("field-status"),nn=document.getElementById("field-summary"),Ke=document.getElementById("battle-menu"),ft=document.getElementById("move-menu"),bn=document.getElementById("enemy-name"),Yn=document.getElementById("enemy-lvl"),_i=document.getElementById("enemy-hp"),St=document.getElementById("ally-name"),Ft=document.getElementById("ally-lvl"),On=document.getElementById("ally-hp"),xt=document.getElementById("ally-hp-text"),Mn=document.getElementById("toast"),ln=document.getElementById("battle-flash"),zi=document.getElementById("party-strip"),wr=document.getElementById("scene-transition"),Vo=document.getElementById("payoff-vignette"),Go=Ke?.querySelector('[data-act="swap"]'),Wo=new qn,Xo=new P,xp=8;function qo(I){if(!I||!I.parent||!I.visible||(I.updateWorldMatrix(!0,!0),Wo.setFromObject(I,!0),Wo.isEmpty()))return null;const{min:F,max:J}=Wo;let te=Number.POSITIVE_INFINITY,ie=Number.POSITIVE_INFINITY,re=Number.NEGATIVE_INFINITY,ge=Number.NEGATIVE_INFINITY;for(const _e of[F.x,J.x])for(const We of[F.y,J.y])for(const tt of[F.z,J.z]){Xo.set(_e,We,tt).project(v);const Le=(Xo.x*.5+.5)*window.innerWidth,Ze=(-Xo.y*.5+.5)*window.innerHeight;te=Math.min(te,Le),re=Math.max(re,Le),ie=Math.min(ie,Ze),ge=Math.max(ge,Ze)}return[te,ie,re,ge].every(Number.isFinite)?{left:Number(te.toFixed(2)),top:Number(ie.toFixed(2)),right:Number(re.toFixed(2)),bottom:Number(ge.toFixed(2))}:null}function $o(I,F){Es=I,document.body.dataset.payoff=I;const J=qo(F??null);Vo&&J&&(Vo.style.setProperty("--payoff-x",`${((J.left+J.right)*.5).toFixed(1)}px`),Vo.style.setProperty("--payoff-y",`${((J.top+J.bottom)*.5).toFixed(1)}px`))}function br(I){is!==I&&(ki=performance.now()),is=I,document.body.dataset.attackPhase=I}let Pu=null;window.__twilight={snapshot:()=>({buildManifest:e,canonicalWorld:rn,campaign:structuredClone(oe),mode:Ye,starterModels:ze.parent?Ue.length:0,player:le?{x:le.position.x,y:le.position.y,z:le.position.z}:null,camera:{x:v.position.x,y:v.position.y,z:v.position.z},cameraLook:{x:T.x,y:T.y,z:T.z},input:{held:U?[...U.keys].sort():[]},party:fe.map(I=>({speciesId:I.battler.speciesId,name:I.battler.name,hp:I.battler.hp,maxHp:I.battler.maxHp})),battle:V?{kind:_t,playerHp:V.player.hp,playerMaxHp:V.player.maxHp,foeHp:V.foe.hp,foeMaxHp:V.foe.maxHp,foeSpeciesId:V.foe.speciesId,busy:Ge,field:V.field?structuredClone(V.field):void 0}:null,healCount:H,encounterCount:Wt,catchCount:mt,canonicalBattlePrewarm:Pu,audio:De.snapshot(),cinematic:{attack:{sequence:Sr,phase:is,attacker:Oi,elapsedMs:is==="idle"?0:Math.max(0,performance.now()-Bi),phaseStartedAtMs:ki,startedAtMs:Bi,timeline:mp},payoff:Es,subjects:{player:Ye==="battle"?qo(le):null,foe:Ye==="battle"?qo(Se):null},uiSafeMarginPx:xp}})};function Er(){if(zi){if(zi.innerHTML="",fe.length===0){zi.classList.remove("show");return}zi.classList.add("show");for(const I of fe){const F=I.battler,J=document.createElement("div");J.className=`party-slot${F.hp<=0||F.fainted?" fainted":""}`;const te=Ks[F.speciesId]??10406104;J.style.setProperty("--slot-accent",`#${te.toString(16).padStart(6,"0")}`);const ie=Ti(F.hp/Math.max(1,F.maxHp),0,1);J.innerHTML=`<span class="party-mark">${F.name.slice(0,1)}</span><span class="party-copy"><strong>${F.name}</strong><small>Lv.${F.level} · ${F.hp}/${F.maxHp}</small><i><b style="transform:scaleX(${ie})"></b></i></span>`,zi.appendChild(J)}}}function an(I,F=2800){Mn&&(Mn.textContent=I,Mn.classList.add("show"),setTimeout(()=>Mn.classList.remove("show"),F))}function Yo(I){wr&&(wr.className="",wr.offsetWidth,wr.classList.add("pulse",I),setTimeout(()=>wr.classList.remove("pulse",I),I==="battle"?380:620))}function vp(I,F){const J=I==="player"?le:Se;if(!J)return;const te=J.position.clone();te.y+=.84,Fn.burst(te,F),document.body.classList.remove("battle-impact"),document.body.offsetWidth,document.body.classList.add("battle-impact"),setTimeout(()=>document.body.classList.remove("battle-impact"),F==="crit"?190:130)}function Lt(I){Dt&&(Dt.textContent=I)}function Tr(){Dt?.classList.remove("eff-se","eff-nve","eff-crit","faint-beat"),ln?.classList.remove("se","nve","crit")}function Ar(I,F,J,te){if(!I)return;const ie=Math.max(0,Math.min(1,F/Math.max(1,J)));te!=null&&I.style.setProperty("--hp-dur",`${te}ms`),I.style.transform=`scaleX(${ie})`,I.style.background=ie>.5?"linear-gradient(90deg,#3ecf72,#5ce08a)":ie>.2?"linear-gradient(90deg,#e6d35a,#ffd56a)":"linear-gradient(90deg,#ff6b5a,#ff8f7a)"}function Ts(I){V&&(bn&&(bn.textContent=V.foe.name),Yn&&(Yn.textContent=`Lv.${V.foe.level}`),St&&(St.textContent=V.player.name),Ft&&(Ft.textContent=`Lv.${V.player.level}`),Ar(_i,nt,V.foe.maxHp,I?.enemyDur),Ar(On,Ne,V.player.maxHp,I?.allyDur),xt&&(xt.textContent=`${Math.round(Ne)}/${V.player.maxHp}`))}function En(){if(!Go)return;const I=fe.length>1&&Ye==="battle"&&!Ge;Go.disabled=!I;const F=Go.querySelector(".sub");F&&(F.textContent=I?"Switch partner":fe.length>1?"Busy…":"Need 2+ party")}function Rr(I,F){if(!ln)return;F?.layer||ln.classList.remove("se","nve","crit","on"),I==="se"?ln.classList.add("se"):I==="nve"?ln.classList.add("nve"):I==="crit"&&ln.classList.add("crit"),ln.offsetWidth,ln.classList.add("on");const J=I==="crit"?.55:I==="se"?.42:.28;A.punch=Math.max(A.punch,J),(I==="se"||I==="crit")&&(A.lowAngle=.25),setTimeout(()=>{ln.classList.remove("on","se","nve","crit")},I==="crit"?95:60)}function Lu(I,F,J="foe"){const te=F?"crit":I>=2?"se":I>0&&I<=.5?"nve":"hit";vp(J,te),I>=2?Rr("se"):I>0&&I<=.5?Rr("nve"):F||Rr("hit"),F&&(I>=2||I>0&&I<=.5?setTimeout(()=>Rr("crit",{layer:!0}),45):Rr("crit"))}function Ko(I,F,J){const te=d.get(I);if(!te)throw new Error(`unknown species ${I}`);const ie=te.moves.map(re=>l.get(re)).filter(re=>!!re).slice(0,4);return TM({id:J,name:te.name,speciesId:te.id,types:te.types,level:F,baseStats:te.baseStats,moves:ie})}function Nu(){let I=o.route.wildEncounters;const F=fe[0]?.battler.level??o.route.playerDefaultLevel;if(vt>=3||F>=8){const re=I.filter(ge=>ge.band==="late"||ge.band==="mid");re.length&&(I=re)}else if(vt>=1||F>=6){const re=I.filter(ge=>ge.band!=="late");re.length&&(I=re)}else{const re=I.filter(ge=>!ge.band||ge.band==="early");re.length&&(I=re)}const J=I.reduce((re,ge)=>re+ge.weight,0);let te=Math.random()*J;for(const re of I)if(te-=re.weight,te<=0){const ge=re.minLevel+Math.floor(Math.random()*(re.maxLevel-re.minLevel+1));return{species:re.species,level:ge}}const ie=I[0];return{species:ie.species,level:ie.minLevel}}function Du(I,F){if(le){const J=Cn(le);J&&Xc(le,J,I,F)}if(Se){const J=Cn(Se);J&&Xc(Se,J,I,F)}}function Cr(I){I.traverse(F=>{F.isMesh&&(F.castShadow=!m,F.receiveShadow=!m)})}async function Na(I,F,J=1){A.lowAngle=.55,A.punch=.2;const te=I==="player"?Ee.player:Ee.foe;I==="player"?(le&&S.remove(le),le=Zr(F,J),Cr(le),ii=.15,mn=-.9,le.position.copy(te),le.position.y=mn,le.scale.setScalar(ii),S.add(le)):(Se&&S.remove(Se),Se=Zr(F,J),Cr(Se),vi=.15,si=-.9,Se.position.copy(te),Se.position.y=si,Se.scale.setScalar(vi),S.add(Se),He.visible=!0);const ie=96,re=performance.now();await new Promise(ge=>{const _e=We=>{const tt=Ti((We-re)/ie,0,1),Le=1-Math.pow(1-tt,2.4),Ze=.15+Le*.85,Tt=-.9+Le*.9;I==="player"?(ii=Ze,mn=Tt):(vi=Ze,si=Tt);const $t=I==="player"?le:Se;$t&&($t.position.y=Tt,$t.scale.setScalar(Ze)),tt<1?requestAnimationFrame(_e):ge()};requestAnimationFrame(_e)}),I==="player"?(mn=0,ii=1,le&&(le.position.y=0,le.scale.setScalar(1))):(si=0,vi=1,Se&&(Se.position.y=0,Se.scale.setScalar(1)))}async function Uu(I){const F=le;if(!F)return;const J=280,te=performance.now();await new Promise(ie=>{const re=ge=>{const _e=Ti((ge-te)/J,0,1),We=-_e*.85,tt=Math.max(.05,1-_e);mn=We,ii=tt,F.position.y=We,F.scale.setScalar(tt),_e<1?requestAnimationFrame(re):ie()};requestAnimationFrame(re)})}async function Da(I,F,J="wild"){if(Rn("roam-to-fight-start"),Ye="battle",document.body.dataset.mode="battle",Mn?.classList.remove("show"),$o("idle"),br("idle"),document.body.classList.remove("returning"),document.body.classList.remove("encounter-beat"),Yo("battle"),z.setMode("battle"),we("battle","encounter"),Wt+=1,w=0,_t=J,Nn=0,Dn=0,Ir(),ii=1,vi=1,mn=0,si=0,$n=-1,Un.visible=!1,Tr(),A.punch=0,A.lowAngle=.4,A.lookY=.82,A.orbit=J==="wild"?.42:.58,fe.length>0){const _e=Jf(fe),We=fe[_e]?.battler;if(!We||We.hp<=0||We.fainted){kc(fe),Fu(),Ye="explore",document.body.dataset.mode="explore",H+=1,Er(),an("No conscious partners — healed at the pad.");return}ht=We.speciesId||ht}const te=Ko(I,F,J==="wild"?"wild":J);if(fe.length>0)V=wM(fe,te,o.typeChart,oe.currentLocationId),ht=V.player.speciesId||ht;else{const _e=Ko(ht,o.route.playerDefaultLevel,"player");V=jf({player:_e,foe:te,typeChart:o.typeChart,playerPartyIndex:0,locationId:oe.currentLocationId})}nt=V.foe.hp,Ne=V.player.hp;const ie=V.field?.id===Ci.id;if(K.visible=ie,ue=0,he=0,Ce?.classList.toggle("active",ie),Ce&&(Ce.dataset.echo="settled"),nn&&(nn.textContent=ie?Ci.accessibleSummary:""),Mt?.classList.add("active"),Ke?.classList.add("hidden"),ft?.classList.add("hidden"),J==="wild")Lt(`A wild ${te.name} appeared!`);else if(J==="gym"){const _e=o.route.gym;Lt(`${_e?.leaderName??"Gym Leader"} challenges you with ${te.name}!`)}else{const _e=o.route.elite;Lt(`${_e?.trainerName??"Elite"} bars the path with ${te.name}!`)}Ts({enemyDur:0,allyDur:0}),await new Promise(_e=>requestAnimationFrame(()=>_e()));const re=Na("foe",I,1.02),ge=Na("player",ht,.9);await Promise.all([re,ge]),Lt(`Go! ${V.player.name}!`),ve("battle-start",J==="wild"?.68:.9),Ge=!1,Ke?.classList.remove("hidden"),En(),requestAnimationFrame(()=>{Rn("roam-to-fight-ready"),Zc("roam→Fight","roam-to-fight-start","roam-to-fight-ready",400)})}function Fu(){U&&(U.pos.x=3.1,U.pos.z=4.5,U.vel.x=0,U.vel.z=0,le&&le.position.set(U.pos.x,0,U.pos.z))}function Zo(I){if($o("return",le),document.body.classList.add("returning"),Ye="explore",document.body.dataset.mode="explore",br("idle"),Yo("return"),z.setMode("explore"),we("explore"),V&&fe.length>0)try{Pa(fe,V.player,V.playerPartyIndex??0)}catch{}V=null,K.visible=!1,he=0,Ce?.classList.remove("active"),Mt?.classList.remove("active"),Tr(),Fn.clearDirectedTrail(),Ir(),Nn=0,Dn=0,ii=1,vi=1,mn=0,si=0,$n=-1,Un.visible=!1,He.visible=!1,A.punch=0,A.lowAngle=0,Se&&(S.remove(Se),Se=null),le&&(S.remove(le),le=Zr(ht,1),Cr(le),S.add(le)),le&&U?le.position.set(U.pos.x,0,U.pos.z):le&&le.position.set(0,0,1.2),Er(),En(),setTimeout(()=>an(I),360),setTimeout(()=>{document.body.classList.remove("returning"),Es==="return"&&$o("idle")},540)}async function Ua(I){I&&ve("victory",.9);const F=I?V?.foe.name:V?.player.name;if(Lt(`${F??"Foe"} fainted!`),Dt?.classList.add("faint-beat"),A.punch=.35,A.lowAngle=.45,I&&Se){const ie=Cn(Se);ie&&Wc(ie)}else if(!I&&le){const ie=Cn(le);ie&&Wc(ie)}const J=520,te=performance.now();if(await new Promise(ie=>{const re=ge=>{const _e=Ti((ge-te)/J,0,1);I?Nn=_e*.85:(Nn=0,Dn=_e*.85),_e<1?requestAnimationFrame(re):ie()};requestAnimationFrame(re)}),I&&V){const ie=NM(V,{party:fe,baseExp:_t==="gym"?120:_t==="elite"?160:50});for(const re of ie.messages)Lt(re),an(re,3200),await Kr(420);ie.leveledUp&&fe[0]&&(ht=V.player.speciesId),vt+=1,_t==="gym"&&(Pt=!0,an("Gym cleared — elite gate unlocked.")),Lt("You win! Growth from the battle settles in."),an(_t==="gym"?"Gym badge earned!":"Victory — partner grew stronger.")}else Lt("You were defeated…"),kc(fe),Fu(),an("Blacked out… healed at the pad.");await Kr(480),Dt?.classList.remove("faint-beat"),Zo(I?"Victory — back to the hollow.":"Blacked out — back at the heal pad."),Ge=!1}async function Ou(){if(!V||!V.needsForceSwitch)return;if(A.lowAngle=.35,Lt(`${V.player.name} fainted! Choose a partner!`),le){const te=Cn(le);te&&Wc(te)}const I=400,F=performance.now();if(await new Promise(te=>{const ie=re=>{const ge=Ti((re-F)/I,0,1);Dn=ge*.85,ge<1?requestAnimationFrame(ie):te()};requestAnimationFrame(ie)}),Dn=0,fe.map((te,ie)=>({m:te,i:ie})).filter(({m:te,i:ie})=>ie!==(V.playerPartyIndex??0)&&te.battler.hp>0&&!te.battler.fainted).length===0&&!mh(V,fe)){await Ua(!1);return}await _p()}function _p(){return new Promise(I=>{if(!V||!ft){I();return}ft.innerHTML="",ft.classList.remove("hidden"),Ke?.classList.add("hidden"),Lt("Who will you send out?"),fe.forEach((F,J)=>{const te=F.battler,ie=document.createElement("button");ie.className="btn";const re=(V.playerPartyIndex??0)===J;ie.innerHTML=`${te.name}<span class="sub">Lv.${te.level} · ${te.hp}/${te.maxHp}${re?" · fainted":""}</span>`,ie.disabled=Ge||te.hp<=0||!!te.fainted||re,ie.onclick=()=>{(async()=>{if(!V)return;if(Ge=!0,await Uu(),!mh(V,fe,J)){await Ua(!1),I();return}ht=V.player.speciesId,await Na("player",ht,1),Ne=V.player.hp,Ts(),Lt(`Go! ${V.player.name}!`),ft.classList.add("hidden"),Ke?.classList.remove("hidden"),Ge=!1,En(),I()})()},ft.appendChild(ie)})})}function yp(){if(!V||!ft)return;ft.innerHTML="",ft.classList.remove("hidden"),Ke?.classList.add("hidden");const I=V.player.movePp;let F=!1;if(V.player.moves.forEach((te,ie)=>{const re=document.createElement("button");re.className="btn";const ge=I?I[ie]:te.pp;ge>0&&(F=!0);const _e=te.pp;re.innerHTML=`${te.name}<span class="sub">${te.type} · ${te.category==="status"?"status":`pwr ${te.power??"—"}`} · PP ${ge}/${_e}</span>`,re.disabled=Ge||ge<=0,re.onclick=()=>void ku(ie),ft.appendChild(re)}),!F&&V.player.moves.length>0){const te=document.createElement("button");te.className="btn",te.innerHTML='Struggle<span class="sub">desperate · typeless · recoil</span>',te.disabled=Ge,te.onclick=()=>void ku(0,!0),ft.appendChild(te)}const J=document.createElement("button");J.className="btn ghost",J.textContent="Back",J.onclick=()=>{ft.classList.add("hidden"),Ke?.classList.remove("hidden")},ft.appendChild(J)}function Mp(){if(!V||!ft||fe.length<2)return;ft.innerHTML="",ft.classList.remove("hidden"),Ke?.classList.add("hidden"),fe.forEach((F,J)=>{const te=F.battler,ie=document.createElement("button");ie.className="btn";const re=(V.playerPartyIndex??0)===J||V.player.speciesId===te.speciesId;ie.innerHTML=`${te.name}<span class="sub">Lv.${te.level} · ${te.hp}/${te.maxHp}${re?" · out":""}</span>`,ie.disabled=Ge||te.hp<=0||!!te.fainted||re,ie.onclick=()=>{(async()=>!V||Ge||(Ge=!0,En(),await Uu(),np(V,fe,J),ht=V.player.speciesId,await Na("player",ht,1),Ne=V.player.hp,Ts(),Lt(V.log[V.log.length-1]?.message??`Go! ${V.player.name}!`),await Tp(),ft.classList.add("hidden"),!V.over&&!V.needsForceSwitch&&Ke?.classList.remove("hidden"),!V.over&&!V.needsForceSwitch&&(Ge=!1),En()))()},ft.appendChild(ie)});const I=document.createElement("button");I.className="btn ghost",I.textContent="Back",I.onclick=()=>{ft.classList.add("hidden"),Ke?.classList.remove("hidden")},ft.appendChild(I)}function Ir(){ce=0,Oe=0,Be=0,Nt=0,bt=0,wn=0,yn=0,yr=0,Mr=0,ws=0,bs=0,La=0}async function Jo(I,F={}){const J=I==="player"?le:Se;if(!J||!(I==="player"?Se:le))return;const ie=(I==="player"?Ee.player:Ee.foe).clone(),re=(I==="player"?Ee.foe:Ee.player).clone();ie.y=I==="player"?.82:.9,re.y=I==="player"?.78:.82;const ge=F.color??(I==="player"?16755288:8641023),_e=Cn(J);_e&&bh(_e),Ke?.classList.add("hidden"),ft?.classList.add("hidden"),Sr+=1,Oi=I,document.body.dataset.attackSide=I,Bi=performance.now(),ki=Bi,br("anticipation"),Ir();let We=!1,tt=!1;try{await new Promise((Le,Ze)=>{const Tt=$t=>{try{const Xt=$t-Bi,{phase:Sn,progress:Hi}=yw(Xt);if(Sn==="idle"){Le();return}br(Sn),We||(We=!0,F.onFirstFrame?.()),Ir();const on=Hi*Hi*(3-2*Hi),cn=(Yt,Gi,Pr,Lr)=>{I==="player"?(ce=Yt,bt=Gi,yn=Pr,Mr=Lr):(Oe=Yt,wn=Gi,yr=Pr,ws=-Lr)},Vi=(Yt,Gi,Pr,Lr)=>{I==="player"?(Nt=Yt,yr=Gi,ws=-Pr,La=Lr):(Be=Yt,yn=Gi,Mr=Pr,bs=Lr)};if(Sn==="anticipation")cn(0,on*.32,on*.16,on*.08),A.orbit=(I==="player"?-1:1)*on*.22;else if(Sn==="travel")cn(.12+on*.58,(1-on)*.32,(1-on)*.12,(1-on)*.05),A.orbit=(I==="player"?-1:1)*(.22+on*.12),Fn.directedTrail(ie,re,Hi,ge);else if(Sn==="contact")Fn.clearDirectedTrail(),cn(.7,0,.04,.025),Vi(.12,.18,.08,.035),A.punch=Math.max(A.punch,.48-Hi*.08),A.lowAngle=Math.max(A.lowAngle,.18),A.orbit=(I==="player"?-1:1)*.34,tt||(tt=!0,F.onContact?.());else if(Sn==="recoil"){const Yt=Math.sin(Math.PI*(.18+Hi*.82));cn((1-on)*.7,0,0,(1-on)*.02),F.recoil!==!1&&Vi(Yt*.58,Yt*.12,Yt*.24,Yt*.18),A.orbit=(I==="player"?-1:1)*(1-on)*.26}else{const Yt=(1-on)*(1-on);cn(0,0,Yt*.025,-Yt*.018),F.recoil!==!1&&Vi(Yt*.08,Yt*.035,Yt*.04,Yt*.025),A.orbit*=1-on}requestAnimationFrame(Tt)}catch(Xt){Ze(Xt)}};requestAnimationFrame(Tt)})}finally{Fn.clearDirectedTrail(),Ir(),A.orbit=0,Oi=null,document.body.dataset.attackSide="none",br("idle")}}async function Bu(I,F=140,J){const te=Se,ie=te?Cn(te):void 0;ie&&bh(ie);const re=performance.now();let ge=!1;await new Promise(_e=>{const We=tt=>{const Le=Ti((tt-re)/F,0,1);Oe=Math.sin(Le*Math.PI)*.55,!ge&&Le>=.48&&(ge=!0,J?.()),Le<1?requestAnimationFrame(We):(Oe=0,_e())};requestAnimationFrame(We)})}function Sp(I,F){const J=[];for(let te=F;te<I.length;te++){const ie=I[te];if(ie.type==="damage"&&ie.side&&ie.damage!=null&&J.push({side:ie.side,damage:ie.damage,effectiveness:ie.effectiveness,critical:ie.critical,message:ie.message}),ie.type==="crit"){const re=J[J.length-1];re&&(re.critical=!0)}}return J}function wp(I){return{...I,id:`caught-${I.speciesId}-${Date.now()}`,types:I.types.slice(),moves:I.moves.map(F=>({...F})),movePp:I.movePp?I.movePp.slice():I.moves.map(F=>F.pp),stages:I.stages?{...I.stages}:{atk:0,def:0,spa:0,spd:0,spe:0},baseStats:I.baseStats?{...I.baseStats}:I.baseStats}}function bp(I){if(!I)return null;const F=/^(lower|raise)-([a-z]+)-(\d+)$/i.exec(I);if(!F)return null;const J=F[1].toLowerCase()==="lower"?-1:1,te=F[2].toLowerCase(),re={atk:"atk",attack:"atk",def:"def",defense:"def",spa:"spa",spatk:"spa",spd:"spd",spdef:"spd",spe:"spe",speed:"spe"}[te];if(!re)return null;const ge=Math.max(1,parseInt(F[3],10)||1);return{stat:re,delta:J*ge}}function Ep(I,F,J,te,ie){I.stages||(I.stages={atk:0,def:0,spa:0,spd:0,spe:0});const re=I.stages[J]??0,ge=Math.max(-6,Math.min(6,re+te));I.stages[J]=ge;const _e=ge-re;if(_e===0){const Ze=`${I.name}'s ${J.toUpperCase()} won't go any ${te<0?"lower":"higher"}!`;return V?.log.push({type:"status",side:F,stageStat:J,stageDelta:0,message:Ze}),Ze}const We=_e<0?"fell":"rose",tt=Math.abs(_e)>=2?" sharply":"",Le=`${I.name}'s ${J.toUpperCase()} ${We}${tt}! (${ie})`;return V?.log.push({type:"status",side:F,stageStat:J,stageDelta:_e,message:Le}),Le}async function Tp(){if(!V||V.over)return;const I=xh(V.foe,V.player,o.typeChart);let F=V.foe.moves[I];if(!F)return;(!V.foe.movePp||V.foe.movePp.length!==V.foe.moves.length)&&(V.foe.movePp=V.foe.moves.map(Tt=>Tt.pp));const J=V.foe.movePp[I];let te=!1;if(J>0?V.foe.movePp[I]=J-1:(te=!0,F={id:"struggle",name:"Struggle",type:"normal",category:"physical",power:50,accuracy:null,pp:1,priority:0}),V.log.push({type:"move",side:"foe",moveId:F.id,message:`${V.foe.name} used ${F.name}!`}),F.accuracy!=null&&Math.random()*100>=F.accuracy){V.log.push({type:"miss",side:"foe",moveId:F.id,message:`${V.foe.name}'s attack missed!`}),Lt(`${V.foe.name}'s attack missed!`),await Bu("foe",100),await Kr(220);return}if(!te&&(F.category==="status"||F.power==null||F.power<=0)){const Tt=bp(F.effect);let $t=`${V.foe.name} used ${F.name}!`;if(Tt){const Xt=Tt.delta<0?"player":"foe",Sn=Xt==="player"?V.player:V.foe;$t=Ep(Sn,Xt,Tt.stat,Tt.delta,F.name)}else V.log.push({type:"message",side:"foe",message:`${F.name} had no effect.`}),$t=`${F.name} had no effect.`;await Bu("foe",120,()=>{Lt($t)}),await Kr(280),Ts();return}const ie=dr(V.foe,F.category==="physical"?"atk":"spa"),re=dr(V.player,F.category==="physical"?"def":"spd"),ge=te?1:Yf(F.type,V.foe.types),_e=te?1:Iu(F.type,V.player.types,V.typeChart),We=tp(Math.random()),tt=Kf({level:V.foe.level,attack:ie,defense:re,power:F.power,stab:ge,typeEffectiveness:_e,random:qf(Math.random()),critical:We.multiplier}),Le=Math.min(tt.damage,Math.max(0,V.player.hp));V.player.hp=Math.max(0,V.player.hp-Le),V.log.push({type:"damage",side:"player",damage:Le,effectiveness:_e,critical:We.isCrit,moveId:F.id,message:`${V.foe.name} hits ${V.player.name} for ${Le}!`});let Ze=0;await Jo("foe",{color:Ks[V.foe.speciesId]??8641023,onContact:()=>{V&&(Lu(_e,We.isCrit,"player"),ve("hit",We.isCrit?1:_e>=2?.9:.68),Ze=Math.min(340,Jc(Le,V.player.maxHp)),Ne=V.player.hp,Ar(On,Ne,V.player.maxHp,Ze),xt&&(xt.textContent=`${V.player.hp}/${V.player.maxHp}`),Lt(We.isCrit&&_e>=2?`Critical hit! Super effective! (${Le})`:We.isCrit?`Critical hit! ${Le} damage!`:_e>=2?`It's super effective! (${Le})`:`${V.foe.name} hits for ${Le}!`))}}),Tr(),V.player.hp<=0?(V.player.fainted=!0,V.log.push({type:"faint",side:"player",message:`${V.player.name} fainted!`}),fe.some(($t,Xt)=>Xt!==(V.playerPartyIndex??0)&&$t.battler.hp>0&&!$t.battler.fainted)?(V.needsForceSwitch=!0,await Ou()):(V.over=!0,V.winner="foe",await Ua(!1))):Ts()}async function ku(I,F=!1){if(!V||Ge||V.over)return;const J=V.player.movePp,te=!!J&&V.player.moves.length>0&&V.player.moves.every((Le,Ze)=>(J[Ze]??0)<=0);if(!F&&J&&(J[I]??0)<=0)if(te)F=!0;else{an("No PP left!");return}Ge=!0,ve("move",.72),En(),Tr(),ft?.classList.add("hidden"),Rn("move-confirm");const ie=V.log.length,re=xh(V.foe,V.player,o.typeChart);LM(V,{playerMoveIndex:I,foeMoveIndex:re,party:fe,liveRolls:!0});const ge=V.log.slice(ie).filter(Le=>Le.type==="field");for(const Le of ge){if(he=Le.fieldAction==="echo-charged"?1:0,Ce){Ce.dataset.echo=he>0?"charged":"settled";const Ze=Ce.querySelector("span");Ze&&(Ze.textContent=Le.message??Ci.accessibleSummary)}nn&&(nn.textContent=Le.message??Ci.accessibleSummary),await Kr(Le.fieldAction==="echo-charged"?ph.riseMs:ph.settleMs)}const _e=Sp(V.log,ie),We=V.log.slice(ie).filter(Le=>Le.message).map(Le=>Le.message);let tt=!1;for(const Le of _e){const Ze=Le.side==="foe"?"player":"foe",Tt=Ze==="player"?V.player.speciesId:V.foe.speciesId,$t=Ww(Le.critical),Xt=Le.effectiveness??1;await Jo(Ze,{color:Ks[Tt]??(Ze==="player"?16755288:8641023),onFirstFrame:tt?void 0:()=>{tt=!0,Rn("first-attack-frame"),Zc("move→first-attack-frame","move-confirm","first-attack-frame",180)},onContact:()=>{if(V){if(Lu(Xt,$t,Le.side),ve("hit",$t?1:Xt>=2?.9:.62),$t&&Dt?.classList.add("eff-crit"),Xt>=2?Dt?.classList.add("eff-se"):Xt>0&&Xt<=.5&&Dt?.classList.add("eff-nve"),$t&&Xt>=2?Lt(Le.message?`${Le.message} Critical hit!`:"Critical hit! It's super effective!"):$t?Lt(Le.message&&!/critical/i.test(Le.message)?`${Le.message} Critical hit!`:Le.message??"Critical hit!"):Xt>=2?Lt(Le.message??"It's super effective!"):Xt>0&&Xt<=.5?Lt(Le.message??"It's not very effective…"):Lt(Le.message??(We.join(" ")||"…")),Le.side==="foe"){const Sn=Math.min(340,Jc(Le.damage,V.foe.maxHp));nt=V.foe.hp,Ar(_i,nt,V.foe.maxHp,Sn)}else if(Le.damage>0){const Sn=Math.min(340,Jc(Le.damage,V.player.maxHp));Ne=V.player.hp,Ar(On,Ne,V.player.maxHp,Sn),xt&&(xt.textContent=`${V.player.hp}/${V.player.maxHp}`)}}}}),Tr()}if(_e.length===0&&await Jo("player",{color:Ks[V.player.speciesId]??16755288,recoil:!1,onFirstFrame:()=>{Rn("first-attack-frame"),Zc("move→first-attack-frame","move-confirm","first-attack-frame",180)},onContact:()=>Lt(We.join(" ")||"…")}),nt=V.foe.hp,Ne=V.player.hp,Ts(),V.over){const Le=V.winner==="player";await Ua(!!Le)}else V.needsForceSwitch?await Ou():(Ge=!1,Ke?.classList.remove("hidden"),En())}if(Et){Et.innerHTML="";for(const[I,F]of o.route.starterChoices.entries()){const J=d.get(F);if(!J)continue;const te=document.createElement("button");te.className="starter-card interactive",te.dataset.species=F;const ie=Ks[F]??8308991;te.style.setProperty("--accent-c",`#${ie.toString(16).padStart(6,"0")}`),te.innerHTML=`<span class="starter-index">0${I+1}</span><span class="starter-copy"><span class="name">${J.name}</span><span class="types">${J.types.join(" · ")}</span><span class="blurb">${J.flavor??""}</span></span><span class="starter-choose">Choose</span>`;const re=()=>{x=I;for(const[ge,_e]of[...Et.querySelectorAll(".starter-card")].entries())_e.classList.toggle("selected",ge===I)};te.addEventListener("mouseenter",re),te.addEventListener("focus",re),te.onclick=()=>{Yo("depart"),we("explore","starter-confirm"),z.setMode("explore"),ht=F,S.remove(ze),le&&S.remove(le),le=Zr(F,1),Cr(le);const ge={x:0,z:2.5};le.position.set(ge.x,0,ge.z),S.add(le),yt?.classList.remove("show"),yt?.classList.add("hidden"),yt&&(yt.style.display="none"),Ye="explore",document.body.dataset.mode="explore",xe(oe.currentLocationId),ne(),U=qM({speed:4.6,runMultiplier:1.85,pos:{...ge},yaw:Math.PI}),fe=gM([{battler:Ko(F,o.route.playerDefaultLevel,"player")}]),$M(U.keys),h.tabIndex=0,h.focus({preventScroll:!0});const _e=U.yaw||0;E.yaw=_e,E.ready=!0;const We=U.pos.x,tt=U.pos.z;le.position.set(We,0,tt),E.pos.set(We-Math.sin(_e)*E.dist,E.height,tt-Math.cos(_e)*E.dist),E.look.set(We,.75,tt),v.position.copy(E.pos),v.lookAt(E.look),Er(),an(`${J.name} chose you. Follow the lantern path into the whispergrass.`),En()},Et.appendChild(te)}Et.children.length>0&&(Et.querySelector(".starter-card")?.classList.add("selected"),yt?.classList.add("show"),yt?.classList.remove("hidden"),yt&&(yt.style.display=""))}if(Ke?.querySelectorAll("[data-act]").forEach(I=>{I.addEventListener("click",()=>{const F=I.dataset.act;if(F==="fight")yp();else if(F==="swap")fe.length>1&&Mp();else if(F==="run"&&V){if(_t!=="wild"){an("Can't run from a trainer battle!");return}Zo("Got away safely!")}else if(F==="ball"&&V&&!V.over){if(_t!=="wild"){an("Can't catch a trainer's creature!");return}if(Ge)return;if(!Kl(fe)){an("Party is full — can't catch more!"),Lt("Your party is full!");return}Ge=!0,En();const J=V.foe,te=d.get(J.speciesId),ie=dS({catchRate:te?.catchRate,role:te?.role??"wild"}),re=w>=1?7:1;Rn("ball-throw-start"),ve("catch-throw",.82),$n=0,Un.visible=!0;const ge=lS({maxHp:J.maxHp,hp:J.hp,catchRate:ie,ballMod:re,seed:(Date.now()^J.hp)>>>0});Lt("You threw a ball!"),setTimeout(()=>{Rn("ball-throw-impact"),Lt(ge.messages.join(" "));for(let We=0;We<ge.shakes;We++)if(Rn(`ball-shake-${We}`),Se){const tt=Se.position.x;setTimeout(()=>{Se&&(Se.position.x=tt+(We%2?.15:-.15)),setTimeout(()=>{Se&&(Se.position.x=tt)},90)},180+We*140)}setTimeout(()=>{Un.visible=!1,$n=-1,(async()=>{if(!V){Ge=!1;return}if(ge.caught){if(w=0,ve("catch-success",.95),Rn("ball-catch-ok"),!Kl(fe)){an("Party is full — can't catch more!"),Lt("Your party is full!"),Ge=!1,Ke?.classList.remove("hidden"),En();return}const We={battler:wp(J)};if(!xM(fe,We)){an("Party is full!"),Ge=!1,Ke?.classList.remove("hidden"),En();return}mt+=1,Er(),Zo("Gotcha! "+J.name+" joined the party!"),Ge=!1,En()}else w+=1,ve("catch-shake",.7),Rn("ball-catch-fail"),Lt("It broke free — but the resonance startled it!"),an("Resonance locked: the next throw will hold much more strongly."),Ge=!1,Ke?.classList.remove("hidden"),En()})()},900+ge.shakes*140)},420)}})}),window.addEventListener("resize",()=>{const I=window.innerWidth,F=window.innerHeight;v.aspect=I/F,v.updateProjectionMatrix(),m&&f?(g.setSize(f.width,f.height,!1),g.setPixelRatio(Math.min(devicePixelRatio,p))):g.setSize(I,F)}),vo(.94,"Prewarming creature silhouettes"),Zs==="distributable")for(const I of u)To(I.id,1),To(I.id,.9),To(I.id,1.02);const Qo=new Ot;for(const I of su.values())Qo.add(I.clone(!0));Zs==="distributable"&&S.add(Qo);const zu=new Map;Fn.root.traverse(I=>{zu.set(I,I.visible),I.visible=!0}),z.setMode("battle"),Rn("canonical-battle-prewarm-compile-start"),Zs==="private-local"?Pu=await rw({plan:sw(o.route),renderer:g,makeMesh:(I,F)=>hp(I,F),curtainOpaque:()=>!!(na&&!na.classList.contains("done"))}):(await g.compileAsync(S,v),g.render(S,v)),Rn("canonical-battle-prewarm-compile-end"),Rn("canonical-battle-prewarm-draw-end"),z.setMode("starter"),Fn.root.traverse(I=>{I.visible=zu.get(I)??!0}),Zs==="distributable"&&S.remove(Qo),vo(1,"Ready"),requestAnimationFrame(()=>{na?.classList.add("done"),setTimeout(()=>na?.remove(),900)});let Ap=performance.now(),Hu=performance.now();const Vu=I=>{const F=Math.min(.1,Math.max(.005,(I-Hu)/1e3));Hu=I;const J=(I-Ap)/1e3;z.tick(J,F,Ye),Fn.tick(F,J);for(let ie=wt.length-1;ie>=0;ie--){const re=wt[ie];re.t+=F;const ge=re.t/re.life,_e=re.mesh.material;_e.opacity=.55*(1-ge),re.mesh.position.y+=(re.vy??.3)*F,re.mesh.scale.setScalar(.85+ge*1.6),ge>=1&&(re.mesh.visible=!1,wt.splice(ie,1))}for(let ie=$e.length-1;ie>=0;ie--){const re=$e[ie];re.t+=F;const ge=re.t/re.life;re.mesh.position.y+=re.vy*F;const _e=re.mesh.material;_e.opacity=.55*(1-ge),ge>=1&&(re.mesh.visible=!1,$e.splice(ie,1))}ke=Math.max(0,ke-F*3.5);const te=m?2:1;for(let ie=0;ie<L.length;ie+=te){const re=L[ie],ge=q[ie],We=(U&&Ye==="explore"?Math.hypot(re.position.x-U.pos.x,re.position.z-U.pos.z):99)<1.1?ke:ke*.15,tt=Math.sin(J*2.1+ie*.4)*.06+We*Math.sin(J*18+ie)*.4;re.rotation.z=ge+tt}if($n>=0&&$n<1){$n=Math.min(1,$n+F/.42);const ie=$n,re=1.28,ge=1,_e=-1.45,We=-.8,tt=re+(_e-re)*ie,Le=ge+(We-ge)*ie,Ze=.6+Math.sin(ie*Math.PI)*1.4;Un.position.set(tt,Ze,Le),Fn.trail(Un.position,16765306),Un.rotation.x+=F*12,Un.rotation.z+=F*9}if(A.punch*=Math.exp(-F*4.5),A.lowAngle*=Math.exp(-F*2.8),Ye==="explore"&&U&&le){Fe>0&&(Fe=Math.max(0,Fe-F));const ie=navigator.getGamepads?.()[0],re=cn=>Math.abs(cn)<.18?0:cn,ge=Fw({keys:new Set,touch:Y,gamepad:ie?{x:re(ie.axes[0]??0),y:re(ie.axes[1]??0),interact:!!ie.buttons[0]?.pressed}:void 0});U.analog.x=ge.x,U.analog.z=ge.y,U.analog.interact=ge.interact;const _e=jM(U,F);if(_e.moved&&oe.visitedLocationIds.length<rn.path.length){oe.traversedMeters+=_e.speed*F;const cn=oe.visitedLocationIds.length;if(oe.traversedMeters>=cn*5){const Vi=rn.path[cn];oe.currentLocationId=Vi,oe.visitedLocationIds.push(Vi),xe(Vi),ne();const Yt=Vi.split(":").at(-1).replaceAll("-"," ");if(gt&&(gt.textContent=Yt),an(`Arrived: ${Yt}`),cn===1&&!Q&&!Ge){Q=!0,Ge=!0;const Gi=Nu();Da(Gi.species,Gi.level,"wild").finally(()=>{Ge=!1})}}}le.position.x=U.pos.x,le.position.z=U.pos.z;const We=Cn(le);if(We&&(We.baseY=0,We.baseRotY=U.yaw),le.position.y=0,le.rotation.y=U.yaw,de.position.set(U.pos.x,.03,U.pos.z),de.visible=!0,_e.footPlant){const cn=U.footPhase===0?-1:1;at(U.pos.x,U.pos.z,cn,_e.inGrass,U.runBlend),J-O>=.18&&(O=J,ve("step",.32+U.runBlend*.25))}(_e.grassRustle||_e.inGrass&&_e.moved)&&_e.grassRustle&&(ve("grass-rustle",.58),ke=Math.min(1,ke+.75),j(U.pos.x,U.pos.z),j(U.pos.x,U.pos.z)),Fe<=0&&tS(U.pos,Re)&&fe.length>0&&(kc(fe),Fe=2.5,H+=1,Er(),an("Moonwell restored every partner."),b.set(U.pos.x,.72,U.pos.z),Fn.burst(b,"catch"),ve("heal",.92),le.scale.setScalar(1.1),setTimeout(()=>{le&&le.scale.setScalar(1)},160));const tt=U.keys.has("e")||U.analog.interact;if(tt||(et=!0),_e.nearInteract&&et&&tt&&!Ge&&(et=!1,_e.nearInteract==="gym"&&o.route.gym?(Ge=!0,Da(o.route.gym.species,o.route.gym.level,"gym").finally(()=>{Ge=!1})):_e.nearInteract==="elite"&&o.route.elite&&(Pt?(Ge=!0,Da(o.route.elite.species,o.route.elite.level,"elite").finally(()=>{Ge=!1})):an("Clear the gym lantern first."))),_e.encounter&&!Ge){Ge=!0;const cn=Nu();Da(cn.species,cn.level,"wild").finally(()=>{Ge=!1})}E.yaw=U.yaw;const Le=JM(le.position.x,le.position.z,E.yaw,E.dist,U.obstacles),Ze=le.position.x-Math.sin(E.yaw)*Le,Tt=le.position.z-Math.cos(E.yaw)*Le,$t=E.height+(E.dist-Le)*.15;E.pos.set(Ze,$t,Tt);const Xt=1.35,Sn=le.position.x+Math.sin(E.yaw)*Xt,Hi=.85,on=le.position.z+Math.cos(E.yaw)*Xt;E.look.set(Sn,Hi,on),v.position.copy(E.pos),v.lookAt(E.look),Du(F,J),le.position.x=U.pos.x,le.position.z=U.pos.z}else if(Ye==="battle"){ue+=(he-ue)*Math.min(1,F*8.5);for(let Ze=0;Ze<ae.length;Ze++){const Tt=ae[Ze];Tt.position.y=-.16+ue*(.42+Ze%3*.055),Tt.rotation.z+=F*ue*(Ze%2===0?.22:-.18)}de.visible=!0;const ie=1,re=-.8;if(le){le.position.x=1.28,le.position.z=0,le.position.y=-Dn*1.1,le.rotation.y=-.55,Dn>0&&le.scale.setScalar(Math.max(.05,1-Dn*.35));const Ze=Cn(le);Ze&&(Ze.baseY=-Dn*1.1,Ze.baseRotY=-.55)}if(Se){Se.position.x=-1.45,Se.position.z=0,Se.position.y=-Nn*1.1,Se.rotation.y=.55,Nn>0&&Se.scale.setScalar(Math.max(.05,1-Nn*.35));const Ze=Cn(Se);Ze&&(Ze.baseY=-Nn*1.1,Ze.baseRotY=.55)}if(Du(F,J),le){const Ze=le.position.z;le.position.x=1.28-ce*.9,le.position.z=ie+Ze-ce*.55,de.position.set(le.position.x,.03,le.position.z)}if(Se){const Ze=Se.position.z;Se.position.x=-1.45+Oe*.9,Se.position.z=re-Ze+Oe*.55,He.position.set(Se.position.x,.03,Se.position.z),He.visible=!0}const ge=A.punch,_e=A.lowAngle,We=A.base.x+ge*.15,tt=A.base.y-_e*.85-ge*.2,Le=A.base.z-ge*1.1-_e*.4;v.position.x+=(We-v.position.x)*Math.min(1,3*F),v.position.y+=(tt-v.position.y)*Math.min(1,3*F),v.position.z+=(Le-v.position.z)*Math.min(1,3*F),v.lookAt(.1,A.lookY-Nn*.3-Dn*.15-_e*.2,.2)}else{const ie=Ue[x]?.position.x??0,re=ie*.18+Math.sin(J*.18)*.12;v.position.x+=(re-v.position.x)*Math.min(1,2*F),v.position.y+=(2.78-v.position.y)*Math.min(1,2*F),v.position.z+=(7.05-v.position.z)*Math.min(1,2*F),v.lookAt(ie*.1,.84,.55);for(let ge=0;ge<Ue.length;ge++){const _e=Ue[ge],We=Cn(_e);We&&Xc(_e,We,F,J);const tt=o.route.starterChoices[ge],Le=ge===x?tt==="excludedStandin1"?1.32:1.08:.78,Ze=_e.scale.x+(Le-_e.scale.x)*Math.min(1,F*7);_e.scale.setScalar(Ze),je[ge].intensity+=((ge===x?3.8:.55)-je[ge].intensity)*Math.min(1,F*7);const Tt=B[ge];Tt&&(Tt.material.emissiveIntensity+=((ge===x?.9:.18)-Tt.material.emissiveIntensity)*Math.min(1,F*7))}de.visible=!1}g.render(S,v),requestAnimationFrame(Vu)};requestAnimationFrame(Vu)}Xw().catch(Vw);
//# sourceMappingURL=main-Ct44St9p.js.map
