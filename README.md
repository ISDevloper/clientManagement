# VOID - Espace Client

Application d'espace client pour les clients de la société VOID, développée avec Next.js, Tailwind CSS et Supabase.

## Fonctionnalités

- Authentification avec Supabase Auth
- Gestion des utilisateurs (CRUD)
- Rôles utilisateurs (Admin, Gestionnaire, Client)
- Interface responsive avec Tailwind CSS
- Profils utilisateurs

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## Configuration

1. Clonez ce dépôt :
```bash
git clone <url-du-repo>
cd void-space
```

2. Installez les dépendances :
```bash
npm install
# ou
yarn install
```

3. Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
```
NEXT_PUBLIC_SUPABASE_URL=https://dgmpjhqdnyvivmtzpzwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbXBqaHFkbnl2aXZtdHpwendvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyOTUxMzksImV4cCI6MjA1Njg3MTEzOX0.LAGC-eh54yzd73ArovpN7X9RiBilBmqnQRLJLANn4Ng
```

4. Configurez la base de données Supabase :
   - Connectez-vous à votre projet Supabase
   - Exécutez le script SQL dans `supabase/schema.sql` dans l'éditeur SQL de Supabase

## Démarrage

Pour démarrer l'application en mode développement :

```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
void-space/
├── app/                    # Pages Next.js (App Router)
│   ├── (protected)/        # Pages protégées par authentification
│   │   ├── admin/          # Pages d'administration
│   │   ├── profile/        # Page de profil utilisateur
│   │   └── page.js         # Dashboard
│   └── login/              # Page de connexion
├── components/             # Composants React réutilisables
│   ├── Navbar.jsx          # Barre de navigation
│   ├── Sidebar.jsx         # Barre latérale
│   └── UserProfile.jsx     # Composant de profil utilisateur
├── utils/                  # Utilitaires
│   └── supabase/           # Configuration Supabase
│       ├── client.js       # Client Supabase côté navigateur
│       └── server.js       # Client Supabase côté serveur
├── middleware.js           # Middleware Next.js pour l'authentification
└── supabase/               # Configuration Supabase
    └── schema.sql          # Schéma de base de données
```

## Utilisateurs par défaut

Un utilisateur administrateur a été créé :
- Email: mn@void.fr
- Mot de passe: mehdi123

## Déploiement

Cette application peut être déployée sur Vercel, Netlify ou tout autre service compatible avec Next.js.

```bash
npm run build
# ou
yarn build
```

## Licence

Propriétaire - Tous droits réservés
