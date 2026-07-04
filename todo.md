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

## Reestruturação Visual - Logo e Paleta de Cores
- [x] Processar logo laranja com fundo transparente e fazer upload como asset
- [x] Substituir logo atual no header por logomarca oficial Legendários (laranja)
- [x] Ajustar paleta de cores: substituir dourado/gold por laranjado (#FF4500)
- [x] Manter fundo preto/escuro e ajustar acentos para laranjado
- [x] Atualizar CTAs (botões) para laranjado
- [x] Ajustar textos de destaque para laranjado ao invés de gold
- [x] Verificar contraste e legibilidade em todas as seções
- [x] VITE_APP_LOGO não é consumida no código do projeto (confirmado via grep); logo aplicada diretamente no navbar e footer via img src

## Atualizações Baseadas na Pesquisa (loslegendarios.org + Instagram + Global)
- [x] Atualizar evento principal de TOP 1670 para TOP 1870 (30/07 a 02/08/2026)
- [x] Atualizar números: 189.000+ membros, 24 países, 110.000+ no Brasil
- [x] Adicionar countdown timer para o TOP 1870
- [x] Adicionar seção de ações humanitárias (MG, Águafrica, Touch Peace)
- [x] Destacar valores AHU (Amor, Honra, Unidade) como pilares
- [x] Usar frases reais do Instagram nos depoimentos e citações
- [x] Adicionar referência ao Manifesto dos 24 Nós
- [x] Atualizar citação inspiradora com frase real do movimento
- [x] Abertura automática do WhatsApp após cadastro de lead
- [x] Atualizar seed de depoimentos com 8 frases reais do Instagram
- [x] Todos os 19 testes passando (4 arquivos de teste)
- [x] Adicionar card do Manifesto dos 24 NÓS na QuoteSection com texto real do Instagram @legendariosglobal

## Sugestões de Acompanhamento (Fase 2)
- [x] Configurar número do WhatsApp como variável de ambiente (VITE_WHATSAPP_NUMBER)
- [x] Criar rota /admin/depoimentos com painel CRUD de depoimentos (listar, aprovar, editar, remover)
- [x] Proteger painel admin com role check (apenas admin)
- [x] Criar galeria temática de Porto Velho/Rondônia com imagens da natureza amazônica (rio, trilhas, cachoeiras)
- [x] Adicionar seção de galeria no Home.tsx entre depoimentos e inscrição
- [x] Testes vitest para CRUD de depoimentos (create, update, delete)
- [x] 28 testes passando (5 arquivos), 0 erros TypeScript

## Documento de Cadastros + Formulário Multi-Step (Fase 3)
- [x] Documento PDF com todos os cadastros existentes e novos da aplicação
- [x] Schema: tabela churches (igrejas com nome, denominação, endereço, pastor)
- [x] Schema: tabela spiritual_leaders (líderes espirituais com título, nome, igreja, contato)
- [x] Schema: tabela registrations (inscrição completa: dados pessoais, médicos, emergência, eclesiásticos)
- [x] Schema: tabela emergency_contacts (contatos de emergência com vínculo e dados completos)
- [x] Schema: tabela whatsapp_messages (mensagens enviadas, status, respostas)
- [x] Formulário multi-step Participante: dados pessoais → médicos → emergência → eclesiásticos → confirmação
- [x] Formulário multi-step Servo: mesmos dados + líder espiritual obrigatório + função no evento
- [x] Seleção/cadastro de igreja no formulário (busca + opção de novo cadastro)
- [x] Seleção/cadastro de líder espiritual (busca + opção de novo cadastro)
- [x] Sistema de envio de mensagem WhatsApp (Cloud API Meta / seguro)
- [x] Dashboard de controle de respostas WhatsApp (enviadas, lidas, respondidas)
- [x] Mensagem editável com variáveis dinâmicas ({nome}, {evento}, {data})
- [x] Lógica de disparo: participante→mãe/responsável; servo→mãe+líder espiritual
- [x] Testes automatizados para novos endpoints (49 testes, 6 arquivos)
- [x] Admin /admin/inscricoes para gerenciar inscrições
- [x] Admin /admin/whatsapp para dashboard de mensagens
- [x] Webhook WhatsApp registrado no Express (/api/whatsapp/webhook)
- [x] Disparo automático de mensagens após inscrição (participante→familiar, servo→familiar+líder)
- [x] 49 testes passando (6 arquivos), 0 erros TypeScript

## Correção de Links de Inscrição (Fase 3.1)
- [x] Links na landing page atualizados: botões 'Quero Participar', 'Inscreva-se' e hero apontam para /inscricao/participante
- [x] Botões 'Quero Participar' e 'Quero Servir' adicionados na seção de inscrição
- [x] Menu de navegação 'Inscreva-se' redireciona para /inscricao/participante

## Melhorias de UX e Admin (Fase 4)
- [x] Painel admin /admin/leads com listagem paginada, filtros por status e cidade
- [x] Exportação CSV dos leads (download direto pelo admin)
- [x] Máscaras de input: CPF (000.000.000-00), telefone ((69) 99999-9999), CEP (76800-000)
- [x] Validação em tempo real nos campos obrigatórios com feedback visual (borda vermelha + mensagem)
- [x] Transições animadas página a página nos formulários multi-step (slide/fade)
- [x] Indicador de progresso visual atualizado dinamicamente
- [x] Testes automatizados para exportação CSV, filtros, status e validações de máscaras (74 testes, 7 arquivos)

## Integrações e Dashboard (Fase 5)
- [x] Criar tabela app_settings no banco para armazenar configurações dinâmicas
- [x] Painel admin /admin/configuracoes com campos editáveis para WhatsApp (Phone Number ID, Access Token, Verify Token)
- [x] Painel configurável para outras settings (nome do evento, datas, mensagens padrão)
- [x] Backend lê credenciais WhatsApp do banco ao invés de env vars fixas
- [x] Integrar API ViaCEP para preenchimento automático de endereço ao digitar CEP
- [x] Hook useCepLookup com loading state e tratamento de erros
- [x] Aplicar busca de CEP nos formulários de Participante e Servo
- [x] Dashboard /admin/metricas com gráficos de conversão (leads → inscritos → confirmados)
- [x] Distribuição por cidade e evolução temporal dos cadastros
- [x] Cards de KPIs (total leads, total inscritos, taxa de conversão, mensagens enviadas)
- [x] 74 testes passando (7 arquivos), 0 erros TypeScript

## Sistema de Check-in com QR Code (Fase 6) - CONCLUÍDO
- [x] Schema: tabela checkins (registration_id, qr_code_token, checked_in_at, checked_in_by)
- [x] Instalar dependências: qrcode (geração) e html5-qrcode (leitor de câmera)
- [x] Endpoint tRPC: gerar token único e QR Code na confirmação da inscrição
- [x] Endpoint tRPC: validar QR Code e registrar check-in
- [x] Endpoint tRPC: listar check-ins em tempo real (admin)
- [x] Página de confirmação com QR Code exibido e opção de download/compartilhar
- [x] Página /checkin/validar com leitor de câmera para escanear QR Code no evento
- [x] Feedback visual na validação (sucesso com dados do participante, erro se já usado/inválido)
- [x] Painel admin /admin/checkin com controle de presença em tempo real (total, presentes, ausentes)
- [x] Testes automatizados para geração e validação de QR Code (93 testes, 8 arquivos)
