const fs=require('node:fs'),path=require('node:path');
for(const f of ['config','math-engine','triangle','question-engine','validator'])require(path.join(__dirname,'../js/'+f+'.js'));
const result=Trig.Validator.validateBank(Trig.Questions.generateBank());
if(result.rejected.length)throw Error(`${result.rejected.length} rejected questions`);
fs.writeFileSync(path.join(__dirname,'../data/questions.json'),JSON.stringify(result.valid,null,2));
console.log(`Exported ${result.valid.length} validated questions.`);
