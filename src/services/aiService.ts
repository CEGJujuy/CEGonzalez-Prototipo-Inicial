// Servicio de inteligencia artificial educativa
// Simula un sistema de NLP para generar respuestas contextuales

import { Subject, EducationalResponse, Message } from '../types';
import { educationalDatabase, genericResponses } from '../data/educationalDatabase';

// Clase principal del servicio de IA educativa
export class AIEducationalService {
  // Método principal para generar respuestas educativas
  // Analiza la pregunta del usuario y devuelve una respuesta apropiada
  static generateResponse(
    userMessage: string, 
    selectedSubject: Subject, 
    conversationHistory: Message[] = []
  ): string {
    
    // Limpia y normaliza el mensaje del usuario para mejor análisis
    const cleanMessage = this.preprocessMessage(userMessage);
    
    // Obtiene las respuestas disponibles para la materia seleccionada
    const subjectResponses = educationalDatabase[selectedSubject] || [];
    
    // Busca una respuesta que coincida con el patrón de la pregunta
    const matchedResponse = this.findMatchingResponse(cleanMessage, subjectResponses);
    
    if (matchedResponse) {
      // Si encuentra una respuesta específica, la retorna con contexto adicional
      return this.formatResponse(matchedResponse, conversationHistory);
    }
    
    // Si no encuentra respuesta específica, busca en otras materias
    const crossSubjectResponse = this.searchAcrossSubjects(cleanMessage);
    if (crossSubjectResponse) {
      return `Aunque preguntaste sobre ${selectedSubject}, encontré información relevante: ${crossSubjectResponse.response}`;
    }
    
    // Como último recurso, retorna una respuesta genérica
    return this.getGenericResponse(cleanMessage);
  }

  // Preprocesa el mensaje del usuario para mejorar la detección de patrones
  private static preprocessMessage(message: string): string {
    return message
      .toLowerCase()                    // Convierte a minúsculas
      .trim()                          // Elimina espacios al inicio y final
      .replace(/[¿?¡!]/g, '')         // Elimina signos de interrogación y exclamación
      .replace(/\s+/g, ' ');          // Normaliza espacios múltiples
  }

  // Busca una respuesta que coincida con el patrón de la pregunta
  private static findMatchingResponse(
    message: string, 
    responses: EducationalResponse[]
  ): EducationalResponse | null {
    
    // Itera sobre todas las respuestas posibles de la materia
    for (const response of responses) {
      // Verifica si el patrón regex coincide con el mensaje
      if (response.pattern.test(message)) {
        return response;
      }
    }
    return null;
  }

  // Busca respuestas en todas las materias (búsqueda cruzada)
  private static searchAcrossSubjects(message: string): EducationalResponse | null {
    // Itera sobre todas las materias en la base de datos
    for (const subject of Object.keys(educationalDatabase) as Subject[]) {
      const subjectResponses = educationalDatabase[subject];
      const match = this.findMatchingResponse(message, subjectResponses);
      if (match) {
        return match;
      }
    }
    return null;
  }

  // Formatea la respuesta agregando contexto del historial de conversación
  private static formatResponse(
    response: EducationalResponse, 
    history: Message[]
  ): string {
    let formattedResponse = response.response;
    
    // Si hay una pregunta de seguimiento, la agrega
    if (response.followUp) {
      formattedResponse += `\n\n${response.followUp}`;
    }
    
    // Si hay recursos adicionales, los incluye
    if (response.resources && response.resources.length > 0) {
      formattedResponse += `\n\n📚 Recursos adicionales:\n${response.resources.map(r => `• ${r}`).join('\n')}`;
    }
    
    return formattedResponse;
  }

  // Retorna una respuesta genérica cuando no se encuentra coincidencia específica
  private static getGenericResponse(message: string): string {
    // Selecciona una respuesta genérica aleatoria
    const randomIndex = Math.floor(Math.random() * genericResponses.length);
    return genericResponses[randomIndex];
  }

  // Analiza el sentimiento y contexto de la pregunta para personalizar la respuesta
  static analyzeContext(message: string): {
    complexity: 'basic' | 'intermediate' | 'advanced';
    emotion: 'frustrated' | 'curious' | 'confident' | 'neutral';
    urgency: 'low' | 'medium' | 'high';
  } {
    
    // Detecta el nivel de complejidad basado en palabras clave
    let complexity: 'basic' | 'intermediate' | 'advanced' = 'basic';
    const advancedKeywords = ['demostrar', 'derivar', 'analizar', 'sintetizar', 'evaluar'];
    const intermediateKeywords = ['explicar', 'comparar', 'relacionar', 'aplicar'];
    
    if (advancedKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      complexity = 'advanced';
    } else if (intermediateKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      complexity = 'intermediate';
    }

    // Detecta emociones basadas en expresiones comunes
    let emotion: 'frustrated' | 'curious' | 'confident' | 'neutral' = 'neutral';
    if (message.includes('no entiendo') || message.includes('confundido') || message.includes('difícil')) {
      emotion = 'frustrated';
    } else if (message.includes('interesante') || message.includes('quiero saber') || message.includes('me pregunto')) {
      emotion = 'curious';
    } else if (message.includes('creo que') || message.includes('pienso que')) {
      emotion = 'confident';
    }

    // Detecta urgencia basada en palabras clave temporales
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (message.includes('examen') || message.includes('tarea') || message.includes('mañana')) {
      urgency = 'high';
    } else if (message.includes('pronto') || message.includes('necesito')) {
      urgency = 'medium';
    }

    return { complexity, emotion, urgency };
  }

  // Genera sugerencias de estudio personalizado basado en el historial
  static generateStudySuggestions(
    subject: Subject, 
    recentMessages: Message[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Analiza temas frecuentes en mensajes recientes
    const topics = recentMessages
      .filter(msg => !msg.isBot)
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    // Genera sugerencias específicas por materia
    switch (subject) {
      case 'matematicas':
        if (topics.includes('ecuación')) {
          suggestions.push('Practica más ejercicios de ecuaciones paso a paso');
          suggestions.push('Revisa los fundamentos de álgebra');
        }
        if (topics.includes('función')) {
          suggestions.push('Dibuja gráficas de funciones para visualizar mejor');
          suggestions.push('Practica identificando dominio y rango');
        }
        break;
        
      case 'ciencias':
        if (topics.includes('célula')) {
          suggestions.push('Estudia diagramas de células con sus organelos');
          suggestions.push('Compara células procariotas y eucariotas');
        }
        break;
        
      // Se pueden agregar más casos según las materias
      default:
        suggestions.push(`Repasa los conceptos fundamentales de ${subject}`);
        suggestions.push('Practica con ejercicios de diferentes niveles');
    }

    // Si no hay sugerencias específicas, agrega sugerencias generales
    if (suggestions.length === 0) {
      suggestions.push('Crea un mapa conceptual de lo que has estudiado');
      suggestions.push('Practica explicando los conceptos con tus palabras');
      suggestions.push('Busca ejemplos prácticos del tema en la vida real');
    }

    return suggestions;
  }
}