(function(T){
  'use strict';
  const e=T.MathEngine.escape;
  const icons={compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',mountain:'<path d="m2 21 8-16 4 8 3-5 5 13Z M7 11l3 2 2-4"/>',volume:'<path d="m11 5-6 4H2v6h3l6 4Z M15 8c3 2 3 6 0 8 M18 5c5 4 5 10 0 14"/>',mute:'<path d="m11 5-6 4H2v6h3l6 4Z M16 9l5 6m0-6-5 6"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',pause:'<path d="M8 4v16M16 4v16"/>',play:'<path d="m8 4 12 8-12 8Z"/>',teacher:'<path d="m2 8 10-5 10 5-10 5Z M6 10v7q6 6 12 0v-7M22 8v8"/>',settings:'<path d="m9 3-1 3-3 1v4l-2 1 2 2v4l4 1 1 2 3-2h4l1-3 3-1v-4l-3-2-1-4-4 1Z"/><circle cx="12" cy="12" r="3"/>',back:'<path d="m14 5-7 7 7 7"/>',star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',flag:'<path d="M5 22V3q7-4 14 0v10q-7-4-14 0"/>',heart:'<path d="M12 21C-5 9 5 0 12 7c7-7 17 2 0 14Z"/>',spark:'<path d="m12 2 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z"/>',trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v4q0 5 5 5m9-9h4v4q0 5-5 5M12 15v6M7 21h10"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',hint:'<path d="M8 16c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7ZM9 20h6M12 4v2"/>',arrow:'<path d="M3 12h18m-7-7 7 7-7 7"/>',check:'<path d="m4 12 5 5L21 5"/>',shield:'<path d="m12 2 9 4v7q-2 7-9 9-7-2-9-9V6Z"/>',reset:'<path d="M4 10a8 8 0 1 1 1 8M4 3v7h7"/>'};
  const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
  const stars=n=>`<span class="stars" aria-label="${n} trên 3 sao">${[1,2,3].map(i=>icon('star',i<=n?'earned':'')).join('')}</span>`;
  const time=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const explorer=()=>`<svg class="explorer" viewBox="0 0 70 100" aria-hidden="true"><ellipse cx="35" cy="94" rx="24" ry="4" fill="#041c24" opacity=".6"/><g class="explorer-body"><path d="M22 66 18 91h12l6-23 7 23h12L48 62" fill="#123448" stroke="#9cdddd" stroke-width="2"/><rect x="9" y="38" width="25" height="30" rx="8" fill="#c97e38"/><path d="M20 39q15-10 28 0l8 26H15Z" fill="#ffd185"/><path d="m17 43-7 22m39-22 8 19" stroke="#f3c696" stroke-width="8" stroke-linecap="round"/><circle cx="35" cy="27" r="13" fill="#edbd88"/><path d="M19 24q-1-17 16-17 17 0 17 17" fill="#41717b"/><path d="M14 24h43" stroke="#74b8b7" stroke-width="7" stroke-linecap="round"/><path d="m22 39 12 8 16-7-11 15Z" fill="#e9684e"/><circle cx="40" cy="28" r="2" fill="#143542"/><path d="m57 43 4 50" stroke="#b4e5db" stroke-width="3"/></g></svg>`;
  function toast(text,kind=''){const host=document.getElementById('toasts'),el=document.createElement('div');el.className=`toast ${kind}`;el.textContent=text;host.append(el);setTimeout(()=>el.remove(),4200);}
  let onClose=null,returnFocus=null;
  function modal(title,body,{wide=false,close=true,afterClose=null}={}){
    const d=document.getElementById('dialog');returnFocus=document.activeElement;onClose=afterClose;
    d.className=wide?'wide':'';d.innerHTML=`<header class="dialog-head"><h2>${e(title)}</h2>${close?`<button class="icon-button" data-close aria-label="Đóng">${icon('close')}</button>`:''}</header><div class="dialog-body">${body}</div>`;
    if(!d.open)d.showModal();d.querySelector('[data-close]')?.addEventListener('click',closeModal);d.querySelector('input,button')?.focus();
  }
  function closeModal(){const d=document.getElementById('dialog');d.close();const fn=onClose;onClose=null;if(fn)fn();returnFocus?.focus?.();}
  function initDialog(){const d=document.getElementById('dialog');d.addEventListener('cancel',ev=>{ev.preventDefault();if(d.querySelector('[data-close]'))closeModal();});}
  function fraction(a,b){return `<span class="fraction"><span>${e(a)}</span><span>${e(b)}</span></span>`;}
  function drag(surface,{onDrop,onSelect}){
    let data=null,ghost=null,start=null,moved=false;
    const cleanup=()=>{ghost?.remove();ghost=null;data=null;start=null;moved=false;};
    surface.addEventListener('pointerdown',ev=>{
      const token=ev.target.closest('[data-token]');if(!token)return;data=token.dataset.token;start={x:ev.clientX,y:ev.clientY};moved=false;
      token.setPointerCapture?.(ev.pointerId);
    });
    surface.addEventListener('pointermove',ev=>{
      if(data===null)return;
      if(!moved&&Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>8){moved=true;ghost=document.createElement('div');ghost.className='drag-ghost';ghost.textContent=surface.querySelector(`[data-token="${data}"]`)?.textContent||data;document.body.append(ghost);}
      if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';}
    });
    surface.addEventListener('pointerup',ev=>{
      if(data===null)return;const value=data,isDrag=moved,target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-drop]');
      if(isDrag&&target){onDrop(value,target.dataset.drop);}else if(!isDrag){onSelect?.(value);}cleanup();
    });
    surface.addEventListener('pointercancel',cleanup);
    surface.addEventListener('keydown',ev=>{const t=ev.target.closest('[data-token]');if(t&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();onSelect?.(t.dataset.token);}});
    return cleanup;
  }
  T.UI={e,icon,stars,time,explorer,toast,modal,closeModal,initDialog,fraction,drag};
})(Trig);
