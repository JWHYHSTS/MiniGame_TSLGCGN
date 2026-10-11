(function(T){
  const definitions=[
    {id:'perfect',name:'KỸ SƯ CHÍNH XÁC',detail:'Hoàn thành một map không trả lời sai.',icon:'compass'},
    {id:'combo',name:'BÁNH RĂNG LIÊN HOÀN',detail:'Đạt chuỗi đúng liên tiếp x10.',icon:'spark'},
    {id:'crystal',name:'BẬC THẦY TINH THỂ',detail:'Đạt 3 sao ở khu Đường Ray Thép.',icon:'star'},
    {id:'mind',name:'MẠCH GÓC PHỤ',detail:'Đạt độ chính xác ít nhất 90% ở Xưởng Trên Không.',icon:'compass'},
    {id:'guardian',name:'TITAN SLAYER',detail:'Chinh phục Titan Bánh Răng.',icon:'shield'},
    {id:'master',name:'KỸ SƯ TOÀN NĂNG',detail:'Thu thập 15/15 sao ở năm map.',icon:'trophy'}
  ];
  function check(save,result){
    const flags={perfect:result.attempts===result.correct,combo:result.maxCombo>=10,crystal:result.map===4&&result.stars===3,mind:result.map===5&&result.accuracy>=.9,guardian:result.map===6,master:[1,2,3,4,5].every(i=>save.maps[i]?.stars===3)};
    const added=definitions.filter(d=>flags[d.id]&&!save.achievements.includes(d.id));save.achievements.push(...added.map(d=>d.id));return added;
  }
  function totals(save){const maps=Object.values(save.maps);return {...save.totals,stars:[1,2,3,4,5].reduce((s,i)=>s+(save.maps[i]?.stars||0),0),accuracy:save.totals.attempts?save.totals.correct/save.totals.attempts:0,bestScore:maps.reduce((s,m)=>s+m.bestScore,0),bestTime:maps.reduce((s,m)=>s+m.bestTime,0)};}
  function rank(save){const t=totals(save);return save.bossClear?'CHỈ HUY PHÁO ĐÀI':t.stars>=13?'CHUYÊN GIA LƯỢNG GIÁC':t.stars>=9?'KỸ SƯ TRƯỞNG':t.stars>=3?'KỸ SƯ PHÒNG THỦ':'KỸ SƯ TẬP SỰ';}
  T.Achievements={definitions,check,totals,rank};
})(Trig);
