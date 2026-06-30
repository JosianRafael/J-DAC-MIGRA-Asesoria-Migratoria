// supabase-config.js

// ============================================================
// ===== CONFIGURACIÓN DE SUPABASE =====
// ============================================================

const supabaseUrl = 'https://vnkzwqocoihzndrtkgtl.supabase.co';
const supabaseKey = 'sb_publishable__Dkw6e-XMWd96Ya9ykF1fg_rD-uXNjz';
const SUPABASE = supabase.createClient(supabaseUrl, supabaseKey);

// ============================================================
// ===== CONFIGURACIÓN INICIAL =====
// ============================================================
const defaultConfig = {
  siteName: 'J⌃DAC MIGRA',
  pageTitle: 'J⌃DAC MIGRA · Asesoría migratoria',
  whatsapp: ' ',
  instagram: ' ',
  email: ' ',
  address: ' ',
  schedule: 'Lun-Vie 8am - 6pm',
  mapLatitude: ' ',
  mapLongitude: ' '
};

// Variables de paginación
const ITEMS_PER_PAGE = 8;
let courseCurrentPage = 1;
let eventCurrentPage = 1;
let testimonialCurrentPage = 1;