import { CalendarCustomDays } from "@/components/calendario";
import { GraficoDeBarra } from "@/components/chart";
import Total from "@/components/ui/total";
import Transactions from "@/components/ui/transaction";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TransactionsProvider } from "@/src/context/transactions-context";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <TransactionsProvider>
      <div className="grid grid-cols-3 gap-4 min-w-full min-h-screen p-4 box-border">
        {/* --- COLUNA ESQUERDA (1/3) --- */}
        {/* Adicionei 'gap-4' para dar espaço vertical entre os itens */}
        <div className="col-span-1 flex flex-col gap-4 w-full">
          {/* 1. Calendário 
              - Mudei de 'w-fit' para 'w-full' para ocupar a largura toda
          */}
          <div className="w-full">
            <CalendarCustomDays />
          </div>

          {/* 2. Gráfico 
              - Removi o 'grid-cols-2' que estava a dividir o espaço ao meio
              - Agora ele tem liberdade para ocupar a largura toda da coluna
          */}
          <div className="w-full pt-1">
            <GraficoDeBarra />
          </div>

          <div className="w-full">
            <Total />
          </div>
        </div>

        <div className="col-span-2 w-full h-full">
          <Transactions />
        </div>
      </div>
    </TransactionsProvider>
  );
}
