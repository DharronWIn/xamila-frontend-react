import { useAuthStore } from "@/stores/authStore";
import { useSavingsStore } from "@/stores/savingsStore";
import { useFinancialStore } from "@/stores/financialStore";
import { useSocialStore } from "@/stores/socialStore";

export function DebugInfo() {
  const auth = useAuthStore();
  const savings = useSavingsStore();
  const financial = useFinancialStore();
  const social = useSocialStore();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Auth: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {auth.user?.name || 'None'}</div>
        <div>Goal: {savings.goal ? '✅' : '❌'}</div>
        <div>Transactions: {financial.transactions?.length || 0}</div>
        <div>Posts: {social.posts?.length || 0}</div>
        <div>Challenges: {social.challenges?.length || 0}</div>
        <div>Notifications: {social.notifications?.length || 0}</div>
      </div>
    </div>
  );
}
