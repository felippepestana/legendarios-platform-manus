# Tarefas de Atualização do Site Legendários

## Sugestão 1: Upgrade Full-Stack
- [x] Executar webdev_add_feature para web-db-user
- [x] Criar schema de banco para leads (nome, email, whatsapp, cidade, data)
- [x] Criar mutation tRPC leads.create para salvar inscrições via /api/trpc
- [x] Conectar formulário do frontend ao mutation tRPC
- [x] Adicionar feedback visual de sucesso/erro no formulário (toast + loading state)
- [x] Criar schema de banco para testimonials (depoimentos)
- [x] Criar endpoints tRPC para testimonials (featured, all, create)
- [x] Seed de 6 depoimentos iniciais no banco de dados
- [x] Notificação ao owner quando novo lead é criado (com fallback silencioso)

## Sugestão 2: Seção de Depoimentos + Renomear TOP
- [x] Renomear referências principais do evento destaque para TOP Destemidos Pioneiros
- [x] Criar seção de depoimentos com carousel animado e grid de cards
- [x] Depoimentos carregados do banco via tRPC com fallback visual para loading/empty
- [x] Adicionar animações de entrada na seção de depoimentos

## Sugestão 3: Seção de Preços e Checkout
- [x] Criar seção de preços com opções Pix (R$1.790) e Cartão (10x R$199)
- [x] Design de cards de preço com badges e CTAs direcionando ao formulário
- [ ] Integrar Stripe para processamento real de pagamentos (requer chave Stripe do usuário)

## Testes
- [x] Testes vitest para criação de leads (validação de dados)
- [x] Testes vitest para testimonials (featured e all)
- [x] Testes vitest para proteção de rotas (leads.list requer auth)
- [x] Todos os 8 testes passando

## Melhorias pendentes
- [x] Remover fallback hardcoded de depoimentos e usar apenas estados loading/empty/error do banco
- [x] Criar script de seed reproduzível versionado no projeto (scripts/seed-testimonials.mjs)
- [ ] Tornar testes de testimonials determinísticos com setup/teardown
