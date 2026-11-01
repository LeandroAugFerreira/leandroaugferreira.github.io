"""Check the static portfolio without installing dependencies or starting apps.

Run: python tools/check_portfolio.py
"""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = 'https://leandroaugferreira.github.io/'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.elements = []
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

def main():
    pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
    errors = []
    references = 0
    def check(condition, message):
        if not condition:
            errors.append(message)
    for name, page in sorted(pages.items()):
        items = page.elements
        ids = [a['id'] for _, a in items if 'id' in a]
        check(not [v for v, n in Counter(ids).items() if n > 1], name+': duplicate IDs')
        check(sum(t == 'h1' for t, _ in items) == 1, name+': exactly one H1 required')
        check(any(t == 'html' and a.get('lang', '').lower() == 'pt-br' for t, a in items), name+': lang')
        check(any(t == 'main' and a.get('id') == 'conteudo' for t, a in items), name+': main target')
        expected = PUBLIC if name == 'index.html' else PUBLIC+name
        check(any(t == 'link' and a.get('rel') == 'canonical' and a.get('href') == expected for t, a in items), name+': canonical')
        for field in ('type', 'title', 'description', 'url', 'image'):
            check(any(t == 'meta' and a.get('property') == 'og:'+field and a.get('content') for t, a in items), name+': missing og:'+field)
        for tag, attrs in items:
            if tag == 'img':
                check('alt' in attrs, name+': missing alt')
                check('width' in attrs and 'height' in attrs, name+': missing image dimensions')
            if tag == 'video':
                check('autoplay' not in attrs, name+': unexpected autoplay')
            if tag == 'iframe':
                check(bool(attrs.get('title')), name+': iframe title')
            if name.endswith('-manual.html'):
                check(tag not in ('object', 'embed', 'iframe'), name+': embedded guide')
            for attr in ('href', 'src', 'poster', 'data-scenes', 'data-image'):
                raw = attrs.get(attr)
                if not raw or raw.startswith(('mailto:', 'tel:', 'data:')):
                    continue
                url = urlsplit(raw)
                if url.netloc and url.netloc != 'leandroaugferreira.github.io':
                    continue
                target = unquote(url.path).lstrip('/') or (name if not url.netloc else 'index.html')
                file = ROOT / target
                references += 1
                check(file.is_file(), name+': missing '+target)
                if url.fragment and target.endswith('.html') and target in pages:
                    check(any(a.get('id') == unquote(url.fragment) for _, a in pages[target].elements), name+': missing anchor '+raw)
    catalog = json.loads((ROOT/'tools/project_catalog.json').read_text(encoding='utf-8'))
    check(len(catalog) == 9, 'nine projects required')
    vox = next(p for p in catalog if p['slug'] == 'voxtexto')
    check(vox['version'] == 'V2.0' and '/V2.0/' in vox['download'], 'VoxTexto current version')
    for p in catalog:
        html = (ROOT/p['page']).read_text(encoding='utf-8')
        check(p['manual'] in html, p['slug']+': manual route')
        if p['kind'] == 'bi':
            check(p['report_url'].replace('&', '&amp;') in html, p['slug']+': original Power BI URL')
    home = (ROOT/'index.html').read_text(encoding='utf-8')
    check(home.count('class="process-card"') == 4, 'methodology must reuse four cards')
    check(len(re.findall(r'name="methodology"', home)) == 2, 'two native methodology options')
    check(home.count('data-method-content="dados"') == 4 and home.count('data-method-content="desenvolvimento"') == 4, 'four steps per methodology')
    check('Novo projeto 02' not in home and 'Novo projeto 03' not in home, 'unexpected placeholders')
    check('class="project-directory"' not in home, 'project count banner must remain removed')
    proof = json.loads((ROOT/'downloads/NexoFiscal-testes-backend.json').read_text(encoding='utf-8'))
    junit = ROOT/'downloads'/proof['junit_sanitized']
    suite = ET.parse(junit).find('testsuite')
    check(len(suite.findall('testcase')) == proof['passed'] == proof['tests'] == 60, 'JUnit test count')
    check(proof['failures'] == proof['errors'] == proof['skipped'] == 0, 'JUnit failures')
    check(hashlib.sha256(junit.read_bytes()).hexdigest() == proof['junit_sanitized_sha256'], 'JUnit integrity')
    urls = [e.text for e in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    check(set(urls) == {PUBLIC if n == 'index.html' else PUBLIC+n for n in pages}, 'sitemap canonical coverage')
    result = {'html_pages': len(pages), 'local_references_checked': references, 'projects': len(catalog), 'errors': errors}
    print(json.dumps(result, ensure_ascii=True, indent=2))
    raise SystemExit(bool(errors))

if __name__ == '__main__':
    main()
