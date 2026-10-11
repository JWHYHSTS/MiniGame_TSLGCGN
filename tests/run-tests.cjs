/* Dependency-free tests: node tests/run-tests.cjs */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const f of ['config','math-engine','triangle','question-engine','validator','scoring','storage','achievements'])require('../js/'+f+'.js');
const {MathEngine:M,Triangle:G,Questions:Q,Validator:V,Scoring:S,Storage:Store}=Trig;
let passed=0,failed=0;const results=[];
function test(name,fn){try{fn();passed++;results.push({name,passed:true});}catch(e){failed++;results.push({name,passed:false,error:e.message});console.error('FAIL',name,e.message);}}
const clone=x=>JSON.parse(JSON.stringify(x));
for(const [target,expected,ratios] of [[1,{hypotenuse:'BC',opposite:'AC',adjacent:'AB'},['4/5','3/5','4/3','3/4']],[2,{hypotenuse:'BC',opposite:'AB',adjacent:'AC'},['3/5','4/5','3/4','4/3']]])test(`Golden triangle ABC, target ${target===1?'B':'C'}`,()=>{const t=G.build({legs:[3,4],target});assert.deepEqual(G.roles(t),expected);M.FUNCTIONS.forEach((f,i)=>assert.equal(M.exact(G.ratio(t,f).value),ratios[i]));});
const golden={30:['1/2','sqrt(3)/2','sqrt(3)/3','sqrt(3)'],45:['sqrt(2)/2','sqrt(2)/2','1','1'],60:['sqrt(3)/2','1/2','sqrt(3)','sqrt(3)/3']};
for(const angle of [30,45,60])test(`Golden special angle ${angle}`,()=>M.FUNCTIONS.forEach((fn,i)=>assert.equal(M.exact(M.TABLE[angle][fn]),golden[angle][i])));
test('Golden 35° and 55° complementary pairs',()=>{for(const [fn,other] of [['sin','cos'],['cos','sin'],['tan','cot'],['cot','tan']]){const q=Q.complete({id:'golden',map:5,type:'complementary',mathData:{fn,angle:35}});assert.deepEqual(q.answer,{fn:other,angle:55});assert(V.validateQuestion(q).passed);}});
for(const [raw,expected,allow] of [['4/5','4/5',true],['0.8','4/5',true],['0,8','4/5',true],['8/10','4/5',true],['1/√3','sqrt(3)/3',false],['√3/3','sqrt(3)/3',false],['√2/2','sqrt(2)/2',false],['sqrt(12)/6','sqrt(3)/3',false],['-2','-2',true]])test(`Exact checker ${raw}`,()=>assert.equal(M.exact(M.parseAnswer(raw,allow)),expected));
for(const raw of ['','1/0','0/0','0.577','eval(1)','alert(1)','2+2','Infinity','NaN','<script>','2/3/4','√-3'])test(`Reject invalid/exact-inexact input ${raw||'(empty)'}`,()=>assert.equal(M.parseAnswer(raw,false),null));
for(const legs of [[3,4],[5,12],[6,8],[8,15]])for(const rotation of [0,15,28,45,60,90,120,145,180,200,240,270,300,330,359])for(const mirror of [false,true])for(const target of [1,2])test(`Geometry ${legs} ${rotation} mirror=${mirror} target=${target}`,()=>{
  const t=G.build({legs,rotation,mirror,target});assert(G.validateRightTriangle(t));assert(G.validateGeometry(t,true,false).passed);assert(G.validateGeometry(t,true,true).passed);
  const g=G.geometry(t,true),names=Object.keys(t.vertices);assert.equal(g.angle.vertex,names[target]);assert.equal(G.getHypotenuse(t),'BC');
  for(const l of g.lines){const pixel=Math.hypot(l.a.x-l.b.x,l.a.y-l.b.y);assert(M.near(pixel/l.length,t.scale));}
  const right=t.vertices[t.rightAngleVertex],marker=g.marker;const v1={x:marker[0].x-right.x,y:marker[0].y-right.y},v2={x:marker[2].x-right.x,y:marker[2].y-right.y};assert(Math.abs(v1.x*v2.x+v1.y*v2.y)<1e-8);
  const svg=G.renderTriangle(t,{interactive:true,showLengths:true});for(const id of G.sides(t)){assert(svg.includes(`data-edge="${id}"`));assert(svg.includes(`data-side="${id}"`));assert(svg.includes(`data-length-side="${id}"`));}assert(!svg.includes('<text transform='));
});
const raw=Q.generateBank(),bank=V.validateBank(raw).valid;
test('Bank sizes and minimum coverage',()=>{assert.equal(bank.length,228);assert.equal(V.validateBank(raw).rejected.length,0);assert.deepEqual([1,2,3,4,5,6].map(map=>bank.filter(q=>q.map===map).length),[30,40,30,36,32,60]);assert.equal(new Set(bank.map(q=>q.id)).size,228);});
for(const q of bank)test(`Three-layer validation ${q.id}`,()=>{const report=V.validateQuestion(q);for(const key of ['mathValidation','geometryValidation','answerValidation','explanationValidation'])assert(report[key].passed,`${q.id} ${key}`);assert(report.passed);assert.equal(q.status,'validated');});
for(const mutation of ['side-length','coordinate','right-vertex','target-vertex','answer','explanation','prompt','label-identity'])test(`Mutation must be rejected: ${mutation}`,()=>{
  const q=clone(bank.find(q=>q.map===3)),t=q.mathData.triangle;
  if(mutation==='side-length')t.sideLengths[Object.keys(t.sideLengths)[0]]+=1;
  if(mutation==='coordinate')t.vertices[t.rightAngleVertex].x+=30;
  if(mutation==='right-vertex')t.rightAngleVertex=t.targetAngleVertex;
  if(mutation==='target-vertex')t.targetAngleVertex=t.rightAngleVertex;
  if(mutation==='answer')q.answer={n:1,d:99,r:1};
  if(mutation==='explanation')q.explanation='Wrong side analysis';
  if(mutation==='prompt')q.prompt='Wrong target prompt';
  if(mutation==='label-identity'){const keys=Object.keys(t.vertices);[t.vertices[keys[0]],t.vertices[keys[1]]]=[t.vertices[keys[1]],t.vertices[keys[0]]];}
  assert(!V.validateQuestion(q).passed);
});
test('Bad exact table answer is rejected',()=>{const q=clone(bank.find(q=>q.type==='special-angle'));q.answer={n:1,d:3,r:1};assert(!V.validateQuestion(q).passed);});
test('Bad complementary equality is rejected',()=>{const q=clone(bank.find(q=>q.type==='complementary'));q.answer.angle++;assert(!V.validateQuestion(q).passed);});
for(let trial=0;trial<100;trial++)test(`Run selection ${trial}`,()=>{
  for(let map=1;map<=6;map++){const ids=Q.pickRun(bank,map);assert.equal(ids.length,Trig.CONFIG.MAPS[map-1].count);assert.equal(new Set(ids).size,ids.length);assert(ids.every(id=>bank.some(q=>q.id===id&&q.status==='validated')));
    const selected=ids.map(id=>bank.find(q=>q.id===id));
    assert.deepEqual(['easy','normal','challenge'].map(level=>selected.filter(q=>q.difficulty===level).length),map===4?[4,6,2]:map===6?[5,7,3]:[3,5,2]);
    if(map===1){assert.equal(selected[1].pairId,selected[2].pairId);assert.notEqual(selected[1].mathData.triangle.targetAngleVertex,selected[2].mathData.triangle.targetAngleVertex);assert.deepEqual(selected[1].mathData.triangle.vertices,selected[2].mathData.triangle.vertices);}
    if(map===2){assert(M.FUNCTIONS.every(fn=>selected.some(q=>q.mathData.fn===fn)));assert(selected.some(q=>q.type==='reciprocal'));assert(selected.some(q=>q.mathData.group==='sincos'));assert(selected.some(q=>q.mathData.group==='positive'));}
    if(map===4)assert.equal(new Set(selected.map(q=>`${q.mathData.fn}${q.mathData.angle}`)).size,12);
    if(map===6)assert.deepEqual(selected.map(q=>q.phase),[1,1,1,2,2,2,3,3,3,4,4,4,5,5,5]);
  }
});
test('Accuracy is attempts-based and stars do not depend on speed',()=>{assert.equal(S.accuracy(10,20),.5);assert.equal(S.stars({accuracy:1,maxCombo:10,seconds:5000}),3);assert.equal(S.stars({accuracy:.75,maxCombo:1}),2);assert.equal(S.stars({accuracy:.74,maxCombo:10}),1);assert.equal(S.stars({accuracy:.9,maxCombo:3}),2);});
test('Hints and errors reduce points more than speed adds',()=>{const clean={streak:1,wrong:false,hint:false,seconds:30};assert.equal(S.points(clean),100);assert(S.points({...clean,hint:true})<100);assert(S.points({...clean,wrong:true})<90);assert.equal(S.points({...clean,seconds:1})-100,5);});
test('Session fallback when localStorage is unavailable',()=>{const d=Store.fresh();d.session={map:1,index:3};assert.equal(Store.save(d),false);assert.equal(Store.load().session.index,3);});
test('Progression, replay bests, weighted totals, boss flag',()=>{const d=Store.fresh();for(let map=1;map<=6;map++)Store.record(d,{map,score:1000,seconds:240,correct:10,attempts:12,accuracy:10/12,maxCombo:5,stars:2});assert.equal(d.unlocked,6);assert(d.bossClear);assert.equal(d.totals.correct,60);assert.equal(d.totals.attempts,72);Store.record(d,{map:1,score:500,seconds:400,correct:10,attempts:14,accuracy:10/14,maxCombo:3,stars:1});assert.equal(d.maps[1].bestScore,1000);assert.equal(d.maps[1].bestTime,240);assert.equal(d.maps[1].stars,2);assert.equal(d.maps[1].plays,2);assert.equal(d.session,null);});
test('All six achievements can unlock through real result rules',()=>{const d=Store.fresh();for(let map=1;map<=6;map++){const r={map,score:1500,seconds:300,correct:12,attempts:12,accuracy:1,maxCombo:12,stars:3};Store.record(d,r);Trig.Achievements.check(d,r);}assert.equal(d.achievements.length,6);assert.equal(Trig.Achievements.totals(d).stars,15);assert.equal(Trig.Achievements.rank(d),'CHỈ HUY PHÁO ĐÀI');});
test('Entrypoints and local references exist',()=>{const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){assert(!/^https?:/.test(m[1]),'Must work offline');assert(fs.existsSync(path.join(root,m[1])),m[1]);}});
test('Exported question bank matches runtime generator',()=>assert.deepEqual(JSON.parse(fs.readFileSync(path.join(__dirname,'../data/questions.json'),'utf8')),bank));
const report={date:new Date().toISOString(),passed,failed,total:passed+failed,questionCounts:[30,40,30,36,32,60],results};
fs.writeFileSync(path.join(__dirname,'automated-results.json'),JSON.stringify(report,null,2));
console.log(`${failed?'FAIL':'PASS'}: ${passed}/${passed+failed} checks; 228 questions validated.`);process.exitCode=failed?1:0;
