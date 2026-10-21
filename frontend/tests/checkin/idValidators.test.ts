/// <reference types="node" />
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  validateIdFormat,
  maskIdNumber,
  normalizeIdNumber,
} from "../../src/utils/checkin/idValidators.ts";

describe("ID Validators & Masking", () => {
  test("Aadhaar validation requires exactly 12 numeric digits", () => {
    assert.equal(validateIdFormat("AADHAAR", "123456789012").valid, true);
    assert.equal(validateIdFormat("AADHAAR", "1234 5678 9012").valid, true);
    assert.equal(validateIdFormat("AADHAAR", "1234-5678-9012").valid, true);
    assert.equal(validateIdFormat("AADHAAR", "12345678901").valid, false); // 11 digits
    assert.equal(validateIdFormat("AADHAAR", "1234567890123").valid, false); // 13 digits
    assert.equal(validateIdFormat("AADHAAR", "12345678901A").valid, false); // letters
  });

  test("PAN validation requires 5 letters, 4 digits, 1 letter", () => {
    assert.equal(validateIdFormat("PAN", "ABCDE1234F").valid, true);
    assert.equal(validateIdFormat("PAN", "abcde1234f").valid, true);
    assert.equal(validateIdFormat("PAN", "ABCD12345F").valid, false);
    assert.equal(validateIdFormat("PAN", "ABCDEF1234").valid, false);
    assert.equal(validateIdFormat("PAN", "12345ABCDE").valid, false);
  });

  test("Voter ID validation requires 3 letters followed by 7 digits", () => {
    assert.equal(validateIdFormat("VOTER", "ABC1234567").valid, true);
    assert.equal(validateIdFormat("VOTER", "xyz 7654321").valid, true);
    assert.equal(validateIdFormat("VOTER", "AB1234567").valid, false);
    assert.equal(validateIdFormat("VOTER", "ABCD123456").valid, false);
  });

  test("Passport validation requires 1 letter followed by 7 digits", () => {
    assert.equal(validateIdFormat("PASSPORT", "A1234567").valid, true);
    assert.equal(validateIdFormat("PASSPORT", "z7654321").valid, true);
    assert.equal(validateIdFormat("PASSPORT", "AB123456").valid, false);
    assert.equal(validateIdFormat("PASSPORT", "12345678").valid, false);
  });

  test("Driving License allows 8-20 alphanumeric characters", () => {
    assert.equal(validateIdFormat("DL", "DL1420110012345").valid, true);
    assert.equal(validateIdFormat("DL", "MH-02-2015-1234567").valid, true);
    assert.equal(validateIdFormat("DL", "DL123").valid, false); // too short
  });

  test("Other ID type requires at least 3 characters", () => {
    assert.equal(validateIdFormat("OTHER", "GovtEmployeeCard123").valid, true);
    assert.equal(validateIdFormat("OTHER", "AB").valid, false);
  });

  test("Masking properly protects ID numbers by default", () => {
    assert.equal(maskIdNumber("AADHAAR", "123456789012"), "•••• •••• 9012");
    assert.equal(maskIdNumber("PAN", "ABCDE1234F"), "••••••234F");
    assert.equal(maskIdNumber("VOTER", "ABC1234567"), "••••••4567");
    assert.equal(maskIdNumber("PASSPORT", "A1234567"), "••••••4567");
  });

  test("Normalization strips spaces and hyphens and converts to uppercase", () => {
    assert.equal(normalizeIdNumber(" abc-12 34 "), "ABC1234");
  });
});
