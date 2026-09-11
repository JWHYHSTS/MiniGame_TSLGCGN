(function(T){
  'use strict';
  let memory={};
  const fresh=()=>({version:1,maps:{},unlocked:1,bossClear:false,achievements:[],settings:{master:.65,music:.45,sfx:.75,muted:false,reducedMotion:false},session:null,totals:{score:0,seconds:0,correct:0,attempts:0,maxCombo:0}});
  function safeRead(key){try{return localStorage.getItem(key);}catch(_){return memory[key]||null;}}
  function safeWrite(key,value){memory[key]=value;try{localStorage.setItem(key,value);return true;}catch(_){return false;}}
  function load(){
    try{
      const d=JSON.parse(safeRead(T.CONFIG.SAVE_KEY));if(!d||d.version!==1)return fresh();
      const f=fresh();d.maps=d.maps&&typeof d.maps==='object'?d.maps:{};d.settings={...f.settings,...d.settings};
      for(const key of ['master','music','sfx'])if(!Number.isFinite(d.settings[key])||d.settings[key]<0||d.settings[key]>1)d.settings[key]=f.settings[key];
      d.unlocked=Math.max(1,Math.min(6,Number(d.unlocked)||1));d.achievements=Array.isArray(d.achievements)?d.achievements:[];
      d.totals={...f.totals,...d.totals};return {...f,...d};
    }catch(_){return fresh();}
  }
  const save=d=>safeWrite(T.CONFIG.SAVE_KEY,JSON.stringify(d));
  const reset=()=>{const d=fresh();save(d);return d;};
  function record(d,r){
    const old=d.maps[r.map]||{};
    d.maps[r.map]={stars:Math.max(old.stars||0,r.stars),bestScore:Math.max(old.bestScore||0,r.score),bestTime:Math.min(old.bestTime||Infinity,r.seconds),accuracy:Math.max(old.accuracy||0,r.accuracy),bestCombo:Math.max(old.bestCombo||0,r.maxCombo),plays:(old.plays||0)+1,last:r};
    d.unlocked=Math.max(d.unlocked,Math.min(6,r.map+1));if(r.map===6)d.bossClear=true;
    d.totals.score+=r.score;d.totals.seconds+=r.seconds;d.totals.correct+=r.correct;d.totals.attempts+=r.attempts;d.totals.maxCombo=Math.max(d.totals.maxCombo,r.maxCombo);d.session=null;save(d);
  }
  T.Storage={fresh,load,save,reset,record};
})(Trig);
