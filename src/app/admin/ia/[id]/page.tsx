import { notFound } from "next/navigation";
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

  return <AnalysisView anamnese={anamnese} />;
}
