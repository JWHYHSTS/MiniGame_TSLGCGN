(function(T){
  const definitions=[
    {id:'perfect',name:'PERFECT CLIMBER',detail:'Hoàn thành một map không trả lời sai.',icon:'compass'},
    {id:'combo',name:'COMBO MASTER',detail:'Đạt chuỗi đúng liên tiếp x10.',icon:'spark'},
    {id:'crystal',name:'CRYSTAL MASTER',detail:'Đạt 3 sao ở đền tinh thể.',icon:'star'},
    {id:'mind',name:'90° MIND',detail:'Đạt độ chính xác ít nhất 90% ở Twin Peaks.',icon:'compass'},
    {id:'guardian',name:'GUARDIAN SLAYER',detail:'Chinh phục Guardian of 90°.',icon:'shield'},
    {id:'master',name:'MASTER EXPLORER',detail:'Thu thập 15/15 sao ở năm map.',icon:'trophy'}
  ];
  function check(save,result){
    const flags={perfect:result.attempts===result.correct,combo:result.maxCombo>=10,crystal:result.map===4&&result.stars===3,mind:result.map===5&&result.accuracy>=.9,guardian:result.map===6,master:[1,2,3,4,5].every(i=>save.maps[i]?.stars===3)};
    const added=definitions.filter(d=>flags[d.id]&&!save.achievements.includes(d.id));save.achievements.push(...added.map(d=>d.id));return added;
  }
  function totals(save){const maps=Object.values(save.maps);return {...save.totals,stars:[1,2,3,4,5].reduce((s,i)=>s+(save.maps[i]?.stars||0),0),accuracy:save.totals.attempts?save.totals.correct/save.totals.attempts:0,bestScore:maps.reduce((s,m)=>s+m.bestScore,0),bestTime:maps.reduce((s,m)=>s+m.bestTime,0)};}
  function rank(save){const t=totals(save);return save.bossClear?'GUARDIAN CONQUEROR':t.stars>=13?'TRIG EXPERT':t.stars>=9?'ANGLE MASTER':t.stars>=3?'TRIG SCOUT':'NOVICE EXPLORER';}
  T.Achievements={definitions,check,totals,rank};
})(Trig);
