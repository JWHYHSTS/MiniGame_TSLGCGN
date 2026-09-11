(function(T){
  function multiplier(streak){return streak>=10?2:streak>=8?1.75:streak>=5?1.5:streak>=3?1.25:streak>=2?1.1:1;}
  function points({streak,wrong,hint,seconds}){return Math.max(20,Math.round((100-(wrong?35:0)-(hint?10:0))*multiplier(streak))+(seconds<20?5:0));}
  const accuracy=(correct,attempts)=>attempts?correct/attempts:0;
  const stars=r=>r.accuracy>=.9&&r.maxCombo>=4?3:r.accuracy>=.75?2:1;
  const grade=r=>r.accuracy>=.95&&r.stars>=14?'S':r.accuracy>=.85?'A':r.accuracy>=.7?'B':'C';
  T.Scoring={multiplier,points,accuracy,stars,grade};
})(Trig);
