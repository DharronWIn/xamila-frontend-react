import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3 shadow-lg">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-lg font-medium">Chargement...</span>
      </div>
    </div>
  );
}
