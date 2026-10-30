import { describe, expect, it } from "vitest";

import {
  BIRTH_DATE_MESSAGES,
  calculateAgeInYears,
  describeStudentAge,
  formatAgeLabel,
  validateBirthDate,
} from "./age";

describe("calculateAgeInYears", () => {
  it("conta o ano novo quando o aniversário é hoje", () => {
    expect(
      calculateAgeInYears(
        { year: 1994, month: 10, day: 17 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(32);
  });

  it("não conta o ano novo quando o aniversário é amanhã", () => {
    expect(
      calculateAgeInYears(
        { year: 1994, month: 10, day: 18 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(31);
  });

  it("conta o ano novo quando o aniversário foi ontem", () => {
    expect(
      calculateAgeInYears(
        { year: 1994, month: 10, day: 16 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(32);
  });

  it("no último dia do ano ainda conta a idade do ano corrente", () => {
    expect(
      calculateAgeInYears(
        { year: 2000, month: 1, day: 1 },
        { year: 2026, month: 12, day: 31 },
      ),
    ).toBe(26);
  });

  it("no primeiro dia do ano conta o ano novo de quem nasceu em 1º de janeiro", () => {
    expect(
      calculateAgeInYears(
        { year: 2000, month: 1, day: 1 },
        { year: 2027, month: 1, day: 1 },
      ),
    ).toBe(27);
  });

  it("nascido em 29/02 ainda não fez aniversário em 28/02 de ano não bissexto", () => {
    expect(
      calculateAgeInYears(
        { year: 2004, month: 2, day: 29 },
        { year: 2026, month: 2, day: 28 },
      ),
    ).toBe(21);
  });

  it("nascido em 29/02 completa o ano em 01/03 de ano não bissexto", () => {
    expect(
      calculateAgeInYears(
        { year: 2004, month: 2, day: 29 },
        { year: 2026, month: 3, day: 1 },
      ),
    ).toBe(22);
  });

  it("nascido em 29/02 ainda não fez aniversário em 28/02 de ano bissexto", () => {
    expect(
      calculateAgeInYears(
        { year: 2004, month: 2, day: 29 },
        { year: 2028, month: 2, day: 28 },
      ),
    ).toBe(23);
  });

  it("nascido em 29/02 completa o ano em 29/02 de ano bissexto", () => {
    expect(
      calculateAgeInYears(
        { year: 2004, month: 2, day: 29 },
        { year: 2028, month: 2, day: 29 },
      ),
    ).toBe(24);
  });

  it("devolve zero antes do primeiro aniversário", () => {
    expect(
      calculateAgeInYears(
        { year: 2026, month: 3, day: 1 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(0);
  });

  it("devolve um ano no primeiro aniversário", () => {
    expect(
      calculateAgeInYears(
        { year: 2025, month: 10, day: 17 },
        { year: 2026, month: 10, day: 17 },
      ),
    ).toBe(1);
  });
});

describe("validateBirthDate", () => {
  const today = { year: 2026, month: 10, day: 17 };

  it("aceita nascido hoje com idade zero", () => {
    expect(validateBirthDate("2026-10-17", today)).toEqual({
      ok: true,
      birthDate: { year: 2026, month: 10, day: 17 },
      age: 0,
    });
  });

  it("recusa data de nascimento no futuro", () => {
    expect(validateBirthDate("2026-10-18", today)).toEqual({
      ok: false,
      reason: "future",
    });
  });

  it("recusa data que resulta em mais de 120 anos", () => {
    expect(validateBirthDate("1905-10-17", today)).toEqual({
      ok: false,
      reason: "too_old",
    });
  });

  it("recusa ano de dois dígitos digitado com zeros à esquerda como mais de 120 anos", () => {
    expect(validateBirthDate("0050-01-01", today)).toEqual({
      ok: false,
      reason: "too_old",
    });
  });

  it("recusa quem completa 18 anos amanhã quando a idade mínima é 18", () => {
    expect(validateBirthDate("2008-10-18", today, { minimumAge: 18 })).toEqual({
      ok: false,
      reason: "under_minimum_age",
    });
  });

  it("aceita idade de exatamente 120 anos", () => {
    expect(validateBirthDate("1906-10-17", today)).toEqual({
      ok: true,
      birthDate: { year: 1906, month: 10, day: 17 },
      age: 120,
    });
  });

  it("recusa dia que não existe no calendário", () => {
    expect(validateBirthDate("2026-02-31", today)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("aceita quem completa 18 anos hoje quando a idade mínima é 18", () => {
    expect(validateBirthDate("2008-10-17", today, { minimumAge: 18 })).toEqual({
      ok: true,
      birthDate: { year: 2008, month: 10, day: 17 },
      age: 18,
    });
  });

  it("aceita menor de idade quando não há idade mínima", () => {
    expect(validateBirthDate("2011-05-05", today)).toEqual({
      ok: true,
      birthDate: { year: 2011, month: 5, day: 5 },
      age: 15,
    });
  });

  it("data futura vence a regra de idade mínima", () => {
    expect(validateBirthDate("2026-10-18", today, { minimumAge: 18 })).toEqual({
      ok: false,
      reason: "future",
    });
  });
});

describe("formatAgeLabel", () => {
  it("rotula idade ausente, zero, singular e plural", () => {
    expect(formatAgeLabel(null)).toBe("Idade não informada");
    expect(formatAgeLabel(0)).toBe("0 anos");
    expect(formatAgeLabel(1)).toBe("1 ano");
    expect(formatAgeLabel(32)).toBe("32 anos");
  });
});

describe("describeStudentAge", () => {
  const today = { year: 2026, month: 10, day: 17 };
  const ageNotInformed = {
    age: null,
    ageLabel: "Idade não informada",
    birthDateLabel: null,
  };

  it("descreve idade e data de nascimento de aluno com data registrada", () => {
    expect(describeStudentAge("1994-10-17", today)).toEqual({
      age: 32,
      ageLabel: "32 anos",
      birthDateLabel: "17/10/1994",
    });
  });

  it("trata data ausente como idade não informada", () => {
    expect(describeStudentAge(null, today)).toEqual(ageNotInformed);
    expect(describeStudentAge(undefined, today)).toEqual(ageNotInformed);
    expect(describeStudentAge("", today)).toEqual(ageNotInformed);
  });

  it("trata data ilegível ou inexistente como idade não informada", () => {
    expect(describeStudentAge("lixo", today)).toEqual(ageNotInformed);
    expect(describeStudentAge("2026-02-31", today)).toEqual(ageNotInformed);
  });

  it("trata data futura como idade não informada e nunca devolve idade negativa", () => {
    expect(describeStudentAge("2030-01-01", today)).toEqual(ageNotInformed);
  });

  it("trata data que resulta em mais de 120 anos como idade não informada", () => {
    expect(describeStudentAge("1905-10-17", today)).toEqual(ageNotInformed);
  });
});

describe("BIRTH_DATE_MESSAGES", () => {
  it("usa o texto fixado na spec para cada motivo", () => {
    expect(BIRTH_DATE_MESSAGES).toEqual({
      missing: "Data de nascimento é obrigatória.",
      invalid: "Data de nascimento inválida.",
      future: "Data de nascimento não pode ser uma data futura.",
      too_old: "Data de nascimento inválida: resulta em mais de 120 anos.",
      under_minimum_age: "O cadastro pela página é só para maiores de 18 anos.",
    });
  });
});
