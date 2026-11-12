@AGENTS.md

# Bluni

Appli mobile (maquette web 430px) née du partenariat BlaBlaCar x Lunii : les voyageurs enregistrent des anecdotes de leur région pendant un trajet, l'équipe d'auteurs Lunii les vérifie et en tire des histoires régionales pour enfants. Projet de site/prototype réalisé depuis le Figma.

## Cadrage du projet

Synthèse des questions de cadrage du 10 nov. 2026 (section « Cadrage du projet », page Bluni du Figma).

- Contexte : 20 ans BlaBlaCar, 10 ans Lunii. Axe principal : la contribution (raconter une anecdote).
- Cibles : enfants (communication), jeunes parents et personnes sans enfant qui ont des histoires à raconter.
- Enregistrement : passagers dans l'appli pendant le trajet ; conducteurs vérifiés (X trajets, bons avis) avec kit mains libres. Contenu : audio, texte, lieu ou région, photo.
- Statuts d'une anecdote : Envoyée, En écoute, Retenue, En écriture, Publiée. Vérification de conformité sous quelques jours.
- Récompenses : points dès l'envoi, bonus à la validation, histoire offerte, items spéciaux, remises trajets, badges et collection par région.
- Contraintes : consentement de tous les passagers, cession des droits à Lunii, protection des mineurs, contenu modéré.
- Trajets certifiés Bluni : règlement accepté, expérience conducteur, au moins un compte lié (BlaBlaCar ou Lunii).
- Tab bar : Trajets, Histoires, Raconter (centre, mis en avant), Cadeaux, Compte.
- Questions ouvertes : valeur de X, validité juridique du kit conducteur, mécanisme de consentement, gain d'une anecdote validée non retenue, achat des histoires dans Bluni ou redirection Lunii.

## Stack

Next.js 16 (App Router, lire `node_modules/next/dist/docs/` avant de coder), React 19, TypeScript, CSS Modules, lucide-react (icônes), gsap + @gsap/react (animations, pas encore utilisé), pnpm.

Pas de Tailwind. Polices via `next/font` dans `src/app/layout.tsx` : Nunito (texte), Poppins (tab bar), CC ThisManThisMonster (titres, fichier local `src/app/fonts/`).

## Conventions

- Un composant = un dossier `src/components/Nom/Nom.tsx` + `Nom.module.css`. Import via l'alias `@/`.
- Composant créé seulement si l'élément se répète ou porte une logique (carrousel, tab bar). Sinon, markup dans la page.
- Server components par défaut, `"use client"` seulement si état ou événements.
- Couleurs, polices et rayons uniquement via les variables de `src/app/globals.css` (sections commentées). Ne pas coder de valeurs en dur.
- Icônes : lucide-react. Images et illustrations : `public/images/`, via `next/image`.
- Commentaires uniquement pour découper des sections, jamais pour paraphraser le code.
- Pas de tiret cadratin dans le code, les textes ou les commentaires.

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

Parcours à part : Raconter (`306:1239`) et Réservation (`317:1426`).
La tab bar a une version « Archives » en couleur : ne pas l'utiliser.

## Composants existants

`Button` (primary, secondary, accent, deactivated), `SectionTitle`, `TabBar` (prop `active`), `CartButton`, `SearchForm` > `SearchField` + `CriteriaTile`, `NextTripCard`, `RegionCarousel` > `RegionTile`, `TripRow`.

## Points en suspens

- Les liens de la tab bar et des boutons pointent vers des routes qui n'existent pas encore.
- Données de l'accueil en dur dans `page.tsx` (maquette, pas d'API).
- Photo conducteur : placeholder gris, comme dans le Figma.
