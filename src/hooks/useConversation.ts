// Hook personalizado para manejo de conversaciones
// Gestiona el estado de mensajes, conversaciones y la interacción con la IA

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, Subject, User } from '../types';
import { AIEducationalService } from '../services/aiService';
import { StorageService } from '../services/storageService';

// Hook personalizado para manejar conversaciones
export const useConversation = (user: User | null) => {
  // Estados principales de la conversación
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('matematicas');

  // Cargar conversaciones guardadas al inicializar
  useEffect(() => {
    if (user) {
      loadUserConversations();
    }
  }, [user]);

  // Función para cargar las conversaciones del usuario desde el almacenamiento
  const loadUserConversations = useCallback(() => {
    try {
      const savedConversations = StorageService.getConversations();
      // Filtra solo las conversaciones del usuario actual
      const userConversations = savedConversations.filter(conv => conv.userId === user?.id);
      setConversations(userConversations);
      
      console.log(`Loaded ${userConversations.length} conversations for user ${user?.name}`);
    } catch (error) {
      console.error('Error loading user conversations:', error);
    }
  }, [user]);

  // Función para crear una nueva conversación
  const createNewConversation = useCallback((subject: Subject, title?: string) => {
    if (!user) {
      console.error('Cannot create conversation without user');
      return null;
    }

    try {
      // Crea una nueva conversación con ID único
      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        subject,
        title: title || `Nueva conversación de ${subject}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Actualiza los estados locales
      setCurrentConversation(newConversation);
      setSelectedSubject(subject);
      
      // Agrega mensaje de bienvenida del bot
      const welcomeMessage = createWelcomeMessage(user, subject);
      newConversation.messages.push(welcomeMessage);
      
      // Guarda la conversación
      saveConversation(newConversation);
      
      console.log(`Created new conversation: ${newConversation.title}`);
      return newConversation;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      return null;
    }
  }, [user]);

  // Función para crear mensaje de bienvenida personalizado
  const createWelcomeMessage = (user: User, subject: Subject): Message => {
    const subjectNames = {
      matematicas: 'Matemáticas',
      ciencias: 'Ciencias Naturales',
      historia: 'Historia',
      literatura: 'Literatura',
      ingles: 'Inglés',
      fisica: 'Física',
      quimica: 'Química'
    };

    const welcomeText = user.role === 'student' 
      ? `¡Hola ${user.name}! Bienvenido/a a tu sesión de ${subjectNames[subject]}. Estoy aquí para ayudarte con tus dudas y apoyar tu aprendizaje. ¿Qué te gustaría estudiar hoy?`
      : `Hola ${user.name}. Como docente, puedes usar esta herramienta para explorar cómo los estudiantes interactúan con el contenido de ${subjectNames[subject]}. ¿En qué puedo asistirte?`;

    return {
      id: `msg_${Date.now()}_welcome`,
      content: welcomeText,
      isBot: true,
      timestamp: new Date(),
      subject,
      userId: user.id
    };
  };

  // Función para enviar un mensaje del usuario
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !currentConversation || !content.trim()) {
      console.error('Cannot send message: missing user, conversation, or content');
      return;
    }

    try {
      // Crea el mensaje del usuario
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        content: content.trim(),
        isBot: false,
        timestamp: new Date(),
        subject: selectedSubject,
        userId: user.id
      };

      // Actualiza la conversación con el mensaje del usuario
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        updatedAt: new Date()
      };
      
      setCurrentConversation(updatedConversation);
      setIsTyping(true);

      // Simula delay de procesamiento de IA
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Genera respuesta de la IA
      const aiResponse = AIEducationalService.generateResponse(
        content,
        selectedSubject,
        updatedConversation.messages
      );

      // Crea el mensaje de respuesta del bot
      const botMessage: Message = {
        id: `msg_${Date.now()}_bot`,
        content: aiResponse,
        isBot: true,
        timestamp: new Date(),
        subject: selectedSubject,
        userId: user.id
      };

      // Actualiza la conversación con ambos mensajes
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, botMessage],
        updatedAt: new Date()
      };

      // Actualiza el título si es el primer intercambio
      if (finalConversation.messages.length <= 3) {
        finalConversation.title = generateConversationTitle(content, selectedSubject);
      }

      setCurrentConversation(finalConversation);
      setIsTyping(false);

      // Guarda la conversación actualizada
      saveConversation(finalConversation);

      // Actualiza estadísticas de uso
      StorageService.updateUsageStats(user.id, selectedSubject);

      console.log('Message sent and response generated successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  }, [user, currentConversation, selectedSubject]);

  // Función para generar título automático de conversación
  const generateConversationTitle = (firstMessage: string, subject: Subject): string => {
    const words = firstMessage.toLowerCase().split(' ').slice(0, 4);
    const subjectNames = {
      matematicas: 'Mat',
      ciencias: 'Ciencias',
      historia: 'Historia',
      literatura: 'Literatura',
      ingles: 'Inglés',
      fisica: 'Física',
      quimica: 'Química'
    };
    
    return `${subjectNames[subject]}: ${words.join(' ')}...`;
  };

  // Función para guardar una conversación
  const saveConversation = useCallback((conversation: Conversation) => {
    try {
      // Guarda en almacenamiento local
      StorageService.saveConversation(conversation);
      
      // Actualiza el estado de conversaciones
      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === conversation.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = conversation;
          return updated;
        } else {
          return [...prev, conversation];
        }
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }, []);

  // Función para cargar una conversación existente
  const loadConversation = useCallback((conversationId: string) => {
    try {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setSelectedSubject(conversation.subject);
        console.log(`Loaded conversation: ${conversation.title}`);
        return true;
      } else {
        console.error('Conversation not found:', conversationId);
        return false;
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      return false;
    }
  }, [conversations]);

  // Función para eliminar una conversación
  const deleteConversation = useCallback((conversationId: string) => {
    try {
      // Elimina del almacenamiento
      StorageService.deleteConversation(conversationId);
      
      // Actualiza el estado local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Si es la conversación actual, la limpia
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      console.log('Conversation deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }, [currentConversation]);

  // Función para cambiar de materia
  const changeSubject = useCallback((newSubject: Subject) => {
    setSelectedSubject(newSubject);
    
    // Si hay una conversación activa y cambia la materia, crea una nueva
    if (currentConversation && currentConversation.subject !== newSubject) {
      createNewConversation(newSubject);
    }
  }, [currentConversation, createNewConversation]);

  // Función para limpiar la conversación actual
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
  }, []);

  // Función para obtener estadísticas de conversaciones
  const getConversationStats = useCallback(() => {
    if (!user) return null;

    const userConversations = conversations.filter(conv => conv.userId === user.id);
    const totalMessages = userConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const subjectCounts = userConversations.reduce((acc, conv) => {
      acc[conv.subject] = (acc[conv.subject] || 0) + 1;
      return acc;
    }, {} as Record<Subject, number>);

    return {
      totalConversations: userConversations.length,
      totalMessages,
      subjectDistribution: subjectCounts,
      averageMessagesPerConversation: userConversations.length > 0 ? Math.round(totalMessages / userConversations.length) : 0,
      mostUsedSubject: Object.entries(subjectCounts).sort(([,a], [,b]) => b - a)[0]?.[0] as Subject
    };
  }, [conversations, user]);

  // Función para buscar en conversaciones
  const searchConversations = useCallback((query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    
    const searchTerm = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchTerm) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm))
    );
  }, [conversations]);

  // Función para exportar conversación como texto
  const exportConversation = useCallback((conversationId: string): string => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return '';

    let exportText = `Conversación: ${conversation.title}\n`;
    exportText += `Materia: ${conversation.subject}\n`;
    exportText += `Fecha: ${conversation.createdAt.toLocaleDateString()}\n\n`;

    conversation.messages.forEach(msg => {
      const sender = msg.isBot ? 'Asistente' : 'Usuario';
      exportText += `[${msg.timestamp.toLocaleTimeString()}] ${sender}: ${msg.content}\n\n`;
    });

    return exportText;
  }, [conversations]);

  // Retorna el estado y funciones del hook
  return {
    // Estado
    currentConversation,
    conversations,
    isTyping,
    selectedSubject,
    
    // Funciones principales
    createNewConversation,
    sendMessage,
    loadConversation,
    deleteConversation,
    changeSubject,
    clearCurrentConversation,
    
    // Funciones de utilidad
    getConversationStats,
    searchConversations,
    exportConversation,
    saveConversation
  };
};