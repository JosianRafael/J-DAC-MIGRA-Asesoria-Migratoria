// main.js

// ============================================================
// ===== FUNCIONES DE SUBIDA DE ARCHIVOS =====
// ============================================================

function setupFileUpload(dropZoneId, fileInputId, previewId, fileNameId, hiddenInputId) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);
  const preview = document.getElementById(previewId);
  const fileName = document.getElementById(fileNameId);
  const hiddenInput = document.getElementById(hiddenInputId);

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFile(fileInput.files[0], preview, fileName, hiddenInput);
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      handleFile(fileInput.files[0], preview, fileName, hiddenInput);
    }
  });
}

function handleFile(file, preview, fileName, hiddenInput) {
  const reader = new FileReader();
  reader.onload = function(e) {
    preview.src = e.target.result;
    preview.style.display = 'block';
    fileName.textContent = file.name;
    hiddenInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ============================================================
// ===== CARRUSEL DE IMÁGENES =====
// ============================================================

const heroImages = [
  'https://gestion.pe/resizer/v2/MIMTXWE2PJASLABV6OKV537LVE.jpg?auth=d9258b0b10f7f3dcaca4bf820eac5771be5665e96cdfeaa71c652721490c9766&width=2400&height=1620&quality=75&smart=true',
  'https://media.diariolasamericas.com/p/8bebf6f10b29d3547f63747940bde9dd/adjuntos/216/imagenes/100/203/0100203489/corte-inmigracion-afp.jpg',
  'https://statics.exitosanoticias.pe/2024/04/661cba310d23c.webp',
  'https://gestion.pe/resizer/v2/MIMTXWE2PJASLABV6OKV537LVE.jpg?auth=d9258b0b10f7f3dcaca4bf820eac5771be5665e96cdfeaa71c652721490c9766&width=2400&height=1620&quality=75&smart=true'
];

let currentSlide = 0;
let slideInterval;
const slidesContainer = document.getElementById('heroSlides');
const indicatorsContainer = document.getElementById('heroIndicators');

heroImages.forEach((url, index) => {
  const slide = document.createElement('div');
  slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
  slide.style.backgroundImage = `url('${url}')`;
  slidesContainer.appendChild(slide);
});

heroImages.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = `dot ${index === 0 ? 'active' : ''}`;
  dot.setAttribute('aria-label', `Ir a imagen ${index + 1}`);
  dot.addEventListener('click', () => goToSlide(index));
  indicatorsContainer.appendChild(dot);
});

const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');

function goToSlide(index) {
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  currentSlide = index;
  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

function nextSlide() {
  const next = (currentSlide + 1) % heroImages.length;
  goToSlide(next);
}

function startSlideshow() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

function stopSlideshow() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

const heroSection = document.querySelector('.hero');
if (heroSection) {
  heroSection.addEventListener('mouseenter', stopSlideshow);
  heroSection.addEventListener('mouseleave', startSlideshow);
  startSlideshow();
}

// ============================================================
// ===== PAGINACIÓN =====
// ============================================================

function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button onclick="changePage('${containerId}', ${currentPage - 1}, ${totalPages}, ${onPageChange})" ${currentPage <= 1 ? 'disabled' : ''}>«</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="active">${i}</button>`;
    } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      html += `<button onclick="changePage('${containerId}', ${i}, ${totalPages}, ${onPageChange})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<button disabled>…</button>`;
    }
  }

  html += `<button onclick="changePage('${containerId}', ${currentPage + 1}, ${totalPages}, ${onPageChange})" ${currentPage >= totalPages ? 'disabled' : ''}>»</button>`;

  container.innerHTML = html;
}

function changePage(containerId, page, totalPages, onPageChange) {
  if (page < 1 || page > totalPages) return;
  onPageChange(page);
}

// ============================================================
// ===== FUNCIONES DE ADMIN UI =====
// ============================================================

function updateAdminUI() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const floatingButtons = document.getElementById('floatingButtons');
  const loginText = document.getElementById('loginText');
  const loginTrigger = document.getElementById('loginTrigger');

  if (isLoggedIn) {
    floatingButtons.classList.add('visible');
    loginText.textContent = 'Cerrar sesión';
    loginTrigger.onclick = function(e) {
      e.preventDefault();
      Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que quieres cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('isLoggedIn');
          updateAdminUI();
          renderCourses();
          Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            text: 'Has cerrado sesión correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    };
  } else {
    floatingButtons.classList.remove('visible');
    loginText.textContent = 'Iniciar sesión';
    loginTrigger.onclick = function(e) {
      e.preventDefault();
      document.getElementById('loginModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    };
  }
}

// ============================================================
// ===== LOGIN =====
// ============================================================

async function verifyLogin(username, password) {
  try {
    const { data, error } = await SUPABASE
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error en verifyLogin:', err);
    return false;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;
  if (user && pass) {
    const isValid = await verifyLogin(user, pass);
    if (isValid) {
      localStorage.setItem('isLoggedIn', 'true');
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido ' + user + '!',
        text: 'Has iniciado sesión correctamente. Ahora puedes administrar los cursos desde las cards.',
        timer: 2500,
        showConfirmButton: false
      });
      document.getElementById('loginModal').classList.remove('active');
      document.body.style.overflow = '';
      document.getElementById('loginForm').reset();
      updateAdminUI();
      renderCourses();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos.',
        confirmButtonColor: '#c9a96e'
      });
    }
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, completa todos los campos.',
      confirmButtonColor: '#c9a96e'
    });
  }
  return false;
}

// ============================================================
// ===== IMAGEN MODAL =====
// ============================================================

function openImageModal(src) {
  document.getElementById('imageModalContent').src = src;
  document.getElementById('imageModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  document.getElementById('imageModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
// ===== NUEVA FUNCIÓN: VER CURSOS ARCHIVADOS =====
// ============================================================

let archivedCoursesModalInstance = null;

function openArchivedCourses() {
  // Crear modal personalizado con SweetAlert2
  archivedCoursesModalInstance = Swal.fire({
    title: '📦 Cursos Archivados',
    html: `
      <div id="archivedCoursesContent" style="text-align:left; max-height:500px; overflow-y:auto;">
        <div style="text-align:center; padding:20px; color:#6a7f94;">
          <i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i>
          <p>Cargando cursos archivados...</p>
        </div>
      </div>
    `,
    width: '800px',
    showConfirmButton: false,
    showCloseButton: true,
    confirmButtonColor: '#c9a96e',
    didOpen: async () => {
      await loadArchivedCoursesList();
    },
    willClose: () => {
      archivedCoursesModalInstance = null;
    }
  });
}

async function loadArchivedCoursesList() {
  // Verificar si el contenedor existe en el DOM
  const container = document.getElementById('archivedCoursesContent');
  if (!container) {
    console.warn('El contenedor archivedCoursesContent no existe en el DOM');
    return;
  }
  
  try {
    // Obtener cursos archivados
    const { data: courses, error } = await SUPABASE
      .from('products')
      .select('*')
      .eq('status', 'Archivado')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error('Error al cargar cursos archivados');
    }

    if (!courses || courses.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#6a7f94;">
          <i class="fas fa-inbox" style="font-size:3rem; display:block; margin-bottom:12px;"></i>
          No hay cursos archivados.
        </div>
      `;
      return;
    }

    // Obtener conteo de inscripciones y certificados para cada curso
    let html = '';
    for (const course of courses) {
      // Contar inscripciones
      const { count: inscCount } = await SUPABASE
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      // Contar certificados
      const { count: certCount } = await SUPABASE
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      html += `
        <div style="
          background: #f5f9ff;
          border-radius: 16px;
          padding: 16px 20px;
          margin-bottom: 12px;
          border-left: 4px solid #c9a96e;
        ">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
            <div style="flex:1;">
              <div style="font-weight:700; font-size:1.1rem; color:#0b1e33;">
                ${course.name}
                <span style="background:#dc3545; color:white; padding:2px 10px; border-radius:30px; font-size:0.6rem; font-weight:600; margin-left:8px;">ARCHIVADO</span>
              </div>
              <div style="font-size:0.85rem; color:#3e5a75; margin-top:4px;">
                <span><i class="fas fa-calendar"></i> ${course.date || 'Fecha no especificada'}</span>
                <span style="margin-left:16px;"><i class="fas fa-users"></i> ${inscCount || 0} inscritos</span>
                <span style="margin-left:16px;"><i class="fas fa-certificate"></i> ${certCount || 0} certificados</span>
              </div>
              <div style="font-size:0.8rem; color:#6a7f94; margin-top:4px;">
                <i class="fas fa-tag"></i> ${course.category || 'Sin categoría'} · 
                <i class="fas fa-level-up-alt"></i> ${course.level || 'Básico'} · 
                <i class="fas fa-clock"></i> ${course.modality || 'Online'}
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button onclick="restoreArchivedCourseFromModal('${course.id}')" style="
                background:#28a745;
                color:white;
                padding:6px 16px;
                border:none;
                border-radius:30px;
                font-weight:600;
                font-size:0.75rem;
                cursor:pointer;
                transition:all 0.2s;
              ">
                <i class="fas fa-undo"></i> Restaurar
              </button>
              <button onclick="confirmPermanentDelete('${course.id}', '${course.name.replace(/'/g, "\\'")}')" style="
                background:#dc3545;
                color:white;
                padding:6px 16px;
                border:none;
                border-radius:30px;
                font-weight:600;
                font-size:0.75rem;
                cursor:pointer;
                transition:all 0.2s;
              ">
                <i class="fas fa-trash-alt"></i> Eliminar permanentemente
              </button>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    console.error('Error cargando cursos archivados:', err);
    container.innerHTML = `
      <div style="text-align:center; padding:20px; color:#721c24; background:#f8d7da; border-radius:12px;">
        <i class="fas fa-exclamation-circle"></i> Error al cargar cursos archivados: ${err.message}
      </div>
    `;
  }
}

// ============================================================
// ===== RESTAURAR CURSO ARCHIVADO DESDE MODAL =====
// ============================================================

async function restoreArchivedCourseFromModal(courseId) {
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
      const success = await restoreArchivedCourse(courseId);
      
      if (success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Curso restaurado!',
          text: 'El curso está nuevamente disponible en la página pública.',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Recargar la lista de archivados (si el modal sigue abierto)
        const container = document.getElementById('archivedCoursesContent');
        if (container) {
          await loadArchivedCoursesList();
        }
        
        // Actualizar dashboard
        loadDashboardStats();
        // Actualizar listas
        renderCourseList();
        renderCourses();
        renderEvents();
        updateCourseFilter();
      } else {
        throw new Error('Error al restaurar el curso');
      }
    }
  } catch (err) {
    console.error('Error en restoreArchivedCourseFromModal:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'No se pudo restaurar el curso.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

// ============================================================
// ===== ELIMINAR PERMANENTEMENTE CON CONFIRMACIÓN =====
// ============================================================

function confirmPermanentDelete(courseId, courseName) {
  Swal.fire({
    title: '⚠️ ELIMINAR PERMANENTEMENTE',
    html: `
      <div style="text-align:left;">
        <p style="color:#dc3545; font-weight:700; font-size:1.1rem;">
          <i class="fas fa-exclamation-triangle"></i> Esta acción es irreversible
        </p>
        <p style="margin-top:8px;">
          Estás a punto de eliminar permanentemente el curso:
          <strong style="color:#0b1e33;">${courseName}</strong>
        </p>
        <div style="
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 12px;
          padding: 12px 16px;
          margin: 12px 0;
          color: #721c24;
        ">
          <i class="fas fa-info-circle"></i>
          Esta acción eliminará el curso y <strong>toda la información relacionada</strong>:
          <ul style="margin:8px 0 0 20px; font-size:0.9rem;">
            <li>Inscripciones asociadas</li>
            <li>Certificados emitidos</li>
            <li>Logs de certificados</li>
          </ul>
          <p style="margin-top:8px; font-weight:700;">¡No podrá recuperarse!</p>
        </div>
        <div style="margin-top:16px;">
          <label style="font-weight:600; color:#0b1e33;">
            Escribe <strong style="color:#dc3545;">ELIMINAR</strong> para confirmar:
          </label>
          <input type="text" id="confirmDeleteInput" style="
            width:100%;
            padding:10px 14px;
            border-radius:30px;
            border:2px solid #dbe4ed;
            font-family:'Inter',sans-serif;
            font-size:0.95rem;
            margin-top:6px;
            transition:border 0.2s;
          " placeholder="Escribe ELIMINAR aquí" />
        </div>
      </div>
    `,
    width: '550px',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '🗑️ Eliminar permanentemente',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const input = document.getElementById('confirmDeleteInput');
      if (!input) return false;
      const value = input.value.trim();
      if (value !== 'ELIMINAR') {
        Swal.showValidationMessage('❌ Debes escribir exactamente "ELIMINAR" para confirmar');
        return false;
      }
      return true;
    },
    didOpen: () => {
      setTimeout(() => {
        const input = document.getElementById('confirmDeleteInput');
        if (input) input.focus();
      }, 300);
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      await permanentDeleteCourse(courseId, courseName);
    }
  });
}

async function permanentDeleteCourse(courseId, courseName) {
  try {
    Swal.fire({
      title: 'Eliminando curso...',
      text: 'Por favor espera, esto puede tomar unos segundos.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 1. Obtener todos los certificados del curso
    const { data: certificates, error: certError } = await SUPABASE
      .from('certificates')
      .select('id')
      .eq('course_id', courseId);

    if (certError) {
      throw new Error('Error al obtener certificados del curso');
    }

    // 2. Eliminar logs de certificados (si hay certificados)
    if (certificates && certificates.length > 0) {
      const certIds = certificates.map(c => c.id);
      const { error: logError } = await SUPABASE
        .from('certificates_log')
        .delete()
        .in('certificate_id', certIds);

      if (logError) {
        console.warn('Error eliminando logs de certificados:', logError);
      }
    }

    // 3. Eliminar certificados
    const { error: deleteCertsError } = await SUPABASE
      .from('certificates')
      .delete()
      .eq('course_id', courseId);

    if (deleteCertsError) {
      throw new Error('Error al eliminar certificados');
    }

    // 4. Eliminar inscripciones
    const { error: deleteInscError } = await SUPABASE
      .from('inscriptions')
      .delete()
      .eq('course_id', courseId);

    if (deleteInscError) {
      throw new Error('Error al eliminar inscripciones');
    }

    // 5. Eliminar el curso
    const { error: deleteCourseError } = await SUPABASE
      .from('products')
      .delete()
      .eq('id', courseId);

    if (deleteCourseError) {
      throw new Error('Error al eliminar el curso');
    }

    await Swal.fire({
      icon: 'success',
      title: '¡Curso eliminado permanentemente!',
      text: `El curso "${courseName}" y toda su información relacionada han sido eliminados.`,
      timer: 3000,
      showConfirmButton: false
    });

    // Recargar listas (verificar si el modal sigue abierto)
    const container = document.getElementById('archivedCoursesContent');
    if (container) {
      await loadArchivedCoursesList();
    }
    
    loadDashboardStats();
    renderCourseList();
    renderCourses();
    renderEvents();
    updateCourseFilter();

  } catch (err) {
    console.error('Error en permanentDeleteCourse:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'No se pudo eliminar el curso permanentemente.',
      confirmButtonColor: '#c9a96e'
    });
  }
}

// ============================================================
// ===== INICIALIZACIÓN =====
// ============================================================

async function init() {
  const config = await loadConfig();
  applyConfig(config);

  await renderCourses();
  await renderEvents();
  await renderTestimonials();
  await renderInscriptions();
  await updateCourseFilter();
  await renderCourseList();
  await renderTestimonialList();
  updateAdminUI();

  setupFileUpload('courseDropZone', 'courseImageUpload', 'courseImagePreview', 'courseFileName', 'courseImage');
  setupFileUpload('testimonialImageDropZone', 'testimonialImageUpload', 'testimonialImagePreview', 'testimonialImageFileName', 'testimonialImage');
  setupFileUpload('receiptDropZone', 'receiptUpload', 'receiptPreview', 'receiptFileName', 'inscriptionReceipt');
}

// ============================================================
// ===== FUNCIÓN PARA EL FORMULARIO DE CONTACTO =====
// ============================================================

function setupContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = this.querySelector('input[type="text"]')?.value?.trim() || '';
    const email = this.querySelector('input[type="email"]')?.value?.trim() || '';
    const phone = this.querySelector('input[type="tel"]')?.value?.trim() || '';
    const message = this.querySelector('textarea')?.value?.trim() || '';

    if (!name || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, completa tu nombre y correo electrónico.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }

    const whatsappElement = document.getElementById('contactWhatsapp');
    let whatsappNumber = '+57 300 123 4567';

    if (whatsappElement) {
      whatsappNumber = whatsappElement.textContent.trim();
    }

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    let whatsappMessage = `📋 *NUEVA CONSULTA - JADAC MIGRA*%0A%0A`;
    whatsappMessage += `👤 *Nombre:* ${encodeURIComponent(name)}%0A`;
    whatsappMessage += `📧 *Correo:* ${encodeURIComponent(email)}%0A`;
    if (phone) {
      whatsappMessage += `📱 *Teléfono:* ${encodeURIComponent(phone)}%0A`;
    }
    whatsappMessage += `%0A💬 *Mensaje:*%0A${encodeURIComponent(message || 'Sin mensaje adicional')}`;

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${whatsappMessage}`;

    Swal.fire({
      icon: 'success',
      title: '¡Mensaje enviado!',
      text: 'Serás redirigido a WhatsApp para completar tu consulta.',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      window.open(whatsappUrl, '_blank');
      contactForm.reset();
    });
  });
}

// ============================================================
// ===== FUNCIÓN PARA ACTUALIZAR DASHBOARD (CORREGIDA) =====
// ============================================================

async function loadDashboardStats() {
  try {
    // Obtener TODOS los cursos para saber cuáles están archivados
    const { data: allCourses, error: coursesError } = await SUPABASE
      .from('products')
      .select('id, status');

    if (coursesError) {
      console.error('Error obteniendo cursos:', coursesError);
      return;
    }

    // Filtrar cursos NO archivados
    const activeCourseIds = allCourses
      .filter(c => c.status !== 'Archivado')
      .map(c => c.id);

    const archivedCourseIds = allCourses
      .filter(c => c.status === 'Archivado')
      .map(c => c.id);

    // Cursos activos totales
    const activeCoursesCount = activeCourseIds.length;

    // Inscripciones de cursos activos
    let activeInscriptionsCount = 0;
    if (activeCourseIds.length > 0) {
      const { count: inscCount } = await SUPABASE
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .in('course_id', activeCourseIds);
      activeInscriptionsCount = inscCount || 0;
    }

    // Certificados de cursos activos
    let activeCertificatesCount = 0;
    if (activeCourseIds.length > 0) {
      const { count: certCount } = await SUPABASE
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .in('course_id', activeCourseIds);
      activeCertificatesCount = certCount || 0;
    }

    // Cursos finalizados (solo de cursos activos)
    const finishedCourses = allCourses.filter(c => 
      c.status === 'Finalizado' && !archivedCourseIds.includes(c.id)
    );
    const finishedCount = finishedCourses.length;

    // Cursos archivados totales
    const archivedCount = archivedCourseIds.length;

    // Actualizar elementos del DOM (verificar que existen)
    const totalCoursesEl = document.getElementById('dashTotalCourses');
    const totalInscriptionsEl = document.getElementById('dashTotalInscriptions');
    const totalCertificatesEl = document.getElementById('dashTotalCertificates');
    const finishedCoursesEl = document.getElementById('dashFinishedCourses');

    if (totalCoursesEl) totalCoursesEl.textContent = activeCoursesCount;
    if (totalInscriptionsEl) totalInscriptionsEl.textContent = activeInscriptionsCount;
    if (totalCertificatesEl) totalCertificatesEl.textContent = activeCertificatesCount;
    if (finishedCoursesEl) finishedCoursesEl.textContent = finishedCount;

    // Actualizar el botón de cursos archivados
    const archivedBtn = document.querySelector('.archived-courses-btn');
    if (archivedBtn) {
      archivedBtn.innerHTML = `📦 Ver cursos archivados (${archivedCount})`;
      archivedBtn.style.display = archivedCount > 0 ? 'inline-flex' : 'none';
    }

  } catch (err) {
    console.error('Error cargando dashboard:', err);
  }
}

// ============================================================
// ===== EXPORTAR FUNCIONES GLOBALES =====
// ============================================================

window.openArchivedCourses = openArchivedCourses;
window.loadArchivedCoursesList = loadArchivedCoursesList;
window.restoreArchivedCourseFromModal = restoreArchivedCourseFromModal;
window.confirmPermanentDelete = confirmPermanentDelete;
window.permanentDeleteCourse = permanentDeleteCourse;
window.loadDashboardStats = loadDashboardStats;

// ============================================================
// ===== EVENTOS DE MODALES =====
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnConfig').addEventListener('click', () => {
    document.getElementById('configModal').classList.add('active');
  });
  document.getElementById('closeConfig').addEventListener('click', () => {
    document.getElementById('configModal').classList.remove('active');
  });

  document.getElementById('btnCourses').addEventListener('click', () => {
    renderCourseList();
    document.getElementById('coursesModal').classList.add('active');
  });
  document.getElementById('closeCourses').addEventListener('click', () => {
    document.getElementById('coursesModal').classList.remove('active');
    document.getElementById('courseForm').reset();
    document.getElementById('editCourseId').value = '';
    document.getElementById('courseImagePreview').style.display = 'none';
    document.getElementById('courseFileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('courseImage').value = '';
  });

  document.getElementById('btnTestimonials').addEventListener('click', () => {
    renderTestimonialList();
    document.getElementById('testimonialsModal').classList.add('active');
  });
  document.getElementById('closeTestimonials').addEventListener('click', () => {
    document.getElementById('testimonialsModal').classList.remove('active');
    document.getElementById('testimonialForm').reset();
    document.getElementById('editTestimonialId').value = '';
    document.getElementById('testimonialImagePreview').style.display = 'none';
    document.getElementById('testimonialImageFileName').textContent = 'Ningún archivo seleccionado';
    document.getElementById('testimonialImage').value = '';
  });

  document.getElementById('btnAdmin').addEventListener('click', () => {
    renderInscriptions();
    updateCourseFilter();
    document.getElementById('adminModal').classList.add('active');
    // Cargar dashboard al abrir el panel
    loadDashboardStats();
  });
  document.getElementById('closeAdmin').addEventListener('click', () => {
    document.getElementById('adminModal').classList.remove('active');
  });

  document.getElementById('closeInscription').addEventListener('click', () => {
    document.getElementById('inscriptionModal').classList.remove('active');
    document.body.style.overflow = '';
  });

  document.getElementById('closeDetail').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
  });

  document.querySelectorAll('.admin-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  document.getElementById('inscriptionModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('inscriptionModal').classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('detailModal').classList.remove('active');
    }
  });

  document.getElementById('courseModality').addEventListener('change', function() {
    const addressField = document.getElementById('addressField');
    addressField.style.display = this.value === 'Presencial' ? 'block' : 'none';
  });
  document.getElementById('addressField').style.display = document.getElementById('courseModality').value === 'Presencial' ? 'block' : 'none';

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });

  const fadeElements = document.querySelectorAll('.fade-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  fadeElements.forEach(el => observer.observe(el));

  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
  document.querySelector('.faq-item.open')?.classList.remove('open');
  document.querySelector('.faq-item')?.classList.add('open');

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(11, 30, 51, 0.92)';
    } else {
      navbar.style.background = 'rgba(11, 30, 51, 0.75)';
    }
  });

  const loginModal = document.getElementById('loginModal');
  const closeLogin = document.getElementById('closeLogin');

  closeLogin.addEventListener('click', () => {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('active')) {
      loginModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (e.key === 'Escape' && document.getElementById('inscriptionModal').classList.contains('active')) {
      document.getElementById('inscriptionModal').classList.remove('active');
      document.body.style.overflow = '';
    }
    if (e.key === 'Escape' && document.getElementById('detailModal').classList.contains('active')) {
      document.getElementById('detailModal').classList.remove('active');
    }
    if (e.key === 'Escape' && document.getElementById('imageModal').classList.contains('active')) {
      closeImageModal();
    }
  });

  // Agregar botón de cursos archivados al dashboard
  const dashboardContent = document.getElementById('adminTabDashboard');
  if (dashboardContent) {
    const statsGrid = dashboardContent.querySelector('div[style*="grid-template-columns"]');
    if (statsGrid) {
      // Verificar si el botón ya existe para no duplicarlo
      const existingBtn = statsGrid.querySelector('.archived-courses-btn');
      if (!existingBtn) {
        const archivedBtn = document.createElement('div');
        archivedBtn.style.gridColumn = 'span 1';
        archivedBtn.innerHTML = `
          <button onclick="openArchivedCourses()" class="archived-courses-btn" style="
            width:100%;
            height:100%;
            background: #f5f9ff;
            border: 2px dashed #c9a96e;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            color: #0b2b4a;
          ">
            📦 Ver cursos archivados (0)
          </button>
        `;
        statsGrid.appendChild(archivedBtn);
      }
    }
  }

  init();
  // Cargar dashboard stats después de init
  setTimeout(loadDashboardStats, 500);
});

// ============================================================
// ===== FUNCIÓN PARA VERIFICAR CERTIFICADO POR CÓDIGO =====
// ============================================================

async function verifyCertificateByCode(code) {
  try {
    const { data: cert, error } = await SUPABASE
      .from('certificate_details')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error || !cert) {
      return {
        valid: false,
        message: '❌ Este certificado no es válido.'
      };
    }

    if (cert.status === 'revoked') {
      return {
        valid: false,
        message: '❌ Este certificado ha sido revocado.',
        cert
      };
    }

    return {
      valid: true,
      message: '✅ Certificado válido',
      cert
    };

  } catch (err) {
    console.error('Error verificando certificado:', err);
    return {
      valid: false,
      message: '❌ Error al verificar el certificado.'
    };
  }
}

window.verifyCertificateByCode = verifyCertificateByCode;