"use client";

import { Button } from "@/components/ui/button";
import { BoardTransaction } from "@/components/ui/board-transaction";
import { useState } from "react";
import { useTransactions } from "@/src/context/transactions-context";
import { format } from "date-fns";

const Transactions = () => {
  // Consumir o contexto em vez de estado local
  const { filteredTransactions, addTransaction, deleteTransaction } =
    useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<"income" | "expensive" | "fixed expensive">(
    "income",
  );

  const handlePostTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { amount: Number(amount), description, type };

      // Chama a função do Contexto
      await addTransaction(payload);

      setIsFormOpen(false);
      resetForm();
    } catch (err) {
      alert("Erro ao salvar transação.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      // Chama a função do Contexto
      await deleteTransaction(id);
    } catch (err) {
      alert("Não foi possível excluir a transação.");
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount(0);
    setType("income");
  };

  return (
    <div className="border border-white/80 bg-gray-100 rounded-3xl grid grid-cols-2 justify-between min-h-fit min-w-fit m-5 p-5 text-2xl font-bold">
      <div className="col-span-1">
        <h2 className="font-bold text-2xl mb-4">Transações</h2>
        <ul className="flex flex-col gap-3 max-h-100 overflow-y-auto">
          {/* Usamos filteredTransactions no map */}
          {filteredTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <BoardTransaction
                key={t._id}
                variant={t.type}
                onDelete={() => t._id && handleDeleteTransaction(t._id)}
              >
                <li className="list-none text-lg flex justify-between items-center px-2 pr-10">
                  <span className="text-gray-700 font-medium">
                    {t.description || "Sem descrição"}
                  </span>
                  <span
                    className={
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {t.type === "income" ? "+" : "-"} R${" "}
                    {Number(t.amount).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </li>
              </BoardTransaction>
            ))
          ) : (
            <p className="text-sm font-normal text-gray-500 italic">
              Nenhuma transação encontrada neste período.
            </p>
          )}
        </ul>
      </div>

      <div className="col-span-1 flex flex-col items-end justify-start px-4">
        {!isFormOpen ? (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-400 hover:bg-green-500 text-white text-xl p-6 rounded-2xl transition-all"
          >
            Publicar transação
          </Button>
        ) : (
          <form
            onSubmit={handlePostTransaction}
            className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-4 text-base font-normal border border-gray-200"
          >
            <h3 className="font-bold text-xl text-gray-800">Nova Transação</h3>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 text-left">
                Descrição
              </label>
              <input
                type="text"
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ex: Venda de curso"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 text-left">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                placeholder="0.00"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 text-left">
                Tipo
              </label>
              <select
                className="border border-gray-300 p-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-green-400"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="income">Ganho (Income)</option>
                <option value="expensive">Gasto (Expensive)</option>
                <option value="fixed expensive">Gasto Fixo</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white flex-1 font-bold"
              >
                Salvar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 flex-1 font-bold"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Transactions;
