# 🛣️ User Journeys - WinMarket V2

**Document Version :** 1.0
**Date :** 30 Mai 2026
**Basé sur :** PRD WinMarket V2

---

## 👥 Types d'Utilisateurs

### 🛒 **Acheteurs (Buyers)**
- Recherchent et achètent des produits
- Gèrent leur wallet et historique commandes
- Laissent des reviews et communiquent avec vendeurs

### 🏪 **Vendeurs (Sellers)**
- Vendent leurs produits sur la marketplace
- Gèrent stock, commandes et livraisons
- Configurent leurs livreurs partenaires

### ⚙️ **Administrateurs (Admins)**
- Modèrent la plateforme
- Gèrent les configurations et analytics
- Traitent les signalements

---

## 🛒 **JOURNEY 1 : Acheteur - Première Visite & Achat**

### **Phase 1 : Découverte (Visiteur Anonyme)**
```
🌐 Page d'accueil → Catalogue → Produit → Inscription
```

#### **Étape 1.1 : Arrivée sur WinMarket**
**Déclencheur :** Lien partagé, recherche Google, publicité
**Canal :** Web ou Mobile
**Écran :** Page d'accueil

**Actions possibles :**
- Parcourir les produits vedettes
- Utiliser la barre de recherche
- Explorer par catégories
- Voir les témoignages/avis

**Points de friction potentiels :**
- Pas de compte → limité dans la navigation approfondie
- Prix non visibles sans inscription ? (à clarifier)

#### **Étape 1.2 : Navigation Catalogue**
**Écrans :** Liste produits, filtres, recherche

**Actions :**
- Filtrer par prix, catégorie, localisation
- Rechercher par mot-clé
- Voir aperçu produits (prix, photos, vendeur)
- Cliquer sur un produit qui l'intéresse

**Informations affichées :**
- Prix du produit
- Photos principales
- Nom du vendeur
- Note/avis si disponibles
- Badge "Retrait gratuit disponible"

#### **Étape 1.3 : Page Produit (Détail)**
**Écran :** Détail produit

**Informations consultées :**
- Description complète
- Galerie photos
- Options de livraison :
  - Retrait gratuit (adresse vendeur)
  - Options livreurs avec prix et délais
- Avis clients existants
- Profil vendeur (note, localisation)

**Call-to-Action :** Bouton "Acheter maintenant" ou "Ajouter au panier"

**Friction :** Doit créer un compte pour acheter

#### **Étape 1.4 : Inscription**
**Déclencheur :** Clic sur "Acheter" sans compte
**Écran :** Modal ou page d'inscription

**Informations requises :**
- Email
- Mot de passe
- Prénom/Nom
- Adresse (pour livraisons)
- Téléphone (optionnel)

**Options supplémentaires :**
- Inscription via Google/Facebook
- Acceptation CGU et politique confidentialité
- Newsletter (opt-in)

**Note :** Compte unique hybride (acheteur ET vendeur potentiel)

### **Phase 2 : Premier Achat**

#### **Étape 2.1 : Onboarding Tutoriel**
**Écran :** Séquence d'onboarding interactive

**Contenu du tutoriel :**
1. **Bienvenue sur WinMarket** - Vision de la marketplace
2. **Votre compte hybride** - Achetez ET vendez facilement
3. **Comment acheter** - Découverte, wallet, livraison
4. **Comment vendre** - Ajoutez vos produits, gérez vos commandes
5. **Votre wallet** - Rechargez, achetez, recevez vos ventes
6. **Communication** - Chat avec vendeurs, service client disponible

**Actions :**
- Navigation guidée (5-6 écrans)
- Possibilité de passer ("Skip")
- Configuration préférences de base

**État système :**
- Wallet créé automatiquement (solde : 0€, pas de crédit de bienvenue)
- Email de bienvenue envoyé
- Profil configuré pour achat ET vente potentielle

#### **Étape 2.2 : Retour au Produit & Validation**
**Écran :** Page produit (connecté)

**Nouvelles possibilités :**
- Contacter le vendeur (chat) - disponible avant ET après achat
- Contacter le service client WinMarket si besoin
- Voir plus d'informations vendeur
- Procéder à l'achat

**Actions :**
- Sélectionner quantité
- Choisir option livraison :
  - Retrait gratuit
  - Livraison (sélectionner livreur/prix)
- Cliquer "Ajouter au panier" ou "Acheter maintenant"

#### **Étape 2.3 : Panier & Checkout**
**Écran :** Panier puis Checkout

**Informations affichées :**
- Récapitulatif produit(s)
- Option livraison choisie
- Total = Prix produit + Frais livraison
- **Commission NOT visible pour l'acheteur**

**Problème :** Wallet vide (solde insuffisant)

#### **Étape 2.4 : Recharge Wallet**
**Écran :** Page wallet / recharge

**Process :**
1. Sélectionner montant à recharger
2. Choisir provider de paiement :
   - Carte bancaire
   - PayPal
   - Virement bancaire
3. Effectuer paiement externe
4. Retour sur WinMarket avec wallet rechargé

#### **Étape 2.5 : Finalisation Commande**
**Écran :** Checkout final

**Actions :**
- Confirmer adresse livraison (si livraison)
- Valider commande
- Paiement automatique depuis wallet

**Résultat :**
- Commande créée (status: PAID)
- Notification vendeur
- Email confirmation acheteur
- Redirection vers suivi commande

### **Phase 3 : Suivi & Réception**

#### **Étape 3.1 : Attente Préparation**
**Notifications :** Email + Push (mobile)
**Écran :** Page "Mes Commandes"

**Informations disponibles :**
- Statut commande : "En préparation"
- Contact vendeur possible
- Estimation délai

#### **Étape 3.2 : Expédition/Préparation Retrait**
**Notification :** Changement statut
**Informations :**
- Si livraison : Numéro tracking + transporteur
- Si retrait : Adresse et horaires vendeur

#### **Étape 3.3 : Réception**
**Actions possibles :**
- Marquer comme "Reçu" (si auto-détection pas activée)
- Laisser un avis produit
- Contacter vendeur en cas problème

**État final :** Commande "COMPLETED"

---

## 🏪 **JOURNEY 2 : Vendeur - Première Vente**

### **Phase 1 : Inscription Vendeur**

#### **Étape 1.1 : Décision de Vendre**
**Déclencheurs :**
- Page "Devenir vendeur"
- Publicité
- Bouche à oreille

**Page :** Landing page vendeurs
**Informations :**
- Avantages de vendre sur WinMarket
- Commission transparente
- Processus simple
- Témoignages vendeurs

#### **Étape 1.2 : Activation Mode Vendeur**
**Contexte :** Compte déjà créé, activation vente

**Actions :**
- Clic "Commencer à vendre" depuis profil
- Ajout informations vendeur :
  - Nom d'entreprise ou activité
  - Adresse de retrait/stock
  - Description activité
  - Horaires de retrait
  - Coordonnées contact

**Activation immédiate :**
- Aucune vérification préalable (MVP)
- Possibilité de vendre tous types de produits
- Pas de modération à l'inscription

### **Phase 2 : Configuration Initiale**

#### **Étape 2.1 : Setup Profil Vendeur**
**Écrans :** Dashboard vendeur - Première connexion

**Configuration obligatoire :**
- Photo/logo
- Description activité
- Horaires d'ouverture (pour retrait)
- Coordonnées contact

**Configuration optionnelle :**
- Liens réseaux sociaux
- Politique retours
- Conditions de vente

#### **Étape 2.2 : Configuration Livraisons**
**Écran :** Gestion livraisons

**Étapes :**
1. **Retrait gratuit** (obligatoire) :
   - Confirmer adresse de retrait
   - Définir horaires d'ouverture
   - Instructions spéciales

2. **Livreurs partenaires** (optionnel) :
   - **Gestion 100% vendeur** - Aucun annuaire plateforme
   - Ajouter livreur(s) personnels :
     - Nom/Contact livreur
     - Zones de livraison (sans restriction géographique)
     - Tarifs fixés par le vendeur
     - Délais moyens estimés
   - Activer/désactiver selon disponibilité

### **Phase 3 : Premier Produit**

#### **Étape 3.1 : Création Produit**
**Écran :** Formulaire produit

**Informations requises :**
- Titre produit
- Description détaillée
- Prix de vente
- Photos (minimum 1, recommandé 3-5)
- Catégorie
- Stock initial
- Poids/dimensions (pour calcul livraison)

**Aperçu :** Prévisualisation page produit côté acheteur

#### **Étape 3.2 : Configuration Livraison Produit**
**Écran :** Options livraison pour ce produit

**Choix disponibles :**
- Retrait uniquement
- Retrait + livreurs configurés
- Sélectionner quels livreurs pour ce produit

#### **Étape 3.3 : Publication**
**Action :** Clic "Publier"
**Résultat :**
- **Publication immédiate** - Aucune modération préalable (MVP)
- Produit visible instantanément sur marketplace
- **Tous types de produits autorisés** dans le MVP
- Indexé dans recherche
- Accessible via URL directe

### **Phase 4 : Première Vente**

#### **Étape 4.1 : Notification Nouvelle Commande**
**Canaux :** Email + Push + Dashboard
**Informations :**
- Détails commande
- Info acheteur (nom, contact)
- Option livraison choisie
- Montant reçu (prix - commission)

#### **Étape 4.2 : Traitement Commande**
**Écran :** Détail commande vendeur

**Actions possibles :**
- Marquer "En préparation"
- Communiquer avec acheteur
- Si livraison : Contacter livreur
- Ajouter notes internes

#### **Étape 4.3 : Expédition/Retrait**
**Si retrait :**
- Attendre venue acheteur
- Marquer "Récupéré" à la remise

**Si livraison :**
- Remettre au livreur
- Ajouter infos tracking
- Marquer "Expédié"

#### **Étape 4.4 : Finalisation & Paiement**
**État final :** Commande "DELIVERED"
**Résultat :**
- Argent définitivement crédité wallet vendeur
- Possibilité retrait vers compte bancaire
- Historique vente enregistré

---

## ⚙️ **JOURNEY 3 : Admin - Gestion & Support**

### **Gestion Quotidienne (MVP)**

#### **Dashboard Analytics**
**Écran :** Tableau de bord admin

**Métriques visibles :**
- Nouvelles inscriptions (comptes hybrides)
- Commandes du jour
- Revenus commission
- Messages support en attente
- Alertes système

#### **Support Client**
**Rôle principal dans MVP :** Service client

**Actions quotidiennes :**
- Traiter demandes support utilisateurs
- Médiation conflits vendeur-acheteur
- Assistance technique (problèmes wallet, commandes)
- FAQ et documentation

#### **Gestion Utilisateurs (Réactif)**
**Contexte :** Pas de modération préventive

**Actions possibles :**
- Répondre aux signalements utilisateurs
- Suspendre compte en cas d'abus avéré
- Assistance récupération comptes
- Gestion litiges paiements

### **Configuration Plateforme**
- Ajustement taux commission
- Gestion providers paiement
- Paramètres généraux marketplace
- Configuration service client

---

## 📱 **JOURNEYS MULTI-CANAUX**

### **Web vs Mobile - Parité Complète**

#### **Parité Fonctionnelle**
**Principe :** Toutes les fonctionnalités disponibles sur web ET mobile
- Achat complet (recherche → paiement → suivi)
- Vente complète (ajout produit → gestion commandes)
- Gestion wallet identique
- Service client accessible partout
- Interface en français (évolution multilingue prévue)

#### **Optimisations Spécifiques**

**Web (Desktop/Tablet)**
- Interface élargie pour tableaux de bord vendeur
- Upload multiple photos facilité
- Vision d'ensemble commandes/analytics

**Mobile (iOS/Android)**
- Notifications push natives
- Photos directes via appareil photo
- Géolocalisation pour vendeurs proches
- Navigation touch optimisée

### **Notifications Push (Mobile)**
**Acheteurs :**
- Commande confirmée
- Changement statut livraison
- Message vendeur
- Réponse service client
- Promotions personnalisées

**Vendeurs :**
- Nouvelle commande
- Message acheteur
- Paiement reçu wallet
- Rappels stock bas

**Support Client :**
- Nouveau ticket support
- Messages urgents utilisateurs

---

## 🎯 **POINTS DE FRICTION IDENTIFIÉS**

### **Côté Acheteur**
1. **Wallet vide** au premier achat → Recharge obligatoire
2. **Multiples vendeurs** dans panier → Frais livraison complexes
3. **Choix livraison** peut être confus si multiples options
4. **Onboarding** peut être sauté → fonctionnalités mal comprises

### **Côté Vendeur**
1. **Configuration livreurs** entièrement manuelle → complexité initiale
2. **Gestion zones géographiques** sans outils → estimation difficile
3. **Transition acheteur → vendeur** → courbe d'apprentissage
4. **Compréhension commission** lors première vente

### **Côté Admin/Support**
1. **Pas de modération préventive** → gestion réactive uniquement
2. **Support client** charge importante avec croissance
3. **Médiation conflits** sans règles strictes (MVP)
4. **Tous types produits** → complexité de support variable

---

## 🔄 **JOURNEYS SECONDAIRES**

### **Recharge Wallet Récurrente**
### **Gestion Multiple Commandes Vendeur**
### **Retour/Remboursement**
### **Support Client**
### **Parrainage/Recommandation**

---

## ✅ **CLARIFICATIONS APPORTÉES**

**Spécifications MVP confirmées :**

1. ✅ **Comptes hybrides** avec onboarding tutoriel
2. ✅ **Aucune vérification** vendeur, activation immédiate
3. ✅ **Gestion livreurs 100% vendeur** - aucun annuaire plateforme
4. ✅ **Service client WinMarket** + chat direct vendeur-acheteur
5. ✅ **Pas de modération préventive** - tous produits autorisés
6. ✅ **Parité web/mobile complète** - interface français (évolution multilingue)

## 🔍 **SPÉCIFICATIONS FINALES**

**Clarifications techniques finalisées :**

1. ✅ **Commandes séparées par vendeur** - Une commande = un vendeur
2. ✅ **Pas de politique retour MVP** - Gestion directe vendeur-acheteur
3. ✅ **Zones géographiques texte libre** - Saisie manuelle vendeur
4. ✅ **Providers paiement manuels** - Intégration custom par développeur
5. 🔄 **Architecture chat** - Analyse des options techniques ci-dessous

## 💬 **RECOMMANDATION ARCHITECTURE CHAT**

### **Option Recommandée : Polling Intelligent + WebSocket Hybride**

#### **Pourquoi cette approche ?**
1. **Simplicité MVP** - Implementation rapide avec upgrade facile
2. **Coût infrastructure** - Moins de ressources serveur
3. **Compatibilité mobile** - Fonctionne parfaitement sur React Native
4. **Évolutivité** - Migration vers full WebSocket selon croissance

#### **Architecture Technique Proposée**

**Phase 1 : Polling Intelligent (MVP)**
```typescript
// Polling optimisé pour WinMarket
const useChat = (conversationId: string) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // Fetch nouveaux messages depuis dernière requête
      const newMessages = await fetchMessages(conversationId, lastMessageId);
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
        // Notification si app en background
      }
    }, 2000); // Poll toutes les 2 secondes pendant conversation active

    return () => clearInterval(pollInterval);
  }, [conversationId]);
};
```

**Avantages MVP :**
- ✅ **Simple à implémenter** - GraphQL mutations/queries standard
- ✅ **Pas de WebSocket serveur** - Économie infrastructure
- ✅ **Compatible offline** - Messages queued automatiquement
- ✅ **Mobile friendly** - Pas de problème connexion

**Phase 2 : WebSocket pour temps réel (Post-MVP)**
```typescript
// Migration progressive WebSocket
const useChatRealtime = (conversationId: string) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isUserActive && hasActiveConversations) {
      // Connexion WebSocket seulement si nécessaire
      const ws = new WebSocket(`ws://api.winmarket.com/chat/${conversationId}`);
      setSocket(ws);
    }
  }, [conversationId, isUserActive]);
};
```

#### **Schema GraphQL Chat**
```graphql
type Conversation {
  id: ID!
  participants: [User!]!
  product: Product # Si conversation liée à un produit
  order: Order     # Si conversation liée à une commande
  messages: [Message!]!
  lastActivity: DateTime!
  isActive: Boolean!
}

type Message {
  id: ID!
  conversation: Conversation!
  sender: User!
  content: String!
  type: MessageType! # TEXT, IMAGE, ORDER_UPDATE, SUPPORT_TICKET
  readBy: [MessageRead!]!
  createdAt: DateTime!
}

type MessageRead {
  user: User!
  readAt: DateTime!
}

enum MessageType {
  TEXT
  IMAGE
  ORDER_UPDATE
  SUPPORT_TICKET
  SYSTEM_NOTIFICATION
}
```

#### **Flows Chat Intégrés**

**Déclencheurs de Conversation :**
1. **Page produit** → "Contacter vendeur"
2. **Commande existante** → "Message vendeur"
3. **Support client** → "Aide WinMarket"
4. **Notification** → Répondre à message reçu

**Types de Conversations :**
- **Pré-achat** : Questions produit, négociation, info livraison
- **Post-achat** : Suivi commande, problème, satisfaction
- **Support** : Aide technique, médiation, réclamation

### **Implementation Progressive**

#### **Sprint MVP : Chat Simple**
- Messages texte basique
- Polling 2-3 secondes
- Historique conversations
- Notifications push mobile

#### **Post-MVP : Chat Avancé**
- WebSocket temps réel
- Indicateurs "en train d'écrire"
- Partage photos
- Messages système automatiques
- Read receipts

#### **Phase Avancée : Chat Intelligence**
- Suggestions réponses vendeurs
- Traduction automatique (multilingue)
- Bot support FAQ
- Modération automatique contenu

Ces éléments finalisent complètement les user journeys et l'architecture technique ! 🎯
