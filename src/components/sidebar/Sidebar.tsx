// Componente de barra lateral
// Maneja navegación, selección de materias y gestión de conversaciones

import React, { useState } from 'react';
import { Subject, User, Conversation } from '../../types';
import { 
  BookOpen, Calculator, Atom, Clock, FileText, Globe, 
  Zap, TestTube, Plus, MessageSquare, Settings, LogOut,
  Search, Trash2, BarChart3, Menu, X
} from 'lucide-react';

// Interface para las props del componente
interface SidebarProps {
  user: User;                                    // Usuario actual
  selectedSubject: Subject;                      // Materia seleccionada
  conversations: Conversation[];                 // Lista de conversaciones
  currentConversation: Conversation | null;     // Conversación activa
  onSubjectChange: (subject: Subject) => void;  // Cambiar materia
  onNewConversation: (subject: Subject) => void; // Nueva conversación
  onLoadConversation: (id: string) => void;     // Cargar conversación
  onDeleteConversation: (id: string) => void;   // Eliminar conversación
  onLogout: () => void;                          // Cerrar sesión
  onShowStats?: () => void;                      // Mostrar estadísticas (para docentes)
}

// Componente principal de la barra lateral
export const Sidebar: React.FC<SidebarProps> = ({
  user,
  selectedSubject,
  conversations,
  currentConversation,
  onSubjectChange,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  onLogout,
  onShowStats
}) => {
  // Estados del componente
  const [searchTerm, setSearchTerm] = useState('');     // Término de búsqueda
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado colapsado (móvil)

  // Configuración de materias con iconos y colores
  const subjectConfig: Record<Subject, { 
    icon: React.ComponentType<any>; 
    label: string; 
    color: string;
    bgColor: string;
  }> = {
    matematicas: { 
      icon: Calculator, 
      label: 'Matemáticas', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 hover:bg-blue-200'
    },
    ciencias: { 
      icon: Atom, 
      label: 'Ciencias Naturales', 
      color: 'text-green-600',
      bgColor: 'bg-green-100 hover:bg-green-200'
    },
    fisica: { 
      icon: Zap, 
      label: 'Física', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200'
    },
    quimica: { 
      icon: TestTube, 
      label: 'Química', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 hover:bg-purple-200'
    },
    historia: { 
      icon: Clock, 
      label: 'Historia', 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 hover:bg-amber-200'
    },
    literatura: { 
      icon: FileText, 
      label: 'Literatura', 
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 hover:bg-pink-200'
    },
    ingles: { 
      icon: Globe, 
      label: 'Inglés', 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 hover:bg-indigo-200'
    }
  };

  // Filtra conversaciones basado en la búsqueda
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupa conversaciones por materia
  const conversationsBySubject = filteredConversations.reduce((acc, conv) => {
    const subject = conv.subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(conv);
    return acc;
  }, {} as Record<Subject, Conversation[]>);

  // Formatea la fecha de una conversación
  const formatConversationDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Maneja la confirmación de eliminación de conversación
  const handleDeleteConversation = (conversationId: string, conversationTitle: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${conversationTitle}"?`)) {
      onDeleteConversation(conversationId);
    }
  };

  return (
    <>
      {/* Botón para mostrar/ocultar sidebar en móvil */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg shadow-lg p-2 border border-gray-200"
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Overlay para móvil */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar principal */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 flex flex-col z-50
      `}>
        
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Sección de materias */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Materias</h3>
            <button
              onClick={() => onNewConversation(selectedSubject)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              title="Nueva conversación"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Grid de materias */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(subjectConfig).map(([subject, config]) => {
              const Icon = config.icon;
              const isSelected = selectedSubject === subject;
              
              return (
                <button
                  key={subject}
                  onClick={() => onSubjectChange(subject as Subject)}
                  className={`
                    p-3 rounded-lg text-left transition-all border-2
                    ${isSelected 
                      ? `${config.bgColor} border-current ${config.color}` 
                      : 'bg-gray-50 hover:bg-gray-100 border-transparent text-gray-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <div className="text-xs font-medium">{config.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Conversaciones ({filteredConversations.length})
              </h3>
            </div>

            {/* Conversaciones agrupadas por materia */}
            {Object.entries(conversationsBySubject).map(([subject, convs]) => {
              const config = subjectConfig[subject as Subject];
              const Icon = config.icon;
              
              return (
                <div key={subject} className="mb-4">
                  {/* Header de la materia */}
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs font-medium text-gray-600">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">({convs.length})</span>
                  </div>

                  {/* Lista de conversaciones */}
                  <div className="space-y-1">
                    {convs
                      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                      .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`
                          group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                          ${currentConversation?.id === conversation.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={() => onLoadConversation(conversation.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <div className="truncate text-sm text-gray-900">
                              {conversation.title}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatConversationDate(conversation.updatedAt)} • {conversation.messages.length} mensajes
                          </div>
                        </div>

                        {/* Botón de eliminar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id, conversation.title);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-700 transition-all"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Mensaje cuando no hay conversaciones */}
            {filteredConversations.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">
                  {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
                </p>
                <button
                  onClick={() => onNewConversation(selectedSubject)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Iniciar primera conversación
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Botón de estadísticas (solo para docentes) */}
          {user.role === 'teacher' && onShowStats && (
            <button
              onClick={onShowStats}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Ver estadísticas</span>
            </button>
          )}

          {/* Botón de configuración */}
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => {
              // Aquí se implementaría la funcionalidad de configuración
              console.log('Abrir configuración');
            }}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Configuración</span>
          </button>

          {/* Botón de cerrar sesión */}
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar sesión</span>
          </button>

          {/* Información del sistema */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              <p>Sistema v1.0</p>
              <p>Disponible offline</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};