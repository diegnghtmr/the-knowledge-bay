import interestApi from './interestApi.js';

export async function fetchInterests(signal) {
  try {
    const interests = await interestApi.getAllInterests({ signal, headers: { 'Cache-Control': 'no-cache' } });
    return Array.isArray(interests) ? interests : [];
  } catch {
    return [];
  }
}
