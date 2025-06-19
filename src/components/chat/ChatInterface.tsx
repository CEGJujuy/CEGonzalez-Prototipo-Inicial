// Componente principal de la interfaz de chat
// Maneja la conversación entre el usuario y el asistente de IA

import React, { useState, useRef, useEffect } from 'react';
import { Message, Subject, User } from '../../types';
import { Send, Bot, User as UserIcon, Lightbulb, BookOpen } from 'lucide-react';

// Interface para las props del componente
interface ChatInterfaceProps {
  messages: Message[];           // Lista de mensajes de la conversación
  onSendMessage: (content: string) => void; // Función para enviar mensajes
  isTyping: boolean;            // Indica si el bot está escribiendo
  selectedSubject: Subject;     // Materia actual seleccionada
  user: User;                   // Usuario actual
}

// Componente principal de la interfaz de chat
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  selectedSubject,
  user
}) => {
  // Estados del componente
  const [inputMessage, setInputMessage] = useState(''); // Mensaje que está escribiendo el usuario
  const [showSuggestions, setShowSuggestions] = useState(true); // Mostrar sugerencias iniciales
  
  // Referencias para el scroll automático
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sugerencias rápidas por materia para ayudar al usuario
  const quickSuggestions: Record<Subject, string[]> = {
    matematicas: [
      "¿Cómo resuelvo ecuaciones cuadráticas?",
      "Explícame las fracciones",
      "¿Qué es una función lineal?",
      "Ayúdame con geometría"
    ],
    ciencias: [
      "¿Cómo funciona la fotosíntesis?",
      "Explícame la célula",
      "¿Qué son los ecosistemas?",
      "Háblame de la evolución"
    ],
    fisica: [
      "¿Qué son las leyes de Newton?",
      "Explícame la energía cinética",
      "¿Cómo funciona la gravedad?",
      "¿Qué es la electricidad?"
    ],
    quimica: [
      "¿Cómo funciona la tabla periódica?",
      "Explícame los enlaces químicos",
      "¿Qué son las reacciones químicas?",
      "Háblame de los átomos"
    ],
    historia: [
      "¿Cómo fue la independencia?",
      "Explícame las guerras mundiales",
      "¿Qué fue la revolución industrial?",
      "Háblame de las civilizaciones antiguas"
    ],
    literatura: [
      "¿Qué son las figuras retóricas?",
      "Explícame los géneros literarios",
      "¿Cómo analizar un poema?",
      "Háblame del romanticismo"
    ],
    ingles: [
      "¿Cómo uso los tiempos verbales?",
      "Ayúdame con el vocabulario",
      "¿Cómo mejorar mi pronunciación?",
      "Explícame la gramática básica"
    ]
  };

  // Efecto para hacer scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Efecto para enfocar el input al cargar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Función para hacer scroll hacia abajo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Maneja el envío de mensajes
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica que hay contenido en el mensaje
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    // Envía el mensaje y limpia el input
    onSendMessage(trimmedMessage);
    setInputMessage('');
    setShowSuggestions(false); // Oculta sugerencias después del primer mensaje
  };

  // Maneja el clic en una sugerencia rápida
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    setShowSuggestions(false);
  };

  // Maneja las teclas presionadas en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Envía con Enter (pero no con Shift+Enter para permitir líneas múltiples)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Formatea la marca temporal de un mensaje
  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtiene el nombre de la materia en formato legible
  const getSubjectDisplayName = (subject: Subject): string => {
    const names = {
      matematicas: 'Matemáticas',
      ciencias: 'Ciencias Naturales',
      fisica: 'Física',
      quimica: 'Química',
      historia: 'Historia',
      literatura: 'Literatura',
      ingles: 'Inglés'
    };
    return names[subject];
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Header del chat con información de la materia */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Asistente de {getSubjectDisplayName(selectedSubject)}
            </h2>
            <p className="text-sm text-gray-500">
              Listo para ayudarte, {user.name}
            </p>
          </div>
        </div>
        
        {/* Indicador de estado */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>En línea</span>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Sugerencias iniciales */}
        {showSuggestions && messages.length <= 1 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Sugerencias para empezar:</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickSuggestions[selectedSubject].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de mensajes */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.isBot ? 'justify-start' : 'justify-end'
            }`}
          >
            {/* Avatar del emisor (solo para mensajes del bot) */}
            {message.isBot && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            {/* Contenido del mensaje */}
            <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
              message.isBot ? 'order-1' : 'order-2'
            }`}>
              {/* Burbuja del mensaje */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.isBot
                  ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  : 'bg-blue-600 text-white'
              }`}>
                {/* Contenido del mensaje con formato preservado */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
              </div>
              
              {/* Marca temporal */}
              <div className={`text-xs text-gray-500 mt-1 ${
                message.isBot ? 'text-left' : 'text-right'
              }`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>

            {/* Avatar del usuario (solo para mensajes del usuario) */}
            {!message.isBot && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-3">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Indicador de escritura del bot */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex space-x-1">
                {/* Animación de puntos escribiendo */}
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Referencia para scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input para enviar mensajes */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          
          {/* Campo de texto para el mensaje */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pregúntame sobre ${getSubjectDisplayName(selectedSubject).toLowerCase()}...`}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isTyping}
            />
            
            {/* Contador de caracteres (opcional) */}
            {inputMessage.length > 100 && (
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {inputMessage.length}/500
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              inputMessage.trim() && !isTyping
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Información adicional */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Presiona Enter para enviar</span>
            {user.role === 'student' && (
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>Modo estudiante</span>
              </span>
            )}
          </div>
          
          {/* Indicador de conectividad offline */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Disponible offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};