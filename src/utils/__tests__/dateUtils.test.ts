import { describe, it, expect } from "vitest";

import { formatDate } from "../dateUtils";

describe("dateUtils", () => {
  describe("formatDate", () => {
    it("should format valid date string correctly", () => {
      const result = formatDate("2024-01-15T10:30:00Z");
      expect(result).toBe("15/01/24");
    });

    it("should format ISO date string correctly", () => {
      const result = formatDate("2024-12-25T00:00:00.000Z");
      expect(result).toBe("25/12/24");
    });

    it("should return dash for null date", () => {
      const result = formatDate(null);
      expect(result).toBe("-");
    });

    it("should return dash for undefined date", () => {
      const result = formatDate(undefined);
      expect(result).toBe("-");
    });

    it("should return dash for empty string", () => {
      const result = formatDate("");
      expect(result).toBe("-");
    });

    it("should handle different year formats", () => {
      const result = formatDate("2023-06-01T12:00:00Z");
      expect(result).toBe("01/06/23");
    });

    it("should handle single digit dates and months", () => {
      const result = formatDate("2024-03-05T08:15:00Z");
      expect(result).toBe("05/03/24");
    });
  });
});
