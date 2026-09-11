(function(){
  'use strict';
  const report=[],assert=(ok,label)=>{report.push({label,passed:!!ok});if(!ok)throw Error(label);};
  const click=sel=>{const el=document.querySelector(sel);if(!el)throw Error('Missing UI '+sel);el.click();};
  const key=el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  const submit=sel=>document.querySelector(sel).dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  function answerThroughUI(app){
    const game=app.game,q=game.q,a=q.answer;
    if(q.type==='identify-side'||q.type==='drag-side')key(document.querySelector(`[data-side="${a}"]`));
    else if(['build-ratio','reciprocal','bound-ratio'].includes(q.type)){
      const vals=Array.isArray(a)?a:[a];vals.forEach((v,i)=>{key(document.querySelector(`[data-token="${v}"]`));click(`[data-drop="${i}"]`);});click('[data-activate]');
    }else if(q.type==='calculate-ratio'){document.querySelector('#ratio-answer').value=Trig.MathEngine.exact(a);submit('.calculate-form');}
    else if(q.type==='special-angle'){const el=Array.from(document.querySelectorAll('[data-crystal]')).find(el=>el.getAttribute('aria-label').endsWith(': '+Trig.MathEngine.exact(a)));click('[data-seal]');el.click();}
    else if(q.type==='complementary'){key(document.querySelector('[data-source]'));const el=Array.from(document.querySelectorAll('[data-target]')).find(el=>el.textContent.replace(/\s/g,'')===`${a.fn}${a.angle}°`);el.click();}
    assert(game.run.solved,'UI answer accepted: '+q.id);click('[data-next]');
  }
  async function run(){
    report.length=0;const app=Trig.app;app.closeGame();app.save=Trig.Storage.fresh();app.persist();app.menu();
    try{
      await app.audio.unlock();assert(app.audio.status().state==='running','Web Audio context running after interaction');
      assert(app.isUnlocked(1)&&!app.isUnlocked(2)&&!app.isUnlocked(6),'Initial progression locks');
      click('#start-journey');click('[data-map-id="1"]');click('[data-enter]');assert(app.view==='game'&&app.game.run.map===1,'Menu → world map → Map 1');
      const phases=[];
      for(let map=1;map<=6;map++){
        const count=app.game.run.ids.length;const scene=app.audio.status().scene;assert(scene===Trig.CONFIG.MAPS[map-1].scene,'Separate audio scene '+map);
        for(let i=0;i<count;i++){
          if(map===1&&i===0){const game=app.game,before=game.run.score,wrong=Trig.Triangle.sides(game.q.mathData.triangle).find(s=>s!==game.q.answer);key(document.querySelector(`[data-side="${wrong}"]`));assert(game.run.attempts===1&&!game.run.solved&&game.run.streak===0,'Incorrect answer keeps question and resets combo');click('[data-hint]');assert(game.run.hintUsed,'Hint recorded');game.setPause(true);const seconds=game.run.seconds;game.tick();assert(game.run.seconds===seconds,'Pause freezes timer');game.setPause(false);game.checkpoint();const saved=Trig.Storage.load().session;assert(saved.index===0&&saved.wrong&&saved.hintUsed,'Wrong/hint/current question saved');app.start(1,true);assert(app.game.run.wrong&&app.game.run.hintUsed&&app.game.run.attempts===1,'Reloaded session preserves attempts');}
          if(map===3&&i===0){document.querySelector('#ratio-answer').value='1/0';submit('.calculate-form');assert(app.game.run.attempts===0&&!app.game.run.solved,'Invalid fraction does not consume an attempt');document.querySelector('.scratchpad textarea').value='3² + 4²';document.querySelector('.scratchpad textarea').dispatchEvent(new Event('input',{bubbles:true}));assert(Trig.Storage.load().session.scratch==='3² + 4²','Scratch pad saved');}
          if(map===6){phases.push(app.game.q.phase);if(i===0){const b=app.game.boss,g=app.game,before=g.run.hearts;b.data.danger=b.data.lane;click('[data-block]');b.attack(false);assert(g.run.hearts===before&&b.data.shield===2,'Boss shield absorbs a real attack');b.data.danger=0;b.move(2);b.attack(false);assert(g.run.hearts===before,'Boss lane dodge avoids damage');b.attack(true);assert(g.run.hearts===before-.25,'Wrong answer counterattack costs quarter heart');g.run.hearts=.25;b.attack(true);assert(g.paused&&document.querySelector('[data-recover]'),'Energy depletion offers checkpoint recovery');click('[data-recover]');assert(g.run.hearts===3&&!g.paused&&g.run.index===0,'Recovery retains boss progress');}}
          answerThroughUI(app);
        }
        assert(app.view==='result'&&!!app.save.maps[map],'Map completion and result saved '+map);
        assert(app.save.session===null,'Completed run clears resume slot '+map);
        if(map<6){assert(app.isUnlocked(map+1),'Next map unlock '+map);click('[data-next-map]');}
      }
      assert(JSON.stringify(phases)==='[1,1,1,2,2,2,3,3,3,4,4,4,5,5,5]','Boss all five phases played');
      assert(app.save.bossClear&&app.save.maps[6].stars===3,'Boss defeated and stars saved');assert(app.save.achievements.length===6,'All six achievements reachable');
      const persisted=Trig.Storage.load();assert(persisted.bossClear&&persisted.totals.correct===67,'Victory survives storage reload');
      app.world();assert(document.querySelectorAll('.map-node.completed').length===6,'All completed maps visible');
      app.start(1);assert(app.game.run.index===0,'Replay starts a new run');app.closeGame();
      app.teacher.open();document.getElementById('teacher-password').value='incorrect';submit('#teacher-login');assert(!app.teacher.authenticated&&document.getElementById('teacher-error').textContent,'Teacher rejects incorrect PIN');document.getElementById('teacher-password').value=Trig.CONFIG.TEACHER_PASSWORD;submit('#teacher-login');assert(app.teacher.authenticated&&app.view==='teacher','Teacher accepts configured PIN');
      assert(document.querySelectorAll('.question-list button').length===30,'Teacher bank shows all Map 1 questions');click('[data-teacher-map="6"]');assert(document.querySelectorAll('.question-list button').length===60,'Teacher bank shows all 60 Boss questions');assert(document.querySelectorAll('.validation-flags .pass').length===4,'Teacher shows all validation layers');
      const score=app.save.totals.score;click('[data-preview]');assert(app.game.preview,'Teacher Boss preview');answerThroughUI(app);app.closeGame();assert(app.save.totals.score===score,'Teacher preview does not alter real scores');app.teacher.show();click('[data-unlock]');assert(app.save.teacherUnlockAll,'Teacher unlock all action');
      click('[data-reset]');assert(document.querySelector('[data-cancel]'),'Reset requires confirmation');click('[data-cancel]');assert(app.save.bossClear,'Cancel reset preserves progress');click('[data-reset]');click('[data-confirm]');assert(Object.keys(app.save.maps).length===0&&app.save.unlocked===1,'Confirmed reset clears only fixture save');
      app.audio.pause();report.push({label:'Integration flow complete',passed:true});
    }catch(err){report.push({label:err.message,passed:false});console.error(err);}
    const out=document.createElement('section');out.id='integration-report';out.style.cssText='position:relative;z-index:30;background:#082936;color:#e4f6eb;padding:25px;max-width:1100px;margin:20px auto';out.innerHTML=`<h1>${report.every(x=>x.passed)?'PASS':'FAIL'} · ${report.filter(x=>x.passed).length}/${report.length} integration checks</h1><pre style="white-space:pre-wrap;line-height:1.6">${report.map(x=>(x.passed?'✓ ':'✕ ')+x.label).join('\n')}</pre>`;document.body.append(out);app.closeGame();out.scrollIntoView();
    window.QA_RESULT={passed:report.every(x=>x.passed),checks:report};
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const params=new URLSearchParams(location.search),view=params.get('view'),map=Number(params.get('map'));
    if(view==='game'&&map>=1&&map<=6){Trig.app.teacher.authenticated=true;Trig.app.start(map,false,true);}
    else if(view==='world'){Trig.app.world();}
    else if(view==='teacher'){Trig.app.teacher.authenticated=true;Trig.app.teacher.show();}
    else if(view==='run'){const button=document.createElement('button');button.id='run-integration';button.className='primary';button.style.cssText='position:fixed;top:12px;left:300px;z-index:100';button.textContent='RUN ISOLATED INTEGRATION QA';button.onclick=()=>{button.remove();run();};document.body.append(button);}
  });
})();
