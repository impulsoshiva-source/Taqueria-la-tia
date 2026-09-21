'use client';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useId, useReducer, useRef, useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════════════
   TAQUERÍA LA TÍA · Sitio multipágina (Next.js-ready · App.jsx único)
   Rutas por hash · Menú personalizable · Carrito · Checkout por WhatsApp
   Taquizas sin popups · WCAG 2.2 AA · prefers-reduced-motion · SEO/JSON-LD
   ══════════════════════════════════════════════════════════════════════════ */

/* ───────────────────────── 0. ASSETS AUTORIZADOS ──────────────────────── */
/* Raw asset del CDN autorizado (nunca la URL /blob/ de GitHub).
   Equivalente local en Next.js: /assets/brand/logo.webp                       */
const ASSETS = {
  logo: 'https://raw.githubusercontent.com/impulsoshiva-source/cdn_assets/main/Taqueria%20la%20tia/assets/menu/Logo_taqueria_la_tia.webp',
  logoAlt: 'Logotipo de Taquería La Tía',
};

/* ───────────────────────── 1. TOKENS / ESTILOS GLOBALES ───────────────── */

const GLOBAL_CSS = `
@import url('https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-400-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-500-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-700-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-800-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/rubik@latest/latin-900-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.css');
@import url('https://cdn.jsdelivr.net/fontsource/fonts/grandstander@latest/latin-700-normal.css');

:root{
  --salsa-red:#C81D25; --maize-yellow:#FFB800; --pastor-orange:#E85D04;
  --warm-cream:#FFFDF9; --section-cream:#F9F5F0; --charcoal:#1E1E1E;
  --secondary-text:#5C5C5C; --success-green:#2E7D32; --soft-border:#E8DED2;
}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--warm-cream);color:var(--charcoal);
  font-family:'Inter',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5{font-family:'Rubik','Inter',sans-serif;line-height:1.12;letter-spacing:-.015em;margin:0}
p{margin:0}
button,input,textarea,select{font:inherit;color:inherit}
a{color:inherit}
img,svg{display:block;max-width:100%}
.tnum{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.no-scrollbar::-webkit-scrollbar{display:none}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
:focus-visible{outline:3px solid var(--pastor-orange);outline-offset:3px;border-radius:8px}
.skip-link{position:absolute;left:-9999px;top:0;z-index:200;background:var(--charcoal);color:#fff;
  padding:12px 18px;border-radius:0 0 12px 0;font-weight:700}
.skip-link:focus{left:0}
.shadow-warm{box-shadow:0 10px 30px -18px rgba(30,30,30,.45)}
.shadow-lift{box-shadow:0 18px 40px -22px rgba(200,29,37,.45)}
.tex-grain{background-image:radial-gradient(rgba(200,29,37,.05) 1px,transparent 1px);background-size:14px 14px}
.logo-frame{background:#FFFDF9;border-radius:9999px}

@keyframes latia-steam{0%{opacity:0;transform:translateY(6px) scaleX(.9)}
  25%{opacity:.5}100%{opacity:0;transform:translateY(-26px) scaleX(1.25)}}
@keyframes latia-flicker{0%,100%{transform:scaleY(1) translateY(0);opacity:.92}
  50%{transform:scaleY(1.14) translateY(-2px);opacity:1}}
@keyframes latia-heat{0%{transform:translateY(0);opacity:.16}50%{opacity:.28}100%{transform:translateY(-16px);opacity:0}}
@keyframes latia-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.anim-steam{animation:latia-steam 4.6s ease-in-out infinite}
.anim-steam.d1{animation-delay:.9s}.anim-steam.d2{animation-delay:1.8s}.anim-steam.d3{animation-delay:2.7s}
.anim-flicker{animation:latia-flicker 1.5s ease-in-out infinite;transform-origin:center bottom}
.anim-heat{animation:latia-heat 6s linear infinite}
.anim-heat.h2{animation-delay:2s}.anim-heat.h3{animation-delay:4s}
.anim-pulse{animation:latia-pulse 2.4s ease-in-out infinite}

@media (prefers-reduced-motion: reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important;scroll-behavior:auto!important}
}
`;

const C = {
  red: '#C81D25', redDark: '#97131A', maize: '#FFB800', orange: '#E85D04',
  cream: '#FFFDF9', section: '#F9F5F0', charcoal: '#1E1E1E', gray: '#5C5C5C',
  green: '#2E7D32', border: '#E8DED2', meat: '#8C3A1B', meatDark: '#6A2A13',
  meatLight: '#B4592E', tortilla: '#F6DEAE', tortillaDark: '#E3BE7C',
  flour: '#F9EACB', cheese: '#FFD24C', cheeseDeep: '#F2A93B',
  nopal: '#4E7C3A', nopalLight: '#7FA650', white: '#FFFFFF',
};

/* ───────────────────────── 2. DATOS VERIFICADOS ───────────────────────── */

const SITE = {
  name: 'Taquería La Tía',
  tagline: 'Tacos que se disfrutan como en familia.',
  phoneDisplay: '+52 1 55 6509 7372',
  whatsappNumber: '5215565097372',
  whatsappUrl: 'https://wa.me/5215565097372',
  address: 'Batallones Rojos esquina Revolución Social, Iztapalapa, Ciudad de México, México',
  addressShort: 'Batallones Rojos esq. Revolución Social · Iztapalapa',
  hours: 'Lunes a domingo · 5:00 pm a 12:00 am',
  deliveryFee: 25,
  domain: 'https://taquerialatia.miwebmini.app',
  googleMapsUrl: '', // NEXT_PUBLIC_GOOGLE_MAPS_URL (vacío = no se publica enlace)
  analyticsEnabled: false, // NEXT_PUBLIC_ENABLE_ANALYTICS
};

const MEAT_LABEL = {
  pastor: 'Pastor', suadero: 'Suadero', longaniza: 'Longaniza', bistec: 'Bistec',
  campechano: 'Campechano', campechana: 'Campechana', arrachera: 'Arrachera',
};

const SALSAS = [
  { id: 'guacamole', label: 'Guacamole', color: '#6E9B3C' },
  { id: 'mora', label: 'Salsa mora', color: '#5B2340' },
  { id: 'martajada', label: 'Salsa martajada', color: '#C81D25' },
  { id: 'roja', label: 'Salsa roja', color: '#E85D04' },
];

const meatVariants = (base, withCheese) =>
  Object.keys(base).map((k) => ({
    id: k,
    label: MEAT_LABEL[k],
    meat: k,
    price: base[k],
    ...(withCheese ? { priceWithCheese: withCheese[k], cheese: true } : { cheese: false }),
  }));

const FULL_CUSTOM = { onion: true, cilantro: true, salsas: true, note: true, maxNoteLength: 140 };
const DRINK_CUSTOM = { onion: false, cilantro: false, salsas: false, note: true, maxNoteLength: 140 };

const CATEGORIES = [
  { slug: 'tacos', name: 'Tacos de maíz', kicker: 'Tortilla de maíz y comal', illus: 'tacosMaiz' },
  { slug: 'tacos-harina', name: 'Tacos de harina', kicker: 'Tortilla de harina suave', illus: 'tacosHarina' },
  { slug: 'tortas', name: 'Tortas', kicker: 'Telera recién partida', illus: 'tortas' },
  { slug: 'gringas', name: 'Gringas', kicker: 'Queso fundido y tortilla de harina', illus: 'gringas' },
  { slug: 'burritas', name: 'Burritas', kicker: 'Compactas y bien rellenas', illus: 'burritas' },
  { slug: 'volcanes', name: 'Volcanes', kicker: 'Tostada crujiente con queso', illus: 'volcanes' },
  { slug: 'quesadillas', name: 'Quesadillas', kicker: 'Tortilla de harina, queso fundido', illus: 'quesadillas' },
  { slug: 'burros', name: 'Burros', kicker: 'Grandes, para hambre grande', illus: 'burros' },
  { slug: 'costra-queso', name: 'Costra de queso', kicker: 'Queso dorado y crujiente', illus: 'costraQueso' },
  { slug: 'chimichanga', name: 'Chimichanga', kicker: 'Dorada por fuera', illus: 'chimichanga' },
  { slug: 'nopal-zapoteco', name: 'Nopal zapoteco', kicker: 'Nopal asado con carne', illus: 'nopalZapoteco' },
  { slug: 'alambres', name: 'Alambres', kicker: 'Para compartir en la mesa', illus: 'alambres' },
  { slug: 'aguas-frescas', name: 'Aguas frescas', kicker: 'Un litro, bien frío', illus: 'aguasFrescas' },
];

const SPECIALTIES = ['volcanes', 'quesadillas', 'burros', 'costra-queso', 'chimichanga', 'nopal-zapoteco', 'alambres'];

const MENU = [
  {
    id: 'tacos-maiz', slug: 'tacos-de-maiz', category: 'tacos', name: 'Tacos de maíz', featured: true,
    description: 'Tortilla de maíz calentada al comal con la carne que se te antoje. c/q = con queso.',
    cheeseNote: 'c/q = con queso',
    variants: meatVariants(
      { pastor: 15, suadero: 15, longaniza: 15, bistec: 17, campechano: 17, arrachera: 25 },
      { pastor: 25, suadero: 25, longaniza: 25, bistec: 25, campechano: 25, arrachera: 35 },
    ),
    illus: 'tacosMaiz', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'tacos-harina', slug: 'tacos-de-harina', category: 'tacos-harina', name: 'Tacos de harina',
    description: 'Tortilla de harina suave con carne al comal, cebolla y cilantro al gusto.',
    variants: meatVariants({ pastor: 30, suadero: 30, longaniza: 30, bistec: 35, campechano: 35, arrachera: 40 }),
    illus: 'tacosHarina', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'tortas', slug: 'tortas', category: 'tortas', name: 'Tortas', featured: true,
    description: 'Telera partida con carne al comal. c/q = con queso.',
    cheeseNote: 'c/q = con queso',
    variants: meatVariants(
      { pastor: 50, longaniza: 50, bistec: 60, suadero: 60, campechana: 60, arrachera: 70 },
      { pastor: 60, longaniza: 60, bistec: 70, suadero: 70, campechana: 70, arrachera: 80 },
    ),
    illus: 'tortas', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'gringas', slug: 'gringas', category: 'gringas', name: 'Gringas', featured: true,
    description: 'Dos tortillas de harina con queso fundido y carne, doradas al comal.',
    variants: meatVariants({ pastor: 60, longaniza: 60, bistec: 70, suadero: 70, campechana: 70, arrachera: 80 }),
    illus: 'gringas', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'burritas', slug: 'burritas', category: 'burritas', name: 'Burritas',
    description: 'Tortilla de harina enrollada, compacta y bien rellena de carne.',
    variants: meatVariants({ pastor: 60, longaniza: 60, bistec: 70, suadero: 70, campechana: 70, arrachera: 80 }),
    illus: 'burritas', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'volcanes', slug: 'volcanes', category: 'volcanes', name: 'Volcanes', featured: true,
    description: 'Tostada de maíz crujiente con queso fundido y carne al comal.',
    variants: meatVariants({ pastor: 60, longaniza: 60, bistec: 70, suadero: 70, campechano: 70, arrachera: 80 }),
    illus: 'volcanes', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'quesadillas', slug: 'quesadillas', category: 'quesadillas', name: 'Quesadillas de harina',
    description: 'Tortilla de harina con queso fundido y carne, dorada al comal.',
    variants: meatVariants({ pastor: 50, longaniza: 50, bistec: 60, suadero: 60, campechana: 60, arrachera: 65 }),
    illus: 'quesadillas', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'burros', slug: 'burros', category: 'burros', name: 'Burros',
    description: 'Burro grande de tortilla de harina con carne al comal. Para hambre grande.',
    variants: meatVariants({ pastor: 80, longaniza: 80, bistec: 90, suadero: 90, campechano: 90, arrachera: 120 }),
    illus: 'burros', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'costra-queso', slug: 'costra-de-queso', category: 'costra-queso', name: 'Costra de queso',
    description: 'Queso dorado y crujiente envolviendo la carne, con limón y salsa aparte.',
    variants: meatVariants({ pastor: 80, longaniza: 80, bistec: 90, suadero: 90, campechano: 90, arrachera: 120 }),
    illus: 'costraQueso', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'chimichanga', slug: 'chimichanga', category: 'chimichanga', name: 'Chimichanga',
    description: 'Tortilla de harina dorada y crujiente con carne al comal.',
    variants: meatVariants({ pastor: 80, longaniza: 80, bistec: 90, suadero: 90, campechano: 90, arrachera: 120 }),
    illus: 'chimichanga', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'nopal-zapoteco', slug: 'nopal-zapoteco', category: 'nopal-zapoteco', name: 'Nopal zapoteco',
    description: 'Nopal asado con carne al comal encima y guarnición aparte.',
    variants: meatVariants({ pastor: 80, longaniza: 80, bistec: 90, campechano: 90, arrachera: 120 }),
    illus: 'nopalZapoteco', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'alambres', slug: 'alambres', category: 'alambres', name: 'Alambres',
    description: 'Carne, pimientos, cebolla y queso fundido, servidos para compartir con tortillas aparte. Consulta disponibilidad de ingredientes al confirmar tu pedido.',
    variants: [
      { id: 'chico', label: 'Chico', price: 150, serves: '2 personas', servingSize: 'chico' },
      { id: 'mediano', label: 'Mediano', price: 200, serves: '3 personas', servingSize: 'mediano' },
      { id: 'grande', label: 'Grande', price: 250, serves: '4 personas', servingSize: 'grande' },
      { id: 'familiar', label: 'Familiar', price: 300, serves: '6 personas', servingSize: 'familiar' },
    ],
    illus: 'alambres', customization: FULL_CUSTOM, isAvailable: true,
  },
  {
    id: 'agua-horchata', slug: 'agua-de-horchata', category: 'aguas-frescas', name: 'Agua de horchata', featured: true,
    description: 'Un litro de horchata bien fría para acompañar el antojo.',
    variants: [{ id: 'litro', label: '1 litro', price: 40, servingSize: '1 litro' }],
    illus: 'aguasFrescas', customization: DRINK_CUSTOM, isAvailable: true,
  },
  {
    id: 'agua-jamaica', slug: 'agua-de-jamaica', category: 'aguas-frescas', name: 'Agua de jamaica',
    description: 'Un litro de jamaica natural, fría y refrescante.',
    variants: [{ id: 'litro', label: '1 litro', price: 40, servingSize: '1 litro' }],
    illus: 'aguasFrescas', customization: DRINK_CUSTOM, isAvailable: true,
  },
  {
    id: 'agua-guayaba', slug: 'agua-de-guayaba-con-limon', category: 'aguas-frescas', name: 'Agua de guayaba con limón',
    description: 'Un litro de guayaba con limón, dulce y ácida a la vez.',
    variants: [{ id: 'litro', label: '1 litro', price: 40, servingSize: '1 litro' }],
    illus: 'aguasFrescas', customization: DRINK_CUSTOM, isAvailable: true,
  },
];

const ITEMS_BY_ID = MENU.reduce((acc, it) => { acc[it.id] = it; return acc; }, {});
const CAT_BY_SLUG = CATEGORIES.reduce((acc, c) => { acc[c.slug] = c; return acc; }, {});

const FAQ = [
  { q: '¿Cuál es el horario?', a: 'Abrimos lunes a domingo de 5:00 pm a 12:00 am.' },
  { q: '¿Hacen envíos a domicilio?', a: 'Sí. El servicio a domicilio tiene un costo extra de $25 MXN. La disponibilidad y el tiempo de entrega se confirman por WhatsApp.' },
  { q: '¿Qué significa c/q?', a: 'Significa con queso.' },
  { q: '¿Puedo pedir sin cebolla o sin cilantro?', a: 'Sí. Puedes elegir tus preferencias antes de agregar cada producto al carrito.' },
  { q: '¿Qué salsas puedo elegir?', a: 'Guacamole, salsa mora, salsa martajada y salsa roja. También puedes elegir sin salsa.' },
  { q: '¿Cómo pago?', a: 'Aceptamos efectivo y transferencia. La forma de pago se coordina y confirma por WhatsApp.' },
  { q: '¿El pedido queda confirmado al enviarlo?', a: 'No. El carrito genera un resumen para WhatsApp. El pedido queda confirmado cuando Taquería La Tía valida disponibilidad, total y modalidad de entrega.' },
  { q: '¿Hacen taquizas para eventos?', a: 'Sí. Tenemos servicio completo, puro taco y parrilla. Escríbenos por WhatsApp para cotizar fecha, número de personas y ubicación.' },
];

const FAMILY = [
  { name: 'Abraham Soriano', text: '“En La Tía me gusta que puedes armar cada taco a tu gusto: con o sin cebolla, con las salsas que se te antojen y siempre listo para compartir.”' },
  { name: 'Claudia Noguez', text: '“Las especialidades son perfectas cuando queremos algo diferente: una gringa, una torta o unos volcanes con mucho sabor.”' },
  { name: 'Melanie y Yael Soriano', text: '“Nos gustan las aguas frescas y pedir tacos para compartir en familia.”' },
];

const TAQUIZAS = [
  {
    id: 'completo', name: 'Servicio completo', illus: 'taquizas',
    intro: 'El sabor completo de La Tía en tu evento, con trompo, especialidades y todo para servir.',
    includes: [
      'Trompo al pastor', 'Bistec', 'Longaniza', 'Suadero', 'Quesillo', 'Tostadas', 'Bolillos',
      'Tortillas de harina', 'Tres tipos de salsa', 'Guacamole, salsa roja y salsa martajada',
      'Limones', 'Pepinos', 'Cebollitas con nopales', 'Desechables y servilletas',
      'Promedio de 10 tacos por persona', 'Gringas, tortas, burritas y volcanes',
      'Servicio estimado de tres horas',
    ],
    cta: 'Cotizar servicio completo',
  },
  {
    id: 'puro-taco', name: 'Servicio de puro taco', illus: 'tacosMaiz',
    intro: 'Puro taco para disfrutar sin complicaciones: carnes, salsas y guarniciones.',
    includes: [
      'Trompo al pastor', 'Bistec', 'Longaniza', 'Suadero', 'Tres tipos de salsa',
      'Guacamole, salsa roja y salsa martajada', 'Limones', 'Pepinos', 'Cebollitas con nopales',
      'Desechables y servilletas', 'Promedio de 10 tacos por persona', 'Servicio estimado de tres horas',
    ],
    cta: 'Cotizar servicio de tacos',
  },
  {
    id: 'parrilla', name: 'Servicio de parrilla', illus: 'alambres',
    intro: 'Ocho carnes a la parrilla con guarniciones para compartir en la mesa.',
    includes: [
      'Arrachera', 'Bistec', 'Longaniza', 'Chorizo argentino', 'Carne enchilada', 'Pechuga',
      'Chuleta', 'Chistorra', 'Frijoles', 'Papas', 'Nopales', 'Pico de gallo', 'Guacamole',
      'Salsa martajada', 'Limones', 'Pápalo', 'Servilletas',
      'Promedio de 5 a 6 tacos por persona', 'Tortilla normal', 'Servicio estimado de tres horas',
    ],
    cta: 'Cotizar servicio de parrilla',
  },
];

const taquizaMessage = (service) =>
  `🌮 *SOLICITUD DE COTIZACIÓN — TAQUIZA LA TÍA*\n\n*Servicio de interés:* ${service}\n*Fecha del evento:* \n*Horario aproximado:* \n*Número aproximado de personas:* \n*Ubicación aproximada del evento:* \n*Nombre de contacto:* \n*WhatsApp:* \n*Comentarios o necesidades especiales:* \n\nMe gustaría conocer disponibilidad, costo y condiciones para mi evento. Gracias.`;

const waLink = (msg) => `${SITE.whatsappUrl}?text=${encodeURIComponent(msg)}`;

/* ───────────────────────── 3. ANALÍTICA RESPONSABLE ───────────────────── */

const CONSENT_KEY = 'latia_consent_v1';
const CART_KEY = 'latia_cart_v1';

function readConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { analytics: !!parsed.analytics, ts: parsed.ts || Date.now() };
  } catch (e) { return null; }
}
function writeConsent(analytics) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, ts: Date.now() })); } catch (e) { /* noop */ }
}

/* Sólo eventos agregados. Nunca PII, notas, direcciones ni contenido del pedido. */
const EVENTS = {
  menuView: 'menu_view', categorySelect: 'menu_category_select', customizeOpen: 'product_customize_open',
  addToCart: 'product_add_to_cart', cartOpen: 'cart_open', cartItemRemove: 'cart_item_remove',
  deliverySelect: 'delivery_option_select', paymentSelect: 'payment_method_select',
  whatsappOrder: 'whatsapp_order_click', taquizaView: 'taquiza_view', taquizaService: 'taquiza_service_click',
  taquizaWhatsapp: 'taquiza_whatsapp_click', mapsClick: 'maps_click', faqOpen: 'faq_open',
  familyView: 'family_recommendations_view', cookieAccept: 'cookie_accept', cookieReject: 'cookie_reject',
};

function track(event, payload) {
  if (!SITE.analyticsEnabled) return;
  const consent = readConsent();
  if (!consent || !consent.analytics) return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...(payload || {}) });
  } catch (e) { /* noop */ }
}

/* ───────────────────────── 4. UTILIDADES / HOOKS ──────────────────────── */

const money = (n) => `$${Number(n).toLocaleString('es-MX')}`;

const flyBus = {
  handlers: [],
  emit(rect) { this.handlers.forEach((h) => h(rect)); },
  on(h) { this.handlers.push(h); return () => { this.handlers = this.handlers.filter((x) => x !== h); }; },
};

function useLockBody(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

function useFocusTrap(ref, active, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return undefined;
    const node = ref.current;
    if (!node) return undefined;
    const prevFocus = document.activeElement;
    const selector = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const list = () => Array.from(node.querySelectorAll(selector)).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);
    const t = setTimeout(() => { const f = list(); if (f[0]) f[0].focus(); }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const f = list(); if (!f.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      node.removeEventListener('keydown', onKey);
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    };
  }, [active, ref]);
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function upsertLink(rel, href, extra) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
  if (extra) Object.keys(extra).forEach((k) => el.setAttribute(k, extra[k]));
}

const RouterCtx = createContext({ route: '/', navigate: () => {} });

function useRouteState() {
  const read = () => {
    const h = window.location.hash.replace(/^#/, '');
    return h && h.startsWith('/') ? h : '/';
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => { setRoute(read()); window.scrollTo({ top: 0, behavior: 'auto' }); };
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.replace('#/');
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((path) => {
    if (read() === path) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    window.location.hash = path;
  }, []);
  return { route, navigate };
}

const A = (path) => `#${path}`;

/* ───────────────────────── 5. PATRONES SVG ────────────────────────────── */

function TortillaPattern({ className = '', opacity = 0.07, tint = C.maize }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" focusable="false" style={{ opacity }}>
      <defs>
        <pattern id={`tp-${uid}`} width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <circle cx="18" cy="18" r="12" fill="none" stroke={tint} strokeWidth="2" />
          <circle cx="18" cy="18" r="3" fill={tint} />
          <circle cx="54" cy="54" r="8" fill="none" stroke={tint} strokeWidth="2" />
          <path d="M46 14c6-4 12 2 8 8" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#tp-${uid})`} />
    </svg>
  );
}

function ChilePattern({ className = '', opacity = 0.06, tint = C.red }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" focusable="false" style={{ opacity }}>
      <defs>
        <pattern id={`cp-${uid}`} width="96" height="96" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <path d="M28 22c10 0 16 8 14 18-2 12-12 20-20 18-6-2-6-10 0-14 8-6 6-14 6-22z" fill={tint} />
          <path d="M28 22c0-6 4-10 10-10" fill="none" stroke={tint} strokeWidth="3" strokeLinecap="round" />
          <circle cx="72" cy="70" r="9" fill="none" stroke={tint} strokeWidth="3" />
          <path d="M72 61c0-5 3-8 7-8" fill="none" stroke={tint} strokeWidth="3" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#cp-${uid})`} />
    </svg>
  );
}

/* ───────────────────────── 6. LOGO E ILUSTRACIONES ────────────────────── */

function LogoFallback({ className = 'h-12 w-12' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="30" fill={C.red} stroke={C.charcoal} strokeWidth="3" />
      <circle cx="32" cy="32" r="24" fill="none" stroke={C.maize} strokeWidth="2.5" strokeDasharray="4 5" />
      <path d="M16 40c0-9 7-16 16-16s16 7 16 16c-8 5-24 5-32 0z" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3" strokeLinejoin="round" />
      <path d="M21 34c2-6 6-9 11-9s9 3 11 9c-7 4-15 4-22 0z" fill={C.meat} stroke={C.charcoal} strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="27" cy="30" r="2" fill={C.nopalLight} />
      <circle cx="36" cy="31" r="1.8" fill={C.cream} />
      <path d="M24 14c3-4 9-4 12 0" fill="none" stroke={C.maize} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function BrandLogo({ size = 48, withWordmark = true, className = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {failed ? (
        <LogoFallback className="shrink-0" />
      ) : (
        <span className="logo-frame flex shrink-0 items-center justify-center p-0.5 ring-1 ring-[#E8DED2]">
          <img
            src={ASSETS.logo}
            alt={withWordmark ? ASSETS.logoAlt : ''}
            aria-hidden={withWordmark ? 'true' : undefined}
            width={size} height={size}
            onError={() => setFailed(true)}
            className="h-auto rounded-full object-contain"
            style={{ width: size, height: size }}
            decoding="async"
          />
        </span>
      )}
      {withWordmark && (
        <span className="leading-none">
          <span className="block text-[10px] font-bold uppercase tracking-[.22em] text-[#5C5C5C]">Taquería</span>
          <span className="block text-[22px] font-black tracking-tight text-[#1E1E1E]">La Tía</span>
        </span>
      )}
    </span>
  );
}

function SalsaBowl({ x = 0, y = 0, s = 1, color = C.red }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-24 -1a24 15 0 0 0 48 0z" fill={C.cream} stroke={C.charcoal} strokeWidth="3.4" strokeLinejoin="round" />
      <ellipse cx="0" cy="-1" rx="24" ry="9" fill={color} stroke={C.charcoal} strokeWidth="3.4" />
      <ellipse cx="-8" cy="-3.5" rx="6" ry="2.4" fill="#fff" opacity=".38" />
    </g>
  );
}

function LimeWedge({ x = 0, y = 0, s = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-17 2a17 17 0 0 1 34 0z" fill={C.nopalLight} stroke={C.charcoal} strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M-11 1a11 11 0 0 1 22 0z" fill="#CFE39B" stroke={C.charcoal} strokeWidth="2.2" />
      <path d="M0 1V-9M0 1L-8 -4M0 1L8 -4" stroke={C.nopal} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function Garnish({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-10" cy="0" r="3.4" fill={C.nopalLight} stroke={C.charcoal} strokeWidth="1.6" />
      <circle cx="2" cy="4" r="3" fill={C.nopalLight} stroke={C.charcoal} strokeWidth="1.6" />
      <circle cx="12" cy="-2" r="3.6" fill={C.white} stroke={C.charcoal} strokeWidth="1.6" />
      <circle cx="-2" cy="-6" r="2.8" fill={C.white} stroke={C.charcoal} strokeWidth="1.6" />
    </g>
  );
}

function Plate({ cx = 160, cy = 196, rx = 126, ry = 28 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 6} rx={rx} ry={ry} fill="rgba(30,30,30,.08)" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.white} stroke={C.charcoal} strokeWidth="4" />
      <ellipse cx={cx} cy={cy - 2} rx={rx - 20} ry={ry - 10} fill="none" stroke={C.border} strokeWidth="3" />
    </g>
  );
}

function TacoGlyph({ x = 0, y = 0, s = 1, rot = 0, shell = C.tortilla, filling = C.meat, garnish = true }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-42 14C-42-12-22-30 0-30s42 18 42 44c-14 9-70 9-84 0z" fill={shell} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-31 -4c4-15 15-22 31-22s27 7 31 22c-16 8-46 8-62 0z" fill={filling} stroke={C.charcoal} strokeWidth="3.4" strokeLinejoin="round" />
      <ellipse cx="-12" cy="-14" rx="7" ry="4" fill={C.meatLight} opacity=".75" />
      <ellipse cx="14" cy="-10" rx="6" ry="3.4" fill={C.meatDark} opacity=".6" />
      {garnish && <Garnish x={0} y={-14} s={0.8} />}
      <ellipse cx="-24" cy="6" rx="5" ry="3" fill={C.tortillaDark} opacity=".7" />
      <ellipse cx="22" cy="8" rx="6" ry="3" fill={C.tortillaDark} opacity=".55" />
    </g>
  );
}

const ILLUS = {
  tacosMaiz: (
    <>
      <Plate cx={160} cy={192} rx={128} ry={30} />
      <TacoGlyph x={104} y={158} s={0.86} rot={-8} />
      <TacoGlyph x={170} y={168} s={0.95} rot={3} />
      <TacoGlyph x={232} y={152} s={0.8} rot={10} />
      <SalsaBowl x={64} y={92} s={0.9} color={C.red} />
      <SalsaBowl x={256} y={88} s={0.9} color={C.nopal} />
      <LimeWedge x={160} y={70} s={1} rot={-12} />
    </>
  ),
  tacosHarina: (
    <>
      <Plate cx={160} cy={194} rx={124} ry={28} />
      <TacoGlyph x={116} y={162} s={1} shell={C.flour} filling={C.meatLight} />
      <TacoGlyph x={212} y={158} s={0.92} rot={8} shell={C.flour} filling={C.meat} />
      <SalsaBowl x={258} y={92} s={0.85} color={C.orange} />
      <LimeWedge x={70} y={106} s={1} rot={14} />
      <Garnish x={160} y={86} s={1} />
    </>
  ),
  tortas: (
    <>
      <Plate cx={160} cy={198} rx={122} ry={26} />
      <g transform="translate(160 152)">
        <path d="M-86 26c-10-40 18-64 86-64s96 24 86 64c-24 12-148 12-172 0z" fill="#E8B36A" stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-86 22c24 12 148 12 172 0 2 10-4 16-14 18-30 8-114 8-144 0-10-2-16-8-14-18z" fill="#F6DEAE" stroke={C.charcoal} strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M-84 20c24-8 46 6 68-2 22-8 44 6 66-2 22-8 34 4 34 4" fill="none" stroke={C.meat} strokeWidth="12" strokeLinecap="round" />
        <path d="M-70 30c26-6 44 6 70 0 26-6 46 6 72 0" fill="none" stroke={C.nopalLight} strokeWidth="6" strokeLinecap="round" />
        <path d="M-40 -22c10-8 24-8 34 0M20 -26c10-8 24-8 34 0" fill="none" stroke="#C98F45" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <SalsaBowl x={62} y={126} s={0.8} color={C.red} />
      <LimeWedge x={268} y={130} s={0.95} rot={-10} />
    </>
  ),
  gringas: (
    <>
      <Plate cx={160} cy={196} rx={122} ry={27} />
      <g transform="translate(160 146)">
        <path d="M-72 40c-8-46 22-72 72-72s80 26 72 72c-22 12-122 12-144 0z" fill={C.flour} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-64 16c22 10 106 10 128 0" fill="none" stroke={C.charcoal} strokeWidth="3.4" />
        <path d="M-62 16c22 12 104 12 124 0 4 12-6 20-18 22-28 6-62 6-90 0-12-2-20-10-16-22z" fill={C.cheese} stroke={C.charcoal} strokeWidth="3.4" strokeLinejoin="round" />
        <path d="M-52 -12c18-14 34 6 52-6 18-12 34 6 52-6" fill="none" stroke={C.meat} strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="-30" cy="-34" rx="12" ry="7" fill="#E0B473" opacity=".7" />
        <ellipse cx="34" cy="-30" rx="10" ry="6" fill="#E0B473" opacity=".6" />
        <Garnish x={6} y={-30} s={0.9} />
      </g>
      <SalsaBowl x={266} y={124} s={0.8} color={C.red} />
      <LimeWedge x={58} y={126} s={0.95} rot={12} />
    </>
  ),
  burritas: (
    <>
      <Plate cx={160} cy={196} rx={118} ry={26} />
      <g transform="translate(150 150) rotate(-14)">
        <rect x="-70" y="-26" width="140" height="52" rx="26" fill={C.flour} stroke={C.charcoal} strokeWidth="4" />
        <path d="M52 -22c14 6 20 32 6 42" fill="none" stroke={C.charcoal} strokeWidth="3.4" />
        <ellipse cx="58" cy="0" rx="12" ry="24" fill="#F0DCB4" stroke={C.charcoal} strokeWidth="3.4" />
        <ellipse cx="58" cy="0" rx="7" ry="16" fill={C.meat} stroke={C.charcoal} strokeWidth="2.4" />
        <path d="M-46 -14c14-8 28 8 42 0 14-8 28 6 40-2" fill="none" stroke="#E3CDA4" strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <SalsaBowl x={258} y={110} s={0.82} color={C.orange} />
      <LimeWedge x={72} y={104} s={0.95} rot={-8} />
    </>
  ),
  volcanes: (
    <>
      <Plate cx={160} cy={198} rx={118} ry={26} />
      <g transform="translate(160 158)">
        <ellipse cx="0" cy="22" rx="86" ry="20" fill="#F0C87A" stroke={C.charcoal} strokeWidth="4" />
        <ellipse cx="0" cy="16" rx="86" ry="20" fill={C.tortilla} stroke={C.charcoal} strokeWidth="4" />
        <path d="M-64 8c10-26 30-40 64-40s54 14 64 40c-30 12-98 12-128 0z" fill={C.cheese} stroke={C.charcoal} strokeWidth="3.8" strokeLinejoin="round" />
        <path d="M-46 -8c14-16 30-22 46-22s32 6 46 22c-26 10-66 10-92 0z" fill={C.meat} stroke={C.charcoal} strokeWidth="3.4" strokeLinejoin="round" />
        <Garnish x={0} y={-16} s={0.95} />
      </g>
      <SalsaBowl x={62} y={122} s={0.8} color={C.red} />
      <LimeWedge x={266} y={126} s={0.92} rot={10} />
    </>
  ),
  quesadillas: (
    <>
      <Plate cx={160} cy={196} rx={120} ry={27} />
      <g transform="translate(160 148)">
        <path d="M-78 34C-78-14-38-42 6-42s78 28 78 76c-26 12-58 12-84 0z" fill={C.flour} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-78 34c26 12 58 12 84 0" fill="none" stroke={C.charcoal} strokeWidth="3.6" />
        <path d="M-58 24c18 10 46 10 64 0" fill="none" stroke={C.cheeseDeep} strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="-26" cy="-14" rx="14" ry="9" fill="#E3CDA4" opacity=".75" />
        <ellipse cx="30" cy="-6" rx="11" ry="7" fill="#E3CDA4" opacity=".65" />
        <ellipse cx="6" cy="-26" rx="8" ry="5" fill="#E3CDA4" opacity=".55" />
        <path d="M-14 34c4 14 18 16 24 6" fill="none" stroke={C.cheese} strokeWidth="7" strokeLinecap="round" />
      </g>
      <SalsaBowl x={266} y={118} s={0.8} color={C.red} />
      <LimeWedge x={62} y={120} s={0.9} rot={-14} />
    </>
  ),
  burros: (
    <>
      <Plate cx={160} cy={198} rx={124} ry={27} />
      <g transform="translate(152 148) rotate(-10)">
        <rect x="-88" y="-32" width="176" height="64" rx="32" fill={C.flour} stroke={C.charcoal} strokeWidth="4" />
        <path d="M-56 -22c18-10 36 8 54-2 18-10 36 6 52-4" fill="none" stroke="#E3CDA4" strokeWidth="3.6" strokeLinecap="round" />
        <ellipse cx="80" cy="0" rx="16" ry="30" fill="#F1DFBB" stroke={C.charcoal} strokeWidth="3.6" />
        <ellipse cx="80" cy="0" rx="10" ry="21" fill={C.meat} stroke={C.charcoal} strokeWidth="2.6" />
        <ellipse cx="80" cy="-6" rx="4" ry="7" fill={C.meatLight} opacity=".8" />
      </g>
      <SalsaBowl x={54} y={116} s={0.8} color={C.nopal} />
      <LimeWedge x={272} y={120} s={0.9} rot={12} />
    </>
  ),
  costraQueso: (
    <>
      <Plate cx={160} cy={196} rx={120} ry={27} />
      <g transform="translate(160 150)">
        <path d="M-70 42c-14-4-18-16-10-24 6-6 4-14-2-18-8-6-6-18 4-20 8-2 10-10 4-16-8-8-2-20 10-18 8 2 14-4 14-12 0-10 12-16 20-10 6 4 14 2 18-4 6-10 20-8 24 2 3 8 10 12 18 10 12-2 20 8 16 18-3 8 0 16 8 20 10 6 8 20-4 22-8 2-14 8-12 16 2 10-8 18-18 14-8-3-16 0-20 8-6 10-20 10-26 0-4-8-12-12-20-10-8 2-16-2-18-10-2-6-8-10-14-8z" fill={C.cheese} stroke={C.charcoal} strokeWidth="3.6" strokeLinejoin="round" />
        <path d="M-44 6C-44-20-24-36 0-36s44 16 44 42c-14 8-74 8-88 0z" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3.8" strokeLinejoin="round" />
        <path d="M-32 -12c4-14 14-20 32-20s28 6 32 20c-16 8-48 8-64 0z" fill={C.meat} stroke={C.charcoal} strokeWidth="3.2" strokeLinejoin="round" />
        <Garnish x={0} y={-18} s={0.85} />
      </g>
      <LimeWedge x={58} y={116} s={0.9} rot={-10} />
      <SalsaBowl x={268} y={120} s={0.78} color={C.red} />
    </>
  ),
  chimichanga: (
    <>
      <Plate cx={160} cy={198} rx={122} ry={26} />
      <g transform="translate(154 150) rotate(-8)">
        <path d="M-80 -24c0-16 14-26 30-26h92c18 0 32 12 32 28v26c0 16-14 26-32 26h-92c-16 0-30-10-30-26z" fill="#E9A94A" stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-46 -44l26 22-26 22M10 -44l26 22-26 22" fill="none" stroke="#C9822F" strokeWidth="3.4" strokeLinecap="round" />
        <ellipse cx="72" cy="2" rx="14" ry="26" fill="#F3D9A6" stroke={C.charcoal} strokeWidth="3.4" />
        <ellipse cx="72" cy="2" rx="8" ry="18" fill={C.meat} stroke={C.charcoal} strokeWidth="2.4" />
        <circle cx="72" cy="-6" r="3.4" fill={C.nopalLight} />
      </g>
      <SalsaBowl x={56} y={112} s={0.8} color={C.red} />
      <LimeWedge x={272} y={118} s={0.9} rot={14} />
    </>
  ),
  nopalZapoteco: (
    <>
      <Plate cx={160} cy={198} rx={122} ry={27} />
      <g transform="translate(160 152)">
        <path d="M-78 30c-14-26-10-56 8-72 16-14 44-16 62-4 22 14 30 44 18 68-16 30-72 34-88 8z" fill={C.nopal} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-52 22c-8-20-4-42 8-54M-22 30c-8-22-6-46 6-60M10 32c-6-22-2-44 10-58" fill="none" stroke="#3C6129" strokeWidth="3" strokeLinecap="round" />
        <path d="M-6-58c-2-8 4-14 12-12" fill="none" stroke={C.charcoal} strokeWidth="3" strokeLinecap="round" />
        <path d="M-56 -6c14-22 34-32 56-32s42 10 56 32c-30 14-82 14-112 0z" fill={C.meat} stroke={C.charcoal} strokeWidth="3.6" strokeLinejoin="round" />
        <ellipse cx="-16" cy="-22" rx="14" ry="7" fill={C.meatLight} opacity=".7" />
        <Garnish x={20} y={-24} s={0.9} />
      </g>
      <SalsaBowl x={270} y={120} s={0.8} color={C.orange} />
      <LimeWedge x={56} y={118} s={0.9} rot={-12} />
    </>
  ),
  alambres: (
    <>
      <g transform="translate(150 148)">
        <ellipse cx="0" cy="16" rx="104" ry="30" fill="rgba(30,30,30,.1)" />
        <path d="M96 -4h44a14 14 0 0 1 0 28h-44z" fill="#3A3A3A" stroke={C.charcoal} strokeWidth="4" />
        <ellipse cx="0" cy="0" rx="102" ry="46" fill="#4A4A4A" stroke={C.charcoal} strokeWidth="4.4" />
        <ellipse cx="0" cy="-4" rx="86" ry="34" fill="#5C5C5C" stroke={C.charcoal} strokeWidth="2.6" />
        <path d="M-58 -6c14-14 34-8 44 2 10 10 30 12 44 2 12-8 26-4 30 6" fill="none" stroke={C.meat} strokeWidth="16" strokeLinecap="round" />
        <path d="M-46 12c16 8 40 8 56-2 14-8 30-6 40 4" fill="none" stroke={C.nopalLight} strokeWidth="9" strokeLinecap="round" />
        <path d="M-30 -20c14-8 30-6 42 4" fill="none" stroke={C.orange} strokeWidth="8" strokeLinecap="round" />
        <path d="M-70 2c18 14 52 20 78 14 22-6 40-4 54 6-24 14-64 18-96 6-18-6-30-14-36-26z" fill={C.cheese} stroke={C.charcoal} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g transform="translate(282 178)">
        <ellipse cx="0" cy="6" rx="26" ry="9" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3.2" />
        <ellipse cx="-2" cy="0" rx="26" ry="9" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3.2" />
        <ellipse cx="2" cy="-6" rx="26" ry="9" fill={C.flour} stroke={C.charcoal} strokeWidth="3.2" />
      </g>
      <LimeWedge x={54} y={94} s={0.9} rot={-10} />
    </>
  ),
  aguasFrescas: (
    <>
      <g transform="translate(84 140)">
        <path d="M-30 -52h60v92a16 16 0 0 1-16 16h-28a16 16 0 0 1-16-16z" fill="#F6EBD3" stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-26 -12h52v52a12 12 0 0 1-12 12h-28a12 12 0 0 1-12-12z" fill="#F3E3C3" stroke={C.charcoal} strokeWidth="3" />
        <rect x="-34" y="-62" width="68" height="14" rx="7" fill={C.red} stroke={C.charcoal} strokeWidth="3.6" />
        <rect x="-8" y="-96" width="9" height="42" rx="4.5" fill={C.orange} stroke={C.charcoal} strokeWidth="3" transform="rotate(8 -4 -76)" />
        <rect x="-14" y="-6" width="10" height="10" rx="3" fill="#fff" opacity=".6" />
        <rect x="6" y="14" width="12" height="12" rx="3" fill="#fff" opacity=".45" />
      </g>
      <g transform="translate(168 128)">
        <path d="M-32 -56h64v98a16 16 0 0 1-16 16h-32a16 16 0 0 1-16-16z" fill="#F6EBD3" stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-28 -16h56v56a12 12 0 0 1-12 12h-32a12 12 0 0 1-12-12z" fill="#B3202E" stroke={C.charcoal} strokeWidth="3" />
        <rect x="-36" y="-66" width="72" height="14" rx="7" fill={C.maize} stroke={C.charcoal} strokeWidth="3.6" />
        <rect x="-6" y="-104" width="9" height="44" rx="4.5" fill={C.red} stroke={C.charcoal} strokeWidth="3" transform="rotate(-8 -2 -82)" />
        <rect x="-16" y="-2" width="11" height="11" rx="3" fill="#fff" opacity=".35" />
        <rect x="8" y="20" width="12" height="12" rx="3" fill="#fff" opacity=".28" />
      </g>
      <g transform="translate(252 144)">
        <path d="M-30 -52h60v92a16 16 0 0 1-16 16h-28a16 16 0 0 1-16-16z" fill="#F6EBD3" stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-26 -12h52v52a12 12 0 0 1-12 12h-28a12 12 0 0 1-12-12z" fill="#F0A6A0" stroke={C.charcoal} strokeWidth="3" />
        <rect x="-34" y="-62" width="68" height="14" rx="7" fill={C.green} stroke={C.charcoal} strokeWidth="3.6" />
        <rect x="-8" y="-96" width="9" height="42" rx="4.5" fill={C.maize} stroke={C.charcoal} strokeWidth="3" transform="rotate(10 -4 -76)" />
        <circle cx="10" cy="18" r="9" fill={C.red} opacity=".55" />
      </g>
      <LimeWedge x={56} y={214} s={0.9} rot={-8} />
      <LimeWedge x={288} y={216} s={0.85} rot={12} />
    </>
  ),
  taquizas: (
    <>
      <g transform="translate(96 122)">
        <path d="M0 -66c22 30 34 62 32 96H-32c-2-34 10-66 32-96z" fill={C.meat} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-26 -22h52M-30 2h60M-28 24h56" stroke={C.meatDark} strokeWidth="5" strokeLinecap="round" />
        <path d="M-32 30h64c4 14-6 22-32 22s-36-8-32-22z" fill={C.meatLight} stroke={C.charcoal} strokeWidth="3.4" />
        <path d="M0 -66c-6-14 4-24 16-24 4 12-2 20-16 24z" fill={C.maize} stroke={C.charcoal} strokeWidth="3.4" strokeLinejoin="round" />
        <g className="anim-flicker">
          <path d="M-6 -96c6 12 2 22-6 30 8 4 18 2 24-6-10-2-14-12-12-24z" fill={C.orange} stroke={C.charcoal} strokeWidth="3" strokeLinejoin="round" />
        </g>
        <rect x="-4" y="-112" width="8" height="18" rx="4" fill="#8A8A8A" stroke={C.charcoal} strokeWidth="2.6" />
      </g>
      <g>
        <rect x="150" y="176" width="152" height="12" rx="6" fill="#D9C7AE" stroke={C.charcoal} strokeWidth="3.4" />
        <rect x="164" y="188" width="10" height="26" rx="4" fill="#C4B093" stroke={C.charcoal} strokeWidth="3" />
        <rect x="278" y="188" width="10" height="26" rx="4" fill="#C4B093" stroke={C.charcoal} strokeWidth="3" />
      </g>
      <SalsaBowl x={186} y={172} s={0.7} color={C.red} />
      <SalsaBowl x={234} y={170} s={0.7} color={C.nopal} />
      <g transform="translate(278 166)">
        <ellipse cx="0" cy="6" rx="20" ry="7" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3" />
        <ellipse cx="-2" cy="0" rx="20" ry="7" fill={C.flour} stroke={C.charcoal} strokeWidth="3" />
        <ellipse cx="2" cy="-6" rx="20" ry="7" fill={C.tortilla} stroke={C.charcoal} strokeWidth="3" />
      </g>
      <LimeWedge x={158} y={132} s={0.8} rot={-10} />
      <LimeWedge x={200} y={124} s={0.75} rot={12} />
      <circle cx="244" cy="130" r="10" fill={C.nopalLight} stroke={C.charcoal} strokeWidth="3" />
      <circle cx="270" cy="124" r="8" fill="#6FA84F" stroke={C.charcoal} strokeWidth="3" />
    </>
  ),
  storefront: (
    <>
      <rect x="0" y="0" width="320" height="240" fill="#2A2118" />
      <rect x="0" y="0" width="320" height="150" fill="#3B2E22" />
      <circle cx="60" cy="34" r="26" fill={C.maize} opacity=".22" />
      <rect x="34" y="72" width="252" height="128" rx="8" fill="#5B4632" stroke={C.charcoal} strokeWidth="4" />
      <g>
        <path d="M28 96h264v22c-16 12-32-12-48 0s-32-12-48 0-32-12-48 0-32-12-48 0-32-12-48 0-16 0-24-6z" fill={C.red} stroke={C.charcoal} strokeWidth="4" strokeLinejoin="round" />
        <path d="M52 96v22M100 96v22M148 96v22M196 96v22M244 96v22" stroke={C.cream} strokeWidth="10" opacity=".85" />
      </g>
      <rect x="58" y="126" width="92" height="74" rx="6" fill="#FFD98A" stroke={C.charcoal} strokeWidth="4" />
      <path d="M96 150c14 20 20 38 18 50H78c-2-12 4-30 18-50z" fill={C.meat} stroke={C.charcoal} strokeWidth="3.4" />
      <path d="M84 176h26M82 188h30" stroke={C.meatDark} strokeWidth="4" strokeLinecap="round" />
      <rect x="176" y="126" width="60" height="74" rx="6" fill="#F6DEAE" stroke={C.charcoal} strokeWidth="4" />
      <path d="M186 186h40M192 174h28" stroke={C.charcoal} strokeWidth="3" strokeLinecap="round" opacity=".5" />
      <g>
        <path d="M20 60c40 16 240 16 280 0" fill="none" stroke={C.charcoal} strokeWidth="3" />
        {[44, 84, 124, 164, 204, 244, 276].map((lx, i) => (
          <circle key={lx} cx={lx} cy={64} r="6" fill={i % 2 ? C.maize : C.orange} stroke={C.charcoal} strokeWidth="2.4" className="anim-pulse" style={{ animationDelay: `${i * 0.22}s` }} />
        ))}
      </g>
      <rect x="0" y="200" width="320" height="40" fill="#4A4038" />
      <path d="M0 200h320" stroke={C.charcoal} strokeWidth="4" />
    </>
  ),
};

function Illustration({ name, className = '', title = '' }) {
  const content = ILLUS[name] || ILLUS.tacosMaiz;
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden="true" focusable="false" role="presentation">
      {title ? <title>{title}</title> : null}
      {name !== 'storefront' && <rect width="320" height="240" rx="20" fill={C.section} />}
      {content}
    </svg>
  );
}

function HeroVisual({ className = '' }) {
  return (
    <svg viewBox="0 0 640 560" className={className} aria-hidden="true" focusable="false" role="presentation">
      <defs>
        <radialGradient id="latia-glow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FFB800" stopOpacity=".55" />
          <stop offset="55%" stopColor="#E85D04" stopOpacity=".22" />
          <stop offset="100%" stopColor="#C81D25" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="latia-trompo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B4592E" />
          <stop offset="55%" stopColor="#8C3A1B" />
          <stop offset="100%" stopColor="#6A2A13" />
        </linearGradient>
        <clipPath id="latia-trompo-clip">
          <path d="M320 96c40 62 62 138 58 214H262c-4-76 18-152 58-214z" />
        </clipPath>
      </defs>

      <circle cx="320" cy="250" r="250" fill="url(#latia-glow)" />

      <g stroke="#E85D04" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".2">
        <path className="anim-heat" d="M190 120c16-14 32 14 48 0s32 14 48 0" />
        <path className="anim-heat h2" d="M380 108c16-14 32 14 48 0s32 14 48 0" />
        <path className="anim-heat h3" d="M286 76c14-12 28 12 42 0" />
      </g>

      <g fill="none" stroke="#FFFDF9" strokeWidth="7" strokeLinecap="round" opacity=".5">
        <path className="anim-steam" d="M296 150c-14-24 12-38 0-62" />
        <path className="anim-steam d1" d="M330 140c14-24-10-40 4-64" />
        <path className="anim-steam d2" d="M362 156c-12-22 10-36-2-58" />
      </g>

      <rect x="312" y="24" width="16" height="76" rx="8" fill="#9A9A9A" stroke="#1E1E1E" strokeWidth="5" />
      <path d="M320 96c40 62 62 138 58 214H262c-4-76 18-152 58-214z" fill="url(#latia-trompo)" stroke="#1E1E1E" strokeWidth="6" strokeLinejoin="round" />
      <g clipPath="url(#latia-trompo-clip)">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M250 ${132 + i * 24}h140`} stroke={i % 2 ? '#6A2A13' : '#A9502A'} strokeWidth="12" opacity=".85" />
        ))}
        <path d="M300 96c14 70 14 150 6 214h-30c-4-76 10-152 24-214z" fill="#fff" opacity=".09" />
      </g>
      <path d="M320 96c-10-16 4-30 20-30 6 16-2 26-20 30z" fill="#FFB800" stroke="#1E1E1E" strokeWidth="5" strokeLinejoin="round" />
      <g className="anim-flicker">
        <path d="M306 56c12 20 4 34-8 46 16 8 34 2 44-12-18-4-26-18-36-34z" fill="#E85D04" stroke="#1E1E1E" strokeWidth="4" strokeLinejoin="round" />
        <path d="M314 74c6 12 2 20-6 28 10 4 20 0 26-8-12-2-16-10-20-20z" fill="#FFB800" />
      </g>
      <path d="M262 310h116c6 22-10 34-58 34s-64-12-58-34z" fill="#B4592E" stroke="#1E1E1E" strokeWidth="5" strokeLinejoin="round" />

      <ellipse cx="320" cy="404" rx="228" ry="46" fill="rgba(30,30,30,.14)" />
      <ellipse cx="320" cy="392" rx="226" ry="44" fill="#3B3B3B" stroke="#1E1E1E" strokeWidth="6" />
      <ellipse cx="320" cy="384" rx="198" ry="34" fill="#545454" stroke="#1E1E1E" strokeWidth="3" />

      <TacoGlyph x={216} y={372} s={1.02} rot={-7} />
      <TacoGlyph x={330} y={384} s={1.1} rot={4} />
      <TacoGlyph x={442} y={368} s={0.98} rot={9} />

      <g transform="translate(112 452) scale(1.2)"><SalsaBowl x={0} y={0} color={C.red} /></g>
      <g transform="translate(196 486) scale(1.05)"><SalsaBowl x={0} y={0} color={C.nopal} /></g>
      <g transform="translate(516 462) scale(1.2)"><SalsaBowl x={0} y={0} color={C.orange} /></g>
      <g transform="translate(430 500) scale(1.2)"><LimeWedge x={0} y={0} rot={-12} /></g>
      <g transform="translate(300 508) scale(1.1)"><LimeWedge x={0} y={0} rot={8} /></g>

      <g transform="translate(576 388)">
        <ellipse cx="0" cy="14" rx="42" ry="14" fill={C.tortilla} stroke="#1E1E1E" strokeWidth="5" />
        <ellipse cx="-4" cy="2" rx="42" ry="14" fill={C.flour} stroke="#1E1E1E" strokeWidth="5" />
        <ellipse cx="4" cy="-10" rx="42" ry="14" fill={C.tortilla} stroke="#1E1E1E" strokeWidth="5" />
      </g>
    </svg>
  );
}

/* ───────────────────────── 7. UI BASE ─────────────────────────────────── */

function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.68, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, tone = 'red' }) {
  const colors = tone === 'red' ? 'text-[#C81D25] border-[#C81D25]/25 bg-[#C81D25]/[.07]'
    : tone === 'dark' ? 'text-[#FFFDF9] border-[#FFFDF9]/25 bg-[#FFFDF9]/10'
      : 'text-[#8A5200] border-[#FFB800]/40 bg-[#FFB800]/15';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] ${colors}`}>
      {children}
    </span>
  );
}

function Btn({ as = 'button', variant = 'primary', size = 'md', className = '', children, disabled, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none';
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-3 text-[15px]', lg: 'px-7 py-4 text-base' };
  const variants = {
    primary: 'bg-[#C81D25] text-white hover:bg-[#97131A] active:scale-[.98] shadow-lift',
    secondary: 'bg-[#FFB800] text-[#3A2A00] hover:bg-[#FFC733] active:scale-[.98] shadow-warm',
    outline: 'border-2 border-[#1E1E1E] text-[#1E1E1E] bg-transparent hover:border-[#E85D04] hover:text-[#E85D04] active:scale-[.98]',
    ghost: 'text-[#1E1E1E] hover:bg-[#1E1E1E]/[.06] active:scale-[.98]',
    whatsapp: 'bg-[#2E7D32] text-white hover:bg-[#245f27] active:scale-[.98] shadow-warm',
    dark: 'bg-[#1E1E1E] text-[#FFFDF9] hover:bg-[#333] active:scale-[.98]',
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (as === 'a') return <a className={cls} {...rest}>{children}</a>;
  return <button type="button" className={cls} disabled={disabled} {...rest}>{children}</button>;
}

function Icon({ name, className = 'h-5 w-5', stroke = 2.2 }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    whatsapp: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M20 11.7A8 8 0 0 1 8.2 19.4L4 20.6l1.3-4.1A8 8 0 1 1 20 11.7z" {...common} />
        <path d="M8.8 9c.3-.6.6-.6.9-.6h.6c.2 0 .5 0 .7.6l.7 1.7c.1.3 0 .5-.1.7l-.4.5c-.2.2-.2.4 0 .7a6 6 0 0 0 2.6 2.2c.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.5a2 2 0 0 1-1.4 1.5c-.5.1-1.2.1-3.4-.9a9 9 0 0 1-3.9-3.5c-.6-1-.8-1.9-.7-2.4A2 2 0 0 1 8.8 9z" fill="currentColor" />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
        <path d="M3 4h2.2l1.5 10.4A2 2 0 0 0 8.7 16h8.9a2 2 0 0 0 2-1.6L21 8H6" {...common} />
        <circle cx="9.5" cy="19.5" r="1.6" {...common} /><circle cx="17.5" cy="19.5" r="1.6" {...common} />
      </svg>
    ),
    menu: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" {...common} /></svg>,
    close: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" {...common} /></svg>,
    plus: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" {...common} /></svg>,
    minus: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M5 12h14" {...common} /></svg>,
    check: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M4 12.5l5 5L20 6.5" {...common} /></svg>,
    clock: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" {...common} /><path d="M12 7.5V12l3 2" {...common} /></svg>,
    pin: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" {...common} /><circle cx="12" cy="10" r="2.6" {...common} /></svg>,
    truck: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M3 7h10v9H3zM13 10h4l3 3v3h-7z" {...common} /><circle cx="7" cy="18" r="1.7" {...common} /><circle cx="17" cy="18" r="1.7" {...common} /></svg>,
    cash: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><rect x="3" y="6.5" width="18" height="11" rx="2.5" {...common} /><circle cx="12" cy="12" r="2.6" {...common} /></svg>,
    chevron: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M8 5l7 7-7 7" {...common} /></svg>,
    trash: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" {...common} /></svg>,
    pencil: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><path d="M5 19h3l10-10-3-3L5 16zM14 5l3 3" {...common} /></svg>,
    users: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.2" {...common} /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 5.6a3.2 3.2 0 0 1 0 6M17.5 14.4c2 .6 3.2 2.2 3.6 4.6" {...common} /></svg>,
    info: <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" {...common} /><path d="M12 11v5M12 8h.01" {...common} /></svg>,
  };
  return paths[name] || null;
}

/* ───────────────────────── 8. CARRITO (CONTEXT + REDUCER) ─────────────── */

const MAX_QTY = 30;

function hydrateCart(init) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return init;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.lines)) return init;
    const lines = parsed.lines.filter((l) => ITEMS_BY_ID[l.itemId]).map((l) => ({
      ...l,
      qty: Math.min(Math.max(1, Number(l.qty) || 1), MAX_QTY),
      salsas: Array.isArray(l.salsas) ? l.salsas.filter((s) => SALSAS.some((x) => x.id === s)) : [],
    }));
    return { lines, mode: parsed.mode === 'delivery' ? 'delivery' : 'pickup', payment: parsed.payment === 'transfer' ? 'transfer' : 'cash' };
  } catch (e) { return init; }
}

function linePrice(line) {
  const item = ITEMS_BY_ID[line.itemId];
  const variant = item.variants.find((v) => v.id === line.variantId) || item.variants[0];
  if (line.cheese && typeof variant.priceWithCheese === 'number') return variant.priceWithCheese;
  return variant.price || 0;
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const idx = state.lines.findIndex((l) => l.key === action.line.key);
      if (idx >= 0) {
        const lines = [...state.lines];
        lines[idx] = { ...lines[idx], qty: Math.min(MAX_QTY, lines[idx].qty + action.line.qty) };
        return { ...state, lines };
      }
      return { ...state, lines: [...state.lines, action.line] };
    }
    case 'REMOVE': return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case 'QTY': {
      const lines = state.lines
        .map((l) => (l.key === action.key ? { ...l, qty: Math.min(MAX_QTY, Math.max(1, action.qty)) } : l))
        .filter((l) => l.qty > 0);
      return { ...state, lines };
    }
    case 'MODE': return { ...state, mode: action.mode };
    case 'PAYMENT': return { ...state, payment: action.payment };
    case 'CLEAR': return { ...state, lines: [] };
    default: return state;
  }
}

const CartCtx = createContext(null);
const useCart = () => useContext(CartCtx);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [], mode: 'pickup', payment: 'cash' }, hydrateCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toasts, setToasts] = useState([]);

  /* Persistencia local no sensible: sólo productos, modalidad y preferencia de pago.
     Nunca se guardan nombre, dirección, referencias ni comentarios. */
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state)); } catch (e) { /* noop */ }
  }, [state]);

  const pushToast = useCallback((message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t.slice(-2), { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const count = state.lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = state.lines.reduce((n, l) => n + linePrice(l) * l.qty, 0);
  const shipping = state.mode === 'delivery' ? SITE.deliveryFee : 0;
  const total = subtotal + shipping;

  const addItem = useCallback((line) => {
    dispatch({ type: 'ADD', line });
    track(EVENTS.addToCart, { category: ITEMS_BY_ID[line.itemId]?.category || '' });
    pushToast('¡Agregado al carrito!');
  }, [pushToast]);

  const openCart = useCallback(() => { setDrawerOpen(true); track(EVENTS.cartOpen); }, []);

  const value = {
    state, dispatch, addItem, count, subtotal, shipping, total,
    drawerOpen, setDrawerOpen, openCart, editing, setEditing, toasts, pushToast,
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

/* ───────────────────────── 9. WHATSAPP ────────────────────────────────── */

const cheeseLabel = (item, line) => {
  const variant = item.variants.find((v) => v.id === line.variantId);
  if (!variant || typeof variant.priceWithCheese !== 'number') return null;
  return line.cheese ? 'Con queso (c/q)' : 'Sin queso';
};

const salsaLabel = (line) => {
  if (!line.salsas || !line.salsas.length) return 'Sin salsa';
  return line.salsas.map((id) => (SALSAS.find((s) => s.id === id) || {}).label || id).join(', ');
};

function buildOrderMessage({ lines, mode, name, address, payment, comment }) {
  const out = [];
  out.push('🌮 *NUEVO PEDIDO — TAQUERÍA LA TÍA*');
  out.push('');
  out.push(`*Cliente:* ${name.trim()}`);
  out.push(`*Modalidad:* ${mode === 'delivery' ? 'Servicio a domicilio' : 'Recoger en taquería'}`);
  if (mode === 'delivery' && address.trim()) out.push(`*Dirección y referencias:* ${address.trim()}`);
  out.push('');
  out.push('*PEDIDO*');
  let subtotal = 0;
  lines.forEach((line, i) => {
    const item = ITEMS_BY_ID[line.itemId];
    const variant = item.variants.find((v) => v.id === line.variantId) || item.variants[0];
    const unit = linePrice(line);
    const importe = unit * line.qty;
    subtotal += importe;
    let head = `${i + 1}. ${line.qty}x ${item.name} — ${variant.label}`;
    const ch = cheeseLabel(item, line);
    if (ch) head += ` — ${ch}`;
    if (variant.serves) head += ` — Para compartir: ${variant.serves}`;
    out.push(head);
    if (item.customization.onion) out.push(`   Cebolla: ${line.onion === 'sin-cebolla' ? 'Sin cebolla' : 'Con cebolla'}`);
    if (item.customization.cilantro) out.push(`   Cilantro: ${line.cilantro === 'sin-cilantro' ? 'Sin cilantro' : 'Con cilantro'}`);
    if (item.customization.salsas) out.push(`   Salsas: ${salsaLabel(line)}`);
    if (line.note && line.note.trim()) out.push(`   Nota: ${line.note.trim()}`);
    out.push(`   Importe: ${money(importe)}`);
  });
  const shipping = mode === 'delivery' ? SITE.deliveryFee : 0;
  out.push('');
  out.push(`*Subtotal:* ${money(subtotal)}`);
  out.push(`*Envío:* ${money(shipping)}`);
  out.push(`*Total estimado:* ${money(subtotal + shipping)}`);
  out.push('');
  out.push(`*Método de pago preferido:* ${payment === 'transfer' ? 'Transferencia' : 'Efectivo'}`);
  out.push(`*Comentario general:* ${comment.trim() || 'Sin comentario'}`);
  out.push('');
  out.push('Entiendo que el pedido, disponibilidad, total final y tiempo de entrega deben confirmarse por WhatsApp. ¡Gracias!');
  return out.join('\n');
}

/* ───────────────────────── 10. HEADER / FOOTER ────────────────────────── */

const NAV = [
  { label: 'Menú', path: '/menu' },
  { label: 'Taquizas', path: '/taquizas' },
  { label: 'Ubicación', path: '/ubicacion' },
  { label: 'FAQ', path: '/preguntas-frecuentes' },
];

function Header() {
  const { route } = useContext(RouterCtx);
  const { count, openCart } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const panelRef = useRef(null);
  const reduce = useReducedMotion();

  useLockBody(navOpen);
  useFocusTrap(panelRef, navOpen, () => setNavOpen(false));
  useEffect(() => { setNavOpen(false); }, [route]);

  const isActive = (p) => route === p || (p !== '/' && route.startsWith(p));

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8DED2] bg-[#FFFDF9]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <a href={A('/')} className="shrink-0 rounded-xl" aria-label="Taquería La Tía — Ir al inicio">
          <BrandLogo size={46} />
        </a>

        <nav aria-label="Principal" className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.path}
              href={A(n.path)}
              aria-current={isActive(n.path) ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                isActive(n.path) ? 'bg-[#1E1E1E] text-[#FFFDF9]' : 'text-[#1E1E1E] hover:bg-[#E85D04]/10 hover:text-[#E85D04]'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={waLink('¡Hola, Taquería La Tía! Quiero hacer un pedido. 🌮')}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track(EVENTS.whatsappOrder, { source: 'header' })}
            className="hidden items-center gap-2 rounded-full bg-[#C81D25] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#97131A] active:scale-[.98] sm:inline-flex"
          >
            <Icon name="whatsapp" className="h-[18px] w-[18px]" />
            Pedir por WhatsApp
          </a>

          <button
            id="cart-trigger"
            type="button"
            onClick={openCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1E1E1E] bg-[#FFFDF9] transition-colors hover:border-[#E85D04] hover:text-[#E85D04]"
            aria-label={`Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`}
          >
            <Icon name="cart" className="h-5 w-5" />
            <span className={`tnum absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FFB800] px-1 text-[12px] font-black text-[#3A2A00] ring-2 ring-[#FFFDF9] ${count ? 'anim-pulse' : 'opacity-0'}`}>
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#1E1E1E] lg:hidden"
            aria-label={navOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          >
            <Icon name={navOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="overflow-hidden border-t border-[#E8DED2] bg-[#FFFDF9] lg:hidden"
          >
            <nav aria-label="Móvil" className="mx-auto flex max-w-[1200px] flex-col gap-1.5 px-4 py-4 sm:px-6">
              {NAV.map((n) => (
                <a
                  key={n.path}
                  href={A(n.path)}
                  className={`rounded-2xl px-4 py-3 text-base font-bold ${isActive(n.path) ? 'bg-[#1E1E1E] text-[#FFFDF9]' : 'bg-[#F9F5F0] text-[#1E1E1E]'}`}
                >
                  {n.label}
                </a>
              ))}
              <a
                href={waLink('¡Hola, Taquería La Tía! Quiero hacer un pedido. 🌮')}
                target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C81D25] px-4 py-3 text-base font-bold text-white"
              >
                <Icon name="whatsapp" className="h-5 w-5" /> Pedir por WhatsApp
              </a>
              <p className="mt-3 px-1 text-sm text-[#5C5C5C]">{SITE.hours}</p>
              <p className="px-1 text-sm text-[#5C5C5C]">{SITE.addressShort}</p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer({ onOpenPreferences }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#1E1E1E] text-[#FFFDF9]">
      <ChilePattern opacity={0.08} tint={C.maize} />
      <div className="relative mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo size={52} className="[&_span:last-child_span:first-child]:text-[#FFB800] [&_span:last-child_span:last-child]:text-[#FFFDF9]" />
          <p className="mt-4 max-w-xs text-[15px] text-[#FFFDF9]/80">{SITE.tagline}</p>
          <p className="mt-3 text-sm text-[#FFFDF9]/60">El antojo se arma a tu gusto.</p>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <h2 className="text-sm font-black uppercase tracking-[.16em] text-[#FFB800]">Explora</h2>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            <li><a className="hover:text-[#FFB800]" href={A('/menu')}>Menú completo</a></li>
            <li><a className="hover:text-[#FFB800]" href={A('/taquizas')}>Taquizas para eventos</a></li>
            <li><a className="hover:text-[#FFB800]" href={A('/ubicacion')}>Ubicación y horario</a></li>
            <li><a className="hover:text-[#FFB800]" href={A('/preguntas-frecuentes')}>Preguntas frecuentes</a></li>
            <li><a className="hover:text-[#FFB800]" href={A('/terminos')}>Términos de pedido</a></li>
            <li><a className="hover:text-[#FFB800]" href={A('/privacidad')}>Aviso de privacidad</a></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[.16em] text-[#FFB800]">Encuéntranos</h2>
          <ul className="mt-4 space-y-3 text-[15px] text-[#FFFDF9]/85">
            <li className="flex gap-2.5"><Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-[#FFB800]" /><span>{SITE.address}</span></li>
            <li className="flex gap-2.5"><Icon name="clock" className="mt-0.5 h-5 w-5 shrink-0 text-[#FFB800]" /><span>{SITE.hours}</span></li>
            <li className="flex gap-2.5"><Icon name="whatsapp" className="mt-0.5 h-5 w-5 shrink-0 text-[#FFB800]" /><span>{SITE.phoneDisplay}</span></li>
            <li className="flex gap-2.5"><Icon name="cash" className="mt-0.5 h-5 w-5 shrink-0 text-[#FFB800]" /><span>Efectivo y transferencia (se coordinan por WhatsApp)</span></li>
          </ul>
          <a
            href={waLink('¡Hola, Taquería La Tía! Quiero hacer un pedido. 🌮')}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track(EVENTS.whatsappOrder, { source: 'footer' })}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFB800] px-5 py-2.5 text-sm font-bold text-[#3A2A00] hover:bg-[#FFC733]"
          >
            <Icon name="whatsapp" className="h-[18px] w-[18px]" /> Pedir por WhatsApp
          </a>
        </div>
      </div>

      <div className="relative border-t border-[#FFFDF9]/12">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-6 text-sm text-[#FFFDF9]/65 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} Taquería La Tía · Iztapalapa, Ciudad de México.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={onOpenPreferences} className="underline decoration-dotted underline-offset-4 hover:text-[#FFB800]">
              Preferencias de cookies
            </button>
            <a href={A('/privacidad')} className="hover:text-[#FFB800]">Privacidad</a>
            <a href={A('/terminos')} className="hover:text-[#FFB800]">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── 11. TARJETA DE PRODUCTO ────────────────────── */

function priceFrom(item) {
  const prices = item.variants.flatMap((v) => [v.price, typeof v.priceWithCheese === 'number' ? v.priceWithCheese : null].filter((n) => n !== null));
  return Math.min(...prices);
}

function ProductCard({ item, onCustomize, compact = false }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#E8DED2] bg-white transition-colors hover:border-[#E85D04] focus-within:border-[#C81D25]"
    >
      <div className="relative overflow-hidden bg-[#F9F5F0]">
        <Illustration name={item.illus} className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        {!item.isAvailable && <span className="absolute left-3 top-3 rounded-full bg-[#1E1E1E] px-3 py-1 text-xs font-bold text-[#FFFDF9]">Por hoy no disponible</span>}
        {item.featured && item.isAvailable && <span className="absolute left-3 top-3 rounded-full bg-[#FFB800] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#3A2A00]">Antojo del comal</span>}
        <span className="sr-only">Ilustración decorativa de {item.name}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[19px] font-extrabold text-[#1E1E1E]">{item.name}</h3>
        {!compact && item.description && <p className="text-sm leading-relaxed text-[#5C5C5C]">{item.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="leading-none">
            <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[#5C5C5C]">{item.variants.length > 1 ? 'Desde' : 'Precio'}</span>
            <span className="tnum mt-1 block text-2xl font-black text-[#C81D25]">{money(priceFrom(item))}</span>
          </p>
          <Btn variant="primary" size="sm" disabled={!item.isAvailable}
            onClick={(e) => onCustomize(item, e.currentTarget.getBoundingClientRect())}
            aria-label={`Personalizar y agregar ${item.name}`}>
            Personalizar <Icon name="chevron" className="h-4 w-4" />
          </Btn>
        </div>
        {item.cheeseNote && <p className="text-xs font-semibold text-[#8A5200]">{item.cheeseNote}</p>}
      </div>
    </motion.article>
  );
}

/* ───────────────────────── 12. PERSONALIZADOR (DIALOG ACCESIBLE) ──────── */

function QuantityStepper({ value, onChange, min = 1, max = MAX_QTY, labelledBy }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-2 border-[#1E1E1E] bg-white p-1" role="group" aria-labelledby={labelledBy}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F9F5F0] disabled:opacity-35" aria-label="Quitar una unidad">
        <Icon name="minus" className="h-4 w-4" />
      </button>
      <span className="tnum min-w-8 text-center text-lg font-black">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F9F5F0] disabled:opacity-35" aria-label="Agregar una unidad">
        <Icon name="plus" className="h-4 w-4" />
      </button>
    </div>
  );
}

function OptionChip({ checked, type = 'radio', children, ...rest }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 text-sm font-semibold transition-all ${
      checked ? 'border-[#C81D25] bg-[#C81D25]/[.08] text-[#97131A]' : 'border-[#E8DED2] bg-white text-[#1E1E1E] hover:border-[#E85D04]'
    }`}>
      <input type={type} className="sr-only" checked={checked} {...rest} />
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${type === 'checkbox' ? 'rounded-md' : 'rounded-full'} ${
        checked ? 'border-[#C81D25] bg-[#C81D25] text-white' : 'border-[#5C5C5C]/45 bg-white text-transparent'
      }`} aria-hidden="true">
        <Icon name="check" className="h-3.5 w-3.5" stroke={3} />
      </span>
      <span className="flex flex-1 items-center gap-2">{children}</span>
    </label>
  );
}

function ProductCustomizer({ item, initialLine, onClose, onAdd, onSave }) {
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  useLockBody(true);
  useFocusTrap(panelRef, true, onClose);

  const hasCheese = item.variants.some((v) => typeof v.priceWithCheese === 'number');
  const singleVariant = item.variants.length === 1;

  const [variantId, setVariantId] = useState(initialLine?.variantId || (singleVariant ? item.variants[0].id : ''));
  const [cheese, setCheese] = useState(initialLine ? !!initialLine.cheese : (hasCheese ? null : false));
  const [onion, setOnion] = useState(initialLine?.onion || '');
  const [cilantro, setCilantro] = useState(initialLine?.cilantro || '');
  const [salsas, setSalsas] = useState(initialLine?.salsas || []);
  const [noSalsa, setNoSalsa] = useState(initialLine ? !(initialLine.salsas || []).length : false);
  const [note, setNote] = useState(initialLine?.note || '');
  const [qty, setQty] = useState(initialLine?.qty || 1);
  const [touched, setTouched] = useState(false);

  useEffect(() => { track(EVENTS.customizeOpen, { category: item.category }); }, [item.category]);

  const variant = item.variants.find((v) => v.id === variantId) || null;
  const unit = variant ? (cheese && typeof variant.priceWithCheese === 'number' ? variant.priceWithCheese : variant.price) : 0;
  const total = unit * qty;

  const missing = [];
  if (!variant) missing.push('elige la carne o versión');
  if (hasCheese && cheese === null) missing.push('elige con o sin queso');
  if (item.customization.onion && !onion) missing.push('elige cebolla');
  if (item.customization.cilantro && !cilantro) missing.push('elige cilantro');
  if (item.customization.salsas && !salsas.length && !noSalsa) missing.push('elige salsas');
  const valid = missing.length === 0;

  const toggleSalsa = (id) => {
    setNoSalsa(false);
    setSalsas((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) {
      const firstMissing = panelRef.current?.querySelector('[data-missing="true"]');
      if (firstMissing) firstMissing.focus();
      return;
    }
    const line = {
      key: [item.id, variantId, cheese ? 'cq' : 'sq', onion, cilantro, (noSalsa ? [] : salsas).slice().sort().join('|') || 'none', (note || '').trim()].join('::'),
      itemId: item.id, variantId, cheese: hasCheese ? !!cheese : false,
      onion: item.customization.onion ? onion : '',
      cilantro: item.customization.cilantro ? cilantro : '',
      salsas: item.customization.salsas ? (noSalsa ? [] : salsas) : [],
      note: item.customization.note ? note.slice(0, item.customization.maxNoteLength) : '',
      qty,
    };
    if (initialLine) onSave(line, e.submitter ? e.submitter.getBoundingClientRect() : null);
    else onAdd(line, e.submitter ? e.submitter.getBoundingClientRect() : null);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <motion.button
        type="button" aria-label="Cerrar personalizador" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1E1E1E]/60 backdrop-blur-[2px]"
      />
      <motion.div
        ref={panelRef}
        role="dialog" aria-modal="true" aria-labelledby="customizer-title" aria-describedby="customizer-desc"
        initial={reduce ? false : { y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 30, opacity: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#FFFDF9] shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="flex items-start gap-4 border-b border-[#E8DED2] bg-[#F9F5F0] p-5">
          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#E8DED2] bg-white">
            <Illustration name={item.illus} className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#E85D04]">{(CAT_BY_SLUG[item.category] || {}).name || 'Menú'}</p>
            <h2 id="customizer-title" className="mt-1 truncate text-xl font-black sm:text-2xl">{item.name}</h2>
            <p id="customizer-desc" className="mt-1 text-sm text-[#5C5C5C]">{item.description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1E1E1E] hover:border-[#C81D25] hover:text-[#C81D25]">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span id="qty-label" className="text-sm font-black uppercase tracking-[.1em]">Cantidad</span>
              <QuantityStepper value={qty} onChange={setQty} labelledBy="qty-label" />
            </div>

            <fieldset data-missing={!variant} tabIndex={-1}>
              <legend className="text-sm font-black uppercase tracking-[.1em]">
                {variant && variant.serves ? 'Tamaño' : 'Elige tu carne'} <span className="text-[#C81D25]">*</span>
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {item.variants.map((v) => (
                  <OptionChip key={v.id} name={`variant-${item.id}`} checked={variantId === v.id}
                    onChange={() => { setVariantId(v.id); if (!hasCheese) setCheese(false); }}>
                    <span className="flex-1">{v.label}{v.serves ? <span className="ml-1 text-xs font-medium text-[#5C5C5C]">· {v.serves}</span> : null}</span>
                    <span className="tnum font-black text-[#C81D25]">{money(v.price)}</span>
                  </OptionChip>
                ))}
              </div>
            </fieldset>

            {hasCheese && (
              <fieldset data-missing={cheese === null} tabIndex={-1}>
                <legend className="text-sm font-black uppercase tracking-[.1em]">Queso <span className="text-[#C81D25]">*</span></legend>
                <p className="mt-1 text-xs font-semibold text-[#8A5200]">c/q = con queso</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <OptionChip name={`cheese-${item.id}`} checked={cheese === false} onChange={() => setCheese(false)}>
                    Sin queso {variant ? <span className="tnum ml-auto font-black text-[#C81D25]">{money(variant.price)}</span> : null}
                  </OptionChip>
                  <OptionChip name={`cheese-${item.id}`} checked={cheese === true} onChange={() => setCheese(true)}>
                    Con queso (c/q) {variant && typeof variant.priceWithCheese === 'number' ? <span className="tnum ml-auto font-black text-[#C81D25]">{money(variant.priceWithCheese)}</span> : null}
                  </OptionChip>
                </div>
              </fieldset>
            )}

            {item.customization.onion && (
              <fieldset data-missing={!onion} tabIndex={-1}>
                <legend className="text-sm font-black uppercase tracking-[.1em]">Cebolla <span className="text-[#C81D25]">*</span></legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OptionChip name={`onion-${item.id}`} checked={onion === 'con-cebolla'} onChange={() => setOnion('con-cebolla')}>Con cebolla</OptionChip>
                  <OptionChip name={`onion-${item.id}`} checked={onion === 'sin-cebolla'} onChange={() => setOnion('sin-cebolla')}>Sin cebolla</OptionChip>
                </div>
              </fieldset>
            )}

            {item.customization.cilantro && (
              <fieldset data-missing={!cilantro} tabIndex={-1}>
                <legend className="text-sm font-black uppercase tracking-[.1em]">Cilantro <span className="text-[#C81D25]">*</span></legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  <OptionChip name={`cilantro-${item.id}`} checked={cilantro === 'con-cilantro'} onChange={() => setCilantro('con-cilantro')}>Con cilantro</OptionChip>
                  <OptionChip name={`cilantro-${item.id}`} checked={cilantro === 'sin-cilantro'} onChange={() => setCilantro('sin-cilantro')}>Sin cilantro</OptionChip>
                </div>
              </fieldset>
            )}

            {item.customization.salsas && (
              <fieldset data-missing={!salsas.length && !noSalsa} tabIndex={-1}>
                <legend className="text-sm font-black uppercase tracking-[.1em]">Salsas <span className="text-[#C81D25]">*</span></legend>
                <p className="mt-1 text-xs text-[#5C5C5C]">Puedes elegir varias. Sin costo adicional.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {SALSAS.map((s) => (
                    <OptionChip key={s.id} type="checkbox" name={`salsa-${s.id}`} checked={salsas.includes(s.id)} onChange={() => toggleSalsa(s.id)}>
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#1E1E1E]/30" style={{ background: s.color }} aria-hidden="true" />
                      {s.label}
                    </OptionChip>
                  ))}
                  <OptionChip type="checkbox" name="salsa-none" checked={noSalsa} onChange={() => { setNoSalsa(true); setSalsas([]); }}>
                    Sin salsa
                  </OptionChip>
                </div>
              </fieldset>
            )}

            {item.customization.note && (
              <div>
                <label htmlFor="item-note" className="text-sm font-black uppercase tracking-[.1em]">
                  Nota para la cocina <span className="font-medium normal-case tracking-normal text-[#5C5C5C]">(opcional)</span>
                </label>
                <textarea
                  id="item-note" value={note} maxLength={item.customization.maxNoteLength} rows={2}
                  onChange={(e) => setNote(e.target.value)} placeholder="Ej. bien dorado, salsa aparte…"
                  className="mt-2 w-full resize-none rounded-2xl border-2 border-[#E8DED2] bg-white p-3 text-sm outline-none transition-colors focus:border-[#E85D04]"
                />
                <p className="tnum text-right text-xs text-[#5C5C5C]">{note.length}/{item.customization.maxNoteLength}</p>
              </div>
            )}

            {item.id === 'alambres' && (
              <p className="flex gap-2 rounded-2xl border border-[#FFB800]/50 bg-[#FFB800]/12 p-3 text-sm font-medium text-[#6B4A00]">
                <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
                Consulta disponibilidad de ingredientes al confirmar tu pedido.
              </p>
            )}

            {touched && !valid && (
              <p role="alert" className="rounded-2xl border-2 border-[#C81D25]/30 bg-[#C81D25]/[.07] p-3 text-sm font-semibold text-[#97131A]">
                Para agregar al carrito, {missing.join(', ')}.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-[#E8DED2] bg-[#FFFDF9] p-4">
            <div className="leading-none">
              <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[#5C5C5C]">Total</span>
              <span className="tnum mt-1 block text-2xl font-black text-[#C81D25]" aria-live="polite">{money(total)}</span>
            </div>
            <Btn type="submit" variant="primary" size="lg" className="ml-auto flex-1 sm:flex-none">
              <Icon name="cart" className="h-5 w-5" />
              {initialLine ? 'Guardar cambios' : 'Agregar al carrito'}
            </Btn>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── 13. CARRITO DRAWER + CHECKOUT WHATSAPP ─────── */

function CartLine({ line, onEdit, onQty, onRemove }) {
  const item = ITEMS_BY_ID[line.itemId];
  const variant = item.variants.find((v) => v.id === line.variantId) || item.variants[0];
  const unit = linePrice(line);
  const ch = cheeseLabel(item, line);
  const opts = [];
  if (item.customization.onion) opts.push(line.onion === 'sin-cebolla' ? 'Sin cebolla' : 'Con cebolla');
  if (item.customization.cilantro) opts.push(line.cilantro === 'sin-cilantro' ? 'Sin cilantro' : 'Con cilantro');
  if (item.customization.salsas) opts.push(salsaLabel(line));
  if (variant.serves) opts.push(`Para compartir: ${variant.serves}`);

  return (
    <li className="rounded-3xl border-2 border-[#E8DED2] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F9F5F0]">
          <Illustration name={item.illus} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-extrabold leading-tight">{item.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-[#5C5C5C]">{variant.label}{ch ? ` · ${ch}` : ''}</p>
          <p className="tnum mt-1 text-sm font-black text-[#C81D25]">{money(unit)} c/u</p>
        </div>
        <button type="button" onClick={() => onRemove(line.key)}
          aria-label={`Eliminar ${item.name} ${variant.label} del carrito`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C5C5C] transition-colors hover:bg-[#C81D25]/10 hover:text-[#C81D25]">
          <Icon name="trash" className="h-[18px] w-[18px]" />
        </button>
      </div>

      {opts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Personalización de ${item.name}`}>
          {opts.map((o) => (
            <li key={o} className="rounded-full border border-[#E8DED2] bg-[#F9F5F0] px-2.5 py-1 text-xs font-semibold text-[#5C5C5C]">{o}</li>
          ))}
        </ul>
      )}
      {line.note && <p className="mt-2 rounded-2xl bg-[#FFB800]/12 px-3 py-2 text-xs font-medium text-[#6B4A00]">Nota: {line.note}</p>}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[#E8DED2] pt-3">
        <QuantityStepper value={line.qty} onChange={(q) => onQty(line.key, q)} labelledBy={`qty-${line.key}`} />
        <span id={`qty-${line.key}`} className="sr-only">Cantidad de {item.name} {variant.label}</span>
        <p className="tnum text-lg font-black">{money(unit * line.qty)}</p>
      </div>
      <button type="button" onClick={() => onEdit(line)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#E85D04] hover:underline">
        <Icon name="pencil" className="h-4 w-4" /> Editar personalización
      </button>
    </li>
  );
}

function CartDrawer() {
  const { state, dispatch, drawerOpen, setDrawerOpen, subtotal, shipping, total, count, addItem, editing, setEditing, pushToast } = useCart();
  const reduce = useReducedMotion();
  const panelRef = useRef(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useLockBody(drawerOpen);
  useFocusTrap(panelRef, drawerOpen, () => setDrawerOpen(false));
  useEffect(() => { if (!drawerOpen) { setStep(1); setAttempted(false); } }, [drawerOpen]);

  const missing = [];
  if (name.trim().length < 2) missing.push('tu nombre');
  if (state.mode === 'delivery' && address.trim().length < 8) missing.push('dirección y referencias');
  if (!confirmed) missing.push('la confirmación por WhatsApp');
  const canSend = state.lines.length > 0 && missing.length === 0;

  const send = () => {
    setAttempted(true);
    if (!canSend) return;
    const msg = buildOrderMessage({ lines: state.lines, mode: state.mode, name, address, payment: state.payment, comment });
    track(EVENTS.whatsappOrder, { mode: state.mode, items: state.lines.length });
    window.open(waLink(msg), '_blank', 'noopener,noreferrer');
    pushToast('Abrimos WhatsApp con tu resumen.');
  };

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[95]">
            <motion.button
              type="button" aria-label="Cerrar carrito" onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 h-full w-full cursor-default bg-[#1E1E1E]/60 backdrop-blur-[2px]"
            />
            <motion.aside
              ref={panelRef}
              role="dialog" aria-modal="true" aria-labelledby="cart-title"
              initial={reduce ? false : { y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-3xl bg-[#FFFDF9] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:rounded-l-3xl sm:border-l sm:border-[#E8DED2]"
            >
              <div className="flex justify-center pt-3 sm:hidden">
                <span className="h-1.5 w-12 rounded-full bg-[#E8DED2]" aria-hidden="true" />
              </div>

              <div className="flex items-center gap-3 border-b border-[#E8DED2] px-4 py-3.5 sm:px-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C81D25]/10 text-[#C81D25]">
                  <Icon name="cart" className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <h2 id="cart-title" className="text-lg font-black leading-tight">Tu pedido</h2>
                  <p className="tnum text-xs font-semibold text-[#5C5C5C]" aria-live="polite">
                    {count} {count === 1 ? 'producto' : 'productos'} · Total estimado {money(total)}
                  </p>
                </div>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar carrito"
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1E1E1E] hover:border-[#C81D25] hover:text-[#C81D25]">
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                {state.lines.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                    <div className="w-52 overflow-hidden rounded-3xl"><Illustration name="tacosMaiz" className="w-full" /></div>
                    <h3 className="text-lg font-black">Aún no hay antojo aquí</h3>
                    <p className="max-w-xs text-sm text-[#5C5C5C]">Elige tus tacos, arma cada uno a tu gusto y regresa a revisar tu carrito.</p>
                    <Btn as="a" href={A('/menu')} variant="primary" onClick={() => setDrawerOpen(false)}>Ver menú y pedir</Btn>
                  </div>
                ) : step === 1 ? (
                  <div className="space-y-5">
                    <ul className="space-y-3" aria-label="Productos en el carrito">
                      {state.lines.map((line) => (
                        <CartLine
                          key={line.key}
                          line={line}
                          onQty={(key, q) => dispatch({ type: 'QTY', key, qty: q })}
                          onRemove={(key) => { dispatch({ type: 'REMOVE', key }); track(EVENTS.cartItemRemove); }}
                          onEdit={(l) => { setEditing({ item: ITEMS_BY_ID[l.itemId], line: l }); setDrawerOpen(false); }}
                        />
                      ))}
                    </ul>

                    <fieldset className="rounded-3xl border-2 border-[#E8DED2] bg-white p-4">
                      <legend className="px-1 text-sm font-black uppercase tracking-[.1em]">¿Cómo quieres tu pedido?</legend>
                      <div className="mt-2 grid gap-2">
                        <OptionChip name="mode" checked={state.mode === 'pickup'}
                          onChange={() => { dispatch({ type: 'MODE', mode: 'pickup' }); track(EVENTS.deliverySelect, { mode: 'pickup' }); }}>
                          <Icon name="pin" className="h-4 w-4 text-[#E85D04]" /> Recoger en taquería
                        </OptionChip>
                        <OptionChip name="mode" checked={state.mode === 'delivery'}
                          onChange={() => { dispatch({ type: 'MODE', mode: 'delivery' }); track(EVENTS.deliverySelect, { mode: 'delivery' }); }}>
                          <Icon name="truck" className="h-4 w-4 text-[#E85D04]" /> Servicio a domicilio
                          <span className="tnum ml-auto text-xs font-black text-[#C81D25]">+{money(SITE.deliveryFee)}</span>
                        </OptionChip>
                      </div>
                      <p className="mt-3 text-xs text-[#5C5C5C]">El envío de {money(SITE.deliveryFee)} es extra y está sujeto a confirmación por WhatsApp.</p>
                    </fieldset>

                    <div className="rounded-3xl border-2 border-[#E8DED2] bg-[#F9F5F0] p-4">
                      <dl className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><dt className="text-[#5C5C5C]">Subtotal</dt><dd className="tnum font-bold">{money(subtotal)}</dd></div>
                        <div className="flex justify-between"><dt className="text-[#5C5C5C]">Envío</dt><dd className="tnum font-bold">{money(shipping)}</dd></div>
                        <div className="mt-2 flex justify-between border-t border-[#E8DED2] pt-2 text-base">
                          <dt className="font-black">Total estimado</dt>
                          <dd className="tnum font-black text-[#C81D25]" aria-live="polite">{money(total)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 flex gap-2 rounded-2xl bg-[#FFB800]/15 p-3 text-xs font-medium text-[#6B4A00]">
                        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
                        El total mostrado es estimado. Tu pedido, disponibilidad, total final y tiempo de entrega se confirman por WhatsApp.
                      </p>
                    </div>

                    <Btn variant="dark" size="lg" className="w-full" onClick={() => setStep(2)} aria-expanded={step === 2}>
                      Revisar y enviar por WhatsApp <Icon name="chevron" className="h-5 w-5" />
                    </Btn>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E85D04] hover:underline">
                      <Icon name="chevron" className="h-4 w-4 rotate-180" /> Volver a mi pedido
                    </button>

                    <div className="rounded-3xl border-2 border-[#E8DED2] bg-[#F9F5F0] p-4">
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between"><dt className="text-[#5C5C5C]">Productos</dt><dd className="tnum font-bold">{count}</dd></div>
                        <div className="flex justify-between"><dt className="text-[#5C5C5C]">Subtotal</dt><dd className="tnum font-bold">{money(subtotal)}</dd></div>
                        <div className="flex justify-between"><dt className="text-[#5C5C5C]">Envío</dt><dd className="tnum font-bold">{money(shipping)}</dd></div>
                        <div className="mt-1.5 flex justify-between border-t border-[#E8DED2] pt-1.5">
                          <dt className="font-black">Total estimado</dt><dd className="tnum font-black text-[#C81D25]">{money(total)}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <label htmlFor="cli-name" className="text-sm font-black uppercase tracking-[.1em]">Nombre <span className="text-[#C81D25]">*</span></label>
                      <input id="cli-name" type="text" value={name} autoComplete="given-name" onChange={(e) => setName(e.target.value)}
                        placeholder="¿Cómo te llamamos?"
                        className="mt-2 w-full rounded-2xl border-2 border-[#E8DED2] bg-white p-3 text-sm outline-none transition-colors focus:border-[#E85D04]" />
                    </div>

                    {state.mode === 'delivery' && (
                      <div>
                        <label htmlFor="cli-address" className="text-sm font-black uppercase tracking-[.1em]">Dirección y referencias <span className="text-[#C81D25]">*</span></label>
                        <textarea id="cli-address" rows={3} value={address} autoComplete="street-address" onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle, número, colonia y entre qué calles. Agrega una referencia."
                          className="mt-2 w-full resize-none rounded-2xl border-2 border-[#E8DED2] bg-white p-3 text-sm outline-none transition-colors focus:border-[#E85D04]" />
                        <p className="mt-1.5 text-xs text-[#5C5C5C]">Estos datos sólo viajan en tu mensaje de WhatsApp. No se guardan en el sitio.</p>
                      </div>
                    )}

                    <fieldset>
                      <legend className="text-sm font-black uppercase tracking-[.1em]">Método de pago preferido</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <OptionChip name="payment" checked={state.payment === 'cash'}
                          onChange={() => { dispatch({ type: 'PAYMENT', payment: 'cash' }); track(EVENTS.paymentSelect, { method: 'cash' }); }}>
                          <Icon name="cash" className="h-4 w-4 text-[#E85D04]" /> Efectivo
                        </OptionChip>
                        <OptionChip name="payment" checked={state.payment === 'transfer'}
                          onChange={() => { dispatch({ type: 'PAYMENT', payment: 'transfer' }); track(EVENTS.paymentSelect, { method: 'transfer' }); }}>
                          Transferencia
                        </OptionChip>
                      </div>
                      <p className="mt-2 text-xs text-[#5C5C5C]">El pago se coordina de forma privada por WhatsApp. Nunca pedimos datos bancarios ni tarjetas en este sitio.</p>
                    </fieldset>

                    <div>
                      <label htmlFor="gen-comment" className="text-sm font-black uppercase tracking-[.1em]">
                        Comentario general <span className="font-medium normal-case tracking-normal text-[#5C5C5C]">(opcional)</span>
                      </label>
                      <textarea id="gen-comment" rows={2} maxLength={280} value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Ej. paso por él a las 8:30 pm"
                        className="mt-2 w-full resize-none rounded-2xl border-2 border-[#E8DED2] bg-white p-3 text-sm outline-none transition-colors focus:border-[#E85D04]" />
                    </div>

                    <label className={`flex cursor-pointer gap-3 rounded-3xl border-2 p-4 text-sm font-medium ${confirmed ? 'border-[#2E7D32] bg-[#2E7D32]/[.07]' : 'border-[#E8DED2] bg-white'}`}>
                      <input type="checkbox" className="sr-only" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${confirmed ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-[#5C5C5C]/45 text-transparent'}`} aria-hidden="true">
                        <Icon name="check" className="h-4 w-4" stroke={3} />
                      </span>
                      <span>Entiendo que el pedido, disponibilidad, total final y tiempo de entrega deben confirmarse por WhatsApp.</span>
                    </label>

                    {attempted && !canSend && (
                      <p role="alert" className="rounded-2xl border-2 border-[#C81D25]/30 bg-[#C81D25]/[.07] p-3 text-sm font-semibold text-[#97131A]">
                        Nos falta {missing.join(', ')} para armar tu mensaje.
                      </p>
                    )}

                    <Btn variant="whatsapp" size="lg" className="w-full" onClick={send} aria-disabled={!canSend}>
                      <Icon name="whatsapp" className="h-5 w-5" /> Enviar pedido por WhatsApp
                    </Btn>
                    <p className="text-center text-xs text-[#5C5C5C]">Se abrirá WhatsApp con el resumen de tu pedido listo para enviar.</p>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <ProductCustomizer
            item={editing.item}
            initialLine={editing.line}
            onClose={() => setEditing(null)}
            onSave={(line) => {
              dispatch({ type: 'REMOVE', key: editing.line.key });
              addItem(line);
              setEditing(null);
              setTimeout(() => setDrawerOpen(true), 60);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Toasts() {
  const { toasts } = useCart();
  const [fly, setFly] = useState(null);
  const reduce = useReducedMotion();

  useEffect(() => flyBus.on((rect) => { if (!reduce) setFly({ rect, id: Date.now() }); }), [reduce]);

  const cartRect = () => {
    const el = document.getElementById('cart-trigger');
    return el ? el.getBoundingClientRect() : null;
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-none flex items-center gap-2 rounded-full bg-[#1E1E1E] px-5 py-3 text-sm font-bold text-[#FFFDF9] shadow-xl">
              <Icon name="check" className="h-4 w-4 text-[#FFB800]" stroke={3} /> {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {fly && (() => {
          const target = cartRect();
          if (!target) return null;
          const from = { x: fly.rect.left + fly.rect.width / 2, y: fly.rect.top + fly.rect.height / 2 };
          const to = { x: target.left + target.width / 2, y: target.top + target.height / 2 };
          return (
            <motion.span
              key={fly.id}
              initial={{ x: from.x, y: from.y, scale: 1, opacity: 1 }}
              animate={{ x: to.x, y: to.y, scale: 0.3, opacity: 0.9 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              onAnimationComplete={() => setFly(null)}
              className="pointer-events-none fixed left-0 top-0 z-[130] flex h-9 w-9 items-center justify-center rounded-full bg-[#C81D25] text-white shadow-lg"
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true" focusable="false">
                <path d="M5 20c0-6 5-11 11-11s11 5 11 11c-5 3-17 3-22 0z" fill={C.tortilla} stroke={C.charcoal} strokeWidth="2" />
                <path d="M9 17c2-4 5-6 7-6s5 2 7 6c-5 3-9 3-14 0z" fill={C.meat} />
              </svg>
            </motion.span>
          );
        })()}
      </AnimatePresence>
    </>
  );
}

/* ───────────────────────── 14. SECCIONES DE HOME ──────────────────────── */

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-[#FFFDF9]">
      <TortillaPattern opacity={0.08} />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#FFB800]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#C81D25]/12 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-20 lg:pt-16">
        <div>
          <Eyebrow>Taquería La Tía · Iztapalapa</Eyebrow>
          <h1 className="mt-5 text-[2.6rem] font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.1rem]">
            El antojo se arma{' '}
            <span className="relative inline-block text-[#C81D25]">
              a tu gusto.
              <svg viewBox="0 0 220 18" className="absolute -bottom-2 left-0 h-3 w-full text-[#FFB800]" aria-hidden="true" focusable="false">
                <motion.path d="M4 12c52-10 122-12 212-4" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }} />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#5C5C5C] sm:text-lg">
            Tacos, gringas, tortas, volcanes y especialidades para pedir con cebolla, sin cebolla y con tus salsas favoritas.
            Arma tu pedido y envíalo por WhatsApp.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Btn as="a" href={A('/menu')} variant="primary" size="lg">Ver menú y pedir <Icon name="chevron" className="h-5 w-5" /></Btn>
            <Btn as="a" href={A('/taquizas')} variant="secondary" size="lg">Cotizar taquiza</Btn>
          </div>

          <ul className="mt-9 grid gap-2.5 sm:grid-cols-2">
            {[
              { icon: 'clock', text: SITE.hours },
              { icon: 'pin', text: 'Batallones Rojos esq. Revolución Social · Iztapalapa' },
              { icon: 'truck', text: 'Envío a domicilio: $25 MXN extra, sujeto a confirmación' },
              { icon: 'cash', text: 'Efectivo y transferencia' },
            ].map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 rounded-2xl border border-[#E8DED2] bg-white/70 px-3.5 py-2.5 text-[13.5px] font-semibold text-[#1E1E1E]">
                <Icon name={f.icon} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#E85D04]" /> {f.text}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={reduce ? false : { clipPath: 'inset(0 0 12% 0)', opacity: 0.4 }}
          animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 0.68, 0.32, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <HeroVisual className="h-auto w-full drop-shadow-[0_24px_40px_rgba(200,29,37,0.18)]" />
          <div className="absolute bottom-0 left-2 rounded-2xl border-2 border-[#E8DED2] bg-white px-4 py-2.5 shadow-warm sm:left-6">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#5C5C5C]">Taco de maíz</p>
            <p className="tnum text-lg font-black text-[#C81D25]">desde $15</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const HOME_CARDS = [
  { name: 'Tacos de maíz', slug: 'tacos', illus: 'tacosMaiz', note: 'Desde $15' },
  { name: 'Tacos de harina', slug: 'tacos-harina', illus: 'tacosHarina', note: 'Desde $30' },
  { name: 'Tortas', slug: 'tortas', illus: 'tortas', note: 'Desde $50' },
  { name: 'Gringas', slug: 'gringas', illus: 'gringas', note: 'Desde $60' },
  { name: 'Especialidades', slug: 'especialidades', illus: 'volcanes', note: 'Volcanes, burros, costra…' },
  { name: 'Aguas frescas', slug: 'aguas-frescas', illus: 'aguasFrescas', note: '$40 el litro' },
];

function CategoriesSection() {
  return (
    <section id="categorias" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="maize">Para todos los antojos</Eyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-[2.6rem]">¿Qué se te antoja hoy?</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {HOME_CARDS.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              <a href={A(`/menu/${c.slug}`)} onClick={() => track(EVENTS.categorySelect, { category: c.slug })}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#E8DED2] bg-white transition-all hover:-translate-y-[3px] hover:border-[#C81D25] hover:shadow-lift">
                <span className="block overflow-hidden bg-[#F9F5F0]">
                  <Illustration name={c.illus} className="h-28 w-full transition-transform duration-500 group-hover:scale-[1.06] sm:h-32" />
                </span>
                <span className="flex flex-1 flex-col p-3.5">
                  <span className="text-[15px] font-extrabold leading-tight">{c.name}</span>
                  <span className="mt-1 text-xs font-semibold text-[#5C5C5C]">{c.note}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-[#E85D04]">
                    Ver <Icon name="chevron" className="h-3.5 w-3.5" />
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedMenu({ onCustomize }) {
  const featured = MENU.filter((m) => m.featured);
  return (
    <section id="menu" className="relative bg-[#F9F5F0] py-16 sm:py-20">
      <ChilePattern opacity={0.05} />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Menú destacado</Eyebrow>
              <h2 className="mt-4 text-3xl font-black sm:text-[2.6rem]">Del comal al carrito.</h2>
              <p className="mt-3 max-w-2xl text-[16.5px] text-[#5C5C5C]">
                Elige tu carne, queso cuando aplique, cebolla, cilantro y salsas. Revisa todo antes de enviarlo por WhatsApp.
              </p>
            </div>
            <Btn as="a" href={A('/menu')} variant="outline" size="md">Ver menú completo <Icon name="chevron" className="h-4 w-4" /></Btn>
          </div>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <ProductCard item={item} onCustomize={onCustomize} compact />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomizationSection() {
  const steps = [
    { n: '1', t: 'Elige', d: 'Selecciona tu platillo y la carne que se te antoje.' },
    { n: '2', t: 'Personaliza', d: 'Con o sin queso, con o sin cebolla, con o sin cilantro y tus salsas.' },
    { n: '3', t: 'Agrega', d: 'Revisa tu resumen en el carrito y ajusta cantidades.' },
    { n: '4', t: 'Envía por WhatsApp', d: 'Tu pedido llega ordenado y listo para confirmarse.' },
  ];
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="maize">Personalización</Eyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-[2.6rem]">A tu gusto, como debe ser.</h2>
          <p className="mt-3 max-w-3xl text-[16.5px] text-[#5C5C5C]">
            Decide con cebolla o sin cebolla, agrega o quita cilantro y elige guacamole, salsa mora, salsa martajada o salsa roja.
            Cada detalle aparece en tu resumen de pedido.
          </p>
        </Reveal>
        <ol className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <li className="relative h-full overflow-hidden rounded-3xl border-2 border-[#E8DED2] bg-white p-5">
                <span className="absolute -right-3 -top-4 text-[74px] font-black leading-none text-[#FFB800]/22" aria-hidden="true">{s.n}</span>
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#C81D25] text-base font-black text-white" aria-hidden="true">{s.n}</span>
                <h3 className="relative mt-4 text-lg font-extrabold">{s.t}</h3>
                <p className="relative mt-1.5 text-sm text-[#5C5C5C]">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-3xl border-2 border-dashed border-[#E8DED2] bg-[#F9F5F0] p-4">
            <span className="text-sm font-black uppercase tracking-[.12em]">Salsas disponibles:</span>
            {SALSAS.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-[#E8DED2] bg-white px-3 py-1.5 text-sm font-semibold">
                <span className="h-3 w-3 rounded-full border border-[#1E1E1E]/25" style={{ background: s.color }} aria-hidden="true" /> {s.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E8DED2] bg-white px-3 py-1.5 text-sm font-semibold">Sin salsa</span>
            <span className="ml-auto text-xs font-semibold text-[#5C5C5C]">Sin costo adicional</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DeliverySection() {
  const { openCart } = useCart();
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#1E1E1E] bg-[#1E1E1E] p-7 text-[#FFFDF9] sm:p-10">
            <TortillaPattern opacity={0.1} tint={C.maize} />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <Eyebrow tone="dark">Servicio a domicilio</Eyebrow>
                <h2 className="mt-4 text-3xl font-black sm:text-[2.5rem]">¿Se te antojó desde casa?</h2>
                <p className="mt-4 max-w-xl text-[16.5px] text-[#FFFDF9]/80">
                  Agrega tu pedido al carrito, elige servicio a domicilio y comparte tu dirección al finalizar.
                  El envío tiene un costo extra de $25 MXN. La disponibilidad, total y tiempo de entrega se confirman por WhatsApp.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Btn as="a" href={A('/menu')} variant="secondary" size="lg">Armar pedido</Btn>
                  <button type="button" onClick={openCart}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#FFFDF9]/40 px-6 py-3.5 text-[15px] font-bold text-[#FFFDF9] transition-colors hover:border-[#FFB800] hover:text-[#FFB800]">
                    <Icon name="cart" className="h-5 w-5" /> Ver mi carrito
                  </button>
                </div>
              </div>
              <ul className="grid gap-3">
                {[
                  { icon: 'truck', t: `Envío ${money(SITE.deliveryFee)} MXN extra`, d: 'Se suma sólo cuando eliges domicilio.' },
                  { icon: 'whatsapp', t: 'Confirmación por WhatsApp', d: 'Disponibilidad, total final y tiempo de entrega.' },
                  { icon: 'cash', t: 'Efectivo o transferencia', d: 'Se coordina de forma privada al confirmar.' },
                ].map((b) => (
                  <li key={b.t} className="flex items-start gap-3 rounded-3xl border border-[#FFFDF9]/15 bg-[#FFFDF9]/[.06] p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFB800] text-[#3A2A00]">
                      <Icon name={b.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-extrabold">{b.t}</span>
                      <span className="block text-sm text-[#FFFDF9]/70">{b.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TaquizaCard({ service, big = false }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.22 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#E8DED2] bg-white transition-colors hover:border-[#E85D04] focus-within:border-[#E85D04]"
    >
      <div className="relative overflow-hidden bg-[#F9F5F0]">
        <Illustration name={service.illus} className="h-40 w-full transition-transform duration-500 group-hover:scale-[1.05]" />
        <span className="absolute right-3 top-3 rounded-full bg-[#1E1E1E] px-3 py-1 text-[11px] font-black uppercase tracking-[.12em] text-[#FFB800]">Taquiza</span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className={`font-black ${big ? 'text-2xl' : 'text-xl'}`}>{service.name}</h3>
        <p className="mt-2 text-sm text-[#5C5C5C]">{service.intro}</p>
        <p className="mt-4 text-[11px] font-black uppercase tracking-[.14em] text-[#E85D04]">Incluye</p>
        <ul className={`mt-2 flex-1 gap-x-5 gap-y-1.5 text-sm text-[#1E1E1E] ${big ? 'block columns-1 sm:columns-2' : 'flex flex-col'}`}>
          {service.includes.map((inc) => (
            <li key={inc} className="flex items-start gap-2 break-inside-avoid">
              <Icon name="check" className="mt-1 h-3.5 w-3.5 shrink-0 text-[#2E7D32]" stroke={3} /> {inc}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t-2 border-dashed border-[#E8DED2] pt-4">
          <Btn as="a" variant="primary" className="w-full" size={big ? 'lg' : 'md'}
            href={waLink(taquizaMessage(service.name))} target="_blank" rel="noopener noreferrer"
            onClick={() => { track(EVENTS.taquizaService, { service: service.id }); track(EVENTS.taquizaWhatsapp, { service: service.id }); }}>
            <Icon name="whatsapp" className="h-5 w-5" /> {service.cta}
          </Btn>
          <p className="mt-2 text-center text-xs text-[#5C5C5C]">Abre WhatsApp con la solicitud de cotización lista.</p>
        </div>
      </div>
    </motion.article>
  );
}

function TaquizasSection({ headingLevel = 'h2', big = false, id = 'taquizas' }) {
  const H = headingLevel === 'h2' ? 'h2' : 'h1';
  useEffect(() => { track(EVENTS.taquizaView); }, []);
  return (
    <section id={id} className="relative overflow-hidden bg-[#F9F5F0] py-16 sm:py-20">
      <TortillaPattern opacity={0.07} tint={C.orange} />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow>Para eventos, reuniones y celebraciones</Eyebrow>
            <H className="mt-4 text-3xl font-black sm:text-[2.6rem]">Taquizas para compartir momentos grandes.</H>
            <p className="mt-3 text-[16.5px] text-[#5C5C5C]">
              Llevamos el sabor de Taquería La Tía a tu evento con opciones de servicio completo, puro taco o parrilla.
              Cuéntanos fecha, número de personas y ubicación aproximada para confirmar disponibilidad y preparar una cotización.
            </p>
          </div>
        </Reveal>

        <div className={`mt-9 grid gap-4 sm:gap-5 ${big ? 'lg:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {TAQUIZAS.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.07}>
              {big ? (
                <div id={`taquiza-${s.id}`}>
                  <TaquizaCard service={s} big />
                </div>
              ) : (
                <TaquizaCard service={s} />
              )}
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 rounded-3xl border-2 border-dashed border-[#E8DED2] bg-white/70 p-4 text-sm text-[#5C5C5C]">
            <Icon name="info" className="mr-2 inline h-4 w-4 text-[#E85D04]" />
            La disponibilidad y el costo dependen de la fecha, el número de personas y la ubicación del evento.
            Todo se confirma por WhatsApp; aquí no publicamos precios de eventos.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FamilySection() {
  useEffect(() => { track(EVENTS.familyView); }, []);
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow tone="maize">La familia opina</Eyebrow>
              <h2 className="mt-4 text-3xl font-black sm:text-[2.6rem]">Hecho para compartir en familia.</h2>
              <p className="mt-3 text-[16.5px] text-[#5C5C5C]">Mensajes compartidos por la familia de Taquería La Tía.</p>
            </div>
            <div className="hidden w-56 overflow-hidden rounded-3xl border-2 border-[#E8DED2] sm:block">
              <Illustration name="storefront" className="w-full" title="Fachada ilustrada de la taquería" />
            </div>
          </div>
        </Reveal>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {FAMILY.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <figure className="flex h-full flex-col rounded-3xl border-2 border-[#E8DED2] bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFB800] font-black text-[#3A2A00]" aria-hidden="true">
                  {m.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <blockquote className="mt-4 flex-1 text-[15.5px] leading-relaxed text-[#1E1E1E]">{m.text}</blockquote>
                <figcaption className="mt-4 text-sm font-black uppercase tracking-[.1em] text-[#E85D04]">{m.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 text-center text-xs text-[#5C5C5C]">
            Estas son opiniones de la familia de Taquería La Tía, no reseñas de plataformas ni calificaciones de clientes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function LocationSection({ full = false }) {
  return (
    <section id="ubicacion" className="relative overflow-hidden bg-[#F9F5F0] py-16 sm:py-20">
      <ChilePattern opacity={0.05} />
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className={`grid items-center gap-8 ${full ? 'lg:grid-cols-[1fr_1.1fr]' : 'lg:grid-cols-2'}`}>
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border-2 border-[#1E1E1E]">
              <Illustration name="storefront" className="w-full" title="Ilustración decorativa de la fachada de la taquería al anochecer" />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div>
              <Eyebrow>Ubicación y horario</Eyebrow>
              <h2 className="mt-4 text-3xl font-black sm:text-[2.5rem]">Encuentra el antojo en Iztapalapa.</h2>
              <p className="mt-3 text-[16.5px] text-[#5C5C5C]">
                Estamos en Batallones Rojos esquina Revolución Social, Iztapalapa, Ciudad de México.
              </p>
              <dl className="mt-7 grid gap-3">
                <div className="flex items-start gap-3 rounded-3xl border-2 border-[#E8DED2] bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C81D25]/10 text-[#C81D25]"><Icon name="pin" className="h-5 w-5" /></span>
                  <div><dt className="text-xs font-black uppercase tracking-[.14em] text-[#5C5C5C]">Dirección</dt><dd className="mt-1 font-bold">{SITE.address}</dd></div>
                </div>
                <div className="flex items-start gap-3 rounded-3xl border-2 border-[#E8DED2] bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFB800]/20 text-[#8A5200]"><Icon name="clock" className="h-5 w-5" /></span>
                  <div><dt className="text-xs font-black uppercase tracking-[.14em] text-[#5C5C5C]">Horario</dt><dd className="mt-1 font-bold">{SITE.hours}</dd></div>
                </div>
                <div className="flex items-start gap-3 rounded-3xl border-2 border-[#E8DED2] bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 text-[#2E7D32]"><Icon name="whatsapp" className="h-5 w-5" /></span>
                  <div>
                    <dt className="text-xs font-black uppercase tracking-[.14em] text-[#5C5C5C]">WhatsApp</dt>
                    <dd className="mt-1 font-bold">
                      <a className="underline decoration-[#2E7D32]/40 underline-offset-4" target="_blank" rel="noopener noreferrer"
                        href={waLink('¡Hola! Quiero pedir para recoger en la taquería. 🌮')}>{SITE.phoneDisplay}</a>
                    </dd>
                  </div>
                </div>
              </dl>
              {SITE.googleMapsUrl ? (
                <a href={SITE.googleMapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => track(EVENTS.mapsClick)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#1E1E1E] px-6 py-3 text-[15px] font-bold hover:border-[#E85D04] hover:text-[#E85D04]">
                  <Icon name="pin" className="h-5 w-5" /> Abrir en el mapa
                </a>
              ) : (
                <p className="mt-6 text-sm text-[#5C5C5C]">Escríbenos por WhatsApp si necesitas ayuda para llegar.</p>
              )}
              {!full && (
                <a href={A('/ubicacion')} className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#E85D04] hover:underline">
                  Ver detalles de ubicación <Icon name="chevron" className="h-4 w-4" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FaqAccordion({ items = FAQ, headingLevel = 'h2', id = 'faq' }) {
  const [open, setOpen] = useState(0);
  const H = headingLevel === 'h2' ? 'h2' : 'h1';
  return (
    <section id={id} className="py-16 sm:py-20">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <Eyebrow tone="maize">Dudas rápidas</Eyebrow>
            <H className="mt-4 text-3xl font-black sm:text-[2.6rem]">Preguntas frecuentes.</H>
          </div>
        </Reveal>
        <div className="mt-9 space-y-3">
          {items.map((f, i) => {
            const expanded = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.03}>
                <div className={`overflow-hidden rounded-3xl border-2 bg-white transition-colors ${expanded ? 'border-[#C81D25]' : 'border-[#E8DED2]'}`}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => { setOpen(expanded ? -1 : i); if (!expanded) track(EVENTS.faqOpen); }}
                      aria-expanded={expanded} aria-controls={`faq-panel-${i}`} id={`faq-btn-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[16.5px] font-extrabold"
                    >
                      {f.q}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1E1E1E] transition-transform ${expanded ? 'rotate-90 border-[#C81D25] bg-[#C81D25] text-white' : ''}`} aria-hidden="true">
                        <Icon name="chevron" className="h-4 w-4" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`}
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }} className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[15.5px] leading-relaxed text-[#5C5C5C]">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
        <Reveal>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-[#F9F5F0] p-6 text-center">
            <p className="font-bold">¿Te quedó una duda?</p>
            <Btn as="a" href={waLink('¡Hola, Taquería La Tía! Tengo una duda sobre el menú. 🌮')} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm">
              <Icon name="whatsapp" className="h-4 w-4" /> Preguntar por WhatsApp
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── 15. PÁGINAS ────────────────────────────────── */

function PageHeader({ eyebrow, title, text, children }) {
  return (
    <div className="relative overflow-hidden border-b border-[#E8DED2] bg-[#F9F5F0]">
      <TortillaPattern opacity={0.07} />
      <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Ruta de navegación" className="mb-4 text-xs font-semibold text-[#5C5C5C]">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><a className="hover:text-[#C81D25]" href={A('/')}>Inicio</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[#1E1E1E]">{title}</li>
          </ol>
        </nav>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-[2.1rem] font-black leading-[1.06] sm:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-[16.5px] text-[#5C5C5C]">{text}</p>}
        {children}
      </div>
    </div>
  );
}

function HomePage({ onCustomize }) {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedMenu onCustomize={onCustomize} />
      <CustomizationSection />
      <DeliverySection />
      <TaquizasSection />
      <FamilySection />
      <LocationSection />
      <FaqAccordion />
    </>
  );
}

function MenuCategoryNav({ active, onPick }) {
  const chips = [{ slug: 'todo', name: 'Todo el menú' }, ...CATEGORIES, { slug: 'especialidades', name: 'Especialidades' }];
  return (
    <div className="sticky top-[69px] z-30 border-y border-[#E8DED2] bg-[#FFFDF9]/96 backdrop-blur">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-3" role="tablist" aria-label="Categorías del menú">
          {chips.map((c) => {
            const on = active === c.slug;
            return (
              <button
                key={c.slug} type="button" role="tab" aria-selected={on} onClick={() => onPick(c.slug)}
                className={`shrink-0 whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors ${
                  on ? 'border-[#C81D25] bg-[#C81D25] text-white' : 'border-[#E8DED2] bg-white text-[#1E1E1E] hover:border-[#E85D04] hover:text-[#E85D04]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MenuGrid({ items, onCustomize, title, kicker }) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {title && (
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              {kicker && <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#E85D04]">{kicker}</p>}
              <h2 className="mt-1.5 text-2xl font-black sm:text-3xl">{title}</h2>
            </div>
            <p className="text-sm font-semibold text-[#5C5C5C]">{items.length} {items.length === 1 ? 'opción' : 'opciones'}</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i, 6) * 0.04}>
              <ProductCard item={item} onCustomize={onCustomize} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuPage({ onCustomize }) {
  const [cat, setCat] = useState('todo');
  const [q, setQ] = useState('');
  useEffect(() => { track(EVENTS.menuView); }, []);

  const onPick = (slug) => { setCat(slug); track(EVENTS.categorySelect, { category: slug }); };

  const filtered = useMemo(() => {
    let list = MENU;
    if (cat === 'especialidades') list = MENU.filter((m) => SPECIALTIES.includes(m.category));
    else if (cat !== 'todo') list = MENU.filter((m) => m.category === cat);
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(term) ||
        (m.description || '').toLowerCase().includes(term) ||
        m.variants.some((v) => v.label.toLowerCase().includes(term)));
    }
    return list;
  }, [cat, q]);

  const grouped = useMemo(() => {
    if (cat !== 'todo' || q.trim()) return null;
    return CATEGORIES.map((c) => ({ cat: c, items: MENU.filter((m) => m.category === c.slug) })).filter((g) => g.items.length);
  }, [cat, q]);

  return (
    <>
      <PageHeader
        eyebrow="Menú completo · Iztapalapa"
        title="Menú de Taquería La Tía."
        text="El antojo se arma a tu gusto: elige carne, queso cuando aplique, cebolla, cilantro y salsas. Revisa tu carrito y envíalo por WhatsApp."
      >
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <label htmlFor="menu-search" className="text-sm font-black uppercase tracking-[.1em]">Buscar</label>
          <input
            id="menu-search" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Pastor, gringa, arrachera, horchata…"
            className="w-full max-w-md min-w-[220px] flex-1 rounded-full border-2 border-[#E8DED2] bg-white py-2.5 px-4 text-sm outline-none transition-colors focus:border-[#E85D04]"
          />
          <span className="rounded-full bg-[#FFB800]/20 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#8A5200]">c/q = con queso</span>
        </div>
      </PageHeader>

      <MenuCategoryNav active={q.trim() ? 'todo' : cat} onPick={(s) => { setQ(''); onPick(s); }} />

      {grouped ? (
        grouped.map((g) => (
          <div key={g.cat.slug} id={`cat-${g.cat.slug}`} className="border-b border-[#E8DED2] last:border-0">
            <MenuGrid items={g.items} onCustomize={onCustomize} title={g.cat.name} kicker={g.cat.kicker} />
          </div>
        ))
      ) : (
        <MenuGrid items={filtered} onCustomize={onCustomize} title={q.trim() ? `Resultados para “${q.trim()}”` : null} />
      )}

      {!grouped && filtered.length === 0 && (
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-6">
          <div className="mx-auto w-56 overflow-hidden rounded-3xl"><Illustration name="tacosMaiz" className="w-full" /></div>
          <h2 className="mt-6 text-2xl font-black">No encontramos ese antojo</h2>
          <p className="mt-2 text-[#5C5C5C]">Prueba con otra palabra o revisa todas las categorías del menú.</p>
          <Btn className="mt-6" variant="primary" onClick={() => { setQ(''); setCat('todo'); }}>Ver todo el menú</Btn>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6">
        <div className="rounded-[2rem] border-2 border-[#E8DED2] bg-[#F9F5F0] p-6 sm:p-8">
          <h2 className="text-xl font-black sm:text-2xl">Antes de pedir, recuerda</h2>
          <ul className="mt-4 grid gap-3 text-[15px] text-[#1E1E1E] sm:grid-cols-2">
            {[
              'Cebolla, cilantro y salsas no tienen costo adicional.',
              'El envío a domicilio cuesta $25 MXN extra y se confirma por WhatsApp.',
              'Aceptamos efectivo y transferencia, coordinados por WhatsApp.',
              'El carrito genera una solicitud: el pedido se confirma cuando validamos disponibilidad y total.',
            ].map((t) => (
              <li key={t} className="flex gap-2.5"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-[#2E7D32]" stroke={3} /> {t}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function CategoryPage({ slug, onCustomize }) {
  const isSpecialties = slug === 'especialidades';
  const cat = CAT_BY_SLUG[slug];
  const items = useMemo(
    () => (isSpecialties ? MENU.filter((m) => SPECIALTIES.includes(m.category)) : MENU.filter((m) => m.category === slug)),
    [slug, isSpecialties],
  );

  useEffect(() => { track(EVENTS.menuView, { category: slug }); }, [slug]);

  if (!cat && !isSpecialties) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-24 text-center">
        <h1 className="text-3xl font-black">No encontramos esa categoría</h1>
        <p className="mt-3 text-[#5C5C5C]">Revisa el menú completo de Taquería La Tía.</p>
        <Btn as="a" href={A('/menu')} className="mt-6" variant="primary">Ver menú completo</Btn>
      </div>
    );
  }

  const title = isSpecialties ? 'Especialidades' : cat.name;
  const kicker = isSpecialties
    ? 'Volcanes, quesadillas, burros, costra de queso, chimichanga, nopal zapoteco y alambres'
    : cat.kicker;

  return (
    <>
      <PageHeader eyebrow={`Menú · ${title}`} title={`${title} de Taquería La Tía.`} text={kicker}>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FFB800]/20 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#8A5200]">c/q = con queso</span>
          <span className="rounded-full bg-[#C81D25]/[.08] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#97131A]">Cebolla y cilantro al gusto</span>
          <span className="rounded-full bg-[#2E7D32]/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#2E7D32]">4 salsas para elegir</span>
        </div>
      </PageHeader>

      <MenuCategoryNav active={slug} onPick={(s) => { window.location.hash = s === 'todo' ? '/menu' : `/menu/${s}`; }} />

      <MenuGrid items={items} onCustomize={onCustomize} />

      <section className="border-t border-[#E8DED2] bg-[#F9F5F0] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="text-2xl font-black sm:text-3xl">También se te puede antojar</h2>
          <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.filter((c) => c.slug !== slug).slice(0, 8).map((c) => (
              <a key={c.slug} href={A(`/menu/${c.slug}`)}
                className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-3xl border-2 border-[#E8DED2] bg-white transition-colors hover:border-[#E85D04]">
                <Illustration name={c.illus} className="h-24 w-full" />
                <span className="p-3 text-sm font-extrabold">{c.name}</span>
              </a>
            ))}
          </div>
          <Btn as="a" href={A('/menu')} variant="outline" className="mt-6">Ver menú completo</Btn>
        </div>
      </section>
    </>
  );
}

function TaquizasPage() {
  const goToService = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(`taquiza-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
      <PageHeader
        eyebrow="Para eventos, reuniones y celebraciones"
        title="Taquizas para eventos en Iztapalapa."
        text="Llevamos el sabor de Taquería La Tía a tu evento con opciones de servicio completo, puro taco o parrilla. Cuéntanos fecha, número de personas y ubicación aproximada para confirmar disponibilidad y preparar una cotización."
      >
        <div className="mt-7 flex flex-wrap gap-2">
          {TAQUIZAS.map((s) => (
            <a key={s.id} href={`#/taquizas`} onClick={(e) => goToService(e, s.id)}
              className="rounded-full border-2 border-[#E8DED2] bg-white px-4 py-2 text-sm font-bold hover:border-[#E85D04] hover:text-[#E85D04]">
              {s.name}
            </a>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border-2 border-[#E8DED2] bg-white">
              <Illustration name="taquizas" className="h-64 w-full sm:h-80" title="Ilustración decorativa de una taquiza con trompo al pastor" />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="flex h-full flex-col justify-center gap-4 rounded-[2rem] border-2 border-[#E8DED2] bg-[#F9F5F0] p-6 sm:p-8">
              <h2 className="text-2xl font-black">¿Cómo cotizamos tu taquiza?</h2>
              <ol className="space-y-3 text-[15.5px] text-[#1E1E1E]">
                {[
                  'Elige el servicio que más se parezca a tu evento.',
                  'Toca el botón de cotización: abrimos WhatsApp con la solicitud lista.',
                  'Comparte fecha, horario aproximado, número de personas y ubicación aproximada.',
                  'Te confirmamos disponibilidad, costo y condiciones. Nada se confirma automáticamente en el sitio.',
                ].map((t, i) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C81D25] text-sm font-black text-white" aria-hidden="true">{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
              <p className="rounded-2xl bg-[#FFB800]/15 p-3 text-sm font-medium text-[#6B4A00]">
                No publicamos precios de eventos: cada taquiza depende de la fecha, las personas y la ubicación.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <TaquizasSection headingLevel="h2" big id="servicios" />

      <section className="relative overflow-hidden bg-[#1E1E1E] py-16 text-[#FFFDF9] sm:py-20">
        <TortillaPattern opacity={0.09} tint={C.maize} />
        <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6">
          <Eyebrow tone="dark">Sin formularios ni popups</Eyebrow>
          <h2 className="mt-4 text-3xl font-black sm:text-[2.5rem]">Solicita tu cotización por WhatsApp.</h2>
          <p className="mt-4 text-[16.5px] text-[#FFFDF9]/80">
            Escríbenos con la fecha del evento, número aproximado de personas y ubicación aproximada.
            Taquizas para compartir momentos grandes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn as="a" href={waLink(taquizaMessage('Taquiza para evento'))} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg"
              onClick={() => track(EVENTS.taquizaWhatsapp, { service: 'general' })}>
              <Icon name="whatsapp" className="h-5 w-5" /> Escribir por WhatsApp
            </Btn>
            <Btn as="a" href={A('/menu')} variant="outline" size="lg" className="!border-[#FFFDF9]/40 !text-[#FFFDF9] hover:!border-[#FFB800] hover:!text-[#FFB800]">
              Ver menú de la taquería
            </Btn>
          </div>
        </div>
      </section>
    </>
  );
}

function UbicacionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Iztapalapa · Ciudad de México"
        title="Ubicación y horario de Taquería La Tía."
        text="Estamos en la esquina de Batallones Rojos y Revolución Social, en Iztapalapa. Abrimos todos los días por la tarde-noche."
      />
      <LocationSection full />
      <section className="py-16">
        <div className="mx-auto grid max-w-[1200px] gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {[
            { icon: 'clock', t: 'Horario', d: SITE.hours, x: 'Preparamos todo desde temprano; el servicio es de tarde-noche.' },
            { icon: 'truck', t: 'A domicilio', d: `${money(SITE.deliveryFee)} MXN extra`, x: 'Sujeto a confirmación de domicilio y disponibilidad por WhatsApp.' },
            { icon: 'whatsapp', t: 'Pedidos', d: SITE.phoneDisplay, x: 'Arma tu carrito y envíalo; te confirmamos por WhatsApp.' },
          ].map((b) => (
            <Reveal key={b.t}>
              <div className="h-full rounded-3xl border-2 border-[#E8DED2] bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C81D25]/10 text-[#C81D25]"><Icon name={b.icon} className="h-5 w-5" /></span>
                <h2 className="mt-4 text-lg font-black">{b.t}</h2>
                <p className="tnum mt-1 font-bold text-[#C81D25]">{b.d}</p>
                <p className="mt-2 text-sm text-[#5C5C5C]">{b.x}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <TaquizasSection headingLevel="h2" id="taquizas-ubicacion" />
    </>
  );
}

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Te ayudamos rápido"
        title="Preguntas frecuentes."
        text="Todo lo que necesitas saber para armar tu pedido sin errores: horario, salsas, queso, envíos, pagos y taquizas."
      />
      <FaqAccordion headingLevel="h2" id="faq-completa" />
      <section className="pb-16">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="rounded-[2rem] border-2 border-[#E8DED2] bg-[#F9F5F0] p-6 text-center sm:p-8">
            <h2 className="text-2xl font-black">¿Listo para el antojo?</h2>
            <p className="mt-2 text-[#5C5C5C]">Arma tu pedido en el menú o cotiza una taquiza para tu evento.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn as="a" href={A('/menu')} variant="primary" size="lg">Ver menú y pedir</Btn>
              <Btn as="a" href={A('/taquizas')} variant="secondary" size="lg">Cotizar taquiza</Btn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PrivacidadPage() {
  return (
    <>
      <PageHeader eyebrow="Transparencia" title="Aviso de privacidad." text="Qué hacemos (y qué no hacemos) con la información que compartes." />
      <section className="py-12">
        <div className="mx-auto max-w-[820px] space-y-6 px-4 text-[16px] leading-relaxed text-[#1E1E1E] sm:px-6">
          <p>
            Taquería La Tía utiliza los datos que compartes voluntariamente al enviar un pedido o cotización por WhatsApp,
            como nombre, número, dirección y referencias, únicamente para atender, confirmar y entregar tu pedido o
            cotización de evento. No solicitamos datos bancarios, contraseñas, identificaciones ni información sensible
            desde la página. Los datos no se utilizan para fines distintos sin autorización.
          </p>
          <h2 className="text-xl font-black">Lo que nunca pedimos</h2>
          <ul className="space-y-2 text-[#5C5C5C]">
            {['Tarjetas o datos bancarios.', 'Contraseñas.', 'Identificaciones o documentos oficiales.', 'Información sensible de cualquier tipo.'].map((t) => (
              <li key={t} className="flex gap-2.5"><Icon name="close" className="mt-1 h-4 w-4 shrink-0 text-[#C81D25]" /> {t}</li>
            ))}
          </ul>
          <h2 className="text-xl font-black">Cookies y analítica</h2>
          <p className="text-[#5C5C5C]">
            Usamos cookies estrictamente necesarias para recordar tu carrito y tu preferencia de cookies en este dispositivo.
            La analítica sólo se activa si la aceptas de forma explícita y puedes cambiar tu decisión cuando quieras desde el
            pie de página. Nunca enviamos a analítica tu nombre, teléfono, dirección, referencias, notas ni el contenido de tu pedido.
          </p>
          <h2 className="text-xl font-black">Almacenamiento local</h2>
          <p className="text-[#5C5C5C]">
            Tu carrito se guarda de forma local en tu navegador para que no pierdas lo que elegiste. No guardamos nombre,
            dirección, referencias ni comentarios: esos datos sólo viven en el mensaje que tú decides enviar por WhatsApp.
          </p>
          <h2 className="text-xl font-black">Contacto</h2>
          <p className="text-[#5C5C5C]">Para cualquier duda sobre este aviso, escríbenos por WhatsApp al {SITE.phoneDisplay}.</p>
          <Btn as="a" href={waLink('¡Hola! Tengo una duda sobre el aviso de privacidad.')} target="_blank" rel="noopener noreferrer" variant="whatsapp">
            <Icon name="whatsapp" className="h-5 w-5" /> Escribir por WhatsApp
          </Btn>
        </div>
      </section>
    </>
  );
}

function TerminosPage() {
  const terms = [
    { t: 'El carrito genera una solicitud', d: 'El pedido queda confirmado por WhatsApp cuando Taquería La Tía valida disponibilidad, total y modalidad de entrega.' },
    { t: 'Precios y disponibilidad', d: 'Los precios publicados se validan antes de confirmar tu pedido. La disponibilidad puede cambiar según el día y la hora.' },
    { t: 'Servicio a domicilio', d: `Tiene un costo adicional de ${money(SITE.deliveryFee)} MXN y depende de la confirmación del domicilio y de la disponibilidad. No publicamos zonas de cobertura.` },
    { t: 'Revisa tus personalizaciones', d: 'Carne, queso, cebolla, cilantro, salsas y notas se preparan tal como las elegiste. Revísalas antes de enviar el mensaje.' },
    { t: 'Métodos de pago', d: 'Aceptamos efectivo y transferencia. La forma de pago se coordina de forma privada por WhatsApp; nunca pedimos datos bancarios en el sitio.' },
    { t: 'Taquizas para eventos', d: 'Dependen de fecha, número de personas, ubicación, disponibilidad y de una cotización confirmada por WhatsApp.' },
  ];
  return (
    <>
      <PageHeader eyebrow="Reglas claras" title="Términos de pedido." text="Cómo funciona pedir en Taquería La Tía, sin letras chiquitas." />
      <section className="py-12">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <ol className="space-y-4">
            {terms.map((x, i) => (
              <Reveal key={x.t} delay={i * 0.04}>
                <li className="flex gap-4 rounded-3xl border-2 border-[#E8DED2] bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFB800] font-black text-[#3A2A00]" aria-hidden="true">{i + 1}</span>
                  <span>
                    <h2 className="text-lg font-black">{x.t}</h2>
                    <p className="mt-1 text-[15.5px] text-[#5C5C5C]">{x.d}</p>
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-8 rounded-3xl bg-[#F9F5F0] p-6 text-center">
            <h2 className="text-xl font-black">Tu pedido se confirma por WhatsApp.</h2>
            <p className="mt-2 text-[#5C5C5C]">El total que ves en el carrito es estimado. Aquí no se cobra ni se confirma nada.</p>
            <Btn as="a" href={A('/menu')} variant="primary" className="mt-5">Ir al menú</Btn>
          </div>
        </div>
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-24 text-center sm:px-6">
      <div className="mx-auto w-64 overflow-hidden rounded-[2rem] border-2 border-[#E8DED2]"><Illustration name="tacosMaiz" className="w-full" /></div>
      <h1 className="mt-8 text-4xl font-black">Se nos enfrió el antojo</h1>
      <p className="mt-3 text-[#5C5C5C]">La página que buscas no existe o cambió de lugar.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Btn as="a" href={A('/')} variant="primary" size="lg">Ir al inicio</Btn>
        <Btn as="a" href={A('/menu')} variant="outline" size="lg">Ver menú</Btn>
      </div>
    </div>
  );
}

/* ───────────────────────── 16. COOKIES ────────────────────────────────── */

function CookieConsent({ openSignal }) {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => { if (!readConsent()) setVisible(true); }, []);
  useEffect(() => { if (openSignal) { setVisible(true); setShowPrefs(true); } }, [openSignal]);

  const decide = (analytics) => {
    writeConsent(analytics);
    track(analytics ? EVENTS.cookieAccept : EVENTS.cookieReject);
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="mx-auto max-w-[1100px] rounded-3xl border-2 border-[#1E1E1E] bg-[#FFFDF9] p-4 shadow-2xl sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-base font-black">Cookies y analítica</h2>
            <p className="mt-1 text-sm text-[#5C5C5C]">
              Usamos cookies esenciales para tu carrito y preferencias. La analítica es opcional y nunca recibe tu nombre,
              dirección, teléfono ni el contenido de tu pedido.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" variant="primary" onClick={() => decide(true)}>Aceptar analítica</Btn>
            <Btn size="sm" variant="outline" onClick={() => decide(false)}>Sólo esenciales</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowPrefs((v) => !v)} aria-expanded={showPrefs}>Configurar</Btn>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {showPrefs && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24 }} className="overflow-hidden">
              <ul className="mt-4 space-y-2 border-t border-[#E8DED2] pt-4 text-sm">
                <li className="flex items-start justify-between gap-4">
                  <span><strong className="font-bold">Esenciales</strong> <span className="text-[#5C5C5C]">· carrito, modalidad de entrega y preferencia de cookies.</span></span>
                  <span className="shrink-0 rounded-full bg-[#2E7D32]/10 px-3 py-1 text-xs font-black text-[#2E7D32]">Siempre activas</span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <span><strong className="font-bold">Analítica agregada</strong> <span className="text-[#5C5C5C]">· sólo eventos agregados de navegación, sin datos personales ni de pedido.</span></span>
                  <span className="shrink-0 rounded-full bg-[#FFB800]/25 px-3 py-1 text-xs font-black text-[#8A5200]">Opcional</span>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── 17. SEO / JSON-LD ──────────────────────────── */

const SEO = {
  '/': {
    title: 'Taquería La Tía | Tacos, Especialidades y Taquizas en Iztapalapa',
    description: 'Pide tacos, gringas, tortas, volcanes y especialidades de Taquería La Tía en Iztapalapa. Personaliza tu pedido, arma tu carrito y envíalo por WhatsApp. Servicio a domicilio con costo extra de $25 MXN.',
  },
  '/menu': {
    title: 'Menú de Taquería La Tía | Tacos y Especialidades en Iztapalapa',
    description: 'Consulta el menú de Taquería La Tía: tacos, gringas, tortas, burritas, volcanes, aguas frescas y más. Personaliza tu pedido y envíalo por WhatsApp.',
  },
  '/taquizas': {
    title: 'Taquizas para Eventos en Iztapalapa | Taquería La Tía',
    description: 'Cotiza taquizas en Iztapalapa para reuniones y celebraciones. Servicio completo, puro taco o parrilla; consulta disponibilidad por WhatsApp.',
  },
  '/ubicacion': {
    title: 'Ubicación y Horario | Taquería La Tía en Iztapalapa',
    description: 'Encuentra Taquería La Tía en Batallones Rojos esquina Revolución Social, Iztapalapa. Consulta horario y realiza tu pedido por WhatsApp.',
  },
  '/preguntas-frecuentes': {
    title: 'Preguntas Frecuentes | Taquería La Tía Iztapalapa',
    description: 'Horario, envíos a domicilio, salsas, métodos de pago, pedidos por WhatsApp y taquizas para eventos en Taquería La Tía.',
  },
  '/privacidad': { title: 'Aviso de Privacidad | Taquería La Tía', description: 'Aviso de privacidad de Taquería La Tía: uso de datos, cookies y analítica responsable.' },
  '/terminos': { title: 'Términos de Pedido | Taquería La Tía', description: 'Términos de pedido de Taquería La Tía: carrito como solicitud, confirmación por WhatsApp, envío y métodos de pago.' },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildMenuSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Menú de Taquería La Tía',
    url: `${SITE.domain}/menu`,
    inLanguage: 'es-MX',
    hasMenuSection: CATEGORIES.map((c) => ({
      '@type': 'MenuSection',
      name: c.name,
      description: c.kicker,
      hasMenuItem: MENU.filter((m) => m.category === c.slug).map((m) => ({
        '@type': 'MenuItem',
        name: m.name,
        description: m.description || m.name,
        offers: m.variants.flatMap((v) => {
          const arr = [{ '@type': 'Offer', name: `${m.name} — ${v.label}`, price: v.price, priceCurrency: 'MXN', availability: 'https://schema.org/InStock' }];
          if (typeof v.priceWithCheese === 'number') {
            arr.push({ '@type': 'Offer', name: `${m.name} — ${v.label} con queso (c/q)`, price: v.priceWithCheese, priceCurrency: 'MXN', availability: 'https://schema.org/InStock' });
          }
          return arr;
        }),
      })),
    })),
  };
}

function buildRestaurantSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'LocalBusiness'],
    name: SITE.name,
    description: SEO['/'].description,
    url: SITE.domain,
    image: ASSETS.logo,
    logo: ASSETS.logo,
    telephone: SITE.phoneDisplay,
    priceRange: '$$',
    servesCuisine: ['Tacos', 'Comida mexicana', 'Taquizas'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Batallones Rojos esquina Revolución Social',
      addressLocality: 'Iztapalapa',
      addressRegion: 'Ciudad de México',
      addressCountry: 'MX',
    },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS, opens: '17:00', closes: '00:00' }],
    acceptsReservations: 'False',
    paymentAccepted: 'Efectivo, Transferencia',
    currenciesAccepted: 'MXN',
    hasMenu: { '@id': `${SITE.domain}/menu` },
  };
}

function JsonLd({ data, id }) {
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.textContent = JSON.stringify(data);
    document.head.appendChild(el);
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  }, [data, id]);
  return null;
}

function SeoManager({ route }) {
  const catSlug = route.startsWith('/menu/') ? route.replace('/menu/', '') : null;
  const cat = catSlug ? CAT_BY_SLUG[catSlug] : null;
  const isSpecialties = catSlug === 'especialidades';

  const meta = useMemo(() => {
    if (cat) {
      return {
        title: `${cat.name} | Menú de Taquería La Tía en Iztapalapa`,
        description: `${cat.name} de Taquería La Tía: ${cat.kicker}. Personaliza carne, queso, cebolla, cilantro y salsas, y envía tu pedido por WhatsApp.`,
      };
    }
    if (isSpecialties) {
      return {
        title: 'Especialidades | Menú de Taquería La Tía en Iztapalapa',
        description: 'Volcanes, quesadillas, burros, costra de queso, chimichanga, nopal zapoteco y alambres en Iztapalapa. Personaliza tu pedido y envíalo por WhatsApp.',
      };
    }
    return SEO[route] || SEO['/'];
  }, [route, cat, isSpecialties]);

  useEffect(() => {
    document.documentElement.lang = 'es-MX';
    document.title = meta.title;
    const canonical = `${SITE.domain}${route === '/' ? '/' : route}`;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'theme-color', '#C81D25');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE.name);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:locale', 'es_MX');
    upsertMeta('property', 'og:image', ASSETS.logo);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', ASSETS.logo);
    upsertLink('canonical', canonical);
    upsertLink('icon', ASSETS.logo, { type: 'image/webp' });
  }, [meta, route]);

  const crumbs = useMemo(() => {
    const parts = route.split('/').filter(Boolean);
    const items = [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE.domain}/` }];
    let path = '';
    parts.forEach((p, i) => {
      path += `/${p}`;
      let label = p;
      if (p === 'menu') label = 'Menú';
      else if (CAT_BY_SLUG[p]) label = CAT_BY_SLUG[p].name;
      else if (p === 'especialidades') label = 'Especialidades';
      else if (SEO[path]) label = SEO[path].title.split('|')[0].trim();
      items.push({ '@type': 'ListItem', position: i + 2, name: label, item: `${SITE.domain}${path}` });
    });
    return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
  }, [route]);

  const showFaq = route === '/' || route === '/preguntas-frecuentes';
  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }), []);
  const menuSchema = useMemo(() => buildMenuSchema(), []);
  const restaurantSchema = useMemo(() => buildRestaurantSchema(), []);

  return (
    <>
      <JsonLd id="ld-website" data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.domain, inLanguage: 'es-MX' }} />
      <JsonLd id="ld-webpage" data={{
        '@context': 'https://schema.org', '@type': 'WebPage', name: meta.title, description: meta.description,
        url: `${SITE.domain}${route === '/' ? '/' : route}`, inLanguage: 'es-MX',
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.domain },
      }} />
      <JsonLd id="ld-restaurant" data={restaurantSchema} />
      <JsonLd id="ld-menu" data={menuSchema} />
      <JsonLd id="ld-breadcrumb" data={crumbs} />
      {showFaq && <JsonLd id="ld-faq" data={faqSchema} />}
    </>
  );
}

/* ───────────────────────── 18. APP ────────────────────────────────────── */

function Site() {
  const { route } = useContext(RouterCtx);
  const { addItem } = useCart();
  const [customizing, setCustomizing] = useState(null);
  const [prefsSignal, setPrefsSignal] = useState(0);

  const openCustomizer = useCallback((item, rect) => setCustomizing({ item, rect }), []);

  const parts = route.split('/').filter(Boolean);
  let page;
  if (parts.length === 0) page = <HomePage onCustomize={openCustomizer} />;
  else if (parts[0] === 'menu' && parts.length === 1) page = <MenuPage onCustomize={openCustomizer} />;
  else if (parts[0] === 'menu' && parts.length === 2) page = <CategoryPage slug={parts[1]} onCustomize={openCustomizer} />;
  else if (parts[0] === 'taquizas') page = <TaquizasPage />;
  else if (parts[0] === 'ubicacion') page = <UbicacionPage />;
  else if (parts[0] === 'preguntas-frecuentes') page = <FaqPage />;
  else if (parts[0] === 'privacidad') page = <PrivacidadPage />;
  else if (parts[0] === 'terminos') page = <TerminosPage />;
  else page = <NotFoundPage />;

  return (
    <div className="tex-grain flex min-h-screen flex-col">
      <a className="skip-link" href="#main">Saltar al contenido principal</a>
      <Header />
      <main id="main" className="flex-1">{page}</main>
      <Footer onOpenPreferences={() => setPrefsSignal((n) => n + 1)} />

      <CartDrawer />
      <Toasts />
      <CookieConsent openSignal={prefsSignal} />

      <AnimatePresence>
        {customizing && (
          <ProductCustomizer
            item={customizing.item}
            onClose={() => setCustomizing(null)}
            onAdd={(line, rect) => {
              const from = rect || customizing.rect;
              if (from) flyBus.emit(from);
              addItem(line);
              setCustomizing(null);
            }}
          />
        )}
      </AnimatePresence>

      <a
        href={waLink('¡Hola, Taquería La Tía! Quiero hacer un pedido. 🌮')}
        target="_blank" rel="noopener noreferrer"
        onClick={() => track(EVENTS.whatsappOrder, { source: 'floating' })}
        className="fixed bottom-5 left-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-2xl transition-transform hover:scale-105"
        aria-label="Escribir a Taquería La Tía por WhatsApp"
      >
        <Icon name="whatsapp" className="h-7 w-7" />
      </a>
    </div>
  );
}

export default function App() {
  const { route, navigate } = useRouteState();
  return (
    <RouterCtx.Provider value={{ route, navigate }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <CartProvider>
        <SeoManager route={route} />
        <Site />
      </CartProvider>
    </RouterCtx.Provider>
  );
}