export const sum=(rows,key)=>rows.reduce((s,r)=>s+(Number.isFinite(r[key])?r[key]:0),0);
export const avg=(rows,key)=>{const a=rows.filter(r=>Number.isFinite(r[key]));return a.length?sum(a,key)/a.length:null;};
export const divide=(a,b,otherwise=null)=>b? a/b:otherwise;
export const unique=a=>[...new Set(a)];
export const fieldKey=f=>`${f.entity}|${f.column}`;
export function createModel(data,kind){
 const tables=data.tables, isCommercial=kind==='comercial';
 const fact=isCommercial?'fVendas':'fViagens';
 const calendar=isCommercial?'dCalendario':'dCalendario';
 const dateCol=isCommercial?'Datas':'Date';
 const indexes={};
 const rowCache=new Map();
 const cacheKey=(table,ctx)=>table+JSON.stringify(Object.keys(ctx).sort().map(k=>[k,ctx[k] instanceof Set?[...ctx[k]]:ctx[k]]));
 const index=(name,key)=>indexes[name]??=(new Map((tables[name]||[]).map(r=>[r[key],r])));
 const relations=isCommercial?[['dProdutos','SKU','SKU'],['dLojas','ID Loja','ID Loja'],['dClientes','ID Cliente','ID Cliente']]:[['dCliente','id_cliente','id_cliente'],['dEmpresa','owner_id','owner_id'],['dRotas','id_linha','id_linha'],['dStatus','id_status','id_status'],['dVeículos','id_veiculo','id_veiculo'],['dFaixaTempo','Faixa','Faixa Tempo']];
 const cal=new Map((tables[calendar]||[]).map(r=>[String(r[dateCol]).slice(0,10),r]));
 function value(row,table,f){
  if(f.entity===table)return row[f.column];
  if(f.entity===calendar){const dt=row[isCommercial?(table==='fDevoluções'?'Data Devolução':'Data da Venda'):'data_base'];return cal.get(String(dt).slice(0,10))?.[f.column];}
  const rel=relations.find(r=>r[0]===f.entity);
  if(rel)return index(rel[0],rel[1]).get(row[rel[2]])?.[f.column];
  return undefined;
 }
 function rows(table,ctx={}){
  const key=cacheKey(table,ctx);if(rowCache.has(key))return rowCache.get(key);
  const result=(tables[table]||[]).filter(r=>Object.entries(ctx).every(([k,v])=>{
   if(k==='$dates')return v.has(String(r[isCommercial?(table==='fDevoluções'?'Data Devolução':'Data da Venda'):'data_base']).slice(0,10));
   if(k==='$selection')return true;
   const [entity,column]=k.split('|');if(entity==='Parâmetro')return true;const actual=String(value(r,table,{entity,column})??'');return v===null||v===undefined||(Array.isArray(v)?v.some(x=>String(x)===actual):actual===String(v));
  }));
  if(rowCache.size>2500)rowCache.clear();rowCache.set(key,result);return result;
 }
 function withFilter(ctx,f,v){const key=fieldKey(f);return {...ctx,[key]:v,...(Array.isArray(ctx[key])?{$selection:{...ctx.$selection,[key]:ctx[key]}}:{})};}
 function shiftYear(ctx,offset=-1){
  const c={...ctx};const keys=Object.keys(c).filter(k=>k.startsWith(calendar+'|'));
  const dates=new Set((tables[calendar]||[]).filter(r=>keys.every(k=>String(r[k.split('|')[1]])===String(c[k]))).map(r=>{
   const d=String(r[dateCol]).slice(0,10);return String(Number(d.slice(0,4))+offset)+d.slice(4);
  }));
  keys.forEach(k=>delete c[k]);c.$dates=dates;return c;
 }
 const product=r=>index('dProdutos','SKU').get(r.SKU)||{};
 const revenue=rr=>rr.reduce((s,r)=>s+r['Qtd Vendida']*(product(r)['Preço Unitario']||0),0);
 const profit=rr=>rr.reduce((s,r)=>s+r['Qtd Vendida']*((product(r)['Preço Unitario']||0)*.9-(product(r)['Custo Unitario']||0)),0);
 function measure(name,ctx={}){
  const rr=rows(fact,ctx);let n=name;
  if(isCommercial){
   const sales=sum(rr,'Qtd Vendida'),rev=revenue(rr),p=profit(rr);const returns=()=>rows('fDevoluções',ctx);
   const lost=()=>returns().reduce((s,r)=>s+r['Qtd Devolvida']*(product(r)['Preço Unitario']||0),0);
   if(n==='Total Vendas')return sales;
   if(n==='Faturamento Total')return rev;
   if(n==='Lucro Total')return p;
   if(n==='% Margem de Lucro')return divide(p,rev);
   if(n==='Faturamento LY')return ctx['dCalendario|Ano']?measure('Faturamento Total',shiftYear(ctx)):null;
   if(n.includes('Crescimento')&&n.includes('YoY')){
    if(!ctx['dCalendario|Ano'])return 'N/A';
    const base=n.includes('Lucro')?'Lucro Total':n.includes('Vendas')?'Total Vendas':'Faturamento Total';
    const before=measure(base,shiftYear(ctx));const growth=divide(measure(base,ctx)-before,before);return growth?growth:'N/A';
   }
   if(n==='Total Devoluções')return sum(returns(),'Qtd Devolvida');
   if(n==='% Devoluções')return divide(sum(returns(),'Qtd Devolvida'),sales);
   if(n==='Faturamento Perdido'||n==='Prejuízo Devoluções')return lost();
   if(n==='% Fat Perdido')return divide(lost(),rev);
   if(n==='Vendas Online')return measure('Total Vendas',{...ctx,'dLojas|Tipo':'Online'});
   if(n==='% Vendas Online')return divide(measure('Vendas Online',ctx),sales,'Sem vendas');
   if(n==='Produto Mais Vendido'||n==='Qtd Vendida (Top 1 Produto)'||n==='% das Vendas (Top 1 Produto)'){
    const groups=group({entity:'dProdutos',column:'Nome Produto'},'Total Vendas',ctx).sort((a,b)=>b.value-a.value||String(b.label).localeCompare(String(a.label)));
    const top=groups[0];return n==='Produto Mais Vendido'?top?.label:n==='Qtd Vendida (Top 1 Produto)'?top?.value:divide(top?.value,sales);
   }
   if(n==='Loja + Vendas'||n==='Qtd Vendida (Loja + Vendas)'||n==='% das Vendas (Loja + Vendas)'){
    const top=group({entity:'dLojas',column:'Nome da Loja'},'Total Vendas',ctx).sort((a,b)=>b.value-a.value||String(b.label).localeCompare(String(a.label)))[0];
    return n==='Loja + Vendas'?top?.label:n==='Qtd Vendida (Loja + Vendas)'?top?.value:divide(top?.value,sales);
   }
  }else{
   const count=rr.filter(r=>r.id_operacao!==null).length,late=rr.filter(r=>r.atraso_horas>0),onTime=rr.filter(r=>r['Status Prazo']==='No Prazo').length;
   if(n==='Total Viagens')return count;
   if(n==='Volume Total')return sum(rr,'peso_total');
   if(['Tempo Médio','Tempo Médio (h)','Tempo Médio Entrega'].includes(n))return avg(rr,'tempo_execucao_horas');
   if(n==='Qtd Atrasos')return late.length;
   if(['% No Prazo','% No Prazo Formatado'].includes(n))return divide(onTime,count);
   if(['% Viagens Atrasadas','% Atraso'].includes(n))return divide(late.length,count);
   if(n==='Tempo Médio Atraso')return avg(late,'atraso_horas');
   if(n==='Maior Atraso (h)')return rr.length?Math.max(...rr.map(r=>r.atraso_horas??-Infinity)):null;
   if(n==='Desvio Tempo (h)'){const a=rr.filter(r=>Number.isFinite(r.tempo_execucao_horas)),m=avg(a,'tempo_execucao_horas');return a.length>=2?Math.sqrt(a.reduce((s,r)=>s+(r.tempo_execucao_horas-m)**2,0)/a.length):null;}
   if(n==='Qtd Motoristas')return unique(rr.map(r=>r.motorista)).length;
   const vehicles=(tables['dVeículos']||[]).filter(r=>Object.entries(ctx).filter(([k])=>k.startsWith('dVeículos|')).every(([k,v])=>v===null||String(r[k.split('|')[1]]??'')===String(v)));
   const allVehicles=vehicles.length;
   if(['Total Veículos','Qtd Veiculos'].includes(n))return allVehicles;
   if(n==='Veículos com Atraso')return unique(late.map(r=>r.id_veiculo)).length;
   if(n==='Veículos Sem Atraso')return allVehicles-unique(late.map(r=>r.id_veiculo)).length;
   if(n==='% Veículos Eficientes')return divide(allVehicles-unique(late.map(r=>r.id_veiculo)).length,allVehicles);
   if(n==='Atraso Motorista')return sum(rr,'atraso_horas');
   if(n==='Tempo Médio Motorista'){const means=unique(rr.map(r=>r.motorista)).map(m=>avg(rr.filter(r=>r.motorista===m),'tempo_execucao_horas')).filter(v=>v!==null);return means.length?means.reduce((a,b)=>a+b,0)/means.length:null;}
   if(n==='Qtd Atrasos Motorista'){const c={};if(ctx['fViagens|motorista']!==undefined)c['fViagens|motorista']=ctx['fViagens|motorista'];return measure('Qtd Atrasos',c);}
   if(n==='Classificação Motorista'){const a=measure('Qtd Atrasos Motorista',ctx),t=measure('Tempo Médio Motorista',ctx);return a>=3&&t>65?'🔴 Crítico':a>=2||t>60?'🟡 Atenção':'🟢 OK';}
   if(n==='Media Geral Tempo')return avg(tables.fViagens,'tempo_execucao_horas');
   if(n==='Media Viagens'){
    const c=Object.fromEntries(Object.entries(ctx).filter(([k])=>!k.startsWith('dCalendario|')));const a=group({entity:'dCalendario',column:'AnoMes'},'Total Viagens',c).filter(r=>r.value>0);return a.length?a.reduce((s,r)=>s+r.value,0)/a.length:null;
   }
   if(n==='% Impacto por Tempo'||n==='% Impacto Veículo'){
    const c=Object.fromEntries(Object.entries(ctx).filter(([k])=>k!=='dVeículos|placa'));return divide(sum(rr,'atraso_horas'),sum(rows(fact,c),'atraso_horas'));
   }
   if(n==='Score Veículo')return late.length+sum(rr,'atraso_horas')/10;
   if(n==='% Impacto Score')return divide(measure('Score Veículo',ctx),measure('Score Veículo',{}));
   if(n==='Meta')return .95;if(n==='Minimo')return 0;if(n==='Maximo')return 1;
   if(n==='Qtd Não Informado'){const c={...ctx};delete c['fViagens|flag_sla_atualizada'];return rows(fact,c).filter(r=>r.flag_sla_atualizada==='Não informado').length;}
   if(n==='Ranking Motorista'||n==='Rank Motorista'){
    const metric=n==='Ranking Motorista'?'Atraso Motorista':'Qtd Atrasos Motorista';const c={...ctx};delete c['fViagens|motorista'];const vals=unique(group({entity:'fViagens',column:'motorista'},metric,c).map(r=>r.value)).sort((a,b)=>b-a);return vals.indexOf(measure(metric,ctx))+1;
   }
   if(n==='Rank Cliente'||n==='Rank Rota'){
    const f=n==='Rank Cliente'?{entity:'dCliente',column:'razao_social'}:{entity:'dRotas',column:'uf_rota'},key=fieldKey(f),c={...ctx};delete c[key];if(ctx.$selection?.[key])c[key]=ctx.$selection[key];
    const labels=unique(rows(fact,c).map(r=>value(r,fact,f))).sort((a,b)=>String(a).localeCompare(String(b)));
    const score=label=>measure('Volume Total',withFilter(c,f,label))+(n==='Rank Rota'?(labels.indexOf(label)+1)/1e6:0);
    const scores=unique(labels.map(score)).sort((a,b)=>b-a);return scores.indexOf(score(ctx[key]))+1;
   }
  }
  return null;
 }
 function group(f,metric,ctx={},table=fact){
  const labels=unique(rows(table,ctx).map(r=>value(r,table,f)));
  for(const source of (isCommercial?['fVendas','fDevoluções']:[fact])){
   const bins=new Map();for(const r of rows(source,ctx)){const label=value(r,source,f)??'';if(!bins.has(label))bins.set(label,[]);bins.get(label).push(r);}
   for(const label of labels)rowCache.set(cacheKey(source,withFilter(ctx,f,label)),bins.get(label??'')||[]);
  }
  return labels.map(label=>({label:label??'',value:measure(metric,withFilter(ctx,f,label)),context:withFilter(ctx,f,label)}));
 }
 return {tables,fact,rows,value,measure,group,withFilter,shiftYear};
}
