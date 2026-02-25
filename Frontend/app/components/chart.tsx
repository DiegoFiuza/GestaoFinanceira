"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format, parseISO, isValid } from "date-fns"; // Adicionei isValid para segurança
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTransactions } from "@/src/context/transactions-context";

const chartConfig = {
  lucro: {
    label: "Lucro",
    color: "#22c55e",
  },
  prejuizo: {
    label: "Prejuízo",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function GraficoDeBarra() {
  const { transactions } = useTransactions();

  // Processamento dos dados
  const chartData = useMemo(() => {
    // Objeto auxiliar para agrupar somas por mês
    const agrupado: Record<
      string,
      { month: string; lucro: number; prejuizo: number; order: number }
    > = {};

    transactions.forEach((t) => {
      let dataTransacao: Date;

      // Tenta converter a string do MongoDB para Data
      if (t.createdAt) {
        dataTransacao = parseISO(t.createdAt);
      } else {
        // Fallback caso algo venha sem data (previne crash)
        dataTransacao = new Date();
      }

      // Validação extra: se a data for inválida, usa a data atual
      if (!isValid(dataTransacao)) {
        dataTransacao = new Date();
      }

      // Cria a chave "fevereiro", "março", etc.
      const monthKey = format(dataTransacao, "MMMM", { locale: ptBR });

      // Pega o índice do mês (0 a 11) para poder ordenar corretamente depois
      const monthOrder = dataTransacao.getMonth();

      // Se o mês ainda não existe no agrupamento, cria zerado
      if (!agrupado[monthKey]) {
        agrupado[monthKey] = {
          month: monthKey, // Nome para exibir (eixo X)
          lucro: 0,
          prejuizo: 0,
          order: monthOrder, // Número para ordenar
        };
      }

      const valor = Number(t.amount);

      if (t.type === "income") {
        agrupado[monthKey].lucro += valor;
      } else {
        agrupado[monthKey].prejuizo += valor;
      }
    });

    // Transforma o objeto em array e ordena cronologicamente (Jan -> Fev -> Mar)
    return Object.values(agrupado).sort((a, b) => a.order - b.order);
  }, [transactions]); // Recalcula sempre que 'transactions' mudar

  // Cálculos de totais
  const totalLucro = chartData.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalPrejuizo = chartData.reduce((acc, curr) => acc + curr.prejuizo, 0);
  const balancoTotal = totalLucro - totalPrejuizo;

  const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balanço Mensal</CardTitle>
        <CardDescription>
          Histórico baseado nas transações registradas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {/* Se não houver dados, mostra mensagem ou gráfico vazio */}
          {chartData.length > 0 ? (
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)} // Abrevia: "fevereiro" -> "fev"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="lucro"
                stackId="a"
                fill="var(--color-lucro)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="prejuizo"
                stackId="a"
                fill="var(--color-prejuizo)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <div className="flex h-50 items-center justify-center text-muted-foreground">
              Nenhuma transação registrada ainda.
            </div>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Balanço Total:{" "}
          <span
            className={balancoTotal >= 0 ? "text-green-600" : "text-red-600"}
          >
            {formatadorMoeda.format(balancoTotal)}
          </span>
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
