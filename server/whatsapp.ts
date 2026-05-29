/**
 * WhatsApp Business Cloud API Integration
 * 
 * Utiliza a API oficial da Meta (WhatsApp Cloud API) para envio de mensagens
 * template em massa. Esta abordagem é segura e não apresenta risco de banimento
 * pois utiliza templates pré-aprovados pela Meta.
 * 
 * Fluxo:
 * 1. Admin dispara mensagem de autorização para contatos de emergência
 * 2. Mensagem template é enviada via Cloud API
 * 3. Webhook recebe respostas (texto, áudio, etc.)
 * 4. Dashboard exibe status de cada mensagem
 * 
 * Requisitos:
 * - WHATSAPP_PHONE_NUMBER_ID: ID do número no Meta Business
 * - WHATSAPP_ACCESS_TOKEN: Token de acesso da API
 * - WHATSAPP_VERIFY_TOKEN: Token de verificação do webhook
 * 
 * Nota: Enquanto as credenciais não forem configuradas, o sistema opera em modo
 * "simulação" registrando as mensagens no banco sem envio real.
 */

import { ENV } from "./_core/env";

const WHATSAPP_API_URL = "https://graph.facebook.com/v20.0";

interface SendTemplateParams {
  to: string; // Número com código do país (ex: 5569999999999)
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: "body" | "header";
    parameters: Array<{
      type: "text";
      text: string;
    }>;
  }>;
}

interface SendTextParams {
  to: string;
  text: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Verifica se as credenciais do WhatsApp estão configuradas
 */
export function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_ACCESS_TOKEN
  );
}

/**
 * Envia mensagem template via WhatsApp Cloud API
 * Templates devem ser pré-aprovados no Meta Business Manager
 */
export async function sendWhatsAppTemplate(params: SendTemplateParams): Promise<WhatsAppResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp] Credenciais não configuradas. Mensagem registrada em modo simulação.");
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.to,
          type: "template",
          template: {
            name: params.templateName,
            language: { code: params.languageCode || "pt_BR" },
            components: params.components || [],
          },
        }),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      console.error("[WhatsApp] Erro ao enviar template:", data);
      return { success: false, error: data.error?.message || "Erro desconhecido" };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id || `wa_${Date.now()}`,
    };
  } catch (error: any) {
    console.error("[WhatsApp] Erro de conexão:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envia mensagem de texto simples via WhatsApp Cloud API
 */
export async function sendWhatsAppText(params: SendTextParams): Promise<WhatsAppResponse> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn("[WhatsApp] Credenciais não configuradas. Mensagem registrada em modo simulação.");
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.to,
          type: "text",
          text: { body: params.text },
        }),
      }
    );

    const data = await response.json() as any;

    if (!response.ok) {
      return { success: false, error: data.error?.message || "Erro desconhecido" };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id || `wa_${Date.now()}`,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Envia mensagem de autorização para familiar do participante/servo
 */
export async function sendAuthorizationMessage(params: {
  contactName: string;
  contactWhatsapp: string;
  participantName: string;
  eventName: string;
  relationship: string;
  type: "familiar" | "lider_espiritual";
  customMessage?: string;
}): Promise<WhatsAppResponse> {
  const defaultMessages = {
    familiar: `Olá ${params.contactName}! 🙏\n\nSomos da equipe do *${params.eventName}* (Movimento Los Legendarios).\n\n${params.participantName} se inscreveu para participar do nosso próximo encontro e indicou você como ${params.relationship}.\n\nPrecisamos da sua *autorização e bênção* para a participação dele(a). Por favor, responda esta mensagem com:\n\n✅ "AUTORIZO a participação de ${params.participantName}"\n\nOu grave um áudio nos abençoando com sua autorização.\n\nQualquer dúvida, estamos à disposição!\n\n_Equipe TOP Destemidos Pioneiros_\n_Porto Velho/RO_`,
    lider_espiritual: `Paz do Senhor! 🙏\n\nSomos da equipe do *${params.eventName}* (Movimento Los Legendarios).\n\n${params.participantName}, membro da sua comunidade, se inscreveu para *servir* no nosso próximo encontro e indicou você como seu líder espiritual.\n\nPrecisamos da sua *autorização e cobertura espiritual* para a participação dele(a) como servo(a). Por favor, responda esta mensagem com:\n\n✅ "AUTORIZO e abençoo a participação de ${params.participantName} como servo(a)"\n\nOu grave um áudio com sua bênção e autorização.\n\nQualquer dúvida, estamos à disposição!\n\n_Equipe TOP Destemidos Pioneiros_\n_Porto Velho/RO_`,
  };

  const message = params.customMessage || defaultMessages[params.type];

  // Se WhatsApp API estiver configurada, envia via template
  // Caso contrário, envia como texto simples (modo simulação)
  if (isWhatsAppConfigured()) {
    // Em produção, usar template pré-aprovado
    return sendWhatsAppTemplate({
      to: params.contactWhatsapp.replace(/\D/g, ""),
      templateName: params.type === "familiar" ? "autorizacao_familiar" : "autorizacao_lider",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: params.contactName },
            { type: "text", text: params.participantName },
            { type: "text", text: params.eventName },
          ],
        },
      ],
    });
  }

  // Modo simulação - registra sem enviar
  return sendWhatsAppText({
    to: params.contactWhatsapp.replace(/\D/g, ""),
    text: message,
  });
}

/**
 * Processa webhook de resposta do WhatsApp
 * Identifica se a resposta contém autorização
 */
export function parseAuthorizationResponse(messageBody: string): {
  isAuthorization: boolean;
  status: "authorized" | "denied" | "unclear";
} {
  const lowerBody = messageBody.toLowerCase();

  const authorizationKeywords = ["autorizo", "autorizado", "abençoo", "abenço", "pode ir", "permito", "sim", "ok"];
  const denialKeywords = ["não autorizo", "nao autorizo", "não permito", "nao permito", "não pode", "nao pode"];

  // Check denial first (more specific)
  if (denialKeywords.some(k => lowerBody.includes(k))) {
    return { isAuthorization: true, status: "denied" };
  }

  if (authorizationKeywords.some(k => lowerBody.includes(k))) {
    return { isAuthorization: true, status: "authorized" };
  }

  return { isAuthorization: false, status: "unclear" };
}
