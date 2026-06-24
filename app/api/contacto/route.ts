import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Instanciar Resend dentro del handler (no en el nivel del módulo): así el
    // build local prebuilt no requiere la clave (que es Sensitive y no se
    // descarga con `vercel pull`). En producción Vercel inyecta la clave real
    // en runtime, por lo que el envío de emails funciona igual.
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { asunto, mensaje, honeypot } = body;

    // Honeypot: si está relleno es un bot → ignorar silenciosamente
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validación básica
    if (!asunto || typeof asunto !== 'string' || asunto.trim().length === 0) {
      return NextResponse.json({ error: 'El asunto es obligatorio' }, { status: 400 });
    }
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
      return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
    }
    if (mensaje.length > 2000) {
      return NextResponse.json({ error: 'El mensaje no puede superar los 2000 caracteres' }, { status: 400 });
    }
    if (asunto.length > 200) {
      return NextResponse.json({ error: 'El asunto es demasiado largo' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'meskeIA Contacto <noreply@meskeia.com>',
      to: ['meskeia@proton.me'],
      subject: `[meskeIA] ${asunto.trim()}`,
      text: [
        'Nuevo mensaje de contacto desde meskeIA',
        '',
        `Asunto: ${asunto.trim()}`,
        '',
        'Mensaje:',
        mensaje.trim(),
        '',
        '---',
        'Formulario de contacto anónimo de meskeIA',
        'No se han recopilado datos personales del remitente.',
      ].join('\n'),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error en /api/contacto:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
