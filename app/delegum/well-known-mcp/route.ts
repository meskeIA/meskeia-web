/**
 * Server Card MCP de Delegum — discovery para clientes y registros MCP.
 *
 * Se sirve en `delegum.com/.well-known/mcp/server-card.json` mediante un rewrite
 * por host en next.config.ts (los ficheros estáticos de public/ no pueden variar
 * según el dominio, y meskeIA ya tiene su propia tarjeta estática en
 * public/.well-known/mcp/server-card.json para el host meskeia.com).
 *
 * A diferencia de la tarjeta de meskeIA (catálogo amplio, modelo «biblioteca»),
 * esta describe Delegum como vertical fiscal/laboral/financiero de España
 * (modelo «gestoría»): 48 herramientas, 7 de ellas de escenario.
 *
 * El endpoint real es delegum.com/api/mcp/ (rewrite por host → /api/mcp/delegum).
 */
export const dynamic = 'force-static';

const SERVER_CARD = {
  $schema: 'https://modelcontextprotocol.io/schemas/server-card/v1.0',
  version: '1.0',
  protocolVersion: '2025-06-18',
  serverInfo: {
    name: 'delegum-mcp',
    title: 'Delegum MCP',
    version: '1.0.0',
    description:
      '48 herramientas de fiscalidad, derecho laboral y finanzas en España. IRPF, ' +
      'autónomos (cuota RETA, modelos 130 y 303, gastos deducibles), nóminas (bruto → neto), ' +
      'despidos (indemnización, finiquito, paro), herencias y donaciones por comunidad autónoma, ' +
      'jubilación y pensiones, hipotecas y compraventa de vivienda. Incluye herramientas de ' +
      'escenario que orquestan varios cálculos a la vez, como haría una gestoría. ' +
      'Normativa española verificada. Sin registro, sin API key.',
    homepage: 'https://delegum.com/asistente-ia/',
  },
  description:
    'Servidor MCP público de Delegum, asistente orientativo de fiscalidad, derecho laboral y ' +
    'finanzas en España. 48 herramientas especializadas, incluidas 7 consultas de escenario tipo ' +
    'gestoría (autónomo, nómina, despido, herencia, jubilación, compra y venta de vivienda) que ' +
    'combinan varios cálculos en un único análisis integrado. Compatible con Claude, ChatGPT, ' +
    'Mistral y cualquier cliente MCP estándar. Gratuito, sin registro, sin API key. Cada respuesta ' +
    'incluye un aviso legal sobre el carácter orientativo del cálculo.',
  iconUrl: 'https://meskeia.com/delegum/app-icon-512.png',
  documentationUrl: 'https://delegum.com/asistente-ia/',
  termsOfServiceUrl: 'https://meskeia.com/developers/terminos/',
  transport: {
    type: 'streamable-http',
    url: 'https://delegum.com/api/mcp/',
  },
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
  },
  authentication: {
    required: false,
    schemes: [],
  },
  tags: ['finance', 'fiscal', 'legal', 'tax', 'labor', 'pensions', 'real-estate', 'spain', 'spanish'],
};

export function GET() {
  return new Response(JSON.stringify(SERVER_CARD, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
