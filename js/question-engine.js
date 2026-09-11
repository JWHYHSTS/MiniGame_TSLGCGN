(function(T){
  'use strict';
  const M=T.MathEngine,G=T.Triangle;
  const difficulty=i=>i%10<3?'easy':i%10<8?'normal':'challenge';
  const triples=[[3,4],[5,12],[6,8],[8,15],[9,12],[10,24],[15,20],[12,16]];
  const permutations=[['A','B','C'],['C','A','B'],['B','C','A'],['M','N','P'],['Q','R','S'],['P','M','N']];
  function triangleFor(i,target){return G.build({names:permutations[Math.floor(i/2)%permutations.length],legs:triples[Math.floor(i/3)%triples.length],target:target||i%2+1,rotation:[0,28,90,145,200,270,330][i%7],mirror:i%3===1,zoom:i%4===0?.9:1});}
  function derive(q){
    const d=q.mathData,kind=q.type;
    let answer,exactAnswer=null,numericAnswer=null,prompt='',hint='',explanation='',tokens=[];
    if(d.triangle){
      const t=d.triangle,r=G.roles(t),v=t.targetAngleVertex,fn=d.fn,pair=fn?M.RATIO[fn].map(k=>r[k]):null;
      if(kind==='identify-side'||kind==='drag-side'){
        answer=r[d.role];prompt=`${kind==='drag-side'?'Gắn nhãn':'Chạm vào'} ${M.ROLES[d.role]}${d.role==='hypotenuse'?'':` của góc ${v}`}.`;
        hint=d.role==='hypotenuse'?'Tìm cạnh đối diện góc vuông.':d.role==='opposite'?`Cạnh đối không chứa đỉnh ${v}.`:`Tìm cạnh chứa ${v}, rồi loại cạnh huyền.`;
        explanation=d.role==='hypotenuse'?`${answer} là cạnh huyền vì không chứa đỉnh góc vuông ${t.rightAngleVertex}.`:`Xét góc ${v}: ${r.opposite} là cạnh đối, ${r.adjacent} là cạnh kề; ${r.hypotenuse} vẫn là cạnh huyền.`;
      }else if(kind==='build-ratio'){
        answer=d.named?pair:M.RATIO[fn];tokens=d.named?G.sides(t):Object.keys(M.ROLES);
        prompt=`Lắp ${fn} ${v} để mở cổng.`;hint=`Xác định cạnh đối và cạnh huyền của góc ${v} trước khi lắp tỉ số.`;
        explanation=`Với góc ${v}, ${pair[0]} là ${M.ROLES[M.RATIO[fn][0]]}, ${pair[1]} là ${M.ROLES[M.RATIO[fn][1]]}. ${fn} ${v} = ${pair[0]}/${pair[1]}.`;
      }else if(kind==='calculate-ratio'){
        const value=G.ratio(t,fn).value;answer=value;exactAnswer=M.exact(value);numericAnswer=M.numeric(value);
        prompt=`Tính ${fn} ${v} để dựng nhịp cầu.`;hint=d.hideHyp?'Dùng định lí Pythagore để tìm cạnh còn thiếu, rồi lập tỉ số.':`Xác định hai cạnh trong định nghĩa ${fn}. Có thể nhập phân số như 4/5.`;
        const legs=G.sides(t).filter(s=>s!==r.hypotenuse);
        explanation=(d.hideHyp?`${r.hypotenuse}² = ${t.sideLengths[legs[0]]}² + ${t.sideLengths[legs[1]]}², nên ${r.hypotenuse} = ${Number(t.sideLengths[r.hypotenuse].toFixed(8))}. `:'')+`Với góc ${v}, ${pair[0]} là ${M.ROLES[M.RATIO[fn][0]]}, ${pair[1]} là ${M.ROLES[M.RATIO[fn][1]]}. ${fn} ${v} = ${pair.join('/')} = ${exactAnswer}.`;
      }
    }else if(kind==='bound-ratio'){
      answer=d.group==='sincos'?'unit':'positive';tokens=['unit','positive','negative'];
      prompt=d.group==='sincos'?'Lắp giới hạn luôn đúng cho sin α và cos α.':'Lắp giới hạn luôn đúng cho tan α và cot α.';
      hint='Góc đang xét là góc nhọn. Độ dài các cạnh dương; cạnh huyền dài nhất.';
      explanation=d.group==='sincos'?'0 < sin α < 1 và 0 < cos α < 1, vì mỗi cạnh góc vuông ngắn hơn cạnh huyền.':'tan α > 0 và cot α > 0 vì là tỉ số của hai độ dài dương. Chúng không nhất thiết nhỏ hơn 1.';
    }else if(kind==='reciprocal'){
      answer=['one','tan'];tokens=['one','tan','sin','cos'];prompt='Khôi phục mạch nghịch đảo: cot α.';
      hint='Đổi vị trí tử số và mẫu số của tan α.';explanation='cot α = 1 / tan α vì cot α = cạnh kề / cạnh đối, còn tan α = cạnh đối / cạnh kề.';
    }else if(kind==='special-angle'){
      answer=M.TABLE[d.angle][d.fn];exactAnswer=M.exact(answer);numericAnswer=M.numeric(answer);prompt=`Tìm tinh thể mang giá trị ${d.fn} ${d.angle}°.`;
      hint=d.angle===45?'Góc 45° thuộc tam giác vuông cân. Hai cạnh góc vuông bằng nhau.':'Hãy nhớ tỉ lệ hai cạnh góc vuông và cạnh huyền của tam giác 30°–60° là 1 : √3 : 2.';
      explanation=`${d.fn} ${d.angle}° = ${exactAnswer.replace(/sqrt\((\d+)\)/g,'√$1')}. ${d.angle===45?'Tam giác vuông cân có hai cạnh góc vuông bằng nhau.':'Dùng tam giác 30°–60° với tỉ lệ cạnh 1 : √3 : 2.'}`;
    }else if(kind==='complementary'){
      answer={fn:M.COMPLEMENT[d.fn],angle:90-d.angle};prompt=`Nối ${d.fn} ${d.angle}° với tỉ số bằng nó trên đỉnh bên kia.`;
      hint='Lấy 90° trừ số đo góc. Ghép sin với cos, tan với cot.';
      explanation=`${d.angle}° + ${answer.angle}° = 90°, nên ${d.fn} ${d.angle}° = ${answer.fn} ${answer.angle}°.`;
    }
    return {answer,exactAnswer,numericAnswer,prompt,hint,explanation,tokens};
  }
  function complete(base){const q={...base,status:'draft',points:100};return Object.assign(q,derive(q));}
  function generateBank(){
    const bank=[];
    for(let i=0;i<30;i++){
      const p=Math.floor(i/2),triangle=triangleFor(p,i%2+1);
      bank.push(complete({id:`M1-Q${String(i+1).padStart(3,'0')}`,map:1,type:i%3?'drag-side':'identify-side',difficulty:difficulty(i),mathData:{triangle,role:['hypotenuse','opposite','adjacent'][p%3]},pairId:`PAIR-${p}`}));
    }
    for(let i=0;i<40;i++){
      const type=i<32?'build-ratio':i<36?'bound-ratio':'reciprocal';
      const mathData=type==='build-ratio'?{triangle:triangleFor(i),fn:M.FUNCTIONS[i%4],named:i>=12}:type==='bound-ratio'?{group:i%2?'positive':'sincos'}:{variant:i-36};
      bank.push(complete({id:`M2-Q${String(i+1).padStart(3,'0')}`,map:2,type,difficulty:i>=36||i>=24&&i<32?'challenge':i<12?'easy':'normal',mathData}));
    }
    for(let i=0;i<30;i++)bank.push(complete({id:`M3-Q${String(i+1).padStart(3,'0')}`,map:3,type:'calculate-ratio',difficulty:difficulty(i),mathData:{triangle:triangleFor(i),fn:M.FUNCTIONS[i%4],hideHyp:i%10>=7,allowDecimal:true}}));
    for(let i=0;i<36;i++)bank.push(complete({id:`M4-Q${String(i+1).padStart(3,'0')}`,map:4,type:'special-angle',difficulty:i<12?'easy':i<24?'normal':'challenge',mathData:{angle:[30,45,60][Math.floor(i%12/4)],fn:M.FUNCTIONS[i%4],variant:Math.floor(i/12)}}));
    const angles=[35,25,20,82,63,52,18,42,65,15,70,8,27,55,32,48,12,78,39,51,24,66,33,57,28,62,17,73,22,68,37,53];
    for(let i=0;i<32;i++)bank.push(complete({id:`M5-Q${String(i+1).padStart(3,'0')}`,map:5,type:'complementary',difficulty:difficulty(i),mathData:{angle:angles[i],fn:M.FUNCTIONS[i%4]}}));
    for(let phase=1;phase<=5;phase++){
      const source=bank.filter(q=>q.map===phase&&!(phase===2&&q.type!=='build-ratio'));
      for(let i=0;i<12;i++){
        const q=JSON.parse(JSON.stringify(source[(i*7+phase)%source.length]));
        q.id=`B${phase}-Q${String(i+1).padStart(3,'0')}`;q.map=6;q.phase=phase;q.difficulty=difficulty(i);q.status='draft';bank.push(q);
      }
    }
    return bank;
  }
  function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function pickRun(bank,map){
    const pool=bank.filter(q=>q.map===map&&q.status==='validated');
    const choose=(f,n)=>shuffle(pool.filter(f)).slice(0,n);
    let result;
    if(map===1){
      const pair=pool.filter(q=>q.pairId==='PAIR-1');
      const first=pool.find(q=>q.mathData.role==='hypotenuse'&&q.type==='identify-side');
      result=[first,...pair,...choose(q=>q!==first&&!pair.includes(q)&&q.difficulty==='easy',1),...choose(q=>!pair.includes(q)&&q.difficulty==='normal',4),...choose(q=>q.difficulty==='challenge',2)];
    }else if(map===2){
      const functions=shuffle(M.FUNCTIONS),named=choose(q=>q.type==='build-ratio'&&q.difficulty==='normal'&&q.mathData.fn===functions[3],1)[0];
      result=[...functions.slice(0,3).map(fn=>choose(q=>q.type==='build-ratio'&&!q.mathData.named&&q.mathData.fn===fn,1)[0]),named,...choose(q=>q.type==='build-ratio'&&q.difficulty==='normal'&&q!==named,2),choose(q=>q.type==='bound-ratio'&&q.mathData.group==='sincos',1)[0],choose(q=>q.type==='bound-ratio'&&q.mathData.group==='positive',1)[0],choose(q=>q.type==='build-ratio'&&q.difficulty==='challenge',1)[0],choose(q=>q.type==='reciprocal',1)[0]];
    }else if(map===4){
      result=[30,45,60].flatMap((angle,k)=>shuffle(M.FUNCTIONS).map((fn,i)=>choose(q=>q.mathData.angle===angle&&q.mathData.fn===fn&&q.mathData.variant===(k===0?0:k===1||i<2?1:2),1)[0]));
    }else if(map===6){result=[1,2,3,4,5].flatMap(phase=>[...choose(q=>q.phase===phase&&q.difficulty==='easy',1),...choose(q=>q.phase===phase&&q.difficulty==='normal',phase%2?1:2),...(phase%2?choose(q=>q.phase===phase&&q.difficulty==='challenge',1):[])]);}
    else result=[...choose(q=>q.difficulty==='easy',3),...choose(q=>q.difficulty==='normal',5),...choose(q=>q.difficulty==='challenge',2)];
    if(result.some(q=>!q)||new Set(result.map(q=>q.id)).size!==result.length)throw Error('Not enough validated questions');
    return result.map(q=>q.id);
  }
  T.Questions={derive,complete,generateBank,shuffle,pickRun};
})(Trig);
