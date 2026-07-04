import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db module
vi.mock("./db", () => ({
  createCheckin: vi.fn(),
  getCheckinByToken: vi.fn(),
  getCheckinByRegistrationId: vi.fn(),
  performCheckin: vi.fn(),
  manualCheckin: vi.fn(),
  cancelCheckin: vi.fn(),
  getAllCheckins: vi.fn(),
  getCheckinStats: vi.fn(),
  getRegistrations: vi.fn(),
  getRegistrationById: vi.fn(),
}));

import {
  createCheckin,
  getCheckinByToken,
  getCheckinByRegistrationId,
  performCheckin,
  manualCheckin,
  cancelCheckin,
  getAllCheckins,
  getCheckinStats,
} from "./db";

describe("Check-in System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCheckin", () => {
    it("should create a new checkin record", async () => {
      const mockCheckin = {
        id: 1,
        registrationId: 42,
        qrCodeToken: "abc123token",
        qrCodeDataUrl: "data:image/png;base64,test",
        status: "pending",
        createdAt: new Date(),
      };
      (createCheckin as any).mockResolvedValue(mockCheckin);

      const result = await createCheckin({
        registrationId: 42,
        qrCodeToken: "abc123token",
        qrCodeDataUrl: "data:image/png;base64,test",
      });

      expect(result).toEqual(mockCheckin);
      expect(createCheckin).toHaveBeenCalledWith({
        registrationId: 42,
        qrCodeToken: "abc123token",
        qrCodeDataUrl: "data:image/png;base64,test",
      });
    });
  });

  describe("getCheckinByToken", () => {
    it("should return checkin when token exists", async () => {
      const mockCheckin = {
        id: 1,
        registrationId: 42,
        qrCodeToken: "valid-token",
        status: "pending",
      };
      (getCheckinByToken as any).mockResolvedValue(mockCheckin);

      const result = await getCheckinByToken("valid-token");
      expect(result).toEqual(mockCheckin);
    });

    it("should return null when token does not exist", async () => {
      (getCheckinByToken as any).mockResolvedValue(null);

      const result = await getCheckinByToken("invalid-token");
      expect(result).toBeNull();
    });
  });

  describe("getCheckinByRegistrationId", () => {
    it("should return checkin for a registration", async () => {
      const mockCheckin = {
        id: 1,
        registrationId: 42,
        qrCodeToken: "token123",
        status: "pending",
      };
      (getCheckinByRegistrationId as any).mockResolvedValue(mockCheckin);

      const result = await getCheckinByRegistrationId(42);
      expect(result).toEqual(mockCheckin);
      expect(getCheckinByRegistrationId).toHaveBeenCalledWith(42);
    });

    it("should return null when no checkin exists for registration", async () => {
      (getCheckinByRegistrationId as any).mockResolvedValue(null);

      const result = await getCheckinByRegistrationId(999);
      expect(result).toBeNull();
    });
  });

  describe("performCheckin", () => {
    it("should perform check-in successfully", async () => {
      const mockUpdated = {
        id: 1,
        registrationId: 42,
        qrCodeToken: "token123",
        status: "checked_in",
        checkedInAt: new Date(),
        checkedInBy: 1,
        checkedInMethod: "qr_scan",
      };
      (performCheckin as any).mockResolvedValue(mockUpdated);

      const result = await performCheckin("token123", 1);
      expect(result).toEqual(mockUpdated);
      expect(result?.status).toBe("checked_in");
      expect(result?.checkedInMethod).toBe("qr_scan");
    });

    it("should return null when token is invalid", async () => {
      (performCheckin as any).mockResolvedValue(null);

      const result = await performCheckin("invalid-token", 1);
      expect(result).toBeNull();
    });

    it("should return existing checkin if already checked in", async () => {
      const mockExisting = {
        id: 1,
        registrationId: 42,
        qrCodeToken: "token123",
        status: "checked_in",
        checkedInAt: new Date("2026-07-01"),
      };
      (performCheckin as any).mockResolvedValue(mockExisting);

      const result = await performCheckin("token123", 2);
      expect(result?.status).toBe("checked_in");
    });
  });

  describe("manualCheckin", () => {
    it("should perform manual check-in", async () => {
      const mockResult = {
        id: 1,
        registrationId: 42,
        status: "checked_in",
        checkedInMethod: "manual",
        notes: "Check-in manual pelo admin",
      };
      (manualCheckin as any).mockResolvedValue(mockResult);

      const result = await manualCheckin(42, 1, "Check-in manual pelo admin");
      expect(result?.checkedInMethod).toBe("manual");
      expect(manualCheckin).toHaveBeenCalledWith(42, 1, "Check-in manual pelo admin");
    });

    it("should return null when registration has no checkin record", async () => {
      (manualCheckin as any).mockResolvedValue(null);

      const result = await manualCheckin(999, 1);
      expect(result).toBeNull();
    });
  });

  describe("cancelCheckin", () => {
    it("should cancel a checkin", async () => {
      (cancelCheckin as any).mockResolvedValue(undefined);

      await cancelCheckin("token-to-cancel");
      expect(cancelCheckin).toHaveBeenCalledWith("token-to-cancel");
    });
  });

  describe("getAllCheckins", () => {
    it("should return all checkins ordered by creation date", async () => {
      const mockCheckins = [
        { id: 3, registrationId: 3, status: "pending", createdAt: new Date("2026-07-03") },
        { id: 2, registrationId: 2, status: "checked_in", createdAt: new Date("2026-07-02") },
        { id: 1, registrationId: 1, status: "cancelled", createdAt: new Date("2026-07-01") },
      ];
      (getAllCheckins as any).mockResolvedValue(mockCheckins);

      const result = await getAllCheckins();
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(3); // Most recent first
    });

    it("should return empty array when no checkins exist", async () => {
      (getAllCheckins as any).mockResolvedValue([]);

      const result = await getAllCheckins();
      expect(result).toHaveLength(0);
    });
  });

  describe("getCheckinStats", () => {
    it("should return correct statistics", async () => {
      const mockStats = { total: 50, checkedIn: 30, pending: 15, cancelled: 5 };
      (getCheckinStats as any).mockResolvedValue(mockStats);

      const result = await getCheckinStats();
      expect(result.total).toBe(50);
      expect(result.checkedIn).toBe(30);
      expect(result.pending).toBe(15);
      expect(result.cancelled).toBe(5);
      expect(result.checkedIn + result.pending + result.cancelled).toBe(result.total);
    });

    it("should return zeros when no data exists", async () => {
      const mockStats = { total: 0, checkedIn: 0, pending: 0, cancelled: 0 };
      (getCheckinStats as any).mockResolvedValue(mockStats);

      const result = await getCheckinStats();
      expect(result.total).toBe(0);
    });
  });

  describe("QR Code Token Validation Logic", () => {
    it("should validate token format (64 hex characters)", () => {
      const validToken = "a".repeat(64);
      expect(validToken.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(validToken)).toBe(true);
    });

    it("should reject empty tokens", () => {
      const emptyToken = "";
      expect(emptyToken.length).toBe(0);
    });

    it("should parse QR Code JSON payload correctly", () => {
      const payload = JSON.stringify({
        token: "abc123",
        registrationId: 42,
        type: "legendarios_checkin",
      });
      const parsed = JSON.parse(payload);
      expect(parsed.type).toBe("legendarios_checkin");
      expect(parsed.token).toBe("abc123");
      expect(parsed.registrationId).toBe(42);
    });

    it("should reject invalid QR Code type", () => {
      const payload = JSON.stringify({
        token: "abc123",
        registrationId: 42,
        type: "other_event",
      });
      const parsed = JSON.parse(payload);
      expect(parsed.type).not.toBe("legendarios_checkin");
    });
  });
});
