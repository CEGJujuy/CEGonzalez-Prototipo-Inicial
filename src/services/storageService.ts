// Servicio de almacenamiento local
// Maneja la persistencia de datos en el navegador

import { User, Conversation, Message, UsageStats } from '../types';

// Constantes para las claves de almacenamiento local
const STORAGE_KEYS = {
  USER: 'edu_assistant_user',              // Usuario actual
  CONVERSATIONS: 'edu_assistant_conversations',  // Conversaciones guardadas
  USAGE_STATS: 'edu_assistant_usage_stats',     // Estadísticas de uso
  SETTINGS: 'edu_assistant_settings'            // Configuraciones del usuario
} as const;

// Clase principal del servicio de almacenamiento
export class StorageService {
  
  // Métodos para manejar datos del usuario
  // Guarda la información del usuario en localStorage
  static saveUser(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
      // En caso de error, podrías implementar un fallback o notificar al usuario
    }
  }

  // Recupera la información del usuario desde localStorage
  static getUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userData) return null;
      
      // Parsea los datos y los retorna
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  // Elimina los datos del usuario (logout)
  static clearUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Métodos para manejar conversaciones
  // Guarda todas las conversaciones del usuario
  static saveConversations(conversations: Conversation[]): void {
    try {
      // Serializa las conversaciones, convirtiendo dates a strings
      const serializedConversations = conversations.map(conv => ({
        ...conv,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      }));
      
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(serializedConversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  }

  // Recupera todas las conversaciones del usuario
  static getConversations(): Conversation[] {
    try {
      const conversationsData = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!conversationsData) return [];
      
      // Parsea y deserializa las conversaciones, convirtiendo strings a dates
      const parsedConversations = JSON.parse(conversationsData);
      return parsedConversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })) as Conversation[];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  // Guarda una conversación específica
  static saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getConversations();
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Actualiza conversación existente
        conversations[existingIndex] = conversation;
      } else {
        // Agrega nueva conversación
        conversations.push(conversation);
      }
      
      this.saveConversations(conversations);
    } catch (error) {
      console.error('Error saving individual conversation:', error);
    }
  }

  // Elimina una conversación específica
  static deleteConversation(conversationId: string): void {
    try {
      const conversations = this.getConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveConversations(filteredConversations);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  // Métodos para manejar estadísticas de uso
  // Actualiza las estadísticas de uso del sistema
  static updateUsageStats(userId: string, subject: string): void {
    try {
      const stats = this.getUsageStats(userId);
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Incrementa el total de preguntas
      stats.totalQuestions += 1;
      
      // Actualiza distribución por materia
      if (stats.subjectDistribution[subject as keyof typeof stats.subjectDistribution]) {
        stats.subjectDistribution[subject as keyof typeof stats.subjectDistribution] += 1;
      }
      
      // Actualiza uso diario
      const todayUsage = stats.dailyUsage.find(day => day.date === today);
      if (todayUsage) {
        todayUsage.count += 1;
      } else {
        stats.dailyUsage.push({ date: today, count: 1 });
      }
      
      // Mantiene solo los últimos 30 días
      stats.dailyUsage = stats.dailyUsage
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30);
      
      // Calcula engagement (actividad reciente)
      const recentDays = stats.dailyUsage.slice(0, 7);
      stats.userEngagement = recentDays.reduce((sum, day) => sum + day.count, 0) / 7;
      
      this.saveUsageStats(userId, stats);
    } catch (error) {
      console.error('Error updating usage stats:', error);
    }
  }

  // Recupera las estadísticas de uso de un usuario
  static getUsageStats(userId: string): UsageStats {
    try {
      const statsData = localStorage.getItem(`${STORAGE_KEYS.USAGE_STATS}_${userId}`);
      if (!statsData) {
        // Retorna estadísticas vacías si no existen
        return this.createEmptyStats();
      }
      
      return JSON.parse(statsData) as UsageStats;
    } catch (error) {
      console.error('Error loading usage stats:', error);
      return this.createEmptyStats();
    }
  }

  // Guarda las estadísticas de uso
  private static saveUsageStats(userId: string, stats: UsageStats): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.USAGE_STATS}_${userId}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving usage stats:', error);
    }
  }

  // Crea un objeto de estadísticas vacío
  private static createEmptyStats(): UsageStats {
    return {
      totalQuestions: 0,
      subjectDistribution: {
        matematicas: 0,
        ciencias: 0,
        historia: 0,
        literatura: 0,
        ingles: 0,
        fisica: 0,
        quimica: 0
      },
      dailyUsage: [],
      averageResponseTime: 0,
      userEngagement: 0
    };
  }

  // Métodos para configuraciones del usuario
  // Guarda configuraciones personalizadas del usuario
  static saveSettings(userId: string, settings: Record<string, any>): void {
    try {
      localStorage.setItem(`${STORAGE_KEYS.SETTINGS}_${userId}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  // Recupera las configuraciones del usuario
  static getSettings(userId: string): Record<string, any> {
    try {
      const settingsData = localStorage.getItem(`${STORAGE_KEYS.SETTINGS}_${userId}`);
      if (!settingsData) {
        // Retorna configuraciones por defecto
        return {
          theme: 'light',
          notifications: true,
          preferredSubjects: [],
          studyReminders: false
        };
      }
      
      return JSON.parse(settingsData);
    } catch (error) {
      console.error('Error loading user settings:', error);
      return {};
    }
  }

  // Método de utilidad para limpiar datos antiguos
  // Elimina conversaciones y estadísticas más antiguas que X días
  static cleanupOldData(daysToKeep: number = 90): void {
    try {
      const conversations = this.getConversations();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Filtra conversaciones recientes
      const recentConversations = conversations.filter(
        conv => conv.updatedAt > cutoffDate
      );
      
      this.saveConversations(recentConversations);
      
      console.log(`Cleaned up old data, kept ${recentConversations.length} recent conversations`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  // Método para exportar datos del usuario (para respaldo)
  static exportUserData(userId: string): string {
    try {
      const userData = {
        user: this.getUser(),
        conversations: this.getConversations(),
        stats: this.getUsageStats(userId),
        settings: this.getSettings(userId),
        exportDate: new Date().toISOString()
      };
      
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return '';
    }
  }

  // Método para importar datos del usuario (desde respaldo)
  static importUserData(jsonData: string): boolean {
    try {
      const userData = JSON.parse(jsonData);
      
      // Valida la estructura de los datos
      if (!userData.user || !userData.conversations) {
        throw new Error('Invalid data structure');
      }
      
      // Importa los datos
      this.saveUser(userData.user);
      this.saveConversations(userData.conversations);
      
      if (userData.settings) {
        this.saveSettings(userData.user.id, userData.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}