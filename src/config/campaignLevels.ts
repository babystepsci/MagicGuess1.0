import type { CampaignLevel } from '../types/campaign';

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  // Chapitre 1: Les Bases
  {
    id: 'tutorial',
    name: 'Premier Contact',
    description: 'Apprenez les bases de la devinette',
    story: 'Bienvenue dans le monde mystérieux des nombres. Votre première mission : découvrir le nombre secret entre 1 et 10.',
    difficulty: 'easy',
    range: { min: 1, max: 10 },
    timeLimit: 30,
    xpReward: 100,
    theme: {
      primary: '#10B981',
      secondary: '#34D399',
      gradient: 'from-emerald-400 to-teal-400',
      particleColor: '#10B981',
      background: 'from-emerald-900 via-teal-900 to-emerald-900'
    }
  },
  
  {
    id: 'speed-test',
    name: 'Test de Vitesse',
    description: 'Trouvez le nombre en moins de 10 secondes',
    story: 'Le temps presse ! Un nombre se cache entre 1 et 25. Vous avez 10 secondes pour le découvrir.',
    difficulty: 'easy',
    range: { min: 1, max: 25 },
    timeLimit: 10,
    unlockRequirement: 'tutorial',
    xpReward: 150,
    theme: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      gradient: 'from-amber-400 to-orange-400',
      particleColor: '#F59E0B',
      background: 'from-amber-900 via-orange-900 to-amber-900'
    }
  },

  {
    id: 'precision-challenge',
    name: 'Défi de Précision',
    description: 'Seulement 3 tentatives autorisées',
    story: 'Votre précision sera mise à l\'épreuve. Vous n\'avez que 3 tentatives pour trouver le nombre entre 1 et 50.',
    difficulty: 'medium',
    range: { min: 1, max: 50 },
    timeLimit: 20,
    maxAttempts: 3,
    unlockRequirement: 'speed-test',
    xpReward: 200,
    theme: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      gradient: 'from-purple-400 to-indigo-400',
      particleColor: '#8B5CF6',
      background: 'from-purple-900 via-indigo-900 to-purple-900'
    }
  },

  // Chapitre 2: Règles Spéciales
  {
    id: 'even-numbers',
    name: 'Les Nombres Pairs',
    description: 'Seuls les nombres pairs sont acceptés',
    story: 'Dans cette dimension, seuls les nombres pairs existent. Trouvez le nombre secret parmi eux.',
    difficulty: 'medium',
    range: { min: 2, max: 100 },
    timeLimit: 25,
    specialRules: { evenOnly: true },
    unlockRequirement: 'precision-challenge',
    xpReward: 250,
    theme: {
      primary: '#06B6D4',
      secondary: '#67E8F9',
      gradient: 'from-cyan-400 to-blue-400',
      particleColor: '#06B6D4',
      background: 'from-cyan-900 via-blue-900 to-cyan-900'
    }
  },

  {
    id: 'multiples-of-five',
    name: 'Multiples de 5',
    description: 'Le nombre est un multiple de 5',
    story: 'Les anciens sages ne comptaient que par multiples de 5. Découvrez leur nombre secret.',
    difficulty: 'medium',
    range: { min: 5, max: 200 },
    timeLimit: 30,
    specialRules: { multiplesOf: 5 },
    unlockRequirement: 'even-numbers',
    xpReward: 300,
    theme: {
      primary: '#EC4899',
      secondary: '#F472B6',
      gradient: 'from-pink-400 to-rose-400',
      particleColor: '#EC4899',
      background: 'from-pink-900 via-rose-900 to-pink-900'
    }
  },

  {
    id: 'no-repeats',
    name: 'Pas de Répétition',
    description: 'Chaque tentative doit être unique',
    story: 'Dans ce labyrinthe numérique, vous ne pouvez pas revenir sur vos pas. Chaque nombre ne peut être tenté qu\'une fois.',
    difficulty: 'hard',
    range: { min: 1, max: 100 },
    timeLimit: 40,
    specialRules: { noRepeats: true },
    unlockRequirement: 'multiples-of-five',
    xpReward: 400,
    theme: {
      primary: '#EF4444',
      secondary: '#F87171',
      gradient: 'from-red-400 to-pink-400',
      particleColor: '#EF4444',
      background: 'from-red-900 via-pink-900 to-red-900'
    }
  },

  // Chapitre 3: Défis Ultimes
  {
    id: 'blind-mode',
    name: 'Mode Aveugle',
    description: 'Aucun indice "plus haut" ou "plus bas"',
    story: 'Vous entrez dans les ténèbres numériques. Aucun indice ne vous guidera, seule votre intuition compte.',
    difficulty: 'hard',
    range: { min: 1, max: 50 },
    timeLimit: 60,
    maxAttempts: 10,
    specialRules: { blindMode: true },
    unlockRequirement: 'no-repeats',
    xpReward: 500,
    theme: {
      primary: '#1F2937',
      secondary: '#374151',
      gradient: 'from-gray-800 to-gray-900',
      particleColor: '#6B7280',
      background: 'from-gray-900 via-black to-gray-900'
    }
  },

  {
    id: 'ultimate-challenge',
    name: 'Défi Ultime',
    description: 'Le test final : 1-500, 3 tentatives, 15 secondes',
    story: 'Voici venu le moment de vérité. Le nombre final vous attend quelque part entre 1 et 500. Vous n\'avez que 3 tentatives et 15 secondes. Êtes-vous prêt ?',
    difficulty: 'hard',
    range: { min: 1, max: 500 },
    timeLimit: 15,
    maxAttempts: 3,
    unlockRequirement: 'blind-mode',
    xpReward: 1000,
    theme: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      gradient: 'from-violet-400 via-purple-400 to-indigo-400',
      particleColor: '#7C3AED',
      background: 'from-violet-900 via-purple-900 to-indigo-900'
    }
  }
];

export const getCampaignLevel = (id: string): CampaignLevel | undefined => {
  return CAMPAIGN_LEVELS.find(level => level.id === id);
};

export const getNextLevel = (currentLevelId: string): CampaignLevel | undefined => {
  return CAMPAIGN_LEVELS.find(level => level.unlockRequirement === currentLevelId);
};

export const getTotalCampaignXP = (): number => {
  return CAMPAIGN_LEVELS.reduce((total, level) => total + level.xpReward, 0);
};