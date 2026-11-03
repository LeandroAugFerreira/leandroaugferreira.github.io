export function calculate(data,{year='',month='',center=''}={}){
 const match=r=>(!year||r.data.slice(0,4)===String(year))&&(!month||r.data.slice(5,7)===String(month).padStart(2,'0'))&&(!center||r.centro===center);
 const rr=data.movimentos.filter(match),plans=data.orcamento.filter(match),sum=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
 const category=n=>sum(rr.filter(r=>r.categoria===n),'valor_centavos')/100;
 const gross=category('Receita Bruta'),deductions=category('Deduções'),costs=category('Custos'),expenses=category('Despesas'),taxes=category('Impostos'),net=gross-deductions,totalExpenses=costs+expenses+taxes,profit=net-totalExpenses;
 const planRevenue=sum(plans,'receita_liquida_meta_centavos')/100,planProfit=sum(plans,'lucro_meta_centavos')/100,margin=net?profit/net:null,planMargin=planRevenue?planProfit/planRevenue:null,adherence=planProfit?profit/planProfit:null;
 // Gross break-even revenue: variable deductions + costs + taxes; operating expenses fixed.
 const contributionRate=gross?1-(deductions+costs+taxes)/gross:null;
 const breakEven=contributionRate>0?expenses/contributionRate:null;
 const risk=margin===null?'Sem dados':margin<0||adherence<.9?'Alto':adherence<1?'Atenção':'Controlado';
 return {rows:rr.length,gross,deductions,costs,expenses,taxes,net,totalExpenses,profit,margin,planRevenue,planProfit,planMargin,adherence,breakEven,risk};
}
