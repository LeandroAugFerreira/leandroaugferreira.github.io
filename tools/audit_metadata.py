"""Nonvisual metadata and accessibility fixes; no external dependencies."""
from pathlib import Path
from html import escape, unescape
import hashlib
import re
import struct

PUBLIC = 'https://leandroaugferreira.github.io/'

def size(path):
    """Read existing PNG/JPEG intrinsic dimensions without rewriting the image."""
    data = path.read_bytes()
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return struct.unpack('>II', data[16:24])
    if data.startswith(b'\xff\xd8'):
        pos = 2
        while pos < len(data):
            if data[pos] != 255:
                pos += 1
                continue
            while data[pos] == 255:
                pos += 1
            marker = data[pos]
            pos += 1
            if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
                continue
            length = int.from_bytes(data[pos:pos+2], 'big')
            if marker in (0xC0, 0xC1, 0xC2):
                height, width = struct.unpack('>HH', data[pos+3:pos+7])
                return width, height
            pos += length
    return None

def complete(root, catalog):
    projects = {p['page']: p for p in catalog} | {p['manual']: p for p in catalog}
    css = root / 'assets/portfolio-a11y.css'
    css_hash = hashlib.sha256(css.read_bytes().replace(b'\r\n', b'\n')).hexdigest()[:12]
    for path in sorted(root.glob('*.html')):
        text = path.read_text(encoding='utf-8')
        title = unescape(re.search(r'<title>(.*?)</title>', text, re.S)[1].strip())
        description = unescape(re.search(r'<meta\s+name="description"\s+content="([^"]*)"', text)[1])
        canonical = PUBLIC if path.name == 'index.html' else PUBLIC + path.name
        image = projects.get(path.name, {}).get('image', 'img/foto.png')
        additions = ''
        tags = {
            'name="author"': '<meta name="author" content="Leandro Augusto Ferreira">',
            'rel="canonical"': '<link rel="canonical" href="'+canonical+'">',
            'property="og:type"': '<meta property="og:type" content="website">',
            'property="og:title"': '<meta property="og:title" content="'+escape(title, quote=True)+'">',
            'property="og:description"': '<meta property="og:description" content="'+escape(description, quote=True)+'">',
            'property="og:url"': '<meta property="og:url" content="'+canonical+'">',
            'property="og:image"': '<meta property="og:image" content="'+PUBLIC+image+'">',
            'name="twitter:card"': '<meta name="twitter:card" content="summary_large_image">'
        }
        for marker, tag in tags.items():
            if marker not in text:
                additions += tag
        text = re.sub(r'<link[^>]+href="assets/portfolio-a11y\.css[^\"]*"[^>]*>', '', text)
        additions += '<link rel="stylesheet" href="assets/portfolio-a11y.css?v='+css_hash+'">'
        text = text.replace('</head>', additions+'</head>', 1)
        if path.name == 'index.html':
            if 'class="portfolio-skip"' not in text:
                text = re.sub(r'(<body[^>]*>)', r'\1<a class="portfolio-skip" href="#conteudo">Pular para o conteúdo</a>', text, count=1)
            if '<main>' in text:
                text = text.replace('<main>', '<main id="conteudo" tabindex="-1">', 1)
            if 'href="https://github.com/LeandroAugFerreira"' not in text:
                text = re.sub(r'(<div class="contact-actions">)(.*?)(</div>)', lambda m: m[1]+m[2]+'<a href="https://github.com/LeandroAugFerreira" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">GitHub →</a>\n'+m[3], text, count=1, flags=re.S)
            for name in ('methodology.css', 'methodology.js'):
                digest = hashlib.sha256((root/'assets'/name).read_bytes().replace(b'\r\n', b'\n')).hexdigest()[:12]
                text = re.sub(r'assets/'+re.escape(name)+r'(?:\?v=[a-f0-9]+)?', 'assets/'+name+'?v='+digest, text)
        text = re.sub(r'<main\b([^>]*\bid="conteudo"[^>]*)>', lambda m: m[0] if 'tabindex=' in m[1] else '<main'+m[1]+' tabindex="-1">', text, count=1)
        def image_dimensions(match):
            tag = match[0]
            if re.search(r'\bwidth=', tag) and re.search(r'\bheight=', tag):
                return tag
            source = re.search(r'\bsrc="([^"]+)"', tag)
            file = root / source[1].split('?')[0] if source else None
            dimensions = size(file) if file and file.is_file() else None
            if dimensions:
                for key, value in zip(('width', 'height'), dimensions):
                    if not re.search(r'\b'+key+'=', tag):
                        tag = tag[:-1]+' '+key+'="'+str(value)+'">'
                tag = tag[:-1]+' data-intrinsic-size>'
            return tag
        text = re.sub(r'<img\b[^>]*>', image_dimensions, text)
        path.write_text(text, encoding='utf-8')
    urls = [PUBLIC] + [PUBLIC+p.name for p in sorted(root.glob('*.html')) if p.name != 'index.html']
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += '\n'.join('  <url><loc>'+escape(url)+'</loc></url>' for url in urls)
    (root/'sitemap.xml').write_text(sitemap+'\n</urlset>\n', encoding='utf-8')
    (root/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+PUBLIC+'sitemap.xml\n', encoding='utf-8')
