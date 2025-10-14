export type RoleStr = 'atendente' | 'caixa' | 'estoque';

export function getMultiplier(role: RoleStr) {
  switch (role) {
    case 'atendente': return 12;
    case 'caixa': return 3;
    case 'estoque': return 6;
    default: return 0;
  }
}

export function calculatePointsFromReais(valueReais: number, role: RoleStr) {
  const cents = Math.round(valueReais * 100);
  const multiplier = getMultiplier(role);
  const points = Math.round((cents * multiplier) / 100); 
  return { cents, points };
}
