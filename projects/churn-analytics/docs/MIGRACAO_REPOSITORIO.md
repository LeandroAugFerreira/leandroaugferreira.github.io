# Migração para um repositório GitHub independente

**Situação atual:** o código do ChurnLab V2 existe e foi testado em `projects/churn-analytics/` do repositório do portfólio. **Ainda não existe repositório GitHub exclusivo criado por esta automação.** O conector GitHub disponível não oferece a ação de criar repositório.

## O que já está preparado

- O projeto é autocontido: `src/`, `sql/`, `tests/`, `data/`, `metrics.json`, `model_card.json`, `index.html`, `app.mjs`, `metrics.mjs`, `style.css`, `preview.svg`.
- Workflow próprio [`.github/workflows/ci.yml`](../.github/workflows/ci.yml): testes Python/Node e navegador Chromium, independente do workflow do portfólio.
- Pacote portátil `churnlab-v2-standalone.zip` gerado pelo [script](../scripts/package_standalone.py) e anexado ao workflow do portfólio como artifact `churnlab-v2-standalone`.
- Nenhum arquivo histórico, cliente real ou segredo acompanha o pacote.

## Criar o novo repositório (ação do titular)

1. Acesse [GitHub → New repository](https://github.com/new), autenticado, e crie um repositório público **`churnlab-v2`** em `LeandroAugFerreira`, sem gerar README inicial.
2. No [workflow do portfólio](https://github.com/LeandroAugFerreira/leandroaugferreira.github.io/actions/workflows/churnlab.yml), abra uma execução verde na `main`, seção *Artifacts*, e baixe `churnlab-v2-standalone` (ZIP de um ZIP).
3. Extraia primeiro o artifact e depois `churnlab-v2-standalone.zip`; mova os arquivos **internos** da pasta `churnlab-v2` para uma nova pasta local.
4. Abra o terminal nessa nova pasta e execute os comandos abaixo, substituindo a URL se escolher outro nome:
   
   ~~~bash
   git init -b main
   git add .
   git commit -m "feat: ChurnLab V2 sintético e reproduzível"
   git remote add origin https://github.com/LeandroAugFerreira/churnlab-v2.git
   git push -u origin main
   ~~~

   É necessário que a sua conta local tenha autenticação GitHub configurada. **Nunca coloque senha/token em scripts ou arquivos versionados.**
5. Confira a aba **Actions** no novo repositório: Python/Node e Playwright precisam ficar verdes. Se quiser ativar GitHub Pages no novo repositório, selecione `Settings → Pages → Deploy from branch → main / (root)`. O portfólio atual pode continuar hospedando o dashboard do mesmo modo.
6. Atualize então os links do cartão, página individual, arquivos README e docs para o novo endereço. **Não remover a pasta antiga do portfólio antes de confirmar que os links e o Pages continuam funcionando.**

## Alternativa por GitHub CLI

Se o `gh` já estiver instalado e autenticado, após extrair a pasta:

~~~bash
git init -b main
git add .
git commit -m "feat: ChurnLab V2 sintético e reproduzível"
gh repo create LeandroAugFerreira/churnlab-v2 --public --source=. --remote=origin --push
~~~

O comando cria o repositório **na sua conta**; ele não foi executado aqui.

## Testes após a transferência

~~~bash
python -m unittest discover -s tests -v
node --test tests/*.test.mjs
npm install
npx playwright install chromium
npx playwright test
~~~

As dependências npm são **somente de desenvolvimento** para testes de navegador. A aplicação publicada é HTML/JS/CSS estáticos e usa agregados sintéticos. Nada depende de um banco ou backend online.

## Restrições

A mudança de repositório **não** recupera a base ou o PBIX antigos, nem transforma indicadores artificiais em desempenho de negócio. O modelo preditivo continua ilustrativo e não pode fundamentar decisões sobre clientes reais.
