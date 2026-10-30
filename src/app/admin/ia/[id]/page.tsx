import { notFound } from "next/navigation";
import { describeStudentAge } from "@/core/domain/age/age";
import { todayInBrasilia } from "@/core/domain/age/calendar-date";
import { getAnamneseById } from "../actions";
import { AnalysisView } from "./analysis-view";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anamnese = await getAnamneseById(id);

  if (!anamnese) notFound();

  const { ageLabel } = describeStudentAge(
    anamnese.birth_date,
    todayInBrasilia(),
  );

  return <AnalysisView anamnese={anamnese} ageLabel={ageLabel} />;
}
