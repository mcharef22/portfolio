import { createFileRoute } from "@tanstack/react-router";
import mindfulAsset from "@/assets/mindful-house.png.asset.json";
import cinemanextAsset from "@/assets/cinemanext.png.asset.json";
import cvAsset from "@/assets/cv.pdf.asset.json";
import photoAsset from "@/assets/photo-profil.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mouad Charef — Développeur Fullstack Web & Mobile" },
      {
        name: "description",
        content:
          "Portfolio de Mouad Charef, développeur fullstack (React, Node.js, Flutter). 3 ans d'alternance, applications web & mobile en production.",
      },
      { property: "og:title", content: "Mouad Charef — Développeur Fullstack" },
      {
        property: "og:description",
        content:
          "React · Node.js · Flutter · MongoDB. Applications web & mobile en production. Disponible en CDI.",
      },
    ],
  }),
  component: Portfolio,
});

const projects = [
  {
    n: "01",
    name: "RoadMaker",
    role: "Application web — React · Node.js · MongoDB",
    desc: "Plateforme web complète conçue et déployée pour Mindful House. De la modélisation BDD au déploiement VPS / Nginx / HTTPS.",
    href: "https://roadmaker.netlify.app/",
    tag: "Live",
  },
  {
    n: "02",
    name: "Road Player",
    role: "Application mobile hybride — Flutter",
    desc: "App mobile compagnon de RoadMaker, publiée sur l'App Store et le Play Store. Architecture mobile, intégration API, release stores.",
    href: "https://apps.apple.com/fr/app/road-player/id6739284205",
    tag: "App Store",
  },
  {
    n: "03",
    name: "E-commerce CinemaNext",
    role: "Site e-commerce — PHP · MySQL",
    desc: "Site marchand avec back-office complet pour CinemaNext Africa : gestion produits, interface admin, base de données, hébergement.",
    href: null,
    tag: "Stage",
  },
  {
    n: "04",
    name: "POC Supervision",
    role: "DevOps — Netdata · SonarQube · Docker",
    desc: "Mise en place d'une stack de supervision serveur et qualité de code chez Mindful House. Métriques temps réel, analyse statique.",
    href: null,
    tag: "Interne",
  },
];

const experiences = [
  {
    period: "Sept. 2022 — Déc. 2025",
    role: "Développeur Fullstack",
    company: "Mindful House",
    location: "Le Mans · Alternance",
    logo: mindfulAsset.url,
    bullets: [
      "Conception & déploiement de l'application web RoadMaker (React, Node.js)",
      "Développement Flutter de l'app mobile Road Player, publiée sur App Store & Play Store",
      "Modélisation MongoDB, schématisation des composants (front · back · mobile)",
      "POC supervision : Netdata (serveur) + SonarQube (qualité code)",
    ],
  },
  {
    period: "Janv. — Févr. 2022",
    role: "Développeur WordPress / React Native",
    company: "Mindful House",
    location: "Le Mans · Stage",
    logo: mindfulAsset.url,
    bullets: [
      "Maintenance du site corporate WordPress",
      "Prototype mobile en React Native",
    ],
  },
  {
    period: "Mai — Juin 2021",
    role: "Développeur PHP",
    company: "CinemaNext Africa",
    location: "À distance · Stage",
    logo: cinemanextAsset.url,
    bullets: [
      "Création d'un site e-commerce avec back-office de gestion",
      "Interface admin, gestion produits, base de données, hébergement",
    ],
  },
];

const stack = {
  Frontend: ["React", "JavaScript", "HTML / CSS", "TailwindCSS"],
  Backend: ["Node.js", "PHP", "REST API"],
  Mobile: ["Flutter", "React Native"],
  "Base de données": ["MongoDB", "MySQL", "PostgreSQL"],
  "DevOps / Cloud": ["Docker", "Nginx", "VPS / IONOS", "HTTPS"],
  Outils: ["Git", "GitLab", "SonarQube", "NetData", "Figma"],
};

function Portfolio() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, oklch(0.55 0.18 255 / 0.25), transparent 70%), radial-gradient(50% 40% at 10% 100%, oklch(0.82 0.16 210 / 0.18), transparent 70%)",
        }}
      />

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/60 border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="#top" className="font-display text-xl tracking-tight">
            Mouad<span className="text-primary">.</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#work" className="hover:text-foreground transition">Projets</a>
            <a href="#experience" className="hover:text-foreground transition">Expérience</a>
            <a href="#stack" className="hover:text-foreground transition">Stack</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </nav>
          <a
            href="mailto:mouadmami2003@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Disponible CDI
            <span className="size-2 rounded-full bg-primary-foreground/80 animate-pulse" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto max-w-6xl px-6 pt-24 pb-32">
        <p className="text-sm uppercase tracking-[0.3em] text-primary mb-8">
          Développeur Fullstack · Le Mans, France
        </p>
        <h1 className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.95] tracking-tight">
          Je construis des <em className="text-gradient not-italic">produits</em>
          <br />web & mobile qui partent
          <br />en <em className="italic text-muted-foreground">production.</em>
        </h1>

        <div className="mt-12 grid md:grid-cols-3 gap-8 items-end">
          <p className="md:col-span-2 text-lg text-muted-foreground max-w-xl leading-relaxed">
            3 ans d'alternance chez <span className="text-foreground">Mindful House</span>.
            React, Node.js, Flutter, MongoDB. Une app web déployée, une app
            mobile sur l'App Store et le Play Store, un POC DevOps en interne.
            Je cherche aujourd'hui un <span className="text-foreground">CDI</span> pour continuer à livrer.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={cvAsset.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Télécharger le CV ↓
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-card transition"
            >
              Me contacter
            </a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {[
            ["3 ans", "d'alternance"],
            ["2 apps", "en production"],
            ["6+", "stacks maîtrisées"],
            ["4", "langues parlées"],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-6">
              <div className="font-display text-3xl text-gradient">{k}</div>
              <div className="text-sm text-muted-foreground mt-1">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="mx-auto max-w-6xl px-6 py-24 border-t border-border">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-display text-5xl md:text-7xl">Projets sélectionnés</h2>
          <span className="hidden md:block text-sm text-muted-foreground">/ 04</span>
        </div>

        <div className="space-y-px bg-border rounded-2xl overflow-hidden">
          {projects.map((p) => (
            <a
              key={p.n}
              href={p.href ?? undefined}
              target={p.href ? "_blank" : undefined}
              rel="noreferrer"
              className="group bg-background p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 hover:bg-card transition cursor-pointer"
            >
              <div className="text-primary font-mono text-sm w-12">{p.n}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-3xl md:text-4xl group-hover:text-gradient transition">
                    {p.name}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground">
                    {p.tag}
                  </span>
                </div>
                <p className="text-sm text-primary/90 mb-3">{p.role}</p>
                <p className="text-muted-foreground max-w-2xl leading-relaxed">{p.desc}</p>
              </div>
              {p.href && (
                <div className="text-2xl text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition">
                  →
                </div>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="mx-auto max-w-6xl px-6 py-24 border-t border-border">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-display text-5xl md:text-7xl">Parcours</h2>
          <span className="hidden md:block text-sm text-muted-foreground">2021 — 2025</span>
        </div>

        <div className="space-y-12">
          {experiences.map((e, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[200px_1fr] gap-8 pb-12 border-b border-border last:border-0"
            >
              <div>
                <div className="text-sm text-primary mb-2">{e.period}</div>
                <div className="flex items-center gap-3">
                  <img
                    src={e.logo}
                    alt={e.company}
                    className="size-12 rounded-lg bg-white/90 p-1 object-contain"
                  />
                  <div>
                    <div className="font-medium">{e.company}</div>
                    <div className="text-xs text-muted-foreground">{e.location}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl mb-4">{e.role}</h3>
                <ul className="space-y-2">
                  {e.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-muted-foreground">
                      <span className="text-primary mt-2 size-1 rounded-full bg-primary shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-card border border-border">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Formation</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="font-display text-xl">Mastère Manager SI</div>
              <div className="text-sm text-muted-foreground">CESI Le Mans · 2023 — 2025</div>
            </div>
            <div>
              <div className="font-display text-xl">Licence Pro Web</div>
              <div className="text-sm text-muted-foreground">Université d'Angers · 2022 — 2023</div>
            </div>
            <div>
              <div className="font-display text-xl">BTS SIO SLAM</div>
              <div className="text-sm text-muted-foreground">Lycée St Charles · 2020 — 2022</div>
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="mx-auto max-w-6xl px-6 py-24 border-t border-border">
        <h2 className="font-display text-5xl md:text-7xl mb-16">Stack technique</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {Object.entries(stack).map(([cat, items]) => (
            <div key={cat} className="bg-background p-6">
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <span
                    key={it}
                    className="text-sm px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary transition"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-32 border-t border-border">
        <p className="text-sm uppercase tracking-[0.3em] text-primary mb-8">Disponible pour un CDI</p>
        <h2 className="font-display text-5xl md:text-8xl leading-[0.95] mb-12">
          On en parle <span className="text-gradient">?</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <a
            href="mailto:mouadmami2003@gmail.com"
            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary transition glow"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Email</div>
            <div className="font-display text-2xl md:text-3xl group-hover:text-gradient transition">
              mouadmami2003@gmail.com
            </div>
          </a>
          <a
            href="tel:+33767860443"
            className="group p-8 rounded-2xl bg-card border border-border hover:border-primary transition"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Téléphone</div>
            <div className="font-display text-2xl md:text-3xl group-hover:text-gradient transition">
              +33 7 67 86 04 43
            </div>
          </a>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <a
            href="https://www.linkedin.com/in/mouad-charef-218b1a1b8/"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-full border border-border hover:bg-card hover:border-primary transition text-sm"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://gitlab.com/mcharef22"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-full border border-border hover:bg-card hover:border-primary transition text-sm"
          >
            GitLab ↗
          </a>
          <a
            href={cvAsset.url}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition text-sm"
          >
            CV PDF ↓
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2025 Mouad Charef · Le Mans, France</div>
          <div>Conçu et codé avec soin.</div>
        </div>
      </footer>
    </main>
  );
}
