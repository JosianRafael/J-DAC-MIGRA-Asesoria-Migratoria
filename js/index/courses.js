// courses.js

// ============================================================
// ===== FUNCIONES DE CURSOS =====
// ============================================================

async function getCourses() {
  try {
    const { data, error } = await SUPABASE
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo cursos:', error);
      return [];
    }

    // Filtrar cursos archivados para la vista pública
    const publicCourses = data.filter(c => c.status !== 'Archivado');
    return publicCourses;
  } catch (err) {
    console.error('Error en getCourses:', err);
    return [];
  }
}

// Obtener TODOS los cursos (incluyendo archivados) para el panel admin
async function getAllCourses() {
  try {
    const { data, error } = await SUPABASE
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo todos los cursos:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error en getAllCourses:', err);
    return [];
  }
}

async function saveCourseToSupabase(course) {
  try {
    const courseData = {
      name: course.name,
      type: course.type || 'Curso',
      description: course.description || '',
      date: course.date,
      modality: course.modality || 'Online',
      address: course.address || '',
      price: course.price || '0',
      currency: course.currency || 'USD',
      max_people: course.maxPeople || 'Ilimitado',
      level: course.level || 'Básico',
      category: course.category || 'Migración',
      status: course.status || 'Publicado',
      image: course.image || '',
      updated_at: new Date().toISOString()
    };

    let result;
    if (course._id) {
      result = await SUPABASE
        .from('products')
        .update(courseData)
        .eq('id', course._id);
    } else {
      result = await SUPABASE
        .from('products')
        .insert(courseData);
    }

    if (result.error) {
      console.error('Error guardando curso:', result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en saveCourseToSupabase:', err);
    return false;
  }
}

// NUEVA FUNCIÓN: Eliminar curso con verificación de certificados
async function deleteCourseFromSupabase(id) {
  try {
    // 1. Verificar si el curso tiene certificados emitidos
    const { data: certificates, error: certError } = await SUPABASE
      .from('certificates')
      .select('id, code, certificate_data')
      .eq('course_id', id);

    if (certError) {
      console.error('Error verificando certificados:', certError);
      return { success: false, error: 'Error al verificar certificados' };
    }

    const hasCertificates = certificates && certificates.length > 0;

    // 2. Si tiene certificados, NO eliminar físicamente, solo archivar
    if (hasCertificates) {
      const { error: updateError } = await SUPABASE
        .from('products')
        .update({ 
          status: 'Archivado',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error archivando curso:', updateError);
        return { success: false, error: 'Error al archivar el curso' };
      }

      return { 
        success: true, 
        archived: true, 
        message: 'El curso tiene certificados emitidos. Ha sido archivado para mantener la validez de los certificados.',
        certificatesCount: certificates.length
      };
    }

    // 3. Si NO tiene certificados, eliminar físicamente
    const { error: deleteError } = await SUPABASE
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando curso:', deleteError);
      return { success: false, error: 'Error al eliminar el curso' };
    }

    return { 
      success: true, 
      deleted: true,
      message: 'Curso eliminado correctamente.'
    };

  } catch (err) {
    console.error('Error en deleteCourseFromSupabase:', err);
    return { success: false, error: err.message };
  }
}

// NUEVA FUNCIÓN: Verificar certificados de un curso
async function checkCourseCertificates(courseId) {
  try {
    const { data, error } = await SUPABASE
      .from('certificates')
      .select('id, code, certificate_data')
      .eq('course_id', courseId);

    if (error) {
      console.error('Error verificando certificados:', error);
      return { hasCertificates: false, count: 0, error: error.message };
    }

    return { 
      hasCertificates: data && data.length > 0,
      count: data ? data.length : 0,
      certificates: data || []
    };
  } catch (err) {
    console.error('Error en checkCourseCertificates:', err);
    return { hasCertificates: false, count: 0, error: err.message };
  }
}

// NUEVA FUNCIÓN: Obtener cursos archivados
async function getArchivedCourses() {
  try {
    const { data, error } = await SUPABASE
      .from('products')
      .select('*')
      .eq('status', 'Archivado')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo cursos archivados:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error en getArchivedCourses:', err);
    return [];
  }
}

// NUEVA FUNCIÓN: Restaurar curso archivado
async function restoreArchivedCourse(id) {
  try {
    const { error } = await SUPABASE
      .from('products')
      .update({ 
        status: 'Publicado',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error restaurando curso:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en restoreArchivedCourse:', err);
    return false;
  }
}

// ============================================================
// ===== FUNCIONES DE RENDERIZADO =====
// ============================================================

async function renderCourses() {
  const grid = document.getElementById('courseGrid');
  const courses = await getCourses();

  const isAdmin = localStorage.getItem('isLoggedIn') === 'true';

  if (courses.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#6a7f94; padding:40px 0;">No hay cursos disponibles.</p>';
    document.getElementById('coursePagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const start = (courseCurrentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageCourses = courses.slice(start, end);

  grid.innerHTML = pageCourses.map((course) => {
    const status = (course.status || 'Publicado').trim().toLowerCase();
    let statusClass = '';
    let statusEmoji = '';
    let btnText = 'Inscribirme';
    let btnClass = '';
    let btnDisabled = '';

    switch (status) {
      case 'publicado':
        statusClass = 'publicado';
        statusEmoji = '🟢';
        break;
      case 'próximamente':
      case 'proximamente':
        statusClass = 'proximamente';
        statusEmoji = '🟡';
        btnText = 'Próximamente';
        btnClass = 'disabled';
        btnDisabled = 'disabled';
        break;
      case 'finalizado':
        statusClass = 'finalizado';
        statusEmoji = '🔴';
        btnText = 'Finalizado';
        btnClass = 'disabled';
        btnDisabled = 'disabled';
        break;
      case 'archivado':
        statusClass = 'finalizado';
        statusEmoji = '📦';
        btnText = 'Archivado';
        btnClass = 'disabled';
        btnDisabled = 'disabled';
        break;
      default:
        statusClass = 'publicado';
        statusEmoji = '🟢';
    }

    const isPaid = course.price && parseFloat(course.price) > 0;

    return `
      <div class="course-card">
        <div class="course-img" style="background-image:url('${course.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=300&fit=crop'}');"></div>
        <div class="course-body">
          <span class="course-status ${statusClass}">${statusEmoji} ${course.status || 'Publicado'}</span>
          <h4>${course.name}</h4>
          <div class="course-tags">
            <span>${course.type || 'Curso'}</span>
            <span>${course.level || 'Básico'}</span>
            <span>${course.category || 'Migración'}</span>
          </div>
          <p style="color:#3e5a75;">${course.description || ''}</p>
          <div class="course-meta">
            <span><i class="far fa-calendar"></i> ${course.date}</span>
            <span><i class="far fa-clock"></i> ${course.modality}</span>
          </div>
          ${course.modality === 'Presencial' && course.address ? `<div class="course-address"><i class="fas fa-map-pin"></i> ${course.address}</div>` : ''}
          ${isPaid ? `<div class="course-price visible">${course.currency || 'USD'} ${course.price}</div>` : ''}
          <button class="btn ${btnClass}" ${btnDisabled ? 'disabled' : `onclick="openInscription('${course.id}')"`} style="width:100%; text-align:center; margin-top:18px; padding:12px; border-radius:60px; font-weight:600; background:#0b2b4a; color:white; border:none; cursor:${btnDisabled ? 'not-allowed' : 'pointer'};">
            ${btnText}
          </button>
          ${isAdmin && course.status !== 'Archivado' ? `
            <div class="course-admin-actions">
              <button class="edit-course-btn" onclick="editCourse('${course.id}')">✏️ Editar</button>
              <button class="delete-course-btn" onclick="deleteCourse('${course.id}')">🗑️ Eliminar</button>
            </div>
          ` : ''}
          ${isAdmin && course.status === 'Archivado' ? `
            <div class="course-admin-actions">
              <button class="edit-course-btn" onclick="editCourse('${course.id}')" style="background:#6f42c1; color:white;">📦 Archivado</button>
              <button class="edit-course-btn" onclick="restoreCourse('${course.id}')" style="background:#28a745; color:white;">↩️ Restaurar</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  renderPagination('coursePagination', totalPages, courseCurrentPage, (page) => {
    courseCurrentPage = page;
    renderCourses();
  });
}

async function renderEvents() {
  const list = document.getElementById('eventList');
  const courses = await getCourses();

  if (courses.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#6a7f94; padding:20px 0;">No hay eventos programados.</p>';
    document.getElementById('eventPagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const start = (eventCurrentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageCourses = courses.slice(start, end);

  list.innerHTML = pageCourses.map(course => `
    <div class="event-item">
      <div class="event-info">
        <i class="fas fa-calendar-alt"></i>
        <span>${course.name}</span>
        ${course.modality === 'Presencial' && course.address ? `<span class="event-address"><i class="fas fa-map-pin"></i> ${course.address}</span>` : ''}
      </div>
      <span class="event-date">${course.date}</span>
    </div>
  `).join('');

  renderPagination('eventPagination', totalPages, eventCurrentPage, (page) => {
    eventCurrentPage = page;
    renderEvents();
  });
}

async function saveCourse(e) {
  e.preventDefault();
  const id = document.getElementById('editCourseId').value;
  const price = document.getElementById('coursePrice').value || '0';
  const course = {
    _id: id || null,
    name: document.getElementById('courseName').value,
    type: document.getElementById('courseType').value,
    description: document.getElementById('courseDescription').value,
    date: document.getElementById('courseDate').value,
    modality: document.getElementById('courseModality').value,
    address: document.getElementById('courseAddress').value || '',
    price: price,
    currency: document.getElementById('courseCurrency').value,
    maxPeople: document.getElementById('courseMaxPeople').value || 'Ilimitado',
    level: document.getElementById('courseLevel').value,
    category: document.getElementById('courseCategory').value,
    status: document.getElementById('courseStatus').value,
    image: document.getElementById('courseImage').value || ''
  };

  const success = await saveCourseToSupabase(course);
  if (success) {
    document.getElementById('courseForm').reset();
    document.getElementById('editCourseId').value = '';
    document.getElementById('courseImagePreview').style.display = 'none';
    document.getElementById('courseFileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('courseImage').value = '';
    await renderCourseList();
    await renderCourses();
    await renderEvents();
    updateCourseFilter();
    Swal.fire({
      icon: 'success',
      title: '¡Curso guardado!',
      text: 'El curso se ha creado/modificado correctamente.',
      timer: 2000,
      showConfirmButton: false
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el curso. Verifica tu conexión.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function editCourse(id) {
  const courses = await getAllCourses();
  const course = courses.find(c => c.id === id);
  if (!course) return;
  document.getElementById('editCourseId').value = id;
  document.getElementById('courseName').value = course.name;
  document.getElementById('courseType').value = course.type || 'Curso';
  document.getElementById('courseDescription').value = course.description || '';
  document.getElementById('courseDate').value = course.date || '';
  document.getElementById('courseModality').value = course.modality || 'Online';
  document.getElementById('courseAddress').value = course.address || '';
  document.getElementById('coursePrice').value = course.price || '';
  document.getElementById('courseCurrency').value = course.currency || 'USD';
  document.getElementById('courseMaxPeople').value = course.max_people || '';
  document.getElementById('courseLevel').value = course.level || 'Básico';
  document.getElementById('courseCategory').value = course.category || 'Migración';
  document.getElementById('courseStatus').value = course.status || 'Publicado';
  if (course.image) {
    document.getElementById('courseImagePreview').src = course.image;
    document.getElementById('courseImagePreview').style.display = 'block';
    document.getElementById('courseFileName').textContent = 'Imagen cargada';
    document.getElementById('courseImage').value = course.image;
  }
  document.getElementById('coursesModal').classList.add('active');
}

// NUEVA FUNCIÓN: Eliminar curso con verificación de certificados y aviso
async function deleteCourse(id) {
  try {
    // Primero verificar si el curso tiene certificados
    const certCheck = await checkCourseCertificates(id);
    
    if (certCheck.hasCertificates) {
      // Mostrar aviso especial: El curso tiene certificados
      const result = await Swal.fire({
        title: '⚠️ Este curso tiene certificados emitidos',
        html: `
          <div style="text-align:left;">
            <p><strong>${certCheck.count}</strong> certificados han sido emitidos para este curso.</p>
            <p style="margin-top:12px; color:#0b2b4a; background:#f5f9ff; padding:12px; border-radius:12px;">
              <i class="fas fa-info-circle" style="color:#c9a96e;"></i>
              Los certificados <strong>conservarán una copia</strong> de la información del curso 
              y seguirán siendo válidos para los estudiantes.
            </p>
            <p style="margin-top:8px; color:#6a7f94; font-size:0.9rem;">
              El curso será <strong>archivado</strong> y ya no aparecerá en la página pública.
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c9a96e',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '✅ Archivar curso',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        // Archivar el curso
        const response = await deleteCourseFromSupabase(id);
        
        if (response.success) {
          await renderCourseList();
          await renderCourses();
          await renderEvents();
          updateCourseFilter();
          
          Swal.fire({
            icon: 'success',
            title: '📦 Curso archivado',
            text: `El curso ha sido archivado. ${certCheck.count} certificados mantienen su validez.`,
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          throw new Error(response.error || 'Error al archivar el curso');
        }
      }
    } else {
      // El curso NO tiene certificados - eliminar físicamente
      const result = await Swal.fire({
        title: '¿Eliminar este curso?',
        text: 'Este curso no tiene certificados emitidos. ¿Estás seguro de que quieres eliminarlo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const response = await deleteCourseFromSupabase(id);
        
        if (response.success) {
          await renderCourseList();
          await renderCourses();
          await renderEvents();
          updateCourseFilter();
          
          Swal.fire({
            icon: 'success',
            title: '¡Curso eliminado!',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(response.error || 'Error al eliminar el curso');
        }
      }
    }
  } catch (err) {
    console.error('Error en deleteCourse:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'No se pudo eliminar el curso.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

// NUEVA FUNCIÓN: Restaurar curso archivado
async function restoreCourse(id) {
  try {
    const result = await Swal.fire({
      title: '¿Restaurar este curso?',
      text: 'El curso volverá a estar disponible en la página pública con estado "Publicado".',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '✅ Sí, restaurar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const success = await restoreArchivedCourse(id);
      
      if (success) {
        await renderCourseList();
        await renderCourses();
        await renderEvents();
        updateCourseFilter();
        
        Swal.fire({
          icon: 'success',
          title: '¡Curso restaurado!',
          text: 'El curso está nuevamente disponible en la página pública.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Error al restaurar el curso');
      }
    }
  } catch (err) {
    console.error('Error en restoreCourse:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'No se pudo restaurar el curso.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function renderCourseList() {
  const list = document.getElementById('courseList');
  const courses = await getAllCourses();
  
  if (courses.length === 0) {
    list.innerHTML = '<p style="color:#6a7f94;">No hay cursos creados.</p>';
    return;
  }
  
  // Verificar certificados para cada curso
  const certCounts = {};
  for (const course of courses) {
    const certCheck = await checkCourseCertificates(course.id);
    certCounts[course.id] = certCheck.count || 0;
  }
  
  list.innerHTML = courses.map(c => {
    const isArchived = c.status === 'Archivado';
    const certCount = certCounts[c.id] || 0;
    const certBadge = certCount > 0 ? `<span style="background:#c9a96e; color:#0b1e33; padding:2px 10px; border-radius:30px; font-size:0.7rem; font-weight:600; margin-left:8px;">${certCount} certificados</span>` : '';
    
    return `
      <div class="admin-list-item" style="${isArchived ? 'opacity:0.7; background:#f0f0f0;' : ''}">
        <div class="item-info">
          <h4>${c.name} ${isArchived ? '📦' : ''} ${certBadge}</h4>
          <p>${c.date} · ${c.modality} · ${c.currency || 'USD'} ${c.price || 'Gratuito'} · ${c.status || 'Publicado'}</p>
          ${isArchived ? '<p style="color:#6a7f94; font-size:0.75rem; font-style:italic;">📌 Curso archivado (los certificados siguen siendo válidos)</p>' : ''}
        </div>
        <div class="item-actions">
          ${isArchived ? 
            `<button class="edit-btn" onclick="restoreCourse('${c.id}')" style="background:#28a745; color:white;">↩️ Restaurar</button>` :
            `<button class="edit-btn" onclick="editCourse('${c.id}')">✏️ Editar</button>
             <button class="delete-btn" onclick="deleteCourse('${c.id}')">🗑️ Eliminar</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

async function updateCourseFilter() {
  const select = document.getElementById('filterCourse');
  const courses = await getCourses(); // Solo cursos no archivados
  const currentValue = select.value;
  select.innerHTML = '<option value="">Todos los cursos</option>';
  courses.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
  select.value = currentValue;
}

// ============================================================
// ===== EXPORTAR FUNCIONES GLOBALES =====
// ============================================================

window.getCourses = getCourses;
window.getAllCourses = getAllCourses;
window.getArchivedCourses = getArchivedCourses;
window.saveCourseToSupabase = saveCourseToSupabase;
window.deleteCourseFromSupabase = deleteCourseFromSupabase;
window.checkCourseCertificates = checkCourseCertificates;
window.restoreArchivedCourse = restoreArchivedCourse;
window.renderCourses = renderCourses;
window.renderEvents = renderEvents;
window.saveCourse = saveCourse;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.restoreCourse = restoreCourse;
window.renderCourseList = renderCourseList;
window.updateCourseFilter = updateCourseFilter;