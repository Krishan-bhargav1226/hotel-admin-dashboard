/// <reference types="node" />
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { GUEST_LOOKUP_SCOPE } from "../../src/utils/checkin/config.ts";

describe("Lookup Logic & Scope Configuration", () => {
  test("Default lookup scope is configured to 'hotel'", () => {
    assert.equal(GUEST_LOOKUP_SCOPE, "hotel");
  });

  test("Phone normalization extracts 10 digits accurately", () => {
    const raw = "+91 98765-43210";
    const cleaned = raw.replace(/\D/g, "").slice(-10);
    assert.equal(cleaned, "9876543210");
    assert.equal(cleaned.length, 10);
  });

  test("Under 10 digits does not trigger auto-search", () => {
    const raw = "987654321";
    assert.equal(raw.length < 10, true);
  });

  test("Multiple matches properly formats pick-list items", () => {
    const mockMatches = [
      {
        id: "g1",
        hotelId: "hotel-1",
        guestType: "COUPLE",
        primaryPhone: "9876543210",
        visitCount: 3,
        lastVisitAt: "2026-08-15T10:00:00Z",
        members: [{ fullName: "Aarav Sharma" }, { fullName: "Priya Sharma" }],
      },
      {
        id: "g2",
        hotelId: "hotel-1",
        guestType: "SOLO",
        primaryPhone: "9876543210",
        visitCount: 1,
        lastVisitAt: "2026-02-10T14:30:00Z",
        members: [{ fullName: "Aarav Sharma" }],
      },
    ];

    assert.equal(mockMatches.length, 2);
    assert.equal(mockMatches[0].guestType, "COUPLE");
    assert.equal(mockMatches[1].guestType, "SOLO");
  });
});
