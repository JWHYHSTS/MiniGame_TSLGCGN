(function(T){
  T.Mechanics=T.Mechanics||{};
  function mount(q,host,game){
    const t=q.mathData.triangle,U=T.UI;
    host.innerHTML=`<div class="identify-layout"><div class="field-note"><span class="eyebrow">BẢN VẼ ${String(game.run.index+1).padStart(2,'0')}</span><h3>${U.e(q.prompt)}</h3><p>Góc đang xét: <b>α = góc ${t.targetAngleVertex}</b><br>Tam giác vuông tại ${t.rightAngleVertex}.</p><div class="rope-inventory">${U.icon('compass')}<span>Quan sát dấu góc vuông<br>trước khi chọn cạnh.</span></div>${game.run.index===0?'<p class="mini-demo">Chạm một cạnh trên hình để đánh dấu bản vẽ.</p>':''}</div><div class="geometry-field">${T.Triangle.renderTriangle(t,{interactive:true,id:q.id})}<div class="geometry-caption">${q.type==='drag-side'?'Kéo nhãn vào cạnh · hoặc chạm trực tiếp cạnh':'Chạm trực tiếp lên cạnh'}</div>${q.type==='drag-side'?`<div class="side-label-tray"><button class="token rope-label" data-token="role">${U.icon('flag')}${T.MathEngine.ROLES[q.mathData.role]}</button></div>`:''}</div></div>`;
    host.addEventListener('click',ev=>{const side=ev.target.closest('[data-side]');if(side)game.answer(side.dataset.side);});
    host.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&ev.target.dataset.side){ev.preventDefault();game.answer(ev.target.dataset.side);}});
    return U.drag(host,{onDrop:(_,side)=>game.answer(side),onSelect:()=>{U.toast('Chạm vào cạnh bạn muốn gắn nhãn.');game.app.audio.sfx('drag');}});
  }
  T.Mechanics['identify-side']=mount;T.Mechanics['drag-side']=mount;
})(Trig);
