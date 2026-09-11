(function(T){
  const M=T.MathEngine,U=T.UI;
  T.Mechanics['special-angle']=function(q,host,game){
    const values=T.Questions.shuffle(M.VALUE_POOL),d=q.mathData;let sealed=false;
    host.innerHTML=`<div class="temple-layout"><div class="temple-zones">${[30,45,60].map(a=>`<div class="temple-zone ${a===d.angle?'active':''}">${a}°</div>`).join('')}</div><div class="temple-seal"><div class="seal-rings"></div><span class="eyebrow">ẤN KÝ ${d.angle}°</span><h3>${M.trigHTML(d.fn,d.angle)}</h3><p id="memory-instruction">Ghi nhớ vị trí các giá trị, rồi khóa tinh thể.</p></div><div class="crystal-field">${values.map((v,i)=>`<button class="crystal-pick" data-crystal="${i}" aria-label="Tinh thể ${i+1}: ${M.exact(v)}" disabled><svg class="crystal-shape" viewBox="0 0 110 135" aria-hidden="true"><path d="m55 3 39 32 5 59-44 38-44-38 5-59Z"/><path d="m55 3-18 43 18 86 18-86ZM16 35l21 11L11 94m83-59L73 46l26 48"/></svg><span class="crystal-value">${M.valueHTML(v)}</span><span class="crystal-number">${String(i+1).padStart(2,'0')}</span></button>`).join('')}</div><div class="temple-actions"><button class="primary" data-seal>${U.icon('lock')}KHÓA TINH THỂ</button><button class="text-button" data-observe hidden>Quan sát lại · gợi ý</button></div></div>`;
    function lock(){if(game.busy||game.paused)return;sealed=true;host.classList.add('memory-sealed');host.querySelectorAll('[data-crystal]').forEach((el,i)=>{el.disabled=false;el.setAttribute('aria-label',`Mở tinh thể ${i+1}`);});host.querySelector('[data-seal]').hidden=true;host.querySelector('[data-observe]').hidden=false;host.querySelector('#memory-instruction').textContent='Chạm tinh thể chứa giá trị đúng để giải phong ấn.';game.app.audio.sfx('crystal');}
    host.addEventListener('click',ev=>{
      if(ev.target.closest('[data-seal]'))lock();
      if(ev.target.closest('[data-observe]')){if(game.busy||game.paused)return;game.hint();sealed=false;host.classList.remove('memory-sealed');host.querySelectorAll('[data-crystal]').forEach((el,i)=>{el.disabled=true;el.setAttribute('aria-label',`Tinh thể ${i+1}: ${M.exact(values[i])}`);});host.querySelector('[data-seal]').hidden=false;host.querySelector('[data-observe]').hidden=true;}
      const crystal=ev.target.closest('[data-crystal]');if(crystal&&sealed&&!game.busy&&!game.paused){crystal.classList.add('revealed');game.answer(values[Number(crystal.dataset.crystal)]);}
    });return ()=>{};
  };
})(Trig);
