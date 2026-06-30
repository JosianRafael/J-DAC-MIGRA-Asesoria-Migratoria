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

    return data || [];
  } catch (err) {
    console.error('Error en getCourses:', err);
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

async function deleteCourseFromSupabase(id) {
  try {
    const { error } = await SUPABASE
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando curso:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en deleteCourseFromSupabase:', err);
    return false;
  }
}

async function renderCourses() {
  const grid = document.getElementById('courseGrid');
  const courses = await getCourses();

  const isAdmin = localStorage.getItem('isLoggedIn') === 'true';

  if (courses.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#6a7f94; padding:40px 0;">No hay cursos disponibles. Agrega uno desde el panel de administración.</p>';
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
          ${isAdmin ? `
            <div class="course-admin-actions">
              <button class="edit-course-btn" onclick="editCourse('${course.id}')">✏️ Editar</button>
              <button class="delete-course-btn" onclick="deleteCourse('${course.id}')">🗑️ Eliminar</button>
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
  const courses = await getCourses();
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

async function deleteCourse(id) {
  Swal.fire({
    title: '¿Eliminar este curso?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const success = await deleteCourseFromSupabase(id);
      if (success) {
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el curso.',
          confirmButtonColor: '#c9a96e'
        });
      }
    }
  });
}

async function renderCourseList() {
  const list = document.getElementById('courseList');
  const courses = await getCourses();
  if (courses.length === 0) {
    list.innerHTML = '<p style="color:#6a7f94;">No hay cursos creados.</p>';
    return;
  }
  list.innerHTML = courses.map(c => `
    <div class="admin-list-item">
      <div class="item-info">
        <h4>${c.name}</h4>
        <p>${c.date} · ${c.modality} · ${c.currency || 'USD'} ${c.price || 'Gratuito'} · ${c.status || 'Publicado'}</p>
      </div>
      <div class="item-actions">
        <button class="edit-btn" onclick="editCourse('${c.id}')">✏️ Editar</button>
        <button class="delete-btn" onclick="deleteCourse('${c.id}')">🗑️ Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function updateCourseFilter() {
  const select = document.getElementById('filterCourse');
  const courses = await getCourses();
  const currentValue = select.value;
  select.innerHTML = '<option value="">Todos los cursos</option>';
  courses.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
  select.value = currentValue;
}