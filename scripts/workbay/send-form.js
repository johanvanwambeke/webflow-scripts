document.addEventListener('DOMContentLoaded', () => {
(function () {
  // ── Config ──
  const DEBUG = /[?&]debug=1/.test(window.location.search);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
  const FETCH_TIMEOUT_MS = 15000;

  // ── DOM references ──
  const form = document.getElementById('job-application-form');
  const uploadInput = document.getElementById('resume');
  const fileName = document.getElementById('file-name');
  const representativeLink = document.querySelector('#representativeEmail');
  const repEmailEl = document.getElementById('repEmail');
  const submitBtn = form?.querySelector('[type="submit"]');
  const wfSuccess = form?.parentNode?.querySelector('.w-form-done');
  const wfFail = form?.parentNode?.querySelector('.w-form-fail');
  const jobTitleEl = document.querySelector('#jobTitle');

  // ── Derived values ──
  const representativeEmail =
    representativeLink?.getAttribute('href')?.replace(/^mailto:/, '') ||
    form?.dataset.fallbackEmail ||
    '';

  // ── Debug diagnostics (gated) ──
  if (DEBUG) {
    const diagnostics = {
      form: !!form,
      uploadInput: !!uploadInput,
      fileName: !!fileName,
      representativeLink: !!representativeLink,
      repEmailEl: !!repEmailEl,
      submitBtn: !!submitBtn,
      wfSuccess: !!wfSuccess,
      wfFail: !!wfFail,
      jobTitleEl: !!jobTitleEl,
      representativeEmail: representativeEmail || '(empty)',
    };
    console.groupCollapsed('Form Setup Diagnostics');
    Object.entries(diagnostics).forEach(([key, value]) => {
      if (value) console.log(`${key} found`, value);
      else console.warn(`Missing: ${key}`);
    });
    console.groupEnd();
  }

  // ── Stop if core elements are missing ──
  if (!form) {
    console.error('Stopping script: <form id="job-application-form"> is required.');
    return;
  }
  if (!submitBtn) {
    console.error('Stopping script: submit button missing inside the form.');
    return;
  }

  // ── Initialize visible rep email ──
  if (repEmailEl) {
    repEmailEl.textContent = representativeEmail;
    repEmailEl.href = representativeEmail ? `mailto:${representativeEmail}` : '';
  }

  // ── State ──
  let isSubmitting = false;

  // ── Helpers ──

  function hideWebflowMessages() {
    if (wfSuccess) wfSuccess.style.display = 'none';
    if (wfFail) wfFail.style.display = 'none';
    form.style.display = '';
  }

  function toggleButton(disabled) {
    submitBtn.disabled = disabled;
    if (disabled) {
      submitBtn.dataset.origText = submitBtn.textContent;
      submitBtn.textContent = 'Versturen…';
    } else if (submitBtn.dataset.origText) {
      submitBtn.textContent = submitBtn.dataset.origText;
    }
  }

  function showWebflowSuccess() {
    if (wfFail) wfFail.style.display = 'none';
    if (wfSuccess) wfSuccess.style.display = 'block';
    form.style.display = 'none';
  }

  function showWebflowError(msg) {
    hideWebflowMessages();
    if (wfFail) {
      const pTag = wfFail.querySelector('p') || wfFail;
      pTag.textContent = msg || 'Er ging iets mis. Probeer het opnieuw.';
      wfFail.style.display = 'block';
      wfFail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.style.display = '';
  }

  function getFileExtension(name) {
    const dot = name.lastIndexOf('.');
    return dot !== -1 ? name.slice(dot).toLowerCase() : '';
  }

  function validateForm() {
    const data = new FormData(form);
    const errors = [];

    // Required text fields
    if (!data.get('voornaam')?.trim()) errors.push('Voornaam is verplicht.');
    if (!data.get('achternaam')?.trim()) errors.push('Achternaam is verplicht.');
    if (!data.get('email')?.trim()) errors.push('E-mailadres is verplicht.');
    if (!data.get('telefoon')?.trim()) errors.push('Telefoonnummer is verplicht.');

    // Email format
    const email = (data.get('email') || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Voer een geldig e-mailadres in.');
    }

    // Phone format (allow +, digits, spaces, dashes, parens — at least 8 digits)
    const phone = (data.get('telefoon') || '').trim();
    if (phone && (phone.replace(/[\s\-()+ ]/g, '').length < 8 || !/^[+\d\s\-()]+$/.test(phone))) {
      errors.push('Voer een geldig telefoonnummer in (minimaal 8 cijfers).');
    }

    // File validation — CV is required
    if (!uploadInput || uploadInput.files.length === 0) {
      errors.push('CV uploaden is verplicht.');
    } else {
      const file = uploadInput.files[0];
      const ext = getFileExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`Alleen ${ALLOWED_EXTENSIONS.join(', ')} bestanden zijn toegestaan.`);
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`Bestand is te groot (max ${MAX_FILE_SIZE / 1024 / 1024} MB).`);
      }
    }

    return errors;
  }

  function getSource() {
    try {
      return localStorage.getItem('bron') || 'Website';
    } catch (_) {
      return 'Website';
    }
  }

  function buildBullhornPayload(rawData) {
    const payload = new FormData();
    payload.append('firstName', rawData.get('voornaam') || '');
    payload.append('lastName', rawData.get('achternaam') || '');
    payload.append('email', rawData.get('email') || '');
    payload.append('phoneNumber', rawData.get('telefoon') || '');
    payload.append('jobOrderId', rawData.get('jobid') || '');
    payload.append('jobTitle', rawData.get('jobName'));
    payload.append('resumeFile', rawData.get('resume'));
    payload.append('functie', rawData.get('functionTitle') || '');
    payload.append('representativeEmail', representativeEmail);
    payload.append('source', getSource());

    if (DEBUG) {
      console.groupCollapsed('Bullhorn payload');
      for (const [key, value] of payload.entries()) console.log(key, value);
      console.groupEnd();
    }

    return payload;
  }

  async function postToBullhorn() {
    const rawFormData = new FormData(form);
    const payload = buildBullhornPayload(rawFormData);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(
        'https://workbay.netlify.app/.netlify/functions/sollicitatie', {
          method: 'POST',
          body: payload,
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (DEBUG) console.error('Netlify function error:', response.status, text);
        return {
          success: false,
          message: 'Er ging iets mis bij het verzenden. Probeer het later opnieuw.',
        };
      }

      if (DEBUG) {
        const text = await response.text().catch(() => '');
        console.log('Server response:', text);
      }

      return { success: true };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return {
          success: false,
          message: 'De server reageert niet. Probeer het later opnieuw.',
        };
      }
      if (DEBUG) console.error('Network error:', err);
      return {
        success: false,
        message: 'Netwerkfout. Controleer je verbinding en probeer opnieuw.',
      };
    }
  }

  // ── Initialize UI ──
  hideWebflowMessages();

  if (uploadInput && fileName) {
    uploadInput.addEventListener('change', () => {
      fileName.textContent =
        uploadInput.files.length > 0 ?
        uploadInput.files[0].name :
        'Geen bestand gekozen';
    });
  }

  // ── Handle Submit ──
  form.addEventListener(
    'submit',
    async function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (isSubmitting) return;
        isSubmitting = true;

        hideWebflowMessages();

        // Client-side validation
        const errors = validateForm();
        if (errors.length > 0) {
          showWebflowError(errors.join(' '));
          isSubmitting = false;
          return;
        }

        toggleButton(true);

        const result = await postToBullhorn();
        if (result.success) {
          showWebflowSuccess();
        } else {
          showWebflowError(result.message);
        }

        toggleButton(false);
        isSubmitting = false;
      },
      true
  );
})();
}); // DOMContentLoaded
