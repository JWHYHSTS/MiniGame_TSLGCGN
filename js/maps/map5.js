(function(T){
  const M=T.MathEngine,U=T.UI;
  T.Mechanics.complementary=function(q,host,game){
    const d=q.mathData,target=q.answer;
    let selected=false;
    const alternatives=T.Questions.shuffle([{...target},{fn:target.fn,angle:d.angle===45?35:d.angle},{fn:d.fn,angle:target.angle}]);
    host.innerHTML=`<div class="peaks-layout"><div class="peaks-condition"><span>α + β =</span><strong>90°</strong><p>Hai tỉ số bằng nhau, một cầu ánh sáng.</p></div><div class="connect-board"><svg class="connection-svg" aria-hidden="true"></svg><div class="peak-column peak-alpha"><span class="peak-label">ĐỈNH α</span><button class="rune source-rune" data-source data-token="source">${M.trigHTML(d.fn,d.angle)}<span class="rune-dot"></span></button><p>Chọn tỉ số này<br>rồi chạm tỉ số bên kia.</p></div><div class="bridge-symbol">${U.icon('spark')}</div><div class="peak-column peak-beta"><span class="peak-label">ĐỈNH β</span>${alternatives.map((a,i)=>`<button class="rune target-rune" data-target="${i}" data-drop="${i}"><span class="rune-dot"></span>${M.trigHTML(a.fn,a.angle)}</button>`).join('')}</div></div><p class="interaction-note">Kéo dây nối · hoặc chạm hai đầu nối</p></div>`;
    host.querySelector('.peaks-condition p').textContent='Hai tỉ số bằng nhau, một cầu ánh sáng.';
    const board=host.querySelector('.connect-board'),svg=host.querySelector('svg.connection-svg');
    function connect(i){if(game.busy||game.paused)return;const a=host.querySelector('[data-source]').getBoundingClientRect(),b=host.querySelector(`[data-target="${i}"]`).getBoundingClientRect(),r=board.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${r.width} ${r.height}`);svg.innerHTML=`<path d="M ${a.right-r.left} ${a.top+a.height/2-r.top} Q ${r.width/2} ${Math.min(a.top,b.top)-r.top} ${b.left-r.left} ${b.top+b.height/2-r.top}" class="light-connection"/>`;game.answer(alternatives[i]);}
    const cleanup=U.drag(host,{onDrop:(_,i)=>connect(Number(i)),onSelect:()=>{selected=true;host.querySelector('[data-source]').classList.add('selected');game.app.audio.sfx('drag');}});
    host.addEventListener('click',ev=>{const el=ev.target.closest('[data-target]');if(el){if(!selected){U.toast('Chọn đầu nối ở đỉnh α trước.');return;}connect(Number(el.dataset.target));}});
    return cleanup;
  };
})(Trig);
