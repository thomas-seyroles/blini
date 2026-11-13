@AGENTS.md

# Bluni

Appli mobile (maquette web 430px) née du partenariat BlaBlaCar x Lunii : les voyageurs enregistrent des anecdotes de leur région pendant un trajet, l'équipe d'auteurs Lunii les vérifie et en tire des histoires régionales pour enfants. Projet de site/prototype réalisé depuis le Figma.

## Cadrage du projet

Synthèse des questions de cadrage du 10 nov. 2026 (section « Cadrage du projet », page Bluni du Figma).

- Contexte : 20 ans BlaBlaCar, 10 ans Lunii. Axe principal : la contribution (raconter une anecdote).
- Cibles : enfants (communication), jeunes parents et personnes sans enfant qui ont des histoires à raconter.
- Enregistrement : passagers dans l'appli pendant le trajet ; conducteurs vérifiés (X trajets, bons avis) avec kit mains libres. Contenu : audio, texte, lieu ou région, photo.
- Statuts d'une anecdote : Envoyée, En écoute, Retenue, En écriture, Publiée. Vérification de conformité sous quelques jours.
- Récompenses : points à la validation (plus rien à l'envoi), gros bonus si retenue, histoire offerte, items spéciaux, remises trajets, badges et collection par région.
- Contraintes : consentement de tous les passagers, cession des droits à Lunii, protection des mineurs, contenu modéré.
- Trajets certifiés Bluni : règlement accepté, expérience conducteur, au moins un compte lié (BlaBlaCar ou Lunii).
- Tab bar : Trajets, Histoires, Raconter (centre, mis en avant), Cadeaux, Compte.
- Questions ouvertes : valeur de X, validité juridique du kit conducteur, mécanisme de consentement, gain d'une anecdote validée non retenue, achat des histoires dans Bluni ou redirection Lunii.

## Stack

Next.js 16 (App Router, Cache Components activé, lire `node_modules/next/dist/docs/` avant de coder), React 19, TypeScript, CSS Modules, lucide-react (icônes), gsap + @gsap/react, pnpm.
Back : PostgreSQL 17 (Docker, port 5433), Drizzle ORM (`postgres`), Server Actions. Mise en route et comptes de test : `README.md`.

## Back / front

- `src/server/` : tout le code serveur, jamais importé par un composant client hormis les Server Actions.
  - `db/schema.ts` (tables + vue `point_events`), `db/seed/` (jeu de test), migrations dans `drizzle/`.
  - `session.ts` (cookie signé), `auth.ts` (`getCurrentUser`, `requireUser`), `queries/` (lectures), `actions/` (`"use server"`, une action valide ses entrées et appelle `refresh()`).
- `src/lib/` : types partagés (DTO) et fonctions pures, utilisables des deux côtés. Pas de données en dur.
- `src/app/(app)/layout.tsx` charge le compte (`getAppData`) et le catalogue, exposés côté client par `useApp()` / `useCatalog()`. Panier, lecture en cours (`nowPlaying`, `queue` de la playlist lancée) et recherche restent dans le localStorage.
- `src/app/connexion/` : écrans hors session (accueil, choix du compte fictif BlaBlaCar ou Lunii dans `server/oauth.ts`, conditions qui valent inscription). Pas de connexion e-mail ni de mot de passe. `src/proxy.ts` redirige sans cookie.
- Points : jamais stockés, la vue `point_events` les déduit des anecdotes, trajets, items et réservations (barème `lib/points.ts` : validation 50, retenue 300, trajet passager 40, trajet conduit 60, rien à l'envoi d'une anecdote). Modifier le barème impose une migration (`pnpm db:generate`) car la vue embarque les valeurs.
- Remise trajet : l'item `remise-trajet` (200 pts, boutique Cadeaux) est un bon de 5 € (`user_items`, une ligne par exemplaire, `usedAt` = consommé, rachetable une fois consommé). Il s'applique au paiement d'une réservation (switch `useVoucher`, `lib/quote.ts`), seulement si l'aller est certifié, et `bookJourneys` le consomme dans la transaction. Plus de paiement direct en points.
- Prix d'un pack (collection) dynamique : (30 - histoires déjà possédées dans la région) × 2,99 € - 30 % (`packPriceCents` dans `lib/stories.ts`, partagé par le panier, les boutons d'achat et `purchaseStories`). Un pack ne bloque jamais le panier, seules les histoires à l'unité déjà possédées le font. Une histoire dont le pack est dans le panier y est incluse (0 €). Un pack est « acquis » quand le badge de la région est obtenu.
- Crédits d'une histoire : `stories.luniiAuthor` (auteur Lunii) et `story_contributors` (comptes dont l'anecdote retenue a inspiré l'histoire), chargés dans le catalogue (`Story.luniiAuthor`, `Story.contributors`, nom affiché « Prénom N. »). Composant `Credits` (icône plume + modal) dans le lecteur et le détail d'une histoire. Chaque contributeur renvoie vers le profil public `/profil/[userId]` (`getPublicProfile` : prénom et initiale, photo, rôle, badges, histoires inspirées, jamais d'e-mail).
- Badges de région : table `user_badges`, gagnés à l'achat du pack (collection) d'une région dans `purchaseStories`. Affichés par `Badges` dans Compte (`state.badges`) et sur le profil public conducteur (`getDriverBadges`, page `/reservation/trajet/[id]/conducteur`).
- Playlists : une par compte et par trajet à venir (`playlists`, unique `userId + journeyId`), entrées ordonnées dans `playlist_entries` (une histoire choisie OU une collection = région, dépliée à la lecture en histoires possédées). Écriture via `actions/playlists.ts` (`savePlaylist`), lecture dans `getAppData` (`playlists`), logique pure dans `lib/playlists.ts`. Éditeur : `/histoires/bibliotheque/trajet/[journeyId]`, atteint depuis la bibliothèque ou le bouton « Préparer les histoires » de l'accueil (`Trip.playlistHref`).
- Package Lunii : réservé aux comptes BlaBlaCar liés avec `users.blablacarTrips` >= 20 (`lib/package.ts`). Une commande par compte (`package_orders`), vérifiée côté serveur dans `actions/package.ts`. Enregistreur gratuit, conteuse 34,95 € (-50 % vs 69,90 € prix public Lunii).
- Paiements fictifs : ne pas intégrer de vrai prestataire.

Pas de Tailwind. Polices via `next/font` dans `src/app/layout.tsx` : Nunito (texte), Poppins (tab bar), CC ThisManThisMonster (titres, fichier local `src/app/fonts/`).

## Conventions

- Un composant = un dossier `src/components/Nom/Nom.tsx` + `Nom.module.css`. Import via l'alias `@/`.
- Composant créé seulement si l'élément se répète ou porte une logique (carrousel, tab bar). Sinon, markup dans la page.
- Server components par défaut, `"use client"` seulement si état ou événements.
- Couleurs, polices et rayons uniquement via les variables de `src/app/globals.css` (sections commentées). Ne pas coder de valeurs en dur.
- Icônes : lucide-react. Images et illustrations : `public/images/`, via `next/image`.
- Commentaires uniquement pour découper des sections, jamais pour paraphraser le code.
- Pas de tiret cadratin dans le code, les textes ou les commentaires.

## Déploiement (VPS)

Docker via `compose.prod.yaml`, dossier `/var/www/Bluni`, Caddy en reverse proxy vers `127.0.0.1:3000`, alias `dc='docker compose -f compose.prod.yaml'`. Le build prérend des pages qui lisent la base : la base doit être up et migrée avant (`network: host`, d'où `bake`).

Mise à jour :

```bash
cd /var/www/Bluni && git pull
dc --profile tools run --rm --build tools pnpm db:migrate
docker buildx bake -f compose.prod.yaml --allow=network.host app
dc up -d --no-build app
```

Optionnel, remise à zéro de la base (efface toutes les données) :

```bash
dc --profile tools run --rm tools pnpm db:seed      # vide et recharge le jeu de test
# ou repartir d'une base vierge :
dc down -v && dc up -d --wait db
dc --profile tools run --rm tools pnpm db:migrate
dc --profile tools run --rm tools pnpm db:seed
```

Après un reseed, reconstruire `app` (pages prérendues figées au build).

## Figma

Fichier `1pQjyqlVxvDVXtDnBXNgxa` (« Web »). Pages : Bluni (écrans), Composants, Assets, Chartes graphiques, Archives.
Section « Écrans » (node `78:238`) :

| Écran | Node | État |
|---|---|---|
| Trajets v2 (accueil) | `268:10717` | fait, route `/` |
| Trajets, Résultats (passager) | `268:10744` | à faire |
| Trajets, Résultats, Filtres (modale) | `268:10787` | à faire |
| Histoires, Écouter | `145:339` | à faire |
| Histoires (Boutique) | `149:370` | à faire |
| Compte | `78:207` | à faire |
| Raconter | `97:1068` | à faire |
| Cadeaux | `97:1020` | à faire |
| Bienvenue, Connexion | `343:1552`, `347:1551` | fait, `/connexion`, `/connexion/[service]` (e-mail retiré) |

Parcours à part : Raconter (`306:1239`) et Réservation (`317:1426`).
La tab bar a une version « Archives » en couleur : ne pas l'utiliser.

## Composants existants

`Button` (primary, secondary, accent, deactivated, prop `submit`), `OAuthButtons`, `ConditionsForm`, `Stars`, `AboardList`, `SectionTitle`, `TabBar` (prop `active`), `CartButton`, `SearchForm` > `SearchField` + `CriteriaTile`, `NextTripCard`, `SectionTabs` (Écouter, Bibliothèque, Boutique), `HistoiresListen` (lecteur + À suivre), `HistoiresLibrary` (playlists par trajet + bibliothèque), `PlaylistEditor`, `Badges`, `Credits`, `RegionCarousel` > `RegionTile`, `TripRow`, `Route` (tracé départ-arrivée en CSS, horizontal ou `vertical`), `PackageCta` (carte Compte, bannières Cadeaux et Raconter), `PackageFlow` (stepper `/compte/package`).

## Points en suspens

- Les liens de la tab bar et des boutons pointent vers des routes qui n'existent pas encore.
- Inscription (écran Figma `347:1594`) remplacée par l'écran des conditions après l'OAuth fictif.
- Enregistrement audio réel (MediaRecorder, 10 min max, stocké en `bytea` comme la photo, servi par `/api/anecdotes/[id]/audio`). Les anecdotes du seed n'ont pas d'audio : lecture fictive. Consentement des passagers simulé dans la validation.
- Photo conducteur : placeholder gris, comme dans le Figma.
