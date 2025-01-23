// Fonction pour vérifier si le rôle de l'utilisateur est autorisé

export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};
