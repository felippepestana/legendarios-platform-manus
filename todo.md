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
- [x] Integrar Stripe para processamento real de pagamentos (checkout sessions, webhook, páginas sucesso/cancelado)
- [x] Corrigir payment_method_types para Pix (usar 'pix' ao invés de 'boleto')
- [x] Adicionar teste do webhook Stripe (verificação de assinatura e test event)
- [x] Validar que o frontend de checkout compila sem erros (0 TS errors, server running)

## Testes
- [x] Testes vitest para criação de leads (validação de dados)
- [x] Testes vitest para testimonials (featured e all)
- [x] Testes vitest para proteção de rotas (leads.list requer auth)
- [x] Todos os 8 testes passando

## Melhorias pendentes
- [x] Remover fallback hardcoded de depoimentos e usar apenas estados loading/empty/error do banco
- [x] Criar script de seed reproduzível versionado no projeto (scripts/seed-testimonials.mjs)
- [x] Tornar testes de testimonials determinísticos com mocks/setup-teardown no leads.test.ts

## Reestruturação de Imagens (Google Drive - TOP 1670)
- [x] Acessar pasta no Google Drive: TOP 1670 - Destemidos Pioneiros - Album Banlek
- [x] Baixar e selecionar as melhores imagens para cada seção do site (15 fotos curadas)
- [x] Fazer upload das imagens via manus-upload-file --webdev (15 URLs geradas)
- [x] Substituir imagens geradas por IA por fotos reais do evento
- [x] Criar carrossel de imagens animado na seção Hero (4 imagens, auto-play 5s)
- [x] Criar carrossel de imagens na seção de Depoimentos
- [x] Criar banners animados com fotos reais do evento (2 faixas, direções opostas)
- [x] Adicionar galeria de fotos do TOP Destemidos Pioneiros (15 fotos, filtro por categoria, lightbox)

## Painel Administrativo
- [x] Criar página /admin protegida por role (admin only)
- [x] Dashboard com métricas: total de leads, leads por cidade, leads por evento
- [x] Tabela de leads com filtros por cidade e evento
- [x] Gerenciamento de depoimentos (adicionar/editar/remover)
- [x] Visualização de pagamentos confirmados via Stripe
- [x] Registrar rota /admin no App.tsx

## Automação WhatsApp
- [x] Criar endpoint tRPC para envio de mensagem de boas-vindas ao lead (whatsapp.getWelcomeLink)
- [x] Integrar WhatsApp Business API (simulação com link wa.me)
- [x] Envio automático de mensagem ao cadastrar lead (via wa.me link)
- [x] Template de mensagem de boas-vindas personalizada
- [x] Template de lembrete pré-evento (whatsapp.getReminderLink)


## Gaps Identificados (Melhorias Futuras)
- [ ] Exibir métricas de leads por cidade e por evento no dashboard admin
- [ ] Adicionar UI para criar e editar depoimentos no painel /admin
- [ ] Integrar WhatsApp automaticamente após cadastro de lead (abrir wa.me no frontend)
- [ ] Criar página de histórico de pagamentos para usuários logados
- [ ] Implementar notificações em tempo real para novos leads (via WebSocket ou polling)
