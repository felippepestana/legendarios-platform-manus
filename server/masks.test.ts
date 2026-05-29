import { describe, it, expect } from "vitest";

// Test mask and validation utilities (same logic used in frontend)
// These test the core validation functions that the forms rely on

function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function unmask(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

function isValidCEP(cep: string): boolean {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe("maskCPF", () => {
  it("formats CPF with dots and dash", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });

  it("handles partial input", () => {
    expect(maskCPF("123")).toBe("123");
    expect(maskCPF("1234")).toBe("123.4");
    expect(maskCPF("1234567")).toBe("123.456.7");
  });

  it("strips non-digit characters", () => {
    expect(maskCPF("123.456.789-01")).toBe("123.456.789-01");
  });
});

describe("maskPhone", () => {
  it("formats phone with parentheses and dash", () => {
    expect(maskPhone("69999999999")).toBe("(69) 99999-9999");
  });

  it("handles partial input", () => {
    expect(maskPhone("69")).toBe("(69");
    expect(maskPhone("699")).toBe("(69) 9");
    expect(maskPhone("6999999")).toBe("(69) 99999");
  });

  it("returns empty for empty input", () => {
    expect(maskPhone("")).toBe("");
  });
});

describe("maskCEP", () => {
  it("formats CEP with dash", () => {
    expect(maskCEP("76800000")).toBe("76800-000");
  });

  it("handles partial input", () => {
    expect(maskCEP("768")).toBe("768");
    expect(maskCEP("76800")).toBe("76800");
    expect(maskCEP("768000")).toBe("76800-0");
  });
});

describe("unmask", () => {
  it("removes all non-digit characters", () => {
    expect(unmask("123.456.789-01")).toBe("12345678901");
    expect(unmask("(69) 99999-9999")).toBe("69999999999");
    expect(unmask("76800-000")).toBe("76800000");
  });
});

describe("isValidCPF", () => {
  it("validates correct CPF", () => {
    expect(isValidCPF("52998224725")).toBe(true);
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("rejects invalid CPF", () => {
    expect(isValidCPF("11111111111")).toBe(false);
    expect(isValidCPF("12345678900")).toBe(false);
    expect(isValidCPF("123")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("validates correct phone numbers", () => {
    expect(isValidPhone("69999999999")).toBe(true);
    expect(isValidPhone("6932221111")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

describe("isValidCEP", () => {
  it("validates correct CEP", () => {
    expect(isValidCEP("76800000")).toBe(true);
    expect(isValidCEP("76800-000")).toBe(true);
  });

  it("rejects invalid CEP", () => {
    expect(isValidCEP("7680")).toBe(false);
    expect(isValidCEP("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("validates correct emails", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });
});
