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
    e.preventDefault(); // Prevenir la recarga de la página

    // Obtener los valores del formulario
    const name = this.querySelector('input[type="text"]')?.value?.trim() || '';
    const email = this.querySelector('input[type="email"]')?.value?.trim() || '';
    const phone = this.querySelector('input[type="tel"]')?.value?.trim() || '';
    const message = this.querySelector('textarea')?.value?.trim() || '';

    // Validar que los campos requeridos estén llenos
    if (!name || !email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, completa tu nombre y correo electrónico.',
        confirmButtonColor: '#c9a96e'
      });
      return;
    }

    // Obtener el número de WhatsApp desde la configuración
    const whatsappElement = document.getElementById('contactWhatsapp');
    let whatsappNumber = '+57 300 123 4567'; // Número por defecto

    if (whatsappElement) {
      whatsappNumber = whatsappElement.textContent.trim();
    }

    // Limpiar el número (solo dígitos)
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    // Construir el mensaje para WhatsApp
    let whatsappMessage = `📋 *NUEVA CONSULTA - JADAC MIGRA*%0A%0A`;
    whatsappMessage += `👤 *Nombre:* ${encodeURIComponent(name)}%0A`;
    whatsappMessage += `📧 *Correo:* ${encodeURIComponent(email)}%0A`;
    if (phone) {
      whatsappMessage += `📱 *Teléfono:* ${encodeURIComponent(phone)}%0A`;
    }
    whatsappMessage += `%0A💬 *Mensaje:*%0A${encodeURIComponent(message || 'Sin mensaje adicional')}`;

    // Crear el enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${whatsappMessage}`;

    // Mostrar mensaje de éxito antes de redirigir
    Swal.fire({
      icon: 'success',
      title: '¡Mensaje enviado!',
      text: 'Serás redirigido a WhatsApp para completar tu consulta.',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Abrir WhatsApp en una nueva ventana
      window.open(whatsappUrl, '_blank');
      
      // Limpiar el formulario
      contactForm.reset();
    });
  });
}

// Llamar a la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  setupContactForm();
});



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

  init();
});

