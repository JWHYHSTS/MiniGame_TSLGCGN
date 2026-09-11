(function(T){
  const M=T.MathEngine,U=T.UI;
  function mount(q,host,game){
    const d=q.mathData,isBound=q.type==='bound-ratio',isRec=q.type==='reciprocal';let slots=[null,null],selected=null;
    const names={...M.ROLES,one:'1',tan:'tan α',sin:'sin α',cos:'cos α',unit:'Lớn hơn 0 · nhỏ hơn 1',positive:'Luôn lớn hơn 0',negative:'Nhỏ hơn 0'};
    const display=v=>names[v]||v;
    host.innerHTML=`<div class="gate-layout"><div class="gate-diagram">${d.triangle?T.Triangle.renderTriangle(d.triangle,{id:q.id}):`<div class="gate-sigil">${U.icon('compass')}<span>${isBound?'α':'cot α'}</span></div>`}<p>${d.triangle?`Vuông tại ${d.triangle.rightAngleVertex} · α = góc ${d.triangle.targetAngleVertex}`:'α là một góc nhọn'}</p></div><div class="gate-workshop"><div class="gate-arch"><div class="gate-crown">${isBound?'MẠCH GIỚI HẠN':isRec?'MẠCH NGHỊCH ĐẢO':d.fn.toUpperCase()}</div><h3>${U.e(q.prompt)}</h3><div class="formula-assembly"><span class="formula-left">${isBound?(d.group==='sincos'?'sin α, cos α':'tan α, cot α'):isRec?'cot α':`${d.fn} ${d.triangle.targetAngleVertex}`} ${isBound?'':'='}</span><div class="slot-stack ${isBound?'one-slot':''}"><button class="drop-slot" data-drop="0" aria-label="${isBound?'Giới hạn':'Tử số'}">${isBound?'GIỚI HẠN':'TỬ SỐ'}</button>${isBound?'':'<span class="fraction-bar"></span><button class="drop-slot" data-drop="1" aria-label="Mẫu số">MẪU SỐ</button>'}</div></div><div class="token-tray">${q.tokens.map(v=>`<button class="token" data-token="${v}">${U.e(display(v))}</button>`).join('')}</div><p class="interaction-note">Kéo vào ô · hoặc chọn mảnh rồi chạm ô</p><div class="workshop-actions"><button class="text-button" data-clear>Xếp lại</button><button class="primary small" data-activate>${U.icon('spark')}KÍCH HOẠT CỔNG</button></div></div></div></div>`;
    function put(v,slot){if(game.busy||game.paused)return;slots[Number(slot)]=v;const el=host.querySelector(`[data-drop="${slot}"]`);el.textContent=display(v);el.classList.add('filled');game.app.audio.sfx('drop');selected=null;host.querySelectorAll('[data-token]').forEach(el=>el.classList.remove('selected'));}
    const dispose=U.drag(host,{onDrop:put,onSelect:v=>{selected=v;host.querySelectorAll('[data-token]').forEach(el=>el.classList.toggle('selected',el.dataset.token===v));game.app.audio.sfx('drag');}});
    host.addEventListener('click',ev=>{
      const slot=ev.target.closest('[data-drop]');if(slot&&selected!==null)put(selected,slot.dataset.drop);
      if(ev.target.closest('[data-clear]')){slots=[null,null];host.querySelectorAll('[data-drop]').forEach(el=>{el.textContent=isBound?'GIỚI HẠN':el.dataset.drop==='0'?'TỬ SỐ':'MẪU SỐ';el.classList.remove('filled');});}
      if(ev.target.closest('[data-activate]')){
        if(slots[0]===null||(!isBound&&slots[1]===null)){U.toast('Lắp đủ các ô rồi kích hoạt cổng.');return;}
        game.answer(isBound?slots[0]:slots);
      }
    });return dispose;
  }
  T.Mechanics['build-ratio']=mount;T.Mechanics['bound-ratio']=mount;T.Mechanics.reciprocal=mount;
})(Trig);
