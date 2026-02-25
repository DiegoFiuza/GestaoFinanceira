"use client";

import { useTransactions } from "@/src/context/transactions-context";

const Total = () => {
  // 1. Em vez de buscar na API, consumimos os dados já filtrados do Contexto
  const { filteredTransactions } = useTransactions();

  // 2. Calculamos os métricas em tempo real com base na lista filtrada
  const metrics = filteredTransactions.reduce(
    (acc, curr) => {
      const val = Number(curr.amount) || 0;

      if (curr.type === "income") {
        acc.totalIncome += val;
        acc.total += val; // Soma ao saldo
      } else {
        // expensive ou fixed expensive
        acc.totalExpensive += val;
        acc.total -= val; // Subtrai do saldo
      }
      return acc;
    },
    { total: 0, totalIncome: 0, totalExpensive: 0 },
  );

  // Função de formatação (mantida igual)
  const format = (n: number) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="border rounded-3xl m-5 p-5 text-2xl text-black font-bold bg-white flex flex-col items-start justify-between shadow-sm min-w-[250px]">
      <h2 className="mb-2">Total: R$ {format(metrics.total)}</h2>
      <p className="text-xl text-green-600 font-semibold">
        Profit: R$ {format(metrics.totalIncome)}
      </p>
      <p className="text-xl text-red-500 font-semibold">
        Loss: R$ {format(metrics.totalExpensive)}
      </p>
    </div>
  );
};

export default Total;
