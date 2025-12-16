'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorFirmaEmail.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Template = 'minimal' | 'corporate' | 'creative' | 'social';

interface FormData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  imageUrl: string;
  primaryColor: string;
}

const defaultData: FormData = {
  name: 'Juan García',
  title: 'Director Comercial',
  company: 'Empresa ABC S.L.',
  phone: '+34 612 345 678',
  email: 'juan@empresa.com',
  website: 'www.empresa.com',
  linkedin: '',
  twitter: '',
  instagram: '',
  imageUrl: '',
  primaryColor: '#2E86AB',
};

export default function GeneradorFirmaEmailPage() {
  const [formData, setFormData] = useState<FormData>(defaultData);
  const [template, setTemplate] = useState<Template>('minimal');
  const [copied, setCopied] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateHTML = useMemo(() => {
    const { name, title, company, phone, email, website, linkedin, twitter, instagram, imageUrl, primaryColor } = formData;

    // Estilos inline para máxima compatibilidad
    const styles = {
      container: `font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.4;`,
      name: `font-size: 16px; font-weight: bold; color: ${primaryColor}; margin: 0;`,
      title: `font-size: 13px; color: #666666; margin: 2px 0;`,
      company: `font-size: 13px; color: #666666; margin: 2px 0; font-weight: 600;`,
      divider: `border-left: 2px solid ${primaryColor}; padding-left: 12px; margin-left: 12px;`,
      link: `color: ${primaryColor}; text-decoration: none;`,
      icon: `width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;`,
      socialIcon: `width: 24px; height: 24px; margin-right: 8px;`,
      image: `width: 80px; height: 80px; border-radius: 50%; object-fit: cover;`,
    };

    // Iconos SVG en data URI
    const icons = {
      phone: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + primaryColor + '"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>')}`,
      email: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + primaryColor + '"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>')}`,
      web: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + primaryColor + '"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>')}`,
      linkedin: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>')}`,
      twitter: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>')}`,
      instagram: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E4405F"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>')}`,
    };

    // Plantilla Minimal
    if (template === 'minimal') {
      return `<table cellpadding="0" cellspacing="0" border="0" style="${styles.container}">
  <tr>
    <td style="padding: 10px 0;">
      <p style="${styles.name}">${name}</p>
      ${title ? `<p style="${styles.title}">${title}</p>` : ''}
      ${company ? `<p style="${styles.company}">${company}</p>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
        ${phone ? `<tr><td style="padding: 3px 0;"><img src="${icons.phone}" style="${styles.icon}"><a href="tel:${phone.replace(/\s/g, '')}" style="${styles.link}">${phone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding: 3px 0;"><img src="${icons.email}" style="${styles.icon}"><a href="mailto:${email}" style="${styles.link}">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding: 3px 0;"><img src="${icons.web}" style="${styles.icon}"><a href="https://${website.replace(/^https?:\/\//, '')}" style="${styles.link}">${website}</a></td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    // Plantilla Corporate (con imagen)
    if (template === 'corporate') {
      return `<table cellpadding="0" cellspacing="0" border="0" style="${styles.container}">
  <tr>
    ${imageUrl ? `<td style="vertical-align: top; padding-right: 15px;">
      <img src="${imageUrl}" alt="${name}" style="${styles.image}">
    </td>` : ''}
    <td style="vertical-align: top; ${imageUrl ? styles.divider : ''}">
      <p style="${styles.name}">${name}</p>
      ${title ? `<p style="${styles.title}">${title}</p>` : ''}
      ${company ? `<p style="${styles.company}">${company}</p>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
        ${phone ? `<tr><td style="padding: 3px 0;"><img src="${icons.phone}" style="${styles.icon}"><a href="tel:${phone.replace(/\s/g, '')}" style="${styles.link}">${phone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding: 3px 0;"><img src="${icons.email}" style="${styles.icon}"><a href="mailto:${email}" style="${styles.link}">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding: 3px 0;"><img src="${icons.web}" style="${styles.icon}"><a href="https://${website.replace(/^https?:\/\//, '')}" style="${styles.link}">${website}</a></td></tr>` : ''}
      </table>
    </td>
  </tr>
</table>`;
    }

    // Plantilla Creative (horizontal)
    if (template === 'creative') {
      return `<table cellpadding="0" cellspacing="0" border="0" style="${styles.container}">
  <tr>
    <td style="padding: 15px; background: linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%); border-radius: 8px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 20px; border-right: 2px solid ${primaryColor};">
            <p style="${styles.name}">${name}</p>
            ${title ? `<p style="${styles.title}">${title}</p>` : ''}
            ${company ? `<p style="${styles.company}">${company}</p>` : ''}
          </td>
          <td style="padding-left: 20px;">
            ${phone ? `<p style="margin: 4px 0;"><img src="${icons.phone}" style="${styles.icon}"><a href="tel:${phone.replace(/\s/g, '')}" style="${styles.link}">${phone}</a></p>` : ''}
            ${email ? `<p style="margin: 4px 0;"><img src="${icons.email}" style="${styles.icon}"><a href="mailto:${email}" style="${styles.link}">${email}</a></p>` : ''}
            ${website ? `<p style="margin: 4px 0;"><img src="${icons.web}" style="${styles.icon}"><a href="https://${website.replace(/^https?:\/\//, '')}" style="${styles.link}">${website}</a></p>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    }

    // Plantilla Social (con redes sociales)
    if (template === 'social') {
      const hasSocial = linkedin || twitter || instagram;
      return `<table cellpadding="0" cellspacing="0" border="0" style="${styles.container}">
  <tr>
    <td style="padding: 10px 0;">
      <p style="${styles.name}">${name}</p>
      ${title ? `<p style="${styles.title}">${title}</p>` : ''}
      ${company ? `<p style="${styles.company}">${company}</p>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
        ${phone ? `<tr><td style="padding: 3px 0;"><img src="${icons.phone}" style="${styles.icon}"><a href="tel:${phone.replace(/\s/g, '')}" style="${styles.link}">${phone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding: 3px 0;"><img src="${icons.email}" style="${styles.icon}"><a href="mailto:${email}" style="${styles.link}">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding: 3px 0;"><img src="${icons.web}" style="${styles.icon}"><a href="https://${website.replace(/^https?:\/\//, '')}" style="${styles.link}">${website}</a></td></tr>` : ''}
      </table>
      ${hasSocial ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
        <tr>
          ${linkedin ? `<td><a href="https://linkedin.com/in/${linkedin}"><img src="${icons.linkedin}" style="${styles.socialIcon}" alt="LinkedIn"></a></td>` : ''}
          ${twitter ? `<td><a href="https://twitter.com/${twitter}"><img src="${icons.twitter}" style="${styles.socialIcon}" alt="Twitter"></a></td>` : ''}
          ${instagram ? `<td><a href="https://instagram.com/${instagram}"><img src="${icons.instagram}" style="${styles.socialIcon}" alt="Instagram"></a></td>` : ''}
        </tr>
      </table>` : ''}
    </td>
  </tr>
</table>`;
    }

    return '';
  }, [formData, template]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData(defaultData);
  };

  const templates: { id: Template; name: string; desc: string }[] = [
    { id: 'minimal', name: 'Minimalista', desc: 'Simple y elegante' },
    { id: 'corporate', name: 'Corporativa', desc: 'Con foto de perfil' },
    { id: 'creative', name: 'Creativa', desc: 'Diseño horizontal' },
    { id: 'social', name: 'Social', desc: 'Con redes sociales' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Firmas de Email</h1>
        <p className={styles.subtitle}>
          Crea firmas profesionales HTML para Gmail, Outlook y más
        </p>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Datos personales</h3>

          <div className={styles.formGroup}>
            <label>Nombre completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cargo / Puesto</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Director, Manager, etc."
            />
          </div>

          <div className={styles.formGroup}>
            <label>Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+34 612 345 678"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Sitio web</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="www.tuempresa.com"
            />
          </div>

          <h3 className={styles.sectionTitle}>Redes sociales (opcional)</h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>LinkedIn</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="usuario"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Twitter/X</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => updateField('twitter', e.target.value)}
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => updateField('instagram', e.target.value)}
              placeholder="@usuario"
            />
          </div>

          <h3 className={styles.sectionTitle}>Personalización</h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>URL imagen de perfil</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Color principal</label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className={styles.colorInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>Plantilla</h3>

          <div className={styles.templateGrid}>
            {templates.map(t => (
              <button
                key={t.id}
                className={`${styles.templateBtn} ${template === t.id ? styles.active : ''}`}
                onClick={() => setTemplate(t.id)}
              >
                <span className={styles.templateName}>{t.name}</span>
                <span className={styles.templateDesc}>{t.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>Vista previa</h3>

          <div
            className={styles.previewBox}
            dangerouslySetInnerHTML={{ __html: generateHTML }}
          />

          <div className={styles.buttonRow}>
            <button onClick={handleCopy} className={styles.btnPrimary}>
              {copied ? '¡Copiado!' : 'Copiar HTML'}
            </button>
            <button onClick={handleReset} className={styles.btnSecondary}>
              Restablecer
            </button>
          </div>
        </div>
      </div>

      <div className={styles.instructionsSection}>
        <h2>Cómo usar tu firma</h2>
        <div className={styles.instructionsGrid}>
          <div className={styles.instructionCard}>
            <h3>Gmail</h3>
            <ol>
              <li>Abre Gmail y ve a Configuración (rueda dentada)</li>
              <li>Busca la sección "Firma"</li>
              <li>Pega el HTML copiado</li>
              <li>Guarda los cambios</li>
            </ol>
          </div>
          <div className={styles.instructionCard}>
            <h3>Outlook</h3>
            <ol>
              <li>Ve a Archivo → Opciones → Correo</li>
              <li>Haz clic en "Firmas"</li>
              <li>Crea una nueva firma y pega el HTML</li>
              <li>Selecciónala como predeterminada</li>
            </ol>
          </div>
          <div className={styles.instructionCard}>
            <h3>Apple Mail</h3>
            <ol>
              <li>Ve a Mail → Preferencias → Firmas</li>
              <li>Crea una nueva firma</li>
              <li>Pega el contenido</li>
              <li>Asígnala a tu cuenta</li>
            </ol>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-firma-email')} />

      <Footer appName="generador-firma-email" />
    </div>
  );
}
