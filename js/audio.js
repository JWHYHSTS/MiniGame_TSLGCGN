(function(T){
  'use strict';
  /* Original procedural scores. No network, samples, or external music required. */
  const scores={menu:{bpm:78,root:48,notes:[0,7,12,14,16,14,12,7],wave:'triangle'},camp:{bpm:88,root:55,notes:[0,4,7,12,7,4,2,7],wave:'sine'},gates:{bpm:64,root:45,notes:[0,3,7,10,7,3,0,-5],wave:'triangle'},canyon:{bpm:76,root:50,notes:[0,7,10,7,3,7,12,10],wave:'sine'},temple:{bpm:72,root:60,notes:[0,7,14,12,19,14,7,12],wave:'sine'},peaks:{bpm:60,root:57,notes:[0,5,12,16,12,7,5,7],wave:'sine'},boss:{bpm:120,root:38,notes:[0,0,7,3,0,10,7,3],wave:'triangle'},victory:{bpm:96,root:55,notes:[0,4,7,12,16,12,7,12],wave:'triangle'}};
  class AudioEngine{
    constructor(settings){this.settings=settings;this.ctx=null;this.scene='menu';this.step=0;this.timer=null;this.running=false;}
    async unlock(){
      try{
        if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.music=this.ctx.createGain();this.effects=this.ctx.createGain();this.music.connect(this.master);this.effects.connect(this.master);this.master.connect(this.ctx.destination);this.update(this.settings);}
        if(this.ctx.state==='suspended')await this.ctx.resume();this.running=true;if(!this.timer)this.schedule();
      }catch(_){this.running=false;}
    }
    update(s){this.settings=s;if(this.ctx){this.master.gain.setTargetAtTime(s.muted?0:s.master,this.ctx.currentTime,.05);this.music.gain.setTargetAtTime(s.music*.22,this.ctx.currentTime,.05);this.effects.gain.setTargetAtTime(s.sfx*.3,this.ctx.currentTime,.02);}}
    tone(note,duration=.4,type='sine',volume=.2,out='music',when=0){
      if(!this.ctx||this.ctx.state!=='running')return;
      const now=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=440*2**((note-69)/12);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(out==='music'?this.music:this.effects);o.start(now);o.stop(now+duration+.03);
    }
    schedule(){
      clearTimeout(this.timer);if(!this.running)return;
      const s=scores[this.scene]||scores.menu,d=60/s.bpm;
      this.tone(s.root+s.notes[this.step%8],d*1.7,s.wave,.28);
      if(this.step%4===0){this.tone(s.root-12,d*4,'sine',.18);this.tone(s.root+7,d*3,'sine',.08);}
      if(this.scene==='boss')this.tone(this.step%2?35:28,.17,'triangle',.35);
      if(this.scene==='temple'&&this.step%2===0)this.tone(s.root+24+s.notes[this.step%8],1.5,'sine',.08);
      this.step++;this.timer=setTimeout(()=>this.schedule(),d*1000);
    }
    setScene(scene){if(this.scene===scene)return;this.scene=scene;this.step=0;if(this.running)this.schedule();}
    pause(){this.running=false;clearTimeout(this.timer);this.timer=null;}
    resume(){this.unlock();}
    sfx(name){
      const patterns={button:[67],drag:[72],drop:[76,79],correct:[72,76,79],wrong:[47,43],combo:[76,81,84,88],bridge:[48,55,60],gate:[45,57,64,69],crystal:[84,88,91],unlock:[60,67,72,79],hit:[43,55],attack:[35,31],shield:[55,67,79,91],star:[79,84],achievement:[72,76,79,84],victory:[60,64,67,72,76,79],dodge:[69,81]};
      (patterns[name]||patterns.button).forEach((n,i)=>this.tone(n,.28,name==='wrong'||name==='attack'?'triangle':'sine',.4,'effects',i*.055));
    }
    status(){return {scene:this.scene,state:this.ctx?.state||'locked',running:this.running};}
  }
  T.AudioEngine=AudioEngine;
})(Trig);
