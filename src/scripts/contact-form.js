// Inlined by ContactForm.astro only when EmailJS is configured.
(() => {
  const form = document.getElementById('contact-form');

  if (form) {
    const status = form.querySelector('.status');
    const button = form.querySelector('button[type="submit"]');
    const email = form.dataset.toEmail ?? '';

    const fields = [
      ['cf-name', (v) => (v.trim() ? null : 'Enter your name.')],
      [
        'cf-email',
        (v) =>
          !v.trim() ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Enter an email address like name@example.com.',
      ],
      ['cf-message', (v) => (v.trim() ? null : 'Enter a message.')],
    ];

    const validate = () => {
      let firstBad = null;
      for (const [id, check] of fields) {
        const input = document.getElementById(id);
        const error = document.getElementById(`${id}-error`);
        const message = check(input.value);
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        error.hidden = !message;
        error.textContent = message ?? '';
        if (message && !firstBad) firstBad = input;
      }
      firstBad?.focus();
      return !firstBad;
    };

    const fail = () => {
      status.innerHTML = '';
      status.append(
        'The message couldn’t be sent. Email ',
        Object.assign(document.createElement('a'), { href: `mailto:${email}`, textContent: email }),
        ' directly instead.',
      );
      status.dataset.state = 'error';
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validate()) return;
      const data = new FormData(form);
      button.disabled = true;
      status.dataset.state = '';
      status.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: form.dataset.service,
            template_id: form.dataset.template,
            user_id: form.dataset.key,
            template_params: {
              from_name: String(data.get('from_name')).trim(),
              to_name: form.dataset.toName,
              reply_to: String(data.get('reply_to')).trim(),
              to_email: email,
              message: String(data.get('message')).trim(),
            },
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.textContent = 'Message sent. Abhiram will reply by email.';
        status.dataset.state = 'ok';
      } catch {
        fail();
      } finally {
        button.disabled = false;
      }
    });
  }
})();
