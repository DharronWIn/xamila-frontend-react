import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PaginationStatsProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  isLoading: boolean;
}

const PaginationStats = ({ 
  currentPage, 
  totalPages, 
  totalPosts, 
  hasNext, 
  isLoading 
}: PaginationStatsProps) => {
  const progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Progression</span>
        <span className="font-medium">{currentPage}/{totalPages}</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Posts chargés</span>
          <Badge variant="outline">{totalPosts}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Statut</span>
          <Badge variant={hasNext ? "default" : "secondary"}>
            {isLoading ? "Chargement..." : hasNext ? "Plus disponible" : "Fin atteinte"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PaginationStats;
