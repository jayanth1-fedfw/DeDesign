import axios from 'axios';

// In dev, Vite proxies "/api" to the local backend (see vite.config.js).
// That proxy doesn't exist in a production build, so a deployed site needs
// a real backend URL — set VITE_API_URL to wherever server/ is hosted.
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function analyzeDesign(file, palette) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('palette', JSON.stringify(palette));

  const { data } = await axios.post(`${API_BASE}/api/analyze`, formData);

  if (!data || !Array.isArray(data.zones) || !Array.isArray(data.steps)) {
    throw new Error('Backend returned an unexpected response.');
  }

  return data;
}
