# Portfolio ? Mouad Charef

Portfolio professionnel bilingue pr?sentant mon parcours en d?veloppement logiciel, mes comp?tences et cinq projets, dont PeopleFlow. Interface encre/cuivre, navigation mobile et CV PDF t?l?chargeable.

## Technologies

React 19, TypeScript, TanStack Router / Start, Vite 8 et Lucide React. Les pages sont pr?rendues pendant le build avec Nitro : le dossier publi? est enti?rement statique et ne n?cessite aucun serveur Node.js ? l?ex?cution.

## Fonctionnalit?s

- Versions fran?aise et anglaise avec m?tadonn?es propres et s?lecteur de langue.
- Cinq fiches projets, comp?tences, exp?riences et timeline de formation d?taill?e.
- CV fran?ais accessible dans les deux langues.
- Navigation clavier, affichage mobile et respect du mouvement r?duit.
- Polices syst?me sans service externe.

PeopleFlow est pr?sent? comme un projet personnel valid? localement. Les sch?mas des projets ne sont pas des captures de produits.

## Installation et d?veloppement

Node.js 22.12 ou sup?rieur ; le workflow utilise Node 22, d?fini dans `.nvmrc`. npm et `package-lock.json` sont la r?f?rence.

```sh
npm ci
npm run dev
```

## V?rifications

```sh
npm run check:publication
npm run typecheck
npm run lint
npm run build
npm test
npm run test:browser
```

Les tests utilisent le build statique et d?marrent leur propre serveur sur un port disponible. Le test navigateur n?cessite Edge install? sous Windows ou un navigateur Chromium indiqu? par `BROWSER_PATH`. Il v?rifie les langues, les cinq projets, la navigation mobile, le t?l?chargement du CV, les erreurs console et les interactions. Captures et profils temporaires sont conserv?s dans le dossier temporaire du syst?me, hors du d?p?t ; leur emplacement est affich? ? la fin.

`check:publication` recherche les fichiers locaux ind?sirables et plusieurs formats de secrets dans les fichiers candidats ? la publication. Ce contr?le cibl? compl?te la revue humaine du diff.

## Build et aper?u

```sh
npm run build
npm run preview
```

Le dossier ? publier est **`dist/`** : page fran?aise `index.html`, page anglaise `en/index.html`, ressources, CV, page 404 bilingue, `.nojekyll` et mentions tierces `THIRD_PARTY_NOTICES.txt`. `.output/` est un interm?diaire de compilation, pas le dossier ? publier.

Les routes canoniques sont `/` et `/en/`, pr?c?d?es du chemin du d?p?t lorsque n?cessaire. Le rechargement de la page anglaise fonctionne sans redirection globale vers une SPA. Les anciens liens `?lang=en` et `?lang=fr` sont redirig?s par le navigateur vers les pages correspondantes. Le choix de langue est m?moris? lorsque le stockage local est disponible.

Pour tester un h?bergement sous un chemin de d?p?t, dans PowerShell :

```powershell
$env:PAGES_BASE_PATH = '/nom-du-depot/'
$env:VITE_SITE_URL = 'https://UTILISATEUR.github.io/nom-du-depot/'
npm run build
npm test
npm run test:browser
npm run preview
```

Remplacer ces valeurs d?exemple par la destination r?elle. `PAGES_BASE_PATH` r?gle les routes, ressources et liens vers le CV ; `VITE_SITE_URL` fournit l?URL publique pour les canoniques et Open Graph. Ces variables sont publiques. Sans configuration, le build fonctionne ? la racine ; les canoniques absolues sont omises si aucune URL publique n?est fournie.

## GitHub Pages

Le workflow `.github/workflows/deploy.yml` est d?clench? par un push sur `main` ou manuellement. Il installe les d?pendances avec `npm ci`, v?rifie la publication, TypeScript et ESLint, construit le site, teste le r?sultat puis transmet `dist/` aux actions officielles GitHub Pages. Le chemin et l?URL sont fournis par `configure-pages`.

Le job de build poss?de uniquement la lecture du d?p?t. Seul le job de d?ploiement re?oit `pages: write` et `id-token: write`. Aucun token personnel n?est n?cessaire.

Apr?s validation locale, ? r?aliser manuellement :

1. Choisir le d?p?t GitHub, examiner les ajouts, modifications et suppressions, puis enregistrer les changements sans r??crire l?historique.
2. Dans **Settings ? Pages ? Build and deployment**, choisir **GitHub Actions**. V?rifier les r?gles de l?environnement `github-pages` et la branche `main`.
3. Publier les commits sur `main`, puis suivre l?ex?cution et ouvrir l?URL fournie par le job de d?ploiement.

Pour un domaine personnalis?, le configurer dans les param?tres Pages avant de reconstruire. Le workflow r?cup?re les informations de publication de GitHub. Aucun push ni d?ploiement n?est n?cessaire pour les commandes locales ci-dessus.

Documentation : [d?ploiement Pages par workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [chemins de d?ploiement Vite](https://vite.dev/guide/static-deploy.html).

## Organisation et maintenance

- `src/components/Portfolio.tsx` : sections et interactions.
- `src/data/portfolio.ts` : donn?es communes et types.
- `src/i18n/` : textes fran?ais/anglais et s?lection de langue.
- `src/routes/` : pages, document HTML et m?tadonn?es.
- `src/styles.css` : design, responsive et animations.
- `public/` : ressources publi?es, dont le CV volontairement public.
- `scripts/` : finalisation statique, aper?u et contr?les reproductibles.

Mettre ? jour les deux dictionnaires lors d?une ?volution du contenu. Le CV int?gr? reste inchang?. Les textes de licences des d?pendances sont conserv?s dans le build ; aucune licence de projet n?est ajout?e implicitement.
