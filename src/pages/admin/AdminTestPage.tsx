import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminDashboard, useAdminUsers, useAdminNotifications, useAdminBankAccounts } from '@/lib/apiComponent/hooks/useAdmin';
import { Loader2, CheckCircle } from 'lucide-react';

const AdminTestPage = () => {
  const dashboard = useAdminDashboard();
  const users = useAdminUsers();
  const notifications = useAdminNotifications();
  const bankAccounts = useAdminBankAccounts();

  const testDashboard = async () => {
    try {
      console.log('Testing dashboard...');
      const stats = await dashboard.getDashboardStats({ period: '30d' });
      console.log('Dashboard stats:', stats);
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  };

  const testUsers = async () => {
    try {
      console.log('Testing users...');
      const userList = await users.getUsers({ page: 1, limit: 10 });
      console.log('Users:', userList);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const testNotifications = async () => {
    try {
      console.log('Testing notifications...');
      const notificationList = await notifications.getNotifications(1, 10);
      console.log('Notifications:', notificationList);
    } catch (error) {
      console.error('Notifications error:', error);
    }
  };

  const testBankAccounts = async () => {
    try {
      console.log('Testing bank accounts...');
      const applications = await bankAccounts.getApplications(1, 10);
      console.log('Bank accounts:', applications);
    } catch (error) {
      console.error('Bank accounts error:', error);
    }
  };

  const runAllTests = async () => {
    await testDashboard();
    await testUsers();
    await testNotifications();
    await testBankAccounts();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test des API Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Test des statistiques du dashboard
            </p>
            <Button 
              onClick={testDashboard} 
              disabled={dashboard.isLoading}
              className="w-full"
            >
              {dashboard.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tester Dashboard
            </Button>
            {dashboard.error && (
              <p className="text-red-500 text-xs mt-2">{dashboard.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span>Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Test de la gestion des utilisateurs
            </p>
            <Button 
              onClick={testUsers} 
              disabled={users.isLoading}
              className="w-full"
            >
              {users.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tester Utilisateurs
            </Button>
            {users.error && (
              <p className="text-red-500 text-xs mt-2">{users.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Test des notifications
            </p>
            <Button 
              onClick={testNotifications} 
              disabled={notifications.isLoading}
              className="w-full"
            >
              {notifications.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tester Notifications
            </Button>
            {notifications.error && (
              <p className="text-red-500 text-xs mt-2">{notifications.error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              <span>Comptes Bancaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Test des comptes bancaires
            </p>
            <Button 
              onClick={testBankAccounts} 
              disabled={bankAccounts.isLoading}
              className="w-full"
            >
              {bankAccounts.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tester Comptes
            </Button>
            {bankAccounts.error && (
              <p className="text-red-500 text-xs mt-2">{bankAccounts.error}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Complet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Exécuter tous les tests en une fois
          </p>
          <Button onClick={runAllTests} className="w-full">
            Lancer tous les tests
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Ouvrez la console du navigateur pour voir les résultats des tests</p>
            <p>2. Vérifiez que le backend est démarré et accessible</p>
            <p>3. Assurez-vous d'être connecté en tant qu'admin</p>
            <p>4. Les erreurs seront affichées dans la console et sur cette page</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTestPage;
