/**
 * Admin System & Live Dynamic Content Manager for ResumeApp
 */

(function () {
  'use strict';

  // Global Resume Data State
  window.resumeState = window.resumeState || {};
  let isAdminLoggedIn = false;
  let pendingProfilePhoto = null;
  let pendingPhotoPreviewUrl = null;
  let cropImage = null;
  let cropImageUrl = null;
  let cropZoom = 1;
  let cropOffsetX = 0;
  let cropOffsetY = 0;
  let cropDrag = null;

  document.addEventListener('DOMContentLoaded', () => {
    initAdminTriggers();
    checkAdminStatus();
  });

  // Check backend session status
  async function checkAdminStatus() {
    try {
      const res = await fetch('/Admin/Status');
      const data = await res.json();
      if (data.isAdmin) {
        setAdminLoggedIn(true);
      }
    } catch (err) {
      console.warn('Could not check admin status:', err);
    }
  }

  // Template Switching Handler
  window.switchTemplateTheme = function (templateName) {
    document.documentElement.setAttribute('data-template', templateName);
    window.resumeState.SelectedTemplate = templateName;
  };

  window.openPhotoCropper = function (input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if ((file.type && !acceptedTypes.includes(file.type)) || file.size > 20 * 1024 * 1024) {
      alert('Choose a JPEG, PNG, or WebP image smaller than 20 MB.');
      input.value = '';
      return;
    }

    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    cropImageUrl = URL.createObjectURL(file);
    cropImage = new Image();
    cropImage.onload = function () {
      if (cropImage.naturalWidth * cropImage.naturalHeight > 40000000) {
        alert('This image is too large to edit. Choose an image with fewer pixels.');
        closePhotoCropper();
        return;
      }

      cropZoom = 1;
      const zoomSlider = document.getElementById('photo-zoom');
      if (zoomSlider) zoomSlider.value = '1';
      updateCropZoomLabel();
      centerCropImage();
      renderCropPreview();
      const modal = document.getElementById('photo-crop-modal');
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    };
    cropImage.onerror = function () {
      alert('The selected file could not be opened as an image.');
      closePhotoCropper();
    };
    cropImage.src = cropImageUrl;
  };

  function getCropGeometry() {
    const canvas = document.getElementById('photo-crop-canvas');
    const scale = Math.max(canvas.width / cropImage.naturalWidth, canvas.height / cropImage.naturalHeight) * cropZoom;
    return { canvas, width: cropImage.naturalWidth * scale, height: cropImage.naturalHeight * scale };
  }

  function centerCropImage() {
    if (!cropImage) return;
    const geometry = getCropGeometry();
    cropOffsetX = (geometry.canvas.width - geometry.width) / 2;
    cropOffsetY = (geometry.canvas.height - geometry.height) / 2;
  }

  function clampCropPosition(geometry) {
    cropOffsetX = Math.min(0, Math.max(geometry.canvas.width - geometry.width, cropOffsetX));
    cropOffsetY = Math.min(0, Math.max(geometry.canvas.height - geometry.height, cropOffsetY));
  }

  function renderCropPreview() {
    if (!cropImage) return;
    const geometry = getCropGeometry();
    clampCropPosition(geometry);
    const context = geometry.canvas.getContext('2d');
    context.clearRect(0, 0, geometry.canvas.width, geometry.canvas.height);
    context.drawImage(cropImage, cropOffsetX, cropOffsetY, geometry.width, geometry.height);
  }

  function updateCropZoomLabel() {
    const label = document.getElementById('photo-zoom-value');
    if (label) label.textContent = `${cropZoom.toFixed(1)}×`;
  }

  function closePhotoCropper() {
    const modal = document.getElementById('photo-crop-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    cropImageUrl = null;
    cropImage = null;
    cropDrag = null;
    const input = document.getElementById('profile-photo-file');
    if (input) input.value = '';
  }

  window.cancelPhotoCrop = closePhotoCropper;

  window.applyPhotoCrop = function () {
    const canvas = document.getElementById('photo-crop-canvas');
    canvas.toBlob(blob => {
      if (!blob) {
        alert('Could not create the cropped photo. Please try another image.');
        return;
      }

      pendingProfilePhoto = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
      if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
      pendingPhotoPreviewUrl = URL.createObjectURL(blob);

      const profileImage = document.querySelector('.photo-block img');
      if (profileImage) profileImage.src = pendingPhotoPreviewUrl;
      document.getElementById('photo-draft-status').hidden = false;
      document.getElementById('discard-photo-btn').hidden = false;
      closePhotoCropper();
    }, 'image/jpeg', 0.92);
  };

  window.discardPhotoDraft = function () {
    pendingProfilePhoto = null;
    if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
    pendingPhotoPreviewUrl = null;
    const profileImage = document.querySelector('.photo-block img');
    if (profileImage) profileImage.src = profileImage.dataset.photoUrl;
    document.getElementById('photo-draft-status').hidden = true;
    document.getElementById('discard-photo-btn').hidden = true;
  };

  const cropCanvas = document.getElementById('photo-crop-canvas');
  if (cropCanvas) {
    cropCanvas.addEventListener('pointerdown', event => {
      if (!cropImage) return;
      cropDrag = { x: event.clientX, y: event.clientY };
      cropCanvas.setPointerCapture(event.pointerId);
    });
    cropCanvas.addEventListener('pointermove', event => {
      if (!cropDrag || !cropImage) return;
      const bounds = cropCanvas.getBoundingClientRect();
      cropOffsetX += (event.clientX - cropDrag.x) * (cropCanvas.width / bounds.width);
      cropOffsetY += (event.clientY - cropDrag.y) * (cropCanvas.height / bounds.height);
      cropDrag = { x: event.clientX, y: event.clientY };
      renderCropPreview();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(eventName => {
      cropCanvas.addEventListener(eventName, () => { cropDrag = null; });
    });
  }

  const photoZoomSlider = document.getElementById('photo-zoom');
  if (photoZoomSlider) {
    photoZoomSlider.addEventListener('input', () => {
      cropZoom = parseFloat(photoZoomSlider.value);
      updateCropZoomLabel();
      centerCropImage();
      renderCropPreview();
    });
  }

  const cropModal = document.getElementById('photo-crop-modal');
  if (cropModal) {
    cropModal.addEventListener('click', event => {
      if (event.target === cropModal) closePhotoCropper();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && cropModal.classList.contains('active')) closePhotoCropper();
    });
  }

  // Set up hidden access triggers
  function initAdminTriggers() {
    // 1. Keyboard Shortcut: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openLoginModal();
      }
    });

    // 2. Double-Click Photo/Initials Badge
    const photoName = document.querySelector('.photo-name') || document.querySelector('.photo-block');
    if (photoName) {
      photoName.addEventListener('dblclick', () => {
        openLoginModal();
      });
    }

    // 3. Hidden Footer Click Trigger
    const triggerDots = document.querySelectorAll('.hidden-admin-trigger');
    triggerDots.forEach(dot => {
      dot.addEventListener('click', () => {
        openLoginModal();
      });
    });
  }

  // Open Login Modal
  window.openLoginModal = function () {
    if (isAdminLoggedIn) {
      alert('You are already logged in as Admin.');
      return;
    }
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('admin-username')?.focus();
    }
  };

  window.closeLoginModal = function () {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // Login Submit Handler
  window.handleAdminLogin = async function (e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    const errorMsg = document.getElementById('admin-login-error');

    if (errorMsg) errorMsg.style.display = 'none';

    try {
      const res = await fetch('/Admin/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value
        })
      });
      const result = await res.json();

      if (result.success) {
        closeLoginModal();
        usernameInput.value = '';
        passwordInput.value = '';
        setAdminLoggedIn(true);
      } else {
        if (errorMsg) {
          errorMsg.textContent = result.message || 'Invalid credentials.';
          errorMsg.style.display = 'block';
        }
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Server error during login.';
        errorMsg.style.display = 'block';
      }
    }
  };

  // Toggle Admin Mode State
  function setAdminLoggedIn(loggedIn) {
    isAdminLoggedIn = loggedIn;
    const adminBar = document.getElementById('admin-bar');

    if (loggedIn) {
      document.body.classList.add('admin-mode-active');
      document.body.classList.add('admin-editing');
      if (adminBar) adminBar.style.display = 'flex';
      makeElementsEditable();
    } else {
      document.body.classList.remove('admin-mode-active');
      document.body.classList.remove('admin-editing');
      if (adminBar) adminBar.style.display = 'none';
      makeElementsReadOnly();
    }
  }

  // Logout Handler
  window.handleAdminLogout = async function () {
    try {
      await fetch('/Admin/Logout', { method: 'POST' });
    } catch (err) { }
    setAdminLoggedIn(false);
    window.location.reload();
  };

  // Enable content editable attributes
  function makeElementsEditable() {
    const editables = document.querySelectorAll('[data-editable]');
    editables.forEach(el => {
      el.setAttribute('contenteditable', 'true');
    });
  }

  function makeElementsReadOnly() {
    const editables = document.querySelectorAll('[data-editable]');
    editables.forEach(el => {
      el.removeAttribute('contenteditable');
    });
  }

  // Extract model data from DOM
  function collectResumeModelFromDOM() {
    const state = window.resumeState || {};
    state.SelectedTemplate = document.documentElement.getAttribute('data-template') || 'amber-dark';

    // 1. Profile
    state.Profile = state.Profile || {};
    state.Profile.Name = getDOMText('[data-profile="Name"]') || state.Profile.Name;
    state.Profile.Title = getDOMText('[data-profile="Title"]') || state.Profile.Title;
    state.Profile.Bio = getDOMText('[data-profile="Bio"]') || state.Profile.Bio;
    state.Profile.Email = getDOMText('[data-profile="Email"]') || state.Profile.Email;
    state.Profile.Phone = getDOMText('[data-profile="Phone"]') || state.Profile.Phone;
    state.Profile.Location = getDOMText('[data-profile="Location"]') || state.Profile.Location;
    state.Profile.LinkedIn = getDOMText('[data-profile="LinkedIn"]') || state.Profile.LinkedIn;
    const profileImage = document.querySelector('.photo-block img');
    state.Profile.PhotoUrl = (profileImage && profileImage.dataset.photoUrl) || state.Profile.PhotoUrl || '/image/Profile.jpeg';

    // 2. Experiences
    const expNodes = document.querySelectorAll('.exp-entry');
    const experiences = [];
    expNodes.forEach((node, idx) => {
      const company = getDOMTextIn(node, '[data-exp="Company"]');
      const role = getDOMTextIn(node, '[data-exp="Role"]');
      const period = getDOMTextIn(node, '[data-exp="Period"]');
      const type = getDOMTextIn(node, '[data-exp="EmploymentType"]');

      const bulletNodes = node.querySelectorAll('.exp-bullets li');
      const bullets = [];
      bulletNodes.forEach(bNode => {
        const text = bNode.innerText.trim();
        if (text) bullets.push(text);
      });

      experiences.push({
        Id: node.dataset.id || `exp_${idx + 1}`,
        Company: company,
        Role: role,
        Period: period,
        EmploymentType: type,
        Bullets: bullets
      });
    });
    if (experiences.length > 0) state.Experiences = experiences;

    // 3. Skill Groups
    const groupNodes = document.querySelectorAll('.s-section[data-skill-group]');
    const skillGroups = [];
    groupNodes.forEach((gNode, gIdx) => {
      const category = getDOMTextIn(gNode, '[data-sg="Category"]');
      const skillNodes = gNode.querySelectorAll('.skill-bar-item, .skill-chip-item');
      const skills = [];
      skillNodes.forEach((sNode, sIdx) => {
        const sName = getDOMTextIn(sNode, '[data-skill="Name"]');
        const isPrimary = sNode.classList.contains('primary-skill');
        const percent = parseInt(sNode.dataset.percent || '80', 10);
        if (sName) {
          skills.push({
            Id: sNode.dataset.id || `s_${gIdx + 1}_${sIdx + 1}`,
            Name: sName,
            IsPrimary: isPrimary,
            Percent: percent
          });
        }
      });
      if (category) {
        skillGroups.push({
          Id: gNode.dataset.id || `sg_${gIdx + 1}`,
          Category: category,
          Skills: skills
        });
      }
    });
    if (skillGroups.length > 0) state.SkillGroups = skillGroups;

    // 4. Projects
    const projNodes = document.querySelectorAll('.proj-card');
    const projects = [];
    projNodes.forEach((pNode, pIdx) => {
      const title = getDOMTextIn(pNode, '[data-proj="Title"]');
      const desc = getDOMTextIn(pNode, '[data-proj="Description"]');
      const techPills = pNode.querySelectorAll('.proj-tag, .tech-pill');
      const techs = [];
      techPills.forEach(tPill => {
        const t = tPill.innerText.trim();
        if (t && t !== '+ TECH') techs.push(t);
      });

      if (title) {
        projects.push({
          Id: pNode.dataset.id || `proj_${pIdx + 1}`,
          Title: title,
          Description: desc,
          Technologies: techs
        });
      }
    });
    if (projects.length > 0) state.Projects = projects;

    // 5. Education
    const eduNodes = document.querySelectorAll('.edu-item');
    const educations = [];
    eduNodes.forEach((eNode, eIdx) => {
      const degree = getDOMTextIn(eNode, '[data-edu="Degree"]');
      const inst = getDOMTextIn(eNode, '[data-edu="Institution"]');
      const year = getDOMTextIn(eNode, '[data-edu="Year"]');
      if (degree) {
        educations.push({
          Id: eNode.dataset.id || `edu_${eIdx + 1}`,
          Degree: degree,
          Institution: inst,
          Year: year
        });
      }
    });
    if (educations.length > 0) state.Educations = educations;

    // 6. Certifications
    const certNodes = document.querySelectorAll('.cert-item');
    const certs = [];
    certNodes.forEach((cNode, cIdx) => {
      const name = getDOMTextIn(cNode, '[data-cert="Name"]');
      const issuer = getDOMTextIn(cNode, '[data-cert="Issuer"]');
      const year = getDOMTextIn(cNode, '[data-cert="Year"]');
      const url = cNode.dataset.url || '';
      if (name) {
        certs.push({
          Id: cNode.dataset.id || `cert_${cIdx + 1}`,
          Name: name,
          Issuer: issuer,
          Year: year,
          CertificateUrl: url
        });
      }
    });
    if (certs.length > 0) state.Certifications = certs;

    return state;
  }

  function getDOMText(selector) {
    const el = document.querySelector(selector);
    return el ? el.innerText.trim() : '';
  }

  function getDOMTextIn(parent, selector) {
    const el = parent.querySelector(selector);
    return el ? el.innerText.trim() : '';
  }

  // Save All Changes back to Server
  window.saveAllResumeData = async function () {
    const saveBtn = document.getElementById('admin-save-btn');
    if (saveBtn) {
      saveBtn.innerText = '⏳ Saving...';
      saveBtn.disabled = true;
    }

    try {
      const modelPayload = collectResumeModelFromDOM();
      let res;
      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append('model', JSON.stringify(modelPayload));
        formData.append('photo', pendingProfilePhoto, 'profile-photo.jpg');
        res = await fetch('/Admin/SaveAllWithPhoto', { method: 'POST', body: formData });
      } else {
        res = await fetch('/Admin/UpdateData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modelPayload)
        });
      }
      const data = await res.json();

      if (data.success) {
        const lastUpdatedEl = document.getElementById('last-updated-time');
        if (lastUpdatedEl && data.lastUpdated) {
          lastUpdatedEl.textContent = data.lastUpdated;
        }
        if (data.photoUrl) {
          const profileImage = document.querySelector('.photo-block img');
          if (profileImage) {
            profileImage.dataset.photoUrl = data.photoUrl;
            profileImage.src = `${data.photoUrl}?v=${Date.now()}`;
          }
          pendingProfilePhoto = null;
          if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
          pendingPhotoPreviewUrl = null;
          document.getElementById('photo-draft-status').hidden = true;
          document.getElementById('discard-photo-btn').hidden = true;
        }
        alert('✅ Resume updated successfully! All changes & template settings saved.');
      } else {
        alert('❌ Save failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error saving changes. Please try again.');
    } finally {
      if (saveBtn) {
        saveBtn.innerText = '💾 Save All Changes';
        saveBtn.disabled = false;
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     DYNAMIC ACTION METHODS (ADD / DELETE / REORDER)
     ═══════════════════════════════════════════════════════════════════════════ */

  window.moveItemUp = function (button) {
    const item = button.closest('.exp-entry, .proj-card, .edu-item, .cert-item, .skill-bar-item, .s-section[data-skill-group]');
    if (item && item.previousElementSibling) {
      item.parentNode.insertBefore(item, item.previousElementSibling);
      reindexProjects();
    }
  };

  window.moveItemDown = function (button) {
    const item = button.closest('.exp-entry, .proj-card, .edu-item, .cert-item, .skill-bar-item, .s-section[data-skill-group]');
    if (item && item.nextElementSibling) {
      item.parentNode.insertBefore(item.nextElementSibling, item);
      reindexProjects();
    }
  };

  window.deleteItem = function (button) {
    if (confirm('Are you sure you want to delete this item?')) {
      const item = button.closest('.exp-entry, .proj-card, .edu-item, .cert-item, .skill-bar-item, .exp-bullet-item, .s-section[data-skill-group]');
      if (item) {
        item.remove();
        reindexProjects();
      }
    }
  };

  function reindexProjects() {
    const projCards = document.querySelectorAll('.proj-card');
    projCards.forEach((card, idx) => {
      const indexSpan = card.querySelector('.proj-index span');
      if (indexSpan) {
        const num = (idx + 1).toString().padStart(2, '0');
        indexSpan.innerText = num;
      }
    });
  }

  // Add Project with proper grid layout (proj-index + proj-body)
  window.addNewProject = function () {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const currentCount = container.querySelectorAll('.proj-card').length + 1;
    const numStr = currentCount.toString().padStart(2, '0');

    const newProj = document.createElement('div');
    newProj.className = 'proj-card';
    newProj.dataset.id = 'proj_' + Date.now();
    newProj.innerHTML = `
      <div class="proj-index">
        <span>${numStr}</span>
      </div>
      <div class="proj-body">
        <div class="proj-title" data-editable="true" data-proj="Title">New Project Title</div>
        <div class="proj-desc" data-editable="true" data-proj="Description">Highlight project features, business value, and technical implementation.</div>
        <div class="proj-tags">
          <span class="proj-tag" data-editable="true">C#</span>
          <span class="proj-tag" data-editable="true">ASP.NET</span>
          <button class="btn-icon-action edit-controls" onclick="addTechToProj(this)">+ Tech</button>
        </div>
        <div class="edit-controls">
          <button class="btn-icon-action" onclick="moveItemUp(this)">▲ Move Up</button>
          <button class="btn-icon-action" onclick="moveItemDown(this)">▼ Move Down</button>
          <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Project</button>
        </div>
      </div>
    `;

    container.appendChild(newProj);
    makeElementsEditable();
    reindexProjects();
    newProj.scrollIntoView({ behavior: 'smooth' });
  };

  window.addTechToProj = function (button) {
    const techContainer = button.closest('.proj-tags');
    const newSpan = document.createElement('span');
    newSpan.className = 'proj-tag';
    newSpan.setAttribute('data-editable', 'true');
    newSpan.innerText = 'NewTech';
    techContainer.insertBefore(newSpan, button);
    makeElementsEditable();
  };

  // Add Experience Entry
  window.addNewExperience = function () {
    const container = document.getElementById('experiences-container');
    if (!container) return;

    const newExp = document.createElement('div');
    newExp.className = 'exp-entry';
    newExp.dataset.id = 'exp_' + Date.now();
    newExp.innerHTML = `
      <div class="exp-header">
        <div>
          <div class="exp-co" data-editable="true" data-exp="Company">New Company</div>
          <div class="exp-role-title" data-editable="true" data-exp="Role">New Role</div>
        </div>
        <div class="exp-period-badge" data-editable="true" data-exp="Period">Jan 2026 – Present</div>
      </div>
      <div class="exp-type-pill" data-editable="true" data-exp="EmploymentType">Full-time · HYD</div>
      <ul class="exp-bullets">
        <li class="exp-bullet-item">
          <span data-editable="true">Click to edit bullet point detail...</span>
          <div class="edit-controls">
            <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Bullet</button>
          </div>
        </li>
      </ul>
      <button class="btn-icon-action btn-add-section" onclick="addBulletToExp(this)">+ Add Bullet</button>
      <div class="edit-controls">
        <button class="btn-icon-action" onclick="moveItemUp(this)">▲ Move Up</button>
        <button class="btn-icon-action" onclick="moveItemDown(this)">▼ Move Down</button>
        <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Experience</button>
      </div>
    `;

    container.appendChild(newExp);
    makeElementsEditable();
    newExp.scrollIntoView({ behavior: 'smooth' });
  };

  // Add Bullet to Experience
  window.addBulletToExp = function (button) {
    const expEntry = button.closest('.exp-entry');
    const ul = expEntry.querySelector('.exp-bullets');
    if (!ul) return;

    const li = document.createElement('li');
    li.className = 'exp-bullet-item';
    li.innerHTML = `
      <span data-editable="true">New bullet point detail...</span>
      <div class="edit-controls">
        <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Bullet</button>
      </div>
    `;
    ul.appendChild(li);
    makeElementsEditable();
  };

  // Add Education
  window.addNewEducation = function () {
    const container = document.getElementById('education-container');
    if (!container) return;

    const newEdu = document.createElement('div');
    newEdu.className = 'edu-item';
    newEdu.style.marginBottom = '0.8rem';
    newEdu.dataset.id = 'edu_' + Date.now();
    newEdu.innerHTML = `
      <div style="color:var(--text);font-size:0.7rem;margin-bottom:0.1rem;" data-editable="true" data-edu="Degree">New Degree / Qualification</div>
      <div style="color:var(--text-3);font-size:0.65rem;" data-editable="true" data-edu="Institution">Institution Name · <span data-edu="Year">2023–2025</span></div>
      <div class="edit-controls">
        <button class="btn-icon-action" onclick="moveItemUp(this)">▲ Move Up</button>
        <button class="btn-icon-action" onclick="moveItemDown(this)">▼ Move Down</button>
        <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Education</button>
      </div>
    `;

    container.appendChild(newEdu);
    makeElementsEditable();
  };

  // Add Certification
  window.addNewCertification = function () {
    const container = document.getElementById('certifications-container');
    if (!container) return;

    const newCert = document.createElement('div');
    newCert.className = 'cert-item';
    newCert.style.marginBottom = '0.8rem';
    newCert.dataset.id = 'cert_' + Date.now();
    newCert.innerHTML = `
      <div style="color:var(--text);font-size:0.75rem;" data-editable="true" data-cert="Name">New Certification Name</div>
      <div style="color:var(--text-3);font-size:0.65rem;" data-editable="true" data-cert="Issuer">Issuer · <span data-cert="Year">2026</span></div>
      <div class="edit-controls">
        <button class="btn-icon-action" onclick="moveItemUp(this)">▲ Move Up</button>
        <button class="btn-icon-action" onclick="moveItemDown(this)">▼ Move Down</button>
        <button class="btn-icon-action delete" onclick="deleteItem(this)">🗑 Delete Certification</button>
      </div>
    `;

    container.appendChild(newCert);
    makeElementsEditable();
  };

})();
