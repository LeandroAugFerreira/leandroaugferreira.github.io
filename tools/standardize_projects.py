"""Keep published project pages, guides and catalog cards in a consistent format."""
from pathlib import Path
from html import escape
import argparse
import hashlib
import json
import re
import unicodedata
from audit_metadata import complete as complete_metadata

ROOT=Path(__file__).resolve().parents[1]
PUBLIC='https://leandroaugferreira.github.io/'
CATALOG=json.loads((ROOT/'tools/project_catalog.json').read_text(encoding='utf-8'))

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def asset_sha(path):
 data=path.read_bytes()
 if path.suffix.lower() in ('.css','.js','.json','.html','.svg','.vtt','.md'):
  data=data.replace(b'\r\n',b'\n')
 return hashlib.sha256(data).hexdigest()
def resource(path):return path+'?v='+asset_sha(ROOT/path)[:12]
def slug(value):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',value).encode('ascii','ignore').decode().lower()).strip('-')
def rich(value):
 value=escape(value)
 value=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',value)
 return re.sub(r'`(.+?)`',r'<code>\1</code>',value)
def signature():return '<div class="case-signature"><span class="case-monogram" aria-hidden="true">lf.</span><span><small>DESIGN & DESENVOLVIMENTO</small><b>Leandro Augusto Ferreira</b></span></div>'
def head(p,title,description,filename,manual=False):
 image=p['image']
 return f'''<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} | Leandro Augusto Ferreira</title><meta name="description" content="{escape(description,quote=True)}"><meta name="author" content="Leandro Augusto Ferreira"><meta name="theme-color" content="#081827"><link rel="canonical" href="{PUBLIC+filename}"><meta property="og:type" content="website"><meta property="og:title" content="{escape(title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="{PUBLIC+filename}"><meta property="og:image" content="{PUBLIC+image}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="{resource('assets/project-standard.css')}">'''+('' if manual else '<link rel="stylesheet" href="'+resource('assets/video-player.css')+'"><script src="'+resource('assets/video-player.js')+'" defer></script>')+'</head>'
def nav(p,manual=False):
 project=PUBLIC+p['page'] if manual else p['page']
 return '<a class="case-skip" href="#conteudo">Pular para o conteúdo</a><nav class="case-shell case-nav" aria-label="Navegação do projeto"><a href="'+PUBLIC+'#'+p['anchor']+'">← Portfólio</a><div><a href="'+project+'">O projeto</a><a href="'+p['manual']+'" '+('aria-current="page"' if manual else 'target="_blank" rel="noopener noreferrer"')+'>Manual online ↗</a><a href="'+project+('#relatorio' if p['kind']=='bi' else '#download')+'">'+('Relatório interativo' if p['kind']=='bi' else 'Aplicativo Windows')+'</a></div></nav>'
def footer(p):return '<footer class="case-footer"><div class="case-shell">'+signature()+'<p>'+escape(p['title'])+' · Projeto de portfólio · <a href="'+PUBLIC+'#projetos">Outros projetos</a></p></div></footer>'
def md(text):
 out=[];toc=[];listing=None
 def close():
  nonlocal listing
  if listing:out.append('</'+listing+'>');listing=None
 for line in text.splitlines():
  if line.startswith('# '):continue
  if not line.strip():close();continue
  if line.startswith('## '):
   close();title=line[3:];ident=slug(title);toc.append((ident,title));out.append('<h2 id="'+ident+'">'+rich(title)+'</h2>');continue
  match=re.match(r'^(\d+\.|-) (.+)',line)
  if match:
   kind='ul' if match[1]=='-' else 'ol'
   if listing!=kind:close();out.append('<'+kind+'>');listing=kind
   out.append('<li>'+rich(match[2])+'</li>')
  else:close();out.append('<p>'+rich(line)+'</p>')
 close();return '\n'.join(out),''.join('<a href="#'+i+'">'+escape(t)+'</a>' for i,t in toc)
def guide(p):
 source=(ROOT/'docs/manuais'/str(p['slug']+'.md')).read_text(encoding='utf-8')
 body,toc=md(source);title=source.splitlines()[0][2:]
 return head(p,title,'Guia de uso e roteiro rápido de avaliação do projeto '+p['title']+'. Por Leandro Augusto Ferreira.',p['manual'],True)+f'''<body class="case-guide" style="--project-accent:{p['manual_accent']}">'''+nav(p,True)+f'''<main class="case-shell" id="conteudo"><header class="case-guide-heading"><p class="case-eyebrow">{escape(p['title'])} / GUIA DE USO</p><h1>{escape(title)}</h1><p>Comece pelo roteiro rápido. Depois, conheça os recursos e os pontos de implementação que ajudam a avaliar o projeto.</p><a class="case-button case-primary" href="{PUBLIC+p['page']}#{'relatorio' if p['kind']=='bi' else 'download'}">{'Abrir relatório interativo' if p['kind']=='bi' else 'Ir para o download do aplicativo'} →</a></header><div class="case-guide-layout"><aside class="case-guide-index" aria-label="Índice do guia"><p class="case-eyebrow">NESTE GUIA</p>{toc}</aside><article class="case-guide-content" aria-label="Manual de {escape(p['title'])}">{body}</article></div></main>'''+footer(p)+'</body></html>'
def marked(kind,content):return '<!-- PROJECT STANDARD '+kind+' START -->\n'+content+'\n<!-- PROJECT STANDARD '+kind+' END -->'
def overview(p):
 cols=[('O problema',p['problem']),('O que construí',p['solution']),('O que observar',p['evaluate'])]
 return marked('OVERVIEW','<section class="case-section" id="visao-do-projeto" aria-labelledby="avaliacao-titulo"><p class="case-eyebrow">PARA QUEM ESTÁ AVALIANDO</p><h2 id="avaliacao-titulo">O projeto em um minuto.</h2><div class="case-grid">'+''.join('<article><h3>'+a+'</h3><p>'+escape(b)+'</p></article>' for a,b in cols)+'</div></section>')
def manual_callout(p):return marked('MANUAL','<section class="case-guide-callout" id="manual" aria-labelledby="manual-titulo"><div><p class="case-eyebrow">GUIA EM UMA ABA PRÓPRIA</p><h2 id="manual-titulo">Um roteiro para conhecer e avaliar.</h2><p>Primeiros passos, um passeio de cinco minutos e explicações dos principais recursos. A leitura técnica fica ao final do guia.</p></div><a class="case-button case-primary" href="'+p['manual']+'" target="_blank" rel="noopener noreferrer">Abrir manual online ↗</a></section>')
def download(p):
 intro={
 'voxtexto':('Instale. Transcreva. Revise.','Baixe o instalador V2.0 e siga o assistente. O modelo Whisper pode precisar de download na primeira utilização; depois de disponível, o processamento é local.',['Instale a V2.0 em um computador Windows.','Abra o VoxTexto e crie sua conta ou entre.','Adicione um áudio curto, transcreva e exporte o Word.']),
 'nexolog':('Da operação à consulta.','Abra o executável e escolha Usar acesso demo. A base fictícia é criada para a sua instalação, sem exigir Python ou Node.js.',['Baixe e abra NexoLog.exe.','Entre pelo atalho Usar acesso demo.','Explore estoque, pedidos, rastreamento simulado e relatórios.']),
 'atelie-verde':('Uma loja. Uma operação conectada.','O download é um ZIP com o aplicativo Windows e seus recursos. Extraia a pasta inteira e mantenha _internal junto de AtelieVerde.exe. Não exige Python ou Node.js.',['Extraia AtelieVerde-Windows.zip por completo.','Abra AtelieVerde.exe e escolha Cliente ou Administrador.','Explore loja, serviços e gestão com os dados fictícios.']),
 'nexofiscal':('Do primeiro acesso à simulação.','Abra o executável e escolha Entrar no portfólio. A distribuição inclui os recursos de execução e cria uma base fictícia própria, sem exigir Python ou Node.js.',['Baixe e abra NexoFiscal.exe.','Entre no portfólio e escolha um exemplo de demonstração.','Revise os dados e gere um documento simulado, sem validade fiscal.'])
 }
 title,copy,steps=intro[p['slug']]
 credentials={
 'voxtexto':'Crie sua própria conta na instalação. O histórico fica vinculado ao usuário.',
 'nexolog':'Conta pública: demo@nexolog.app · senha NexoLog@2026.',
 'atelie-verde':'Cliente: cliente@atelieverde.local · administrador: admin@atelieverde.local · senha pública AtelieVerde@2026.',
 'nexofiscal':'Conta pública: portfolio@nexofiscal.example.com · senha NexoFiscalDemo@2026. SMTP e n8n iniciam sem configuração.'
 }[p['slug']]
 extras=''
 if p.get('source'):extras+='<a class="case-button" href="'+p['source']+'" '+('target="_blank" rel="noopener noreferrer"' if p['source'].startswith('https:') else 'download')+'>Código-fonte e documentação</a>'
 if p['slug']=='voxtexto':extras+='<a class="case-button" href="https://github.com/LeandroAugFerreira/transcricao-audio-web/releases/tag/v1.2.0" target="_blank" rel="noopener noreferrer">Versão anterior: V1.0</a>'
 if p['slug']=='nexofiscal':
  extras+='<a class="case-button" href="downloads/NexoFiscal-documento-demonstrativo.pdf" target="_blank" rel="noopener noreferrer">Examinar documento simulado (PDF)</a>'
  extras+='<a class="case-button" href="downloads/NexoFiscal-testes-backend.json" target="_blank" rel="noopener noreferrer">Registro dos 60 testes de backend</a>'
 if p['slug'] in ('nexolog','nexofiscal'):extras+='<a class="case-button" href="downloads/'+('NexoLog' if p['slug']=='nexolog' else 'NexoFiscal')+'-Windows-manifesto.json">Integridade do aplicativo</a>'
 if p['slug']=='atelie-verde':extras+='<a class="case-button" href="https://github.com/LeandroAugFerreira/leandroaugferreira.github.io/releases/tag/atelie-verde-2026.10.12-clientes" target="_blank" rel="noopener noreferrer">Distribuição e arquivos</a>'
 section='<section class="case-section" id="download" aria-labelledby="download-titulo"><div class="case-download"><div><p class="case-eyebrow">EXPERIMENTE NO WINDOWS</p><h2 id="download-titulo">'+title+'</h2><p>'+escape(copy)+'</p><div class="case-actions"><a class="case-button case-primary" href="'+p['download']+'" '+('target="_blank" rel="noopener noreferrer"' if p['download'].startswith('https:') else 'download')+'>'+p['download_label']+' ↓</a><a class="case-button" href="'+p['manual']+'" target="_blank" rel="noopener noreferrer">Como usar ↗</a></div><p class="case-note">'+escape(p.get('version','Demonstração Windows'))+' · Leia o guia antes de começar. Se a política do computador impedir a abertura, confira a origem e procure o responsável pelo equipamento.</p></div><div class="case-download-side"><h3>Seu primeiro teste</h3><ol>'+''.join('<li>'+escape(s)+'</li>' for s in steps)+'</ol><p class="case-note">'+escape(credentials)+'</p></div></div><details class="case-code"><summary>Código, versões e informações técnicas</summary><p>Estes links complementam a avaliação. O aplicativo é o caminho de experimentação; o código é destinado à análise técnica.</p><div class="case-actions">'+extras+'</div></details></section>'
 alias='<span id="experimentar" aria-hidden="true"></span>' if p['slug'] in ('voxtexto','atelie-verde') else ''
 return marked('DOWNLOAD',alias+section)
def teaser(p,context=''):
 media=p['media'];poster=p.get('poster','img/teasers/'+media+'.jpg')
 if not (ROOT/poster).is_file():poster=p['image']
 scenes=resource('media/'+media+'-resumo-cenas.json')
 duration=round(json.loads((ROOT/('media/'+media+'-resumo-cenas.json')).read_text(encoding='utf-8'))[-1]['end'])
 pt=resource('media/'+media+'-resumo-pt.vtt');en=resource('media/'+media+'-resumo-en.vtt')
 return f'''<div class="teaser-player" data-teaser-player data-project-name="{escape(p['title'],quote=True)}" data-duration="{duration}" data-scenes="{scenes}"><video controls playsinline preload="none" poster="{resource(poster)}" width="1280" height="720" aria-label="Resumo de {escape(p['title'],quote=True)}"><source src="{resource('media/'+media+'-resumo.mp4')}" type="video/mp4"><track kind="subtitles" src="{pt}" srclang="pt-BR" label="Português BR" default><track kind="subtitles" src="{en}" srclang="en" label="English">Seu navegador não reproduz este vídeo. <a href="{p['page']}">Conhecer {escape(p['title'])}</a>.</video><div class="teaser-controls"><button type="button" data-teaser-toggle aria-label="Reproduzir resumo de {escape(p['title'],quote=True)}">▶ Reproduzir resumo</button><label>Legendas <select data-teaser-language aria-label="Idioma das legendas de {escape(p['title'],quote=True)} {context}"><option value="pt-BR">Português BR</option><option value="en">English</option><option value="off">Sem legendas</option></select></label></div></div>'''
def card(p):
 ident=p['anchor']
 featured=p.get('featured',False)
 aliases={'chronos':'chronos-aplicacao','voxtexto':'featured-voxtexto','churn':'featured-churn'}
 alias='<span class="project-route-anchor" id="'+aliases[p['slug']]+'" aria-hidden="true"></span>' if p['slug'] in aliases else ''
 version=p.get('version','')
 label='Windows · Aplicativo' if p['kind']=='app' else 'Power BI · Relatório'
 badge=version if version in ('1.0','V2.0','0.1.0') else ('Local' if p['kind']=='app' else 'Online')
 featured_tag='<span class="project-featured">Destaque</span>' if featured else ''
 html=f'<article class="project-tile" id="{ident}" data-project-card data-category="{p["kind"]}" data-featured="{str(featured).lower()}" style="--project-accent:{p["accent"]}">'+alias+teaser(p,'na listagem')+f'<div class="tile-content"><div class="tile-meta"><span>{label}</span><span>{badge}</span></div><h3>{escape(p["title"])}</h3><p>{escape(p["summary"])}</p><div class="tile-tech">'+featured_tag+''.join('<span>'+escape(t)+'</span>' for t in p['tech'][:4])+f'</div><div class="tile-actions"><a href="{p["page"]}'+ '">VER PROJETO COMPLETO →</a><a href="'+p['manual']+'" target="_blank" rel="noopener noreferrer" aria-label="Abrir manual de '+escape(p['title'],quote=True)+' em nova aba">Manual online ↗</a></div></div></article>'
 if p['slug']=='chronos':
  html='<!-- CHRONOS FEATURED START -->\n'+html+'\n<!-- CHRONOS FEATURED END -->'
 return html

def guides():
 for p in CATALOG:
  if p['slug']=='chronos':continue
  (ROOT/p['manual']).write_text(guide(p),encoding='utf-8')

def improve_apps():
 for p in CATALOG:
  if p['kind']!='app' or p['slug']=='chronos':continue
  path=ROOT/p['page'];text=path.read_text(encoding='utf-8')
  text=re.sub(r'<!-- PROJECT STANDARD (OVERVIEW|DOWNLOAD|MANUAL) START -->.*?<!-- PROJECT STANDARD \1 END -->\s*','',text,flags=re.S)
  text=re.sub(r'<link[^>]+href="assets/project-standard\.css[^" ]*"[^>]*>\s*','',text)
  additions='<link rel="stylesheet" href="'+resource('assets/project-standard.css')+'">'
  meta={'name="author"':'<meta name="author" content="Leandro Augusto Ferreira">',
   'rel="canonical"':'<link rel="canonical" href="'+PUBLIC+p['page']+'">',
   'property="og:title"':'<meta property="og:title" content="'+escape(p['title'],quote=True)+' | Leandro Augusto Ferreira">',
   'property="og:url"':'<meta property="og:url" content="'+PUBLIC+p['page']+'">',
   'property="og:image"':'<meta property="og:image" content="'+PUBLIC+p['image']+'">'}
  for marker,value in meta.items():
   if marker not in text:additions+=value
  text=text.replace('</head>',additions+'</head>',1)
  description=p['summary']+' Aplicativo Windows e manual online.'
  text=re.sub(r'<meta name="description" content="[^"]*"\s*/?>','<meta name="description" content="'+escape(description,quote=True)+'">',text,count=1)
  text=re.sub(r'<meta property="og:description" content="[^"]*"\s*/?>','<meta property="og:description" content="'+escape(description,quote=True)+'">',text,count=1)
  def body(match):
   attrs=match[1]
   if 'portfolio-project' not in attrs:
    if 'class="' in attrs:attrs=attrs.replace('class="','class="portfolio-project ',1)
    else:attrs+=' class="portfolio-project"'
   if 'style="' in attrs:attrs=re.sub(r'style="[^"]*"','style="--project-accent:'+p['accent']+'"',attrs,count=1)
   else:attrs+=' style="--project-accent:'+p['accent']+'"'
   return '<body'+attrs+'>'
  text=re.sub(r'<body([^>]*)>',body,text,count=1)
  text=re.sub(r'<a class="case-skip"[^>]*>.*?</a>','',text,flags=re.S)
  text=re.sub(r'<nav\b[^>]*>.*?</nav>',lambda m:nav(p),text,count=1,flags=re.S)
  text=re.sub(r'<main(?![^>]*\bid=)([^>]*)>',r'<main id="conteudo"\1>',text,count=1)
  header=re.search(r'<header\b[^>]*>.*?</header>',text,flags=re.S)
  assert header,p['page']
  hero=header[0]
  cta='<a class="case-button case-primary" href="'+p['download']+'" '+('target="_blank" rel="noopener noreferrer"' if p['download'].startswith('https:') else 'download')+'>'+p['download_label']+' ↓</a><a class="case-button" href="'+p['manual']+'" target="_blank" rel="noopener noreferrer">Manual online ↗</a>'
  hero,count=re.subn(r'(<div class="(?:tc-actions|atelie-actions|actions)(?: [^"]*)?">).*?(</div>)',lambda m:m[1]+cta+m[2],hero,count=1,flags=re.S)
  assert count==1,p['page']
  if p['slug']=='nexofiscal':hero=re.sub(r'<p class="note">v0\.1\.0.*?</p>','<p class="note">0.1.0 · Demonstração Windows com base fictícia própria. O executável inclui os recursos necessários para abrir o aplicativo.</p>',hero,count=1,flags=re.S)
  text=text[:header.start()]+hero+'\n'+overview(p)+text[header.end():]
  def legacy_section(match):
   block=match[0]
   return '' if re.search(r'class="(?:tc-usage|atelie-usage)"|<h2>Como experimentar',block) else block
  text=re.sub(r'<section\b[^>]*>.*?</section>',legacy_section,text,flags=re.S)
  text=text.replace('</main>',download(p)+'\n'+manual_callout(p)+'\n</main>',1)
  text=re.sub(r'<footer\b[^>]*>.*?</footer>',lambda m:footer(p),text,count=1,flags=re.S)
  if p['slug']=='nexofiscal':
   digest=sha(ROOT/'downloads/NexoFiscal-codigo-fonte.zip')
   text=re.sub(r'(<summary>Integridade do código-fonte</summary>.*?<code>)[a-f0-9]{64}(</code>)',lambda m:m[1]+digest+m[2],text,flags=re.S)
   text=re.sub(r'(downloads/NexoFiscal-(?:codigo-fonte\.zip|manifesto\.json))\?v=[a-f0-9]+',lambda m:resource(m[1]),text)
  path.write_text('\n'.join(line.rstrip() for line in text.splitlines())+'\n',encoding='utf-8')

def dashboard(p):
 media=p['media'];scenes=resource('media/'+media+'-resumo-cenas.json')
 player='<div class="case-video" data-project-player data-project-name="'+escape(p['title'],quote=True)+'" data-scenes="'+scenes+'"><video controls playsinline preload="metadata" poster="'+resource('img/teasers/'+media+'.jpg')+'" width="1280" height="720" aria-label="Resumo do projeto '+escape(p['title'],quote=True)+'"><source src="'+resource('media/'+media+'-resumo.mp4')+'" type="video/mp4"><track kind="subtitles" src="'+resource('media/'+media+'-resumo-pt.vtt')+'" srclang="pt-BR" label="Português BR" default><track kind="subtitles" src="'+resource('media/'+media+'-resumo-en.vtt')+'" srclang="en" label="English">Seu navegador não reproduz este vídeo.</video><div class="case-video-controls"><button type="button" data-video-toggle aria-label="Reproduzir resumo de '+escape(p['title'],quote=True)+'">▶ Reproduzir</button><label>Legendas <select data-caption-language aria-label="Idioma das legendas"><option value="pt-BR">Português BR</option><option value="en">English</option><option value="off">Sem legendas</option></select></label></div></div>'
 gallery=''
 if p['slug']=='churn':
  gallery='<section class="case-section" aria-labelledby="paginas-titulo"><p class="case-eyebrow">PÁGINAS DA ANÁLISE</p><h2 id="paginas-titulo">Do cancelamento aos grupos em risco.</h2><div class="case-report-gallery">'+''.join('<figure><a href="'+resource(image)+'" target="_blank" rel="noopener noreferrer"><img src="'+resource(image)+'" alt="'+caption+'" loading="lazy"></a><figcaption>'+caption+'</figcaption></figure>' for image,caption in [('img/churn-impacto.jpg','Impacto financeiro dos cancelamentos na base demonstrativa.'),('img/churn-risco.jpg','Segmentos e clientes destacados na leitura de risco do relatório.')])+'</div></section>'
 body=head(p,p['title'],p['summary']+' Relatório Power BI e guia online.',p['page'])+f'<body class="portfolio-project dashboard-project" style="--project-accent:{p["accent"]}">'+nav(p)+'<main class="case-shell" id="conteudo"><header class="case-hero"><div><p class="case-eyebrow">DATA & ANALYTICS / POWER BI</p><h1>'+escape(p['title'])+'</h1><p class="case-lead">'+escape(p['tagline'])+'</p><p>'+escape(p['summary'])+'</p><div class="case-actions"><a class="case-button case-primary" href="#relatorio">Explorar dashboard →</a><a class="case-button" href="'+p['manual']+'" target="_blank" rel="noopener noreferrer">Guia de leitura ↗</a></div><div class="case-tags">'+''.join('<span>'+escape(t)+'</span>' for t in p['tech'])+'</div></div><figure><a href="'+resource(p['image'])+'" target="_blank" rel="noopener noreferrer"><img src="'+resource(p['image'])+'" alt="Captura do dashboard de '+escape(p['title'],quote=True)+'" width="1340" height="750"></a><figcaption>Captura do projeto. Clique para ampliar ou explore o relatório interativo abaixo.</figcaption></figure></header>'+overview(p)+'<section class="case-section" id="relatorio" aria-labelledby="relatorio-titulo"><div class="case-report-header"><div><p class="case-eyebrow">EXPERIMENTE NO NAVEGADOR</p><h2 id="relatorio-titulo">Explore os indicadores.</h2><p>Confira as seleções e navegue pelas páginas do Power BI. O guia oferece um roteiro para iniciar a leitura e interpretar os recortes.</p></div><a class="case-button" href="'+escape(p['report_url'],quote=True)+'" target="_blank" rel="noopener noreferrer">Abrir relatório em nova aba ↗</a></div><iframe class="case-report-frame" src="'+escape(p['report_url'],quote=True)+'" title="Relatório interativo de '+escape(p['title'],quote=True)+'" loading="lazy" referrerpolicy="no-referrer" allowfullscreen></iframe><p class="case-report-footnote">A versão interativa depende de internet e da disponibilidade do Power BI. Não é necessário instalar um executável para essa avaliação. Valores e indicadores variam conforme página e filtros.</p></section>'+manual_callout(p)+gallery+'<section class="case-section" id="apresentacao" aria-labelledby="video-titulo"><p class="case-eyebrow">APRESENTAÇÃO RÁPIDA</p><h2 id="video-titulo">Uma visão do projeto em vídeo.</h2>'+player+'</section><section class="case-section" aria-labelledby="leitura-titulo"><p class="case-eyebrow">LEITURA COM CONTEXTO</p><h2 id="leitura-titulo">Da informação à investigação.</h2><p>'+escape(p['evaluate'])+'</p><p>As contribuições descritas são possibilidades de análise. O portfólio não atribui ao projeto ganhos comprovados de uma implantação real. As imagens registram recortes específicos do relatório.</p></section></main>'+footer(p)+'</body></html>'
 body=body.replace('As contribuições descritas são possibilidades de análise. O portfólio não atribui ao projeto ganhos comprovados de uma implantação real. As imagens registram recortes específicos do relatório.','As imagens registram recortes específicos do relatório. A base tabular de origem, o arquivo PBIX e as fórmulas das medidas não constam deste repositório do portfólio. A apresentação permite avaliar a leitura dos indicadores; a reprodução dos cálculos depende desses materiais. Não são atribuídos ganhos comprovados de uma implantação real.')
 (ROOT/p['page']).write_text(body,encoding='utf-8')

def home():
 path=ROOT/'index.html';text=path.read_text(encoding='utf-8')
 text=re.sub(r'<link[^>]+href="assets/(?:project-standard|portfolio-cards)\.css[^" ]*"[^>]*>\s*','',text)
 text=text.replace('</head>','<link rel="stylesheet" href="'+resource('assets/project-standard.css')+'"><link rel="stylesheet" href="'+resource('assets/portfolio-cards.css')+'"></head>',1)
 def body(match):
  attrs=match[1]
  if 'portfolio-standard' not in attrs:
   if 'class="' in attrs:attrs=attrs.replace('class="','class="portfolio-standard ',1)
   else:attrs+=' class="portfolio-standard"'
  return '<body'+attrs+'>'
 text=re.sub(r'<body([^>]*)>',body,text,count=1)
 ordered=CATALOG
 options=[('all','Todos'),('featured','Destaques'),('app','Desenvolvimento & Automação'),('bi','Dados & BI')]
 filters='<fieldset class="method-selector project-filters" disabled><legend class="method-sr-only">Filtrar projetos</legend>'+''.join('<label><input type="radio" name="project-filter" value="'+value+'" aria-controls="project-list"'+(' checked' if value=='all' else '')+'><span>'+escape(label)+'</span></label>' for value,label in options)+'</fieldset>'
 aliases='<span class="project-route-anchor" id="aplicativos" aria-hidden="true"></span><span class="project-route-anchor" id="dashboards" aria-hidden="true"></span>'
 project_block='<section class="section section-divider" id="projetos" data-projects aria-labelledby="projetos-titulo"><div class="container"><p class="section-label">PORTFÓLIO</p><h2 class="section-title" id="projetos-titulo">Projetos</h2><p class="section-description">Explore soluções em desenvolvimento de software, automação de processos, inteligência artificial e análise de dados.</p>'+aliases+filters+'<p class="method-sr-only" role="status" data-project-status></p><div class="portfolio-project-grid" id="project-list">'+''.join(card(p) for p in ordered)+'</div></div></section>'
 found=False
 def section(match):
  nonlocal found
  block=match[0]
  if 'id="projetos"' in block:
   assert not found,'duplicate projects section'
   found=True
   return project_block
  if re.match(r'<section\b[^>]*\bid="(?:aplicativos|dashboards)"',block):return ''
  return block
 text=re.sub(r'<section\b[^>]*>.*?</section>',section,text,flags=re.S)
 assert found,'missing projects section'
 for filename in ('project-filters.css','project-filters.js'):
  text=re.sub(r'<(?:link|script)\b[^>]*(?:href|src)="assets/'+re.escape(filename)+r'[^\"]*"[^>]*>(?:</script>)?', '',text)
 text=text.replace('</head>','<link rel="stylesheet" href="'+resource('assets/project-filters.css')+'"><script src="'+resource('assets/project-filters.js')+'" defer></script></head>',1)
 path.write_text(text,encoding='utf-8')

def linkedin():
 lines=['# Projetos — conteúdo preparado para Destaques no LinkedIn','',
  'Material de apoio. Este arquivo não comprova publicação no perfil. A inclusão e a ausência de duplicatas precisam ser verificadas no LinkedIn.','']
 for p in CATALOG:
  lines+=['## '+p['title'],'','**Título:** '+p['title']+' | '+('Aplicativo Windows' if p['kind']=='app' else 'Dashboard Power BI'),'',
   '**Link:** '+PUBLIC+p['page'],'','**Descrição:** '+p['summary']+' '+p['evaluate']+' Na página, veja a apresentação, '+('experimente a versão Windows' if p['kind']=='app' else 'explore o relatório interativo')+' e leia o guia online.','']
 (ROOT/'docs/linkedin-destaques-padrao.md').write_text('\n'.join(lines),encoding='utf-8')

def refresh_versions():
 paths={'index.html'}|{p['page'] for p in CATALOG if p['slug']!='chronos'}|{p['manual'] for p in CATALOG if p['slug']!='chronos'}
 for name in paths:
  path=ROOT/name;text=path.read_text(encoding='utf-8')
  def version(match):
   target=match[2]
   return match[1]+resource(target)+match[3] if (ROOT/target).is_file() else match[0]
  text=re.sub(r'(["\'])((?:assets|img|media|downloads)/[^"\'?#]+)\?v=[a-f0-9]+(["\'])',version,text)
  path.write_text(text,encoding='utf-8')

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--guides-only',action='store_true');args=parser.parse_args()
 guides()
 if args.guides_only:
  complete_metadata(ROOT,CATALOG)
  return
 improve_apps()
 for p in CATALOG:
  if p['kind']=='bi':dashboard(p)
 home();linkedin();complete_metadata(ROOT,CATALOG);refresh_versions()
 print(json.dumps({'projects':len(CATALOG),'manuals':len(CATALOG),'apps':5,'dashboards':4,'placeholders':0}))

if __name__=='__main__':main()
