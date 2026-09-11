(function(T){
  'use strict';
  const U=T.UI,M=T.MathEngine;
  class Game{
    constructor(app,map,resume=false,preview=false){
      this.app=app;this.preview=preview;this.paused=false;this.busy=false;this.disposer=null;
      const saved=resume?app.save.session:null;
      this.run=saved||{map,ids:T.Questions.pickRun(app.bank,map),index:0,score:0,streak:0,maxCombo:0,attempts:0,correct:0,seconds:0,qSeconds:0,hearts:3,hintUsed:false,wrong:false,solved:false,scratch:''};
      this.map=T.CONFIG.MAPS[this.run.map-1];this.boss=this.run.map===6?new T.Boss(this):null;
    }
    mount(){
      const r=this.run,m=this.map;this.app.root.innerHTML=`<section class="game-screen map-${r.map} ${r.map===6?'boss-mode':''}"><header class="game-hud"><div class="energy"><span class="eyebrow">NĂNG LƯỢNG</span><div id="hearts"></div></div><div class="hud-map"><span class="eyebrow">${r.map===6?'ĐẤU TRƯỜNG ĐỈNH NÚI':`CHẶNG ${String(r.map).padStart(2,'0')} / 05`}</span><h1>${m.name}</h1><div class="hud-progress"><i></i></div><span id="progress-label"></span></div><div class="score-hud"><span class="eyebrow">SCORE</span><strong id="score">0</strong><span id="combo">CHUỖI x0</span></div></header><div class="game-subbar"><button class="text-button" data-world>${U.icon('back')}Bản đồ</button><span id="game-timer">00:00</span><span class="game-title">${m.title}</span><button class="icon-button" data-pause aria-label="Tạm dừng">${U.icon('pause')}</button></div>${this.preview?'<div class="preview-notice">CHƠI THỬ CỦA GIÁO VIÊN · không ghi thành tích</div>':''}<div id="boss-area"></div><div class="mission-head"><span class="eyebrow" id="mission-label"></span><button class="hint-button" data-hint>${U.icon('hint')}GỢI Ý <small>−10đ</small></button></div><div id="challenge" class="challenge"></div><div id="feedback" class="feedback" aria-live="polite" aria-atomic="true"></div><div class="journey-strip"><div class="journey-rope"></div><div class="journey-segments">${r.ids.map((_,i)=>`<i data-segment="${i}"></i>`).join('')}</div><div class="journey-explorer">${U.explorer()}</div><div class="journey-destination">${U.icon('flag')}</div></div></section>`;
      this.app.root.querySelector('.energy .eyebrow').textContent='NĂNG LƯỢNG';this.app.root.querySelector('.hud-map .eyebrow').textContent=r.map===6?'ĐẤU TRƯỜNG ĐỈNH NÚI':`CHẶNG ${String(r.map).padStart(2,'0')} / 05`;
      this.app.root.querySelector('[data-world]').onclick=()=>this.pause('world');this.app.root.querySelector('[data-pause]').onclick=()=>this.pause();this.app.root.querySelector('[data-hint]').onclick=()=>this.hint();
      if(this.boss)this.boss.mount(this.app.root.querySelector('#boss-area'));
      this.app.scenery.set(m.scene,r.index/r.ids.length);this.app.audio.setScene(m.scene);this.renderQuestion();
      this.timer=setInterval(()=>this.tick(),1000);this.checkpoint();
    }
    renderQuestion(){
      this.disposer?.();const r=this.run;this.q=this.app.bank.find(q=>q.id===r.ids[r.index]);
      if(!this.q||this.q.status!=='validated'||!T.Validator.validateQuestion(this.q).passed){
        const candidates=this.app.bank.filter(q=>q.map===r.map&&q.status==='validated'&&(!this.boss||q.phase===Math.floor(r.index/3)+1)&&!r.ids.includes(q.id));
        const replacement=candidates.find(q=>T.Validator.validateQuestion(q).passed);if(!replacement){this.paused=true;U.modal('Chưa thể mở thử thách','<p>Dữ liệu câu hỏi chưa đạt kiểm định. Bạn có thể trở về bản đồ; tiến trình hiện có vẫn được giữ.</p><button class="primary" id="validation-home">VỀ BẢN ĐỒ</button>',{close:false});document.getElementById('validation-home').onclick=()=>{U.closeModal();this.app.world();};return;}
        r.ids[r.index]=replacement.id;this.q=replacement;
      }
      const host=document.createElement('div');host.className='challenge';host.id='challenge';document.getElementById('challenge').replaceWith(host);
      this.disposer=T.Mechanics[this.q.type](this.q,host,this);this.busy=!!r.solved;
      document.getElementById('mission-label').textContent=`${this.boss?`PHASE ${this.q.phase} · `:''}THỬ THÁCH ${String(r.index+1).padStart(2,'0')} / ${r.ids.length} · ${{easy:'KHỞI ĐỘNG',normal:'CHINH PHỤC',challenge:'BỨT PHÁ'}[this.q.difficulty]}`;
      document.getElementById('feedback').innerHTML='';document.getElementById('feedback').className='feedback';
      if(r.solved)this.successFeedback();else if(r.hintUsed)this.showHint();this.updateHUD();
    }
    tick(){if(this.paused||document.hidden)return;this.run.seconds++;if(!this.busy)this.run.qSeconds++;document.getElementById('game-timer').textContent=U.time(this.run.seconds);if(this.boss&&!this.busy)this.boss.tick();if(this.run.seconds%5===0)this.checkpoint();}
    answer(value){
      if(this.busy||this.paused)return false;
      const r=this.run,q=this.q;
      const ok=q.type==='calculate-ratio'||q.type==='special-angle'?M.equal(value,q.answer):JSON.stringify(value)===JSON.stringify(q.answer);
      r.attempts++;
      if(ok){
        this.busy=true;r.solved=true;r.correct++;r.streak++;r.maxCombo=Math.max(r.maxCombo,r.streak);
        r.lastGain=T.Scoring.points({streak:r.streak,wrong:r.wrong,hint:r.hintUsed,seconds:r.qSeconds});r.score+=r.lastGain;
        this.app.audio.sfx(r.streak>=5?'combo':'correct');this.app.audio.sfx({1:'bridge',2:'gate',3:'bridge',4:'crystal',5:'bridge'}[r.map]||'hit');this.app.scenery.burst(this.map.color);
        document.getElementById('challenge').classList.add('solved');const edge=typeof q.answer==='string'?document.querySelector(`[data-edge="${q.answer}"]`):null;edge?.classList.add('edge-correct');
        this.boss?.hit(r.streak);this.successFeedback();
      }else{
        r.streak=0;r.wrong=true;this.app.audio.sfx('wrong');const f=document.getElementById('feedback');f.className='feedback incorrect';f.innerHTML=`${U.icon('close')}<div><strong>CHƯA ĐÚNG · THỬ LẠI</strong><p>${U.e(q.explanation)}</p></div>`;
        document.getElementById('challenge').classList.remove('shake');void document.getElementById('challenge').offsetWidth;document.getElementById('challenge').classList.add('shake');this.boss?.attack(true);
      }
      this.updateHUD();this.checkpoint();return ok;
    }
    successFeedback(){const r=this.run,f=document.getElementById('feedback');f.className='feedback correct';f.innerHTML=`${U.icon('check')}<div><strong>CHÍNH XÁC! <span>+${r.lastGain||0} ĐIỂM</span></strong><p>${U.e(this.q.explanation)}</p></div><button class="primary small" data-next>${r.index===r.ids.length-1?'HOÀN THÀNH':'TIẾN LÊN'}${U.icon('arrow')}</button>`;f.querySelector('[data-next]').onclick=()=>this.next();}
    next(){
      if(!this.run.solved||this.paused)return;const r=this.run;r.index++;r.solved=false;r.hintUsed=false;r.wrong=false;r.qSeconds=0;this.busy=false;this.checkpoint();
      if(r.index>=r.ids.length){this.finish();return;}this.renderQuestion();this.app.scenery.progress=r.index/r.ids.length;
    }
    showHint(){const f=document.getElementById('feedback');f.className='feedback hint';f.innerHTML=`${U.icon('hint')}<div><strong>GỢI Ý</strong><p>${U.e(this.q.hint)}</p></div>`;}
    hint(){if(this.busy||this.paused)return;if(!this.run.hintUsed)this.run.hintUsed=true;this.showHint();this.checkpoint();}
    updateHUD(){
      const r=this.run;if(!document.getElementById('score'))return;
      document.getElementById('score').textContent=r.score.toLocaleString('vi-VN');document.getElementById('combo').textContent=`CHUỖI x${r.streak}${r.streak>=2?` · ×${T.Scoring.multiplier(r.streak)} điểm`:''}`;
      document.getElementById('combo').classList.toggle('hot',r.streak>=5);document.getElementById('progress-label').textContent=`${r.index+(r.solved?1:0)} / ${r.ids.length}`;document.querySelector('.hud-progress i').style.width=(r.index+(r.solved?1:0))/r.ids.length*100+'%';
      document.getElementById('hearts').innerHTML=[0,1,2].map(i=>U.icon('heart',r.hearts<=i?'empty-heart':r.hearts<i+1?'partial-heart':'')).join('');document.getElementById('hearts').setAttribute('aria-label',`${r.hearts} trên 3 tim năng lượng`);
      document.getElementById('game-timer').textContent=U.time(r.seconds);document.querySelectorAll('[data-segment]').forEach(el=>el.classList.toggle('built',Number(el.dataset.segment)<r.index+(r.solved?1:0)));document.querySelector('.journey-explorer').style.left=(r.index+(r.solved?1:0))/r.ids.length*90+'%';
    }
    checkpoint(){if(this.preview)return;this.app.save.session=JSON.parse(JSON.stringify(this.run));this.app.persist();}
    setPause(flag){this.paused=flag;this.app.scenery.active=!flag;document.body.classList.toggle('paused',flag);if(flag)this.app.audio.pause();else this.app.audio.resume();this.checkpoint();}
    pause(destination){
      if(this.paused)return;this.setPause(true);
      U.modal('Tạm dừng hành trình',`<div class="pause-actions"><button class="primary" data-resume>${U.icon('play')}TIẾP TỤC</button><button class="secondary" data-replay>${U.icon('reset')}CHƠI LẠI MAP</button><button class="secondary" data-audio>${U.icon('volume')}ÂM THANH</button><button class="secondary" data-map>${U.icon('compass')}VỀ BẢN ĐỒ</button><button class="text-button" data-menu>MENU CHÍNH</button><p>Tiến trình thử thách hiện tại được tự động lưu.</p></div>`,{afterClose:()=>this.setPause(false)});
      const d=document.getElementById('dialog');d.querySelector('[data-resume]').onclick=()=>U.closeModal();
      d.querySelector('[data-replay]').onclick=()=>{U.closeModal();this.app.confirmReplay(this.run.map,this.preview);};d.querySelector('[data-audio]').onclick=()=>{U.closeModal();this.app.settings();};d.querySelector('[data-map]').onclick=()=>{U.closeModal();this.app.world();};d.querySelector('[data-menu]').onclick=()=>{U.closeModal();this.app.menu();};
    }
    recover(){this.setPause(true);U.modal('Trạm tiếp năng lượng',`<p>Hãy nghỉ một nhịp rồi thử lại. Các phong ấn đã phá và tiến trình giải câu hỏi vẫn được giữ.</p><button class="primary" data-recover>${U.icon('heart')}NẠP 3 TIM · TIẾP TỤC</button>`,{close:false});document.querySelector('[data-recover]').onclick=()=>{this.run.hearts=3;this.run.boss.attackAt=this.run.boss.age+24;U.closeModal();this.setPause(false);this.updateHUD();};}
    finish(){
      const r=this.run,result={map:r.map,score:r.score,seconds:r.seconds,correct:r.correct,attempts:r.attempts,accuracy:T.Scoring.accuracy(r.correct,r.attempts),maxCombo:r.maxCombo};result.stars=T.Scoring.stars(result);
      if(!this.preview){T.Storage.record(this.app.save,result);const added=T.Achievements.check(this.app.save,result);this.app.persist();added.forEach((a,i)=>setTimeout(()=>{U.toast(`MỞ THÀNH TÍCH · ${a.name}`);this.app.audio.sfx('achievement');},i*700));}
      this.dispose();this.app.result(result,this.preview);
    }
    dispose(){clearInterval(this.timer);this.disposer?.();this.app.scenery.active=true;document.body.classList.remove('paused');}
  }
  T.Game=Game;
})(Trig);
