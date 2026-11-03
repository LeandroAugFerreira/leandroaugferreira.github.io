"""Add verified repository/web links without rebuilding project visuals."""
from pathlib import Path
import json,re
from html import escape
ROOT=Path(__file__).resolve().parents[1]
def integrate():
 catalog=json.loads((ROOT/'tools/project_catalog.json').read_text(encoding='utf-8'))
 for p in catalog:
  if not p.get('repository'):continue
  file=ROOT/p['page'];text=file.read_text(encoding='utf-8')
  text=re.sub(r'<!-- REPOSITORY LINKS START -->.*?<!-- REPOSITORY LINKS END -->','',text,flags=re.S)
  links='<a class="'+('button' if p['slug']=='chronos' else 'case-button')+'" href="'+escape(p['repository'],quote=True)+'" target="_blank" rel="noopener noreferrer">Ver código no GitHub ↗</a>'
  if p.get('web_dashboard'):
   links+='<a class="case-button" href="'+escape(p['web_dashboard'],quote=True)+'" target="_blank" rel="noopener noreferrer">Abrir versão web ↗</a>'
  marker='<!-- REPOSITORY LINKS START -->'+links+'<!-- REPOSITORY LINKS END -->'
  header=re.search(r'<header\b[^>]*>.*?</header>',text,flags=re.S)
  assert header,p['page']
  hero,count=re.subn(r'(<div class="(?:actions|case-actions|atelie-actions|tc-actions)(?: [^"]*)?">)(.*?)(</div>)',lambda m:m[1]+m[2]+marker+m[3],header[0],count=1,flags=re.S)
  assert count==1,p['page']
  text=text[:header.start()]+hero+text[header.end():]
  if p.get('web_dashboard'):
   old='As imagens registram recortes específicos do relatório. A base tabular de origem, o arquivo PBIX e as fórmulas das medidas não constam deste repositório do portfólio. A apresentação permite avaliar a leitura dos indicadores; a reprodução dos cálculos depende desses materiais. Não são atribuídos ganhos comprovados de uma implantação real.'
   note='A versão web financeira utiliza uma base fictícia criada para demonstração, com metodologia própria documentada no repositório. O relatório Power BI desta página permanece preservado.' if p['slug']=='financeiro' else 'As fontes Power BI e planilhas preservadas, as medidas e a metodologia estão no repositório do projeto. A versão web é complementar ao relatório Power BI original desta página.'
   new=note+' Não são atribuídos ganhos comprovados de uma implantação real.'
   text=text.replace(old,new)
  file.write_text(text,encoding='utf-8')
if __name__=='__main__':integrate()
