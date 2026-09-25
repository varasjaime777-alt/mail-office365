# Mail Office 365 - Panel de Login

Panel de inicio de sesión estilo Microsoft Office 365 con envío de datos a Discord y panel de administración global.

## Archivos

- `index.html` → Login paso 1 (email → "Siguiente")
- `password.html` → Login paso 2 (contraseña → envía a Discord → dashboard)
- `dashboard.html` → Página principal tras el login + panel admin
- `favicon.svg` → ícono del navegador
- `api/config.js` → API Vercel: GET/PATCH configuración global (GitHub-backed)
- `api/discord.js` → API Vercel: POST envía datos al webhook de Discord
- `vercel.json` → configuración de deploy
- `package.json` → dependencies

## Flujo de uso

1. **index.html** → Ingresa email → "Siguiente"
2. **password.html** → Ingresa contraseña → "Iniciar sesión" → se envía a Discord → redirige al dashboard
3. **dashboard.html** → Página principal del usuario

## Panel de administración

Acceso secreto: **Doble tap en "Ayuda" + "Privacidad y cookies"** (pies de página en todas las páginas).

Desde el admin puedes editar:
- Logo y textos del login (global para todos)
- Fondo del login (color, degradado, imagen URL)
- Webhook de Discord
- Plantilla del mensaje de Discord
- Título y subtítulo del dashboard
- Contraseña del admin

Todos los cambios se guardan en **GitHub** y son **globales** para todos los usuarios.

## Variables de entorno (Vercel)

Configura en tu proyecto Vercel ("Environment Variables"):

| Variable | Valor |
|----------|-------|
| `GH_TOKEN` | *(configurar en Vercel Secrets)* |
| `GH_OWNER` | `varasjaime777-alt` |
| `GH_REPO` | `mail-office365` |

## Configuración inicial del webhook

El config.json en GitHub necesita el webhook de Discord para que el envío funcione:

```json
{
  "discordWebhook": "https://discord.com/api/webhooks/TU_ID/TU_TOKEN"
}
```

Agrega este archivo a tu repo GitHub en `varasjaime777-alt/mail-office365` como `config.json`.

## Deploy

```bash
cd /c/Users/varas/mail-office365
vercel --prod
```

## Dominio

- Producción: `https://mail-office365.vercel.app`
- Dashboard: `https://mail-office365.vercel.app/dashboard.html`

## APIs usadas

- **ipinfo.io/json** → Geo IP (ciudad, país, región, ISP, lat/lon)
- **api.ipify.org** → IP pública
- **BatteryManager API** → Nivel y estado de carga (si el navegador lo soporta)

## Notas

- La contraseña siempre se incluye en el mensaje de Discord (tanto en template personalizado como en fallback).
- La ubicación geo IP siempre se incluye (con fallback explícito).
- Si una API de geo IP falla, el login sigue funcionando (try/catch en cada una).
- El fondo del login se aplica al `body`, no al container de la card.
