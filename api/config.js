import { Buffer } from 'node:buffer';

const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_OWNER = process.env.GH_OWNER || 'varasjaime777-alt';
const GH_REPO = process.env.GH_REPO || 'mail-office365';
const CONFIG_PATH = 'config.json';
const GITHUB_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${CONFIG_PATH}`;

const headers = {
  'Authorization': `token ${GH_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'MailOffice365Panel/1.0'
};

async function githubRead() {
  const res = await fetch(GITHUB_API, { method: 'GET', headers });
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

async function githubWrite(content) {
  const res = await fetch(GITHUB_API, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'Actualización del panel de configuración',
      content: Buffer.from(content).toString('base64'),
      sha: (await githubReadSha()) || undefined
    })
  });
  if (!res.ok) throw new Error(`GitHub write error: ${res.status}`);
  return res.json();
}

async function githubReadSha() {
  const res = await fetch(GITHUB_API, { method: 'GET', headers });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

export default async function handler(req, res) {
  const method = req.method;

  try {
    if (method === 'GET') {
      // Leer configuración
      let config = {};
      try {
        config = await githubRead();
      } catch (e) {
        console.error('Error leyendo config:', e.message);
        config = {};
      }
      return res.status(200).json({ success: true, config });
    }

    if (method === 'PUT' || method === 'PATCH') {
      // Actualizar configuración
      const body = req.body || {};
      const newConfig = body.config || {};

      let currentConfig = {};
      try {
        currentConfig = await githubRead();
      } catch (e) {
        currentConfig = {};
      }

      const updatedConfig = { ...currentConfig, ...newConfig };
      const content = JSON.stringify(updatedConfig, null, 2);

      await githubWrite(content);

      return res.status(200).json({
        success: true,
        message: 'Configuración actualizada',
        config: updatedConfig
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Error en API config:', err);
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
