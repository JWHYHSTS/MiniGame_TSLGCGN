(function(T){
  'use strict';
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const near=(a,b,e=1e-9)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=e*Math.max(1,Math.abs(a),Math.abs(b));
  function rational(n,d=1,r=1){
    if(!Number.isInteger(n)||!Number.isInteger(d)||!Number.isInteger(r)||d===0||r<1) throw Error('Invalid exact value');
    for(let k=2;k*k<=r;k++) while(r%(k*k)===0){n*=k;r/=k*k;}
    if(d<0){n=-n;d=-d;} const g=gcd(n,d)||1;
    return {n:n/g,d:d/g,r};
  }
  const numeric=a=>a.n*Math.sqrt(a.r)/a.d;
  const exact=a=>`${a.n===1&&a.r!==1?'':a.n}${a.r===1?'':`sqrt(${a.r})`}${a.d===1?'':`/${a.d}`}`;
  const equal=(a,b)=>!!a&&!!b&&near(numeric(a),numeric(b));
  function parseAtom(s){
    let m=s.match(/^([+-]?\d*)?(?:sqrt\((\d+)\))$/);
    if(m){const n=m[1]===''||m[1]===undefined?1:m[1]==='-'?-1:Number(m[1]);return rational(n,1,Number(m[2]));}
    if(/^[+-]?\d+(\.\d+)?$/.test(s)){
      const places=(s.split('.')[1]||'').length; if(places>8)return null;
      return rational(Math.round(Number(s)*10**places),10**places);
    }
    return null;
  }
  function parseAnswer(raw,allowDecimal=true){
    try{
      let s=String(raw).trim().replace(/\s/g,'').replace(/,/g,'.').replace(/−/g,'-').replace(/√(\d+)/g,'sqrt($1)').replace(/√\((\d+)\)/g,'sqrt($1)').replace(/sqrt(\d+)/g,'sqrt($1)');
      if(s.length>64||(!allowDecimal&&s.includes('.')))return null;
      const parts=s.split('/'); if(parts.length>2)return null;
      const a=parseAtom(parts[0]);if(!a)return null;if(parts.length===1)return a;
      const b=parseAtom(parts[1]);if(!b||b.n===0)return null;
      return rational(a.n*b.d,a.d*b.n*b.r,a.r*b.r);
    }catch(_){return null;}
  }
  const FUNCTIONS=['sin','cos','tan','cot'];
  const ROLES={opposite:'cạnh đối',adjacent:'cạnh kề',hypotenuse:'cạnh huyền'};
  const RATIO={sin:['opposite','hypotenuse'],cos:['adjacent','hypotenuse'],tan:['opposite','adjacent'],cot:['adjacent','opposite']};
  const COMPLEMENT={sin:'cos',cos:'sin',tan:'cot',cot:'tan'};
  const TABLE={
    30:{sin:rational(1,2),cos:rational(1,2,3),tan:rational(1,3,3),cot:rational(1,1,3)},
    45:{sin:rational(1,2,2),cos:rational(1,2,2),tan:rational(1),cot:rational(1)},
    60:{sin:rational(1,2,3),cos:rational(1,2),tan:rational(1,1,3),cot:rational(1,3,3)}
  };
  const VALUE_POOL=[rational(1,2),rational(1,2,2),rational(1,2,3),rational(1,3,3),rational(1,1,3),rational(1)];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function valueHTML(a){
    const upper=`${a.n===1&&a.r!==1?'':a.n}${a.r===1?'':`<span class="root">√<span>${a.r}</span></span>`}`;
    const label=exact(a).replace(/sqrt\((\d+)\)/g,'√$1');
    return `<span class="math-value" aria-label="${escape(label)}">${a.d===1?upper:`<span class="fraction"><span>${upper}</span><span>${a.d}</span></span>`}</span>`;
  }
  const trigHTML=(fn,angle)=>`<span class="math-expression"><span class="trig-fn">${escape(fn)}</span> ${escape(angle)}${typeof angle==='number'?'°':''}</span>`;
  T.MathEngine={gcd,near,rational,numeric,exact,equal,parseAnswer,FUNCTIONS,ROLES,RATIO,COMPLEMENT,TABLE,VALUE_POOL,escape,valueHTML,trigHTML};
})(Trig);
