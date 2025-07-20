import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

export class NativeFeatures {
  private static instance: NativeFeatures;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): NativeFeatures {
    if (!NativeFeatures.instance) {
      NativeFeatures.instance = new NativeFeatures();
    }
    return NativeFeatures.instance;
  }

  // Push Notifications
  async initializePushNotifications() {
    if (!this.isNative) return;

    try {
      // Request permission
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive !== 'granted') {
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== 'granted') {
          throw new Error('Push notification permission denied');
        }
      }

      // Register for push notifications
      await PushNotifications.register();

      // Add listeners
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        // Send token to your server
        this.sendTokenToServer(token.value);
      });

      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
        // Handle notification when app is in foreground
        this.handleForegroundNotification(notification);
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        // Handle notification tap
        this.handleNotificationTap(notification);
      });
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  }

  private async sendTokenToServer(token: string) {
    // TODO: Implement sending token to your backend
    console.log('Would send token to server:', token);
  }

  private handleForegroundNotification(notification: PushNotificationSchema) {
    // Show in-app notification UI
    // You can create a custom notification component
  }

  private handleNotificationTap(notification: ActionPerformed) {
    // Navigate based on notification data
    const data = notification.notification.data;
    if (data.gameId) {
      // Navigate to specific game
      window.location.href = `/${data.gameId}`;
    }
  }

  // Haptic Feedback
  async vibrateLight() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  async vibrateMedium() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  async vibrateHeavy() {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  async vibrateSuccess() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  async vibrateWarning() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  async vibrateError() {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  // Share functionality
  async shareGame(gameName: string, score?: number) {
    if (!this.isNative) {
      // Fallback to Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Onni Games - ${gameName}`,
            text: score ? `I scored ${score} points in ${gameName}!` : `Check out ${gameName} on Quadrix Games!`,
            url: window.location.href
          });
        } catch (error) {
          console.error('Web share failed:', error);
        }
      }
      return;
    }

    try {
      await Share.share({
        title: `OnniTetris Games - ${gameName}`,
        text: score ? `I scored ${score} points in ${gameName}!` : `Check out ${gameName} on Quadrix Games!`,
        url: 'https://eightballgames.app',
        dialogTitle: 'Share your achievement'
      });
    } catch (error) {
      console.error('Native share failed:', error);
    }
  }

  // Storage for high scores
  async saveHighScore(game: string, score: number) {
    try {
      const key = `highscore_${game}`;
      await Preferences.set({
        key: key,
        value: score.toString()
      });
    } catch (error) {
      console.error('Failed to save high score:', error);
      // Fallback to localStorage
      localStorage.setItem(`highscore_${game}`, score.toString());
    }
  }

  async getHighScore(game: string): Promise<number> {
    try {
      const key = `highscore_${game}`;
      const { value } = await Preferences.get({ key });
      return value ? parseInt(value) : 0;
    } catch (error) {
      console.error('Failed to get high score:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(`highscore_${game}`);
      return stored ? parseInt(stored) : 0;
    }
  }

  async getAllHighScores(): Promise<Record<string, number>> {
    const games = ['tetris', '8-ball', 'terracotta'];
    const scores: Record<string, number> = {};
    
    for (const game of games) {
      scores[game] = await this.getHighScore(game);
    }
    
    return scores;
  }

  // App lifecycle
  setupAppListeners() {
    if (!this.isNative) return;

    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      if (isActive) {
        // App has returned to foreground
        this.onAppResume();
      } else {
        // App has gone to background
        this.onAppPause();
      }
    });

    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data);
      // Handle deep links
      this.handleDeepLink(data.url);
    });
  }

  private onAppResume() {
    // Resume game timers, refresh data, etc.
    window.dispatchEvent(new Event('app-resume'));
  }

  private onAppPause() {
    // Pause game timers, save state, etc.
    window.dispatchEvent(new Event('app-pause'));
  }

  private handleDeepLink(url: string) {
    // Parse and handle deep links
    // e.g., eightballgames://game/tetris
    const urlObj = new URL(url);
    if (urlObj.pathname.startsWith('/game/')) {
      const game = urlObj.pathname.replace('/game/', '');
      window.location.href = `/${game}`;
    }
  }

  // App rating
  async promptForRating() {
    if (!this.isNative) return;
    
    // Check if we should show rating prompt
    const lastPrompt = await Preferences.get({ key: 'lastRatingPrompt' });
    const gamesPlayed = await Preferences.get({ key: 'gamesPlayed' });
    
    const gamesCount = parseInt(gamesPlayed.value || '0');
    const lastPromptTime = lastPrompt.value ? parseInt(lastPrompt.value) : 0;
    const daysSinceLastPrompt = (Date.now() - lastPromptTime) / (1000 * 60 * 60 * 24);
    
    // Show prompt after 10 games and at least 7 days since last prompt
    if (gamesCount >= 10 && daysSinceLastPrompt >= 7) {
      // Note: You'll need to implement native rating dialog
      // For iOS, you would use SKStoreReviewController
      console.log('Would show rating prompt');
      
      // Update last prompt time
      await Preferences.set({
        key: 'lastRatingPrompt',
        value: Date.now().toString()
      });
    }
  }

  async incrementGamesPlayed() {
    try {
      const { value } = await Preferences.get({ key: 'gamesPlayed' });
      const count = parseInt(value || '0') + 1;
      await Preferences.set({
        key: 'gamesPlayed',
        value: count.toString()
      });
      
      // Check if we should prompt for rating
      if (count % 10 === 0) {
        await this.promptForRating();
      }
    } catch (error) {
      console.error('Failed to increment games played:', error);
    }
  }

  // Splash screen control
  async hideSplashScreen() {
    if (!this.isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Failed to hide splash screen:', error);
    }
  }
}

// Export singleton instance
export const nativeFeatures = NativeFeatures.getInstance();