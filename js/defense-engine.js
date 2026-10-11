(function(T){
'use strict';
const D=T.RouteData;
function Engine(map,saved){
 let canvas=null,ctx=null,images={},hooks={},reducedMotion=false;
 const imagePaths=[...Object.values(D.TOWERS).flatMap(t=>t.icons),...Object.values(D.ENEMIES).map(e=>e.icon),...D.SOLDIER_ICONS,...D.MAPS.map(m=>m.background),'assets/images/castle.svg'];
 let state=makeState(map);state.allowedTowers=Object.keys(D.TOWERS).filter(type=>map>=D.TOWER_UNLOCKS[type].availableFromMap);
  function makeState(mapId,options={}){
    const path=D.PATHS[mapId],towerSpots=D.TOWER_SPOTS_BY_MAP[mapId];
    const questions=[],basePoint=path[path.length-1];
    return {
      schema:3,mode:'prepare',nextId:1,recoveries:0,waveGold:0,lastEvent:'Kéo tháp vào ô + và giải bản vẽ trước mỗi wave.',mapId,map:D.MAPS[mapId-1],path,towerSpots,basePos:{x:basePoint.x,y:basePoint.y},questions,questionResults:[],
      wave:0,waveActive:false,spawning:false,baseHp:options.baseHp||20,maxHp:options.baseHp||20,energy:options.energy??120,battleCoins:0,kills:0,score:0,towersBuilt:0,
      enemies:[],towers:[],soldiers:[],projectiles:[],particles:[],selectedShop:null,selectedTower:null,selectedEnemy:null,dragPreview:null,
      paused:false,speed:1,ended:false,spawnQueue:[],spawnTimer:0,boostUntil:0,comboBuffUntil:0,elapsed:0,
      waveAnswerCorrect:null,waveKillEnergy:15,waveSpec:null,combo:0,maxCombo:0,infoTimer:0,
      allowedTowers:options.allowedTowers||Object.keys(D.TOWERS),teacherMode:!!options.teacherMode,teacherSkipQuestions:!!options.teacherSkipQuestions,invincible:!!options.invincible
    };
  }

  function current(){return state}
  function uid(){return "unit-"+(state.nextId++)}

  function buildWaveSpec(wave){
    if(!state||wave<1||wave>state.map.count)return null;
    const stage=wave===state.map.count?4:((wave-1)%3)+1;const meta=D.WAVE_TYPES?.[stage]||{id:'normal',name:'Thường',icon:'•',desc:''};
    const [typeA,typeB]=state.map.enemies,baseCount=5+Math.floor((wave-1)*.65)+state.mapId,types=[];
    for(let i=0;i<baseCount;i++){
      let type;
      if(meta.typeBHeavy)type=(i%3===0)?typeA:typeB;
      else type=(i%3===0||(wave>=3&&i%4===1))?typeB:typeA;
      types.push(type);
    }
    if(wave===state.map.count)types.push(typeA,typeB,state.map.boss);
    const counts={};types.forEach(t=>counts[t]=(counts[t]||0)+1);
    return {...meta,wave,types,count:types.length,counts,typeA,typeB,boss:wave===state.map.count?state.map.boss:null,bossDef:wave===state.map.count?D.ENEMIES[state.map.boss]:null,bossSkill:wave===state.map.count?D.BOSS_SKILLS?.[state.map.boss]:null};
  }
  function getWavePreview(wave){const s=buildWaveSpec(wave);if(!s)return null;return {...s,types:undefined}}

  function beginWave(wave){
    state.wave=wave;state.mode='fighting';state.waveGold=0;state.lastEvent='Wave '+wave+': robot đang tiến tới căn cứ.';state.waveActive=true;state.spawning=true;state.waveSpec=buildWaveSpec(wave);
    state.spawnQueue=state.waveSpec.types.slice();state.spawnTimer=.15;
    hooks.onWaveStarted?.(wave,getWavePreview(wave));emitState();
  }

  function spawnEnemy(type){
    const def=D.ENEMIES[type];if(!def)return null;
    const spec=state.waveSpec||D.WAVE_TYPES?.[state.wave]||{},scale=1+(state.mapId-1)*.08+(Math.max(1,state.wave)-1)*.075;
    const hp=def.hp*scale*(spec.hpMult||1),p0=state.path[0],armor=(def.armor||0)+(spec.armorBonus||0);
    const e={id:uid(),type,def,x:p0.x,y:p0.y,pathIndex:0,hp,maxHp:hp,shield:0,maxShield:0,armor,
      speed:def.speed*(1+(state.mapId-1)*.018)*(spec.speedMult||1),slowUntil:0,slowFactor:1,dead:false,flash:0,size:def.size||(def.boss?84:38),blockedBy:null,attackCooldown:0,attackMult:1,bossStage:0};
    if(def.boss&&type==='m3_boss'){e.shield=e.maxShield=Math.round(240*scale)}
    state.enemies.push(e);return e;
  }

  function selectShop(){/* chỉ xây bằng kéo-thả */}
  function nearestOpenSpot(x,y,maxDist=92){let best=null,dist=Infinity;(state?.towerSpots||[]).forEach((spot,i)=>{if(state.towers.some(t=>t.spotIndex===i))return;const d=Math.hypot(x-spot.x,y-spot.y);if(d<dist){dist=d;best={...spot,i}}});return best&&dist<=maxDist?{...best,dist}:null}
  function placeTowerAt(type,x,y){
    if(!state||state.ended||state.paused)return false;const def=D.TOWERS[type];if(!def)return false;
    if(!state.teacherMode&&!state.allowedTowers.includes(type)){hooks.onToast?.('Tháp này chưa được mở khóa');return false}
    const best=nearestOpenSpot(x,y);if(!best){hooks.onToast?.('Hãy thả tháp vào một vị trí có dấu +');return false}
    if(state.energy<def.cost){hooks.onToast?.('Không đủ ⚡ Năng lượng');return false}
    state.energy-=def.cost;state.towersBuilt++;
    const tower={id:uid(),type:def.id,def,x:best.x,y:best.y,spotIndex:best.i,level:1,branch:null,cooldown:0,kills:0,spawnCooldown:0};state.towers.push(tower);
    state.selectedTower=tower;state.selectedEnemy=null;state.dragPreview=null;spawnParticle(tower.x,tower.y,tower.def.color,24);floatText(tower.x,tower.y-48,'ĐÃ XÂY!','#baffef');T.routeAudio?.sfx('click');hooks.onEnemySelected?.(null);hooks.onTowerSelected?.(tower);emitState();return true;
  }
  function clientToCanvas(clientX,clientY){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/canvas.width,r.height/canvas.height),rw=canvas.width*scale,rh=canvas.height*scale,ox=(r.width-rw)/2,oy=(r.height-rh)/2,lx=clientX-r.left-ox,ly=clientY-r.top-oy;if(lx<0||ly<0||lx>rw||ly>rh)return null;return{x:lx/scale,y:ly/scale}}
  function previewDraggedTower(type,clientX,clientY){if(!state||state.ended)return null;const p=clientToCanvas(clientX,clientY);if(!p){state.dragPreview=null;draw();return null}const def=D.TOWERS[type],spot=nearestOpenSpot(p.x,p.y),unlocked=state.teacherMode||state.allowedTowers.includes(type),affordable=!!def&&state.energy>=def.cost;state.dragPreview={type,pointerX:p.x,pointerY:p.y,spotIndex:spot?.i??-1,x:spot?.x??p.x,y:spot?.y??p.y,valid:!!spot&&affordable&&unlocked,affordable,unlocked};draw();return state.dragPreview}
  function dropDraggedTower(type,clientX,clientY){if(!state)return false;const p=clientToCanvas(clientX,clientY);state.dragPreview=null;if(!p){draw();hooks.onToast?.('Kéo tháp vào khu vực chiến đấu rồi thả tại dấu +');return false}const ok=placeTowerAt(type,p.x,p.y);draw();return ok}
  function cancelTowerDrag(){if(state){state.dragPreview=null;draw()}}

  function selectAt(x,y){
    if(!state)return false;
    let enemy=null,ed=Infinity;for(const e of state.enemies){if(e.dead)continue;const d=Math.hypot(x-e.x,y-e.y);if(d<ed){ed=d;enemy=e}}
    if(enemy&&ed<Math.max(32,enemy.size*.65)){state.selectedEnemy=enemy;state.selectedTower=null;hooks.onTowerSelected?.(null);hooks.onEnemySelected?.(enemy);draw();return true}
    let tower=null,td=Infinity;for(const t of state.towers){const d=Math.hypot(x-t.x,y-t.y);if(d<td){td=d;tower=t}}
    if(tower&&td<44){state.selectedTower=tower;state.selectedEnemy=null;hooks.onEnemySelected?.(null);hooks.onTowerSelected?.(tower);draw();return true}
    state.selectedTower=null;state.selectedEnemy=null;hooks.onTowerSelected?.(null);hooks.onEnemySelected?.(null);draw();return false;
  }

  function upgradeCost(def,currentLevel){if(!def||currentLevel>=3)return null;return Math.round(def.cost*(currentLevel===1?.75:1.10))}
  function upgradeSelected(branchId=null){
    const t=state?.selectedTower;if(!t||state.ended||state.paused||t.level>=3)return false;
    if(t.level===2){const branches=D.TOWER_BRANCHES?.[t.type]||[];if(!branchId||!branches.some(b=>b.id===branchId)){hooks.onBranchRequired?.(t,branches);return 'branch_required'}}
    const cost=upgradeCost(t.def,t.level);if(state.energy<cost){hooks.onToast?.('Không đủ ⚡ để nâng cấp');return false}
    state.energy-=cost;if(t.level===2)t.branch=branchId;t.level++;t.spawnCooldown=0;
    if(t.type==='barracks'){
      const st=towerStats(t);state.soldiers.filter(s=>!s.dead&&s.towerId===t.id).forEach(s=>{const ratio=s.hp/s.maxHp;s.level=t.level;s.maxHp=st.soldierHp;s.hp=Math.max(1,st.soldierHp*ratio);s.damage=st.soldierDamage;s.attackRate=st.soldierRate});
    }
    spawnParticle(t.x,t.y,t.def.color,36);floatText(t.x,t.y-52,t.branch?`MỞ NHÁNH: ${branchName(t)}`:`NÂNG CẤP ${t.level}!`,'#fff3a4');T.routeAudio?.sfx('correct');hooks.onTowerSelected?.(t);emitState();return true;
  }
  function branchName(t){return (D.TOWER_BRANCHES?.[t.type]||[]).find(b=>b.id===t.branch)?.name||''}
  function sellSelected(){const t=state?.selectedTower;if(!t||state.ended||state.paused)return false;const invested=t.def.cost+[...Array(t.level-1)].reduce((sum,_,i)=>sum+upgradeCost(t.def,i+1),0),refund=Math.round(invested*.75);state.energy+=refund;state.soldiers.filter(s=>s.towerId===t.id).forEach(s=>releaseSoldier(s,true));state.towers=state.towers.filter(x=>x!==t);state.selectedTower=null;hooks.onTowerSelected?.(null);emitState();return true}

  function towerStats(t){
    const branch=(D.TOWER_BRANCHES?.[t.type]||[]).find(b=>b.id===t.branch),mods=branch?.mods||{};
    if(t.def.barracks){const lv=t.level;let hp=[0,100,165,240][lv],dmg=[0,7,12,18][lv],rate=[0,.72,.66,.60][lv],respawn=[0,8,6,4.5][lv];if(lv===3&&branch){hp*=mods.soldierHp||1;dmg*=mods.soldierDamage||1;respawn*=mods.respawn||1}return {damage:0,range:0,rate:0,maxSoldiers:lv,soldierHp:hp,soldierDamage:dmg,soldierRate:rate,respawn,branch}}
    const mult=1+(t.level-1)*.38;let damage=t.def.damage*mult,range=t.def.range*(1+(t.level-1)*.06),rate=t.def.rate*(1-(t.level-1)*.08),slow=t.def.slow||0,slowTime=t.def.slowTime||0,chain=t.def.chain||1,armorPierce=0;
    if(t.level===3&&branch){damage*=mods.damage||1;range*=mods.range||1;rate*=mods.rate||1;slow=Math.min(.78,slow+(mods.slowBonus||0));slowTime*=mods.slowTime||1;chain+=mods.chainBonus||0;armorPierce=mods.armorPierce||0}
    return {damage,range,rate,slow,slowTime,chain,armorPierce,branch};
  }

  function update(dt){
    if(!state||state.paused||state.ended||state.mode!=='fighting')return;dt=Math.min(.1,Math.max(0,dt));state.elapsed+=dt;if(state.selectedEnemy){state.infoTimer-=dt;if(state.infoTimer<=0){state.infoTimer=.2;hooks.onEnemySelected?.(state.selectedEnemy)}}
    if(state.spawning){state.spawnTimer-=dt;if(state.spawnTimer<=0){const type=state.spawnQueue.shift();if(type)spawnEnemy(type);const mult=state.waveSpec?.spawnMult||1;state.spawnTimer=Math.max(.27,Math.max(.34,.98-state.wave*.055)*mult);if(!state.spawnQueue.length)state.spawning=false}}
    updateBarracks(dt);updateSoldiers(dt);updateEnemies(dt);if(state.ended)return;updateTowers(dt);updateProjectiles(dt);updateParticles(dt);
    state.enemies=state.enemies.filter(e=>!e.dead);state.soldiers=state.soldiers.filter(s=>!s.dead);state.projectiles=state.projectiles.filter(p=>!p.dead);state.particles=state.particles.filter(p=>p.life>0);
    if(state.mode==='fighting'&&state.waveActive&&!state.spawning&&state.enemies.length===0){state.waveActive=false;state.mode='clear';state.energy+=25;state.lastEvent='Wave '+state.wave+' hoàn tất. +25 năng lượng.';hooks.onWaveReady?.(state.wave+1,getWavePreview(state.wave+1))}
  }

  function closestPointOnPath(x,y){let best={x:state.path[0].x,y:state.path[0].y,dist:Infinity,dx:1,dy:0};for(let i=0;i<state.path.length-1;i++){const a=state.path[i],b=state.path[i+1],vx=b.x-a.x,vy=b.y-a.y,len2=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/len2)),px=a.x+t*vx,py=a.y+t*vy,d=Math.hypot(x-px,y-py);if(d<best.dist){const len=Math.sqrt(len2);best={x:px,y:py,dist:d,dx:vx/len,dy:vy/len}}}return best}
  function updateBarracks(dt){for(const t of state.towers){if(t.type!=='barracks')continue;t.spawnCooldown-=dt;const st=towerStats(t),alive=state.soldiers.filter(s=>!s.dead&&s.towerId===t.id).length;if(alive>=st.maxSoldiers||t.spawnCooldown>0)continue;spawnSoldier(t,alive,st);t.spawnCooldown=(alive+1<st.maxSoldiers)?1.25:st.respawn}}
  function spawnSoldier(t,index,st){const cp=closestPointOnPath(t.x,t.y),perpX=-cp.dy,perpY=cp.dx,offset=(index-(st.maxSoldiers-1)/2)*24,homeX=cp.x+perpX*offset,homeY=cp.y+perpY*offset;const s={id:uid(),towerId:t.id,level:t.level,x:homeX,y:homeY,homeX,homeY,hp:st.soldierHp,maxHp:st.soldierHp,damage:st.soldierDamage,attackRate:st.soldierRate,attackCooldown:.2,enemyId:null,dead:false};state.soldiers.push(s);spawnParticle(homeX,homeY,'#9af5ff',12);floatText(homeX,homeY-32,'ROBOT GÁC XUẤT KÍCH','#baf9ff')}
  function updateSoldiers(dt){
    for(const s of state.soldiers){if(s.dead)continue;s.attackCooldown-=dt;let e=s.enemyId?state.enemies.find(x=>x.id===s.enemyId&&!x.dead):null;
      if(!e){s.enemyId=null;const candidates=state.enemies.filter(x=>!x.dead&&!x.blockedBy&&Math.hypot(x.x-s.homeX,x.y-s.homeY)<=62);candidates.sort((a,b)=>b.pathIndex-a.pathIndex);e=candidates[0]||null;if(e){s.enemyId=e.id;e.blockedBy=s.id;e.attackCooldown=.35}}
      if(!e){s.x+=(s.homeX-s.x)*Math.min(1,dt*7);s.y+=(s.homeY-s.y)*Math.min(1,dt*7);continue}
      e.blockedBy=s.id;const dist=Math.hypot(e.x-s.x,e.y-s.y);if(dist>34){s.x+=(e.x-s.x)/dist*Math.min(dist-30,80*dt);s.y+=(e.y-s.y)/dist*Math.min(dist-30,80*dt)}
      if(s.attackCooldown<=0){s.attackCooldown=s.attackRate;const dealt=applyDamage(e,s.damage,0);e.flash=.08;spawnParticle(e.x,e.y,'#dffaff',3);if(hooks.showDamage?.())floatText(e.x,e.y-26,`-${Math.round(dealt)}`,'#dffaff');maybeTriggerBossSkill(e);if(e.hp<=0)killEnemy(e,null)}
      e.attackCooldown=(e.attackCooldown||0)-dt;if(e.attackCooldown<=0&&!e.dead){e.attackCooldown=e.def.attackRate||1;s.hp-=(e.def.attack||10)*(e.attackMult||1);spawnParticle(s.x,s.y,'#ff8291',4);if(hooks.showDamage?.())floatText(s.x,s.y-24,`-${Math.round((e.def.attack||10)*(e.attackMult||1))}`,'#ff9aa5');if(s.hp<=0){releaseSoldier(s,false);floatText(s.x,s.y-30,'ROBOT GÁC BỊ HẠ','#ff9aa5')}}
    }
  }
  function releaseSoldier(s,silent){if(!s||s.dead)return;s.dead=true;const e=state.enemies.find(x=>x.blockedBy===s.id);if(e)e.blockedBy=null;s.enemyId=null;if(!silent)spawnParticle(s.x,s.y,'#ff7d88',10)}

  function updateEnemies(dt){
    for(const e of state.enemies){if(e.dead)continue;e.flash=Math.max(0,e.flash-dt);if(state.elapsed>e.slowUntil)e.slowFactor=1;maybeTriggerBossSkill(e);
      if(e.blockedBy){const s=state.soldiers.find(x=>x.id===e.blockedBy&&!x.dead);if(s)continue;e.blockedBy=null}
      let remaining=e.speed*e.slowFactor*dt;while(remaining>0&&!e.dead){const next=state.path[e.pathIndex+1];if(!next){reachBase(e);break}const dx=next.x-e.x,dy=next.y-e.y,dist=Math.hypot(dx,dy);if(dist<=remaining){e.x=next.x;e.y=next.y;e.pathIndex++;remaining-=dist;if(e.pathIndex>=state.path.length-1){reachBase(e);break}}else{e.x+=dx/dist*remaining;e.y+=dy/dist*remaining;remaining=0}}
    }
  }
  function bossSkillEvent(e,title,desc,color='#ffcf70'){hooks.onBossSkill?.({enemy:e,title,desc});hooks.onShake?.();floatText(e.x,e.y-e.size*.75,title,color);spawnParticle(e.x,e.y,color,30)}
  function maybeTriggerBossSkill(e){
    if(!e?.def?.boss||e.dead)return;const ratio=e.hp/e.maxHp;
    if(e.type==='m1_boss'&&e.bossStage===0&&ratio<=.60){e.bossStage=1;e.speed*=1.45;e.attackMult*=1.30;bossSkillEvent(e,'ĐỐT ĐỘNG CƠ!','Boss tăng tốc độ và sát thương.')}
    else if(e.type==='m2_boss'&&e.bossStage===0&&ratio<=.65){e.bossStage=1;if(e.blockedBy){const s=state.soldiers.find(x=>x.id===e.blockedBy);if(s)s.enemyId=null;e.blockedBy=null}const ni=Math.min(state.path.length-2,e.pathIndex+1),p=state.path[ni];e.pathIndex=ni;e.x=p.x;e.y=p.y;bossSkillEvent(e,'LƯỚT ĐƯỜNG RAY!','Boss dịch chuyển vượt qua một đoạn băng chuyền.','#73ddff')}
    else if(e.type==='m3_boss'&&e.bossStage===0&&ratio<=.50){e.bossStage=1;e.shield=e.maxShield=Math.max(e.shield,Math.round(e.maxHp*.22));bossSkillEvent(e,'GIÁP BÁNH RĂNG!','Boss tái tạo lá chắn hấp thụ sát thương.','#9ca8ff')}
    else if(e.type==='m4_boss'&&e.bossStage===0&&ratio<=.45){e.bossStage=1;const heal=e.maxHp*.20;e.hp=Math.min(e.maxHp,e.hp+heal);bossSkillEvent(e,'TỰ SỬA CHỮA!','Boss hồi 20% máu tối đa.','#85f4aa')}
    else if(e.type==='m5_boss'&&e.bossStage===0&&ratio<=.60){e.bossStage=1;spawnEnemy(state.map.enemies[0]);spawnEnemy(state.map.enemies[1]);bossSkillEvent(e,'TRIỆU HỒI ROBOT!','Boss gọi thêm hai robot hộ vệ.','#ff9d61')}
    else if(e.type==='m6_boss'){
      if(e.bossStage===0&&ratio<=.65){e.bossStage=1;e.shield=e.maxShield=Math.round(e.maxHp*.24);e.speed*=1.18;bossSkillEvent(e,'GIAI ĐOẠN II!','Titan dựng khiên và tăng tốc.','#d99bff')}
      else if(e.bossStage===1&&ratio<=.30){e.bossStage=2;spawnEnemy(state.map.enemies[1]);spawnEnemy(state.map.enemies[1]);spawnEnemy(state.map.enemies[0]);e.speed*=1.20;bossSkillEvent(e,'GIAI ĐOẠN CUỐI!','Titan gọi cận vệ và tăng tốc lần nữa.','#ff6fba')}
    }
  }
  function reachBase(e){if(e.dead)return;e.dead=true;if(e.blockedBy){const s=state.soldiers.find(x=>x.id===e.blockedBy);if(s)s.enemyId=null}if(state.selectedEnemy===e){state.selectedEnemy=null;hooks.onEnemySelected?.(null)}const dmg=e.def.baseDamage||(e.def.boss?10:1);if(state.invincible){floatText(state.basePos.x-20,state.basePos.y-70,'BẤT TỬ 🛡️','#8fffc8');return}state.baseHp=Math.max(0,state.baseHp-dmg);hooks.onShake?.();floatText(state.basePos.x-20,state.basePos.y-70,`-${dmg} ⚙`,'#ff6978');emitState();if(state.baseHp<=0)finish(false)}

  function updateTowers(dt){
    for(const t of state.towers){if(t.type==='barracks')continue;t.cooldown-=dt;if(t.cooldown>0)continue;const st=towerStats(t);const targets=state.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<=st.range).sort((a,b)=>b.pathIndex-a.pathIndex||distanceToNext(a)-distanceToNext(b));const target=targets[0];if(!target)continue;const boost=state.elapsed<state.boostUntil?1.25:1,comboBoost=state.elapsed<state.comboBuffUntil?1.15:1;t.cooldown=st.rate/(boost*comboBoost);
      if(t.type==='tesla'){hitEnemy(target,st.damage*boost*comboBoost,t,0,0,st.armorPierce);targets.slice(1,st.chain).forEach((e,idx)=>hitEnemy(e,st.damage*boost*comboBoost*(.72-idx*.08),t,0,0,st.armorPierce));spawnParticle(target.x,target.y,t.def.color,10);T.routeAudio?.sfx('shot')}
      else state.projectiles.push({x:t.x,y:t.y,target,damage:st.damage*boost*comboBoost,speed:t.def.projectileSpeed,color:t.def.color,tower:t,slow:st.slow,slowTime:st.slowTime,armorPierce:st.armorPierce||0,dead:false});
    }
  }
  function distanceToNext(e){const n=state.path[e.pathIndex+1];return n?Math.hypot(n.x-e.x,n.y-e.y):0}
  function updateProjectiles(dt){for(const p of state.projectiles){if(p.dead)continue;if(!p.target||p.target.dead){p.dead=true;continue}const dx=p.target.x-p.x,dy=p.target.y-p.y,dist=Math.hypot(dx,dy),step=p.speed*dt;if(dist<step+8){hitEnemy(p.target,p.damage,p.tower,p.slow,p.slowTime,p.armorPierce);p.dead=true;T.routeAudio?.sfx('shot');continue}p.x+=dx/dist*step;p.y+=dy/dist*step}}
  function applyDamage(e,raw,armorPierce=0){const armor=Math.max(0,(e.armor||0)*(1-Math.max(0,Math.min(.9,armorPierce)))),dmg=Math.max(1,raw-armor);let left=dmg;if(e.shield>0){const blocked=Math.min(e.shield,left);e.shield-=blocked;left-=blocked}if(left>0)e.hp-=left;return dmg}
  function hitEnemy(e,raw,tower,slow,slowTime,armorPierce=0){if(e.dead)return;const dmg=applyDamage(e,raw,armorPierce);e.flash=.08;if(slow){e.slowFactor=Math.max(.28,1-slow);e.slowUntil=state.elapsed+(slowTime||1)}if(T.routeAudio&&Math.random()<.28)T.routeAudio.sfx('hit');if(hooks.showDamage?.())floatText(e.x,e.y-28,`-${Math.round(dmg)}`,'#fff');maybeTriggerBossSkill(e);if(e.hp<=0)killEnemy(e,tower)}
  function killEnemy(e,tower){
    if(e.dead)return;e.dead=true;if(e.blockedBy){const s=state.soldiers.find(x=>x.id===e.blockedBy);if(s)s.enemyId=null;e.blockedBy=null}if(state.selectedEnemy===e){state.selectedEnemy=null;hooks.onEnemySelected?.(null)}if(tower)tower.kills++;state.kills++;state.battleCoins+=e.def.reward;
    const energyGain=state.waveKillEnergy===3?3:15;state.energy+=energyGain;state.waveGold+=energyGain;state.score+=Math.round(30+e.maxHp*.3);spawnParticle(e.x,e.y,e.def.boss?'#ffca67':'#74ddff',e.def.boss?34:10);if(e.def.boss)hooks.onShake?.();floatText(e.x,e.y-(e.def.boss?56:48),`+${energyGain} ⚡`,e.def.boss?'#ffd66e':'#82e9ff');hooks.onEnergyChanged?.(state.energy,energyGain,'enemy-killed');
    const energyEl=typeof document==='object'?document.getElementById('combat-gold'):null;if(energyEl)energyEl.textContent=Math.floor(state.energy);emitState();
  }

  function addEnergy(amount=200){if(!state)return;state.energy+=amount;hooks.onEnergyChanged?.(state.energy,amount,'teacher');emitState()}
  function clearEnemies(){if(!state)return;state.enemies.forEach(e=>{e.dead=true});state.soldiers.forEach(s=>{s.enemyId=null});state.enemies=[];state.spawnQueue=[];state.spawning=false;state.waveActive=false;state.selectedEnemy=null;hooks.onEnemySelected?.(null);emitState();draw()}
  function spawnBossNow(){if(!state)return;state.wave=Math.max(1,state.wave||1);state.waveSpec=buildWaveSpec(Math.min(D.MAX_WAVES||4,Math.max(1,state.wave)));const e=spawnEnemy(state.map.boss);state.waveActive=true;state.spawning=false;hooks.onToast?.('Đã gọi Boss để kiểm thử');emitState();return e}
  function setInvincible(v){if(!state)return false;state.invincible=v??!state.invincible;emitState();return state.invincible}
  function teacherJumpWave(wave){if(!state||!state.teacherMode)return false;wave=Math.max(1,Math.min(D.MAX_WAVES||4,Number(wave)||1));clearEnemies();state.wave=wave-1;state.ended=false;state.paused=false;state.waveAnswerCorrect=true;state.waveKillEnergy=15;beginWave(wave);return true}

  function spawnParticle(x,y,color,count){for(let i=0;i<count;i++)state.particles.push({x,y,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,color,life:.7+Math.random()*.5,size:2+Math.random()*5})}
  function updateParticles(dt){for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt}}

  function finish(){state.ended=true;state.mode='defeated';state.waveActive=false;state.lastEvent='Căn cứ đã hỏng. Sửa chữa và bố trí lại tháp để thử wave này.';hooks.onBattleEnd?.();}
  function floatText(x,y,text,color){hooks.onFloatText?.(x,y,text,color)}
  function setPause(v){if(!state||state.ended)return;state.paused=v??!state.paused;hooks.onPauseChanged?.(state.paused)}
  function toggleSpeed(){if(!state)return 1;state.speed=state.speed===1?2:1;return state.speed}
  function emitState(){if(state)hooks.onState?.(state)}
  

  function roundedRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function draw(){if(!ctx)return;if(!state){ctx.clearRect(0,0,canvas.width,canvas.height);return}drawBackground();drawPath();drawSpots();drawBase();drawTowers();drawSoldiers();drawEnemies();drawProjectiles();drawParticles();drawOverlay()}
  function drawBackground(){const bg=images[state.map.background];if(bg?.complete&&bg.naturalWidth!==0)ctx.drawImage(bg,0,0,1280,720);else{ctx.fillStyle='#0b2032';ctx.fillRect(0,0,1280,720)}const time=reducedMotion?0:state.elapsed||0,rg=ctx.createRadialGradient(640+Math.sin(time*.15)*120,250,0,640,250,620);rg.addColorStop(0,'rgba(90,220,255,.075)');rg.addColorStop(1,'rgba(0,0,0,.10)');ctx.fillStyle=rg;ctx.fillRect(0,0,1280,720);for(let i=0;i<28;i++){const x=(i*173+state.mapId*61+time*(5+i%4))%1340-30,y=(i*97+state.mapId*31+Math.sin(time*.5+i)*12)%720;ctx.globalAlpha=.08+(i%5)*.018;ctx.fillStyle=i%3?'#e1faff':'#80eaff';ctx.beginPath();ctx.arc(x,y,1.4+(i%3),0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
  function tracePath(){ctx.beginPath();state.path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y))}
  function drawPath(){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowBlur=30;ctx.shadowColor=state.map.accent+'66';ctx.strokeStyle='rgba(0,5,20,.82)';ctx.lineWidth=94;tracePath();ctx.stroke();ctx.shadowBlur=18;ctx.strokeStyle=state.map.accent+'88';ctx.lineWidth=68;tracePath();ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='rgba(8,22,48,.96)';ctx.lineWidth=58;tracePath();ctx.stroke();ctx.strokeStyle='rgba(184,246,255,.42)';ctx.lineWidth=3;ctx.setLineDash([5,21]);ctx.lineDashOffset=reducedMotion?0:-(state.elapsed||0)*38;tracePath();ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(119,129,255,.22)';ctx.lineWidth=16;tracePath();ctx.stroke();ctx.restore()}
  function drawSpots(){const pulse=.5+.5*Math.sin((state.elapsed||0)*3.2),dragging=!!state.dragPreview;state.towerSpots.forEach((spot,i)=>{if(state.towers.some(t=>t.spotIndex===i))return;const candidate=dragging&&state.dragPreview.spotIndex===i,valid=candidate&&state.dragPreview.valid;ctx.save();if(dragging){ctx.shadowBlur=candidate?30:18+8*pulse;ctx.shadowColor=valid?'rgba(94,255,183,.82)':candidate?'rgba(255,103,120,.72)':'rgba(80,219,255,.36)'}ctx.fillStyle=candidate?(valid?'rgba(68,235,166,.23)':'rgba(255,93,116,.18)'):dragging?`rgba(58,190,231,${.10+.06*pulse})`:'rgba(255,255,255,.055)';ctx.strokeStyle=candidate?(valid?'rgba(126,255,202,.98)':'rgba(255,118,135,.92)'):dragging?`rgba(112,223,255,${.48+.22*pulse})`:'rgba(210,238,255,.22)';ctx.lineWidth=candidate?3.4:dragging?2.4:1.8;ctx.beginPath();ctx.arc(spot.x,spot.y,31+(candidate?5:dragging?2*pulse:0),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=candidate?'#fff':dragging?'rgba(232,252,255,.90)':'rgba(226,241,250,.60)';ctx.font='800 22px sans-serif';ctx.textAlign='center';ctx.fillText(candidate?(valid?'✓':'×'):'+',spot.x,spot.y+7);ctx.restore()});if(state.dragPreview?.spotIndex>=0){const dp=state.dragPreview,def=D.TOWERS[dp.type],im=images[def?.icons?.[0]||def?.icon];ctx.save();ctx.globalAlpha=dp.valid?.8:.35;ctx.shadowBlur=28;ctx.shadowColor=dp.valid?(def?.color||'#7ff'):'#ff6478';if(im?.complete&&im.naturalWidth!==0)ctx.drawImage(im,dp.x-38,dp.y-45,76,76);ctx.restore()}}
  function drawBase(){const bp=state.basePos,im=images['assets/images/castle.svg'];if(im?.complete&&im.naturalWidth!==0)ctx.drawImage(im,bp.x-62,bp.y-88,124,116);else{ctx.fillStyle='#aac';ctx.fillRect(bp.x-40,bp.y-70,80,80)}ctx.fillStyle='rgba(0,0,0,.48)';roundedRect(bp.x-52,bp.y-101,104,13,7);ctx.fill();ctx.fillStyle=state.baseHp/state.maxHp>.4?'#58e389':'#ff5d6c';roundedRect(bp.x-50,bp.y-99,100*(state.baseHp/state.maxHp),9,5);ctx.fill();if(state.invincible){ctx.fillStyle='#8fffc8';ctx.font='900 11px sans-serif';ctx.textAlign='center';ctx.fillText('BẤT TỬ',bp.x,bp.y-112)}}
  function drawTowers(){for(const t of state.towers){const st=towerStats(t);ctx.save();if(state.selectedTower===t){if(t.type==='barracks'){const cp=closestPointOnPath(t.x,t.y);ctx.strokeStyle='rgba(142,238,255,.52)';ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(cp.x,cp.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(99,228,255,.08)';ctx.beginPath();ctx.arc(cp.x,cp.y,66,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(99,228,255,.45)';ctx.stroke()}else{const g=ctx.createRadialGradient(t.x,t.y,20,t.x,t.y,st.range);g.addColorStop(0,'rgba(73,225,255,.10)');g.addColorStop(1,'rgba(73,225,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(t.x,t.y,st.range,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(73,225,255,.48)';ctx.lineWidth=2;ctx.setLineDash([7,8]);ctx.stroke();ctx.setLineDash([])}}ctx.shadowBlur=22;ctx.shadowColor=t.def.color+'66';ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(t.x,t.y+25,31,11,0,0,Math.PI*2);ctx.fill();const icon=t.def.icons?.[Math.max(0,Math.min(2,t.level-1))]||t.def.icon,im=images[icon];if(im?.complete&&im.naturalWidth!==0)ctx.drawImage(im,t.x-38,t.y-46,76,76);ctx.shadowBlur=0;ctx.fillStyle=t.branch?'#291245':'#061423';ctx.strokeStyle=t.branch?'#e2b2ff':'rgba(255,255,255,.92)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(t.x+25,t.y-27,11,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='800 10px sans-serif';ctx.textAlign='center';ctx.fillText(t.level,t.x+25,t.y-23);ctx.restore()}}
  function drawSoldiers(){for(const s of state.soldiers){if(s.dead)continue;ctx.save();ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(s.x,s.y+18,18,6,0,0,Math.PI*2);ctx.fill();const im=images[D.SOLDIER_ICONS[Math.max(0,s.level-1)]];if(im?.complete&&im.naturalWidth!==0)ctx.drawImage(im,s.x-25,s.y-30,50,50);const bw=38;ctx.fillStyle='rgba(0,0,0,.55)';roundedRect(s.x-bw/2,s.y-35,bw,6,3);ctx.fill();ctx.fillStyle=s.hp/s.maxHp>.4?'#67e5a0':'#ff6571';roundedRect(s.x-bw/2+1,s.y-34,(bw-2)*Math.max(0,s.hp/s.maxHp),4,2);ctx.fill();if(s.enemyId){ctx.fillStyle='#ffe479';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('⚔',s.x,s.y-42)}ctx.restore()}}
  function drawEnemies(){for(const e of state.enemies){ctx.save();if(state.selectedEnemy===e){ctx.strokeStyle=e.def.boss?'#ffd878':'#76eaff';ctx.lineWidth=3;ctx.shadowBlur=18;ctx.shadowColor=ctx.strokeStyle;ctx.beginPath();ctx.arc(e.x,e.y,e.size*.68,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0}if(e.flash)ctx.globalAlpha=.55;ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(e.x,e.y+e.size*.43,e.size*.5,e.size*.16,0,0,Math.PI*2);ctx.fill();const im=images[e.def.icon];if(im?.complete&&im.naturalWidth!==0)ctx.drawImage(im,e.x-e.size/2,e.y-e.size/2,e.size,e.size);ctx.globalAlpha=1;const bw=e.def.boss?92:46,barY=e.y-e.size*.68;if(e.shield>0){ctx.fillStyle='rgba(91,174,255,.28)';ctx.beginPath();ctx.arc(e.x,e.y,e.size*.57,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(129,207,255,.86)';ctx.lineWidth=2;ctx.stroke()}ctx.fillStyle='rgba(0,0,0,.55)';roundedRect(e.x-bw/2,barY,bw,7,4);ctx.fill();ctx.fillStyle=e.hp/e.maxHp>.4?'#5ae58a':'#ff6571';roundedRect(e.x-bw/2+1,barY+1,(bw-2)*Math.max(0,e.hp/e.maxHp),5,3);ctx.fill();if(e.def.boss){ctx.fillStyle='#ffe06b';ctx.font='900 11px sans-serif';ctx.textAlign='center';ctx.fillText('BOSS · '+e.def.name,e.x,e.y-e.size*.83)}ctx.restore()}}
  function drawProjectiles(){for(const p of state.projectiles){ctx.shadowBlur=12;ctx.shadowColor=p.color;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}}
  function drawParticles(){if(reducedMotion)return;for(const p of state.particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
  function drawOverlay(){if(state.paused&&!state.ended){ctx.fillStyle='rgba(3,8,14,.38)';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#fff';ctx.font='900 38px sans-serif';ctx.textAlign='center';ctx.fillText('TẠM DỪNG',640,350)}}


 function restore(s){state=JSON.parse(JSON.stringify(s));state.map=D.MAPS[state.mapId-1];state.path=D.PATHS[state.mapId];state.towerSpots=D.TOWER_SPOTS_BY_MAP[state.mapId];state.paused=false;state.dragPreview=null;
  state.towers.forEach(t=>t.def=D.TOWERS[t.type]);state.enemies.forEach(e=>e.def=D.ENEMIES[e.type]);state.projectiles.forEach(p=>{p.target=state.enemies.find(e=>e.id===p.target?.id);p.tower=state.towers.find(t=>t.id===p.tower?.id)});
  state.selectedTower=state.towers.find(t=>t.id===state.selectedTower?.id)||null;state.selectedEnemy=state.enemies.find(e=>e.id===state.selectedEnemy?.id)||null;state.particles=[];
 }
 if(saved?.schema===3&&saved.mapId===map)restore(saved);
 function attachCanvas(c){canvas=c;ctx=c.getContext('2d');canvas.width=1280;canvas.height=720;if(typeof Image==='function')for(const src of new Set(imagePaths)){const im=new Image();im.onload=draw;im.src=src;images[src]=im}}
 function startWave(wave){if(state.mode!=='prepare'||state.ended)return false;beginWave(wave);return true}
 function build(type,slot){const p=state.towerSpots[slot];return !!p&&!state.towers.some(t=>t.spotIndex===slot)&&placeTowerAt(type,p.x,p.y)}
 function choose(slot){state.selectedTower=state.towers.find(t=>t.spotIndex===slot)||null;state.selectedEnemy=null;return state.selectedTower}
 function upgradeTower(slot,branch){choose(slot);return upgradeSelected(branch)}
 function sell(slot){choose(slot);return sellSelected()}
 function grantEnergy(streak){const base=100+state.mapId*20,n=base*(state.mapId>=5?2:1)+Math.min(30,streak*3);state.energy+=n;state.boostUntil=state.elapsed+8;if(streak>=3)state.comboBuffUntil=state.elapsed+10;state.lastEvent='Bản vẽ đúng: +'+n+' năng lượng.';return n}
 function repairBase(){if(!['prepare','clear'].includes(state.mode)||state.energy<45||state.baseHp>=state.maxHp)return false;state.energy-=45;state.baseHp=Math.min(state.maxHp,state.baseHp+5);state.lastEvent='Đã sửa +5 độ bền căn cứ.';return true}
 function repairCheckpoint(){if(state.mode!=='defeated')return false;state.recoveries++;state.energy=Math.max(0,state.energy-state.waveGold);state.waveGold=0;state.baseHp=state.maxHp;state.ended=false;state.mode='prepare';state.paused=false;state.enemies=[];state.spawnQueue=[];state.projectiles=[];state.soldiers=[];state.spawning=false;state.waveActive=false;state.towers.forEach(t=>{t.cooldown=0;t.spawnCooldown=0});state.lastEvent='Đã sửa căn cứ. Giữ nguyên bản vẽ đã giải và các tháp.';return true}
 function snapshot(){const s=JSON.parse(JSON.stringify(state));s.particles=[];s.dragPreview=null;return s}
 return {get state(){return state},setReducedMotion:v=>reducedMotion=!!v,attachCanvas,images:()=>images,imagePaths,hooks:h=>hooks=h,update,draw,build,startWave,grantEnergy,repairBase,repairCheckpoint,snapshot,selectAt,choose,upgradeTower,sell,towerStats,upgradeCost,branchName,getWavePreview,clientToCanvas,previewDraggedTower,dropDraggedTower,cancelTowerDrag,available:type=>state.allowedTowers.includes(type),slots:()=>state.towerSpots,hit:hitEnemy,spawn:spawnEnemy,releaseSoldier,nearestOpenSpot};
}
T.Defense={Engine,TYPES:D.TOWERS,ENEMIES:D.ENEMIES,BRANCHES:D.TOWER_BRANCHES,WIDTH:1280,HEIGHT:720,distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)};
})(Trig);
