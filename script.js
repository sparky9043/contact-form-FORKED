  <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
    // ── Character counter ──────────────────────────────
    const msgField = document.getElementById('field-message');
    const charCount = document.getElementById('char-count');

    msgField.addEventListener('input', () => {
      const len = msgField.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 450 ? '#e07676' : '#6b5d3f';
    });

    // ── Form validation + submit ───────────────────────
    const form = document.getElementById('contactForm');

    function showError(id, show) {
      document.getElementById(id).classList.toggle('hidden', !show);
    }

    function validateField(id, errId, condition) {
      const field = document.getElementById(id);
      const invalid = !condition(field);
      field.style.borderColor = invalid ? 'rgba(224,118,118,0.5)' : '';
      showError(errId, invalid);
      return !invalid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = validateField('field-name',    'err-name',    f => f.value.trim().length > 0);
      const email   = validateField('field-email',   'err-email',   f => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      const subject = validateField('field-subject', 'err-subject', f => f.value !== '');
      const msg     = validateField('field-message', 'err-message', f => f.value.trim().length >= 10);
      const consent = validateField('field-consent', 'err-consent', f => f.checked);

      if (name && email && subject && msg && consent) {
        const btn = form.querySelector('button[type=submit]');
        const SEND_ICON = 'Send Message <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

        // ── Show loading state ────────────────────────────
        btn.disabled = true;
        btn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Sending…';

        // ── Send to your backend ──────────────────────────
        // 👇 Replace '/api/contact' with your actual endpoint URL
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    document.getElementById('field-name').value.trim(),
            email:   document.getElementById('field-email').value.trim(),
            subject: document.getElementById('field-subject').value,
            message: document.getElementById('field-message').value.trim(),
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Server error: ' + res.status);
          return res.json(); // remove this line if your backend returns no body
        })
        .then(() => {
          // ── Success: clear the form ───────────────────
          form.reset();
          charCount.textContent = '0';

          const toast = document.getElementById('toast');
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 4000);
        })
        .catch(err => {
          // ── Error: show a generic message to the user ──
          console.error('Submission failed:', err);
          const toast = document.getElementById('toast-error');
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 5000);
        })
        .finally(() => {
          // ── Always re-enable the button ───────────────
          btn.disabled = false;
          btn.innerHTML = SEND_ICON;
        });
      }
    });

    // ── Clear error on field change ────────────────────
    ['field-name','field-email','field-subject','field-message','field-consent'].forEac
