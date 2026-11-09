"""Gera um ZIP portátil do ChurnLab sem dependências ou dados reais.

Execução na raiz do projeto: python scripts/package_standalone.py
Não cria repositórios GitHub, não usa credenciais e não inclui caches.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist" / "churnlab-v2-standalone.zip"
SKIP_DIRS = {".git", "node_modules", "__pycache__", "dist", "test-results", "artifacts", ".venv", ".pytest_cache"}
SKIP_FILES = {".DS_Store"}
INCLUDE_SUFFIXES = {".py", ".sql", ".md", ".mjs", ".css", ".html", ".svg", ".csv", ".json", ".yml", ".gitignore"}

def package():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    included = 0
    with ZipFile(OUTPUT, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for file in sorted(ROOT.rglob("*")):
            if not file.is_file():
                continue
            rel = file.relative_to(ROOT)
            if any(part in SKIP_DIRS for part in rel.parts) or file.name in SKIP_FILES:
                continue
            if file.suffix not in INCLUDE_SUFFIXES and file.name != ".gitignore":
                continue
            archive.write(file, arcname=str(Path("churnlab-v2") / rel))
            included += 1
    if included < 20:
        raise RuntimeError("Pacote suspeitamente incompleto; não disponibilizar.")
    print(f"Pacote portátil: {OUTPUT.name} ({included} arquivos, {OUTPUT.stat().st_size} bytes)")
    return OUTPUT

if __name__ == "__main__":
    package()
