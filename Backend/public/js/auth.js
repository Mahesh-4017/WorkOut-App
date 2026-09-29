import { get, post, patch } from './api.js';
export async function currentAdmin() { try { return (await get('/auth/me')).data.admin; } catch { return null; } }
export async function logout() { await post('/auth/logout', {}); window.location.href = '/login.html'; }
export async function guard() { const admin = await currentAdmin(); if (!admin) { window.location.href = '/login.html'; return null; } return admin; }
export async function changePassword(currentPassword, newPassword) { return patch('/auth/password', { currentPassword, newPassword }); }
