(function(T){
  'use strict';
  const U=T.UI;
  const shields=['SIN','COS','TAN','COT','90° CORE'];
  function guardian(){return `<svg class="guardian" viewBox="0 0 300 230" role="img" aria-label="Guardian với lõi năng lượng"><defs><radialGradient id="core-glow"><stop stop-color="#fff7c9"/><stop offset=".35" stop-color="#8cfaff"/><stop offset="1" stop-color="#458dcb" stop-opacity="0"/></radialGradient></defs><g class="guardian-orbit"><ellipse cx="150" cy="100" rx="124" ry="67" fill="none" stroke="#90daf888" stroke-width="2" stroke-dasharray="13 8"/><ellipse cx="150" cy="100" rx="98" ry="100" fill="none" stroke="#c1abfa66" stroke-width="2"/></g><g class="guardian-body"><path d="m108 55 18-31h48l18 31-12 31h-61Z" fill="#658998" stroke="#b3e1d5" stroke-width="3"/><path d="m98 97 20-15h65l22 21-16 61-41 21-43-23Z" fill="#345363" stroke="#82afa7" stroke-width="3"/><path d="m73 96-25 13-14 49 26 21 19-20 13-42m128-21 25 13 14 49-26 21-19-20-13-42" fill="#527380" stroke="#91b3ab" stroke-width="3"/><path d="m113 161-13 43 25 9 22-36m37-16 12 43-25 9-22-36" fill="#2d4b59" stroke="#78a5a4" stroke-width="3"/><path d="M126 57h13m24 0h13" stroke="#b4ffff" stroke-width="6"/><circle cx="150" cy="119" r="47" fill="url(#core-glow)"/><circle cx="150" cy="119" r="18" fill="#dbffff"/><path d="M141 110h18v18h-18" fill="none" stroke="#38627a" stroke-width="3"/></g></svg>`;}
  class Boss{
    constructor(game){this.game=game;const r=game.run;if(!r.boss)r.boss={hp:300,phase:1,age:0,lane:1,danger:-1,shield:3,blocking:false,attackAt:24};this.data=r.boss;}
    mount(host){
      const b=this.data;
      host.innerHTML=`<div class="boss-combat entrance"><div class="boss-details"><span class="eyebrow">GUARDIAN OF 90°</span><div class="boss-hp-label"><b data-shield-name>${shields[b.phase-1]}</b><span data-hp>${b.hp} / 300</span></div><div class="boss-hp"><i style="width:${b.hp/3}%"></i></div><div class="boss-seals">${shields.map((s,i)=>`<span class="${i<b.phase-1?'broken':i===b.phase-1?'active':''}">${s}</span>`).join('')}</div><p data-boss-message>Giải phong ấn để tấn công. Đổi vị trí khi thấy cảnh báo.</p></div><div class="guardian-stage">${guardian()}<div class="energy-bolt"></div></div><div class="combat-controls"><div class="combat-lanes" aria-label="Vị trí né đòn">${[0,1,2].map(i=>`<button data-lane="${i}" class="combat-lane ${i===b.lane?'current':''}" aria-label="Vị trí ${i+1}">${i===b.lane?U.explorer():`<span>${i+1}</span>`}</button>`).join('')}</div><button class="secondary shield-button" data-block>${U.icon('shield')}ĐỠ ĐÒN <span>${b.shield}/3</span></button></div></div>`;
      this.host=host;host.addEventListener('click',ev=>{const lane=ev.target.closest('[data-lane]');if(lane)this.move(Number(lane.dataset.lane));if(ev.target.closest('[data-block]'))this.block();});this.paint();
    }
    move(lane){if(this.game.paused||this.game.busy)return;this.data.lane=lane;this.game.app.audio.sfx('dodge');this.paint();this.game.checkpoint();}
    block(){const b=this.data;if(this.game.paused||this.game.busy||b.blocking)return;if(b.shield<=0){U.toast('Trả lời đúng để nạp khiên.');return;}b.blocking=true;b.shield--;this.paint();this.game.checkpoint();}
    tick(){
      const b=this.data;b.age++;
      if(b.age===b.attackAt-4){b.danger=(Math.floor(b.age/24)+b.phase)%3;this.paint();}
      if(b.age>=b.attackAt){this.attack(false);b.attackAt=b.age+24;}
    }
    attack(fromWrong){
      const b=this.data;
      if(b.blocking){b.blocking=false;this.say('Khiên đã chặn đòn năng lượng!');this.game.app.audio.sfx('shield');}
      else if(fromWrong||b.lane===b.danger){this.game.run.hearts=Math.max(0,this.game.run.hearts-(fromWrong?.25:.5));this.say(fromWrong?'Guardian phản công · năng lượng −¼ tim':'Sóng năng lượng · −½ tim');this.game.app.audio.sfx('attack');this.host.querySelector('.boss-combat')?.classList.add('boss-attacking');setTimeout(()=>this.host?.querySelector('.boss-combat')?.classList.remove('boss-attacking'),650);}
      else{this.say('Né thành công! Giữ nhịp giải phong ấn.');this.game.app.audio.sfx('dodge');}
      b.danger=-1;this.paint();this.game.updateHUD();this.game.checkpoint();if(this.game.run.hearts<=0)this.game.recover();
    }
    hit(streak){
      const b=this.data,k=this.game.run.index%3,phase=Math.floor(this.game.run.index/3)+1,floor=300-phase*60;
      const damage=k===2?b.hp-floor:Math.min(b.hp-floor-1,15+Math.min(8,streak));b.hp=Math.max(floor,b.hp-damage);b.shield=Math.min(3,b.shield+1);b.blocking=false;this.game.run.hearts=Math.min(3,this.game.run.hearts+.25);b.danger=-1;b.attackAt=b.age+24;
      const el=this.host.querySelector('.boss-combat');el.classList.add('boss-hit');setTimeout(()=>el?.classList.remove('boss-hit'),900);
      this.say(`${streak>=5?'CRITICAL! ':''}−${damage} HP · ${k===2?'Phong ấn đã vỡ!':'Đòn năng lượng trúng đích!'}`);this.game.app.audio.sfx(k===2?'shield':'hit');
      if(k===2&&phase<5){b.phase=phase+1;el.classList.add('phase-change');setTimeout(()=>el?.classList.remove('phase-change'),1200);}
      if(b.hp===0){el.classList.add('boss-defeated');this.game.app.audio.sfx('victory');}
      this.paint();
    }
    say(text){this.host.querySelector('[data-boss-message]').textContent=text;}
    paint(){
      if(!this.host)return;const b=this.data;
      this.host.querySelector('[data-hp]').textContent=`${b.hp} / 300`;this.host.querySelector('.boss-hp i').style.width=b.hp/3+'%';this.host.querySelector('[data-shield-name]').textContent=shields[b.phase-1];
      this.host.querySelectorAll('.boss-seals span').forEach((el,i)=>{el.classList.toggle('broken',i<b.phase-1);el.classList.toggle('active',i===b.phase-1);});
      this.host.querySelectorAll('[data-lane]').forEach(el=>{const i=Number(el.dataset.lane);el.classList.toggle('current',i===b.lane);el.classList.toggle('danger',i===b.danger);el.innerHTML=i===b.lane?U.explorer():`<span>${i===b.danger?'!':i+1}</span>`;});
      const block=this.host.querySelector('[data-block]');block.classList.toggle('blocking',b.blocking);block.querySelector('span').textContent=b.blocking?'ĐÃ SẴN SÀNG':`${b.shield}/3`;
      if(b.danger>=0)this.say(`CẢNH BÁO: vị trí ${b.danger+1}! Chuyển vị trí hoặc đỡ đòn.`);
    }
  }
  T.Boss=Boss;
})(Trig);
