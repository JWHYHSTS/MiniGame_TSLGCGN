(function(T){
  'use strict';
  class Scenery{
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.scene='menu';this.progress=0;this.active=true;this.low=false;this.phase=0;this.last=0;this.burstParticles=[];this.mouse={x:0,y:0};window.addEventListener('resize',()=>this.resize());window.addEventListener('pointermove',e=>{this.mouse={x:e.clientX/window.innerWidth-.5,y:e.clientY/window.innerHeight-.5};},{passive:true});this.resize();requestAnimationFrame(t=>this.frame(t));}
    resize(){this.w=window.innerWidth;this.h=window.innerHeight;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=this.w*d;this.canvas.height=this.h*d;this.ctx.setTransform(d,0,0,d,0,0);}
    set(scene,p=0){this.scene=scene;this.progress=p;document.body.dataset.scene=scene;}
    burst(color='#75efda',x=this.w*.5,y=this.h*.5){if(this.low)return;for(let i=0;i<28;i++)this.burstParticles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.6)*6,life:1,color});}
    poly(points,color){const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();}
    frame(now){
      requestAnimationFrame(t=>this.frame(t));if(document.hidden||now-this.last<(this.low?120:32))return;const dt=Math.min(50,now-this.last);this.last=now;if(this.active&&!this.low)this.phase+=dt/1000;const t=this.phase,c=this.ctx,w=this.w,h=this.h;
      c.clearRect(0,0,w,h);
      if(['gates','canyon','boss'].includes(this.scene)){
        const colors=this.scene==='canyon'?['#663f43','#392c40','#171d30']:this.scene==='gates'?['#3d544a','#243d37','#102924']:['#36304e','#221d38','#131729'];
        for(let k=0;k<3;k++){
          const points=[[0,h]];for(let i=0;i<=12;i++)points.push([i*w/12+this.mouse.x*(k+1)*6,h*(.26+k*.15)+Math.sin(i*2.7+k)*h*.11]);points.push([w,h]);this.poly(points,colors[k]);
        }
      }
      if(this.scene==='camp'||this.scene==='menu'||this.scene==='world'){
        const x=w*.095,y=h*.84;c.save();c.globalAlpha=.55;const glow=c.createRadialGradient(x,y,2,x,y,60);glow.addColorStop(0,'#ffb25b');glow.addColorStop(1,'#ffb25b00');c.fillStyle=glow;c.fillRect(x-60,y-60,120,120);c.restore();
        for(let i=0;i<5;i++){c.fillStyle=i%2?'#ffdb87':'#df744e';c.beginPath();c.ellipse(x+Math.sin(t*4+i)*5,y-i*4,6-i*.6,12+Math.sin(t*5+i)*4,Math.sin(t+i)*.3,0,Math.PI*2);c.fill();}
      }
      if(this.scene==='gates'){
        for(let i=0;i<3;i++){c.save();c.translate(w*(.17+i*.32),h*.47);c.rotate((i%2?-1:1)*t*.045);c.strokeStyle='#e9b66619';c.lineWidth=4;c.beginPath();c.arc(0,0,90+i*20,0,Math.PI*2);c.stroke();for(let j=0;j<12;j++){c.rotate(Math.PI/6);c.strokeRect(85+i*20,-5,14,10);}c.restore();}
      }
      if(this.scene==='canyon'){
        this.poly([[0,h],[0,h*.76],[w*.17,h*.68],[w*.32,h*.75],[w*.37,h],[0,h]],'#14222d');this.poly([[w*.67,h],[w*.74,h*.73],[w*.9,h*.65],[w,h*.73],[w,h]],'#152530');
        c.strokeStyle='#c8dbce';c.lineWidth=2;for(let i=0;i<7;i++){let x=(i*w/7+t*60)%w,y=h*(.28+i*.07);c.beginPath();c.moveTo(x,y);c.lineTo(x+28,y-4);c.stroke();}
      }
      if(this.scene==='peaks'){
        c.save();c.globalAlpha=.12+.03*Math.sin(t);c.strokeStyle='#b6ecff';c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.moveTo(w*.19,h*(.57+i*.01));c.quadraticCurveTo(w*.5,h*.2,w*.8,h*(.57+i*.01));c.stroke();}c.restore();
      }
      const tint=this.scene==='temple'?'#d1b9ff':this.scene==='boss'?'#f6c669':'#b1f5f0';
      for(let i=0;i<(this.low?10:33);i++){
        const x=(i*137.73+Math.sin(t*.3+i)*35+w)%w,y=(i*79.87-t*(5+i%4)+h*30)%h;
        c.globalAlpha=.14+Math.sin(t+i)*.1;c.fillStyle=tint;c.beginPath();c.arc(x,y,i%5===0?2:1,0,Math.PI*2);c.fill();
      }c.globalAlpha=1;
      this.burstParticles=this.burstParticles.filter(p=>p.life>0);for(const p of this.burstParticles){if(this.active){p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.life-=.02;}c.globalAlpha=p.life;c.fillStyle=p.color;c.fillRect(p.x,p.y,3,3);}c.globalAlpha=1;
    }
  }
  T.Scenery=Scenery;
})(Trig);
