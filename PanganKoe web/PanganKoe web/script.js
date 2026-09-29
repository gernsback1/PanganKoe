/**
 * PANGAN KOE WEB - Application Logic & Dynamic Flow Controller
 * 
 * Includes:
 * 1. Splash Screen & Web Onboarding
 * 2. Robust Password Eye Show/Hide Toggle (Fixed & Error-Proof)
 * 3. Auth Modal (Sign In & Sign Up) with Database Ready Hooks
 * 4. Post-Auth Onboarding & Profile Setup Wizard (5 Steps):
 *    - Step 1: Anggota Keluarga (Personal / Family Multi-Member Builder)
 *    - Step 2: Preferensi Makanan & Alergen
 *    - Step 3: Plafon Budget Mingguan (Min Rp 300.000 - Max Rp 2.000.000)
 *    - Step 4: Kebutuhan Gizi & Biometrik Fisik Tubuh (AKG Live Calculator)
 *    - Step 5: Kustomisasi Profil (Upload Foto / Avatar Katalog, Nama, Bio, Lokasi)
 * 5. Dynamic Dashboard Synchronization & Persistence (localStorage)
 * 6. Interactive Meal Planner, Grocery Calculator & WhatsApp Vendor Connector
 */

/* ================= CENTRAL APPLICATION STATE ================= */
const appState = {
  user: {
    name: "Ibu Ratna S.",
    role: "Ibu Rumah Tangga",
    email: "ratna@gmail.com",
    avatar: "", // Image DataURL or Emoji/Initial
    avatarType: "initial", // 'upload', 'preset', 'initial'
    bio: "Pengelola dapur keluarga bahagia, fokus gizi seimbang balita & belanja hemat ke warung lokal.",
    location: "Kecamatan Kebon Jeruk, Jakarta Barat (Radius < 500m)"
  },
  family: {
    mode: "family", // "single" or "family"
    members: [
      { id: 1, name: "Ibu Ratna", role: "Ibu", note: "Ibu Menyusui (Nutrisi Lengkap)" },
      { id: 2, name: "Pak Hendra", role: "Ayah", note: "Pekerja Aktif" },
      { id: 3, name: "Dedek Alif", role: "Balita", note: "Pencegahan Stunting & MPASI" }
    ],
    hasToddler: true,
    hasPregnant: false,
    hasElderly: false
  },
  preferences: {
    cuisines: ["nusantara", "rumahan", "high_protein", "sayuran"],
    allergies: ["halal", "kids"]
  },
  budget: {
    weekly: 500000,
    daily: 71400,
    isValid: true
  },
  nutrition: {
    height: 160,
    weight: 55,
    age: 28,
    gender: "female",
    activity: "moderate",
    calories: 2150,
    protein: 68,
    iron: 18,
    fiber: 28,
    omega3: "Tinggi"
  }
};

let currentPrefStep = 1;
let memberCounter = 3;

document.addEventListener('DOMContentLoaded', () => {
  initWebSplash();
  initPasswordMeter();
  loadSavedUserData();
  calculateAKGTargets();
  updateBudgetEstimations(appState.budget.weekly);
});

/* ================= 1. WEB SPLASH SCREEN LOGIC ================= */
function initWebSplash() {
  const splashOverlay = document.getElementById('web-splash');
  const progressBar = document.getElementById('splash-progress-bar');
  const statusText = document.getElementById('splash-status-text');
  const btnSkip = document.getElementById('btn-skip-splash');

  let progress = 0;
  const statuses = [
    "Memuat sistem dapur sehat...",
    "Menyiapkan modul Gizi AKG...",
    "Mengkoneksikan mitra UMKM...",
    "Siap!"
  ];

  const interval = setInterval(() => {
    progress += 2;
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (progress === 30 && statusText) statusText.textContent = statuses[1];
    if (progress === 70 && statusText) statusText.textContent = statuses[2];
    if (progress >= 100) {
      clearInterval(interval);
      if (statusText) statusText.textContent = statuses[3];
      setTimeout(hideSplash, 350);
    }
  }, 30);

  btnSkip?.addEventListener('click', () => {
    clearInterval(interval);
    hideSplash();
  });

  function hideSplash() {
    if (splashOverlay) {
      splashOverlay.classList.remove('active');
    }
  }
}

/* ================= 2. ONBOARDING WEB TAB SHOWCASE ================= */
function selectWebTab(index) {
  const tabs = document.querySelectorAll('.onboarding-tabs-nav .tab-item');
  const panels = document.querySelectorAll('.onboarding-display-panel .panel-content');

  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });

  panels.forEach((panel, i) => {
    panel.classList.toggle('active', i === index);
  });
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ================= 3. AUTH MODAL & TAB SWITCHING ================= */
function openAuthModal(tab = 'signin') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('active');
    switchModalAuthTab(tab);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function switchModalAuthTab(tab) {
  const tabSignIn = document.getElementById('modal-tab-signin');
  const tabSignUp = document.getElementById('modal-tab-signup');
  const formSignIn = document.getElementById('web-form-signin');
  const formSignUp = document.getElementById('web-form-signup');

  if (tab === 'signin') {
    tabSignIn?.classList.add('active');
    tabSignUp?.classList.remove('active');

    formSignIn?.classList.add('active');
    formSignUp?.classList.remove('active');
  } else {
    tabSignUp?.classList.add('active');
    tabSignIn?.classList.remove('active');

    formSignUp?.classList.add('active');
    formSignIn?.classList.remove('active');
  }
}

/* ================= 4. PASSWORD VISIBILITY TOGGLE (FIXED BUG) ================= */
/**
 * Error-proof show/hide password toggle.
 * Works seamlessly with icons, SVGs, or buttons.
 */
function toggleWebPassword(inputId, triggerBtn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // Find icon inside button or parent
  const icon = triggerBtn.querySelector('i') || triggerBtn.querySelector('svg') || (triggerBtn.tagName === 'I' ? triggerBtn : null);

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  if (icon) {
    if (isPassword) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}

function initPasswordMeter() {
  const passInput = document.getElementById('signup-pass');
  const barFill = document.getElementById('meter-bar-fill');
  const meterText = document.getElementById('meter-text');

  passInput?.addEventListener('input', (e) => {
    const val = e.target.value;
    let score = 0;

    if (val.length >= 8) score += 30;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 25;
    if (/[^A-Za-z0-9]/.test(val)) score += 25;

    if (barFill && meterText) {
      if (val.length === 0) {
        barFill.style.width = '0%';
        meterText.textContent = 'Kekuatan kata sandi';
        meterText.style.color = 'var(--slate-500)';
      } else if (score < 40) {
        barFill.style.width = '33%';
        barFill.style.backgroundColor = '#EF4444';
        meterText.textContent = 'Sandi Lemah';
        meterText.style.color = '#EF4444';
      } else if (score < 75) {
        barFill.style.width = '66%';
        barFill.style.backgroundColor = '#F59E0B';
        meterText.textContent = 'Sandi Sedang';
        meterText.style.color = '#F59E0B';
      } else {
        barFill.style.width = '100%';
        barFill.style.backgroundColor = '#10B981';
        meterText.textContent = 'Sandi Sangat Kuat & Aman';
        meterText.style.color = '#10B981';
      }
    }
  });
}

/* ================= 5. POST-AUTH FLOW (LOGIN & SIGNUP TO WIZARD) ================= */

/**
 * Handle Sign In
 */
async function handleWebSignIn(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const identity = formData.get('account_identity');

  showWebToast('Memverifikasi akun PanganKoe...');

  try {
    const response = await fetch('login.php', { method: 'POST', body: formData });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        showWebToast(result.message || 'Masuk berhasil! Silakan periksa preferensi dapur Anda.', 'success');
        appState.user.name = result.user_name || identity;
        appState.user.role = result.user_role || 'Ibu Rumah Tangga';
        closeAuthModal();
        setTimeout(() => openPreferenceSetupModal(true), 600);
        return;
      } else {
        showWebToast(result.message || 'Gagal masuk. Periksa kembali kredensial Anda.', 'error');
        return;
      }
    }
  } catch (err) {
    console.log('PHP server status: Standalone Web Mode');
  }

  // Standalone Demo Mode Fallback
  setTimeout(() => {
    showWebToast(`Selamat datang kembali, ${identity}!`, 'success');
    appState.user.name = identity.includes('@') ? identity.split('@')[0] : identity;
    closeAuthModal();
    setTimeout(() => openPreferenceSetupModal(true), 600);
  }, 600);
}

/**
 * Handle Sign Up -> Direct to 5-Step Preference Setup Wizard
 */
async function handleWebSignUp(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const fullName = formData.get('full_name');
  const roleSelect = document.getElementById('signup-role');
  const roleText = roleSelect?.options[roleSelect.selectedIndex]?.text || 'Ibu Rumah Tangga';

  showWebToast('Mendaftarkan akun baru...');

  try {
    const response = await fetch('register.php', { method: 'POST', body: formData });
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        showWebToast('Pendaftaran sukses! Mari lengkapi preferensi & gizi dapur Anda.', 'success');
        appState.user.name = result.user_name || fullName;
        appState.user.role = result.user_role || roleText;
        closeAuthModal();
        setTimeout(() => openPreferenceSetupModal(true), 600);
        return;
      } else {
        showWebToast(result.message || 'Gagal mendaftar. Silakan periksa data Anda.', 'error');
        return;
      }
    }
  } catch (err) {
    console.log('PHP server status: Standalone Web Mode');
  }

  // Standalone Demo Mode Fallback
  setTimeout(() => {
    showWebToast(`Akun ${fullName} terdaftar! Mari atur preferensi dapur Anda.`, 'success');
    appState.user.name = fullName;
    appState.user.role = roleText;
    closeAuthModal();
    setTimeout(() => openPreferenceSetupModal(true), 600);
  }, 600);
}

/* ================= 6. ONBOARDING & PREFERENCE WIZARD (5 STEPS) ================= */

function openPreferenceSetupModal(isPostAuth = false) {
  const modal = document.getElementById('preference-setup-modal');
  if (!modal) return;

  // Pre-fill name and bio from state
  const nameInput = document.getElementById('pref-user-name');
  const bioInput = document.getElementById('pref-user-bio');
  const locInput = document.getElementById('pref-user-location');

  if (nameInput) nameInput.value = appState.user.name;
  if (bioInput) bioInput.value = appState.user.bio;
  if (locInput) locInput.value = appState.user.location;

  updateAvatarPreviewUI();
  jumpToPrefStep(1);

  modal.classList.add('active');
}

function closePreferenceSetupModal() {
  const modal = document.getElementById('preference-setup-modal');
  if (modal) modal.classList.remove('active');
}

function jumpToPrefStep(stepNum) {
  if (stepNum < 1 || stepNum > 5) return;
  currentPrefStep = stepNum;

  // Update step indicators
  for (let i = 1; i <= 5; i++) {
    const ind = document.getElementById(`wiz-step-${i}`);
    const card = document.getElementById(`pref-step-card-${i}`);

    if (ind) {
      ind.classList.toggle('active', i === stepNum);
      ind.classList.toggle('completed', i < stepNum);
    }
    if (card) {
      card.classList.toggle('active', i === stepNum);
    }
  }

  // Scroll wizard body to top
  const body = document.querySelector('.pref-wizard-body');
  if (body) body.scrollTop = 0;
}

function nextPrefStep(stepNum) {
  // If moving from Step 3 (Budget), validate budget range first
  if (currentPrefStep === 3 && stepNum > 3) {
    if (!appState.budget.isValid) {
      showWebToast('Anggaran harus berada di antara Rp 300.000 dan Rp 2.000.000!', 'error');
      const input = document.getElementById('pref-budget-input');
      input?.focus();
      return;
    }
  }

  jumpToPrefStep(stepNum);
}

/* STEP 1: Family Mode & Member Management */
function handleFamilyModeChange(mode) {
  appState.family.mode = mode;
  const singleCard = document.getElementById('mode-card-single');
  const familyCard = document.getElementById('mode-card-family');
  const builderArea = document.getElementById('family-builder-area');

  if (mode === 'single') {
    singleCard?.classList.add('selected');
    familyCard?.classList.remove('selected');
    if (builderArea) builderArea.style.display = 'none';
  } else {
    familyCard?.classList.add('selected');
    singleCard?.classList.remove('selected');
    if (builderArea) builderArea.style.display = 'block';
  }
  updateBudgetEstimations(appState.budget.weekly);
}

function addNewFamilyMemberRow() {
  memberCounter++;
  const list = document.getElementById('family-members-list');
  if (!list) return;

  const row = document.createElement('div');
  row.className = 'member-item-row';
  row.id = `member-row-${memberCounter}`;
  row.innerHTML = `
    <div class="member-avatar-mini"><i class="fa-solid fa-user"></i></div>
    <input type="text" class="member-input" placeholder="Nama / Panggilan" value="Anggota Baru" required>
    <select class="member-select">
      <option value="Anak" selected>Anak / Remaja</option>
      <option value="Balita">Balita (<5 thn)</option>
      <option value="Ibu">Ibu / Istri</option>
      <option value="Ayah">Ayah / Suami</option>
      <option value="Lansia">Lansia</option>
    </select>
    <input type="text" class="member-input" placeholder="Catatan Khusus" value="Gizi Sehat Standar">
    <button type="button" class="btn-del-member" onclick="removeFamilyMemberRow('member-row-${memberCounter}')" title="Hapus Anggota">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;
  list.appendChild(row);
  updateBudgetEstimations(appState.budget.weekly);
  showWebToast('Anggota keluarga baru ditambahkan.');
}

function removeFamilyMemberRow(rowId) {
  const row = document.getElementById(rowId);
  const allRows = document.querySelectorAll('.member-item-row');
  if (allRows.length <= 1) {
    showWebToast('Minimal harus ada 1 profil anggota keluarga!', 'error');
    return;
  }
  if (row) {
    row.remove();
    updateBudgetEstimations(appState.budget.weekly);
    showWebToast('Anggota keluarga dihapus.');
  }
}

/* STEP 3: Budget Setting & Live Validation (Rp 300.000 - Rp 2.000.000) */
function handleBudgetInputChange(inputEl) {
  let rawVal = inputEl.value.replace(/[^0-9]/g, '');
  let numVal = parseInt(rawVal, 10) || 0;

  // Format with thousand separators
  inputEl.value = numVal > 0 ? numVal.toLocaleString('id-ID') : '';

  validateAndApplyBudget(numVal, inputEl);
}

function selectBudgetPreset(amount) {
  const input = document.getElementById('pref-budget-input');
  if (input) {
    input.value = amount.toLocaleString('id-ID');
    validateAndApplyBudget(amount, input);
  }

  // Update preset active button
  const presetBtns = document.querySelectorAll('.btn-preset-chip');
  presetBtns.forEach(btn => {
    const btnVal = parseInt(btn.textContent.replace(/[^0-9]/g, ''), 10);
    btn.classList.toggle('active', btnVal === amount);
  });
}

function validateAndApplyBudget(numVal, inputEl) {
  const feedbackEl = document.getElementById('budget-status-feedback');
  const feedbackText = document.getElementById('budget-feedback-text');

  const MIN_BUDGET = 300000;
  const MAX_BUDGET = 2000000;

  if (numVal < MIN_BUDGET) {
    appState.budget.isValid = false;
    inputEl.classList.add('input-error');
    if (feedbackEl && feedbackText) {
      feedbackEl.className = 'budget-status-msg invalid';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>Minimal anggaran adalah Rp 300.000/minggu untuk kecukupan nutrisi AKG.</span>`;
    }
  } else if (numVal > MAX_BUDGET) {
    appState.budget.isValid = false;
    inputEl.classList.add('input-error');
    if (feedbackEl && feedbackText) {
      feedbackEl.className = 'budget-status-msg invalid';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>Maksimal batas anggaran mingguan yang diizinkan adalah Rp 2.000.000.</span>`;
    }
  } else {
    appState.budget.isValid = true;
    appState.budget.weekly = numVal;
    inputEl.classList.remove('input-error');
    if (feedbackEl && feedbackText) {
      feedbackEl.className = 'budget-status-msg valid';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Anggaran valid & seimbang untuk kebutuhan gizi keluarga Anda.</span>`;
    }
  }

  updateBudgetEstimations(numVal);
}

function updateBudgetEstimations(weeklyAmount) {
  const dailyEl = document.getElementById('est-daily-budget');
  const mealPortionEl = document.getElementById('est-meal-portion');

  const daily = Math.round(weeklyAmount / 7);
  appState.budget.daily = daily;

  // Calculate total members
  let totalMembers = 1;
  if (appState.family.mode === 'family') {
    const rows = document.querySelectorAll('.member-item-row');
    totalMembers = rows.length > 0 ? rows.length : 3;
  }

  const portionPrice = Math.round(daily / (totalMembers * 3));

  if (dailyEl) dailyEl.textContent = `Rp ${daily.toLocaleString('id-ID')} / hari`;
  if (mealPortionEl) mealPortionEl.textContent = `~Rp ${portionPrice.toLocaleString('id-ID')} / porsi (${totalMembers} orang)`;
}

/* STEP 4: Biometric & Live Nutrition AKG Calculation */
function calculateAKGTargets() {
  const height = parseFloat(document.getElementById('pref-height')?.value) || 160;
  const weight = parseFloat(document.getElementById('pref-weight')?.value) || 55;
  const age = parseFloat(document.getElementById('pref-age')?.value) || 28;
  const gender = document.getElementById('pref-gender')?.value || 'female';
  const activity = document.querySelector('input[name="activity_level"]:checked')?.value || 'moderate';

  // Mifflin-St Jeor Equation for BMR
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = gender === 'female' ? bmr - 161 : bmr + 5;

  // Activity multiplier
  let mult = 1.375; // Moderate
  if (activity === 'sedentary') mult = 1.2;
  if (activity === 'active') mult = 1.725;

  const tdee = Math.round(bmr * mult);
  const protein = Math.round(weight * 1.25);
  const iron = gender === 'female' ? 18 : 12;
  const fiber = Math.round(tdee * 0.013);

  appState.nutrition = {
    height, weight, age, gender, activity,
    calories: tdee,
    protein: protein,
    iron: iron,
    fiber: fiber,
    omega3: "Tinggi"
  };

  // Update UI live banner
  const calEl = document.getElementById('akg-calc-calories');
  const proEl = document.getElementById('akg-calc-protein');
  const feEl = document.getElementById('akg-calc-iron');
  const fibEl = document.getElementById('akg-calc-fiber');

  if (calEl) calEl.textContent = `${tdee.toLocaleString('id-ID')} kcal/hari`;
  if (proEl) proEl.textContent = `${protein} g`;
  if (feEl) feEl.textContent = `${iron} mg`;
  if (fibEl) fibEl.textContent = `${fiber} g`;
}

/* STEP 5: Profile Customization (Avatar & Bio) */
function handleAvatarFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showWebToast('Ukuran foto maksimal 2MB!', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    appState.user.avatar = e.target.result;
    appState.user.avatarType = 'upload';
    updateAvatarPreviewUI();
    showWebToast('Foto profil berhasil dimuat!', 'success');
  };
  reader.readAsDataURL(file);
}

function selectPresetAvatar(emoji, btn) {
  appState.user.avatar = emoji;
  appState.user.avatarType = 'preset';

  document.querySelectorAll('.btn-avatar-choice').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  updateAvatarPreviewUI();
}

function updateAvatarPreviewUI() {
  const previewBox = document.getElementById('pref-avatar-preview');
  if (!previewBox) return;

  if (appState.user.avatarType === 'upload' && appState.user.avatar) {
    previewBox.innerHTML = `<img src="${appState.user.avatar}" alt="Foto Profil">`;
  } else if (appState.user.avatarType === 'preset' && appState.user.avatar) {
    previewBox.innerHTML = `<span style="font-size: 2.5rem;">${appState.user.avatar}</span>`;
  } else {
    const initial = (appState.user.name || 'R').charAt(0).toUpperCase();
    previewBox.innerHTML = `<span>${initial}</span>`;
  }
}

/**
 * Save Wizard & Transition to Dashboard
 */
function savePreferenceSetup(event) {
  event.preventDefault();

  if (!appState.budget.isValid) {
    showWebToast('Harap periksa kembali nominal anggaran (Min Rp 300.000 - Max Rp 2.000.000)', 'error');
    jumpToPrefStep(3);
    return;
  }

  // 1. Gather Step 1 (Family)
  const familyMode = document.querySelector('input[name="family_mode"]:checked')?.value || 'family';
  appState.family.mode = familyMode;

  if (familyMode === 'family') {
    const memberRows = document.querySelectorAll('.member-item-row');
    appState.family.members = [];
    memberRows.forEach((row, idx) => {
      const inputs = row.querySelectorAll('.member-input');
      const select = row.querySelector('.member-select');
      appState.family.members.push({
        id: idx + 1,
        name: inputs[0]?.value || `Anggota ${idx + 1}`,
        role: select?.value || 'Anggota',
        note: inputs[1]?.value || ''
      });
    });
  } else {
    appState.family.members = [
      { id: 1, name: appState.user.name, role: "Personal / Sendiri", note: "Porsi Mandiri" }
    ];
  }

  appState.family.hasToddler = !!document.getElementById('pref-has-toddler')?.checked;
  appState.family.hasPregnant = !!document.getElementById('pref-has-pregnant')?.checked;
  appState.family.hasElderly = !!document.getElementById('pref-has-elderly')?.checked;

  // 2. Gather Step 2 (Preferences)
  const cuisineInputs = document.querySelectorAll('input[name="cuisine_pref"]:checked');
  appState.preferences.cuisines = Array.from(cuisineInputs).map(el => el.value);

  const allergyInputs = document.querySelectorAll('input[name="allergy_pref"]:checked');
  appState.preferences.allergies = Array.from(allergyInputs).map(el => el.value);

  // 3. Gather Step 5 (Profile)
  const nameVal = document.getElementById('pref-user-name')?.value.trim();
  const bioVal = document.getElementById('pref-user-bio')?.value.trim();
  const locVal = document.getElementById('pref-user-location')?.value.trim();

  if (nameVal) appState.user.name = nameVal;
  if (bioVal) appState.user.bio = bioVal;
  if (locVal) appState.user.location = locVal;

  // Save to localStorage
  try {
    localStorage.setItem('pangankoe_user_profile', JSON.stringify(appState));
  } catch (e) {
    console.log('Local storage save:', e);
  }

  // Apply to Dashboard UI
  applyStateToDashboard();

  // Close wizard modal and switch to Dashboard
  closePreferenceSetupModal();

  const landingView = document.getElementById('landing-page-view');
  const dashboardView = document.getElementById('dashboard-app-view');

  if (landingView) landingView.classList.remove('active');
  if (dashboardView) dashboardView.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showWebToast(`Profil & Preferensi berhasil disimpan! Selamat datang di Dashboard PanganKoe.`, 'success');
}

/* ================= 7. DYNAMIC DASHBOARD SYNCHRONIZATION ================= */

function applyStateToDashboard() {
  const user = appState.user;
  const budget = appState.budget;
  const nutrition = appState.nutrition;
  const family = appState.family;

  // 1. Sidebar & Topbar
  const nameSide = document.getElementById('dash-user-name-side');
  const nameTopbar = document.getElementById('dash-topbar-name');
  const roleBadge = document.getElementById('dash-user-role-badge');
  const avatarSide = document.getElementById('dash-user-avatar');
  const avatarTop = document.getElementById('dash-topbar-avatar');

  if (nameSide) nameSide.textContent = user.name;
  if (nameTopbar) nameTopbar.textContent = user.name;
  if (roleBadge) roleBadge.textContent = user.role;

  // Render Avatar
  [avatarSide, avatarTop].forEach(avatarEl => {
    if (!avatarEl) return;
    if (user.avatarType === 'upload' && user.avatar) {
      avatarEl.innerHTML = `<img src="${user.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else if (user.avatarType === 'preset' && user.avatar) {
      avatarEl.innerHTML = `<span style="font-size:1.1rem;">${user.avatar}</span>`;
    } else {
      avatarEl.textContent = (user.name || 'R').charAt(0).toUpperCase();
    }
  });

  // 2. Welcome Banner
  const welcomeHeading = document.getElementById('dash-welcome-heading');
  const welcomeSub = document.getElementById('dash-welcome-subtitle');
  const akgNote = document.getElementById('dash-akg-note');

  if (welcomeHeading) welcomeHeading.textContent = `Halo, ${user.name}! 👋`;
  if (welcomeSub) welcomeSub.textContent = user.bio || 'Dapur Anda dalam kondisi sehat, terencana, dan hemat budget.';
  if (akgNote) {
    akgNote.textContent = family.hasToddler
      ? 'Kebutuhan gizi balita (MPASI/Stunting) & keluarga terpenuhi optimal.'
      : 'Kebutuhan gizi harian keluarga terpenuhi seimbang.';
  }

  // 3. Metric Cards
  const calDisplay = document.getElementById('dash-calories-display');
  const budgetDisplay = document.getElementById('dash-budget-display');
  const dailyBudgetSub = document.getElementById('dash-daily-budget-sub');
  const familyDisplay = document.getElementById('dash-family-display');
  const familySub = document.getElementById('dash-family-sub');
  const locationDisplay = document.getElementById('dash-location-display');
  const dailyBudgetTag = document.getElementById('daily-budget-tag');

  if (calDisplay) calDisplay.innerHTML = `${nutrition.calories.toLocaleString('id-ID')} <small>kcal/hari</small>`;
  if (budgetDisplay) budgetDisplay.innerHTML = `Rp ${budget.weekly.toLocaleString('id-ID')} <small>/minggu</small>`;
  if (dailyBudgetSub) dailyBudgetSub.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ~Rp ${budget.daily.toLocaleString('id-ID')} / hari (Hemat & Presisi)`;
  if (dailyBudgetTag) dailyBudgetTag.textContent = `Budget: Rp ${budget.daily.toLocaleString('id-ID')}/hari`;

  const memberCount = family.members.length;
  if (familyDisplay) {
    familyDisplay.innerHTML = `${memberCount} Orang <small>(${family.mode === 'single' ? 'Personal' : 'Keluarga'})</small>`;
  }
  if (familySub) {
    if (family.hasToddler) {
      familySub.innerHTML = `<i class="fa-solid fa-baby"></i> Termasuk Balita (Anti-Stunting)`;
    } else if (family.hasElderly) {
      familySub.innerHTML = `<i class="fa-solid fa-person-cane"></i> Termasuk Lansia (Rendah Gula)`;
    } else {
      familySub.innerHTML = `<i class="fa-solid fa-check"></i> ${memberCount} Porsi Makan Harian`;
    }
  }

  if (locationDisplay) {
    locationDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.location.split('(')[0] || 'Radius < 500m'}`;
  }
}

function loadSavedUserData() {
  try {
    const saved = localStorage.getItem('pangankoe_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(appState, parsed);
      applyStateToDashboard();
    }
  } catch (e) {
    console.log('Load saved user profile:', e);
  }
}

function handleLogout() {
  showWebToast('Berhasil keluar akun.');
  const landingView = document.getElementById('landing-page-view');
  const dashboardView = document.getElementById('dashboard-app-view');

  if (dashboardView) dashboardView.classList.remove('active');
  if (landingView) landingView.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ================= 8. INTERACTIVE DASHBOARD FEATURES ================= */

function switchDashboardTab(tabId, clickedLink = null) {
  const sections = document.querySelectorAll('.dash-tab-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const targetSec = document.getElementById(tabId.replace('#', ''));
  if (targetSec) targetSec.classList.add('active');

  if (clickedLink) {
    const sideLinks = document.querySelectorAll('.side-link');
    sideLinks.forEach(link => link.classList.remove('active'));
    clickedLink.classList.add('active');
  }
}

function toggleGroceryItem(checkbox, price) {
  const totalPriceEl = document.getElementById('grocery-total-price');
  let currentTotal = parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;

  if (checkbox.checked) {
    currentTotal += price;
  } else {
    currentTotal -= price;
  }

  totalPriceEl.textContent = `Rp ${currentTotal.toLocaleString('id-ID')}`;
}

function generateQuickMealPlan() {
  showWebToast('Menyusun rekomendasi menu gizi seimbang baru <30 Dt...', 'info');
  setTimeout(() => {
    showWebToast('Menu mingguan disesuaikan dengan stok warung lokal & standar AKG!', 'success');
  }, 900);
}

function switchDayPlan(btn, dayName) {
  const dayBtns = document.querySelectorAll('.week-days-tabs .day-btn');
  dayBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  showWebToast(`Menampilkan rencana menu hari ${dayName}`);
}

function orderToVendorWA() {
  const totalPrice = document.getElementById('grocery-total-price')?.textContent || 'Rp 17.000';
  const message = encodeURIComponent(`Halo Mitra PanganKoe, saya ingin memesan bahan masakan segar sesuai daftar belanja (${totalPrice}). Mohon dikirimkan ke alamat saya.`);
  window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
}

function orderVendorDirect(vendorName) {
  const message = encodeURIComponent(`Halo ${vendorName}, saya pengguna PanganKoe ingin memesan bahan pangan / masakan sehat harian.`);
  window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
}

function handleSocialAuth(provider) {
  showWebToast(`Autentikasi dengan ${provider}...`);
  setTimeout(() => {
    showWebToast(`Berhasil terhubung dengan ${provider}!`, 'success');
    appState.user.name = `Pengguna ${provider}`;
    openPreferenceSetupModal(true);
  }, 600);
}

function handleForgotPassword(event) {
  event.preventDefault();
  showWebToast('Instruksi reset kata sandi dikirim via WhatsApp/Email.');
}

/* ================= 9. TOAST NOTIFICATION SYSTEM ================= */
let toastTimeout = null;
function showWebToast(message, type = 'info') {
  const toast = document.getElementById('web-toast');
  const toastText = document.getElementById('web-toast-text');
  const toastIcon = toast?.querySelector('.toast-icon');

  if (!toast || !toastText) return;

  toastText.textContent = message;

  if (type === 'success') {
    toastIcon.className = 'toast-icon fa-solid fa-circle-check';
    toastIcon.style.color = '#34D399';
  } else if (type === 'error') {
    toastIcon.className = 'toast-icon fa-solid fa-circle-exclamation';
    toastIcon.style.color = '#EF4444';
  } else {
    toastIcon.className = 'toast-icon fa-solid fa-circle-info';
    toastIcon.style.color = '#6EE7B7';
  }

  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}
