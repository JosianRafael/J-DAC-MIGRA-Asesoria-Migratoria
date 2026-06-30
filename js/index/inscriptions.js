// inscriptions.js

// ============================================================
// ===== FUNCIONES DE INSCRIPCIONES =====
// ============================================================

async function getInscriptions() {
  try {
    // Obtener todas las inscripciones
    const { data, error } = await SUPABASE
      .from('inscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo inscripciones:', error);
      return [];
    }

    // Filtrar inscripciones de cursos que NO estén archivados
    // Primero obtener todos los cursos
    const { data: courses, error: coursesError } = await SUPABASE
      .from('products')
      .select('id, status');

    if (coursesError) {
      console.error('Error obteniendo cursos para filtrar:', coursesError);
      return data || [];
    }

    // Crear un mapa de cursos archivados
    const archivedCourseIds = new Set();
    courses.forEach(c => {
      if (c.status === 'Archivado') {
        archivedCourseIds.add(c.id);
      }
    });

    // Filtrar inscripciones: solo mostrar las de cursos NO archivados
    const filteredData = data.filter(inscription => {
      return !archivedCourseIds.has(inscription.course_id);
    });

    return filteredData || [];
  } catch (err) {
    console.error('Error en getInscriptions:', err);
    return [];
  }
}

// Obtener TODAS las inscripciones (incluyendo las de cursos archivados) para usos internos
async function getAllInscriptions() {
  try {
    const { data, error } = await SUPABASE
      .from('inscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo todas las inscripciones:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error en getAllInscriptions:', err);
    return [];
  }
}

// Obtener inscripciones de un curso específico (para certificados)
async function getInscriptionsByCourse(courseId) {
  try {
    const { data, error } = await SUPABASE
      .from('inscriptions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo inscripciones por curso:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error en getInscriptionsByCourse:', err);
    return [];
  }
}

async function saveInscriptionToSupabase(inscription) {
  try {
    const inscriptionData = {
      course_id: inscription.courseId,
      course_name: inscription.courseName,
      name: inscription.name,
      email: inscription.email || '',
      phone: inscription.phone,
      country: inscription.country,
      city: inscription.city || '',
      how_know: inscription.howKnow || '',
      experience: inscription.experience || '',
      comments: inscription.comments || '',
      payment_method: inscription.paymentMethod || '',
      receipt: inscription.receipt || '',
      status: inscription.status || 'Confirmado',
      inscription_date: inscription.inscriptionDate || new Date().toLocaleDateString('es-ES'),
      date: inscription.date || ''
    };

    const { data, error } = await SUPABASE
      .from('inscriptions')
      .insert(inscriptionData)
      .select()
      .single();

    if (error) {
      console.error('Error guardando inscripción:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error en saveInscriptionToSupabase:', err);
    return null;
  }
}

async function updateInscriptionStatus(id, status) {
  try {
    const { error } = await SUPABASE
      .from('inscriptions')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando inscripción:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en updateInscriptionStatus:', err);
    return false;
  }
}

async function renderInscriptions() {
  const tbody = document.getElementById('inscriptionTableBody');
  const noData = document.getElementById('noInscriptions');
  
  // Obtener inscripciones filtradas (sin cursos archivados)
  let inscriptions = await getInscriptions();
  
  const search = document.getElementById('searchInscription').value.toLowerCase();
  const courseFilter = document.getElementById('filterCourse').value;
  const statusFilter = document.getElementById('filterStatus').value;

  // Aplicar filtros
  inscriptions = inscriptions.filter(i => {
    const nameMatch = i.name.toLowerCase().includes(search);
    const courseMatch = !courseFilter || i.course_id === courseFilter;
    const statusMatch = !statusFilter || i.status === statusFilter;
    return nameMatch && courseMatch && statusMatch;
  });

  if (inscriptions.length === 0) {
    tbody.innerHTML = '';
    noData.style.display = 'block';
    return;
  }
  noData.style.display = 'none';

  tbody.innerHTML = inscriptions.map(i => {
    const statusClass = i.status === 'Pagado' || i.status === 'Confirmado' ? 'badge-pagado' :
                       i.status === 'Pendiente' ? 'badge-pendiente' : 'badge-cancelado';
    return `
      <tr>
        <td>${i.name}</td>
        <td>${i.course_name}</td>
        <td>${i.phone}</td>
        <td>${i.email || '-'}</td>
        <td>${i.inscription_date || i.date}</td>
        <td><span class="badge-status ${statusClass}">${i.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-view" onclick="viewDetail('${i.id}')">👁️ Ver</button>
            ${i.status === 'Pendiente' ? `<button class="btn-pay" onclick="markAsPaid('${i.id}')">💳 Pagar</button>` : ''}
            ${i.status === 'Pagado' || i.status === 'Confirmado' ? `<button class="btn-cancel" onclick="cancelInscription('${i.id}')">❌ Cancelar</button>` : ''}
            ${i.status === 'Cancelado' ? `<button class="btn-pay" onclick="restoreInscription('${i.id}')">↩️ Restaurar</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function viewDetail(id) {
  const inscriptions = await getAllInscriptions(); // Usar todas para ver detalles
  const i = inscriptions.find(ins => ins.id === id);
  if (!i) return;

  const content = document.getElementById('detailContent');
  let html = `
    <div class="detail-item"><strong>Nombre:</strong> ${i.name}</div>
    <div class="detail-item"><strong>Curso:</strong> ${i.course_name}</div>
    <div class="detail-item"><strong>Teléfono:</strong> ${i.phone}</div>
    <div class="detail-item"><strong>Correo:</strong> ${i.email || '-'}</div>
    <div class="detail-item"><strong>País:</strong> ${i.country}</div>
    <div class="detail-item"><strong>Ciudad:</strong> ${i.city || '-'}</div>
    <div class="detail-item"><strong>Fecha inscripción:</strong> ${i.inscription_date || i.date}</div>
    <div class="detail-item"><strong>Estado:</strong> ${i.status}</div>
    <div class="detail-item"><strong>¿Cómo conoció?:</strong> ${i.how_know || '-'}</div>
    <div class="detail-item"><strong>Experiencia:</strong> ${i.experience || '-'}</div>
    <div class="detail-item"><strong>Comentarios:</strong> ${i.comments || '-'}</div>
    ${i.payment_method ? `<div class="detail-item"><strong>Método de pago:</strong> ${i.payment_method}</div>` : ''}
  `;

  if (i.receipt) {
    html += `
      <div class="detail-item">
        <strong>Comprobante:</strong>
        <img src="${i.receipt}" class="detail-image" onclick="openImageModal('${i.receipt}')" alt="Comprobante" />
      </div>
    `;
  }

  content.innerHTML = html;
  document.getElementById('detailModal').classList.add('active');
}

async function markAsPaid(id) {
  Swal.fire({
    title: '¿Marcar como pagado?',
    text: 'Esta acción cambiará el estado de la inscripción.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, pagar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const success = await updateInscriptionStatus(id, 'Pagado');
      if (success) {
        await renderInscriptions();
        Swal.fire({
          icon: 'success',
          title: '¡Marcado como pagado!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  });
}

async function cancelInscription(id) {
  Swal.fire({
    title: '¿Cancelar esta inscripción?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const success = await updateInscriptionStatus(id, 'Cancelado');
      if (success) {
        await renderInscriptions();
        Swal.fire({
          icon: 'success',
          title: '¡Inscripción cancelada!',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  });
}

async function restoreInscription(id) {
  const success = await updateInscriptionStatus(id, 'Pendiente');
  if (success) {
    await renderInscriptions();
    Swal.fire({
      icon: 'success',
      title: '¡Inscripción restaurada!',
      timer: 1500,
      showConfirmButton: false
    });
  }
}

async function exportInscriptions() {
  const inscriptions = await getInscriptions(); // Solo no archivados
  if (inscriptions.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No hay inscripciones',
      text: 'No hay datos para exportar.',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }
  let csv = 'Nombre,Curso,Teléfono,Correo,País,Ciudad,Fecha,Estado\n';
  inscriptions.forEach(i => {
    csv += `${i.name},${i.course_name},${i.phone},${i.email || ''},${i.country},${i.city || ''},${i.inscription_date || i.date},${i.status}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscripciones_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  Swal.fire({
    icon: 'success',
    title: '¡Exportado!',
    text: 'El archivo CSV se ha descargado.',
    timer: 2000,
    showConfirmButton: false
  });
}

async function openInscription(courseId) {
  const courses = await getCourses(); // Solo cursos no archivados
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    Swal.fire({
      icon: 'info',
      title: 'Curso no disponible',
      text: 'Este curso no está disponible para inscripciones.',
      confirmButtonColor: '#c9a96e'
    });
    return;
  }

  if (course.status !== 'Publicado') {
    Swal.fire({
      icon: 'info',
      title: 'Inscripciones no disponibles',
      text: 'Este curso no está disponible para inscripciones en este momento.',
      confirmButtonColor: '#c9a96e'
    });
    return;
  }

  if (course.max_people && course.max_people !== 'Ilimitado') {
    const inscriptions = await getInscriptions(); // Solo no archivados
    const count = inscriptions.filter(i => i.course_id === courseId && i.status !== 'Cancelado').length;
    const max = parseInt(course.max_people);
    if (count >= max) {
      Swal.fire({
        icon: 'warning',
        title: '¡Cupo lleno!',
        text: 'Este curso ya ha alcanzado el máximo de participantes permitidos.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }
  }

  document.getElementById('inscriptionCourseId').value = courseId;
  document.getElementById('inscriptionCourseName').textContent = course.name;
  document.getElementById('inscriptionCourseDate').textContent = course.date;
  document.getElementById('inscriptionCourseModality').textContent = course.modality;
  const priceText = course.price && parseFloat(course.price) > 0 ? `${course.currency || 'USD'} ${course.price}` : 'Gratuito';
  document.getElementById('inscriptionCoursePrice').textContent = priceText;

  const isPaid = course.price && parseFloat(course.price) > 0;
  document.getElementById('paymentSection').style.display = isPaid ? 'block' : 'none';

  document.getElementById('inscriptionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

async function submitInscription(e) {
  e.preventDefault();
  const courseId = document.getElementById('inscriptionCourseId').value;
  const courses = await getCourses(); // Solo no archivados
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El curso no está disponible.',
      confirmButtonColor: '#c9a96e'
    });
    return;
  }

  if (course.max_people && course.max_people !== 'Ilimitado') {
    const inscriptions = await getInscriptions(); // Solo no archivados
    const count = inscriptions.filter(i => i.course_id === courseId && i.status !== 'Cancelado').length;
    const max = parseInt(course.max_people);
    if (count >= max) {
      Swal.fire({
        icon: 'warning',
        title: '¡Cupo lleno!',
        text: 'Este curso ya ha alcanzado el máximo de participantes permitidos.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }
  }

  const isPaid = course.price && parseFloat(course.price) > 0;
  const receipt = document.getElementById('inscriptionReceipt').value;

  if (isPaid && !receipt) {
    Swal.fire({
      icon: 'warning',
      title: 'Comprobante requerido',
      text: 'Debes subir el comprobante de pago para completar tu inscripción.',
      confirmButtonColor: '#c9a96e'
    });
    return;
  }

  const inscription = {
    courseId: courseId,
    courseName: course.name,
    name: document.getElementById('inscriptionName').value,
    email: document.getElementById('inscriptionEmail').value || '',
    phone: document.getElementById('inscriptionPhone').value,
    country: document.getElementById('inscriptionCountry').value,
    city: document.getElementById('inscriptionCity').value || '',
    howKnow: document.getElementById('inscriptionHowKnow').value || '',
    experience: document.getElementById('inscriptionExperience').value || '',
    comments: document.getElementById('inscriptionComments').value || '',
    paymentMethod: isPaid ? document.getElementById('inscriptionPaymentMethod').value : '',
    receipt: receipt || '',
    status: isPaid ? 'Pendiente' : 'Confirmado',
    inscriptionDate: new Date().toLocaleDateString('es-ES'),
    date: course.date
  };

  const result = await saveInscriptionToSupabase(inscription);

  if (result) {
    document.getElementById('inscriptionModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('inscriptionForm').reset();
    document.getElementById('inscriptionReceipt').value = '';
    document.getElementById('receiptPreview').style.display = 'none';
    document.getElementById('receiptFileName').textContent = 'Ningún archivo seleccionado';

    if (isPaid) {
      Swal.fire({
        icon: 'success',
        title: '¡Inscripción recibida!',
        text: 'Tu pago está pendiente de confirmación. En breve nos pondremos en contacto contigo.',
        confirmButtonColor: '#c9a96e'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: '¡Te has inscrito correctamente!',
        text: 'Tu inscripción ha sido confirmada. En breve recibirás más información.',
        confirmButtonColor: '#c9a96e'
      });
    }
    await renderInscriptions();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo completar la inscripción. Intenta nuevamente.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

// ============================================================
// ===== EXPORTAR FUNCIONES GLOBALES =====
// ============================================================

window.getInscriptions = getInscriptions;
window.getAllInscriptions = getAllInscriptions;
window.getInscriptionsByCourse = getInscriptionsByCourse;
window.saveInscriptionToSupabase = saveInscriptionToSupabase;
window.updateInscriptionStatus = updateInscriptionStatus;
window.renderInscriptions = renderInscriptions;
window.viewDetail = viewDetail;
window.markAsPaid = markAsPaid;
window.cancelInscription = cancelInscription;
window.restoreInscription = restoreInscription;
window.exportInscriptions = exportInscriptions;
window.openInscription = openInscription;
window.submitInscription = submitInscription;