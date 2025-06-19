// Componente principal de la aplicación
// Orquesta todos los componentes y maneja el estado global

import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useConversation } from './hooks/useConversation';
import { StorageService } from './services/storageService';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { StatsPanel } from './components/dashboard/StatsPanel';
import { Subject } from './types';

// Componente principal de la aplicación
function App() {
  // Hooks personalizados para autenticación
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    login,
    logout,
    validateUserData
  } = useAuth();

  // Hooks personalizados para conversaciones
  const {
    currentConversation,
    conversations,
    isTyping,
    selectedSubject,
    createNewConversation,
    sendMessage,
    loadConversation,
    deleteConversation,
    changeSubject,
    clearCurrentConversation
  } = useConversation(user);

  // Estados de la UI
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Efecto de inicialización de la aplicación
  useEffect(() => {
    // Limpia datos antiguos al inicializar (mantiene datos de los últimos 90 días)
    StorageService.cleanupOldData(90);
    setIsInitialized(true);
    
    console.log('Aplicación inicializada correctamente');
  }, []);

  // Efecto para manejar el estado inicial del usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user && !currentConversation) {
      // Crea una conversación inicial si no hay ninguna activa
      createNewConversation('matematicas', 'Bienvenida');
    }
  }, [isAuthenticated, user, currentConversation, createNewConversation]);

  // Maneja el cambio de materia
  const handleSubjectChange = (newSubject: Subject) => {
    changeSubject(newSubject);
    
    // Si no hay conversación activa para la nueva materia, crea una
    const hasConversationForSubject = conversations.some(
      conv => conv.subject === newSubject && conv.userId === user?.id
    );
    
    if (!hasConversationForSubject) {
      createNewConversation(newSubject);
    }
  };

  // Maneja la creación de nueva conversación
  const handleNewConversation = (subject: Subject) => {
    clearCurrentConversation();
    createNewConversation(subject);
  };

  // Maneja el envío de mensajes
  const handleSendMessage = (content: string) => {
    if (!currentConversation) {
      // Si no hay conversación activa, crea una nueva
      const newConv = createNewConversation(selectedSubject, 'Nueva consulta');
      if (newConv) {
        // Envía el mensaje después de crear la conversación
        setTimeout(() => sendMessage(content), 100);
      }
    } else {
      sendMessage(content);
    }
  };

  // Maneja la visualización del panel de estadísticas
  const handleShowStats = () => {
    if (user?.role === 'teacher') {
      setShowStatsPanel(true);
    }
  };

  // Obtiene las estadísticas de uso del usuario actual
  const getUserStats = () => {
    if (!user) return null;
    return StorageService.getUsageStats(user.id);
  };

  // Maneja errores globales de la aplicación
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error en la aplicación:', error, errorInfo);
    
    // Aquí se podría implementar un sistema de reportes de errores
    // o mostrar una notificación al usuario
  };

  // Renderiza loading mientras se inicializa la aplicación
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando sistema educativo...</p>
        </div>
      </div>
    );
  }

  // Renderiza formulario de login si no está autenticado
  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={login}
        validateUserData={validateUserData}
      />
    );
  }

  // Renderiza la aplicación principal
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar de navegación */}
      <Sidebar
        user={user!}
        selectedSubject={selectedSubject}
        conversations={conversations}
        currentConversation={currentConversation}
        onSubjectChange={handleSubjectChange}
        onNewConversation={handleNewConversation}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        onLogout={logout}
        onShowStats={user?.role === 'teacher' ? handleShowStats : undefined}
      />

      {/* Área principal de la aplicación */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Interfaz de chat */}
        {currentConversation ? (
          <ChatInterface
            messages={currentConversation.messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            selectedSubject={selectedSubject}
            user={user!}
          />
        ) : (
          // Estado vacío cuando no hay conversación activa
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Hola, {user.name}!
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona una materia del menú lateral para comenzar una nueva conversación educativa.
              </p>
              <button
                onClick={() => handleNewConversation(selectedSubject)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Comenzar conversación
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de estadísticas (modal) */}
      {showStatsPanel && user && (
        <StatsPanel
          user={user}
          conversations={conversations}
          usageStats={getUserStats()!}
          onClose={() => setShowStatsPanel(false)}
        />
      )}

      {/* Información de desarrollo (solo en modo desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-800">
          <p>Modo desarrollo</p>
          <p>Usuario: {user.name} ({user.role})</p>
          <p>Conversaciones: {conversations.length}</p>
        </div>
      )}
    </div>
  );
}

export default App;