// Simple script to generate self-signed certificates for development
import { execSync } from 'child_process';
import fs from 'fs';

const certPath = './cert.pem';
const keyPath = './key.pem';

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('✅ Certificates already exist');
    process.exit(0);
}

console.log('📜 Generating self-signed SSL certificate...');
console.log('⚠️  Note: You will see a security warning in your browser - this is normal for self-signed certificates');

try {
    // Try using PowerShell to create a self-signed certificate (Windows)
    const script = `
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\LocalMachine\\My" -NotAfter (Get-Date).AddYears(1)
$pwd = ConvertTo-SecureString -String "password" -Force -AsPlainText
$path = "cert:\\LocalMachine\\My\\$($cert.Thumbprint)"
Export-PfxCertificate -Cert $path -FilePath localhost.pfx -Password $pwd
`;

    fs.writeFileSync('create-cert.ps1', script);
    execSync('powershell -ExecutionPolicy Bypass -File create-cert.ps1', { stdio: 'inherit' });

    // Convert PFX to PEM format
    console.log('Converting certificate format...');
    execSync('openssl pkcs12 -in localhost.pfx -out cert.pem -nodes -nokeys -password pass:password', { stdio: 'inherit' });
    execSync('openssl pkcs12 -in localhost.pfx -out key.pem -nodes -nocerts -password pass:password', { stdio: 'inherit' });

    // Cleanup
    fs.unlinkSync('create-cert.ps1');
    fs.unlinkSync('localhost.pfx');

    console.log('✅ SSL certificates generated successfully!');
} catch (error) {
    console.error('❌ Failed to generate certificates:', error.message);
    console.log('\n📝 Manual steps to create certificates:');
    console.log('1. Install OpenSSL for Windows from: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('2. Run: openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout server/key.pem -out server/cert.pem -days 365');
    console.log('\nOR use the Vite basic-ssl plugin certificates from node_modules');
    process.exit(1);
}
