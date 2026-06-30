
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
    pageTitle: 'Acerca de mí · J⌃DAC MIGRA',
    whatsapp: ' ',
    instagram: 'https://instagram.com/jadacmigra',
    email: ' ',
    address: ' ',
    schedule: 'Lun-Vie 8am - 6pm',
    mapLatitude: ' ',
    mapLongitude: ' '
  };

  // ============================================================
  // ===== FUNCIONES DE SUPABASE (CRUD) =====
  // ============================================================

  async function loadConfig() {
    try {
      const { data, error } = await SUPABASE
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.warn('Error cargando configuración, usando defaults:', error);
        return defaultConfig;
      }

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
          .single();

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
      siteName: data.site_name || defaultConfig.siteName,
      pageTitle: data.site_title || defaultConfig.pageTitle,
      whatsapp: data.whatsapp || defaultConfig.whatsapp,
      instagram: data.instagram || defaultConfig.instagram,
      email: data.email || defaultConfig.email,
      address: data.address || defaultConfig.address,
      schedule: data.schedule || defaultConfig.schedule,
      mapLatitude: data.map_latitude || defaultConfig.mapLatitude,
      mapLongitude: data.map_longitude || defaultConfig.mapLongitude
    };
  }

  async function saveConfigToSupabase(config) {
    try {
      const { error } = await SUPABASE
        .from('settings')
        .upsert({
          site_name: config.siteName,
          site_title: config.pageTitle,
          whatsapp: config.whatsapp,
          instagram: config.instagram,
          email: config.email,
          address: config.address,
          schedule: config.schedule,
          map_latitude: config.mapLatitude || '',
          map_longitude: config.mapLongitude || '',
          updated_at: new Date().toISOString()
        });

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
        avatar: testimonial.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
        image: testimonial.image || '',
        video: testimonial.video || ''
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

  async function getInscriptions() {
    try {
      const { data, error } = await SUPABASE
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo inscripciones:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error en getInscriptions:', err);
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

  // ============================================================
  // ===== APLICAR CONFIGURACIÓN =====
  // ============================================================
  function applyConfig(config) {
    document.title = config.pageTitle;
    document.getElementById('pageTitle').textContent = config.pageTitle;
    document.getElementById('navLogo').innerHTML = config.siteName.replace('JADAC MIGRA', 'JADAC <span>MIGRA</span>');
    document.getElementById('footerName').textContent = config.siteName;
    document.getElementById('footerCopyName').textContent = config.siteName;
    document.getElementById('whatsappFloat').href = `https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`;
    document.getElementById('contactWhatsappBtn').href = `https://wa.me/${config.whatsapp.replace(/[^0-9]/g, '')}`;
    const instaLink = document.getElementById('footerInstagram');
    if (config.instagram) {
      instaLink.parentElement.innerHTML = `<a href="${config.instagram}" target="_blank"><i class="fab fa-instagram" style="margin-right:12px;"></i></a></i>`;
    }
    document.getElementById('siteName').value = config.siteName;
    document.getElementById('pageTitleInput').value = config.pageTitle;
    document.getElementById('whatsappNumber').value = config.whatsapp;
    document.getElementById('instagramUrl').value = config.instagram || '';
    document.getElementById('companyEmail').value = config.email || '';
    document.getElementById('companyAddress').value = config.address || '';
    document.getElementById('companySchedule').value = config.schedule || '';
    document.getElementById('mapLatitude').value = config.mapLatitude || '';
    document.getElementById('mapLongitude').value = config.mapLongitude || '';
  }

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
  // ===== GESTIÓN DE CURSOS (CON SUPABASE) =====
  // ============================================================
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

  // ============================================================
  // ===== GESTIÓN DE RESEÑAS (CON SUPABASE) =====
  // ============================================================
  async function saveTestimonial(e) {
    e.preventDefault();
    const id = document.getElementById('editTestimonialId').value;
    const testimonial = {
      _id: id || null,
      name: document.getElementById('testimonialName').value,
      message: document.getElementById('testimonialMessage').value,
      date: document.getElementById('testimonialDate').value || 'Cliente satisfecho',
      avatar: document.getElementById('testimonialAvatar').value || 'https://randomuser.me/api/portraits/lego/1.jpg',
      image: document.getElementById('testimonialImage').value || '',
      video: document.getElementById('testimonialVideo').value || ''
    };

    const success = await saveTestimonialToSupabase(testimonial);
    if (success) {
      document.getElementById('testimonialForm').reset();
      document.getElementById('editTestimonialId').value = '';
      document.getElementById('testimonialImagePreview').style.display = 'none';
      document.getElementById('testimonialImageFileName').textContent = 'Ningún archivo seleccionado';
      document.getElementById('testimonialImage').value = '';
      document.getElementById('testimonialVideoPreview').style.display = 'none';
      document.getElementById('testimonialVideoFileName').textContent = 'Ningún archivo seleccionado';
      document.getElementById('testimonialVideo').value = '';
      await renderTestimonialList();
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
    document.getElementById('testimonialAvatar').value = t.avatar || '';
    if (t.image) {
      document.getElementById('testimonialImagePreview').src = t.image;
      document.getElementById('testimonialImagePreview').style.display = 'block';
      document.getElementById('testimonialImageFileName').textContent = 'Imagen cargada';
      document.getElementById('testimonialImage').value = t.image;
    }
    if (t.video) {
      document.getElementById('testimonialVideoPreview').src = t.video;
      document.getElementById('testimonialVideoPreview').style.display = 'block';
      document.getElementById('testimonialVideoFileName').textContent = 'Video cargado';
      document.getElementById('testimonialVideo').value = t.video;
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

  // ============================================================
  // ===== GESTIÓN DE INSCRIPCIONES (CON SUPABASE) =====
  // ============================================================
  async function renderInscriptions() {
    const tbody = document.getElementById('inscriptionTableBody');
    const noData = document.getElementById('noInscriptions');
    let inscriptions = await getInscriptions();
    const search = document.getElementById('searchInscription').value.toLowerCase();
    const courseFilter = document.getElementById('filterCourse').value;
    const statusFilter = document.getElementById('filterStatus').value;

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
    const inscriptions = await getInscriptions();
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
    const inscriptions = await getInscriptions();
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

  // ============================================================
  // ===== CONFIGURAR UPLOADS =====
  // ============================================================
  setupFileUpload('courseDropZone', 'courseImageUpload', 'courseImagePreview', 'courseFileName', 'courseImage');
  setupFileUpload('testimonialImageDropZone', 'testimonialImageUpload', 'testimonialImagePreview', 'testimonialImageFileName', 'testimonialImage');

  const videoDropZone = document.getElementById('testimonialVideoDropZone');
  const videoInput = document.getElementById('testimonialVideoUpload');
  const videoPreview = document.getElementById('testimonialVideoPreview');
  const videoFileName = document.getElementById('testimonialVideoFileName');
  const videoHidden = document.getElementById('testimonialVideo');

  videoDropZone.addEventListener('click', () => videoInput.click());
  videoDropZone.addEventListener('dragover', (e) => { e.preventDefault(); videoDropZone.classList.add('dragover'); });
  videoDropZone.addEventListener('dragleave', () => { videoDropZone.classList.remove('dragover'); });
  videoDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    videoDropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      videoInput.files = e.dataTransfer.files;
      handleVideoFile(videoInput.files[0]);
    }
  });
  videoInput.addEventListener('change', () => {
    if (videoInput.files.length) {
      handleVideoFile(videoInput.files[0]);
    }
  });

  function handleVideoFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      videoPreview.src = e.target.result;
      videoPreview.style.display = 'block';
      videoFileName.textContent = file.name;
      videoHidden.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ============================================================
  // ===== SAVE CONFIG =====
  // ============================================================
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
          text: 'Has iniciado sesión correctamente.',
          timer: 2500,
          showConfirmButton: false
        });
        document.getElementById('loginModal').classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('loginForm').reset();
        updateAdminUI();
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
  // ===== INICIALIZACIÓN =====
  // ============================================================
  async function init() {
    const config = await loadConfig();
    applyConfig(config);
    await renderCourseList();
    await renderTestimonialList();
    await renderInscriptions();
    await updateCourseFilter();
    updateAdminUI();
  }

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
      document.getElementById('testimonialVideoPreview').style.display = 'none';
      document.getElementById('testimonialVideoFileName').textContent = 'Ningún archivo seleccionado';
      document.getElementById('testimonialVideo').value = '';
    });

    document.getElementById('btnAdmin').addEventListener('click', () => {
      renderInscriptions();
      updateCourseFilter();
      document.getElementById('adminModal').classList.add('active');
    });
    document.getElementById('closeAdmin').addEventListener('click', () => {
      document.getElementById('adminModal').classList.remove('active');
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

    // ============================================================
    // ===== NAV TOGGLE =====
    // ============================================================
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => links.classList.remove('open'));
    });

    // ============================================================
    // ===== SCROLL ANIMATION =====
    // ============================================================
    const fadeElements = document.querySelectorAll('.fade-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    fadeElements.forEach(el => observer.observe(el));

    // ============================================================
    // ===== CAMBIO DE FONDO DEL NAV AL SCROLL =====
    // ============================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.style.background = 'rgba(11, 30, 51, 0.92)';
      } else {
        navbar.style.background = 'rgba(11, 30, 51, 0.75)';
      }
    });

    // ============================================================
    // ===== MODAL LOGIN =====
    // ============================================================
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
      if (e.key === 'Escape' && document.getElementById('detailModal').classList.contains('active')) {
        document.getElementById('detailModal').classList.remove('active');
      }
      if (e.key === 'Escape' && document.getElementById('imageModal').classList.contains('active')) {
        closeImageModal();
      }
    });

    // ============================================================
    // ===== INICIALIZAR =====
    // ============================================================
    init();
  });
