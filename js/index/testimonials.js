// testimonials.js

// ============================================================
// ===== FUNCIONES DE TESTIMONIOS =====
// ============================================================

function getAvatarUrl(name) {
  if (!name) name = "Usuario";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2) // Solo las dos primeras palabras
    .map(word => word.charAt(0).toUpperCase())
    .join("");

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=C9A96E&color=ffffff&rounded=true&bold=true&size=128`;
}

async function getTestimonials() {
  try {
    const { data, error } = await SUPABASE
      .from('testimonios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo testimonios:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error en getTestimonials:', err);
    return [];
  }
}

async function saveTestimonialToSupabase(testimonial) {
  try {
   const testimonialData = {
  name: testimonial.name,
  message: testimonial.message,
  date: testimonial.date || 'Cliente satisfecho',
  image: testimonial.image || ''
};

    let result;
    if (testimonial._id) {
      result = await SUPABASE
        .from('testimonios')
        .update(testimonialData)
        .eq('id', testimonial._id);
    } else {
      result = await SUPABASE
        .from('testimonios')
        .insert(testimonialData);
    }

    if (result.error) {
      console.error('Error guardando testimonio:', result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en saveTestimonialToSupabase:', err);
    return false;
  }
}

async function deleteTestimonialFromSupabase(id) {
  try {
    const { error } = await SUPABASE
      .from('testimonios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando testimonio:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en deleteTestimonialFromSupabase:', err);
    return false;
  }
}

async function renderTestimonials() {
  const feed = document.getElementById('testimonialFeed');
  const testimonials = await getTestimonials();

  if (testimonials.length === 0) {
    feed.innerHTML = '<p style="text-align:center; color:#6a7f94; padding:20px 0;">No hay reseñas aún.</p>';
    document.getElementById('testimonialPagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const start = (testimonialCurrentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageTestimonials = testimonials.slice(start, end);

  feed.innerHTML = pageTestimonials.map(t => `
    <div class="testimonial-post">
      <div class="post-header">
        <img class="post-avatar" src="${getAvatarUrl(t.name)}" alt="${t.name}">
        <div>
          <div class="post-name">${t.name}</div>
          <div class="post-date">${t.date || 'Cliente satisfecho'}</div>
        </div>
      </div>
      <div class="post-content">“${t.message}”</div>
      <div class="post-media">
        ${t.image ? `<img src="${t.image}" alt="Imagen de ${t.name}" />` : ''}
      </div>
    </div>
  `).join('');

  renderPagination('testimonialPagination', totalPages, testimonialCurrentPage, (page) => {
    testimonialCurrentPage = page;
    renderTestimonials();
  });
}

async function saveTestimonial(e) {
  e.preventDefault();
  const id = document.getElementById('editTestimonialId').value;
  const testimonial = {
    _id: id || null,
    name: document.getElementById('testimonialName').value,
    message: document.getElementById('testimonialMessage').value,
    date: document.getElementById('testimonialDate').value || 'Cliente satisfecho',
    image: document.getElementById('testimonialImage').value || ''
  };

  const success = await saveTestimonialToSupabase(testimonial);
  if (success) {
    document.getElementById('testimonialForm').reset();
    document.getElementById('editTestimonialId').value = '';
    document.getElementById('testimonialImagePreview').style.display = 'none';
    document.getElementById('testimonialImageFileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('testimonialImage').value = '';
    await renderTestimonialList();
    await renderTestimonials();
    Swal.fire({
      icon: 'success',
      title: '¡Reseña guardada!',
      timer: 1500,
      showConfirmButton: false
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar la reseña.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function editTestimonial(id) {
  const testimonials = await getTestimonials();
  const t = testimonials.find(t => t.id === id);
  if (!t) return;
  document.getElementById('editTestimonialId').value = id;
  document.getElementById('testimonialName').value = t.name;
  document.getElementById('testimonialMessage').value = t.message;
  document.getElementById('testimonialDate').value = t.date || '';
  if (t.image) {
    document.getElementById('testimonialImagePreview').src = t.image;
    document.getElementById('testimonialImagePreview').style.display = 'block';
    document.getElementById('testimonialImageFileName').textContent = 'Imagen cargada';
    document.getElementById('testimonialImage').value = t.image;
  }
  document.getElementById('testimonialsModal').classList.add('active');
}

async function deleteTestimonial(id) {
  Swal.fire({
    title: '¿Eliminar esta reseña?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const success = await deleteTestimonialFromSupabase(id);
      if (success) {
        await renderTestimonialList();
        await renderTestimonials();
        Swal.fire({
          icon: 'success',
          title: '¡Reseña eliminada!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la reseña.',
          confirmButtonColor: '#c9a96e'
        });
      }
    }
  });
}

async function renderTestimonialList() {
  const list = document.getElementById('testimonialList');
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) {
    list.innerHTML = '<p style="color:#6a7f94;">No hay reseñas creadas.</p>';
    return;
  }
  list.innerHTML = testimonials.map(t => `
    <div class="admin-list-item">
      <div class="item-info">
        <h4>${t.name}</h4>
        <p>${t.message.substring(0, 60)}${t.message.length > 60 ? '...' : ''}</p>
      </div>
      <div class="item-actions">
        <button class="edit-btn" onclick="editTestimonial('${t.id}')">✏️ Editar</button>
        <button class="delete-btn" onclick="deleteTestimonial('${t.id}')">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
}

