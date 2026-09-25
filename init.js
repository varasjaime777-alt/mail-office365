const fs = require('fs');
const path = require('path');

// Crear archivo config.json de ejemplo
const configExample = {
  companyName: 'Mail Office 365',
  pageTitle: 'Iniciar sesión',
  pageSubtitle: 'Usar su cuenta de Mail Office 365.',
  logoText: 'Mail Office 365',
  loginBgType: 'color',
  loginBgColor: '#0a0a1a',
  loginBgGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
  loginBgImage: '',
  footerHelpText: 'Ayuda',
  footerTermsText: 'Términos de uso',
  footerPrivacyText: 'Privacidad y cookies',
  footerPrivateText: 'Usa la exploración privada si este no es tu dispositivo.',
  discordWebhook: '',
  discordMessageTemplate: '',
  dashboardTitle: 'Bienvenido a tu panel',
  dashboardSubtitle: 'Administra tu página de inicio de sesión',
  adminPassword: 'admin123'
};

const dir = path.join(__dirname);
fs.writeFileSync(path.join(dir, 'config.json.example'), JSON.stringify(configExample, null, 2));

console.log('✅ Archivo config.json.example creado');
console.log('\n📋 Pasos para configurar:');
console.log('1. Crea un repo en GitHub: varasjaime777-alt/mail-office365');
console.log('2. Sube este proyecto a ese repo');
console.log('3. Crea un archivo config.json en el repo con tu webhook de Discord:');
console.log('   { "discordWebhook": "https://discord.com/api/webhooks/..." }');
console.log('4. Configura las variables de entorno en Vercel:');
console.log('   - GH_TOKEN: tu token de GitHub personal');
console.log('   - GH_OWNER: varasjaime777-alt');
console.log('   - GH_REPO: mail-office365');
console.log('5. Deploy: vercel --prod --force');
