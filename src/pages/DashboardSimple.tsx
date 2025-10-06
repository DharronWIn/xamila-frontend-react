import { useAuthStore } from "@/stores/authStore";
import { useSavingsStore } from "@/stores/savingsStore";
import { useFinancialStore } from "@/stores/financialStore";
import { useSocialStore } from "@/stores/socialStore";

export default function DashboardSimple() {
  const { user } = useAuthStore();
  const { goal } = useSavingsStore();
  const { transactions } = useFinancialStore();
  const { posts, challenges } = useSocialStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Simple</h1>
      
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <h2 className="font-bold">Store Data:</h2>
        <p>User: {user ? user.name : 'None'}</p>
        <p>Authenticated: {user ? 'Yes' : 'No'}</p>
        <p>Goal: {goal ? 'Set' : 'Not set'}</p>
        <p>Posts: {posts.length}</p>
        <p>Challenges: {challenges.length}</p>
        <p>Transactions: {transactions.length}</p>
        <p>Premium: {user?.isPremium ? 'Yes' : 'No'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Objectif d'épargne</h3>
          {goal ? (
            <div>
              <p>Objectif: {goal.targetAmount}€</p>
              <p>Actuel: {goal.currentAmount}€</p>
              <p>Progression: {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
            </div>
          ) : (
            <p>Aucun objectif défini</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Transactions</h3>
          <p>Nombre de transactions: {transactions.length}</p>
          {transactions.length > 0 && (
            <div className="mt-2">
              <p>Dernière: {transactions[0].description}</p>
              <p>Montant: {transactions[0].amount}€</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Posts récents</h3>
          <p>Nombre de posts: {posts.length}</p>
          {posts.length > 0 && (
            <div className="mt-2">
              <p>Dernier: {posts[0].content.substring(0, 50)}...</p>
              <p>Par: {posts[0].userName}</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Défis actifs</h3>
          <p>Nombre de défis: {challenges.length}</p>
          {challenges.length > 0 && (
            <div className="mt-2">
              <p>Dernier: {challenges[0].title}</p>
              <p>Participants: {challenges[0].participants}</p>
            </div>
          )}
        </div>
      </div>

      {!user && (
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <p className="text-yellow-800">⚠️ Aucun utilisateur connecté</p>
        </div>
      )}

      {!goal && (
        <div className="mt-6 p-4 bg-orange-100 rounded">
          <p className="text-orange-800">⚠️ Aucun objectif d'épargne défini</p>
        </div>
      )}
    </div>
  );
}
