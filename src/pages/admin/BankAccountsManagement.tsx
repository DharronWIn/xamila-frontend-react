import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Users,
  Search, Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart, MoreHorizontal,
  CheckCircle,
  XCircle, Building2,
  Shield,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/apiComponent/hooks/useAuth";
import { useAdminBankAccounts } from "@/lib/apiComponent/hooks/useAdmin";
import { BankAccountStats } from "@/types/admin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { toast } from "sonner";

// Type pour les données affichées dans le composant
interface BankAccountDisplayData {
  id: string;
  userName: string;
  userEmail: string;
  bankName: string;
  bankCode: string;
  accountType: string;
  accountNumber: string;
  balance?: number;
  currency?: string;
  status: string;
  isVerified: boolean;
  country?: string;
  connectionDate?: string;
  lastSync?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Interface pour les comptes bancaires (utilisée pour le typage local)
interface BankAccount {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'investment';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'pending' | 'expired';
  lastSync: string;
  connectionDate: string;
  isVerified: boolean;
  bankCode: string;
  country: string;
}

const BankAccountsManagement = () => {
  const { user: currentUser } = useAuth();
  
  // Utilisation des hooks admin
  const {
    applications,
    isLoading,
    error,
    getApplications: getBankAccounts,
    getApplicationStats: getBankAccountStats,
    approveApplication: approveBankAccount,
    rejectApplication: rejectBankAccount
  } = useAdminBankAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<BankAccountDisplayData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [stats, setStats] = useState<BankAccountStats | null>(null);

  // Données mockées temporaires en attendant l'implémentation complète de l'API
  const mockBankAccounts: BankAccountDisplayData[] = useMemo(() => [
    {
      id: '1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      bankName: 'Ecobank',
      bankCode: 'ECO',
      accountType: 'CHECKING',
      accountNumber: '1234567890',
      balance: 150000,
      currency: 'FCFA',
      status: 'ACTIVE',
      isVerified: true,
      country: 'Bénin',
      connectionDate: '2024-01-15',
      lastSync: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      bankName: 'UBA',
      bankCode: 'UBA',
      accountType: 'SAVINGS',
      accountNumber: '0987654321',
      balance: 75000,
      currency: 'FCFA',
      status: 'PENDING',
      isVerified: false,
      country: 'Bénin',
      connectionDate: '2024-01-18',
      lastSync: '2024-01-19T14:20:00Z'
    }
  ], []);

  // Utiliser les données du hook ou des données mockées
  const bankAccounts: BankAccountDisplayData[] = applications && applications.length > 0 ? applications as BankAccountDisplayData[] : mockBankAccounts;

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const [accountsData, statsData] = await Promise.all([
          getBankAccounts(),
          getBankAccountStats()
        ]);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Utiliser les données mockées en cas d'erreur
        setStats({
          totalApplications: mockBankAccounts.length,
          pendingApplications: mockBankAccounts.filter(a => a.status === 'PENDING').length,
          approvedApplications: mockBankAccounts.filter(a => a.status === 'ACTIVE').length,
          rejectedApplications: mockBankAccounts.filter(a => a.status === 'REJECTED').length,
          approvalRate: 50,
          averageProcessingTime: 2,
          monthlyApplications: []
        });
      }
    };

    loadData();
  }, [getBankAccounts, getBankAccountStats, mockBankAccounts]);

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les comptes bancaires.</p>
        </div>
      </div>
    );
  }

  if (isLoading && bankAccounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des comptes bancaires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Filter accounts
  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = account.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.bankName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    const matchesBank = bankFilter === 'all' || account.bankCode === bankFilter;
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesBank && matchesType;
  });

  // Calculate stats - utiliser les données du backend ou les données locales
  const totalAccounts = stats?.totalApplications || bankAccounts.length;
  const activeAccounts = stats?.approvedApplications || bankAccounts.filter(a => a.status === 'APPROVED').length;
  const pendingAccounts = stats?.pendingApplications || bankAccounts.filter(a => a.status === 'PENDING').length;
  const suspendedAccounts = stats?.rejectedApplications || bankAccounts.filter(a => a.status === 'REJECTED').length;
  const verifiedAccounts = bankAccounts.filter(a => a.status === 'APPROVED').length;
  const totalBalance = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const bankStats = bankAccounts.reduce((acc, account) => {
    acc[account.bankName] = (acc[account.bankName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeStats = bankAccounts.reduce((acc, account) => {
    acc[account.accountType] = (acc[account.accountType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Helper functions
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Compte courant';
      case 'savings':
        return 'Compte épargne';
      case 'investment':
        return 'Compte investissement';
      default:
        return 'Compte';
    }
  };

  const bankData = Object.entries(bankStats).map(([bank, count], index) => ({
    name: bank,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const typeData = Object.entries(typeStats).map(([type, count], index) => ({
    name: getAccountTypeLabel(type),
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  const balanceData = bankAccounts.map(account => ({
    name: account.userName,
    balance: account.balance || 0,
    currency: account.currency || 'EUR',
  })).sort((a, b) => b.balance - a.balance).slice(0, 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getBankIcon = (bankCode: string) => {
    switch (bankCode) {
      case 'CA':
        return <Building2 className="w-4 h-4 text-green-600" />;
      case 'BNP':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'SG':
        return <Building2 className="w-4 h-4 text-red-600" />;
      case 'BP':
        return <Building2 className="w-4 h-4 text-orange-600" />;
      case 'ECO':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const uniqueBanks = [...new Set(bankAccounts.map(a => a.bankCode))];

  // Fonctions de gestion
  const handleApproveAccount = async (accountId: string) => {
    try {
      await approveBankAccount(accountId);
      toast.success('Compte bancaire approuvé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'approbation du compte');
    }
  };

  const handleRejectAccount = async (accountId: string) => {
    try {
     //await rejectBankAccount(accountId, { reason: 'Compte rejeté par l\'administrateur' });
      toast.success('Compte bancaire rejeté');
    } catch (error) {
      toast.error('Erreur lors du rejet du compte');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Comptes Bancaires</h1>
          <p className="text-gray-600 mt-1">
            Suivi et gestion des comptes bancaires connectés
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total comptes</p>
                <p className="text-2xl font-bold text-blue-600">{totalAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Comptes actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vérifiés</p>
                <p className="text-2xl font-bold text-purple-600">{verifiedAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Solde total</p>
                <p className="text-2xl font-bold text-orange-600">{totalBalance ? totalBalance.toLocaleString() : '0'}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bank Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    <span>Répartition par banque</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bankData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={bankData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {bankData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} comptes`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Types Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Types de comptes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({name, percentage}) => `${name} ${percentage?.toFixed(1)}%`}
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} comptes`, '']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      Aucune donnée à afficher
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres et recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher par utilisateur, email ou banque..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={bankFilter} onValueChange={setBankFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Banque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les banques</SelectItem>
                      {uniqueBanks.map((bankCode: string) => {
                        const bank = bankAccounts.find(a => a.bankCode === bankCode);
                        return (
                          <SelectItem key={bankCode} value={bankCode}>
                            {bank?.bankName || bankCode}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="checking">Compte courant</SelectItem>
                      <SelectItem value="savings">Compte épargne</SelectItem>
                      <SelectItem value="investment">Compte investissement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Accounts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Comptes bancaires ({filteredAccounts.length})</span>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Banque</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Solde</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Vérifié</TableHead>
                        <TableHead>Dernière sync</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{account.userName}</p>
                                <p className="text-xs text-gray-500">{account.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getBankIcon(account.bankCode)}
                              <span className="text-sm">{account.bankName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getAccountTypeLabel(account.accountType)}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">{account.accountNumber}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{account.balance ? account.balance.toLocaleString() : '0'} {account.currency || 'FCFA'}</span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account.status)}
                          </TableCell>
                          <TableCell>
                            {account.isVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(account.lastSync).toLocaleDateString('fr-FR')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedAccount(account);
                                    setIsViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {account.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleApproveAccount(account.id)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approuver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRejectAccount(account.id)}>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeter
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Balances */}
              <Card>
                <CardHeader>
                  <CardTitle>Top soldes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={balanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}€`, 'Solde']} />
                      <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé des statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Comptes actifs</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="font-medium">{activeAccounts}</span>
                        <span className="text-sm text-gray-500">
                          ({totalAccounts > 0 ? ((activeAccounts / totalAccounts) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En attente</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="font-medium">{pendingAccounts}</span>
                        <span className="text-sm text-gray-500">
                          ({totalAccounts > 0 ? ((pendingAccounts / totalAccounts) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Suspendus</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="font-medium">{suspendedAccounts}</span>
                        <span className="text-sm text-gray-500">
                          ({totalAccounts > 0 ? ((suspendedAccounts / totalAccounts) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Vérifiés</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="font-medium">{verifiedAccounts}</span>
                        <span className="text-sm text-gray-500">
                          ({totalAccounts > 0 ? ((verifiedAccounts / totalAccounts) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Account Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du compte bancaire</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Utilisateur</label>
                  <p className="text-sm">{selectedAccount.userName}</p>
                  <p className="text-xs text-gray-500">{selectedAccount.userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Banque</label>
                  <div className="flex items-center space-x-1">
                    {getBankIcon(selectedAccount.bankCode)}
                    <span className="text-sm">{selectedAccount.bankName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type de compte</label>
                  <p className="text-sm">{getAccountTypeLabel(selectedAccount.accountType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Numéro de compte</label>
                  <p className="text-sm font-mono">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Solde</label>
                  <p className="text-sm font-bold">{selectedAccount.balance ? selectedAccount.balance.toLocaleString() : '0'} {selectedAccount.currency || 'FCFA'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedAccount.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vérifié</label>
                  <div className="flex items-center space-x-1">
                    {selectedAccount.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Oui</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Non</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pays</label>
                  <p className="text-sm">{selectedAccount.country}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date de connexion</label>
                <p className="text-sm">{new Date(selectedAccount.connectionDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Dernière synchronisation</label>
                <p className="text-sm">{selectedAccount.lastSync ? new Date(selectedAccount.lastSync).toLocaleString('fr-FR') : 'Non disponible'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BankAccountsManagement;
