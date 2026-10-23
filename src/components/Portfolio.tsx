import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Download, Menu, X } from "lucide-react";
import { profile, type Project } from "../data/portfolio";
import { useLocale } from "../i18n";
import { assetUrl } from "../lib/site";
const sectionIds = ["projets", "experience", "competences", "contact"] as const;

function CvLink({ secondary = false }: { secondary?: boolean }) {
  const { t } = useLocale();
  return (
    <a
      className={secondary ? "button secondary" : "button"}
      href={assetUrl(profile.cv)}
      download="CV_Mouad_Charef.pdf"
      aria-label={`${t.ui.download} — ${t.ui.cvLanguage}`}
    >
      <Download size={16} aria-hidden="true" />
      <span>
        {t.ui.download}
        <small className="cv-language">{t.ui.cvLanguage}</small>
      </span>
    </a>
  );
}
function SectionTitle({
  number,
  label,
  title,
  text,
}: {
  number: string;
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          {number} / {label}
        </p>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}
function Architecture({ project }: { project: Project }) {
  const { t } = useLocale();
  return (
    <div className={`project-visual visual-${project.id}`}>
      {project.image ? (
        <img
          src={project.image.startsWith("/") ? assetUrl(project.image) : project.image}
          alt={project.imageAlt ?? project.name}
          loading="lazy"
          width={800}
          height={480}
        />
      ) : (
        <>
          <div className="visual-top">
            <span>{t.ui.architecture}</span>
            <span aria-hidden="true">↗</span>
          </div>
          <div className="architecture">
            {project.architecture.map((item, index) => (
              <div key={item}>
                <span className="architecture-node">{item}</span>
                {index < project.architecture.length - 1 && (
                  <span className="connector" aria-hidden="true">
                    ↓
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="visual-caption">
            {t.ui.diagram} · {project.label.toLowerCase()}
          </p>
        </>
      )}
    </div>
  );
}
function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useLocale();
  return (
    <article
      id={`projet-${project.id}`}
      className={`project-card reveal${project.id === "peopleflow" ? " project-featured" : ""}${project.ai ? " ai-project" : ""}`}
    >
      <Architecture project={project} />
      <div className="project-body">
        <div className="project-meta">
          <span>
            0{index + 1} / {t.ui[project.category]}
          </span>
          {project.state && <span className="status">{t.ui[project.state]}</span>}
        </div>
        <h3>{project.name}</h3>
        <p className="project-description">{project.description}</p>
        {project.state === "local" && (
          <div className="local-validation">
            <p>
              <Check size={15} aria-hidden="true" />
              {t.ui.evidence}
            </p>
            <p>{t.ui.localWarning}</p>
          </div>
        )}
        <ul className="tags" aria-label={t.ui.technologies}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <details className="project-details">
          <summary>
            {t.ui.explore}
            <span aria-hidden="true">+</span>
          </summary>
          <div>
            <h4>{t.ui.role}</h4>
            <p>{project.role}</p>
            <h4>{t.ui.features}</h4>
            <ul>
              {project.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h4>{t.ui.challenge}</h4>
            <p>{project.challenge}</p>
            {project.security && (
              <>
                <h4>{t.ui.security}</h4>
                <p>{project.security}</p>
              </>
            )}
            <h4>{t.ui.results}</h4>
            <p>{project.results}</p>
          </div>
        </details>
        {project.href && (
          <a className="text-link" href={project.href} target="_blank" rel="noopener noreferrer">
            {project.linkLabel}
            <ArrowUpRight size={16} aria-hidden="true" />
            <span className="sr-only">{t.ui.newTab}</span>
          </a>
        )}
      </div>
    </article>
  );
}
export function Portfolio() {
  const { locale, t, setLocale } = useLocale();
  const navigate = useNavigate();
  useEffect(() => {
    // Restore only after the portfolio has hydrated, so its SSR text stays consistent.
    const explicit = new URLSearchParams(window.location.search).get("lang");
    try {
      if (explicit === "fr" || explicit === "en") {
        localStorage.setItem("portfolio-language", explicit);
      } else if (/\/en\/?$/.test(window.location.pathname)) {
        localStorage.setItem("portfolio-language", "en");
      } else {
        const saved = localStorage.getItem("portfolio-language");
        if (saved === "en" || saved === "fr") {
          void navigate({
            to: saved === "en" ? "/en/" : "/",
            search: { lang: undefined },
            hash: window.location.hash.slice(1),
            replace: true,
            resetScroll: false,
          });
        }
      }
    } catch {
      /* The URL still retains the language when storage is blocked. */
    }
  }, [navigate]);
  const navigation = [t.ui.projects, t.ui.experience, t.ui.skills, t.ui.contact];
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [active, setActive] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    const sections = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-15% 0px -55% 0px" },
    );
    sectionIds.forEach((id) => {
      const node = document.getElementById(id);
      if (node) sections.observe(node);
    });
    return () => {
      observer.disconnect();
      sections.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <>
      <a className="skip-link" href="#contenu">
        {t.ui.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="wordmark" href="#accueil" aria-label={t.ui.home}>
            mc<span>.</span>
          </a>
          <nav
            aria-label={t.ui.nav}
            id="navigation"
            className={menuOpen ? "navigation open" : "navigation"}
          >
            {sectionIds.map((id, index) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {navigation[index]}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <div className="language-switch" role="group" aria-label={t.ui.language}>
              <button
                type="button"
                lang="fr"
                aria-label="Français"
                aria-pressed={locale === "fr"}
                onClick={() => setLocale("fr")}
              >
                FR
              </button>
              <button
                type="button"
                lang="en"
                aria-label="English"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
            </div>
            <a className="header-contact" href={`mailto:${profile.email}`}>
              {t.ui.talk}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button
              id="menu-toggle"
              className="menu-toggle"
              aria-label={menuOpen ? t.ui.menuClose : t.ui.menuOpen}
              aria-expanded={menuOpen}
              aria-controls="navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      <main id="contenu">
        <section id="accueil" className="hero container">
          <div className="hero-copy">
            <p className="eyebrow hero-enter">
              <span className="location-dot" /> {profile.location} · {t.hero.eyebrow}
            </p>
            <p className="hero-name hero-enter">{profile.name}</p>
            <h1 className="hero-enter">
              {t.hero.job}
              <br />
              <span>{t.hero.stack}</span>
              <br />
              <em>{t.hero.line}</em>
            </h1>
            <p className="hero-description hero-enter">{t.hero.description}</p>
            <p className="hero-ai hero-enter">{t.hero.ai}</p>
            <div className="hero-actions hero-enter">
              <a className="button" href="#projets">
                {t.ui.discover}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
              <CvLink secondary />
            </div>
            <p className="hero-mobility">{t.hero.mobility}</p>
          </div>
          <div className="system-scene hero-enter" role="img" aria-label={t.hero.sceneLabel}>
            <div className="scene-top">
              <span>{t.hero.scene}</span>
              <span className="scene-mark">MC / DEV</span>
            </div>
            <div className="system-stack" aria-hidden="true">
              <div className="system-layer layer-web">
                <span className="layer-number">01</span>
                <strong>Web</strong>
                <small>React · Angular</small>
                <div className="code-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="system-layer layer-api">
                <span className="layer-number">02</span>
                <strong>API</strong>
                <small>Node.js · Spring Boot</small>
                <span className="code-symbol">{"{ }"}</span>
              </div>
              <div className="system-layer layer-mobile">
                <span className="layer-number">03</span>
                <strong>Mobile</strong>
                <small>Flutter · Dart</small>
                <span className="mobile-symbol" />
              </div>
            </div>
            <div className="scene-bottom">
              <span>{t.hero.sceneFooter}</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
          <div className="hero-proof">
            {t.hero.proof.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
        <section id="apropos" className="about-section">
          <div className="container about-grid reveal">
            <p className="eyebrow">01 / {t.about.label}</p>
            <div>
              <h2>{t.about.title}</h2>
              {t.about.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
              <a className="text-link" href="#experience">
                {t.ui.journey}
                <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
        <section id="projets" className="container section">
          <SectionTitle number="02" {...t.sections.projects} />
          <div className="project-grid">
            {t.projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </section>
        <section id="experience" className="container section">
          <SectionTitle number="03" {...t.sections.experience} />
          <div className="timeline">
            {t.experience.map((item) => (
              <article className="timeline-item reveal" key={item.role}>
                <div className="timeline-date">
                  <span className="timeline-dot" />
                  <p>{item.period}</p>
                  <span>{item.company}</span>
                </div>
                <div>
                  <p className="eyebrow">
                    {item.company.startsWith("Mindful") && item.period.includes("2025")
                      ? t.ui.mainExperience
                      : t.ui.otherExperience}
                  </p>
                  <h3>{item.role}</h3>
                  <p>{item.summary}</p>
                  {item.details.length > 0 && (
                    <details open>
                      <summary>{t.ui.responsibilities}</summary>
                      <ul>
                        {item.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="competences" className="skills-section">
          <div className="container section">
            <SectionTitle number="04" {...t.sections.skills} />
            <div className="skills-grid">
              {t.skills.map((group, index) => (
                <article
                  className={`skill-group reveal${group.ai ? " ai-skill" : ""}`}
                  key={group.name}
                >
                  <span className="skill-index">0{index + 1}</span>
                  <h3>{group.name}</h3>
                  <ul className="tags">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p>{group.context}</p>
                </article>
              ))}
            </div>
            <div className="spoken-languages">
              <p className="eyebrow">{t.ui.languagesLabel}</p>
              <ul>
                {t.ui.spoken.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section id="formation" className="container section">
          <SectionTitle number="05" {...t.sections.education} />
          <ol className="education-progression" aria-label={t.educationUi.progression}>
            {t.educationUi.stages.map((stage, index) => (
              <li key={stage}>
                <span className="eyebrow">0{index + 1}</span>
                {stage}
              </li>
            ))}
          </ol>
          <div className="education">
            {t.education.map((item) => (
              <article className="education-item reveal" key={item.id}>
                <div className="education-date">
                  <p className="eyebrow">{item.period}</p>
                  <span className="education-level">{item.level}</span>
                </div>
                <div className="education-content">
                  <h3 id={`diplome-${item.id}`}>{item.title}</h3>
                  <div className="education-school">
                    <p>{item.school}</p>
                    {item.workStudy && (
                      <span className="education-badge">{t.educationUi.workStudy}</span>
                    )}
                  </div>
                  <p className="education-description">{item.description}</p>
                  <details className="education-details">
                    <summary>
                      {t.educationUi.domains}
                      <span className="sr-only"> — {item.title}</span>
                      <ChevronDown size={16} aria-hidden="true" />
                    </summary>
                    <ul className="education-domains">
                      {item.domains.map((domain) => (
                        <li key={domain}>{domain}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="contact" className="contact-section">
          <div className="container section">
            <p className="eyebrow">
              06 / {t.ui.contact} · {profile.location}
            </p>
            <h2>
              {t.contact.title}
              <br />
              <em>{t.contact.line}</em>
            </h2>
            <p className="contact-intro">{t.contact.intro}</p>
            <div className="contact-row">
              <a className="email-link" href={`mailto:${profile.email}`}>
                {profile.email}
                <ArrowUpRight aria-hidden="true" />
              </a>
              <button className="copy-button" onClick={copyEmail}>
                {copied ? <Check size={16} aria-hidden="true" /> : null}
                {copied ? t.ui.copied : t.ui.copy}
              </button>
            </div>
            <p className="copy-feedback" role="status" aria-live="polite">
              {copyError ? t.ui.copyError : copied ? t.ui.copySuccess : ""}
            </p>
            <div className="contact-links">
              <a href={`tel:${profile.phoneHref}`}>{profile.phone}</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗<span className="sr-only">{t.ui.newTab}</span>
              </a>
              <a href={profile.gitlab} target="_blank" rel="noopener noreferrer">
                GitLab ↗<span className="sr-only">{t.ui.newTab}</span>
              </a>
              <CvLink secondary />
            </div>
          </div>
        </section>
      </main>
      <footer className="container footer">
        <a className="wordmark" href="#accueil" aria-label={t.ui.home}>
          mc<span>.</span>
        </a>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a href="#accueil">{t.ui.top} ↑</a>
      </footer>
    </>
  );
}
