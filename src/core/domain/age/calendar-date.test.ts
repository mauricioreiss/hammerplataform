import { describe, expect, it } from "vitest";

import {
  compareCalendarDates,
  formatCalendarDateBr,
  formatCalendarDateIso,
  parseCalendarDate,
  todayInBrasilia,
} from "./calendar-date";

describe("parseCalendarDate", () => {
  it("lê uma data YYYY-MM-DD válida", () => {
    expect(parseCalendarDate("1994-10-17")).toEqual({
      year: 1994,
      month: 10,
      day: 17,
    });
  });

  it("recusa um dia que não existe no mês", () => {
    expect(parseCalendarDate("2026-02-31")).toBeNull();
  });

  it("recusa o mês 13", () => {
    expect(parseCalendarDate("2026-13-01")).toBeNull();
  });

  it("recusa 29 de fevereiro em ano não bissexto", () => {
    expect(parseCalendarDate("2026-02-29")).toBeNull();
  });

  it("aceita 29 de fevereiro em ano bissexto", () => {
    expect(parseCalendarDate("2024-02-29")).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it("recusa data incompleta, em outro formato ou com horário", () => {
    expect(parseCalendarDate("17/10/1994")).toBeNull();
    expect(parseCalendarDate("2026-1-1")).toBeNull();
    expect(parseCalendarDate("2026-10-17T00:00:00Z")).toBeNull();
    expect(parseCalendarDate("")).toBeNull();
  });
});

describe("todayInBrasilia", () => {
  it("às 21h30 em Brasília ainda é o dia anterior ao do UTC", () => {
    expect(todayInBrasilia(new Date("2026-10-18T00:30:00Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 17,
    });
  });

  it("um segundo antes da meia-noite em Brasília ainda é o dia anterior", () => {
    expect(todayInBrasilia(new Date("2026-10-18T02:59:59Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 17,
    });
  });

  it("à meia-noite em Brasília já é o dia seguinte", () => {
    expect(todayInBrasilia(new Date("2026-10-18T03:00:00Z"))).toEqual({
      year: 2026,
      month: 10,
      day: 18,
    });
  });
});

describe("compareCalendarDates", () => {
  it("ordena por ano, mês e dia", () => {
    expect(
      compareCalendarDates(
        { year: 2026, month: 10, day: 17 },
        { year: 2026, month: 10, day: 18 },
      ),
    ).toBeLessThan(0);
    expect(
      compareCalendarDates(
        { year: 2026, month: 10, day: 17 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(0);
    expect(
      compareCalendarDates(
        { year: 2027, month: 1, day: 1 },
        { year: 2026, month: 12, day: 31 },
      ),
    ).toBeGreaterThan(0);
  });
});

describe("formatCalendarDateBr", () => {
  it("formata como dd/mm/aaaa com zeros à esquerda", () => {
    expect(formatCalendarDateBr({ year: 2000, month: 1, day: 5 })).toBe(
      "05/01/2000",
    );
  });
});

describe("formatCalendarDateIso", () => {
  it("formata como YYYY-MM-DD com zeros à esquerda", () => {
    expect(formatCalendarDateIso({ year: 2026, month: 10, day: 7 })).toBe(
      "2026-10-07",
    );
  });
});
