import {
  compareCalendarDates,
  formatCalendarDateBr,
  parseCalendarDate,
  type CalendarDate,
} from "./calendar-date";

export const MAX_AGE_YEARS = 120;
export const FUNNEL_MINIMUM_AGE_YEARS = 18;

export type BirthDateRejection =
  "invalid" | "future" | "too_old" | "under_minimum_age";

export type BirthDateValidation =
  | { ok: true; birthDate: CalendarDate; age: number }
  | { ok: false; reason: BirthDateRejection };

export const BIRTH_DATE_MESSAGES: Readonly<
  Record<BirthDateRejection | "missing", string>
> = {
  missing: "Data de nascimento é obrigatória.",
  invalid: "Data de nascimento inválida.",
  future: "Data de nascimento não pode ser uma data futura.",
  too_old: `Data de nascimento inválida: resulta em mais de ${MAX_AGE_YEARS} anos.`,
  under_minimum_age: `O cadastro pela página é só para maiores de ${FUNNEL_MINIMUM_AGE_YEARS} anos.`,
};

export const AGE_NOT_INFORMED_LABEL = "Idade não informada";

type StudentAge = Readonly<{
  age: number | null;
  ageLabel: string;
  birthDateLabel: string | null;
}>;

const AGE_NOT_INFORMED: StudentAge = Object.freeze({
  age: null,
  ageLabel: AGE_NOT_INFORMED_LABEL,
  birthDateLabel: null,
});

export function calculateAgeInYears(
  birthDate: CalendarDate,
  today: CalendarDate,
): number {
  const yearsSinceBirthYear = today.year - birthDate.year;
  return hasHadBirthdayThisYear(birthDate, today)
    ? yearsSinceBirthYear
    : yearsSinceBirthYear - 1;
}

function hasHadBirthdayThisYear(
  birthDate: CalendarDate,
  today: CalendarDate,
): boolean {
  const birthdayThisYear = { ...birthDate, year: today.year };
  return compareCalendarDates(birthdayThisYear, today) <= 0;
}

export function validateBirthDate(
  value: string,
  today: CalendarDate,
  rules: { minimumAge?: number } = {},
): BirthDateValidation {
  const birthDate = parseCalendarDate(value);
  if (!birthDate) return { ok: false, reason: "invalid" };
  if (compareCalendarDates(birthDate, today) > 0) {
    return { ok: false, reason: "future" };
  }

  const age = calculateAgeInYears(birthDate, today);
  if (age > MAX_AGE_YEARS) return { ok: false, reason: "too_old" };
  if (rules.minimumAge !== undefined && age < rules.minimumAge) {
    return { ok: false, reason: "under_minimum_age" };
  }

  return { ok: true, birthDate, age };
}

export function formatAgeLabel(age: number | null): string {
  if (age === null) return AGE_NOT_INFORMED_LABEL;
  return age === 1 ? "1 ano" : `${age} anos`;
}

export function describeStudentAge(
  birthDate: string | null | undefined,
  today: CalendarDate,
): StudentAge {
  if (!birthDate) return AGE_NOT_INFORMED;

  const validation = validateBirthDate(birthDate, today);
  if (!validation.ok) return AGE_NOT_INFORMED;

  return {
    age: validation.age,
    ageLabel: formatAgeLabel(validation.age),
    birthDateLabel: formatCalendarDateBr(validation.birthDate),
  };
}
