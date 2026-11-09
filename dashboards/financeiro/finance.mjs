import {calculate} from './finance-model.mjs';
const $=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg';
const money=n=>n===null?'—':n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
const compact=n=>n===null?'—':'R$ '+(Math.abs(n)>=1e6?(n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' Mi':Math.abs(n)>=1e3?(n/1e3).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mil':n.toLocaleString('pt-BR',{maximumFractionDigits:2}));
const percent=n=>n===null?'—':(n*100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
const months=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const node=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function chart(container,w,h,label){const c=$(container);c.replaceChildren();const s=node('svg',{viewBox:`0 0 ${w} ${h}`,role:'group','aria-label':label});c.append(s);return s;}
let data;
const filters=()=>({year:$('#year').value,month:$('#month').value,center:$('#center').value});
function tooltip(n,text){n.append(node('title',{},text));}
function pick(n,label,fn){n.classList.add('hit');n.setAttribute('role','button');n.setAttribute('tabindex','0');n.setAttribute('aria-label',label);n.onclick=fn;n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};}
function render(){
 const f=filters(),m=calculate(data,f);$('#status').textContent=`Base fictícia · ${f.year||'2025 e 2026'} · ${f.month?months[+f.month-1]:'Todos os meses'} · ${f.center||'Todos os centros'}`;
 for(const [id,key] of [['net','net'],['expenses','totalExpenses'],['profit','profit']]){$('#'+id).textContent=compact(m[key]);$('#'+id).title=money(m[key]);}
 $('#margin').textContent=percent(m.margin);$('#adherence').textContent=percent(m.adherence);$('#net-meta').textContent='Meta: '+compact(m.planRevenue);$('#profit-meta').textContent='Meta: '+compact(m.planProfit);$('#margin-meta').textContent='Meta: '+percent(m.planMargin);$('#risk').textContent=m.risk;$('#traffic').dataset.risk=m.risk;
 $('#alert').textContent=m.risk==='Controlado'?'→ Resultado acima do planejamento.':m.risk==='Atenção'?'→ Resultado próximo do planejado. Monitorar desvios.':m.risk==='Sem dados'?'Sem dados para esta seleção.':m.risk==='Sem orçamento'?'Sem orçamento para comparar o resultado realizado.':'→ Resultado abaixo do planejado. Investigar despesas e margem.';
 $('#breakeven').textContent='Receita bruta de equilíbrio: '+money(m.breakEven);
 const s=chart('#waterfall',600,205,'Composição do resultado financeiro');const values=[m.gross,-m.deductions,-m.costs,-m.expenses,-m.taxes,m.profit],labels=['Receita Bruta','(-) Deduções','(-) Custos','(-) Despesas','(-) Impostos','Total'];
 let balance=0;const max=Math.max(m.gross,1),top=20,height=140,y=n=>top+(max-n)/max*height;
 values.forEach((v,i)=>{const from=i===5?0:balance,to=i===5?v:balance+v,x=28+i*94,b=node('rect',{x,y:y(Math.max(from,to)),width:73,height:Math.max(1,Math.abs(y(from)-y(to))),fill:i===0?'#3588f2':i===5?'#25b675':'#ed5658'});tooltip(b,`${labels[i]}: ${money(v)}`);s.append(b);s.append(node('text',{x:x+36,y:y(Math.max(from,to))-6,'text-anchor':'middle','font-weight':'700'},compact(v)));s.append(node('text',{x:x+36,y:185,'text-anchor':'middle','font-weight':'600'},labels[i]));if(i<5){balance=to;s.append(node('line',{x1:x+73,x2:x+94,y1:y(to),y2:y(to),stroke:'#c1cbce'}));}});
 const b=chart('#bullet',600,70,'Comparação de receita bruta com ponto de equilíbrio');const bound=Math.max(m.gross,m.breakEven??0,1)*1.2,start=15,end=585,scale=v=>start+v/bound*(end-start);const zones=[0,.9,1,1.2];
 for(let i=0;i<3;i++)b.append(node('rect',{x:scale((m.breakEven??0)*zones[i]),y:20,width:Math.max(1,scale((m.breakEven??0)*zones[i+1])-scale((m.breakEven??0)*zones[i])),height:21,fill:['#9b0000','#ffda00','#0a9d36'][i]}));
 b.append(node('line',{x1:start,y1:30,x2:scale(m.gross),y2:30,stroke:'#1a1a1a','stroke-width':6}));if(m.breakEven!==null){b.append(node('line',{x1:scale(m.breakEven),x2:scale(m.breakEven),y1:13,y2:48,stroke:'white','stroke-width':2}));tooltip(b,'Receita bruta: '+money(m.gross)+'. Equilíbrio: '+money(m.breakEven));}
 b.append(node('text',{x:start,y:62},'R$ 0'));b.append(node('text',{x:end,y:62,'text-anchor':'end'},compact(bound)));
 const t=chart('#trend',1220,155,'Margem realizada, planejada e aderência por mês');
 const series=[{key:'margin',label:'Margem realizada',color:'#3592fc'},{key:'planMargin',label:'Margem planejada',color:'#20bf80'},{key:'adherence',label:'Aderência ao lucro planejado',color:'#ffc627'}];
 const points=months.map((_,i)=>calculate(data,{...f,month:String(i+1).padStart(2,'0')}));const maxY=Math.max(1.1,...points.flatMap(p=>series.map(s=>p[s.key]??0)))*1.08,yPos=v=>15+(maxY-v)/maxY*100;
 for(let i=0;i<=3;i++){const v=maxY*i/3,y=yPos(v);t.append(node('line',{x1:40,x2:1200,y1:y,y2:y,stroke:'#69777a','stroke-dasharray':'2 5',opacity:.4}));t.append(node('text',{x:35,y:y+3,'text-anchor':'end'},Math.round(v*100)+'%'));}
 series.forEach(series=>{const coords=points.map((p,i)=>[55+i*103,yPos(p[series.key]??0)]);t.append(node('path',{d:coords.map((p,i)=>(i?'L':'M')+p.join(',')).join(' '),fill:'none',stroke:series.color,'stroke-width':2.3}));coords.forEach(([x,y],i)=>{const c=node('circle',{cx:x,cy:y,r:f.month===String(i+1).padStart(2,'0')?5:3,fill:series.color});tooltip(c,`${months[i]} · ${series.label}: ${percent(points[i][series.key])}`);pick(c,`Filtrar ${months[i]}`,()=>{$('#month').value=f.month===String(i+1).padStart(2,'0')?'':String(i+1).padStart(2,'0');render();});t.append(c);});});
 months.forEach((m,i)=>t.append(node('text',{x:55+i*103,y:143,'text-anchor':'middle'},m)));
 $('#summary').textContent=`A base fictícia apresenta ${money(m.net)} em receita líquida e ${money(m.profit)} de lucro, com margem de ${percent(m.margin)} e aderência de ${percent(m.adherence)} ao lucro planejado. O índice de risco desta seleção é ${m.risk.toLowerCase()}.`;
}
async function load(){const r=await fetch('data.json');if(!r.ok)throw Error('Falha de dados');data=await r.json();const c=await fetch('config.json').then(r=>r.json());$('#powerbi').href=c.powerbi;months.forEach((m,i)=>{const o=document.createElement('option');o.value=String(i+1).padStart(2,'0');o.textContent=m;$('#month').append(o);});for(const id of ['year','month','center'])$('#'+id).onchange=render;$('#reset').onclick=()=>{$('#year').value='2026';$('#month').value='';$('#center').value='';render();};$('#fullscreen').onclick=()=>document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();render();}
load().catch(e=>{console.error(e);$('#status').classList.add('error');$('#status').textContent='Não foi possível carregar os dados. Recarregue a página.';});
