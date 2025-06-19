// Hook personalizado para manejo de autenticación
// Gestiona el estado del usuario y funciones de login/logout

import { useState, useEffect } from 'react';
import { User, UserRole, Subject } from '../types';
import { StorageService } from '../services/storageService';

// Hook personalizado para autenticación
export const useAuth = () => {
  // Estado del usuario actual
  const [user, setUser] = useState<User | null>(null);
  // Estado de carga durante la autenticación
  const [loading, setLoading] = useState(true);

  // Efecto para cargar el usuario al inicializar la aplicación
  useEffect(() => {
    // Intenta cargar el usuario desde el almacenamiento local
    const loadUser = () => {
      try {
        const savedUser = StorageService.getUser();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Error loading user on initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función para iniciar sesión de un usuario
  const login = (userData: {
    name: string;
    role: UserRole;
    grade?: string;
    subjects?: Subject[];
  }) => {
    try {
      // Crea un nuevo objeto usuario con ID único
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: userData.name.trim(),
        role: userData.role,
        grade: userData.grade?.trim(),
        subjects: userData.subjects || []
      };

      // Guarda el usuario en estado y almacenamiento
      setUser(newUser);
      StorageService.saveUser(newUser);
      
      console.log(`User logged in: ${newUser.name} (${newUser.role})`);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    try {
      // Limpia el estado y el almacenamiento
      setUser(null);
      StorageService.clearUser();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Función para actualizar los datos del usuario
  const updateUser = (updates: Partial<User>) => {
    try {
      if (!user) {
        console.error('No user to update');
        return false;
      }

      // Crea un usuario actualizado manteniendo el ID
      const updatedUser: User = {
        ...user,
        ...updates,
        id: user.id // Asegura que el ID no cambie
      };

      // Actualiza el estado y el almacenamiento
      setUser(updatedUser);
      StorageService.saveUser(updatedUser);
      
      console.log('User data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  // Función para verificar si el usuario tiene acceso a una funcionalidad
  const hasAccess = (requiredRole?: UserRole): boolean => {
    if (!user) return false;
    if (!requiredRole) return true;
    return user.role === requiredRole;
  };

  // Función para verificar si el usuario está interesado en una materia
  const isInterestedInSubject = (subject: Subject): boolean => {
    if (!user || !user.subjects) return true; // Si no hay preferencias, permite todas
    return user.subjects.includes(subject);
  };

  // Función para agregar una materia a las preferencias del usuario
  const addSubjectInterest = (subject: Subject): boolean => {
    try {
      if (!user) return false;
      
      const currentSubjects = user.subjects || [];
      if (currentSubjects.includes(subject)) {
        return true; // Ya está agregada
      }

      const updatedSubjects = [...currentSubjects, subject];
      return updateUser({ subjects: updatedSubjects });
    } catch (error) {
      console.error('Error adding subject interest:', error);
      return false;
    }
  };

  // Función para remover una materia de las preferencias
  const removeSubjectInterest = (subject: Subject): boolean => {
    try {
      if (!user) return false;
      
      const currentSubjects = user.subjects || [];
      const updatedSubjects = currentSubjects.filter(s => s !== subject);
      
      return updateUser({ subjects: updatedSubjects });
    } catch (error) {
      console.error('Error removing subject interest:', error);
      return false;
    }
  };

  // Función para obtener información del perfil del usuario
  const getUserProfile = () => {
    if (!user) return null;
    
    return {
      ...user,
      isStudent: user.role === 'student',
      isTeacher: user.role === 'teacher',
      hasGrade: Boolean(user.grade),
      subjectCount: user.subjects?.length || 0,
      profileComplete: Boolean(user.name && user.role && (user.role === 'teacher' || user.grade))
    };
  };

  // Función para validar los datos del usuario
  const validateUserData = (userData: {
    name: string;
    role: UserRole;
    grade?: string;
    subjects?: Subject[];
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validación del nombre
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    // Validación del rol
    if (!userData.role || !['student', 'teacher'].includes(userData.role)) {
      errors.push('Debe seleccionar un rol válido');
    }
    
    // Validación del grado (obligatorio para estudiantes)
    if (userData.role === 'student' && (!userData.grade || userData.grade.trim().length === 0)) {
      errors.push('Los estudiantes deben indicar su grado');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Retorna el estado y las funciones del hook
  return {
    // Estado
    user,
    loading,
    isAuthenticated: !!user,
    
    // Funciones de autenticación
    login,
    logout,
    updateUser,
    
    // Funciones de utilidad
    hasAccess,
    isInterestedInSubject,
    addSubjectInterest,
    removeSubjectInterest,
    getUserProfile,
    validateUserData
  };
};