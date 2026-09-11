(function(T){
  const M=T.MathEngine,U=T.UI;
  T.Mechanics['calculate-ratio']=function(q,host,game){
    const d=q.mathData,t=d.triangle;
    host.innerHTML=`<div class="canyon-layout"><div class="survey-board"><div class="survey-label">${U.icon('compass')} BẢN VẼ KHẢO SÁT <span>Đơn vị: cm</span></div>${T.Triangle.renderTriangle(t,{showLengths:true,hideHyp:d.hideHyp,id:q.id})}<p>Vuông tại ${t.rightAngleVertex} · α = góc ${t.targetAngleVertex}</p></div><div class="construction-kit"><span class="eyebrow">XƯỞNG DỰNG CẦU</span><h3>${U.e(q.prompt)}</h3><form class="calculate-form"><label for="ratio-answer">${M.trigHTML(d.fn,t.targetAngleVertex)} =</label><input id="ratio-answer" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="64" placeholder="Ví dụ: 4/5" aria-describedby="ratio-help"><div class="input-tools"><button type="button" data-insert="/">/</button><button type="button" data-insert="-">−</button><button type="button" data-insert="√">√</button><span id="calc-preview" aria-live="polite"></span></div><p id="ratio-help">Ưu tiên phân số. Chấp nhận số thập phân tương đương.</p><button type="submit" class="primary">${U.icon('check')}DỰNG NHỊP CẦU</button></form><details class="scratchpad" ${game.run.map===6?'':'open'}><summary>Sổ nháp cá nhân</summary><textarea aria-label="Sổ nháp" placeholder="Viết phép tính của bạn ở đây…">${U.e(game.run.scratch||'')}</textarea><button class="text-button" data-erase>Xóa nháp</button></details></div></div>`;
    const input=host.querySelector('input'),scratch=host.querySelector('textarea');
    const preview=()=>{const a=M.parseAnswer(input.value,true);host.querySelector('#calc-preview').innerHTML=a?M.valueHTML(a):'';};
    input.addEventListener('input',preview);scratch.addEventListener('input',()=>{game.run.scratch=scratch.value;game.checkpoint();});
    host.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();const value=M.parseAnswer(input.value,d.allowDecimal);if(!value){U.toast('Nhập một số hoặc phân số hợp lệ, ví dụ 4/5.');input.focus();return;}game.answer(value);});
    host.addEventListener('click',ev=>{const key=ev.target.closest('[data-insert]');if(key){const start=input.selectionStart||input.value.length,end=input.selectionEnd||start;input.setRangeText(key.dataset.insert,start,end,'end');input.focus();preview();}if(ev.target.closest('[data-erase]')){scratch.value='';game.run.scratch='';game.checkpoint();}});
    return ()=>{};
  };
})(Trig);
