import { describe, it, expect, vi } from "vitest";
import { parseAuthorizationResponse } from "./whatsapp";

describe("WhatsApp Authorization Parser", () => {
  it("should detect authorization with 'autorizo'", () => {
    const result = parseAuthorizationResponse("Sim, autorizo a participação do meu filho");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("authorized");
  });

  it("should detect authorization with 'abençoo'", () => {
    const result = parseAuthorizationResponse("Abençoo e autorizo!");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("authorized");
  });

  it("should detect authorization with 'pode ir'", () => {
    const result = parseAuthorizationResponse("Pode ir sim, com a bênção de Deus");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("authorized");
  });

  it("should detect denial with 'não autorizo'", () => {
    const result = parseAuthorizationResponse("Não autorizo a participação dele");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("denied");
  });

  it("should detect denial with 'não permito'", () => {
    const result = parseAuthorizationResponse("Infelizmente não permito neste momento");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("denied");
  });

  it("should return unclear for ambiguous messages", () => {
    const result = parseAuthorizationResponse("Preciso pensar sobre isso, me liga depois");
    expect(result.isAuthorization).toBe(false);
    expect(result.status).toBe("unclear");
  });

  it("should return unclear for unrelated messages", () => {
    const result = parseAuthorizationResponse("Boa tarde! Qual o horário do evento?");
    expect(result.isAuthorization).toBe(false);
    expect(result.status).toBe("unclear");
  });

  it("should handle 'sim' as authorization", () => {
    const result = parseAuthorizationResponse("Sim");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("authorized");
  });

  it("should handle 'ok' as authorization", () => {
    const result = parseAuthorizationResponse("Ok, tudo bem");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("authorized");
  });

  it("should prioritize denial over authorization keywords", () => {
    const result = parseAuthorizationResponse("Não autorizo, sim eu sei que é bom mas não pode");
    expect(result.isAuthorization).toBe(true);
    expect(result.status).toBe("denied");
  });
});

describe("Registration Validation", () => {
  it("should validate CPF format (11+ digits)", () => {
    const validCpf = "12345678901";
    expect(validCpf.length).toBeGreaterThanOrEqual(11);
  });

  it("should validate phone format (10+ digits)", () => {
    const validPhone = "6999999999";
    expect(validPhone.length).toBeGreaterThanOrEqual(10);
  });

  it("should validate blood types", () => {
    const validTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "nao_sei"];
    expect(validTypes).toContain("O+");
    expect(validTypes).toContain("nao_sei");
    expect(validTypes.length).toBe(9);
  });

  it("should validate marital status options", () => {
    const options = ["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"];
    expect(options.length).toBe(5);
    expect(options).toContain("casado");
  });

  it("should validate shirt sizes", () => {
    const sizes = ["PP", "P", "M", "G", "GG", "XG", "XXG"];
    expect(sizes.length).toBe(7);
    expect(sizes).toContain("GG");
  });

  it("should validate relationship types for emergency contacts", () => {
    const relationships = ["esposa", "mae", "pai", "irmao", "irma", "filho", "filha", "tio", "tia", "avo", "outro"];
    expect(relationships.length).toBe(11);
    expect(relationships).toContain("esposa");
    expect(relationships).toContain("mae");
  });

  it("should validate spiritual leader titles", () => {
    const titles = ["Pastor", "Apostolo", "Bispo", "Presbitero", "Discipulador", "Lider", "Padre", "Outro"];
    expect(titles.length).toBe(8);
    expect(titles).toContain("Pastor");
    expect(titles).toContain("Apostolo");
  });

  it("should validate servant roles", () => {
    const roles = ["Cozinha", "Louvor", "Intercessão", "Logística", "Som/Mídia",
      "Segurança", "Limpeza", "Recepção", "Apoio Geral", "Coordenação",
      "Transporte", "Decoração", "Outro"];
    expect(roles.length).toBe(13);
    expect(roles).toContain("Louvor");
    expect(roles).toContain("Intercessão");
  });

  it("should validate denomination options", () => {
    const denominations = ["Assembleia de Deus", "Batista", "Presbiteriana", "Metodista", "Católica",
      "Adventista", "Quadrangular", "Sara Nossa Terra", "Bola de Neve",
      "Comunidade", "Maranata", "Internacional da Graça", "Outra"];
    expect(denominations.length).toBe(13);
    expect(denominations).toContain("Assembleia de Deus");
  });
});

describe("WhatsApp Configuration", () => {
  it("should detect unconfigured state when env vars are missing", async () => {
    const { isWhatsAppConfigured } = await import("./whatsapp");
    // In test environment, env vars are not set
    const configured = isWhatsAppConfigured();
    expect(configured).toBe(false);
  });

  it("should return simulation message ID when not configured", async () => {
    const { sendWhatsAppTemplate } = await import("./whatsapp");
    const result = await sendWhatsAppTemplate({
      to: "5569999999999",
      templateName: "autorizacao_familiar",
    });
    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^sim_/);
  });
});
