import { useState, type ChangeEvent, type FormEvent } from 'react';

const serviceDetails = [
  {
    title: 'Websites',
    description: 'A useful digital storefront gives people a clear view of what you offer and where to go next. Plan the site around the customers you want to reach and the next step you want them to take.',
    points: ['Clear service and location pages', 'Useful calls to action', 'A thoughtful connection between your website, search and advertising']
  },
  {
    title: 'Search engine optimization',
    description: 'Search strategy, technical SEO and content can work together around the way customers discover businesses. Start with the questions people ask and the pages that can answer them.',
    points: ['Technical SEO and site health', 'Search-focused content', 'A clear view of organic search visibility'],
    href: 'https://www.needmomentum.com/search-engine-optimization/',
    linkLabel: 'Visit the search engine optimization page'
  },
  {
    title: 'Local SEO',
    description: 'Help nearby customers understand what you do and where you do it. Local visibility work can include Google Business Profile management, useful location information and relevant content.',
    points: ['Google Business Profile management', 'Consistent location information', 'Content that speaks to nearby customers']
  },
  {
    title: 'Advertising',
    description: 'Bring paid search and social campaigns into the same conversation as the offer, audience and landing page. The plan starts with the business goal, not a promised result.',
    points: ['Campaign and audience planning', 'Ad creative and messaging', 'Landing pages that make the next step clear']
  },
  {
    title: 'Spatial media',
    description: 'Momentum 360 brings virtual tours, photography, video and 3D experiences into the broader Need Momentum offer, helping a customer get a feel for a place before arriving.',
    points: ['Virtual tours and 360 capture', 'Photography and video for spaces', 'Spatial experiences for web and social']
  }
] as const;

type AuditFields = {
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  goals: string;
};

type FieldName = keyof AuditFields;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyFields: AuditFields = {
  name: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  goals: ''
};

const fieldNames: FieldName[] = ['name', 'phone', 'email', 'website', 'description', 'goals'];
const fieldLabels: Record<FieldName, string> = {
  name: 'Your name',
  phone: 'Phone number',
  email: 'Email address',
  website: 'Business website',
  description: 'What does your business do?',
  goals: 'What would you like to improve?'
};

function validate(fields: AuditFields): FieldErrors {
  const next: FieldErrors = {};

  for (const field of fieldNames) {
    if (!fields[field].trim()) next[field] = 'This field is required.';
  }

  if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    next.email = 'Enter an email address in the form name@example.com.';
  }

  if (fields.website.trim()) {
    try {
      const website = new URL(fields.website.trim());
      if (website.protocol !== 'https:' && website.protocol !== 'http:') {
        next.website = 'Start the website address with https:// or http://.';
      }
    } catch {
      next.website = 'Enter a complete website address starting with https:// or http://.';
    }
  }

  return next;
}

function Branchwork({ selected }: { selected: number }) {
  return (
    <svg className="n-service-branch" viewBox="0 0 120 480" aria-hidden="true">
      <path className="n-service-branch__stem" d="M60 470 C56 420 64 380 59 337 C54 290 65 246 60 204 C54 158 64 108 60 16" />
      <g className={selected === 0 ? 'n-service-branch__twig is-active' : 'n-service-branch__twig'}>
        <path d="M60 92 C47 77 33 67 20 61 M20 61 C13 53 10 43 12 34 M20 61 C28 52 39 48 49 49 M20 61 C23 70 31 77 42 80" />
        <path d="M11 35 C3 30 2 21 5 14 C14 16 19 23 17 32 C16 35 14 36 11 35 Z M43 51 C48 43 58 41 65 44 C63 53 56 58 47 56 M40 78 C39 88 45 95 53 98 C58 90 55 82 47 78" />
      </g>
      <g className={selected === 1 ? 'n-service-branch__twig is-active' : 'n-service-branch__twig'}>
        <path d="M60 176 C73 160 87 151 101 146 M101 146 C110 139 113 129 111 120 M101 146 C93 137 82 133 72 135 M101 146 C98 156 91 164 80 167" />
        <path d="M112 121 C120 116 122 107 119 100 C110 102 105 109 107 118 C108 121 110 122 112 121 Z M77 136 C70 128 60 127 53 131 C56 139 63 143 72 141 M81 165 C82 175 76 182 68 185 C63 177 66 169 74 165" />
      </g>
      <g className={selected === 2 ? 'n-service-branch__twig is-active' : 'n-service-branch__twig'}>
        <path d="M60 258 C47 244 32 235 17 231 M17 231 C8 225 5 215 7 206 M17 231 C26 222 37 219 47 221 M17 231 C20 241 28 248 39 251" />
        <path d="M7 207 C0 201 0 192 4 185 C13 188 17 195 14 204 C13 207 10 208 7 207 Z M43 223 C48 215 58 213 65 217 C62 225 55 229 46 228 M38 249 C37 259 43 266 51 269 C56 261 53 253 45 249" />
      </g>
      <g className={selected === 3 ? 'n-service-branch__twig is-active' : 'n-service-branch__twig'}>
        <path d="M60 338 C73 323 88 315 103 310 M103 310 C112 303 115 293 112 284 M103 310 C95 301 84 298 74 300 M103 310 C100 320 93 328 82 331" />
        <path d="M113 285 C121 279 121 270 118 263 C109 266 104 273 107 282 C108 285 110 286 113 285 Z M79 301 C72 293 62 292 55 296 C58 304 65 308 74 306 M82 329 C83 339 77 346 69 349 C64 341 67 333 75 329" />
      </g>
      <g className={selected === 4 ? 'n-service-branch__twig is-active' : 'n-service-branch__twig'}>
        <path d="M60 418 C47 404 32 395 17 390 M17 390 C8 384 5 374 7 365 M17 390 C26 381 37 378 47 380 M17 390 C20 400 28 407 39 410" />
        <path d="M7 366 C0 360 0 351 4 344 C13 347 17 354 14 363 C13 366 10 367 7 366 Z M43 382 C48 374 58 372 65 376 C62 384 55 388 46 387 M38 408 C37 418 43 425 51 428 C56 420 53 412 45 408" />
      </g>
      <circle cx="60" cy="16" r="4" />
      <circle cx="60" cy="470" r="4" />
    </svg>
  );
}

function AuditPreview() {
  const [fields, setFields] = useState<AuditFields>(emptyFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [complete, setComplete] = useState(false);

  function updateField(field: FieldName, value: string) {
    const nextFields = { ...fields, [field]: value };
    setFields(nextFields);
    setComplete(false);
    if (attempted) setErrors(validate(nextFields));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    const nextErrors = validate(fields);
    setErrors(nextErrors);
    setConsentError(consent ? '' : 'Please check this box to complete the local preview.');

    const firstInvalid = fieldNames.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById('audit-' + firstInvalid)?.focus();
      return;
    }

    if (!consent) {
      document.getElementById('audit-consent')?.focus();
      return;
    }

    setFields({ ...emptyFields });
    setErrors({});
    setConsent(false);
    setConsentError('');
    setAttempted(false);
    setComplete(true);
  }

  function updateConsent(event: ChangeEvent<HTMLInputElement>) {
    setConsent(event.currentTarget.checked);
    setConsentError('');
    setComplete(false);
  }

  const hasErrors = Object.keys(errors).length > 0 || Boolean(consentError);

  return (
    <section className="n-audit" id="audit" aria-labelledby="audit-heading">
      <div className="n-audit__intro">
        <h2 id="audit-heading">Start with a clearer picture.</h2>
        <p>Share six details in this local audit preview. Your entries stay in this page and are cleared when you complete it.</p>
        <p className="n-audit__privacy">This is a demonstration. Nothing is sent or stored.</p>
      </div>

      <div className="n-audit__form-wrap">
        {complete && (
          <div className="n-audit__complete" role="status">
            <strong>Preview complete</strong>
            <span>Nothing was sent or stored.</span>
          </div>
        )}

        {attempted && hasErrors && (
          <div className="n-audit__error-summary" role="alert">
            <strong>Review the highlighted fields.</strong>
            <span>Correct each message below, then try the preview again.</span>
          </div>
        )}

        <form className="n-form" noValidate onSubmit={handleSubmit}>
          <p className="n-form__required-note">All six fields are required.</p>
          <div className="n-form__grid">
            <div className="n-field">
              <label htmlFor="audit-name">{fieldLabels.name} <span aria-hidden="true">*</span></label>
              <input
                id="audit-name"
                name="name"
                autoComplete="name"
                value={fields.name}
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'audit-name-error' : undefined}
                onChange={(event) => updateField('name', event.currentTarget.value)}
              />
              {errors.name && <span className="n-field__error" id="audit-name-error">{errors.name}</span>}
            </div>

            <div className="n-field">
              <label htmlFor="audit-phone">{fieldLabels.phone} <span aria-hidden="true">*</span></label>
              <input
                id="audit-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={fields.phone}
                required
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'audit-phone-error' : undefined}
                onChange={(event) => updateField('phone', event.currentTarget.value)}
              />
              {errors.phone && <span className="n-field__error" id="audit-phone-error">{errors.phone}</span>}
            </div>

            <div className="n-field">
              <label htmlFor="audit-email">{fieldLabels.email} <span aria-hidden="true">*</span></label>
              <input
                id="audit-email"
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'audit-email-error' : undefined}
                onChange={(event) => updateField('email', event.currentTarget.value)}
              />
              {errors.email && <span className="n-field__error" id="audit-email-error">{errors.email}</span>}
            </div>

            <div className="n-field">
              <label htmlFor="audit-website">{fieldLabels.website} <span aria-hidden="true">*</span></label>
              <input
                id="audit-website"
                name="website"
                type="url"
                autoComplete="url"
                placeholder="https://example.com"
                value={fields.website}
                required
                aria-invalid={Boolean(errors.website)}
                aria-describedby={errors.website ? 'audit-website-error' : undefined}
                onChange={(event) => updateField('website', event.currentTarget.value)}
              />
              {errors.website && <span className="n-field__error" id="audit-website-error">{errors.website}</span>}
            </div>

            <div className="n-field n-field--wide">
              <label htmlFor="audit-description">{fieldLabels.description} <span aria-hidden="true">*</span></label>
              <textarea
                id="audit-description"
                name="description"
                rows={3}
                value={fields.description}
                required
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'audit-description-error' : undefined}
                onChange={(event) => updateField('description', event.currentTarget.value)}
              />
              {errors.description && <span className="n-field__error" id="audit-description-error">{errors.description}</span>}
            </div>

            <div className="n-field n-field--wide">
              <label htmlFor="audit-goals">{fieldLabels.goals} <span aria-hidden="true">*</span></label>
              <textarea
                id="audit-goals"
                name="goals"
                rows={3}
                value={fields.goals}
                required
                aria-invalid={Boolean(errors.goals)}
                aria-describedby={errors.goals ? 'audit-goals-error' : undefined}
                onChange={(event) => updateField('goals', event.currentTarget.value)}
              />
              {errors.goals && <span className="n-field__error" id="audit-goals-error">{errors.goals}</span>}
            </div>
          </div>

          <div className="n-consent">
            <input
              id="audit-consent"
              name="consent"
              type="checkbox"
              checked={consent}
              required
              aria-invalid={Boolean(consentError)}
              aria-describedby={consentError ? 'audit-consent-error' : undefined}
              onChange={updateConsent}
            />
            <label htmlFor="audit-consent">I understand that this local preview does not send or store my details, and I agree to complete the demonstration.</label>
          </div>
          {consentError && <span className="n-field__error n-consent__error" id="audit-consent-error">{consentError}</span>}

          <div className="n-form__actions">
            <button className="n-button n-button--orange" type="submit">Complete the local preview</button>
            <span>Your details are cleared from the form when you complete it.</span>
          </div>
        </form>
      </div>
    </section>
  );
}

export function NouveauHomepage() {
  const [selectedService, setSelectedService] = useState(0);
  const activeService = serviceDetails[selectedService];

  return (
    <div className="nouveau-page" id="top">
      <a className="n-skip-link" href="#main-content">Skip to main content</a>

      <main>
      <div className="n-storefront">
        <header className="n-header">
          <a className="n-brand" href="https://www.needmomentum.com/" aria-label="Need Momentum home">
            <img src="/assets/brand/need-momentum-logo.png" alt="Need Momentum" width="655" height="160" fetchPriority="high" />
          </a>

          <nav className="n-nav" aria-label="Main navigation">
            <a href="#services">Services</a>
            <a href="#team">The team</a>
            <a href="#audit">Audit preview</a>
          </nav>

          <a className="n-header__cta" href="#audit">Try the audit preview</a>
        </header>

        <p className="n-preview-banner">
          <span aria-hidden="true" />
          Local preview. The audit demo does not send or store your details.
        </p>

          <section className="n-hero" id="main-content" tabIndex={-1} aria-labelledby="hero-heading">
            <div className="n-hero__frame" aria-hidden="true" />
            <div className="n-hero__copy">
              <h1 id="hero-heading">Make your business easier to find — and choose.</h1>
              <p>Websites, search, local visibility, advertising and spatial media, connected around the next move for your business.</p>
              <div className="n-hero__actions">
                <a className="n-button n-button--orange" href="#audit">Try the audit preview</a>
                <a className="n-hero__text-link" href="#services">Explore the services</a>
              </div>
              <p className="n-hero__place">Need Momentum · Philadelphia</p>
            </div>

            <figure className="n-hero__portrait">
              <svg className="n-hero__botanical" viewBox="0 0 520 560" fill="none" aria-hidden="true">
                <path d="M42 525 C66 461 71 401 82 340 C93 279 115 227 156 191 C195 157 212 112 209 52" />
                <path d="M82 340 C48 308 29 271 31 231 M102 284 C143 279 175 259 200 226 M119 235 C85 205 71 169 78 134 M143 207 C185 202 221 178 237 143" />
                <path d="M209 52 C187 41 171 23 169 8 C190 8 207 22 214 40 C218 51 215 57 209 52 Z M33 233 C14 216 9 193 18 177 C38 187 47 206 43 224 C41 232 37 236 33 233 Z M196 228 C199 205 215 188 235 186 C237 206 226 224 208 231 C200 234 196 233 196 228 Z" />
                <path d="M78 137 C55 129 42 111 43 91 C63 94 79 110 83 129 C84 136 82 140 78 137 Z M232 145 C235 123 251 106 271 104 C272 124 261 141 244 148 C237 151 232 150 232 145 Z" />
                <path d="M336 529 C317 475 309 418 314 357 C320 289 342 234 382 188 C409 156 429 121 428 79" />
                <path d="M316 364 C286 340 269 305 270 268 M329 315 C366 303 394 280 415 248 M355 242 C326 214 316 178 325 144 M393 177 C431 172 460 149 476 116" />
                <path d="M428 80 C409 67 398 48 401 30 C421 33 435 48 438 67 C439 76 435 82 428 80 Z M272 270 C254 252 250 229 260 213 C279 223 286 242 281 260 C279 268 276 273 272 270 Z M409 250 C411 228 427 212 447 211 C448 231 437 248 420 254 C413 257 409 255 409 250 Z" />
                <path d="M325 146 C304 136 293 117 297 98 C317 103 330 119 331 138 C331 145 329 149 325 146 Z M472 118 C475 97 491 82 511 82 C511 102 500 118 483 124 C476 126 472 124 472 118 Z" />
                <path className="n-hero__botanical-arch" d="M75 523 V228 C75 93 150 28 260 28 C371 28 445 93 445 228 V523" />
              </svg>
              <div className="n-hero__photo-arch">
                <img
                  src="/assets/founders/mac-sean-award-2026.webp"
                  alt="Mac Frederick, blond, stands on the left with Sean Boyle on the right at the 2026 Inc. 5000 regional awards."
                  width="600"
                  height="435"
                  fetchPriority="high"
                />
              </div>
              <figcaption>
                <strong>Mac Frederick · Sean Boyle</strong>
                <span>Need Momentum founders · Mac left, Sean right</span>
              </figcaption>
            </figure>
          </section>
      </div>

      <section className="n-services" id="services" aria-labelledby="services-heading">
        <div className="n-section-heading">
          <h2 id="services-heading">One connected team. Five ways to move forward.</h2>
          <p>Explore the service that fits the question on your mind. The detail changes as you make a selection.</p>
        </div>

        <div className="n-service-layout">
          <div className="n-service-options" role="group" aria-label="Choose a service">
            {serviceDetails.map((service, index) => (
              <button
                className={selectedService === index ? 'n-service-option is-active' : 'n-service-option'}
                type="button"
                key={service.title}
                aria-pressed={selectedService === index}
                aria-controls="service-detail"
                onClick={() => setSelectedService(index)}
              >
                <span>{service.title}</span>
                <span className="n-service-option__mark" aria-hidden="true" />
              </button>
            ))}
          </div>

          <Branchwork selected={selectedService} />

          <article className="n-service-detail" id="service-detail" aria-live="polite" aria-atomic="true">
            <h3>{activeService.title}</h3>
            <p>{activeService.description}</p>
            <ul>
              {activeService.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            {'href' in activeService && activeService.href && (
              <a className="n-service-detail__link" href={activeService.href}>{activeService.linkLabel}</a>
            )}
            <a className="n-service-detail__audit" href="#audit">Bring this topic to the audit preview</a>
          </article>
        </div>
      </section>

      <section className="n-people" id="team" aria-labelledby="team-heading">
        <div className="n-people__line" aria-hidden="true">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0 80 C180 12 320 12 480 66 S790 112 960 53 S1250 6 1440 72" />
          </svg>
        </div>
        <div className="n-people__content">
          <h2 id="team-heading">A business is built by people.</h2>
          <p>Mac Frederick and Sean Boyle bring digital growth and spatial media together at Need Momentum. Start with the need in front of you, then find the service that fits.</p>
        </div>
        <a className="n-people__link" href="#audit">Share what you are working toward</a>
      </section>

      <section className="n-faq" id="questions" aria-labelledby="faq-heading">
        <div className="n-section-heading">
          <h2 id="faq-heading">A few useful answers.</h2>
          <p>Open a question to read its answer.</p>
        </div>
        <div className="n-faq__list">
          <details>
            <summary>What should I include in the audit preview?</summary>
            <p>Share your contact details, website, a short description of the business and what you would like to improve. The local preview clears those details when you complete it.</p>
          </details>
          <details>
            <summary>What services can we discuss?</summary>
            <p>Websites, search engine optimization, local SEO, advertising and Momentum 360 spatial media.</p>
          </details>
          <details>
            <summary>How does Momentum 360 fit with Need Momentum?</summary>
            <p>Momentum 360 is the spatial-media service within the broader Need Momentum offer, including virtual tours, photography, video and 3D experiences.</p>
          </details>
          <details>
            <summary>Will this form send an audit request?</summary>
            <p>No. This page is a local preview. The form sends no data and stores nothing; completing it only displays the “Preview complete” message.</p>
          </details>
        </div>
      </section>

      <AuditPreview />
      </main>

      <footer className="n-footer">
        <a className="n-footer__brand" href="https://www.needmomentum.com/">
          <img src="/assets/brand/need-momentum-logo.png" alt="Need Momentum" width="655" height="160" loading="lazy" />
        </a>
        <p>A connected offer for websites, search, advertising and spatial media.</p>
        <nav aria-label="Footer navigation">
          <a href="https://www.needmomentum.com/">Need Momentum home</a>
          <a href="https://www.needmomentum.com/search-engine-optimization/">Search engine optimization</a>
          <a href="#top">Back to top</a>
        </nav>
        <small>Local design preview · No audit requests are sent or stored here.</small>
      </footer>
    </div>
  );
}
