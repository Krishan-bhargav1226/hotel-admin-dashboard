/// <reference types="node" />
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isAtLeast18YearsOld, formatDobForDisplay } from "../../src/utils/checkin/ageValidator.ts";

describe("Age Validator for Couple 18+ Rule", () => {
  const referenceDate = new Date(2026, 9, 16); // 16 Oct 2026

  test("Person turning 18 on reference date is valid", () => {
    const res = isAtLeast18YearsOld("16/10/2008", referenceDate);
    assert.equal(res.valid, true);
    assert.equal(res.age, 18);
  });

  test("Person who turned 18 yesterday is valid", () => {
    const res = isAtLeast18YearsOld("15/10/2008", referenceDate);
    assert.equal(res.valid, true);
    assert.equal(res.age, 18);
  });

  test("Person turning 18 tomorrow is invalid (currently 17)", () => {
    const res = isAtLeast18YearsOld("17/10/2008", referenceDate);
    assert.equal(res.valid, false);
    assert.equal(res.age, 17);
    assert.ok(res.error?.includes("Must be 18+"));
  });

  test("Person who is 15 years old is blocked with clear message", () => {
    const res = isAtLeast18YearsOld("01/01/2011", referenceDate);
    assert.equal(res.valid, false);
    assert.equal(res.age, 15);
    assert.ok(res.error?.includes("Underage guest not allowed in couple booking"));
  });

  test("Supports ISO YYYY-MM-DD format as well", () => {
    const res = isAtLeast18YearsOld("2000-05-20", referenceDate);
    assert.equal(res.valid, true);
    assert.equal(res.age, 26);
  });

  test("Rejects future dates and invalid dates", () => {
    const future = isAtLeast18YearsOld("16/10/2030", referenceDate);
    assert.equal(future.valid, false);

    const invalid = isAtLeast18YearsOld("99/99/2000", referenceDate);
    assert.equal(invalid.valid, false);
  });

  test("formatDobForDisplay converts ISO to DD/MM/YYYY", () => {
    assert.equal(formatDobForDisplay("2000-05-20"), "20/05/2000");
    assert.equal(formatDobForDisplay("20/05/2000"), "20/05/2000");
  });
});
