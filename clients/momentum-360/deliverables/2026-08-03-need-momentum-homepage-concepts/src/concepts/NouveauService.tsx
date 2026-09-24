const serviceAreas = [
  {
    title: 'Google Business Profile',
    copy: 'Review the public profile for completeness, accurate business details and a clear description of the services you provide.'
  },
  {
    title: 'Useful service and location pages',
    copy: 'Make the services you offer and the places you genuinely serve easy to understand on your website.'
  },
  {
    title: 'Consistent local information',
    copy: 'Check that customer-facing details line up across the profile and site, then agree what needs attention first.'
  }
];

const workStages = [
  {
    title: 'Understand the starting point',
    copy: 'Review the public profile, website and real service areas. Clarify what matters to the business before recommending changes.'
  },
  {
    title: 'Set a practical scope',
    copy: 'Choose the profile, website and location information that should be addressed. Confirm access, ownership and responsibilities.'
  },
  {
    title: 'Make agreed improvements',
    copy: 'Complete only the work included in the agreed scope, keeping business details accurate and useful to customers.'
  },
  {
    title: 'Review and maintain',
    copy: 'Check the agreed work over time and adjust the plan when services, locations or business priorities change.'
  }
];

const questions = [
  {
    question: 'What can local SEO include?',
    answer: 'Depending on the business and agreed scope, work may include Google Business Profile setup or optimization, service and location information on the website, and ongoing profile management. The specific deliverables should be confirmed before work begins.'
  },
  {
    question: 'Can anyone guarantee a top position in Google Maps?',
    answer: 'No fixed ranking position is promised here. Local results vary with the search, the searcher’s location and other factors outside an agency’s control. A useful plan starts with an accurate baseline and clear measures for the work.'
  },
  {
    question: 'Does this work for businesses with more than one location?',
    answer: 'It can be scoped for multiple real locations. The review should confirm which locations are active, how each one serves customers, and what profile and website work is appropriate for each.'
  },
  {
    question: 'What happens after the audit preview?',
    answer: 'The button opens a local demonstration on the homepage. The preview form does not send or store the details entered. A production intake process would need a separately verified destination and delivery setup.'
  }
];

function PresenceDiagram() {
  return (
    <figure className="ns-presence" aria-labelledby="ns-presence-caption">
      <svg className="ns-presence__lines" viewBox="0 0 560 440" aria-hidden="true">
        <path className="ns-presence__stem" d="M278 378 C280 317 277 278 279 220 C280 164 257 132 211 110 C182 96 151 90 106 89" />
        <path className="ns-presence__stem" d="M280 254 C317 211 357 185 414 172 C452 163 476 139 491 103" />
        <path className="ns-presence__stem" d="M280 310 C232 284 195 269 146 264 C106 260 82 238 67 202" />
        <path className="ns-presence__leaf" d="M188 97 C163 74 164 51 184 39 C207 56 211 78 199 97 M202 105 C221 83 243 82 255 98 C242 120 220 124 202 112" />
        <path className="ns-presence__leaf" d="M432 165 C424 138 437 119 458 118 C468 143 460 160 438 170 M448 157 C460 133 481 127 497 140 C488 162 469 170 448 164" />
        <path className="ns-presence__leaf" d="M113 258 C93 239 95 218 113 207 C133 224 137 244 125 260 M104 251 C80 263 60 254 55 233 C76 221 96 230 107 249" />
        <circle cx="106" cy="89" r="5" />
        <circle cx="491" cy="103" r="5" />
        <circle cx="67" cy="202" r="5" />
        <circle cx="280" cy="220" r="7" />
      </svg>

      <div className="ns-presence__node ns-presence__node--website">
        <span>Website</span>
        <strong>Services and places</strong>
      </div>
      <div className="ns-presence__node ns-presence__node--profile">
        <span>Google Business Profile</span>
        <strong>Accurate details</strong>
      </div>
      <div className="ns-presence__node ns-presence__node--customers">
        <span>Nearby customers</span>
        <strong>Useful next steps</strong>
      </div>
      <div className="ns-presence__hub">
        <span>Local presence</span>
        <strong>One clear picture</strong>
      </div>
      <figcaption className="ns-visually-hidden" id="ns-presence-caption">
        A decorative diagram connecting a business website, its Google Business Profile and nearby customers.
      </figcaption>
    </figure>
  );
}

export function NouveauService() {
  return (
    <div className="ns-page" id="top">
      <a className="ns-skip" href="#main-content">Skip to content</a>
      <div className="ns-preview">
        <span aria-hidden="true" />
        Local design preview · not published
      </div>

      <header className="ns-header">
        <a className="ns-brand" href="./nouveau.html" aria-label="Need Momentum homepage preview">
          <img src="/assets/brand/need-momentum-logo.png" alt="Need Momentum" width="655" height="160" />
        </a>
        <nav className="ns-nav" aria-label="Page navigation">
          <a href="#scope">What local SEO covers</a>
          <a href="#approach">How work is scoped</a>
          <a href="#questions">Questions</a>
        </nav>
        <a className="ns-header__action" href="./nouveau.html#audit">See the audit preview</a>
      </header>

      <main>
        <section className="ns-hero" id="main-content" tabIndex={-1} aria-labelledby="ns-title">
          <div className="ns-hero__copy">
            <h1 id="ns-title">Make your local presence easier to understand.</h1>
            <p className="ns-hero__lead">
              Local search brings your website, Google Business Profile and the details customers use to choose a business together.
            </p>
            <p>
              Momentum Digital’s local SEO work can be scoped around profile management, useful service and location information, and a steady review of how those pieces fit.
            </p>
            <div className="ns-actions">
              <a className="ns-button" href="./nouveau.html#audit">Explore the audit preview</a>
              <a className="ns-text-link" href="#scope">See what may be included</a>
            </div>
            <p className="ns-hero__note">Philadelphia roots · plans shaped around real locations</p>
          </div>
          <PresenceDiagram />
        </section>

        <section className="ns-scope" id="scope" aria-labelledby="ns-scope-title">
          <div className="ns-section-head">
            <h2 id="ns-scope-title">Connect the details people rely on.</h2>
            <p>
              A useful local plan starts with what is true about the business, then makes those details clear across the places customers look.
            </p>
          </div>
          <div className="ns-scope__list">
            {serviceAreas.map((area, index) => (
              <article className="ns-scope__item" key={area.title}>
                <span className="ns-scope__branch" aria-hidden="true">
                  <svg viewBox="0 0 62 62">
                    <path d={index === 0 ? 'M30 58 C29 42 33 33 25 19 M25 19 C22 10 13 8 7 9 M25 19 C30 10 39 9 47 12 M25 19 C19 25 19 34 26 39' : index === 1 ? 'M30 58 C29 42 33 33 25 19 M25 19 C18 14 10 15 5 20 M25 19 C27 9 36 6 45 8 M25 19 C32 23 37 31 35 39' : 'M30 58 C29 42 33 33 25 19 M25 19 C18 12 9 13 4 18 M25 19 C28 10 37 8 47 11 M25 19 C20 27 23 35 31 40'} />
                    <circle cx="30" cy="58" r="2.5" />
                  </svg>
                </span>
                <div>
                  <h3>{area.title}</h3>
                  <p>{area.copy}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="ns-scope__note">
            These are areas for discussion, not a fixed package. Final tasks depend on the business, its locations, current setup and agreed scope.
          </p>
        </section>

        <section className="ns-approach" id="approach" aria-labelledby="ns-approach-title">
          <div className="ns-approach__intro">
            <h2 id="ns-approach-title">Start with the facts. Then choose the work.</h2>
            <p>
              A careful sequence keeps profile and website changes tied to real services, locations and responsibilities.
            </p>
          </div>
          <ol className="ns-stages">
            {workStages.map((stage) => (
              <li className="ns-stages__item" key={stage.title}>
                <h3>{stage.title}</h3>
                <p>{stage.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ns-faq" id="questions" aria-labelledby="ns-faq-title">
          <div className="ns-section-head">
            <h2 id="ns-faq-title">Questions before you begin.</h2>
            <p>Clear answers make it easier to decide whether a local search review fits the business.</p>
          </div>
          <div className="ns-faq__list">
            {questions.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ns-audit" aria-labelledby="ns-audit-title">
          <div className="ns-audit__ornament" aria-hidden="true">
            <svg viewBox="0 0 220 190">
              <path d="M110 188 C105 150 116 120 106 83 C99 56 76 38 41 30 M108 120 C133 100 153 83 181 79 M104 82 C124 62 132 40 133 12" />
              <path d="M40 30 C25 17 26 5 38 2 C52 12 53 23 44 32 M44 31 C55 14 69 12 77 22 C69 39 56 42 44 34 M181 79 C180 59 190 48 205 52 C208 69 199 79 183 82 M183 80 C195 65 208 64 217 75 C209 89 196 91 183 84 M133 12 C124 2 126 -8 138 -12 C148 0 146 10 136 15" />
              <circle cx="110" cy="188" r="3" />
            </svg>
          </div>
          <div className="ns-audit__copy">
            <h2 id="ns-audit-title">Get a clearer starting point.</h2>
            <p>Open the homepage audit preview to see how a site review can begin. The local form is for demonstration; it does not send or store what you enter.</p>
          </div>
          <a className="ns-button ns-button--light" href="./nouveau.html#audit">Open the audit preview</a>
        </section>
      </main>

      <footer className="ns-footer">
        <a className="ns-footer__brand" href="./nouveau.html">
          <img src="/assets/brand/need-momentum-logo.png" alt="Need Momentum" width="655" height="160" loading="lazy" />
        </a>
        <p>Local search, explained with care and connected to the real business.</p>
        <nav aria-label="Footer navigation">
          <a href="./nouveau.html">Homepage preview</a>
          <a href="#scope">Service scope</a>
          <a href="#questions">Questions</a>
        </nav>
        <small>Need Momentum · Local service-page preview · No information is sent or stored by this page.</small>
      </footer>
    </div>
  );
}

