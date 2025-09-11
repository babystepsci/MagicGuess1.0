// Hooks audio désactivés temporairement
export function useSound(url: string, options: any = {}) {
  return { 
    play: () => {}, 
    stop: () => {}, 
    setVolume: () => {} 
  };
}

export function useMusic(url: string, options: any = {}) {
  return { 
    play: () => {}, 
    stop: () => {}, 
    setVolume: () => {} 
  };
}