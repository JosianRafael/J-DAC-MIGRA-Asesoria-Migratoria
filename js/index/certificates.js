// ============================================================
// ===== CERTIFICATES.JS - SISTEMA DE CERTIFICADOS =====
// ============================================================

// Variables de estado para certificados
let selectedCourseId = null;
let selectedStudents = new Set();

// ============================================================
// ===== OBTENER DATOS =====
// ============================================================

async function getCertificates() {
  try {
    const { data, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo certificados:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error en getCertificates:', err);
    return [];
  }
}

async function getCertificatesByCourse(courseId) {
  try {
    const { data, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .eq('course_id', courseId);

    if (error) {
      console.error('Error obteniendo certificados por curso:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error en getCertificatesByCourse:', err);
    return [];
  }
}

async function getCertificateByInscription(inscriptionId) {
  try {
    const { data, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .eq('inscription_id', inscriptionId)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo certificado por inscripción:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Error en getCertificateByInscription:', err);
    return null;
  }
}

// ============================================================
// ===== FUNCIONES DE ADMIN (PANEL) =====
// ============================================================

function switchAdminTab(tab) {
  // Ocultar todas las pestañas
  document.querySelectorAll('.admin-tab-content').forEach(el => {
    el.style.display = 'none';
  });

  // Desactivar todos los tabs
  document.querySelectorAll('.admin-tab').forEach(el => {
    el.classList.remove('active');
    el.style.color = '#6a7f94';
    el.style.borderBottom = '3px solid transparent';
  });

  // Mostrar pestaña seleccionada
  const tabMap = {
    'dashboard': 'adminTabDashboard',
    'courses': 'adminTabCourses',
    'inscriptions': 'adminTabInscriptions',
    'certificates': 'adminTabCertificates'
  };

  const targetId = tabMap[tab];
  if (targetId) {
    document.getElementById(targetId).style.display = 'block';
  }

  // Activar tab
  const activeTab = document.querySelector(`.admin-tab[data-tab="${tab}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.style.color = '#0b2b4a';
    activeTab.style.borderBottom = '3px solid #c9a96e';
  }

  // Cargar datos según pestaña
  if (tab === 'dashboard') {
    loadDashboardStats();
  } else if (tab === 'courses') {
    renderAdminCourses();
  } else if (tab === 'inscriptions') {
    renderInscriptions();
    updateCourseFilter();
  } else if (tab === 'certificates') {
    renderCertCoursesList();
  }
}

async function loadDashboardStats() {
  try {
    // Cursos totales
    const { count: coursesCount } = await SUPABASE
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Inscripciones totales
    const { count: inscriptionsCount } = await SUPABASE
      .from('inscriptions')
      .select('*', { count: 'exact', head: true });

    // Certificados totales
    const { count: certsCount } = await SUPABASE
      .from('certificates')
      .select('*', { count: 'exact', head: true });

    // Cursos finalizados
    const { count: finishedCount } = await SUPABASE
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Finalizado');

    document.getElementById('dashTotalCourses').textContent = coursesCount || 0;
    document.getElementById('dashTotalInscriptions').textContent = inscriptionsCount || 0;
    document.getElementById('dashTotalCertificates').textContent = certsCount || 0;
    document.getElementById('dashFinishedCourses').textContent = finishedCount || 0;

  } catch (err) {
    console.error('Error cargando dashboard:', err);
  }
}

async function renderAdminCourses() {
  const tbody = document.getElementById('adminCourseTableBody');
  const noData = document.getElementById('noAdminCourses');
  const courses = await getCourses();

  if (!courses || courses.length === 0) {
    tbody.innerHTML = '';
    noData.style.display = 'block';
    return;
  }
  noData.style.display = 'none';

  // Obtener conteo de inscripciones por curso
  const inscriptions = await getInscriptions();
  const inscCounts = {};
  inscriptions.forEach(i => {
    inscCounts[i.course_id] = (inscCounts[i.course_id] || 0) + 1;
  });

  tbody.innerHTML = courses.map(c => {
    const statusClass = c.status === 'Publicado' ? 'badge-pagado' :
                        c.status === 'Próximamente' ? 'badge-pendiente' :
                        'badge-cancelado';
    const count = inscCounts[c.id] || 0;
    return `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td><span class="badge-status ${statusClass}">${c.status}</span></td>
        <td>${count}</td>
        <td>
          <button class="btn-sm btn-gold" onclick="editCourse('${c.id}')">Editar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================
// ===== CERTIFICADOS - LISTA DE CURSOS FINALIZADOS =====
// ============================================================

async function renderCertCoursesList() {
  const container = document.getElementById('certCourseListContainer');
  const managementContainer = document.getElementById('certManagementContainer');
  
  try {
    // Ocultar gestión
    managementContainer.style.display = 'none';
    
    // Obtener cursos finalizados
    const { data: courses, error } = await SUPABASE
      .from('products')
      .select('*')
      .eq('status', 'Finalizado')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo cursos finalizados:', error);
      container.innerHTML = `
        <div style="padding:20px; background:#f8d7da; border-radius:16px; color:#721c24;">
          <i class="fas fa-exclamation-circle"></i> Error al cargar cursos finalizados
        </div>
      `;
      return;
    }

    if (!courses || courses.length === 0) {
      container.innerHTML = `
        <div style="padding:30px; text-align:center; color:#6a7f94;">
          <i class="fas fa-info-circle" style="font-size:2rem; display:block; margin-bottom:12px;"></i>
          No hay cursos finalizados para emitir certificados.
        </div>
      `;
      return;
    }

    // Obtener conteo de certificados por curso
    const certs = await getCertificates();
    const certCounts = {};
    certs.forEach(c => {
      certCounts[c.course_id] = (certCounts[c.course_id] || 0) + 1;
    });

    // Obtener conteo de inscripciones por curso
    const inscriptions = await getInscriptions();
    const inscCounts = {};
    inscriptions.forEach(i => {
      if (i.course_id) {
        inscCounts[i.course_id] = (inscCounts[i.course_id] || 0) + 1;
      }
    });

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <span style="font-size:0.85rem; color:#3e5a75;">📚 <strong>${courses.length}</strong> cursos finalizados</span>
      </div>
      <div class="table-responsive">
        <table class="cert-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Estado</th>
              <th>Certificados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="badge-status badge-cancelado">✅ Finalizado</span></td>
                <td>${certCounts[c.id] || 0} / ${inscCounts[c.id] || 0}</td>
                <td>
                  <button class="btn-sm btn-gold" onclick="openCertManagement('${c.id}')">
                    <i class="fas fa-cog"></i> Gestionar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

  } catch (err) {
    console.error('Error en renderCertCoursesList:', err);
    container.innerHTML = `
      <div style="padding:20px; background:#f8d7da; border-radius:16px; color:#721c24;">
        <i class="fas fa-exclamation-circle"></i> Error al cargar los cursos
      </div>
    `;
  }
}

// ============================================================
// ===== CERTIFICADOS - GESTIÓN POR CURSO (CORREGIDO) =====
// ============================================================

async function openCertManagement(courseId) {
  selectedCourseId = courseId;
  selectedStudents = new Set(); // Reiniciar selección
  
  const container = document.getElementById('certManagementContainer');
  const listContainer = document.getElementById('certCourseListContainer');
  
  try {
    // Ocultar lista, mostrar gestión
    listContainer.style.display = 'none';
    container.style.display = 'block';
    
    // Obtener datos del curso
    const { data: course, error: courseError } = await SUPABASE
      .from('products')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('Curso no encontrado');
    }

    // Obtener inscripciones del curso
    const { data: inscriptions, error: inscError } = await SUPABASE
      .from('inscriptions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (inscError) {
      throw new Error('Error al obtener inscripciones');
    }

    // Obtener certificados existentes
    const certificates = await getCertificatesByCourse(courseId);
    const certMap = {};
    certificates.forEach(c => {
      certMap[c.inscription_id] = c;
    });

    // Construir tabla
    let tableHtml = `
      <div style="background:#f5f9ff; border-radius:16px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="font-size:1.1rem; font-weight:700; color:#0b1e33;">${course.name}</div>
          <div style="font-size:0.85rem; color:#3e5a75;">
            <i class="fas fa-calendar"></i> ${course.date || 'Fecha no especificada'} &nbsp;·&nbsp;
            <i class="fas fa-users"></i> ${inscriptions.length} inscritos
          </div>
        </div>
        <div>
          <span class="badge-status badge-cancelado">✅ Finalizado</span>
        </div>
      </div>
      
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <label style="font-size:0.85rem; font-weight:600; color:#0b2b4a; display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="selectAllCerts" onchange="toggleSelectAllCerts()" checked />
            Seleccionar todos
          </label>
          <input type="text" id="searchStudent" placeholder="🔍 Buscar alumno..." oninput="filterCertStudents()" style="padding:6px 14px; border-radius:30px; border:1px solid #dbe4ed; font-size:0.85rem; font-family:'Inter',sans-serif; min-width:200px;" />
          <span style="font-size:0.85rem; color:#6a7f94;" id="selectedCount">0 seleccionados</span>
        </div>
        <div>
          <button class="btn-generate" id="generateCertsBtn" onclick="generateSelectedCertificates()" style="background:#0b2b4a; color:white; padding:10px 28px; border-radius:60px; border:none; font-weight:600; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; gap:8px; font-size:0.9rem;">
            <i class="fas fa-file-pdf"></i> Generar certificados
          </button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="cert-table">
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">
                <input type="checkbox" id="selectAllCertsHeader" onchange="toggleSelectAllCerts()" checked />
              </th>
              <th>Certificar</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Certificado</th>
            </tr>
          </thead>
          <tbody id="certStudentsBody">
    `;

    if (!inscriptions || inscriptions.length === 0) {
      tableHtml += `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:#6a7f94;">
            No hay inscripciones para este curso.
          </td>
        </tr>
      `;
    } else {
      // Recorrer cada inscripción
      inscriptions.forEach((ins) => {
        const cert = certMap[ins.id];
        const hasCert = !!cert;
        const hasValidCert = hasCert && cert.status === 'valid';
        const isRevoked = hasCert && cert.status === 'revoked';
        
        // SOLO seleccionar si NO tiene certificado válido
        const isSelected = !hasValidCert;
        
        // Si no tiene certificado válido, agregar a selectedStudents
        if (isSelected) {
          selectedStudents.add(ins.id);
        }
        
        let certStatusHtml = '';
        let actionsHtml = '';
        let checkboxDisabled = false;
        
        if (hasValidCert) {
          // Certificado válido - checkbox deshabilitado
          checkboxDisabled = true;
          certStatusHtml = `<span class="badge-status badge-pagado">✅ Descargar</span>`;
          actionsHtml = `
            <button class="btn-download" onclick="downloadCertificateFromAdmin('${cert.id}')" style="background:#28a745; color:white; padding:4px 12px; border-radius:30px; border:none; font-size:0.7rem; font-weight:600; cursor:pointer;">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-view-cert" onclick="viewCertificate('${cert.id}')" style="background:#c9a96e; color:#0b1e33; padding:4px 12px; border-radius:30px; border:none; font-size:0.7rem; font-weight:600; cursor:pointer;">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-regenerate" onclick="regenerateCertificate('${cert.id}')" style="background:#6f42c1; color:white; padding:4px 12px; border-radius:30px; border:none; font-size:0.7rem; font-weight:600; cursor:pointer;">
              <i class="fas fa-sync"></i>
            </button>
            <button class="btn-revoke" onclick="revokeCertificate('${cert.id}')" style="background:#dc3545; color:white; padding:4px 12px; border-radius:30px; border:none; font-size:0.7rem; font-weight:600; cursor:pointer;">
              <i class="fas fa-ban"></i>
            </button>
          `;
        } else if (isRevoked) {
          // Certificado revocado - se puede regenerar
          certStatusHtml = `<span class="badge-status badge-cancelado">❌ Revocado</span>`;
          actionsHtml = `
            <button class="btn-regenerate" onclick="regenerateCertificate('${cert.id}')" style="background:#6f42c1; color:white; padding:4px 12px; border-radius:30px; border:none; font-size:0.7rem; font-weight:600; cursor:pointer;">
              <i class="fas fa-sync"></i> Regenerar
            </button>
          `;
        } else {
          // Sin certificado - disponible para generar
          certStatusHtml = `<span class="badge-status" style="background:#e2eaf2; color:#3e5a75;">Pendiente</span>`;
        }

        tableHtml += `
          <tr data-inscription-id="${ins.id}" data-name="${ins.name.toLowerCase()}">
            <td style="text-align:center;">
              <input type="checkbox" class="student-checkbox" 
                     data-inscription-id="${ins.id}"
                     onchange="toggleStudentCert('${ins.id}')" 
                     ${isSelected ? 'checked' : ''}
                     ${checkboxDisabled ? 'disabled' : ''} />
            </td>
            <td>
              ${!hasCert ? `<span style="color:#28a745;">☑</span>` : 
                hasValidCert ? `<span style="color:#6c757d;">☑</span>` : 
                `<span style="color:#dc3545;">☐</span>`}
            </td>
            <td><strong>${ins.name}</strong></td>
            <td>${ins.phone || '-'}</td>
            <td>${ins.email || '-'}</td>
            <td>
              ${certStatusHtml}
              <div style="margin-top:4px; display:flex; gap:4px; flex-wrap:wrap;">
                ${actionsHtml}
              </div>
            </td>
          </tr>
        `;
      });
    }

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;
    
    // Actualizar contador después de renderizar
    updateSelectedCount();

  } catch (err) {
    console.error('Error en openCertManagement:', err);
    container.innerHTML = `
      <div style="padding:20px; background:#f8d7da; border-radius:16px; color:#721c24;">
        <i class="fas fa-exclamation-circle"></i> Error al cargar los datos: ${err.message}
      </div>
    `;
  }
}

// ============================================================
// ===== FUNCIONES DE SELECCIÓN =====
// ============================================================

function toggleSelectAllCerts() {
  const checkboxes = document.querySelectorAll('.student-checkbox:not(:disabled)');
  const selectAll = document.getElementById('selectAllCerts');
  const isChecked = selectAll.checked;
  
  checkboxes.forEach(cb => {
    cb.checked = isChecked;
    const inscriptionId = cb.dataset.inscriptionId;
    if (isChecked) {
      selectedStudents.add(inscriptionId);
    } else {
      selectedStudents.delete(inscriptionId);
    }
  });
  
  // Sincronizar header
  const headerCheckbox = document.getElementById('selectAllCertsHeader');
  if (headerCheckbox) {
    headerCheckbox.checked = isChecked;
  }
  
  updateSelectedCount();
}

function toggleStudentCert(inscriptionId) {
  const checkbox = document.querySelector(`.student-checkbox[data-inscription-id="${inscriptionId}"]`);
  if (!checkbox) return;
  
  // Actualizar selectedStudents basado en el estado del checkbox
  if (checkbox.checked) {
    selectedStudents.add(inscriptionId);
  } else {
    selectedStudents.delete(inscriptionId);
  }
  
  // Actualizar select-all
  const allCheckboxes = document.querySelectorAll('.student-checkbox:not(:disabled)');
  const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.checked);
  const selectAll = document.getElementById('selectAllCerts');
  const headerCheckbox = document.getElementById('selectAllCertsHeader');
  if (selectAll) selectAll.checked = allChecked;
  if (headerCheckbox) headerCheckbox.checked = allChecked;
  
  updateSelectedCount();
}

function updateSelectedCount() {
  // Contar SOLO los estudiantes seleccionados que NO tienen certificado válido
  const checkboxes = document.querySelectorAll('.student-checkbox:not(:disabled)');
  let count = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) {
      count++;
    }
  });
  
  // También actualizar selectedStudents para que coincida con los checkboxes marcados
  const newSelected = new Set();
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const id = cb.dataset.inscriptionId;
      if (id) newSelected.add(id);
    }
  });
  selectedStudents = newSelected;
  
  document.getElementById('selectedCount').textContent = `${count} seleccionados`;
  
  // Habilitar/deshabilitar botón de generar
  const btn = document.getElementById('generateCertsBtn');
  if (btn) {
    btn.disabled = count === 0;
    btn.style.opacity = count === 0 ? '0.5' : '1';
    btn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
  }
}

function filterCertStudents() {
  const search = document.getElementById('searchStudent').value.toLowerCase();
  const rows = document.querySelectorAll('#certStudentsBody tr');
  
  rows.forEach(row => {
    const name = row.dataset.name || '';
    row.style.display = name.includes(search) ? '' : 'none';
  });
}

// ============================================================
// ===== GENERAR CERTIFICADOS SELECCIONADOS =====
// ============================================================

async function generateSelectedCertificates() {
  // Obtener los IDs de los estudiantes seleccionados de los checkboxes
  const checkboxes = document.querySelectorAll('.student-checkbox:not(:disabled):checked');
  const inscriptionIds = Array.from(checkboxes).map(cb => cb.dataset.inscriptionId);
  
  if (inscriptionIds.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No hay seleccionados',
      text: 'Selecciona al menos un estudiante para generar certificados.',
      confirmButtonColor: '#c9a96e'
    });
    return;
  }

  // Confirmar
  const result = await Swal.fire({
    title: '¿Generar certificados?',
    text: `Se generarán ${inscriptionIds.length} certificados para el curso seleccionado.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0b2b4a',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '✅ Sí, generar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;

  // Mostrar loading
  Swal.fire({
    title: 'Generando certificados...',
    text: 'Por favor espera, esto puede tomar unos segundos.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await generateCertificates(selectedCourseId, inscriptionIds);

    if (response.success) {
      let message = `✅ ${response.totalGenerated} certificados generados correctamente.`;
      if (response.errors.length > 0) {
        message += `\n\n⚠️ ${response.totalErrors} errores:\n${response.errors.slice(0, 5).join('\n')}`;
        if (response.errors.length > 5) {
          message += `\n... y ${response.errors.length - 5} más.`;
        }
      }

      await Swal.fire({
        icon: response.totalErrors > 0 ? 'warning' : 'success',
        title: 'Certificados generados',
        text: message,
        confirmButtonColor: '#c9a96e'
      });

      // Recargar la gestión
      selectedStudents = new Set();
      await openCertManagement(selectedCourseId);
      await renderCertCoursesList();
      await loadDashboardStats();
      
    } else {
      throw new Error(response.errors.join('\n') || 'Error al generar certificados');
    }

  } catch (err) {
    console.error('Error en generateSelectedCertificates:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Ocurrió un error al generar los certificados.',
      confirmButtonColor: '#c9a96e'
    });
  }
}
async function generateCertificates(courseId, inscriptionIds) {
  try {
    if (!courseId || !inscriptionIds || inscriptionIds.length === 0) {
      throw new Error('No hay estudiantes seleccionados');
    }

    // Verificar que el curso esté finalizado
    const { data: course, error: courseError } = await SUPABASE
      .from('products')
      .select('status, name, modality, date, description, category, level')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('Curso no encontrado');
    }

    if (course.status !== 'Finalizado' && course.status !== 'Archivado') {
      throw new Error('Solo se pueden generar certificados para cursos finalizados');
    }

    const results = [];
    const errors = [];

    // Procesar UNO POR UNO para evitar conflictos de código duplicado
    for (const inscriptionId of inscriptionIds) {
      try {
        // Pequeña pausa entre inserciones para evitar conflictos
        if (results.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // OBTENER DATOS DE LA INSCRIPCIÓN
        const { data: inscription, error: inscError } = await SUPABASE
          .from('inscriptions')
          .select('*')
          .eq('id', inscriptionId)
          .single();

        if (inscError || !inscription) {
          errors.push(`Inscripción no encontrada: ${inscriptionId}`);
          continue;
        }

        // VERIFICAR SI YA EXISTE CERTIFICADO PARA ESTA INSCRIPCIÓN
        const { data: existing, error: existingError } = await SUPABASE
          .from('certificates')
          .select('id, code, status')
          .eq('inscription_id', inscriptionId)
          .maybeSingle();

        if (existingError) {
          errors.push(`Error verificando certificado existente para ${inscription.name}: ${existingError.message}`);
          continue;
        }

        // SI YA EXISTE UN CERTIFICADO VÁLIDO, SKIP
        if (existing && existing.status === 'valid') {
          errors.push(`El estudiante ${inscription.name} ya tiene un certificado válido (${existing.code})`);
          continue;
        }

        // SI ESTÁ REVOCADO, ACTUALIZAR A VÁLIDO
        if (existing && existing.status === 'revoked') {
          const { error: updateError } = await SUPABASE
            .from('certificates')
            .update({ 
              status: 'valid', 
              generated_at: new Date().toISOString(),
              course_snapshot: {
                name: course.name,
                modality: course.modality || 'Virtual/Presencial',
                date: course.date || 'Fecha no especificada',
                category: course.category || 'Migración',
                level: course.level || 'Básico',
                description: course.description || '',
                facilitator: 'Lic. Carolin Lorenzo Lorenzo'
              }
            })
            .eq('id', existing.id);
          
          if (updateError) {
            errors.push(`Error actualizando certificado para ${inscription.name}: ${updateError.message}`);
            continue;
          }
          
          results.push({
            id: existing.id,
            code: existing.code,
            name: inscription.name,
            regenerated: true
          });
          continue;
        }

        // CREAR NUEVO CERTIFICADO - SIN CÓDIGO (el trigger lo genera)
        const courseSnapshot = {
          name: course.name,
          modality: course.modality || 'Virtual/Presencial',
          date: course.date || 'Fecha no especificada',
          category: course.category || 'Migración',
          level: course.level || 'Básico',
          description: course.description || '',
          facilitator: 'Lic. Carolin Lorenzo Lorenzo'
        };

        const certData = {
          inscription_id: inscriptionId,
          course_id: courseId,
          user_id: inscription.user_id || null,
          status: 'valid',
          certificate_data: {
            student_name: inscription.name,
            student_phone: inscription.phone,
            student_email: inscription.email || '',
            course_name: course.name,
            generated_at: new Date().toISOString(),
            facilitator: 'Lic. Carolin Lorenzo Lorenzo',
            modality: course.modality || 'Virtual/Presencial',
            course_date: course.date || 'Fecha no especificada'
          },
          course_snapshot: courseSnapshot,
          generated_at: new Date().toISOString()
        };

        // Intentar insertar (el trigger generará el código)
        const { data: cert, error: certError } = await SUPABASE
          .from('certificates')
          .insert(certData)
          .select()
          .single();

        if (certError) {
          // Si el error es por código duplicado, reintentar una vez
          if (certError.message && certError.message.includes('duplicate key')) {
            // Esperar un poco más para que el otro proceso termine
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Intentar de nuevo
            const { data: retryCert, error: retryError } = await SUPABASE
              .from('certificates')
              .insert(certData)
              .select()
              .single();
              
            if (retryError) {
              errors.push(`Error al crear certificado para ${inscription.name}: ${retryError.message}`);
              continue;
            }
            
            if (retryCert) {
              await SUPABASE
                .from('certificates_log')
                .insert({
                  certificate_id: retryCert.id,
                  action: 'generated',
                  user_agent: navigator.userAgent
                });
              
              results.push({
                id: retryCert.id,
                code: retryCert.code,
                name: inscription.name
              });
              continue;
            }
          } else {
            errors.push(`Error al crear certificado para ${inscription.name}: ${certError.message}`);
            continue;
          }
        }

        if (cert) {
          await SUPABASE
            .from('certificates_log')
            .insert({
              certificate_id: cert.id,
              action: 'generated',
              user_agent: navigator.userAgent
            });

          results.push({
            id: cert.id,
            code: cert.code,
            name: inscription.name
          });
        }

      } catch (err) {
        errors.push(`Error procesando inscripción ${inscriptionId}: ${err.message}`);
      }
    }

    return {
      success: results.length > 0,
      results,
      errors,
      totalGenerated: results.length,
      totalErrors: errors.length
    };

  } catch (err) {
    console.error('Error en generateCertificates:', err);
    throw err;
  }
}

// ============================================================
// ===== GENERAR PDF CON DISEÑO PROFESIONAL =====
// ============================================================

async function generateAndDownloadPDF(cert, inscription, course) {
  try {
    // Crear el contenedor de la plantilla con diseño profesional
    const templateContainer = document.createElement('div');
    templateContainer.style.position = 'absolute';
    templateContainer.style.left = '-9999px';
    templateContainer.style.top = '0';
    templateContainer.style.width = '1123px';
    templateContainer.style.height = '794px';
    templateContainer.style.background = '#ffffff';
    templateContainer.style.fontFamily = "'Poppins', 'Inter', sans-serif";
    
   const qrUrl = `${window.location.origin}/verificar.html?code=${cert.code}`;
    const formattedDate = formatDate(cert.generated_at);
    
    templateContainer.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: #ffffff;
        border: 12px solid #c9a96e;
        border-radius: 8px;
        padding: 60px 70px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      ">
        <!-- Borde interior decorativo -->
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid rgba(201, 169, 110, 0.3);
          border-radius: 4px;
          pointer-events: none;
        "></div>
        
        <!-- Encabezado -->
        <div style="text-align: center; border-bottom: 3px solid #c9a96e; padding-bottom: 20px; position: relative;">
          <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 4px;">
            <div style="
              width: 60px;
              height: 60px;
              background: #0b1e33;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #c9a96e;
              font-size: 1.8rem;
              font-weight: 800;
            ">JM</div>
            <div>
              <div style="font-size: 2.2rem; font-weight: 800; color: #0b1e33; letter-spacing: 2px;">
                J⌃DAC <span style="color: #c9a96e;">MIGRA</span>
              </div>
              <div style="font-size: 0.75rem; color: #6a7f94; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">
                Asesoría y Trámites Migratorios
              </div>
            </div>
          </div>
        </div>
        
        <!-- Título del certificado -->
        <div style="text-align: center; margin: 12px 0 6px 0;">
          <div style="font-size: 2rem; font-weight: 700; color: #0b1e33; letter-spacing: 4px; text-transform: uppercase;">
            Certificado de Participación
          </div>
          <div style="width: 80px; height: 3px; background: #c9a96e; margin: 6px auto 0; border-radius: 4px;"></div>
        </div>
        
        <!-- Cuerpo del certificado -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 10px 0;">
          <p style="font-size: 1.1rem; color: #3e5a75; margin: 0 0 4px 0; font-weight: 400;">
            Se certifica que
          </p>
          
          <div style="
            font-size: 2.6rem;
            font-weight: 800;
            color: #0b1e33;
            margin: 4px 0;
            letter-spacing: 2px;
            text-transform: uppercase;
            background: linear-gradient(135deg, #0b1e33 0%, #1a3f61 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            ${inscription.name.toUpperCase()}
          </div>
          
          <p style="font-size: 1rem; color: #3e5a75; margin: 4px 0 0 0; font-weight: 400;">
            ha participado y completado satisfactoriamente el
          </p>
          
          <div style="
            font-size: 1.5rem;
            font-weight: 700;
            color: #0b2b4a;
            margin: 4px 0;
            letter-spacing: 1px;
          ">
            "${course.name}"
          </div>
          
          <p style="
            font-size: 0.95rem;
            color: #3e5a75;
            max-width: 600px;
            margin: 4px auto 0;
            line-height: 1.6;
            font-weight: 400;
          ">
            impartido por JADAC MIGRA, demostrando su participación
            y compromiso durante el desarrollo del programa.
          </p>
        </div>
        
        <!-- Detalles del certificado -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 30px;
          margin: 6px 0;
          padding: 12px 20px;
          background: #f5f9ff;
          border-radius: 12px;
          border: 1px solid #eef3f9;
        ">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #0b1e33;">
            <span style="color: #c9a96e; font-size: 1rem;"></span>
            <strong style="font-weight: 600;">Fecha de emisión:</strong>
            <span>${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #0b1e33;">
            <span style="color: #c9a96e; font-size: 1rem;"></span>
            <strong style="font-weight: 600;">Modalidad:</strong>
            <span>${course.modality || 'Virtual/Presencial'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #0b1e33; grid-column: span 2;">
            <span style="color: #c9a96e; font-size: 1rem;"></span>
            <strong style="font-weight: 600;">Facilitadora:</strong>
            <span>Lic. Carolin Lorenzo Lorenzo</span>
          </div>
        </div>
        
        <!-- Pie del certificado -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8px; padding-top: 12px; border-top: 2px solid #eef3f9;">
          <!-- Firma -->
          <div style="text-align: center;">
            <div style="width: 200px; border-top: 2px solid #0b1e33; margin: 0 auto 4px;"></div>
            <div style="font-weight: 700; color: #0b1e33; font-size: 0.85rem;">Lic. Carolin Lorenzo Lorenzo</div>
            <div style="font-size: 0.7rem; color: #6a7f94; font-weight: 500;">Facilitadora</div>
            <div style="font-size: 0.7rem; color: #6a7f94; font-weight: 600; margin-top: 2px;">JADAC MIGRA</div>
          </div>
          
          <!-- QR Code -->
          <div style="text-align: center;">
            <div id="qrContainer" style="width: 100px; height: 100px; margin: 0 auto 2px;"></div>
            <div style="font-size: 0.6rem; color: #6a7f94; max-width: 120px; line-height: 1.2; font-weight: 500;">
              Escanee el código QR para verificar la autenticidad
            </div>
          </div>
        </div>
        
        <!-- Código del certificado -->
        <div style="text-align: center; margin-top: 6px; font-size: 0.7rem; color: #6a7f94; font-weight: 600; letter-spacing: 1px;">
          Código del certificado: ${cert.code}
        </div>
      </div>
    `;
    
    document.body.appendChild(templateContainer);
    
    // Generar QR
    const qrContainer = templateContainer.querySelector('#qrContainer');
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: qrUrl,
        width: 100,
        height: 100,
        colorDark: '#0b1e33',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrContainer.innerHTML = '<div style="width:100px;height:100px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#6a7f94;border-radius:8px;">QR</div>';
    }
    
    // Esperar a que se renderice el QR
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generar PDF con html2canvas y jsPDF
    const canvas = await html2canvas(templateContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1123,
      height: 794
    });
    
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`certificado_${cert.code}.pdf`);
    
    // Limpiar
    document.body.removeChild(templateContainer);
    
  } catch (err) {
    console.error('Error generando PDF:', err);
    throw err;
  }
}

// ============================================================
// ===== ACCIONES DE CERTIFICADOS =====
// ============================================================

async function downloadCertificateFromAdmin(certId) {
  try {
    const { data: cert, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !cert) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el certificado.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }

    if (cert.status !== 'valid') {
      Swal.fire({
        icon: 'warning',
        title: 'Certificado no válido',
        text: 'Este certificado no está disponible para descarga.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }

    // Registrar descarga
    await SUPABASE
      .from('certificates_log')
      .insert({
        certificate_id: certId,
        action: 'downloaded',
        user_agent: navigator.userAgent
      });

    // Obtener datos para generar PDF
    const [inscriptionRes, courseRes] = await Promise.all([
      SUPABASE.from('inscriptions').select('*').eq('id', cert.inscription_id).single(),
      SUPABASE.from('products').select('*').eq('id', cert.course_id).single()
    ]);

    if (inscriptionRes.error || courseRes.error) {
      throw new Error('No se encontraron los datos del certificado');
    }

    await generateAndDownloadPDF(cert, inscriptionRes.data, courseRes.data);

  } catch (err) {
    console.error('Error en downloadCertificateFromAdmin:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Ocurrió un error al descargar el certificado.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function viewCertificate(certId) {
  try {
    const { data: cert, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !cert) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el certificado.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }

    // Registrar visualización
    await SUPABASE
      .from('certificates_log')
      .insert({
        certificate_id: certId,
        action: 'viewed',
        user_agent: navigator.userAgent
      });

    // Mostrar información en SweetAlert
    let statusText = '';
    let statusColor = '';
    if (cert.status === 'valid') {
      statusText = '✅ Válido';
      statusColor = '#28a745';
    } else if (cert.status === 'revoked') {
      statusText = '❌ Revocado';
      statusColor = '#dc3545';
    } else {
      statusText = '⏳ Pendiente';
      statusColor = '#ffc107';
    }

    Swal.fire({
      title: '📜 Certificado',
      html: `
        <div style="text-align:left;">
          <p><strong>Código:</strong> ${cert.code}</p>
          <p><strong>Estado:</strong> <span style="color:${statusColor}; font-weight:700;">${statusText}</span></p>
          <p><strong>Fecha de emisión:</strong> ${formatDate(cert.generated_at)}</p>
          <p><strong>Estudiante:</strong> ${cert.certificate_data?.student_name || 'No disponible'}</p>
          <p><strong>Curso:</strong> ${cert.certificate_data?.course_name || 'No disponible'}</p>
        </div>
      `,
      confirmButtonColor: '#c9a96e',
      width: '500px'
    });

  } catch (err) {
    console.error('Error en viewCertificate:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al ver el certificado.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function regenerateCertificate(certId) {
  try {
    const result = await Swal.fire({
      title: '¿Regenerar certificado?',
      text: 'Esto generará un nuevo PDF para este certificado. ¿Continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f42c1',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '✅ Sí, regenerar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Regenerando certificado...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Obtener datos del certificado
    const { data: cert, error } = await SUPABASE
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !cert) {
      throw new Error('No se pudo obtener el certificado');
    }

    // Registrar regeneración
    await SUPABASE
      .from('certificates_log')
      .insert({
        certificate_id: certId,
        action: 'regenerated',
        user_agent: navigator.userAgent
      });

    // Actualizar estado a valid
    await SUPABASE
      .from('certificates')
      .update({ status: 'valid', generated_at: new Date().toISOString() })
      .eq('id', certId);

    await Swal.fire({
      icon: 'success',
      title: '¡Certificado regenerado!',
      text: 'El certificado ha sido regenerado exitosamente.',
      timer: 2000,
      showConfirmButton: false
    });

    // Recargar gestión
    await openCertManagement(selectedCourseId);

  } catch (err) {
    console.error('Error en regenerateCertificate:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Ocurrió un error al regenerar el certificado.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

async function revokeCertificate(certId) {
  try {
    const result = await Swal.fire({
      title: '¿Revocar certificado?',
      text: 'Esta acción marcará el certificado como revocado. ¿Continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '✅ Sí, revocar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    // Actualizar estado
    await SUPABASE
      .from('certificates')
      .update({ status: 'revoked' })
      .eq('id', certId);

    // Registrar
    await SUPABASE
      .from('certificates_log')
      .insert({
        certificate_id: certId,
        action: 'revoked',
        user_agent: navigator.userAgent
      });

    await Swal.fire({
      icon: 'success',
      title: 'Certificado revocado',
      text: 'El certificado ha sido marcado como revocado.',
      timer: 1500,
      showConfirmButton: false
    });

    // Recargar gestión
    await openCertManagement(selectedCourseId);

  } catch (err) {
    console.error('Error en revokeCertificate:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al revocar el certificado.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

// ============================================================
// ===== FUNCIONES AUXILIARES =====
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return 'No especificada';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ============================================================
// ===== EXPORTAR FUNCIONES GLOBALES =====
// ============================================================

window.switchAdminTab = switchAdminTab;
window.renderCertCoursesList = renderCertCoursesList;
window.openCertManagement = openCertManagement;
window.toggleSelectAllCerts = toggleSelectAllCerts;
window.toggleStudentCert = toggleStudentCert;
window.filterCertStudents = filterCertStudents;
window.generateSelectedCertificates = generateSelectedCertificates;
window.downloadCertificateFromAdmin = downloadCertificateFromAdmin;
window.viewCertificate = viewCertificate;
window.regenerateCertificate = regenerateCertificate;
window.revokeCertificate = revokeCertificate;
window.generateAndDownloadPDF = generateAndDownloadPDF;
window.formatDate = formatDate;