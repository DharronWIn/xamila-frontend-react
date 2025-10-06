import jsPDF from 'jspdf';
import { User } from '@/stores/authStore';
import { SavingsGoal } from '@/stores/savingsStore';

export interface CertificateData {
  userName: string;
  userEmail: string;
  challengeStartDate: string;
  challengeEndDate: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  completionDate?: string;
  certificateType: 'engagement' | 'success';
}

export class CertificateGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('landscape', 'mm', 'a4');
  }

  generateEngagementDocument(data: CertificateData): void {
    const { userName, userEmail, challengeStartDate, challengeEndDate, targetAmount } = data;
    
    // Configuration de la page
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    
    // Couleurs
    const primaryColor = '#10B981'; // Vert
    const secondaryColor = '#1F2937'; // Gris foncé
    const textColor = '#374151'; // Gris moyen
    
    // Header avec logo et titre
    this.doc.setFillColor(primaryColor);
    this.doc.rect(0, 0, pageWidth, 40, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CHALLENGE D\'ÉPARGNE', pageWidth / 2, 20, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Document d\'Engagement Personnel', pageWidth / 2, 30, { align: 'center' });
    
    // Contenu principal
    this.doc.setTextColor(textColor);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    let yPosition = 60;
    
    // Informations du participant
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text('INFORMATIONS DU PARTICIPANT', 20, yPosition);
    yPosition += 15;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.text(`Nom complet : ${userName}`, 20, yPosition);
    yPosition += 8;
    this.doc.text(`Email : ${userEmail}`, 20, yPosition);
    yPosition += 8;
    this.doc.text(`Période du challenge : ${this.formatDate(challengeStartDate)} au ${this.formatDate(challengeEndDate)}`, 20, yPosition);
    yPosition += 8;
    this.doc.text(`Objectif d'épargne : ${targetAmount.toLocaleString('fr-FR')} FCFA`, 20, yPosition);
    yPosition += 20;
    
    // Engagement
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text('ENGAGEMENT PERSONNEL', 20, yPosition);
    yPosition += 15;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    
    const engagementText = [
      'Je soussigné(e) ' + userName + ', m\'engage solennellement à :',
      '',
      '1. Respecter rigoureusement mon objectif d\'épargne de ' + targetAmount.toLocaleString('fr-FR') + ' FCFA',
      '2. Effectuer des dépôts réguliers selon mon plan d\'épargne',
      '3. Suivre les conseils et recommandations de l\'application',
      '4. Participer activement à la communauté du challenge',
      '5. Tenir un suivi rigoureux de mes finances personnelles',
      '6. Ne pas effectuer de retraits non justifiés pendant la durée du challenge',
      '',
      'Je comprends que cet engagement est un contrat moral avec moi-même et que',
      'le respect de ces engagements est essentiel pour atteindre mes objectifs financiers.',
      '',
      'En signant ce document, je confirme ma détermination à réussir ce challenge',
      'et à transformer mes habitudes financières de manière durable.'
    ];
    
    engagementText.forEach(line => {
      if (yPosition > pageHeight - 40) {
        this.doc.addPage();
        yPosition = 20;
      }
      this.doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 20;
    
    // Signature
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Signature :', 20, yPosition);
    yPosition += 20;
    this.doc.text('_________________________', 20, yPosition);
    yPosition += 5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(userName, 20, yPosition);
    yPosition += 5;
    this.doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    
    // Footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Challenge d\'Épargne - Document généré le ' + new Date().toLocaleString('fr-FR'), pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Téléchargement
    this.doc.save(`Document_Engagement_${userName.replace(/\s+/g, '_')}.pdf`);
  }

  generateSuccessCertificate(data: CertificateData): void {
    const { userName, userEmail, challengeStartDate, challengeEndDate, targetAmount, currentAmount, progressPercentage, completionDate } = data;
    
    // Configuration de la page
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    
    // Couleurs
    const primaryColor = '#10B981'; // Vert
    const goldColor = '#F59E0B'; // Or
    const secondaryColor = '#1F2937'; // Gris foncé
    const textColor = '#374151'; // Gris moyen
    
    // Header avec logo et titre
    this.doc.setFillColor(primaryColor);
    this.doc.rect(0, 0, pageWidth, 50, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🏆 CERTIFICAT DE RÉUSSITE 🏆', pageWidth / 2, 25, { align: 'center' });
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Challenge d\'Épargne', pageWidth / 2, 40, { align: 'center' });
    
    // Cercle décoratif
    this.doc.setDrawColor(goldColor);
    this.doc.setLineWidth(3);
    this.doc.circle(pageWidth / 2, pageHeight / 2 - 20, 60, 'S');
    
    // Contenu principal
    this.doc.setTextColor(textColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Ceci certifie que', pageWidth / 2, pageHeight / 2 - 40, { align: 'center' });
    
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(primaryColor);
    this.doc.text(userName, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(textColor);
    this.doc.text('a réussi avec succès le Challenge d\'Épargne', pageWidth / 2, pageHeight / 2, { align: 'center' });
    
    // Détails du challenge
    this.doc.setFontSize(12);
    this.doc.text(`Période : ${this.formatDate(challengeStartDate)} - ${this.formatDate(challengeEndDate)}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
    this.doc.text(`Objectif : ${targetAmount.toLocaleString('fr-FR')} FCFA`, pageWidth / 2, pageHeight / 2 + 35, { align: 'center' });
    this.doc.text(`Montant épargné : ${currentAmount.toLocaleString('fr-FR')} FCFA`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });
    this.doc.text(`Progression : ${progressPercentage.toFixed(1)}%`, pageWidth / 2, pageHeight / 2 + 65, { align: 'center' });
    
    // Date de complétion
    if (completionDate) {
      this.doc.text(`Date de complétion : ${this.formatDate(completionDate)}`, pageWidth / 2, pageHeight / 2 + 80, { align: 'center' });
    }
    
    // Signature
    this.doc.setFontSize(10);
    this.doc.text('Signature du Directeur du Challenge', pageWidth - 80, pageHeight - 40);
    this.doc.text('_________________________', pageWidth - 80, pageHeight - 30);
    this.doc.text('Challenge d\'Épargne', pageWidth - 80, pageHeight - 20);
    
    // Footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Certificat généré le ' + new Date().toLocaleString('fr-FR'), pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Téléchargement
    this.doc.save(`Certificat_Reussite_${userName.replace(/\s+/g, '_')}.pdf`);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export const generateEngagementDocument = (user: User, goal: SavingsGoal): void => {
  const generator = new CertificateGenerator();
  
  const certificateData: CertificateData = {
    userName: user.name,
    userEmail: user.email,
    challengeStartDate: goal.startDate,
    challengeEndDate: goal.endDate,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
    certificateType: 'engagement'
  };
  
  generator.generateEngagementDocument(certificateData);
};

export const generateSuccessCertificate = (user: User, goal: SavingsGoal): void => {
  const generator = new CertificateGenerator();
  
  const certificateData: CertificateData = {
    userName: user.name,
    userEmail: user.email,
    challengeStartDate: goal.startDate,
    challengeEndDate: goal.endDate,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
    completionDate: new Date().toISOString(),
    certificateType: 'success'
  };
  
  generator.generateSuccessCertificate(certificateData);
};




