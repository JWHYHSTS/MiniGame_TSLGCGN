(function(T){
  'use strict';
  const M=T.MathEngine,W=520,H=360,PAD=50;
  const side=(a,b)=>[a,b].sort().join('');
  const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y});
  const length=v=>Math.hypot(v.x,v.y);
  const unit=v=>{const d=length(v);return {x:v.x/d,y:v.y/d};};
  const add=(p,v,s=1)=>({x:p.x+v.x*s,y:p.y+v.y*s});
  function build({names=['A','B','C'],legs=[3,4],target=1,rotation=0,mirror=false,zoom=1}){
    const a=legs[0],b=legs[1],theta=rotation*Math.PI/180;
    const model=[[0,0],[a,0],[0,b]].map(([x,y])=>{x*=mirror?-1:1;return {x:x*Math.cos(theta)-y*Math.sin(theta),y:x*Math.sin(theta)+y*Math.cos(theta)};});
    const xs=model.map(p=>p.x),ys=model.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min((W-PAD*2)/(maxX-minX),(H-PAD*2)/(maxY-minY))*zoom;
    const vertices=Object.fromEntries(model.map((p,i)=>[names[i],{x:W/2+(p.x-(minX+maxX)/2)*scale,y:H/2+(p.y-(minY+maxY)/2)*scale}]));
    return {vertices,rightAngleVertex:names[0],targetAngleVertex:names[target],sideLengths:{[side(names[0],names[1])]:a,[side(names[0],names[2])]:b,[side(names[1],names[2])]:Math.hypot(a,b)},orientation:rotation,mirror,scale};
  }
  function ids(t){return Object.keys(t.vertices);}
  function sides(t){const v=ids(t);return [side(v[0],v[1]),side(v[0],v[2]),side(v[1],v[2])];}
  const getHypotenuse=t=>sides(t).find(s=>!s.includes(t.rightAngleVertex));
  const getOppositeSide=(t,target=t.targetAngleVertex)=>sides(t).find(s=>!s.includes(target));
  const getAdjacentSide=(t,target=t.targetAngleVertex)=>sides(t).find(s=>s.includes(target)&&s!==getHypotenuse(t));
  const roles=t=>({hypotenuse:getHypotenuse(t),opposite:getOppositeSide(t),adjacent:getAdjacentSide(t)});
  function ratio(t,fn){const r=roles(t),pair=M.RATIO[fn].map(x=>r[x]);return {sides:pair,value:M.rational(Math.round(t.sideLengths[pair[0]]),Math.round(t.sideLengths[pair[1]]))};}
  function angleAt(t,id){const v=ids(t).filter(x=>x!==id).map(x=>sub(t.vertices[x],t.vertices[id]));return Math.acos(Math.max(-1,Math.min(1,(v[0].x*v[1].x+v[0].y*v[1].y)/(length(v[0])*length(v[1])))))*180/Math.PI;}
  function validateTriangleData(t){
    try{
      const v=ids(t),ss=sides(t),r=roles(t),h=t.sideLengths[r.hypotenuse],legs=ss.filter(s=>s!==r.hypotenuse).map(s=>t.sideLengths[s]);
      return v.length===3&&new Set(v).size===3&&v.every(x=>/^[A-Z]$/.test(x))&&v.includes(t.rightAngleVertex)&&v.includes(t.targetAngleVertex)&&t.targetAngleVertex!==t.rightAngleVertex&&ss.every(s=>Number.isFinite(t.sideLengths[s])&&t.sideLengths[s]>0)&&M.near(legs[0]**2+legs[1]**2,h*h)&&h>Math.max(...legs);
    }catch(_){return false;}
  }
  function geometry(t,showLengths=false,hideHyp=false){
    const vv=ids(t),points=vv.map(id=>t.vertices[id]),centroid={x:points.reduce((s,p)=>s+p.x,0)/3,y:points.reduce((s,p)=>s+p.y,0)/3};
    const labels=vv.map(id=>({id,kind:'vertex',text:id,...add(t.vertices[id],unit(sub(t.vertices[id],centroid)),27)}));
    const lines=sides(t).map(id=>({id,a:t.vertices[id[0]],b:t.vertices[id[1]],length:t.sideLengths[id]}));
    const lengthLabels=showLengths?lines.map(s=>{
      const mid={x:(s.a.x+s.b.x)/2,y:(s.a.y+s.b.y)/2},v=sub(s.b,s.a);let n=unit({x:-v.y,y:v.x});
      if(n.x*(mid.x-centroid.x)+n.y*(mid.y-centroid.y)<0)n={x:-n.x,y:-n.y};
      return {id:s.id,kind:'length',text:hideHyp&&s.id===getHypotenuse(t)?'?':`${Number(s.length.toFixed(4))}`,value:s.length,...add(mid,n,24)};
    }):[];
    const right=t.vertices[t.rightAngleVertex],ru=vv.filter(x=>x!==t.rightAngleVertex).map(x=>unit(sub(t.vertices[x],right)));
    const marker=[add(right,ru[0],13),add(add(right,ru[0],13),ru[1],13),add(right,ru[1],13)];
    const target=t.vertices[t.targetAngleVertex],other=vv.filter(x=>x!==t.targetAngleVertex),av=other.map(x=>sub(t.vertices[x],target)),au=av.map(unit);
    const radius=Math.min(37,...av.map(v=>length(v)*.27));
    let start=Math.atan2(au[0].y,au[0].x),end=Math.atan2(au[1].y,au[1].x),delta=end-start;
    while(delta>Math.PI)delta-=2*Math.PI;while(delta< -Math.PI)delta+=2*Math.PI;
    const angleLabel=add(target,unit({x:au[0].x+au[1].x,y:au[0].y+au[1].y}),radius+20);
    return {lines,labels,lengthLabels,marker,angle:{vertex:t.targetAngleVertex,start:add(target,au[0],radius),end:add(target,au[1],radius),radius,sweep:delta>0?1:0,label:angleLabel},centroid};
  }
  function validateRightTriangle(t){
    if(!validateTriangleData(t))return false;
    const angles=ids(t).map(id=>angleAt(t,id));
    const scale=sides(t).map(s=>length(sub(t.vertices[s[0]],t.vertices[s[1]]))/t.sideLengths[s]);
    return M.near(angleAt(t,t.rightAngleVertex),90)&&angles.every(a=>a>=15-1e-6&&a<=90+1e-6)&&scale.every(x=>M.near(x,scale[0]));
  }
  function validateGeometry(t,showLengths=false,hideHyp=false){
    try{
      const g=geometry(t,showLengths,hideHyp),all=[...g.labels,...g.lengthLabels,g.angle.label,...g.marker,...Object.values(t.vertices)];
      const inBounds=all.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>16&&p.x<W-16&&p.y>16&&p.y<H-16);
      const text=[...g.labels,...g.lengthLabels];
      const separate=text.every((a,i)=>text.slice(i+1).every(b=>Math.hypot(a.x-b.x,a.y-b.y)>25));
      const lengthIdentity=g.lengthLabels.every(l=>l.value===t.sideLengths[l.id]);
      return {passed:validateRightTriangle(t)&&inBounds&&separate&&lengthIdentity,inBounds,separate,lengthIdentity};
    }catch(_){return {passed:false};}
  }
  function renderTriangle(t,{interactive=false,showLengths=false,hideHyp=false,highlight='',id='triangle',angleSymbol='α'}={}){
    if(!validateGeometry(t,showLengths,hideHyp).passed)throw Error('Geometry rejected');
    const g=geometry(t,showLengths,hideHyp),points=ids(t).map(x=>`${t.vertices[x].x},${t.vertices[x].y}`).join(' ');
    return `<svg class="triangle-svg" viewBox="0 0 ${W} ${H}" aria-labelledby="${id}-title" role="img"><title id="${id}-title">Tam giác ${ids(t).join('')} vuông tại ${t.rightAngleVertex}, xét góc ${t.targetAngleVertex}</title><polygon points="${points}" class="triangle-fill"/>${g.lines.map(l=>`<line x1="${l.a.x}" y1="${l.a.y}" x2="${l.b.x}" y2="${l.b.y}" class="triangle-edge ${highlight===l.id?'edge-correct':''}" data-edge="${l.id}"/>`).join('')}<path class="right-marker" data-right="${t.rightAngleVertex}" d="M${g.marker.map(p=>`${p.x},${p.y}`).join('L')}"/><path class="angle-arc" data-angle="${t.targetAngleVertex}" d="M${g.angle.start.x},${g.angle.start.y} A${g.angle.radius},${g.angle.radius} 0 0 ${g.angle.sweep} ${g.angle.end.x},${g.angle.end.y}"/><text x="${g.angle.label.x}" y="${g.angle.label.y}" class="angle-label">${angleSymbol}</text>${g.labels.map(l=>`<text class="vertex-label" data-vertex="${l.id}" x="${l.x}" y="${l.y}">${l.text}</text>`).join('')}${g.lengthLabels.map(l=>`<text class="length-label" data-length-side="${l.id}" x="${l.x}" y="${l.y}">${l.text}</text>`).join('')}${interactive?g.lines.map(l=>{const v=unit(sub(l.b,l.a)),n={x:-v.y,y:v.x};const box=[add(l.a,n,12),add(l.b,n,12),add(l.b,n,-12),add(l.a,n,-12)].map(p=>`${p.x},${p.y}`).join(' ');return `<polygon class="side-hit" tabindex="0" role="button" aria-label="Cạnh ${l.id}" data-side="${l.id}" data-drop="${l.id}" points="${box}"/>`;}).join(''):''}</svg>`;
  }
  T.Triangle={build,side,ids,sides,roles,ratio,angleAt,getHypotenuse,getOppositeSide,getAdjacentSide,validateTriangleData,validateRightTriangle,validateGeometry,geometry,renderTriangle,W,H};
})(Trig);
