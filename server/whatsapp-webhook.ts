/**
 * WhatsApp Webhook Handler
 * 
 * Recebe notificações da API Cloud do WhatsApp:
 * - Status de entrega das mensagens (sent, delivered, read)
 * - Respostas dos contatos (texto, áudio, imagem)
 * 
 * Deve ser registrado como middleware Express ANTES do body parser JSON
 * para manter o raw body disponível para verificação de assinatura.
 */

import { Request, Response, Router } from "express";
import { getDb } from "./db";
import { whatsappMessages } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { parseAuthorizationResponse } from "./whatsapp";

export const whatsappWebhookRouter = Router();

/**
 * GET /api/whatsapp/webhook - Verificação do webhook pela Meta
 */
whatsappWebhookRouter.get("/webhook", (req: Request, res: Response) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "legendarios_verify_token";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp Webhook] Verificação bem-sucedida");
    res.status(200).send(challenge);
  } else {
    console.warn("[WhatsApp Webhook] Verificação falhou");
    res.sendStatus(403);
  }
});

/**
 * POST /api/whatsapp/webhook - Recebe eventos do WhatsApp
 */
whatsappWebhookRouter.post("/webhook", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Acknowledge immediately
    res.sendStatus(200);

    // Process webhook entries
    if (body.object !== "whatsapp_business_account") return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;

        // Process message status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await handleStatusUpdate(status);
          }
        }

        // Process incoming messages (responses)
        if (value.messages) {
          for (const message of value.messages) {
            await handleIncomingMessage(message, value.contacts?.[0]);
          }
        }
      }
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao processar:", error);
  }
});

/**
 * Atualiza o status de entrega da mensagem
 */
async function handleStatusUpdate(status: any) {
  const db = await getDb();
  if (!db) return;

  const statusMap: Record<string, string> = {
    sent: "sent",
    delivered: "delivered",
    read: "read",
    failed: "failed",
  };

  const newStatus = statusMap[status.status];
  if (!newStatus) return;

  try {
    // Note: Em produção, adicionar campo externalMessageId ao schema
    // para rastrear o ID externo da Meta e atualizar por ele.
    // Por enquanto, apenas log do status update.
    console.log(`[WhatsApp Webhook] Status update para ID externo: ${status.id} → ${newStatus}`);
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao atualizar status:", error);
  }
}

/**
 * Processa mensagem recebida (resposta do contato)
 */
async function handleIncomingMessage(message: any, contact: any) {
  const db = await getDb();
  if (!db) return;

  const senderPhone = message.from;
  let responseContent = "";
  let responseType = "text";

  switch (message.type) {
    case "text":
      responseContent = message.text?.body || "";
      responseType = "text";
      break;
    case "audio":
      responseContent = `[Áudio recebido - ID: ${message.audio?.id}]`;
      responseType = "audio";
      break;
    case "image":
      responseContent = `[Imagem recebida - ID: ${message.image?.id}]`;
      responseType = "image";
      break;
    case "video":
      responseContent = `[Vídeo recebido - ID: ${message.video?.id}]`;
      responseType = "video";
      break;
    case "document":
      responseContent = `[Documento recebido - ID: ${message.document?.id}]`;
      responseType = "document";
      break;
    default:
      responseContent = `[Mensagem do tipo ${message.type} recebida]`;
      responseType = message.type;
  }

  // Find the message by sender phone
  try {
    const [existingMsg] = await db.select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.recipientWhatsapp, senderPhone))
      .limit(1);

    if (existingMsg) {
      // Parse authorization if text
      let authStatus: "pending" | "authorized" | "denied" = "pending";
      if (message.type === "text") {
        const parsed = parseAuthorizationResponse(responseContent);
        if (parsed.isAuthorization) {
          authStatus = parsed.status === "authorized" ? "authorized" : "denied";
        }
      } else if (message.type === "audio") {
        // Áudio precisa de transcrição manual - marca como respondido
        authStatus = "pending"; // Admin precisa ouvir e marcar manualmente
      }

      await db.update(whatsappMessages)
        .set({
          status: "responded",
          responseContent,
          responseType: responseType as "text" | "audio" | "image" | "video" | "document",
          respondedAt: new Date(),
          authorizationStatus: authStatus,
        })
        .where(eq(whatsappMessages.id, existingMsg.id));

      console.log(`[WhatsApp Webhook] Resposta recebida de ${senderPhone}: ${responseType} - Auth: ${authStatus}`);
    } else {
      console.log(`[WhatsApp Webhook] Mensagem de ${senderPhone} não encontrada no banco`);
    }
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao processar resposta:", error);
  }
}
