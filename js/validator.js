(function(T){
  'use strict';
  const M=T.MathEngine,G=T.Triangle;
  function validateQuestion(q){
    const fail={mathValidation:{passed:false},geometryValidation:{passed:false},answerValidation:{passed:false},explanationValidation:{passed:false},passed:false};
    try{
      const d=q.mathData,derived=T.Questions.derive(q);let math=true,geometry={passed:true,applicable:false};
      if(d.triangle){
        const t=d.triangle,r=G.roles(t);
        math=G.validateTriangleData(t)&&['opposite','adjacent','hypotenuse'].every(k=>r[k])&&G.angleAt(t,t.targetAngleVertex)>0&&G.angleAt(t,t.targetAngleVertex)<90;
        if(d.fn){
          const a=G.angleAt(t,t.targetAngleVertex)*Math.PI/180,independent={sin:Math.sin(a),cos:Math.cos(a),tan:Math.tan(a),cot:1/Math.tan(a)}[d.fn];
          math=math&&M.FUNCTIONS.includes(d.fn)&&M.near(M.numeric(G.ratio(t,d.fn).value),independent);
        }
        geometry={...G.validateGeometry(t,q.type==='calculate-ratio',d.hideHyp),applicable:true};
      }else if(q.type==='special-angle'){
        const a=d.angle*Math.PI/180,independent={sin:Math.sin(a),cos:Math.cos(a),tan:Math.tan(a),cot:1/Math.tan(a)}[d.fn];
        math=[30,45,60].includes(d.angle)&&M.FUNCTIONS.includes(d.fn)&&M.near(M.numeric(q.answer),independent);
      }else if(q.type==='complementary'){
        const a=d.angle*Math.PI/180,b=q.answer.angle*Math.PI/180;
        const f=(fn,x)=>({sin:Math.sin(x),cos:Math.cos(x),tan:Math.tan(x),cot:1/Math.tan(x)})[fn];
        math=d.angle>0&&d.angle<90&&q.answer.angle>0&&q.answer.angle<90&&d.angle+q.answer.angle===90&&M.COMPLEMENT[d.fn]===q.answer.fn&&M.near(f(d.fn,a),f(q.answer.fn,b));
      }else if(q.type==='bound-ratio')math=['sincos','positive'].includes(d.group);
      else if(q.type==='reciprocal')math=true;
      else math=false;
      const answer=derived.answer!==undefined&&JSON.stringify(q.answer)===JSON.stringify(derived.answer)&&q.exactAnswer===derived.exactAnswer&&q.numericAnswer===derived.numericAnswer;
      const explanation=typeof q.explanation==='string'&&q.explanation===derived.explanation&&q.prompt===derived.prompt&&q.hint===derived.hint;
      return {mathValidation:{passed:!!math},geometryValidation:geometry,answerValidation:{passed:answer},explanationValidation:{passed:explanation},passed:!!(math&&geometry.passed&&answer&&explanation)};
    }catch(_){return fail;}
  }
  function validateBank(bank){
    const valid=[],rejected=[],ids=new Set();
    for(const q of bank){
      const report=validateQuestion(q);
      if(ids.has(q.id))report.passed=false;ids.add(q.id);
      q.validationMetadata=report;q.status=report.passed?'validated':'invalid';
      (report.passed?valid:rejected).push(q);
    }
    return {valid,rejected};
  }
  T.Validator={validateQuestion,validateBank};
})(Trig);
