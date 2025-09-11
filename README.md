# magicGuess - Jeu de Devinette Innovant

Un jeu de devinette de nombres moderne avec une interface visuelle époustouflante, intégrant Firebase pour l'authentification et la base de données.

## 🚀 Fonctionnalités

### ✨ Authentification Firebase
- Connexion email/mot de passe
- Authentification Google et Facebook
- Gestion des profils utilisateurs
- Sauvegarde automatique des données

### 🎮 Gameplay
- **3 niveaux de difficulté** avec thèmes visuels uniques
  - Facile (1-50) - 15 secondes
  - Moyen (1-100) - 25 secondes  
  - Difficile (1-500) - 50 secondes
- **Système de progression** avec XP, niveaux et badges
- **Statistiques détaillées** sauvegardées en temps réel
- **Classement global** avec leaderboard

### 🌐 Multijoueur
- **Mode Local** : Parties avec code à 4 chiffres sur le même réseau Wi-Fi
- **Mode En Ligne** : Matchmaking automatique avec joueurs du monde entier
- **Synchronisation temps réel** via Firebase Realtime Database
- **Gestion des tours** avec minuteur de 4 secondes par joueur
- **Chat en temps réel** avec messages rapides
- **Reconnexion automatique** en cas de déconnexion temporaire

### 🎨 Interface Utilisateur
- Design moderne avec effets de particules
- Animations fluides et micro-interactions
- Timer circulaire avec changements de couleur
- Thèmes adaptatifs par difficulté
- Interface responsive (mobile/desktop)

## 🔗 Mode Multijoueur Local

### Prérequis Techniques
- **Réseau Wi-Fi commun** : Les deux appareils doivent être connectés au même réseau Wi-Fi
- **Accès Internet** : Connexion aux serveurs Firebase requise
- **Pas de Bluetooth** : Aucun besoin de Bluetooth ou Wi-Fi Direct

### Fonctionnement
1. **Création de partie** : L'hôte crée une salle et reçoit un code à 4 chiffres
2. **Rejoindre** : L'autre joueur entre le code pour rejoindre la partie
3. **Synchronisation** : Firebase synchronise les états en temps réel
4. **Tour par tour** : Chaque joueur a 4 secondes pour faire sa tentative
5. **Résultats** : Affichage des scores et possibilité de revanche

### Limitations
- Fonctionne uniquement sur le même réseau Wi-Fi local
- Nécessite une connexion Internet stable pour Firebase
- Maximum 8 joueurs par partie

## 🛠️ Configuration Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)

2. Activez les services suivants :
   - **Authentication** (Email/Password, Google, Facebook)
   - **Firestore Database**
   - **Analytics** (optionnel)

3. Copiez `.env.example` vers `.env` et remplissez vos clés Firebase :

```bash
cp .env.example .env
```

4. Configurez les règles Firestore :

```javascript
// IMPORTANT: Copiez ces règles exactement dans votre console Firebase
// Console Firebase > Firestore Database > Règles
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs - lecture/écriture pour le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Pour le leaderboard
    }
    
    // Parties - écriture pour le propriétaire, lecture pour tous
    match /games/{gameId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

5. **IMPORTANT** : Configurez également les règles Firebase Realtime Database pour le multijoueur :

```json
// Console Firebase > Realtime Database > Règles
{
  "rules": {
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "chats": {
      ".read": "auth != null", 
      ".write": "auth != null"
    },
    ".read": "false",
    ".write": "false"
  }
}
```

## 🚨 RÉSOLUTION DES ERREURS D'AUTHENTIFICATION

Si vous rencontrez des erreurs de permissions, suivez ces étapes :

### Pour Firestore Database :
1. **Console Firebase** → **Firestore Database** → **Règles**
2. Copiez les règles Firestore ci-dessus
3. Cliquez sur **"Publier"**

### Pour Realtime Database (ESSENTIEL pour le multijoueur) :
1. **Console Firebase** → **Realtime Database** → **Règles**  
2. Copiez les règles Realtime Database ci-dessus
3. Cliquez sur **"Publier"**

Ces règles permettent aux utilisateurs authentifiés de :
- Lire et écrire leurs propres données de profil
- Lire les profils des autres utilisateurs (pour le classement)
- Créer et lire les enregistrements de parties
- **Accéder aux salles multijoueurs et au chat en temps réel**

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🏗️ Architecture

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables
│   ├── game/           # Composants de jeu
│   └── menu/           # Composants de menu
├── hooks/              # Hooks personnalisés
├── services/           # Services Firebase
├── config/             # Configuration
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔥 Services Firebase

### AuthService
- Gestion complète de l'authentification
- Support multi-providers (Email, Google, Facebook)
- Messages d'erreur traduits

### UserService  
- CRUD des profils utilisateurs
- Calcul automatique des statistiques
- Système de classement
- Sauvegarde des parties

## 🎯 Système de Points

- **Victoire solo** : (50 - tentatives) × multiplicateur difficulté
- **Bonus temps** : temps restant × 2
- **Niveaux** : 1000 XP par niveau (1-10), puis 2000 XP (11-25), puis 3000 XP (26+)

## 🏆 Badges Disponibles

- **Premier Succès** : Première victoire
- **Démon de Vitesse** : Temps de réaction < 5s
- **Maître de Précision** : Taux de victoire > 80%
- **Légende des Séries** : Série de 10+ victoires

## 🚀 Prochaines Fonctionnalités

- Mode multijoueur en temps réel
- Chat en jeu
- Tournois et événements
- Personnalisation d'avatars
- Mode hors ligne avec synchronisation

## 📱 Compatibilité

- Chrome, Firefox, Safari, Edge
- iOS Safari, Chrome Mobile  
- Responsive 320px → 2560px
- PWA ready

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.