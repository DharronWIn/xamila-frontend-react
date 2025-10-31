import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FluxChartByCategoryDto } from "@/lib/apiComponent/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/financialCategories";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { PieChart as PieChartIcon, BarChart3, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface FluxChartByCategoryProps {
  data: FluxChartByCategoryDto | null;
  isLoading?: boolean;
  className?: string;
}

export function FluxChartByCategory({ 
  data, 
  isLoading = false,
  className = "" 
}: FluxChartByCategoryProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [activeType, setActiveType] = useState<'entrees' | 'sorties' | 'epargne'>('entrees');

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
          <p className="font-medium">{data.category}</p>
          <p className="text-sm text-gray-600">
            Montant: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            Pourcentage: {data.percentage.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600">
            Nombre: {data.count} transaction{data.count > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const getChartData = () => {
    if (!data) return [];
    
    const items = 
      activeType === 'entrees' ? data.entrees :
      activeType === 'sorties' ? data.sorties :
      data.epargne;

    return items.map(item => ({
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      count: item.count,
      color: CATEGORY_COLORS[item.category] || '#6B7280',
      icon: CATEGORY_ICONS[item.category] || '💰'
    }));
  };

  const getTotal = () => {
    if (!data) return 0;
    return activeType === 'entrees' ? data.totalEntrees :
           activeType === 'sorties' ? data.totalSorties :
           data.totalEpargne;
  };

  const chartData = getChartData();
  const total = getTotal();

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage.toFixed(1)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => value}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="category" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 11 }}
        />
        <YAxis 
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Graphiques par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement des données...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Graphiques par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            <p>Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Graphiques par catégorie</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Camembert
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Barres
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeType} onValueChange={(v) => setActiveType(v as typeof activeType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entrees" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Entrées
            </TabsTrigger>
            <TabsTrigger value="sorties" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sorties
            </TabsTrigger>
            <TabsTrigger value="epargne" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Épargne
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entrees" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Répartition des entrées</h3>
                <p className="text-sm text-gray-600">Total: {formatCurrency(total)}</p>
              </div>
            </div>
            {chartType === 'pie' ? renderPieChart() : renderBarChart()}
            <div className="space-y-2 mt-4">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-500">
                      ({item.count} transaction{item.count > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                    <div className="text-sm text-gray-500">{item.percentage.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sorties" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Répartition des sorties</h3>
                <p className="text-sm text-gray-600">Total: {formatCurrency(total)}</p>
              </div>
            </div>
            {chartType === 'pie' ? renderPieChart() : renderBarChart()}
            <div className="space-y-2 mt-4">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-500">
                      ({item.count} transaction{item.count > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                    <div className="text-sm text-gray-500">{item.percentage.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="epargne" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Répartition de l'épargne</h3>
                <p className="text-sm text-gray-600">Total: {formatCurrency(total)}</p>
              </div>
            </div>
            {chartType === 'pie' ? renderPieChart() : renderBarChart()}
            <div className="space-y-2 mt-4">
              {chartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-500">
                      ({item.count} transaction{item.count > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                    <div className="text-sm text-gray-500">{item.percentage.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
