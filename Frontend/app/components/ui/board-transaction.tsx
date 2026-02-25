import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
// Definimos o contrato visual baseado no seu DTO do Nest
interface BoardTransactionProps {
  children: ReactNode;
  variant: "income" | "expensive" | "fixed expensive";
  onDelete?: () => void;
}

const BoardTransaction = ({
  children,
  variant,
  onDelete,
}: BoardTransactionProps) => {
  // Mapeamos os enums do Nest para cores do Tailwind
  const borderColors = {
    income: "border-l-green-400",
    expensive: "border-l-red-500",
    "fixed expensive": "border-l-orange-500", // Cor extra para o gasto fixo
  };

  return (
    <div
      className={`group relative border bg-white border-gray-200 border-l-8 p-3 rounded-r-md shadow-sm ${borderColors[variant]}`}
    >
      {children}

      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export { BoardTransaction };
