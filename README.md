# Site Ronycar Automóveis

Vitrine de veículos + painel de gestão da **Ronycar Automóveis** (Várzea Grande/MT).
Site estático (HTML/CSS/JS puro, sem build) + Supabase (login, banco e fotos).

- **Vitrine pública:** `index.html` (busca + grade) e `veiculo.html?id=…` (anúncio com carrossel).
- **Painel da loja:** `admin.html` (login + cadastro/edição de veículos).

---

## Caminhos (passo a passo)

### 1. Criar o projeto no Supabase
1. Crie um projeto em <https://supabase.com>.
2. Abra **SQL Editor** → cole e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
   Isso cria as tabelas `veiculos` e `veiculo_fotos`, as políticas de RLS e o bucket público `fotos`.
3. Em **Authentication → Users → Add user**, crie **a conta única da loja**
   (um e-mail e uma senha). É com ela que a loja vai entrar no painel.
4. Em **Project Settings → API**, copie **Project URL** e a chave **anon public**.

### 2. Configurar as chaves
Abra [`assets/js/config.js`](assets/js/config.js) e substitua:

```js
export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'; // Project URL
export const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';          // chave anon public
```

> A chave **anon** é pública por design — pode ir no código. Ela só permite o que as
> políticas de RLS deixam (ler tudo; escrever só logado). **Nunca** coloque a
> `service_role` aqui.

### 3. Rodar os testes
```bash
npm test      # ou: node --test
```

### 4. Testar localmente
Qualquer servidor estático serve (precisa ser via http, não abrir o arquivo direto):
```bash
python -m http.server 8080
# abra http://localhost:8080
```

### 5. Publicar no GitHub Pages
1. Crie um repositório no GitHub e envie o conteúdo da pasta `Site Rony/`:
   ```bash
   git init && git add . && git commit -m "site ronycar"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch **main**, pasta **/ (root)**, salve.
3. O arquivo `.nojekyll` (já incluso) impede o GitHub de ignorar a pasta `assets/`.
4. Em ~1 min o site fica no ar em `https://SEU-USUARIO.github.io/SEU-REPO/`.

### 6. Domínio próprio (opcional, depois)
Em **Settings → Pages → Custom domain**, informe o domínio (ex.: `ronycar.com.br`)
e configure o DNS no registrador (CNAME para `SEU-USUARIO.github.io`). O GitHub emite o HTTPS.

---

## Como a loja usa o painel
1. Acesse `…/admin.html` e entre com o e-mail e senha criados no passo 1.3.
2. **+ Adicionar veículo** → suba as fotos (pode várias; a 1ª é a capa, dá pra reordenar
   e remover), preencha os campos e **Salvar e publicar**. Aparece na hora na vitrine.
3. Na lista: **Editar**, **Vendido/Disponível** (vendido some da vitrine) e **Remover**.

## Estrutura
```
index.html          vitrine (busca + grade)
veiculo.html        anúncio (carrossel + specs + WhatsApp)
admin.html          painel (login + gestão)
assets/css/         estilos
assets/js/          módulos: config, supabase, data, filters, format,
                    whatsapp, photos, carousel, render, vitrine, anuncio,
                    auth, admin
supabase/schema.sql tabelas + RLS + bucket
tests/              testes unitários (node:test)
```

## Decisões de implementação
- Vendidos **somem** da vitrine (continuam no painel).
- Faixas de preço: até 50k · 50–100k · 100–200k · acima de 200k.
- Filtro "Motorização" = busca por texto.
- Fotos comprimidas no cliente (máx. 1600px, JPEG) antes do upload.
- Vitrine ordenada por mais recentes primeiro.
- WhatsApp: `5565999767262`, mensagem já montada com o nome do veículo.
