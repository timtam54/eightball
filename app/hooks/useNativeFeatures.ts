import { useEffect, useState, useCallback } from 'react';
import { nativeFeatures } from '../services/native-features';
import { Capacitor } from '@capacitor/core';

export function useNativeFeatures() {
  const [isNative, setIsNative] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    // Initialize native features
    if (Capacitor.isNativePlatform()) {
      nativeFeatures.initializePushNotifications();
      nativeFeatures.setupAppListeners();
      nativeFeatures.hideSplashScreen();
      
      // Load high scores
      loadHighScores();
    }
  }, []);

  const loadHighScores = async () => {
    const scores = await nativeFeatures.getAllHighScores();
    setHighScores(scores);
  };

  const vibrate = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    switch (type) {
      case 'light':
        nativeFeatures.vibrateLight();
        break;
      case 'medium':
        nativeFeatures.vibrateMedium();
        break;
      case 'heavy':
        nativeFeatures.vibrateHeavy();
        break;
      case 'success':
        nativeFeatures.vibrateSuccess();
        break;
      case 'warning':
        nativeFeatures.vibrateWarning();
        break;
      case 'error':
        nativeFeatures.vibrateError();
        break;
    }
  }, []);

  const share = useCallback(async (gameName: string, score?: number) => {
    await nativeFeatures.shareGame(gameName, score);
  }, []);

  const saveHighScore = useCallback(async (game: string, score: number) => {
    await nativeFeatures.saveHighScore(game, score);
    await loadHighScores(); // Reload scores
  }, []);

  const getHighScore = useCallback(async (game: string): Promise<number> => {
    return await nativeFeatures.getHighScore(game);
  }, []);

  const incrementGamesPlayed = useCallback(async () => {
    await nativeFeatures.incrementGamesPlayed();
  }, []);

  return {
    isNative,
    vibrate,
    share,
    saveHighScore,
    getHighScore,
    highScores,
    incrementGamesPlayed
  };
}