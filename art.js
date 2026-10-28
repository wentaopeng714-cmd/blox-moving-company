import * as T from './vendor/three.module.js';
export {T};
const palettes=new Map(),boxes=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12);
// A nearest-filtered three-band ramp keeps the lighting deliberately graphic.
const ramp=new T.DataTexture(new Uint8Array([115,115,115,255,192,192,192,255,255,255,255,255]),3,1,T.RGBAFormat);ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.needsUpdate=true;
// Explicit painted light bands keep bright local colors and hue-rich shadows.
const PAINT=new Map([
 [0xafd1bb,0x75d2c3],[0xb1c894,0xa6dc54],[0xdccba5,0xe9ad7c],[0xf2dfb9,0xffdb9c],[0xfff0c9,0xffecbd],[0xd4b789,0xc58250],
 [0x8dbc66,0x69c84b],[0xb3d17a,0xb3e76a],[0x5e9d5b,0x228e69],[0x8bb66d,0x55ca75],[0xa4c77d,0x9be575],[0xa57d50,0xbf783f],[0xd39c72,0xe87554],
 [0x9cc8c5,0x5ec9e3],[0x5c8d83,0x1a9b9f],[0xb6cfb5,0x92cf9e],[0xb9d2ca,0x6fcbd8],[0xe1cda5,0xffd078],[0xc7c5d7,0xb9a3ee],
 [0xf0c98c,0xffc45c],[0xc3c5dc,0xaf98ee],[0x9fc6ad,0x56cbb2],[0xe4c699,0xffcd75],[0xb9c7a4,0x85d3ad],[0xe5bc9a,0xf29f83],[0xe7bb8d,0xf1a978],[0x78ae9a,0x39b5ac],
 [0x6fb59b,0x1dbbaf],[0xf0c473,0xffcb3f],[0xf1bd7c,0xffab32],[0x70a6a2,0x21bed4],[0xf3d49b,0xffd18a],[0x476c63,0x3e6fbb],[0xe6a16e,0xff7957],[0xecc46d,0xffc74a],
 [0x7eac83,0x42bf9e],[0x68916f,0x24a88e],[0x88b88a,0x58ceaa],[0x9fc992,0x9ee591],[0xf3ead1,0xfff4d5],[0xe8ddc7,0xece0fc],[0xfbf4df,0xfff7df],
 [0xd99a63,0xf09c49],[0xf2cb92,0xffd16d],[0x46665d,0x3b4875],[0x507463,0x28637c],[0xd2ad68,0xf4ac3f],[0xdba66e,0xe99c59],[0xf3cf92,0xffd078],
 [0xebce94,0xffc64e],[0xd5c5a2,0xf4ac78],[0xbadbb8,0x6cd3ac],[0xe9d7ad,0xffdc83],[0x93c2a1,0x5bceb0],[0xffedca,0xffe8b8],[0xecd8ad,0xffd493]
]);
const hslColor=(h,s,l)=>new T.Color().setHSL((h+1)%1,Math.max(0,Math.min(1,s)),Math.max(0,Math.min(.96,l)),T.SRGBColorSpace);
function paintBands(original){
 const base=new T.Color(PAINT.get(original)??original),hsl={};base.getHSL(hsl,T.SRGBColorSpace);const {h,s,l}=hsl;
 if(l<.27)return {sun:hslColor(h,s+.08,l+.09),mid:hslColor(h,s+.03,l+.015),shade:hslColor(h+.055,s+.15,l*.73),cast:hslColor(h+.075,s+.18,l*.62)};
 if(original===0xf3d49b)return {sun:hslColor(.12,.95,.84),mid:hslColor(.095,.95,.75),shade:hslColor(.035,.66,.59),cast:hslColor(.015,.63,.49)};
 let sh,ss,sl;
 if(s<.18){sh=.66;ss=.35;sl=Math.max(.25,l*.61);}
 else if(h<.18){sh=h<.08?.82:.735;ss=.51;sl=Math.max(.28,Math.min(.53,l*.71));}
 else if(h<.43){sh=.465;ss=.68;sl=Math.max(.26,Math.min(.45,l*.68));}
 else if(h<.62){sh=.59;ss=.66;sl=Math.max(.28,Math.min(.49,l*.76));}
 else{sh=h<.82?h+.055:.78;ss=.61;sl=Math.max(.27,Math.min(.48,l*.67));}
 if([0xf2dfb9,0xdccba5,0xfff0c9,0xffedca,0xe9d7ad,0xecd8ad,0xf7e7bf].includes(original)){sh=.63;ss=.44;sl=.49;}
 const sun=hslColor(h>.17&&h<.43?h-.025:h,s<.18?s+.13:Math.min(.96,s+.08),Math.min(.9,l+.095));
 const mid=hslColor(h,s<.18?s+.07:s+.07,Math.max(.2,l-.025));
 return {sun,mid,shade:hslColor(sh,ss,sl),cast:hslColor(sh+.035,ss+.05,sl-.055)};
}
const toonKey=new T.Vector3(-18,20,14).normalize(),weatherTint=new T.Color(1,1,1),weatherShade=new T.Color(1,1,1),weatherContrast={value:1};
export function setPaintWeather(tint,shade,direction,contrast){weatherTint.copy(tint);weatherShade.copy(shade);toonKey.copy(direction).normalize();weatherContrast.value=contrast;}

export function mat(color){
 if(!palettes.has(color)){
  const bands=paintBands(color),m=new T.MeshToonMaterial({color:PAINT.get(color)??color,gradientMap:ramp});
  m.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,{toonSun:{value:bands.sun},toonMid:{value:bands.mid},toonShade:{value:bands.shade},toonCast:{value:bands.cast},toonKey:{value:toonKey},weatherTint:{value:weatherTint},weatherShade:{value:weatherShade},weatherContrast});
   shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmap_pars_fragment>',`#include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>
    uniform vec3 toonSun;
    uniform vec3 toonMid;
    uniform vec3 toonShade;
    uniform vec3 toonCast;
    uniform vec3 toonKey;
    uniform vec3 weatherTint;
    uniform vec3 weatherShade;
    uniform float weatherContrast;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
    vec3 paintedNormal=normalize(inverseTransformDirection(normal,viewMatrix));
    float paintedNdotL=dot(paintedNormal,toonKey);
    vec3 painted=mix(toonShade,toonMid,step(0.08,paintedNdotL));
    painted=mix(painted,toonSun,step(0.62,paintedNdotL));
    float paintedOcclusion=1.0-smoothstep(0.44,0.58,getShadowMask());
    painted=mix(painted*weatherTint,painted*weatherShade,1.0-step(0.08,paintedNdotL));
    outgoingLight=mix(painted,toonCast*weatherShade,paintedOcclusion*0.98*weatherContrast)+totalEmissiveRadiance;
    #include <opaque_fragment>`);
  };
  m.customProgramCacheKey=()=> 'blox-painted-toon-weather-v5';palettes.set(color,m);
 }
 return palettes.get(color);
}
const inkMaterial=new T.MeshBasicMaterial({color:0x332653,side:T.BackSide});
function inkGroup(root){
 root.traverse(node=>{
  if(!node.isMesh||node.userData.toonInk||node.userData.toonOutlined||Math.min(node.scale.x,node.scale.y,node.scale.z)<.16)return;
  node.userData.toonOutlined=true;const ink=new T.Mesh(node.geometry,inkMaterial);ink.userData.toonInk=true;
  ink.scale.set(1+.028/Math.max(.2,node.scale.x),1+.028/Math.max(.2,node.scale.y),1+.028/Math.max(.2,node.scale.z));
  ink.castShadow=false;ink.receiveShadow=false;node.add(ink);
 });
}

export function box(parent,w,h,d,color,x=0,y=0,z=0){const a=new T.Mesh(boxes,mat(color));a.scale.set(w,h,d);a.position.set(x,y,z);a.castShadow=a.receiveShadow=true;parent.add(a);return a;}
export function cyl(parent,r,h,color,x=0,y=0,z=0){const a=new T.Mesh(cylinder,mat(color));a.scale.set(r,h,r);a.position.set(x,y,z);a.castShadow=a.receiveShadow=true;parent.add(a);return a;}
export function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
export function textSprite(parent,text,color='#335a4b',bg='#fffcdf',scale=2){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(4,4,504,120,24);ctx.fill();ctx.fillStyle=color;ctx.font='bold 46px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthWrite:false}));s.scale.set(scale,scale/4,1);parent.add(s);return s;}
export function tree(parent,x,z,s=1){const g=group(parent,x,0,z);box(g,.3,1.8,.3,0xa57d50,0,.9,0);box(g,1.6,1.3,1.5,0x8dbc66,0,2,0);box(g,1.1,.7,1,0xb3d17a,.2,2.8,.1);g.scale.setScalar(s);return g;}
export function plant(parent,x,y,z,s=1){const g=group(parent,x,y,z);box(g,.45,.42,.45,0xd39c72,0,.21,0);box(g,.08,.6,.08,0x5e9d5b,0,.7,0);box(g,.6,.2,.3,0x8bb66d,.14,.73,0);box(g,.24,.5,.35,0xa4c77d,-.12,.92,.03);g.scale.setScalar(s);return g;}
export function house(parent,x,z,w=5,h=5,d=5,color=0xe9c28b,rot=0){const g=group(parent,x,0,z);g.rotation.y=rot;box(g,w,h,d,color,0,h/2,0);box(g,w+.2,.3,d+.25,0xf2e6c9,0,h,0);box(g,.85,1.7,.12,0x5c8d83,0,.85,d/2+.02);box(g,.1,.08,.08,0xf2d482,.26,.9,d/2+.13);for(const xx of [-w*.28,w*.28]){box(g,1.05,1.1,.14,0xfff0d1,xx,h*.68,d/2+.03);box(g,.8,.84,.16,0x9cc8c5,xx,h*.68,d/2+.05);box(g,1.2,.15,.4,0xf4dba5,xx,h*.68-.65,d/2+.1);}box(g,w+.15,.2,1.15,0xeab08d,0,2.25,d/2+.4);return g;}
export function avatar(parent,color=0x77b9a2,hat=0xecc46d){const root=group(parent),body=group(root),skin=0xf3d49b;const torso=box(body,.72,.68,.43,color,0,1.12,0);const head=box(body,.57,.57,.55,skin,0,1.79,.02);box(body,.65,.16,.64,hat,0,2.12,.01);box(body,.64,.06,.3,hat,0,2.02,.35);box(body,.06,.085,.035,0x28493f,-.12,1.82,.311);box(body,.06,.085,.035,0x28493f,.12,1.82,.311);box(body,.12,.035,.03,0xb88358,0,1.66,.31);const arms=[];for(const s of [-1,1]){const arm=group(body,s*.49,1.37,0);box(arm,.24,.49,.28,color,0,-.22,0);box(arm,.23,.2,.27,skin,0,-.56,0);arms.push(arm);}const legs=[];for(const s of [-1,1]){const leg=group(body,s*.2,.8,0);box(leg,.26,.53,.3,0x476c63,0,-.24,0);box(leg,.3,.2,.45,0xfff5d7,0,-.68,.08);legs.push(leg);}const bag=box(body,.5,.52,.25,0xe6a16e,0,1.14,-.34);box(body,.55,.08,.28,0xf6ce87,0,1.32,-.36);inkGroup(body);return {root,body,torso,head,arms,legs,bag};}
export function mailbox(parent,x,y,z){const g=group(parent,x,y,z);box(g,.2,1.2,.2,0xa07c5e,0,.6,0);box(g,1.1,.8,.65,0x5aa8b3,0,1.35,0);box(g,1.18,.16,.72,0xffedc0,0,1.8,0);box(g,.65,.075,.04,0x2c665f,0,1.45,.34);box(g,.32,.25,.04,0xffe9b0,0,1.19,.34);const flag=box(g,.4,.23,.05,0xeaa16b,.73,1.75,0);box(g,.05,.55,.05,0x6e8c78,.56,1.6,0);return {root:g,flag};}
export function couch(parent){const g=group(parent);box(g,1.65,.28,.88,0x7eac83,0,.18,0);box(g,1.65,.75,.2,0x68916f,0,.58,-.36);box(g,.2,.5,.9,0x88b88a,-.82,.45,0);box(g,.2,.5,.9,0x88b88a,.82,.45,0);box(g,.68,.16,.7,0x9fc992,-.39,.4,0);box(g,.68,.16,.7,0x9fc992,.39,.4,0);inkGroup(g);return g;}
export function fridge(parent){const g=group(parent);box(g,.85,1.45,.7,0xf3ead1,0,.73,0);box(g,.79,.79,.08,0xe8ddc7,0,.52,.39);box(g,.79,.48,.08,0xfbf4df,0,1.19,.39);box(g,.055,.32,.07,0xa99e83,.29,.69,.45);inkGroup(g);return g;}
export function makeCart(parent){const root=group(parent),deck=group(root,0,.5,0);box(deck,1.9,.18,1.5,0xd99a63);box(deck,1.95,.13,1.55,0xf2cb92,0,.1,0);const wheels=[];for(const x of [-1.02,1.02])for(const z of [-.48,.48]){const w=cyl(root,.25,.15,0x46665d,x,.25,z);w.rotation.z=Math.PI/2;wheels.push(w);}box(root,.08,.85,.08,0x6b8b77,-.7,.83,-1.05);box(root,.08,.85,.08,0x6b8b77,.7,.83,-1.05);box(root,1.5,.08,.08,0x507463,0,1.23,-1.05);const cargo=group(deck,0,.18,0);const sofa=couch(cargo);const refrigerator=fridge(cargo);refrigerator.position.set(.1,.86,0);const pot=plant(cargo,-.12,2.35,0,1.25);inkGroup(root);return {root,deck,cargo,wheels,items:[pot,refrigerator,sofa]};}
export class World{
 constructor(canvas){this.canvas=canvas;this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.NoToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.setClearColor(0xc4e0d5);this.scene=new T.Scene();this.scene.background=new T.Color(0xc4e0d5);this.scene.fog=new T.Fog(0xc4e0d5,50,125);this.camera=new T.OrthographicCamera(-10,10,12,-12,.1,160);this.camera.position.set(16,23,28);this.look=new T.Vector3();this.hemi=new T.HemisphereLight(0xf7fff1,0x718d9c,1.0);this.scene.add(this.hemi);this.sunOffset=new T.Vector3(-18,20,14);this.sun=new T.DirectionalLight(0xffefcf,1.8);this.sun.position.set(-18,20,14);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:.5,far:85});this.sun.shadow.bias=-.0005;this.sun.shadow.normalBias=.035;this.scene.add(this.sun,this.sun.target);this.sceneRoot=new T.Group();this.scene.add(this.sceneRoot);this.fx=new T.Group();this.scene.add(this.fx);this.particles=[];this.shake=0;this.resize();}
 resize(){const {width,height}=this.canvas.getBoundingClientRect();this.renderer.setSize(width,height,false);const mobile=innerWidth<=900||(innerHeight<=500&&innerWidth<=1050)||(matchMedia('(pointer: coarse)').matches&&innerWidth<=1200);const ratio=Math.min(devicePixelRatio,mobile?1.25:1.7);if(this.renderer.getPixelRatio()!==ratio)this.renderer.setPixelRatio(ratio);const shadowSize=mobile?1024:2048;if(this.sun.shadow.mapSize.x!==shadowSize){this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.sun.shadow.mapSize.set(shadowSize,shadowSize);}const aspect=width/height,h=mobile&&aspect>1.3?12:Math.max(15.5,12/aspect);this.camera.left=-h*aspect/2;this.camera.right=h*aspect/2;this.camera.top=h/2;this.camera.bottom=-h/2;this.camera.updateProjectionMatrix();}
 clear(){for(const p of this.particles)this.fx.remove(p.mesh);this.particles=[];while(this.sceneRoot.children.length){const a=this.sceneRoot.children.pop();a.parent=null;a.traverse(n=>{if(n.isSprite){n.material.map?.dispose();n.material.dispose();}});}this.shake=0;}
 burst(x,y,z,color=0xeac16c,count=14){for(let i=0;i<count;i++){const mesh=box(this.fx,.1+Math.random()*.09,.1,.1,color,x,y,z);mesh.castShadow=false;this.particles.push({mesh,vx:(Math.random()-.5)*5,vy:2+Math.random()*4,vz:(Math.random()-.5)*5,life:.6+Math.random()*.4});}}
 update(dt){for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;p.vy-=10*dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.mesh.rotation.x+=dt*3;p.mesh.rotation.z+=dt*4;p.mesh.scale.multiplyScalar(Math.max(.8,1-dt*.5));if(p.life<=0){this.fx.remove(p.mesh);this.particles.splice(i,1);}}this.shake=Math.max(0,this.shake-dt*1.8);}
 follow(x,y,z,dt,mode='stretch',snap=false){const target=new T.Vector3(x,y+1,z-(mode==='stretch'?3.2:2.5));this.look.lerp(target,snap?1:1-Math.exp(-dt*5));this.camera.position.copy(this.look).add(new T.Vector3(13,19,23));if(this.shake){this.camera.position.x+=Math.sin(performance.now()*.07)*this.shake*.13;this.camera.position.y+=Math.cos(performance.now()*.08)*this.shake*.1;}this.camera.lookAt(this.look);this.sun.position.copy(this.look).add(this.sunOffset);this.sun.target.position.copy(this.look);this.sun.target.updateMatrixWorld();}
 render(){this.renderer.render(this.scene,this.camera);}
 project(x,y,z){const p=new T.Vector3(x,y,z).project(this.camera);return {x:(p.x*.5+.5)*this.canvas.clientWidth,y:(-.5*p.y+.5)*this.canvas.clientHeight};}
}
export class AudioFX{
 constructor(){this.enabled=false;this.context=null;this.last=0;}
 unlock(){if(!this.context){const C=window.AudioContext||window.webkitAudioContext;if(C)this.context=new C();}this.context?.resume().catch(()=>{});}
 toggle(){this.unlock();this.enabled=!this.enabled;return this.enabled;}
 tone(freq=440,duration=.08,type='sine',gain=.05,delay=0,end){if(!this.enabled||!this.context)return;const t=this.context.currentTime+delay,osc=this.context.createOscillator(),g=this.context.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,t);if(end)osc.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(g);g.connect(this.context.destination);osc.start(t);osc.stop(t+duration+.02);}
 play(type){if(type==='launch'){this.tone(180,.2,'sine',.08,0,900);}else if(type==='checkpoint'||type==='delivery'){[523,659,784].forEach((n,i)=>this.tone(n,.14,'sine',.07,i*.08));}else if(type==='complete'){[523,659,784,1047].forEach((n,i)=>this.tone(n,.25,'triangle',.06,i*.12));}else if(type==='fall'||type==='cargoFall'){this.tone(380,.3,'triangle',.06,0,120);}else if(type==='bump'||type==='collision'){this.tone(120,.1,'triangle',.08,0,70);}else this.tone(440,.05,'sine',.03);}
 music(time,mode){if(!this.enabled||!this.context)return;const beat=Math.floor(time/.4);if(beat===this.last)return;this.last=beat;const melody=mode==='stretch'?[523,0,659,784,0,659,587,0,440,523,0,659,587,0,440,0]:[392,0,494,587,0,494,440,0,330,392,0,494,440,0,330,0];const n=melody[beat%melody.length];if(n)this.tone(n,.18,'sine',.014);if(beat%4===0)this.tone(mode==='stretch'?131:98,.32,'triangle',.014);}
}
