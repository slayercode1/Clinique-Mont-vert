export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};
