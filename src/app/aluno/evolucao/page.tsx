import { getEvolucaoAluno, getTreinoEvolution } from "@/app/actions";
import { EvolucaoClientPage } from "./client-page";

export default async function EvolucaoPage() {
  const [avaliacoes, treinoEvolution] = await Promise.all([
    getEvolucaoAluno(),
    getTreinoEvolution(),
  ]);

  return (
    <EvolucaoClientPage 
      avaliacoes={avaliacoes} 
      treinoEvolution={treinoEvolution} 
    />
  );
}
