import {ratio, monthlySelection, aggregate, planComparison, cohortMatrix} from './metrics.mjs';

const $=id=>document.getElementById(id);
const ptInt=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
const ptPct=new Intl.NumberFormat('pt-BR',{style:'percent',minimumFractionDigits:2,maximumFractionDigits:2});
const ptMoney=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
const percent=n=>n===null||!Number.isFinite(n)?'—':ptPct.format(n);
const integer=n=>ptInt.format(n);
const moneyCents=n=>ptMoney.format(n/100);
const svgNS='http://www.w3.org/2000/svg';
const monthLabel=v=>{const [year,month]=v.split('-');return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Number(month)-1]+'/'+year.slice(-2)};
let data,model;
const state={plan:'',from:'',to:''};

function element(name,cls,text){
 const node=document.createElement(name);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);
 return node;
}
function svgNode(name,attributes={},text){
 const node=document.createElementNS(svgNS,name);
 for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));
 if(text!==undefined)node.textContent=String(text);
 return node;
}
function lineChart(rows){
 const target=$('chart');
 target.replaceChildren();
 if(!rows.length){target.textContent='Nenhum período para os filtros selecionados.';return}
 const width=940,height=285,left=53,right=23,top=20,bottom=49;
 const plotW=width-left-right,plotH=height-top-bottom;
 const maxRate=Math.max(.05,...rows.map(r=>ratio(r.churned,r.active_start)||0));
 const yMax=Math.ceil(maxRate*20)/20;
 const x=i=>left+(rows.length===1?plotW/2:i/(rows.length-1)*plotW);
 const y=p=>top+(yMax-p)/yMax*plotH;
 const svg=svgNode('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':'Gráfico de linhas com percentual de churn dos meses selecionados.'});
 const title=svgNode('title',{},'Taxa mensal de churn, apenas clientes fictícios');
 svg.append(title);
 for(let i=0;i<=4;i++){
  const p=yMax*i/4,yi=y(p);
  svg.append(svgNode('line',{x1:left,y1:yi,x2:width-right,y2:yi,stroke:'#365267','stroke-dasharray':'3 7'}));
  svg.append(svgNode('text',{x:left-9,y:yi+4,'text-anchor':'end'},Math.round(p*100)+'%'));
 }
 const vals=rows.map(r=>ratio(r.churned,r.active_start)||0);
 const d=vals.map((value,i)=>(i?'L':'M')+x(i).toFixed(2)+','+y(value).toFixed(2)).join(' ');
 const path=svgNode('path',{d,fill:'none',stroke:'#f2aaa4','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'});
 svg.append(path);
 rows.forEach((r,i)=>{
  const p=vals[i],circle=svgNode('circle',{cx:x(i),cy:y(p),r:4.5,fill:'#f2aaa4',class:'point',tabindex:0,'aria-label':r.month+': '+percent(p)+'; '+integer(r.churned)+' cancelamentos em '+integer(r.active_start)+' clientes ativos'});
  circle.append(svgNode('title',{},r.month+' · '+percent(p)+' · '+r.churned+' / '+r.active_start));
  svg.append(circle);
  if(i===0||i===rows.length-1||i%3===0){
   svg.append(svgNode('text',{x:x(i),y:height-18,'text-anchor':'middle'},monthLabel(r.month)));
  }
 });
 target.append(svg);
}

function fillTable(rows){
 const body=$('monthTable');body.replaceChildren();
 for(const r of rows){
  const tr=element('tr');
  for(const item of [r.month,integer(r.active_start),integer(r.churned),percent(ratio(r.churned,r.active_start))])
   tr.append(element('td','',item));
  body.append(tr);
 }
}

function bars(from,to){
 const bars=$('planBars');bars.replaceChildren();
 const items=planComparison(data,{from,to});
 const maxRate=Math.max(.001,...items.map(x=>x.churn_rate||0));
 for(const item of items){
  const block=element('div','plan-item'),heading=element('div','plan-bar-heading');
  heading.append(element('span','',item.plan),element('b','',percent(item.churn_rate)));
  const track=element('div','track'),fill=element('div','bar-fill');
  fill.style.width=(Math.max(0,(item.churn_rate||0)/maxRate)*100).toFixed(2)+'%';
  track.append(fill);
  block.append(heading,track,element('div','plan-sub',
    integer(item.churned)+' saídas / '+integer(item.active)+' clientes-mês · '+moneyCents(item.lost_mrr_cents)+' MRR contratual'
  ));
  bars.append(block);
 }
 const exposures=items.reduce((s,x)=>s+x.active,0);
 const exits=items.reduce((s,x)=>s+x.churned,0);
 $('insightPlan').textContent='Os planos somam '+integer(exposures)+' exposições e '+integer(exits)+' cancelamentos no período. O percentual por plano usa seu próprio denominador. Diferenças foram criadas pelo gerador e não representam efeitos reais de preços ou campanhas.';
}

function heatmap(){
 const target=$('cohortHeatmap');target.replaceChildren();
 const rows=cohortMatrix(data,'2025',8);
 const table=element('table');
 const thead=element('thead'),htr=element('tr');
 for(const label of ['Coorte','Base','M0','M1','M2','M3','M4','M5','M6','M7','M8']){
  htr.append(element('th','',label));
 }
 thead.append(htr);table.append(thead);
 const tbody=element('tbody');
 for(const cohort of rows){
  const tr=element('tr');
  tr.append(element('th','',cohort.cohort));
  tr.append(element('td','',integer(cohort.size)));
  for(const rate of cohort.ages){
   const td=element('td',rate===null?'empty-cell':'value-cell',rate===null?'—':Math.round(rate*100)+'%');
   if(rate!==null)td.style.backgroundColor='rgba(98,191,159,'+(0.12+rate*0.64).toFixed(3)+')';
   tr.append(td);
  }
  tbody.append(tr);
 }
 table.append(tbody);target.append(table);
}

function signals(){
 const target=$('signals');target.replaceChildren();
 const max=Math.max(0.01,...data.signals.map(s=>s.churn_rate||0));
 for(const item of data.signals){
  const block=element('div','signal-item');
  const heading=element('div','signal-row');
  heading.append(element('span','',item.bucket),element('b','',percent(item.churn_rate)));
  const track=element('div','track'),fill=element('div','bar-fill');
  fill.style.width=((item.churn_rate||0)/max*100).toFixed(2)+'%';track.append(fill);
  block.append(heading,track,element('div','signal-foot',
   integer(item.churned)+' cancelamentos em '+integer(item.customer_months)+' observações'
  ));
  target.append(block);
 }
}
function modelInfo(){
 const test=model.metrics.test;
 $('modelAuc').textContent=test.auc_roc.toFixed(4).replace('.',',');
 $('modelBrier').textContent=test.brier_score.toFixed(4).replace('.',',');
 $('baselineBrier').textContent=test.baseline_brier_train_prevalence.toFixed(4).replace('.',',');
 $('modelLift').textContent=test.lift_top_10pct.toFixed(2).replace('.',',')+'×';
 $('modelEvents').textContent=integer(test.churn_events);
}

function render(){
 if(!data)return;
 state.plan=$('plan').value;
 state.from=$('fromMonth').value;
 state.to=$('toMonth').value;
 if(state.from>state.to){
  $('status').classList.add('error');
  $('status').textContent='Período inválido: selecione um mês inicial igual ou anterior ao mês final.';
  for(const id of ['k-exposures','k-churned','k-rate','k-lost-mrr'])$(id).textContent='—';
  $('chart').replaceChildren();$('monthTable').replaceChildren();$('planBars').replaceChildren();return;
 }
 $('status').classList.remove('error');
 const rows=monthlySelection(data,state);
 const aggregateSelected=aggregate(rows);
 $('k-exposures').textContent=integer(aggregateSelected.active);
 $('k-churned').textContent=integer(aggregateSelected.churned);
 $('k-rate').textContent=percent(aggregateSelected.churn_rate);
 $('k-lost-mrr').textContent=moneyCents(aggregateSelected.lost_mrr_cents);
 $('status').textContent='FONTE FICTÍCIA · '+(state.plan||'todos os planos')+' · '+state.from+' a '+state.to+' · '+rows.length+' meses · taxas ponderadas por exposição.';
 lineChart(rows);fillTable(rows);bars(state.from,state.to);
}

async function load(){
 for(const id of ['plan','fromMonth','toMonth'])$(id).addEventListener('change',render);
 $('reset').addEventListener('click',()=>{
  $('plan').value='';
  $('fromMonth').value=data.monthly[0].month;
  $('toMonth').value=data.monthly.at(-1).month;
  render();
  $('plan').focus();
 });
 try{
  const [metricsResponse,modelResponse]=await Promise.all([
   fetch('./metrics.json',{cache:'no-cache'}),
   fetch('./model_card.json',{cache:'no-cache'})
  ]);
  if(!metricsResponse.ok||!modelResponse.ok)throw Error('Artefatos de análise não disponíveis.');
  data=await metricsResponse.json();model=await modelResponse.json();
  if(data.metadata?.synthetic!==true||model.synthetic!==true)throw Error('Fonte não é sintética; execução bloqueada.');
  const first=data.monthly[0].month,last=data.monthly.at(-1).month;
  for(const month of data.monthly.map(x=>x.month)){
   for(const id of ['fromMonth','toMonth']){
    const option=element('option','',monthLabel(month));option.value=month;$(id).append(option);
   }
  }
  $('fromMonth').value=first;$('toMonth').value=last;
  heatmap();signals();modelInfo();render();
 }catch(e){
  $('status').classList.add('error');
  $('status').textContent='Não foi possível carregar os agregados sintéticos. Consulte o código e os CSVs no GitHub.';
  console.error('Falha do dashboard ChurnLab:',e);
 }
}
load();
