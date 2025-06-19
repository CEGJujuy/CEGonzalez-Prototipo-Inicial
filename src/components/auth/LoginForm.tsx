// Componente de formulario de inicio de sesión
// Maneja la autenticación de usuarios (estudiantes y docentes)

import React, { useState } from 'react';
import { UserRole, Subject } from '../../types';
import { User, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

// Interface para las props del componente
interface LoginFormProps {
  onLogin: (userData: {
    name: string;
    role: UserRole;
    grade?: string;
    subjects?: Subject[];
  }) => boolean;
  validateUserData: (userData: any) => { isValid: boolean; errors: string[] };
}

// Componente principal del formulario de login
export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, validateUserData }) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',           // Nombre del usuario
    role: '' as UserRole, // Rol seleccionado
    grade: '',          // Grado (para estudiantes)
    subjects: [] as Subject[] // Materias de interés
  });
  
  // Estados de la UI
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de materias disponibles
  const availableSubjects: { value: Subject; label: string }[] = [
    { value: 'matematicas', label: 'Matemáticas' },
    { value: 'ciencias', label: 'Ciencias Naturales' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'historia', label: 'Historia' },
    { value: 'literatura', label: 'Literatura' },
    { value: 'ingles', label: 'Inglés' }
  ];

  // Lista de grados disponibles para estudiantes
  const availableGrades = [
    '1° Secundaria', '2° Secundaria', '3° Secundaria',
    '4° Secundaria', '5° Secundaria', '6° Secundaria'
  ];

  // Maneja los cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpia errores cuando el usuario empieza a escribir
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Maneja la selección de materias (checkbox múltiple)
  const handleSubjectChange = (subject: Subject, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      subjects: isChecked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Valida los datos del formulario
      const validation = validateUserData(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Intenta realizar el login
      const success = onLogin(formData);
      
      if (!success) {
        setErrors(['Error al inicializar sesión. Por favor, intenta nuevamente.']);
      }
      
    } catch (error) {
      console.error('Error during form submission:', error);
      setErrors(['Ocurrió un error inesperado. Por favor, intenta nuevamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header del formulario */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Asistente Virtual Educativo
          </h1>
          <p className="text-gray-600">
            Tu compañero de aprendizaje inteligente
          </p>
        </div>

        {/* Formulario principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo de nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ingresa tu nombre completo"
                disabled={isSubmitting}
              />
            </div>

            {/* Selector de rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Cuál es tu rol?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Opción: Estudiante */}
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'role', value: 'student' } } as any)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'student'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Estudiante</div>
                </button>

                {/* Opción: Docente */}
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'role', value: 'teacher' } } as any)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'teacher'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <GraduationCap className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Docente</div>
                </button>
              </div>
            </div>

            {/* Campo de grado (solo para estudiantes) */}
            {formData.role === 'student' && (
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                  Grado académico
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona tu grado</option>
                  {availableGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector de materias de interés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Materias de interés {formData.role === 'teacher' && '(que enseñas)'}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableSubjects.map(subject => (
                  <label key={subject.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject.value)}
                      onChange={(e) => handleSubjectChange(subject.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">{subject.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selecciona las materias que más te interesan (opcional)
              </p>
            </div>

            {/* Mostrar errores de validación */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Por favor, corrige los siguientes errores:
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              } text-white`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Comenzar a aprender'
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center space-y-2">
              <p>
                🔒 Tus datos se almacenan localmente en tu dispositivo y son completamente privados.
              </p>
              <p>
                💡 Este asistente funciona offline una vez cargado, perfecto para entornos con conectividad limitada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};