# DuoSurprise Backend

Ce projet est le backend complet pour le site DuoSurprise, utilisant Node.js, Express et MongoDB.

## Prérequis

*   [Node.js](https://nodejs.org/) (v14+)
*   [MongoDB](https://www.mongodb.com/try/download/community) (S'assurer que le service est lancé localement ou utiliser une instance MongoDB Atlas)

## Installation

1.  Installez les dépendances :
    ```bash
    npm install
    ```

2.  Configurez les variables d'environnement dans le fichier `.env` (déjà créé avec des valeurs par défaut).

3.  Initialisez la base de données avec les produits :
    ```bash
    npm run seed
    ```

## Lancement

Pour lancer le serveur en mode production :
```bash
npm start
```

Pour lancer le serveur en mode développement (avec redémarrage automatique) :
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`.

## Architecture

*   `server.js` : Point d'entrée de l'application et configuration Express.
*   `models/` : Définition des schémas de données (Produits, Commandes, Newsletter).
*   `public/` : Contient les fichiers frontend statiques.
*   `seed.js` : Script pour peupler la base de données.
