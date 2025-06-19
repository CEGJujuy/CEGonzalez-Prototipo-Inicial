// Componente de panel de estadísticas
// Muestra métricas de uso para docentes y análisis de aprendizaje

import React, { useMemo } from 'react';
import { User, UsageStats, Conversation, Subject } from '../../types';
import { 
  BarChart3, Users, MessageSquare, TrendingUp, 
  BookOpen, Clock, Award, Target, X 
} from 'lucide-react';

// Interface para las props del componente
interface StatsPanelProps {
  user: User;                           // Usuario actual (debe ser docente)
  conversations: Conversation[];        // Todas las conversaciones del sistema
  usageStats: UsageStats;              // Estadísticas de uso
  onClose: () => void;                 // Función para cerrar el panel
}

// Componente principal del panel de estadísticas
export const StatsPanel: React.FC<StatsPanelProps> = ({
  user,
  conversations,
  usageStats,
  onClose
}) => {
  
  // Cálculos memoizados para optimizar rendimiento
  const analytics = useMemo(() => {
    // Filtra conversaciones del usuario actual si es necesario
    const userConversations = conversations.filter(conv => conv.userId === user.id);
    
    // Calcula métricas básicas
    const totalConversations = userConversations.length;
    const totalMessages = userConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const avgMessagesPerConv = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
    
    // Distribución por materia
    const subjectDistribution = userConversations.reduce((acc, conv) => {
      acc[conv.subject] = (acc[conv.subject] || 0) + 1;
      return acc;
    }, {} as Record<Subject, number>);
    
    // Conversaciones por día (últimos 7 días)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailyActivity = last7Days.map(date => {
      const count = userConversations.filter(conv => 
        conv.createdAt.toISOString().split('T')[0] === date
      ).length;
      return { date, count };
    });
    
    // Materia más popular
    const mostPopularSubject = Object.entries(subjectDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as Subject;
    
    // Tiempo promedio de conversación (estimado)
    const avgConversationDuration = userConversations.length > 0 
      ? Math.round(userConversations.reduce((sum, conv) => {
          const duration = conv.updatedAt.getTime() - conv.createdAt.getTime();
          return sum + (duration / (1000 * 60)); // En minutos
        }, 0) / userConversations.length)
      : 0;

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConv,
      subjectDistribution,
      dailyActivity,
      mostPopularSubject,
      avgConversationDuration
    };
  }, [conversations, user.id]);

  // Configuración de materias para visualización
  const subjectConfig: Record<Subject, { label: string; color: string }> = {
    matematicas: { label: 'Matemáticas', color: 'bg-blue-500' },
    ciencias: { label: 'Ciencias Naturales', color: 'bg-green-500' },
    fisica: { label: 'Física', color: 'bg-yellow-500' },
    quimica: { label: 'Química', color: 'bg-purple-500' },
    historia: { label: 'Historia', color: 'bg-amber-500' },
    literatura: { label: 'Literatura', color: 'bg-pink-500' },
    ingles: { label: 'Inglés', color: 'bg-indigo-500' }
  };

  // Formatea números grandes
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Obtiene el porcentaje máximo para las barras
  const maxSubjectCount = Math.max(...Object.values(analytics.subjectDistribution));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header del panel */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Panel de Estadísticas</h2>
              <p className="text-blue-100">
                Análisis de uso del asistente educativo - {user.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total de conversaciones */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Conversaciones</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalConversations}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Total de mensajes */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Mensajes</p>
                  <p className="text-3xl font-bold text-green-900">{formatNumber(analytics.totalMessages)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Promedio por conversación */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Promedio/Conversación</p>
                  <p className="text-3xl font-bold text-amber-900">{analytics.avgMessagesPerConv}</p>
                </div>
                <Target className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            {/* Tiempo promedio */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Duración Promedio</p>
                  <p className="text-3xl font-bold text-purple-900">{analytics.avgConversationDuration}m</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Distribución por materia */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Materia</h3>
              </div>
              
              <div className="space-y-4">
                {Object.entries(analytics.subjectDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([subject, count]) => {
                    const config = subjectConfig[subject as Subject];
                    const percentage = maxSubjectCount > 0 ? (count / maxSubjectCount) * 100 : 0;
                    
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {config.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {count} conversaciones ({Math.round((count / analytics.totalConversations) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${config.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Materia más popular */}
              {analytics.mostPopularSubject && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Materia más consultada: {subjectConfig[analytics.mostPopularSubject].label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actividad diaria */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Actividad Diaria (7 días)</h3>
              </div>
              
              <div className="space-y-3">
                {analytics.dailyActivity.map((day, index) => {
                  const maxCount = Math.max(...analytics.dailyActivity.map(d => d.count));
                  const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
                  const dayNumber = date.getDate();
                  
                  return (
                    <div key={day.date} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {dayName} {dayNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {day.count} conversaciones
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen de tendencia */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Resumen de la semana:</p>
                  <p>
                    Total: {analytics.dailyActivity.reduce((sum, day) => sum + day.count, 0)} conversaciones
                  </p>
                  <p>
                    Promedio diario: {Math.round(analytics.dailyActivity.reduce((sum, day) => sum + day.count, 0) / 7)} conversaciones
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones para docentes */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              💡 Recomendaciones Pedagógicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
              <div>
                <h4 className="font-medium mb-2">Fortalezas detectadas:</h4>
                <ul className="space-y-1 text-indigo-700">
                  <li>• Alta interacción en {subjectConfig[analytics.mostPopularSubject]?.label}</li>
                  <li>• Promedio de {analytics.avgMessagesPerConv} mensajes por sesión</li>
                  <li>• Uso constante del sistema</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Oportunidades de mejora:</h4>
                <ul className="space-y-1 text-indigo-700">
                  <li>• Promover uso en materias menos consultadas</li>
                  <li>• Incentivar sesiones más largas</li>
                  <li>• Implementar challenges educativos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Datos actualizados en tiempo real</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};