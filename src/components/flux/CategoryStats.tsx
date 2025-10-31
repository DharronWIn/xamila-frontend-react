import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "./CategorySelector";
import { CATEGORY_COLORS } from "@/constants/financialCategories";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface CategoryStatsProps {
  stats: CategoryStat[];
  type: 'INCOME' | 'EXPENSE';
  showChart?: boolean;
  className?: string;
}

export function CategoryStats({ 
  stats, 
  type, 
  showChart = true,
  className = ""
}: CategoryStatsProps) {
  const totalAmount = stats.reduce((sum, stat) => sum + stat.amount, 0);
  const isIncome = type === 'INCOME';

  // Prepare data for chart
  const chartData = stats.map(stat => ({
    name: stat.category,
    value: stat.amount,
    percentage: stat.percentage,
    count: stat.transactionCount,
    color: CATEGORY_COLORS[stat.category] || '#6B7280'
  }));

  const COLORS = chartData.map(item => item.color);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Montant: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Pourcentage: {data.percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Transactions: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (stats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">
            {isIncome ? 'Revenus' : 'Dépenses'} par catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">
          {isIncome ? 'Revenus' : 'Dépenses'} par catégorie
        </CardTitle>
        <p className="text-sm text-gray-600">
          Total: {formatCurrency(totalAmount)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          {showChart && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category List */}
          <div className="space-y-3">
            {stats
              .sort((a, b) => b.amount - a.amount)
              .map((stat) => (
                <div key={stat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryBadge
                      category={stat.category}
                      showIcon={true}
                      showColor={true}
                      className="text-sm"
                    />
                    <span className="text-sm text-gray-600">
                      {stat.transactionCount} transaction{stat.transactionCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(stat.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryBreakdownProps {
  incomeStats: CategoryStat[];
  expenseStats: CategoryStat[];
  className?: string;
}

export function CategoryBreakdown({ 
  incomeStats, 
  expenseStats, 
  className = ""
}: CategoryBreakdownProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <CategoryStats
        stats={incomeStats}
        type="INCOME"
        showChart={true}
      />
      <CategoryStats
        stats={expenseStats}
        type="EXPENSE"
        showChart={true}
      />
    </div>
  );
}
