"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultiplier = getMultiplier;
exports.calculatePointsFromReais = calculatePointsFromReais;
function getMultiplier(role) {
    switch (role) {
        case 'tendente': return 12;
        case 'caixa': return 3;
        case 'estoque': return 6;
        default: return 0;
    }
}
function calculatePointsFromReais(valueReais, role) {
    const cents = Math.round(valueReais * 100);
    const multiplier = getMultiplier(role);
    const points = Math.round((cents * multiplier) / 100);
    return { cents, points };
}
