// ============================================================
// ===== FUNCIONES DE CONFIGURACIÓN =====
// ============================================================

async function loadConfig() {
  try {
    // Usar maybeSingle() en lugar de single() para evitar el error
    const { data, error } = await SUPABASE
      .from('settings')
      .select('*')
      .limit(1) // Tomar solo el primer registro
      .maybeSingle(); // Permite 0 o 1 resultado sin error

    if (error) {
      console.warn('Error cargando configuración, usando defaults:', error);
      return defaultConfig;
    }

    // Si no hay datos, crear el registro inicial
    if (!data) {
      const { data: newData, error: insertError } = await SUPABASE
        .from('settings')
        .insert({
          site_name: defaultConfig.siteName,
          site_title: defaultConfig.pageTitle,
          whatsapp: defaultConfig.whatsapp,
          instagram: defaultConfig.instagram,
          email: defaultConfig.email,
          address: defaultConfig.address,
          schedule: defaultConfig.schedule,
          map_latitude: defaultConfig.mapLatitude,
          map_longitude: defaultConfig.mapLongitude
        })
        .select()
        .maybeSingle(); // Usar maybeSingle también aquí

      if (insertError) {
        console.error('Error creando configuración:', insertError);
        return defaultConfig;
      }
      return mapConfigFromDB(newData);
    }

    return mapConfigFromDB(data);
  } catch (err) {
    console.error('Error en loadConfig:', err);
    return defaultConfig;
  }
}

function mapConfigFromDB(data) {
  return {
    siteName: data?.site_name || defaultConfig.siteName,
    pageTitle: data?.site_title || defaultConfig.pageTitle,
    whatsapp: data?.whatsapp || defaultConfig.whatsapp,
    instagram: data?.instagram || defaultConfig.instagram,
    email: data?.email || defaultConfig.email,
    address: data?.address || defaultConfig.address,
    schedule: data?.schedule || defaultConfig.schedule,
    mapLatitude: data?.map_latitude || defaultConfig.mapLatitude,
    mapLongitude: data?.map_longitude || defaultConfig.mapLongitude
  };
}

async function saveConfigToSupabase(config) {
  try {
    // Primero obtener el ID del registro existente
    const { data: existing, error: fetchError } = await SUPABASE
      .from('settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error verificando configuración existente:', fetchError);
      return false;
    }

    const configData = {
      site_name: config.siteName,
      site_title: config.pageTitle,
      whatsapp: config.whatsapp,
      instagram: config.instagram || '',
      email: config.email || '',
      address: config.address || '',
      schedule: config.schedule || '',
      map_latitude: config.mapLatitude || '',
      map_longitude: config.mapLongitude || '',
      updated_at: new Date().toISOString()
    };

    let error;
    if (existing && existing.id) {
      // Actualizar el registro existente
      const { error: updateError } = await SUPABASE
        .from('settings')
        .update(configData)
        .eq('id', existing.id);
      error = updateError;
    } else {
      // Insertar nuevo registro
      const { error: insertError } = await SUPABASE
        .from('settings')
        .insert(configData);
      error = insertError;
    }

    if (error) {
      console.error('Error guardando configuración:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en saveConfigToSupabase:', err);
    return false;
  }
}

function applyConfig(config) {
  document.title = config.pageTitle;
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = config.pageTitle;
  
  const navLogo = document.getElementById('navLogo');
  if (navLogo) navLogo.innerHTML = config.siteName.replace('JADAC MIGRA', 'JADAC <span style="color: #c9a96e;>MIGRA</span>');
  
  const heroBrand = document.getElementById('heroBrand');
  if (heroBrand) heroBrand.textContent = config.siteName;
  
  const aboutName = document.getElementById('aboutName');
  if (aboutName) aboutName.textContent = config.siteName;
  
  const footerName = document.getElementById('footerName');
  if (footerName) footerName.textContent = config.siteName;
  
  const footerCopyName = document.getElementById('footerCopyName');
  if (footerCopyName) footerCopyName.textContent = config.siteName;
  
  const contactWhatsapp = document.getElementById('contactWhatsapp');
  if (contactWhatsapp) contactWhatsapp.textContent = config.whatsapp;
  
  const contactEmail = document.getElementById('contactEmail');
  if (contactEmail) contactEmail.textContent = config.email || defaultConfig.email;
  
  const contactAddress = document.getElementById('contactAddress');
  if (contactAddress) contactAddress.textContent = config.address || defaultConfig.address;
  
  const contactSchedule = document.getElementById('contactSchedule');
  if (contactSchedule) contactSchedule.textContent = config.schedule || defaultConfig.schedule;
  
  const whatsappFloat = document.getElementById('whatsappFloat');
  if (whatsappFloat) {
    const cleanNumber = config.whatsapp.replace(/[^0-9]/g, '');
    whatsappFloat.href = `https://wa.me/${cleanNumber}`;
  }

  const instaLink = document.getElementById('footerInstagram');
  if (instaLink && config.instagram) {
    instaLink.parentElement.innerHTML = `<a href="${config.instagram}" target="_blank"><i class="fab fa-instagram" style="margin-right:12px;"></i></a></i>`;
  }

  updateMap(config.mapLatitude, config.mapLongitude);

  // Llenar el formulario de configuración
  const siteNameInput = document.getElementById('siteName');
  if (siteNameInput) siteNameInput.value = config.siteName;
  
  const pageTitleInput = document.getElementById('pageTitleInput');
  if (pageTitleInput) pageTitleInput.value = config.pageTitle;
  
  const whatsappNumber = document.getElementById('whatsappNumber');
  if (whatsappNumber) whatsappNumber.value = config.whatsapp;
  
  const instagramUrl = document.getElementById('instagramUrl');
  if (instagramUrl) instagramUrl.value = config.instagram || '';
  
  const companyEmail = document.getElementById('companyEmail');
  if (companyEmail) companyEmail.value = config.email || '';
  
  const companyAddress = document.getElementById('companyAddress');
  if (companyAddress) companyAddress.value = config.address || '';
  
  const companySchedule = document.getElementById('companySchedule');
  if (companySchedule) companySchedule.value = config.schedule || '';
  
  const mapLatitude = document.getElementById('mapLatitude');
  if (mapLatitude) mapLatitude.value = config.mapLatitude || '';
  
  const mapLongitude = document.getElementById('mapLongitude');
  if (mapLongitude) mapLongitude.value = config.mapLongitude || '';
}

function updateMap(lat, lng) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01}%2C${parseFloat(lat)-0.01}%2C${parseFloat(lng)+0.01}%2C${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    container.innerHTML = '';
    container.appendChild(iframe);
  } else {
    container.innerHTML = '';
    const newPlaceholder = document.createElement('div');
    newPlaceholder.className = 'map-placeholder';
    newPlaceholder.innerHTML = '<i class="fas fa-map-marked-alt"></i><span>Mapa interactivo</span>';
    container.appendChild(newPlaceholder);
  }
}

async function saveConfig(e) {
  e.preventDefault();
  const config = {
    siteName: document.getElementById('siteName').value || defaultConfig.siteName,
    pageTitle: document.getElementById('pageTitleInput').value || defaultConfig.pageTitle,
    whatsapp: document.getElementById('whatsappNumber').value || defaultConfig.whatsapp,
    instagram: document.getElementById('instagramUrl').value || '',
    email: document.getElementById('companyEmail').value || defaultConfig.email,
    address: document.getElementById('companyAddress').value || defaultConfig.address,
    schedule: document.getElementById('companySchedule').value || defaultConfig.schedule,
    mapLatitude: document.getElementById('mapLatitude').value || '',
    mapLongitude: document.getElementById('mapLongitude').value || ''
  };

  const success = await saveConfigToSupabase(config);
  if (success) {
    applyConfig(config);
    document.getElementById('configModal').classList.remove('active');
    Swal.fire({
      icon: 'success',
      title: '¡Configuración guardada!',
      text: 'Los cambios se han aplicado correctamente.',
      timer: 2000,
      showConfirmButton: false
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar la configuración.',
      confirmButtonColor: '#c9a96e'
    });
  }
}