(function(T){
  'use strict';
  const U=T.UI,M=T.MathEngine,G=T.Triangle;
  function answerHTML(q){
    if(q.answer&&typeof q.answer==='object'&&'n' in q.answer)return M.valueHTML(q.answer);
    if(Array.isArray(q.answer))return U.fraction(q.answer[0]==='one'?'1':M.ROLES[q.answer[0]]||q.answer[0],q.answer[1]==='tan'?'tan α':M.ROLES[q.answer[1]]||q.answer[1]);
    if(q.type==='complementary')return M.trigHTML(q.answer.fn,q.answer.angle);
    if(q.type==='bound-ratio')return q.answer==='unit'?'0 < sin α < 1; 0 < cos α < 1':'tan α > 0; cot α > 0';
    return U.e(q.answer);
  }
  function questionExpression(q){
    if(q.type==='bound-ratio')return q.mathData.group==='sincos'?'sin α · cos α':'tan α · cot α';
    return M.trigHTML(q.mathData.fn||'cot',q.mathData.angle||'α');
  }
  function reviewHTML(q,debug=true){
    const t=q.mathData.triangle,v=T.Validator.validateQuestion(q),roles=t?G.roles(t):null;
    return `<div class="question-review" data-question-id="${q.id}"><span class="eyebrow">${q.id} · ${q.type}</span><h3>${U.e(q.prompt)}</h3>${t?G.renderTriangle(t,{showLengths:q.type==='calculate-ratio',hideHyp:q.mathData.hideHyp,id:'review-'+q.id}):`<div class="review-expression">${questionExpression(q)}</div>`}<div class="review-answer"><span>ĐÁP ÁN</span><strong>${answerHTML(q)}</strong></div><p class="review-explanation">${U.e(q.explanation)}</p>${debug?`<div class="validation-flags">${[['mathValidation','Dữ liệu'],['geometryValidation','Hình học'],['answerValidation','Đáp án'],['explanationValidation','Lời giải']].map(([k,label])=>`<span class="${v[k].passed?'pass':'fail'}">${v[k].passed?'✓':'✕'} ${label}</span>`).join('')}</div>${t?`<dl class="triangle-debug"><div><dt>rightAngleVertex</dt><dd>${t.rightAngleVertex}</dd></div><div><dt>targetAngleVertex</dt><dd>${t.targetAngleVertex}</dd></div>${Object.entries(roles).map(([k,val])=>`<div><dt>${k}</dt><dd>${val}</dd></div>`).join('')}</dl>`:''}<details><summary>Dữ liệu câu hỏi & kiểm định</summary><pre>${U.e(JSON.stringify({id:q.id,status:q.status,mathData:q.mathData,answer:q.answer,validation:v},null,2))}</pre></details>`:''}</div>`;
  }
  class Teacher{
    constructor(app){this.app=app;this.authenticated=false;this.map=1;}
    open(){
      if(this.authenticated){this.show();return;}const game=this.app.game;if(game)game.setPause(true);
      U.modal('Chế độ giáo viên',`<p>Nhập mật khẩu để xem câu hỏi, đáp án và kiểm định hình học.</p><form id="teacher-login"><label for="teacher-password">Mật khẩu giáo viên</label><input id="teacher-password" type="password" inputmode="numeric" autocomplete="off" required><p id="teacher-error" role="alert"></p><button class="primary" type="submit">${U.icon('teacher')}MỞ SỔ GIÁO VIÊN</button></form>`,{afterClose:()=>game?.setPause(false)});
      document.getElementById('teacher-login').onsubmit=ev=>{ev.preventDefault();if(document.getElementById('teacher-password').value!==T.CONFIG.TEACHER_PASSWORD){document.getElementById('teacher-error').textContent='Mật khẩu chưa đúng.';return;}this.authenticated=true;U.closeModal();this.show();};
    }
    show(){
      if(!this.authenticated)return;this.app.closeGame();this.app.scenery.set('menu');this.app.audio.setScene('menu');this.app.view='teacher';
      this.app.root.innerHTML=`<section class="teacher-screen"><header class="teacher-heading"><div><span class="eyebrow">TRIG EXPEDITION / GIÁO VIÊN</span><h1>Sổ tay hành trình</h1><p>${this.app.bank.length} câu đã kiểm định · SGK trang 66–70</p></div><div class="teacher-actions"><button class="secondary" data-unlock>${U.icon('lock')}Mở tất cả map</button><button class="secondary" data-reset>${U.icon('reset')}Xóa tiến trình</button><button class="text-button" data-exit>Đóng chế độ giáo viên</button></div></header><div class="teacher-tabs">${T.CONFIG.MAPS.map(m=>`<button data-teacher-map="${m.id}" class="${m.id===this.map?'active':''}">${m.id===6?'BOSS':`MAP ${m.id}`}</button>`).join('')}</div><div class="teacher-content"><aside><h2>${T.CONFIG.MAPS[this.map-1].title}</h2><button class="primary small" data-preview>${U.icon('play')}CHƠI THỬ ${this.map===6?'BOSS':'MAP'}</button><label class="search-label" for="question-search">Tìm câu hỏi</label><input id="question-search" placeholder="Mã câu / sin / cạnh…"><div class="question-list"></div></aside><div class="teacher-detail"></div></div></section>`;
      const root=this.app.root;root.querySelectorAll('[data-teacher-map]').forEach(el=>el.onclick=()=>{this.map=Number(el.dataset.teacherMap);this.show();});
      root.querySelector('[data-preview]').onclick=()=>this.app.start(this.map,false,true);root.querySelector('[data-reset]').onclick=()=>this.app.confirmReset(()=>this.show());root.querySelector('[data-exit]').onclick=()=>{this.authenticated=false;this.app.menu();};
      root.querySelector('[data-unlock]').onclick=()=>{this.app.save.teacherUnlockAll=true;this.app.save.unlocked=6;this.app.persist();U.toast('Đã mở tất cả map. Các sao và thành tích giữ đúng kết quả chơi.');};
      const list=root.querySelector('.question-list'),detail=root.querySelector('.teacher-detail');
      const draw=(query='')=>{
        const qs=this.app.bank.filter(q=>q.map===this.map&&`${q.id} ${q.prompt}`.toLowerCase().includes(query.toLowerCase()));
        list.innerHTML=qs.map(q=>`<button data-qid="${q.id}"><b>${q.id}</b><span>${U.e(q.prompt)}</span></button>`).join('')||'<p>Không có câu phù hợp.</p>';
        list.querySelectorAll('[data-qid]').forEach(el=>el.onclick=()=>{const q=qs.find(x=>x.id===el.dataset.qid);detail.innerHTML=reviewHTML(q);list.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===el));});
        if(qs.length)list.querySelector('button').click();else detail.innerHTML='';
      };draw();root.querySelector('input').addEventListener('input',ev=>draw(ev.target.value));
    }
  }
  T.Teacher=Teacher;T.Review={answerHTML,reviewHTML,questionExpression};
})(Trig);
