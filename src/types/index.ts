// Definición de tipos para el sistema educativo
// Este archivo centraliza todas las interfaces TypeScript del proyecto

// Tipo para representar los diferentes roles de usuario en el sistema
export type UserRole = 'student' | 'teacher';

// Tipo para las diferentes materias educativas disponibles
export type Subject = 'matematicas' | 'ciencias' | 'historia' | 'literatura' | 'ingles' | 'fisica' | 'quimica';

// Interface para representar un usuario del sistema
export interface User {
  id: string;           // Identificador único del usuario
  name: string;         // Nombre completo del usuario
  role: UserRole;       // Rol del usuario (estudiante o docente)
  grade?: string;       // Grado académico (opcional, principalmente para estudiantes)
  subjects?: Subject[]; // Materias de interés o que enseña
}

// Interface para representar un mensaje en el chat
export interface Message {
  id: string;           // Identificador único del mensaje
  content: string;      // Contenido del mensaje
  isBot: boolean;       // Indica si el mensaje proviene del bot o del usuario
  timestamp: Date;      // Marca temporal del mensaje
  subject?: Subject;    // Materia asociada al mensaje (opcional)
  userId: string;       // ID del usuario que envió el mensaje
}

// Interface para representar una conversación completa
export interface Conversation {
  id: string;           // Identificador único de la conversación
  userId: string;       // ID del usuario propietario de la conversación
  subject: Subject;     // Materia principal de la conversación
  title: string;        // Título descriptivo de la conversación
  messages: Message[];  // Array de mensajes de la conversación
  createdAt: Date;      // Fecha de creación de la conversación
  updatedAt: Date;      // Fecha de última actualización
}

// Interface para estadísticas de uso del sistema (para docentes)
export interface UsageStats {
  totalQuestions: number;      // Total de preguntas realizadas
  subjectDistribution: Record<Subject, number>; // Distribución por materia
  dailyUsage: { date: string; count: number }[]; // Uso diario
  averageResponseTime: number; // Tiempo promedio de respuesta
  userEngagement: number;      // Nivel de engagement del usuario
}

// Interface para respuestas educativas predefinidas
export interface EducationalResponse {
  pattern: RegExp;      // Patrón regex para detectar la pregunta
  response: string;     // Respuesta del asistente
  followUp?: string;    // Pregunta de seguimiento opcional
  resources?: string[]; // Recursos adicionales (URLs, referencias)
}