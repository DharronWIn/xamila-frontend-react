// ==================== EXEMPLE D'UTILISATION DES APIs ====================
// Ce fichier montre comment utiliser les nouveaux hooks API

import React, { useEffect, useState } from 'react';
import {
    useAuth,
    useChallenges, useNotifications
} from './hooks';

// ==================== EXEMPLE DE COMPOSANT DE CONNEXION ====================
export function LoginExample() {
  const { login, register, user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        login: formData.email,
        password: formData.password
      });
      console.log('Connexion réussie!');
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      console.log('Inscription réussie!');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Bonjour {user?.firstName}!</h2>
          <p>Email: {user?.email}</p>
          <p>Statut: {user?.isPremium ? 'Premium' : 'Gratuit'}</p>
        </div>
      ) : (
        <div>
          <h2>Connexion</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="submit">Se connecter</button>
          </form>

          <h2>Inscription</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button type="submit">S'inscrire</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==================== EXEMPLE DE DASHBOARD ====================
export function DashboardExample() {
  const { user, isAuthenticated } = useAuth();
  const { challenges, getChallenges, isLoading: challengesLoading } = useChallenges();
  const { transactions, getTransactions, isLoading: transactionsLoading } = useTransactions();
  const { posts, getPosts, isLoading: postsLoading } = usePosts();
  const { notifications, unreadCount, getNotifications } = useNotifications();

  useEffect(() => {
    if (isAuthenticated) {
      getChallenges();
      getTransactions();
      getPosts();
      getNotifications();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <h1>Dashboard - {user?.firstName}</h1>
      
      <div>
        <h2>Notifications ({unreadCount})</h2>
        {notifications.slice(0, 5).map(notification => (
          <div key={notification.id}>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>

      <div>
        <h2>Mes Challenges</h2>
        {challengesLoading ? (
          <div>Chargement des challenges...</div>
        ) : (
          challenges.slice(0, 3).map(challenge => (
            <div key={challenge.id}>
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              <p>Progression: {challenge.currentAmount}/{challenge.targetAmount}</p>
            </div>
          ))
        )}
      </div>

      <div>
        <h2>Dernières Transactions</h2>
        {transactionsLoading ? (
          <div>Chargement des transactions...</div>
        ) : (
          transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id}>
              <span>{transaction.amount} FCFA</span>
              <span> - {transaction.category}</span>
              <span> ({transaction.type})</span>
            </div>
          ))
        )}
      </div>

      <div>
        <h2>Feed Social</h2>
        {postsLoading ? (
          <div>Chargement des posts...</div>
        ) : (
          posts.slice(0, 3).map(post => (
            <div key={post.id}>
              <h4>{post.user.firstName} {post.user.lastName}</h4>
              <p>{post.content}</p>
              <span>Likes: {post.likesCount}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== EXEMPLE DE GESTION DES CHALLENGES ====================
export function ChallengesExample() {
  const { 
    challenges, 
    getChallenges, 
    createChallenge, 
    isLoading 
  } = useChallenges();
  
  const { 
    joinChallenge, 
    leaveChallenge 
  } = useChallengeParticipants('challenge-id');

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    type: 'monthly' as const
  });

  useEffect(() => {
    getChallenges();
  }, []);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChallenge({
        ...newChallenge,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        rewards: ['Certificat de participation']
      });
      setNewChallenge({ title: '', description: '', targetAmount: 0, type: 'monthly' });
      getChallenges(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge({ goalAmount: 1000 });
      console.log('Challenge rejoint!');
    } catch (error) {
      console.error('Erreur lors de la participation:', error);
    }
  };

  return (
    <div>
      <h2>Gestion des Challenges</h2>
      
      <form onSubmit={handleCreateChallenge}>
        <h3>Créer un nouveau challenge</h3>
        <input
          type="text"
          placeholder="Titre"
          value={newChallenge.title}
          onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
          required
        />
        <textarea
          placeholder="Description"
          value={newChallenge.description}
          onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Montant cible"
          value={newChallenge.targetAmount}
          onChange={(e) => setNewChallenge({...newChallenge, targetAmount: Number(e.target.value)})}
          required
        />
        <select
          value={newChallenge.type}
          onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as any})}
        >
          <option value="monthly">Mensuel</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="daily">Quotidien</option>
        </select>
        <button type="submit">Créer le challenge</button>
      </form>

      <div>
        <h3>Challenges disponibles</h3>
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h4>{challenge.title}</h4>
              <p>{challenge.description}</p>
              <p>Montant cible: {challenge.targetAmount} FCFA</p>
              <p>Type: {challenge.type}</p>
              <p>Participants: {challenge.participantCount}</p>
              <button onClick={() => handleJoinChallenge(challenge.id)}>
                Rejoindre
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== EXEMPLE D'UTILISATION DES TRANSACTIONS ====================
export function FinancialExample() {
  const { 
    transactions, 
    createTransaction, 
    getTransactions, 
    isLoading 
  } = useTransactions();
  
  const { 
    stats, 
    getStats 
  } = useTransactionStats();

  const [newTransaction, setNewTransaction] = useState({
    amount: 0,
    type: 'INCOME' as const,
    category: 'Salaire',
    description: ''
  });

  useEffect(() => {
    getTransactions();
    getStats();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction(newTransaction);
      setNewTransaction({ amount: 0, type: 'INCOME', category: 'Salaire', description: '' });
      getTransactions(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  return (
    <div>
      <h2>Gestion Financière</h2>
      
      <div>
        <h3>Statistiques</h3>
        {stats && (
          <div>
            <p>Revenus totaux: {stats.totalIncome} FCFA</p>
            <p>Dépenses totales: {stats.totalExpenses} FCFA</p>
            <p>Solde net: {stats.netAmount} FCFA</p>
          </div>
        )}
      </div>

      <form onSubmit={handleCreateTransaction}>
        <h3>Ajouter une transaction</h3>
        <input
          type="number"
          placeholder="Montant"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
          required
        />
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as any})}
        >
          <option value="INCOME">Revenu</option>
          <option value="EXPENSE">Dépense</option>
        </select>
        <input
          type="text"
          placeholder="Catégorie"
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
        />
        <button type="submit">Ajouter</button>
      </form>

      <div>
        <h3>Historique des transactions</h3>
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <span>{transaction.amount} FCFA</span>
              <span> - {transaction.category}</span>
              <span> ({transaction.type})</span>
              {transaction.description && <p>{transaction.description}</p>}
              <small>{new Date(transaction.date).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
