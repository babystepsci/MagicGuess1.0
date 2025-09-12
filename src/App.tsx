import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AuthModal } from './components/ui/AuthModal';
import { MainMenu } from './components/menu/MainMenu';
import { ProfileModal } from './components/menu/ProfileModal';
import { SettingsModal } from './components/menu/SettingsModal';
import { GameModeSelector } from './components/game/GameModeSelector';
import { DifficultySelector } from './components/game/DifficultySelector';
import { GameInterface } from './components/game/GameInterface';
import { MultiplayerLobby } from './components/multiplayer/MultiplayerLobby'; // Keep this import for the component itself
import { MultiplayerTypeSelector } from './components/multiplayer/MultiplayerTypeSelector';
import { LocalMultiplayerLobby } from './components/multiplayer/LocalMultiplayerLobby';
import { CreateRoomModal } from './components/multiplayer/CreateRoomModal';
import { MultiplayerRoom } from './components/multiplayer/MultiplayerRoom';
import { CampaignMap } from './components/campaign/CampaignMap';
import { CampaignGameInterface } from './components/campaign/CampaignGameInterface';
import { TournamentLobby } from './components/tournament/TournamentLobby';
import { CreateTournamentModal } from './components/tournament/CreateTournamentModal';
import { TournamentBracket } from './components/tournament/TournamentBracket';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { useCampaign } from './hooks/useCampaign';
import { MultiplayerProvider } from './hooks/MultiplayerProvider'; // New import for the provider
import { useMultiplayer } from './hooks/MultiplayerProvider';
import { LocaleProvider } from './hooks/useLocale';
import { AudioProvider } from './hooks/useAudioSettings.tsx';

type AppState = 'loading' | 'auth' | 'menu' | 'game-mode-selection' | 'difficulty' | 'game' | 'campaign-map' | 'campaign-game' | 'multiplayer-type-selection' | 'local-multiplayer-lobby' | 'multiplayer-lobby' | 'multiplayer-room' | 'tournament-lobby' | 'tournament-bracket' | 'profile' | 'settings';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const { user } = useAuth();
  const { currentRoom, leaveRoom, error } = useMultiplayer();
  const { gameState, startGame, makeGuess, resetGame } = useGame();
  const { gameState: campaignGameState, startCampaignLevel, makeGuess: makeCampaignGuess, resetGame: resetCampaignGame } = useCampaign();

  useEffect(() => {
    if (appState === 'loading') return;
    
    if (!user && appState !== 'auth' && appState !== 'loading') { // Added appState !== 'loading'
      setAppState('auth');
    } else if (user && appState === 'auth') {
      setAppState('menu'); // Transition to menu after successful auth
    }
  }, [user, appState]);

  // Log de rendu pour diagnostiquer la synchronisation d'état
  console.log('🔍 [AppContent Render] currentRoom:', currentRoom?.id || 'null', 'appState:', appState);

  // Surveiller currentRoom pour déclencher la transition vers multiplayer-room
  useEffect(() => { // This useEffect will now correctly react to currentRoom changes from the context
    console.log('🔍 [App] currentRoom useEffect - currentRoom:', currentRoom?.id || 'null', 'appState:', appState);
    if (currentRoom && appState !== 'multiplayer-room' && appState !== 'loading') { // Added appState !== 'loading'
      console.log('🔍 [App] currentRoom détecté, transition vers multiplayer-room. Ancien appState:', appState);
      setAppState('multiplayer-room');
    }
  }, [currentRoom, appState]);

  const handleLoadingComplete = () => {
    setAppState(user ? 'menu' : 'auth');
  };

  const handleDifficultySelect = (difficulty: string) => {
    startGame(difficulty);
    setAppState('game');
  };

  const handleBackToGameModeSelection = () => {
    resetGame();
    resetCampaignGame();
    if (currentRoom) {
      leaveRoom();
    }
    setAppState('game-mode-selection');
  };

  const handleGameRestart = () => {
    resetGame();
    setAppState('difficulty');
  };

  const handleCampaignRestart = () => {
    // Redémarrer le même niveau de campagne
    if (campaignGameState.level.id) {
      startCampaignLevel(campaignGameState.level);
    }
  };

  const handleBackToMenu = () => {
    resetGame();
    resetCampaignGame();
    if (currentRoom) {
      leaveRoom(); // Ensure leaveRoom is called when going back to menu from a room
    }
    setAppState('menu');
  };

  // Render current state
  switch (appState) {
    case 'loading':
      return <LoadingScreen onComplete={handleLoadingComplete} />;
    
    case 'auth':
      return (
        <AuthModal 
          isOpen={true} 
          onClose={() => user && setAppState('menu')} 
        />
      );
    
    case 'menu':
      return (
        <>
          <MainMenu
            onPlay={() => setAppState('game-mode-selection')}
            onProfile={() => setAppState('profile')}
            onSettings={() => setAppState('settings')}
          />
          <ProfileModal
            isOpen={appState === 'profile'}
            onClose={() => setAppState('menu')}
          />
          <SettingsModal
            isOpen={appState === 'settings'}
            onClose={() => setAppState('menu')}
          />
        </>
      );
    
    case 'game-mode-selection':
      return (
        <GameModeSelector
          onSelectSolo={() => setAppState('difficulty')}
          onSelectMultiplayer={() => setAppState('multiplayer-type-selection')}
          onSelectCampaign={() => setAppState('campaign-map')}
          onSelectTournament={() => setAppState('tournament-lobby')}
          onBack={handleBackToMenu}
        />
      );
    
    case 'multiplayer-type-selection':
      return (
        <MultiplayerTypeSelector
          onSelectLocal={() => setAppState('local-multiplayer-lobby')}
          onSelectOnline={() => setAppState('multiplayer-lobby')}
          onBack={handleBackToGameModeSelection}
        />
      );
    
    case 'local-multiplayer-lobby':
      return (
        <>
          <LocalMultiplayerLobby
            onCreateRoom={() => setShowCreateRoomModal(true)}
            onJoinRoom={() => {
              // Transition gérée par useEffect qui surveille currentRoom
            }}
            onBack={() => setAppState('multiplayer-type-selection')}
          />
          <CreateRoomModal
            isOpen={showCreateRoomModal}
            onClose={() => setShowCreateRoomModal(false)}
            onRoomCreated={(roomId) => { console.log('🔍 [App] Room created, ID:', roomId); /* Transition handled by useEffect */ }}
          />
        </>
      );
    
    case 'difficulty':
      return (
        <DifficultySelector
          onSelect={handleDifficultySelect}
          onMultiplayer={() => setAppState('multiplayer-type-selection')}
          onBack={handleBackToGameModeSelection}
        />
      );
    
    case 'game':
      return (
        <GameInterface
          gameState={gameState}
          onGuess={makeGuess}
          onRestart={handleGameRestart}
          onBackToMenu={handleBackToMenu}
        />
      );
    
    case 'campaign-map':
      return (
        <CampaignMap
          onSelectLevel={(level) => {
            startCampaignLevel(level);
            setAppState('campaign-game');
          }}
          onBack={handleBackToGameModeSelection}
        />
      );
    
    case 'campaign-game':
      return (
        <CampaignGameInterface
          gameState={campaignGameState}
          onGuess={makeCampaignGuess}
          onRestart={handleCampaignRestart}
          onBackToCampaign={() => setAppState('campaign-map')}
        />
      );
    
    case 'multiplayer-lobby':
      return (
        <>
          <MultiplayerLobby
            onJoinRoom={() => {
              // Transition gérée par useEffect qui surveille currentRoom
            }}
            onCreateRoom={() => setShowCreateRoomModal(true)}
            onBack={() => setAppState('multiplayer-type-selection')}
          />
          <CreateRoomModal
            isOpen={showCreateRoomModal}
            onClose={() => setShowCreateRoomModal(false)}
            onRoomCreated={(roomId) => { console.log('🔍 [App] Room created, ID:', roomId); /* Transition handled by useEffect */ }}
          />
        </>
      );
    
    case 'multiplayer-room':
      return (
        <MultiplayerRoom
          onLeave={() => setAppState('multiplayer-type-selection')}
        />
      );
    
    case 'tournament-lobby':
      return (
        <>
          <TournamentLobby
            onJoinTournament={(tournament) => {
              setSelectedTournament(tournament);
              setAppState('tournament-bracket');
            }}
            onCreateTournament={() => setShowCreateTournamentModal(true)}
            onBack={() => setAppState('game-mode-selection')}
          />
          <CreateTournamentModal
            isOpen={showCreateTournamentModal}
            onClose={() => setShowCreateTournamentModal(false)}
            onTournamentCreated={(tournamentId) => {
              setShowCreateTournamentModal(false);
              // Optionnel: rediriger vers le tournoi créé
            }}
          />
        </>
      );
    
    case 'tournament-bracket':
      return (
        <TournamentBracket
          tournament={selectedTournament}
          onJoinMatch={(roomId) => {
            // Rejoindre la salle de match du tournoi
            // La logique sera similaire au multijoueur normal
            setAppState('multiplayer-room');
          }}
          onBack={() => setAppState('tournament-lobby')}
        />
      );
    
    case 'profile':
      return (
        <>
          <MainMenu
            onPlay={() => setAppState('game-mode-selection')}
            onProfile={() => setAppState('profile')}
            onSettings={() => setAppState('settings')}
          />
          <ProfileModal
            isOpen={true}
            onClose={() => setAppState('menu')}
          />
        </>
      );
    
    case 'settings':
      return (
        <>
          <MainMenu
            onPlay={() => setAppState('game-mode-selection')}
            onProfile={() => setAppState('profile')}
            onSettings={() => setAppState('settings')}
          />
          <SettingsModal
            isOpen={true}
            onClose={() => setAppState('menu')}
          />
        </>
      );
    
    default:
      return null;
  }
}

function App() {
  return ( // Added flex flex-col to the root div for better mobile layout management
    <LocaleProvider>
      <AudioProvider>
        <AuthProvider>
          <MultiplayerProvider> {/* Wrap AppContent with MultiplayerProvider */}
            <AppContent />
          </MultiplayerProvider>
        </AuthProvider>
      </AudioProvider>
    </LocaleProvider>
  );
}

export default App;