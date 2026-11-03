import {createModel,fieldKey,unique,divide} from './model.mjs';
const $=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg';
const palette=['#032030','#e89b26','#00a998','#2e86c1','#e74c3c','#8a64ad'];
const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const number=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}),integer=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
function format(v,name='',compact=false){
 if(v===null||v===undefined||!Number.isFinite(v)&&typeof v==='number')return '—';
 if(typeof v==='string')return v;
 if(name.includes('%')||['Margem','Margem 2'].includes(name))return (v*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
 if(compact&&Math.abs(v)>=1e6)return (v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' Mi';
 if(compact&&Math.abs(v)>=1000)return (v/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' mil';
 if(/Faturamento|Lucro|Prejuízo/.test(name))return '$'+number.format(v);
 return /Total Vendas|Viagens|Qtd|Veículos|Veiculos|Motoristas|Ranking|Rank/.test(name)?integer.format(v):number.format(v);
}
const el=(tag,attrs={},text)=>{const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;};
const svg=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;};
const esc=s=>String(s??'');
let config,data,model,pageIndex=0,state={},trees={},geo,chartLevels={};
const stage=$('#stage');
const page=()=>config.pages[pageIndex];
const getContext=()=>({...state[pageIndex]});
function setFilter(f,value){const key=fieldKey(f);state[pageIndex]??={};if(String(state[pageIndex][key])===String(value))delete state[pageIndex][key];else state[pageIndex][key]=value;trees={};render();}
function reset(){state[pageIndex]={...(page().defaults||{})};trees={};render();}
function navigate(i){pageIndex=Math.max(0,Math.min(config.pages.length-1,i));state[pageIndex]??={...(page().defaults||{})};trees={};history.replaceState(null,'','#'+encodeURIComponent(page().id));render();}
function titleOf(v){return v.title||'';}
function visualContext(v){let ctx={...getContext(),...(v.filters||{})};if(v.topFilter){const {field,metric,count}=v.topFilter,groups=model.group(field,metric,ctx).sort((a,b)=>b.value-a.value),cut=groups[Math.min(count,groups.length)-1]?.value;ctx[fieldKey(field)]=groups.filter(g=>g.value>=cut).map(g=>g.label);}return ctx;}
function interact(node,label,handler){node.classList.add('hit');node.setAttribute('role','button');node.setAttribute('tabindex','0');node.setAttribute('aria-label',label);node.addEventListener('click',handler);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handler();}});}
function title(node,text){node.append(svg('title',{},text));}
function plot(node,w,h){const s=svg('svg',{viewBox:`0 0 ${w} ${h}`,role:'group'});node.append(s);return s;}
function sorted(groups,category){
 if(['Mês','MesNome'].includes(category.column))return groups.sort((a,b)=>months.findIndex(m=>m.startsWith(String(a.label).toLowerCase()))-months.findIndex(m=>m.startsWith(String(b.label).toLowerCase())));
 if(['Inicio do Mês','AnoMes'].includes(category.column))return groups.sort((a,b)=>String(a.label).localeCompare(String(b.label)));
 if(category.column==='Faixa'){const order=['0-20h','20-40h','40-60h','60-100h','100-200h','200h+','>200h'];return groups.sort((a,b)=>order.indexOf(a.label)-order.indexOf(b.label));}
 return groups.sort((a,b)=>(b.value??0)-(a.value??0));
}
function chartGroups(v,ctx,category,metrics){
 const table=v.returnFact?'fDevoluções':model.fact;let gs=sorted(model.group(category,metrics[0],ctx,table),category);
 if(v.topN)gs=gs.slice(0,v.topN);
 if(v.sort&&!['Mês','MesNome','Inicio do Mês','Faixa'].includes(category.column)){
  const f=v.sort.field;gs.sort((a,b)=>{const av=f.measure?model.measure(f.measure,a.context):a.label,bv=f.measure?model.measure(f.measure,b.context):b.label;return (typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),'pt-BR'))*(v.sort.ascending?1:-1);});
 }
 return gs.map(g=>({...g,values:metrics.map(m=>model.measure(m,g.context))})).filter(g=>g.values.some(v=>v!==null&&v!==undefined));
}
function drawBars(node,v,ctx,{horizontal=false,line=false,area=false}={}){
 const category=v.categories?.[chartLevels[v.id]??0],metrics=v.metrics||[];
 if(!category||!metrics.length){node.append(el('p',{class:'empty'},'Sem dados para este visual'));return;}
 let gs=chartGroups(v,ctx,category,metrics);const w=v.w-14,h=v.h-(v.title?30:5);
 if(!gs.length){node.append(el('p',{class:'empty'},'Sem dados no recorte'));return;}
 if((v.categories?.length??0)>1){const select=el('select',{'aria-label':'Nível da análise'});select.style.cssText='position:absolute;right:8px;top:2px;width:145px;height:23px;font-size:11px;z-index:2';v.categories.forEach((f,i)=>select.append(el('option',{value:i},f.column)));select.value=String(chartLevels[v.id]??0);select.onchange=()=>{chartLevels[v.id]=Number(select.value);render();};node.append(select);}
 const wrap=el('div',{class:'plot'});node.append(wrap);
 if(horizontal&&gs.length>10){wrap.style.overflowY='auto';}
 const realH=horizontal?Math.max(h,gs.length*24):h;const s=plot(wrap,w,realH);
 const max=Math.max(...gs.flatMap(g=>g.values.filter(Number.isFinite)),0),min=Math.min(...gs.flatMap(g=>g.values.filter(Number.isFinite)),0);const span=max-min||1;
 const colors=v.colors?.length?v.colors:palette;
 if(horizontal){
  const left=Math.min(120,w*.32),right=70,top=7,bottom=5,plotW=w-left-right,rh=(realH-top-bottom)/gs.length;
  gs.forEach((g,i)=>{const val=g.values[0],y=top+i*rh;
   const maxChars=Math.max(8,Math.floor(left/6)-2);s.append(svg('text',{x:left-6,y:y+rh*.62,'text-anchor':'end','font-size':10},String(g.label).length>maxChars?String(g.label).slice(0,maxChars-1)+'…':g.label));
   const bar=svg('rect',{x:left,y:y+rh*.15,width:Math.max(0,(val??0)/Math.max(max,1)*plotW),height:Math.max(4,rh*.65),fill:colors[0],rx:1});
   title(bar,`${g.label}: ${format(val,metrics[0])}`);interact(bar,`${g.label}: ${format(val,metrics[0])}`,()=>setFilter(category,g.label));s.append(bar);
   s.append(svg('text',{x:left+Math.max(0,(val??0)/Math.max(max,1)*plotW)+5,y:y+rh*.62,'font-size':10},format(val,metrics[0],true)));
  });return;
 }
 const left=47,right=14,top=metrics.length>1?23:8,bottom=33,ph=realH-top-bottom,pw=w-left-right;
 const y=n=>top+(max-n)/span*ph;
 for(let i=0;i<=3;i++){const val=min+span*i/3,yy=y(val);s.append(svg('line',{x1:left,x2:w-right,y1:yy,y2:yy,stroke:'#bfcbd2','stroke-dasharray':'1 4'}));s.append(svg('text',{x:left-6,y:yy+4,'text-anchor':'end','font-size':9},format(val,metrics[0],true)));}
 if(metrics.length>1)metrics.forEach((m,j)=>{s.append(svg('circle',{cx:left+j*Math.min(pw/metrics.length,190),cy:10,r:4,fill:colors[j%colors.length]}));s.append(svg('text',{x:left+8+j*Math.min(pw/metrics.length,190),y:14,'font-size':9},m));});
 const step=pw/gs.length;metrics.forEach((metric,j)=>{
  if(line||area){
   const points=gs.map((g,i)=>[left+step*(i+.5),y(Number.isFinite(g.values[j])?g.values[j]:0)]);
   const path=svg('path',{d:points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '),fill:'none',stroke:colors[j%colors.length],'stroke-width':2});s.append(path);
   if(area){const a=svg('path',{d:'M'+points[0][0]+','+y(0)+' '+points.map(p=>'L'+p.join(',')).join(' ')+' L'+points.at(-1)[0]+','+y(0)+' Z',fill:colors[j%colors.length],opacity:.17});s.prepend(a);}
   points.forEach((p,i)=>{const dot=svg('circle',{cx:p[0],cy:p[1],r:3,fill:colors[j%colors.length]});title(dot,`${gs[i].label}: ${format(gs[i].values[j],metric)}`);interact(dot,`${gs[i].label}: ${format(gs[i].values[j],metric)}`,()=>setFilter(category,gs[i].label));s.append(dot);});
  }else gs.forEach((g,i)=>{const val=g.values[j],bw=step*.74/metrics.length,b=svg('rect',{x:left+i*step+step*.13+j*bw,y:Math.min(y(val??0),y(0)),width:Math.max(1,bw-1),height:Math.abs(y(val??0)-y(0)),fill:colors[j%colors.length]});title(b,`${g.label}: ${format(val,metric)}`);interact(b,`${g.label}: ${format(val,metric)}`,()=>setFilter(category,g.label));s.append(b);});
 });
 gs.forEach((g,i)=>{if(i%Math.max(1,Math.ceil(gs.length/14))!==0&&i!==gs.length-1)return;let lab=String(g.label);if(lab.includes('T')&&category.column==='Inicio do Mês')lab=lab.slice(0,7);if(lab.length>13)lab=lab.slice(0,12)+'…';s.append(svg('text',{x:left+step*(i+.5),y:realH-14,'text-anchor':'middle','font-size':gs.length>18?8:10},lab));});
}
function drawDonut(node,v,ctx){
 const metric=v.metrics[0],category=v.categories?.[0];if(!category)return;
 const gs=chartGroups(v,ctx,category,[metric]).filter(g=>g.value>0),total=gs.reduce((s,g)=>s+g.value,0);const w=v.w-14,h=v.h-(v.title?29:0),s=plot(node,w,h),cx=w*.5,cy=h*.5,r=Math.min(w*.27,h*.32),circ=2*Math.PI*r;let offset=0;
 if(!total){s.append(svg('text',{x:cx,y:cy,'text-anchor':'middle'},'Sem dados'));return;}
 gs.forEach((g,i)=>{const frac=g.value/total;const color=config.kind==='comercial'?(g.label==='Online'?palette[1]:palette[0]):(g.label==='No Prazo'?'#2ecc71':g.label==='Atrasado'?'#e74c3c':'#a8b3b9');const c=svg('circle',{cx,cy,r,fill:'none',stroke:color,'stroke-width':Math.max(15,r*.42),'stroke-dasharray':`${frac*circ} ${circ}`,'stroke-dashoffset':-offset,transform:`rotate(-90 ${cx} ${cy})`});offset+=frac*circ;title(c,`${g.label}: ${format(g.value,metric)} (${format(frac,'%')})`);interact(c,`${g.label}: ${format(frac,'%')}`,()=>setFilter(category,g.label));s.append(c);
  s.append(svg('text',{x:8,y:14+i*15,'font-size':10},`${g.label} ${format(frac,'%')}`));
 });
}
function drawTable(node,v,ctx){
 const category=v.categories?.[0];if(!category)return;
 const measures=v.metrics||[],scroll=el('div',{class:'table-scroll'}),table=el('table');scroll.tabIndex=0;scroll.setAttribute('aria-label',v.title||'Tabela de indicadores');node.append(scroll);scroll.append(table);
 const columns=v.columns||[{...category},...measures.map(measure=>({measure}))];
 const head=el('thead'),hr=el('tr');head.append(hr);table.append(head);columns.forEach(f=>hr.append(el('th',{scope:'col'},f.measure||f.column)));
 const body=el('tbody');table.append(body);let gs=chartGroups(v,ctx,category,measures);
 if(v.type==='pivotTable')gs.sort((a,b)=>String(a.label).localeCompare(String(b.label),'pt-BR'));
 function row(g,indent=false,expand=null){const tr=el('tr');columns.forEach(f=>{
  const td=el('td');if(f.measure)td.textContent=format(model.measure(f.measure,g.context),f.measure);
  else if(fieldKey(f)===fieldKey(category)){const b=el('button',{type:'button'},(indent?'　':'')+(expand?'⊞ ':'')+g.label);b.onclick=()=>expand?expand(tr,b):setFilter(category,g.label);td.append(b);}
  else {const raw=model.rows(model.fact,g.context)[0];td.textContent=raw?model.value(raw,model.fact,f)??'—':'—';}
  tr.append(td);
 });return tr;}
 gs.forEach(g=>{
  let expanded=[];
  const expand=v.categories.length>1?(tr,b)=>{if(expanded.length){expanded.forEach(e=>e.remove());expanded=[];b.textContent='⊞ '+g.label;return;}const sub=v.categories[1];const groups=model.group(sub,measures[0],g.context).sort((a,b)=>String(a.label).localeCompare(String(b.label)));let last=tr;groups.forEach(c=>{const r=row(c,true);r.querySelector('button').onclick=()=>setFilter(sub,c.label);last.after(r);last=r;expanded.push(r);});b.textContent='⊟ '+g.label;}:null;
  body.append(row(g,false,expand));
 });
 if(v.type==='pivotTable'){const foot=el('tfoot'),tr=el('tr');tr.append(el('td',{},'Total'));measures.forEach(m=>tr.append(el('td',{},format(model.measure(m,ctx),m))));foot.append(tr);table.append(foot);}
}
function drawTree(node,v,ctx){
 const categories=v.categories||[],metric=config.kind==='comercial'?(String(state[pageIndex]?.['Parâmetro|Parâmetro']).includes('Faturamento')?'Faturamento Total':'Total Vendas'):v.metrics[0];
 const t=trees[v.id]??={depth:0,path:[]};const controls=el('div',{class:'tree-controls'}),sel=el('select',{'aria-label':'Dimensão da decomposição'});
 categories.forEach((f,i)=>sel.append(el('option',{value:i},f.column)));sel.value=String(t.depth);sel.onchange=()=>{t.depth=Number(sel.value);render();};controls.append(sel);
 t.path.forEach((p,i)=>{const b=el('button',{type:'button'},p.v+' ×');b.onclick=()=>{t.path=t.path.slice(0,i);render();};controls.append(b);});
 const root=el('button',{type:'button'},format(model.measure(metric,ctx),metric));root.onclick=()=>{t.path=[];render();};controls.prepend(root);node.append(controls);
 const c={...ctx};t.path.forEach(p=>c[fieldKey(p.f)]=p.v);const f=categories[t.depth];if(!f)return;
 const wrap=el('div',{class:'tree-chart'});wrap.style.overflow='auto';node.append(wrap);const gs=sorted(model.group(f,metric,c),f);const w=v.w-20,h=Math.max(v.h-50,gs.length*30),s=plot(wrap,w,h),max=Math.max(...gs.map(g=>g.value||0),1),left=Math.min(220,w*.3);
 gs.forEach((g,i)=>{const y=i*30+4,line=svg('path',{d:`M15,12 H45 V${y+12} H${left-6}`,fill:'none',stroke:'#a6b7c1'});s.append(line);s.append(svg('text',{x:52,y:y+17},String(g.label).slice(0,30)));const b=svg('rect',{x:left,y,width:Math.max(1,g.value/max*(w-left-90)),height:23,fill:palette[0]});title(b,`${g.label}: ${format(g.value,metric)}`);interact(b,`Explorar ${g.label}: ${format(g.value,metric)}`,()=>{t.path.push({f,v:g.label});t.depth=Math.min(t.depth+1,categories.length-1);render();});s.append(b);s.append(svg('text',{x:left+g.value/max*(w-left-90)+5,y:y+17},format(g.value,metric,true)));});
}
function drawTreemap(node,v,ctx){
 const f=v.categories[0],metric=v.metrics[0],gs=model.group(f,metric,ctx).filter(g=>g.value>0).sort((a,b)=>b.value-a.value);const total=gs.reduce((a,b)=>a+b.value,0),w=v.w-15,h=v.h-12,s=plot(node,w,h);let x=0;
 gs.forEach((g,i)=>{const ww=g.value/total*w;const rect=svg('rect',{x,y:0,width:ww-2,height:h,fill:palette[i%palette.length]});title(rect,`${g.label}: ${format(g.value,metric)}`);interact(rect,`${g.label}: ${format(g.value,metric)}`,()=>setFilter(f,g.label));s.append(rect);const text=svg('text',{x:x+8,y:h*.45,style:'fill:white;font-size:13px'},String(g.label));s.append(text);s.append(svg('text',{x:x+8,y:h*.45+22,style:'fill:white;font-size:20px'},format(g.value,metric)));x+=ww;});
}
function drawGauge(node,v,ctx){
 const metric=v.metrics.find(m=>m.startsWith('%'))||v.metrics[0],val=model.measure(metric,ctx),w=v.w,h=v.h,s=plot(node,w,h),r=Math.min(w*.38,h*.7),cx=w/2,cy=h*.86;
 const path=(r)=>`M${cx-r},${cy} A${r},${r} 0 0 1 ${cx+r},${cy}`;
 s.append(svg('path',{d:path(r),fill:'none',stroke:'#e1e7e8','stroke-width':r*.25}));const p=svg('path',{d:path(r),fill:'none',stroke:'#2ecc71','stroke-width':r*.25,'pathLength':100,'stroke-dasharray':`${Math.max(0,Math.min(1,val??0))*100} 100`});s.append(p);
 const angle=Math.PI*(1-.95),x=cx+r*Math.cos(angle),y=cy-r*Math.sin(angle);s.append(svg('line',{x1:cx+(r-r*.2)*Math.cos(angle),y1:cy-(r-r*.2)*Math.sin(angle),x2:x+r*.12*Math.cos(angle),y2:y-r*.12*Math.sin(angle),stroke:'#032030','stroke-width':2}));s.append(svg('text',{x:cx,y:cy-7,'text-anchor':'middle',style:'font-size:18px'},format(val,metric)));title(s,`${metric}: ${format(val,metric)}. Meta: 95%`);
}
function drawMap(node,v,ctx){
 const f=v.categories[0],metric=v.metrics[0],gs=model.group(f,metric,ctx,v.returnFact?'fDevoluções':model.fact);const w=v.w-15,h=v.h-(v.title?28:8),s=plot(node,w,h);const brazil=config.kind==='logistico',features=(brazil?geo.brazil:geo.world).features;
 const bounds=brazil?[-74,-34,-34,6]:[-180,180,-60,85];const project=([x,y])=>[(x-bounds[0])/(bounds[1]-bounds[0])*w,(bounds[3]-y)/(bounds[3]-bounds[2])*h];
 const flat=coords=>coords.map(poly=>poly.map(ring=>ring.map((c,i)=>(i?'L':'M')+project(c).map(n=>n.toFixed(1)).join(',')).join(' ')+'Z').join(' ')).join(' ');
 features.forEach(feature=>{const g=feature.geometry;if(!g)return;const coords=g.type==='Polygon'?[g.coordinates]:g.coordinates;const path=svg('path',{d:flat(coords),fill:'#e5ecee',stroke:'#fff','stroke-width':.6});s.append(path);});
 const continentCenters={'América do Norte':[-100,40],'América do Sul':[-60,-15],'Ásia':[90,35],'Europa':[18,50],'Austrália':[135,-25],'Oceania':[135,-25],'África':[20,0]};
 const stateMap=new Map(geo.states.map(r=>[r.id.toString(),r.sigla]));
 function center(feature){const g=feature.geometry,coords=g.type==='Polygon'?[g.coordinates]:g.coordinates;const points=coords.flat(2);const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);return [(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];}
 const max=Math.max(...gs.map(g=>g.value||0),1);
 gs.forEach(g=>{let loc;if(brazil){const uf=String(g.label).slice(0,2);const feature=features.find(f=>stateMap.get(String(f.properties.codarea))===uf);if(feature)loc=center(feature);}else loc=continentCenters[g.label];if(!loc)return;const [x,y]=project(loc),r=5+Math.sqrt(Math.max(0,g.value)/max)*16,circle=svg('circle',{cx:x,cy:y,r,fill:'#2e86c1',opacity:.7,stroke:'#fff','stroke-width':1});title(circle,`${g.label}: ${format(g.value,metric)}`);interact(circle,`${g.label}: ${format(g.value,metric)}`,()=>setFilter(f,g.label));s.append(circle);s.append(svg('text',{x,y:y-r-3,'text-anchor':'middle','font-size':9},g.label));});
 s.append(svg('text',{x:5,y:h-4,class:'map-note'},brazil?'Malha: IBGE · bolhas por UF':'Malha: Natural Earth · bolhas por continente'));
}
function story(node,v,ctx){const div=el('div',{class:'story'});node.append(div);
 if(config.kind==='logistico'){
  const m=n=>format(model.measure(n,ctx),n);div.textContent=`No período analisado, foram realizadas ${m('Total Viagens')} viagens, com ${m('% No Prazo')} no prazo e ${m('Qtd Atrasos')} atrasos registrados, apresentando tempo médio de ${m('Tempo Médio')}h e atraso médio de ${m('Tempo Médio Atraso')}h, concentrado em poucos casos.`;
 }else{
  const product=v.metrics.includes('Produto Mais Vendido');const name=product?'Produto Mais Vendido':'Loja + Vendas',qty=product?'Qtd Vendida (Top 1 Produto)':'Qtd Vendida (Loja + Vendas)',pct=product?'% das Vendas (Top 1 Produto)':'% das Vendas (Loja + Vendas)';div.textContent=`${model.measure(name,ctx)??'Sem dados'}: ${format(model.measure(qty,ctx),'Total Vendas')} unidades, ${format(model.measure(pct,ctx),'%')} das vendas.`;
 }
}
function drawVisual(v){
 const node=el('section',{class:'visual '+v.type,'data-visual':v.id,'aria-label':v.title||v.metrics?.join(', ')||v.categories?.map(f=>f.column).join(', ')||v.type});
 Object.assign(node.style,{left:v.x+'px',top:v.y+'px',width:v.w+'px',height:v.h+'px'});stage.append(node);const ctx=visualContext(v);
 if(v.type==='card'||v.type==='multiRowCard'){
  const name=v.metrics[0],val=model.measure(name,ctx);if(name.includes('Crescimento'))node.classList.add('growth');
  if(v.type==='multiRowCard'&&v.title)node.append(el('div',{class:'card-title'},v.title));
  const display=name==='Volume Total'?format(val,name,true):name.includes('Crescimento')&&typeof val==='number'?(val*100).toLocaleString('pt-BR',{maximumFractionDigits:0})+'%':v.type==='multiRowCard'&&typeof val==='number'&&/Faturamento|Lucro/.test(name)?'$'+integer.format(val):format(val,name);
  const n=el('div',{class:'number','data-metric':name},display);n.title=format(val,name);node.append(n);return;
 }
 if(v.type==='textbox'){const t=el('div',{class:'scrolling'},v.text||'');if(v.text?.includes('Vs.')){t.style.color='white';t.style.fontWeight='600';}node.append(t);return;}
 if(v.type==='actionButton'){
  const target=v.target??(pageIndex===0?1:(v.x>1100?pageIndex+1:pageIndex-1));const b=el('button',{type:'button','aria-label':config.pages[target]?.title||'Voltar'},pageIndex===0?'EXPLORAR PAINÉIS':'');b.onclick=()=>navigate(target);node.append(b);return;
 }
 if(v.type==='slicer'){
  const f=v.categories[0];if(!f)return;const sel=el('select',{'aria-label':f.column});sel.append(el('option',{value:''},'Todos'));
  let vals=unique((model.tables[f.entity]||[]).map(r=>r[f.column])).filter(v=>v!==null&&v!==undefined).sort((a,b)=>String(a).localeCompare(String(b),'pt-BR',{numeric:true}));if(['Mês','MesNome'].includes(f.column))vals.sort((a,b)=>months.findIndex(m=>m.startsWith(String(a).toLowerCase()))-months.findIndex(m=>m.startsWith(String(b).toLowerCase())));
  vals.forEach(val=>sel.append(el('option',{value:val},val)));sel.value=state[pageIndex]?.[fieldKey(f)]??'';sel.onchange=()=>{if(sel.value==='')delete state[pageIndex][fieldKey(f)];else state[pageIndex][fieldKey(f)]=sel.value;trees={};render();};node.append(sel);return;
 }
 if(v.title)node.append(el('h2',{},titleOf(v)));
 if(['barChart','clusteredBarChart'].includes(v.type))return drawBars(node,v,ctx,{horizontal:true});
 if(['clusteredColumnChart','columnChart','lineStackedColumnComboChart'].includes(v.type))return drawBars(node,v,ctx);
 if(v.type==='lineChart')return drawBars(node,v,ctx,{line:true});
 if(v.type==='areaChart'||v.type==='stackedAreaChart')return drawBars(node,v,ctx,{line:true,area:true});
 if(v.type==='donutChart')return drawDonut(node,v,ctx);
 if(['tableEx','pivotTable'].includes(v.type))return drawTable(node,v,ctx);
 if(v.type==='decompositionTreeVisual')return drawTree(node,v,ctx);
 if(v.type==='treemap')return drawTreemap(node,v,ctx);
 if(v.type==='gauge')return drawGauge(node,v,ctx);
 if(['map','azureMap'].includes(v.type))return drawMap(node,v,ctx);
 if(v.type.includes('enlightenDataStory')||v.type.includes('htmlContent'))return story(node,v,ctx);
 if(v.type.includes('ScrollingText')){const c=el('div',{class:'scrolling'});c.textContent=config.kind==='comercial'?model.group({entity:'dProdutos',column:'Tipo do Produto'},'Faturamento Total',ctx).map(g=>`${g.label}: ${format(g.value,'Faturamento Total')}`).join('  •  '):'';node.append(c);return;}
 node.append(el('p',{class:'empty'},'Visual não disponível'));
}
function resize(){const viewport=$('.viewport'),scale=Math.min(1,Math.max(960,viewport.clientWidth)/1280);stage.style.transform=`scale(${scale})`;stage.style.marginBottom=(720*scale-720)+'px';viewport.style.minHeight=(720*scale)+'px';}
function render(){
 stage.replaceChildren();stage.className='stage '+config.kind;stage.style.backgroundImage=`url("assets/${page().background}")`;
 const filters=Object.entries(getContext()).filter(([k,v])=>v!==undefined&&v!==null);$('#status').textContent=page().title+(filters.length?' · '+filters.map(([k,v])=>k.split('|')[1]+': '+v).join(' · '):' · Todos os dados');
 document.querySelectorAll('#pages button').forEach((b,i)=>{if(i===pageIndex)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 page().visuals.forEach(drawVisual);
 if(config.kind==='comercial'){
  [0,1,2].forEach((p,i)=>{const b=el('button',{class:'visual',type:'button','aria-label':config.pages[p].title});Object.assign(b.style,{left:'22px',top:(i===0?130:i===1?212:300)+'px',width:'60px',height:'64px',background:'transparent',border:'0',cursor:'pointer'});b.onclick=()=>navigate(p);stage.append(b);});
 }
 resize();document.dispatchEvent(new CustomEvent('dashboard-rendered'));
}
async function load(){
 [config,data,geo]=await Promise.all(['config.json','data.json','geography.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error('Falha ao carregar '+p);return r.json();})));
 model=createModel(data,config.kind);document.title=config.title+' | Dashboard web';$('#title').textContent=config.title;$('#portfolio').href=config.portfolio;$('#code').href=config.repository;$('#powerbi').href=config.powerbi;
 config.pages.forEach((p,i)=>{const b=el('button',{type:'button'},p.title);b.onclick=()=>navigate(i);$('#pages').append(b);});
 const hash=decodeURIComponent(location.hash.slice(1));pageIndex=Math.max(0,config.pages.findIndex(p=>p.id===hash));state[pageIndex]={...(page().defaults||{})};
 const year=new URLSearchParams(location.search).get('year');if(year&&config.kind==='comercial')state[pageIndex]['dCalendario|Ano']=year;
 $('#reset').onclick=reset;$('#fullscreen').onclick=async()=>{if(!document.fullscreenElement){await document.documentElement.requestFullscreen?.();document.body.classList.add('fullscreen');}else{await document.exitFullscreen?.();document.body.classList.remove('fullscreen');}resize();};document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('fullscreen',!!document.fullscreenElement);resize();});window.addEventListener('resize',resize);render();
}
load().catch(error=>{console.error(error);$('#status').textContent='Não foi possível carregar o dashboard. Recarregue a página ou abra o Power BI original.';});
