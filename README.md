# Bluni

Prototype web mobile (430px) BlaBlaCar x Lunii : Next.js 16, PostgreSQL, Drizzle.

## Démarrage

Prérequis : Node 24, pnpm, Docker.

```bash
pnpm install
cp .env.example .env      # puis remplacer SESSION_SECRET (openssl rand -base64 32)
pnpm db:setup             # Postgres en Docker (port 5433), migrations, jeu de test
pnpm dev
```

## Base de données

| Commande | Rôle |
|---|---|
| `pnpm db:up` | démarre Postgres (`compose.yaml`) |
| `pnpm db:migrate` | applique les migrations de `drizzle/` |
| `pnpm db:generate` | crée une migration après modification de `src/server/db/schema.ts` |
| `pnpm db:seed` | vide la base et recharge le jeu de test (dates relatives au jour du seed) |
| `pnpm db:studio` | Drizzle Studio : consulter les données, faire avancer le statut d'une anecdote (0 à 4) |

## Comptes de test

Connexion uniquement via BlaBlaCar ou Lunii (OAuth simulé : annuaire fictif dans `src/server/oauth.ts`, chaque compte appartient à un seul service). Un compte absent de la base, ou sans règlement accepté, passe par l'écran des conditions : les valider l'inscrit à Lunii et l'ajoute en base.

| Compte | Intérêt |
|---|---|
| BlaBlaCar : Thomas Seyroles (seyroles.thomas@gmail.com) | seul compte BlaBlaCar proposé, volontairement absent de la base : arrive comme un nouvel utilisateur (conditions, puis compte vide). Un `pnpm db:seed` le réinitialise |
| Lunii : Camille Durand | passagère, règlement non accepté : passe par les conditions |
| Lunii : Anaïs Colin | pas encore en base : crée le compte à l'acceptation des conditions |

Le seed génère aussi ~480 comptes (dont Théo Martin, Julie Bernard et les autres comptes de test, sans connexion possible depuis l’annuaire OAuth) avec photo, ~50 villes et plus de 40 000 trajets entre grandes villes (J-10 à J+30).

Les paiements sont fictifs : aucun prestataire n'est appelé, la réservation crée des demandes de place et l'achat ajoute les histoires à la bibliothèque.
