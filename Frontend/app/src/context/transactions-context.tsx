"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import api from "@/src/api/api";
import { DateRange } from "react-day-picker"; // Tipo padrão do shadcn/calendar
import {
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";

export interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  type: "income" | "expensive" | "fixed expensive";
  createdAt: string;
  date?: string; // <--- ADICIONE ISTO (Data manual que o usuário escolhe)
}
interface TransactionsContextType {
  transactions: Transaction[]; // Todas as transações (bruto)
  filteredTransactions: Transaction[]; // Transações filtradas pela data
  addTransaction: (
    transaction: Omit<Transaction, "_id" | "createdAt">,
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
  date: DateRange | undefined; // Estado da data
  setDate: (date: DateRange | undefined) => void; // Função para mudar a data
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined,
);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado inicial: últimos 30 dias por padrão
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/transactions");
      if (Array.isArray(data)) setTransactions(data);
    } catch (e) {
      console.error("Erro ao buscar:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Lógica de Filtro Automático
  const filteredTransactions = useMemo(() => {
    // Se não houver data selecionada, retorna tudo (ou nada, você decide)
    if (!date?.from) return transactions;

    const fromDate = startOfDay(date.from);
    const toDate = endOfDay(date.to || date.from); // Se não tiver data final, considera o mesmo dia

    return transactions.filter((t) => {
      if (!t.createdAt) return false;
      const tDate = parseISO(t.createdAt);

      return isWithinInterval(tDate, { start: fromDate, end: toDate });
    });
  }, [transactions, date]);

  const addTransaction = async (
    payload: Omit<Transaction, "_id" | "createdAt">,
  ) => {
    const { data } = await api.post("/transactions", payload);
    if (data) setTransactions((prev) => [...prev, data]);
  };

  const deleteTransaction = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        filteredTransactions, // Exportamos a lista filtrada
        addTransaction,
        deleteTransaction,
        loading,
        date, // Exportamos o estado da data
        setDate, // Exportamos a função de setar data
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context)
    throw new Error(
      "useTransactions deve ser usado dentro de um TransactionsProvider",
    );
  return context;
}
