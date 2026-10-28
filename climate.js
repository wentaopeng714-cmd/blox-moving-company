export const CLIMATES=[
 {name:'晴天',icon:'☀',sky:0xa8dfcf,tint:[1,1,1],shade:[1,1,1],direction:[-18,20,14],contrast:1,rain:0},
 {name:'多云',icon:'☁',sky:0xb9d0de,tint:[.94,.99,1.06],shade:[1.04,1.08,1.15],direction:[-15,25,12],contrast:.68,rain:0},
 {name:'细雨',icon:'☂',sky:0x9fbdd2,tint:[.88,.97,1.08],shade:[1.03,1.09,1.21],direction:[-13,24,16],contrast:.52,rain:.7},
 {name:'暖色傍晚',icon:'◒',sky:0xf2c5ac,tint:[1.08,.92,.82],shade:[1.12,.95,1.17],direction:[-25,14,9],contrast:.93,rain:0}
];
export function climateAt(time){const phase=Math.max(0,time||0)/75,index=Math.floor(phase)%4,next=(index+1)%4,blend=Math.max(0,Math.min(1,((phase%1)-.76)/.24));return {index,next,blend:blend*blend*(3-2*blend)};}
