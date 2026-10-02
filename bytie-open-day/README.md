# Bytie Open Day

Bytie Open Day est un jeu de quiz interactif conçu pour une journée portes ouvertes. Le joueur est accompagné par Bytie, une mascotte robot animée. Il enchaîne trois petits jeux (Zoom Reveal, Connections, Timeline), obtient un score sur 300 et un rang, puis Bytie lui lit dans une bulle un résumé de sa partie rédigé par une intelligence artificielle (Gemini). Ce texte est signalé comme généré par IA dans la bulle.

Le projet est composé de deux applications qui communiquent par HTTP :

* un frontend React (dossier `jeu-mascotte`) qui affiche les jeux, calcule les scores et anime Bytie ;
* un backend Python FastAPI (dossier `backend`) qui tire des manches au hasard dans MongoDB, sert les logos et appelle Gemini.

## 1. Parcours du joueur

1. Écran d'accueil avec le bouton Start Playing. Au clic, le frontend demande une nouvelle partie au backend.
2. Zoom Reveal : trouver un logo pendant qu'il se dézoome (3 manches).
3. Connections : retrouver quatre groupes de quatre mots (1 grille).
4. Timeline : remettre des événements dans l'ordre chronologique (3 manches).
5. Résultats : score total, rang, statistiques de chaque jeu, et à côté Bytie avec son résumé généré par Gemini. Le bouton Play Again lance une nouvelle partie avec de nouvelles manches.

Chaque partie est différente : le backend tire au hasard 3 manches Zoom parmi 20, 1 grille Connections parmi 7 et 3 manches Timeline parmi 12.

## 2. Règles et calcul des scores

Chaque jeu donne un score sur 100. Le total est donc sur 300. Les valeurs ci dessous se règlent dans `jeu-mascotte/src/config/scoring.config.ts` et les formules sont dans `jeu-mascotte/src/logic/scoring.ts`.

### Zoom Reveal

Un logo apparaît très agrandi puis se dézoome en 5 étapes de 6 secondes chacune. Le joueur choisit la bonne réponse parmi 4 propositions. Plus il trouve tôt, plus il gagne de points :

* étape 1 : 100 points, étape 2 : 80, étape 3 : 60, étape 4 : 40, étape 5 : 20 ;
* chaque mauvaise réponse retire 10 points sur la manche (jamais en dessous de 0) ;
* si le temps est écoulé sans bonne réponse, la manche vaut 0 et Bytie donne la réponse.

Un bouton d'indice permet à Bytie de donner un indice dans sa bulle. Les indices ne coûtent aucun point. Le score du jeu est la somme des points des manches divisée par le maximum possible, ramenée sur 100.

### Connections

Seize mots sont affichés. Le joueur sélectionne quatre mots qu'il pense liés par un thème, puis valide. Il peut mélanger les mots ou désélectionner.

* chaque groupe trouvé rapporte des points selon sa difficulté : 10, 20, 30 et 40 points ;
* chaque erreur retire 5 points et coûte une vie sur 4 ;
* si les quatre groupes sont trouvés, un bonus de temps allant jusqu'à 20 points s'ajoute, proportionnel au temps restant sur 180 secondes ;
* la partie s'arrête quand les 4 groupes sont trouvés, quand les 4 vies sont perdues, ou quand les 180 secondes sont écoulées ;
* le total est divisé par 120 puis ramené sur 100.

Quand le joueur est à un seul mot d'un groupe, Bytie le signale.

### Timeline

Quatre événements sont proposés dans le désordre et le joueur les glisse dans l'ordre, du plus ancien au plus récent. Chaque manche dure 45 secondes. Le score d'une manche dépend de la part de paires d'événements bien ordonnées (6 paires avec 4 événements) :

* 80 points multipliés par la précision ;
* plus un bonus de temps allant jusqu'à 20 points, multiplié lui aussi par la précision, pour qu'aller vite avec une mauvaise réponse ne rapporte presque rien ;
* après validation, la date réelle et une anecdote s'affichent sous chaque événement.

Le score du jeu est la moyenne des trois manches.

### Rang final

Le rang dépend du total sur 300 :

* 240 points ou plus : PRO MASTER ;
* de 150 à 239 points : INTERMEDIATE ;
* moins de 150 points : BEGINNER.

La précision globale affichée sur la page de résultats est le total divisé par 300.

## 3. Architecture

Le navigateur (React, port 5173) appelle l'API FastAPI (port 8000). FastAPI lit les manches dans MongoDB (port 27017), sert les images des logos et appelle l'API Gemini de Google pour le résumé de fin de partie. Si Gemini est indisponible, FastAPI renvoie un résumé local écrit sans IA.

Les scores sont calculés dans le navigateur. Le backend expose aussi un endpoint de calcul du score Zoom, mais le jeu ne l'utilise pas actuellement.

### Structure du dépôt

```
bytie-open-day/
    README.md
    .gitignore
    backend/
        requirements.txt
        .env.example
        logos/                      20 logos au format PNG, servis sur /logos
        app/
            main.py                 application FastAPI, CORS, service des logos
            config.py               lecture du fichier .env
            database.py             connexion MongoDB et collections
            schemas.py              modèles Pydantic des requêtes et réponses
            seed_db.py              remplit MongoDB avec toutes les manches
            diagnostic.py           outil de vérification de l'installation
            routers/
                game.py             endpoints de l'API
            services/
                ai_feedback.py      appel à Gemini et résumé de repli
                scoring.py
    jeu-mascotte/
        package.json
        .env.example
        src/
            App.tsx                 routes de l'application
            pages/
                Mainframe.tsx       écran d'accueil
                GameShell.tsx       enchaînement des jeux et introductions
                Gameframe.tsx       cadre commun : fond, vagues, Bytie, bulle
                Results.tsx         page de résultats
            games/
                ZoomGame.tsx
                ConnectionsGame.tsx
                TimelineGame.tsx
            components/
                Bytie.tsx           la mascotte animée
                Speechbubble.tsx    la bulle de dialogue
                WaveBorder.tsx
            store/
                gameStore.ts        session de jeu, scores, enchaînement
                shellStore.ts       bulle de Bytie, texte du bandeau
            services/
                api.ts              appels HTTP vers le backend
            logic/
                scoring.ts          formules de score
            config/
                scoring.config.ts   barème réglable
            data/
                gamesData.tsx       types, constantes (zoom, vies) et données d'exemple
```

### Technologies

* Frontend : React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, React Router 7, Zustand 5.
* Backend : FastAPI, Uvicorn, Motor (pilote MongoDB asynchrone), Pydantic, Pydantic Settings, httpx.
* Base de données : MongoDB en local.
* Intelligence artificielle : API Gemini de Google, appelée en REST.

## 4. Prérequis

* Python 3.10 ou plus récent.
* Une version récente de Node.js (la version 20.19 ou plus est conseillée) et npm.
* MongoDB Community Server installé et démarré sur le port 27017.
* Une clé API Gemini, créée sur https://aistudio.google.com/apikey. Elle est facultative : sans elle, tout fonctionne et Bytie affiche le résumé local à la place du résumé IA.

## 5. Installation et lancement

Ordre à respecter : MongoDB, remplissage de la base, backend, puis frontend. Les commandes ci dessous sont celles de Windows PowerShell.

### 5.1 Backend

```
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Ouvrez ensuite `backend/.env` et renseignez au moins `GEMINI_API_KEY` (voir la section Configuration). Si PowerShell refuse d'activer l'environnement virtuel, exécutez d'abord `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` dans la même fenêtre.

Sur macOS ou Linux, utilisez `source venv/bin/activate` et `cp .env.example .env`.

Remplissez la base une première fois :

```
python -m app.seed_db
```

Puis démarrez l'API :

```
uvicorn app.main:app --reload --port 8000
```

Vérifiez que `http://localhost:8000/health` répond `{"status":"ok"}`. La documentation interactive de l'API est disponible sur `http://localhost:8000/docs`, où l'on peut tester chaque endpoint.

### 5.2 Frontend

Dans un second terminal :

```
cd jeu-mascotte
npm install
npm run dev
```

Ouvrez `http://localhost:5173`, puis cliquez sur Start Playing.

### 5.3 Commandes utiles du frontend

```
npm run build       vérification TypeScript puis build de production dans dist
npm run lint        analyse du code avec oxlint
npm run preview     prévisualisation du build de production
```

## 6. Configuration

### Backend : fichier `backend/.env`

* `MONGODB_URI` : adresse de MongoDB. Valeur par défaut : `mongodb://localhost:27017`.
* `GEMINI_API_KEY` : clé de l'API Gemini. Vide par défaut, ce qui active le résumé local.
* `GEMINI_MODEL` : modèle utilisé. Valeur par défaut : `gemini-3.7-flash`. Le modèle `gemini-3.5-flash-lite` est plus rapide et moins coûteux, utile si beaucoup de joueurs terminent en même temps.
* `GEMINI_TIMEOUT_SEC` : délai maximal d'attente de Gemini avant de basculer sur le résumé local. Valeur par défaut : 10 secondes.
* `MONGODB_DB_NAME` : lue uniquement par le script de remplissage. L'API utilise toujours la base `tech_quiz_db` définie dans `database.py`. Ne changez pas cette variable, sinon le script et l'API ne regarderaient plus la même base.
* `PORT` apparaît dans le fichier d'exemple, mais le port réel est celui passé à la commande `uvicorn`.

Après chaque modification du fichier `.env`, redémarrez `uvicorn` : il ne relit pas ce fichier à chaud, même avec l'option `reload`.

### Frontend : fichier `jeu-mascotte/.env`

* `VITE_API_ORIGIN` : adresse du backend. Valeur par défaut : `http://localhost:8000`. À définir avant `npm run dev` ou `npm run build` si le backend est ailleurs.

### Langue du résumé IA

Le résumé est généré en anglais, comme le reste de l'interface. Pour obtenir du français, changez la constante `AI_LANGUAGE` en haut de `jeu-mascotte/src/pages/Results.tsx` en `"fr"`.

## 7. API

Toutes les routes de jeu commencent par `/api/game`.

### `GET /health`

Renvoie `{"status": "ok"}`. Sert à vérifier que le backend tourne.

### `GET /api/game/session`

Tire une nouvelle partie au hasard. Réponse :

```
{
  "zoom": [ 3 manches Zoom ],
  "connectionsWords": [ 16 mots mélangés ],
  "connectionsGroups": [ 4 groupes avec leur catégorie, difficulté, points et mots ],
  "timeline": [ 3 manches Timeline de 4 événements chacune ]
}
```

Si une collection est vide, l'API répond 503 avec un message qui indique de lancer le remplissage de la base, au lieu de renvoyer des tableaux vides.

### `POST /api/game/ai-analysis`

Génère le résumé de fin de partie. Corps de la requête :

```
{
  "zoom_score": 85,
  "connections_score": 40,
  "timeline_score": 70,
  "rank_title": "INTERMEDIATE",
  "language": "en"
}
```

Les trois scores sont des entiers de 0 à 100. `rank_title` vaut `PRO MASTER`, `INTERMEDIATE` ou `BEGINNER`. `language` vaut `en` ou `fr`. Toute autre valeur est refusée avec une erreur 422. Réponse :

```
{
  "comment": "Texte du résumé",
  "source": "gemini",
  "model": "gemini-3.7-flash"
}
```

Le champ `source` vaut `gemini` si le texte vient de l'IA, ou `fallback` si c'est le résumé local (dans ce cas `model` vaut `null`). L'interface n'affiche la pastille AI · Gemini que lorsque `source` vaut `gemini`.

### `POST /api/game/score/zoom`

Calcule le score d'une manche Zoom côté serveur à partir de `answered_stage` (de 0 à 4, ou `null`) et de `wrong_guesses`. Disponible, mais non utilisé par le jeu actuel.

### `GET /logos/nom.png`

Sert les images des logos depuis le dossier `backend/logos`.

## 8. Base de données

La base s'appelle `tech_quiz_db` et contient trois collections remplies par `python -m app.seed_db`.

* `zoom_rounds` : 20 documents.
* `connections_rounds` : 7 documents.
* `timeline_rounds` : 12 documents.

Attention : le script de remplissage vide les trois collections puis les réinsère. Toute modification faite à la main dans la base est donc perdue quand on le relance.

### Format d'une manche Zoom

```
{
  "id": "zoom-apple",
  "image": "/logos/apple.png",
  "answer": "Apple",
  "acceptedAnswers": ["apple", "apple inc", "apple inc."],
  "category": "tech",
  "options": ["Apple", "Samsung", "Sony", "Huawei"],
  "hints": ["Premier indice", "Deuxième indice", "Troisième indice"],
  "focus": {"x": 62, "y": 28}
}
```

`focus` indique, en pourcentage de l'image, le point autour duquel le zoom se fait. `answer` doit figurer dans `options`.

### Format d'une grille Connections

```
{
  "id": "connections-1",
  "groups": [
    {"id": "conn-web-languages", "category": "Web languages", "difficulty": 1, "points": 10, "words": ["HTML", "CSS", "JavaScript", "PHP"]}
  ]
}
```

Chaque grille contient 4 groupes de difficulté 1 à 4, avec 4 mots chacun.

### Format d'une manche Timeline

```
{
  "id": "timeline-1",
  "difficulty": "easy",
  "events": [
    {"id": "tl1-moon", "title": "First humans walk on the Moon", "year": 1969, "fact": "Anecdote affichée après validation."}
  ]
}
```

Chaque manche contient 4 événements dont les années sont toutes différentes.

## 9. Résumé IA avec Gemini

Quand la page de résultats s'ouvre, Bytie dit d'abord un court message d'attente, pendant que le frontend envoie les trois scores au backend. Le backend construit alors une consigne pour Gemini :

1. une consigne système qui présente Bytie, les trois jeux et le style attendu : 2 ou 3 phrases, 50 mots au maximum, ton encourageant, une force, un point à améliorer et un conseil, sans markdown ;
2. les données du joueur : les trois scores, le total et le rang.

Le backend appelle l'API REST de Gemini (`generateContent`) avec la clé placée dans l'en tête de la requête, et non dans l'adresse, pour qu'elle n'apparaisse pas dans les journaux. Le niveau de réflexion du modèle est réglé sur bas pour répondre vite. Si le modèle refuse ce réglage (erreur 400), la requête est renvoyée une fois sans lui. Le texte reçu est nettoyé (restes de markdown retirés) et limité à environ 320 caractères, coupé à la fin d'une phrase.

Le backend ne renvoie jamais d'erreur au joueur à cause de Gemini. Dans tous les cas d'échec (clé absente ou invalide, quota dépassé, modèle inconnu, réseau coupé, délai dépassé, réponse vide), il renvoie un résumé local écrit sans IA et marque `source` à `fallback`. L'interface n'affiche alors pas la pastille AI · Gemini, pour ne jamais annoncer comme généré par IA un texte qui ne l'est pas.

Le serveur écrit la cause de chaque bascule dans le terminal d'`uvicorn`, sur une ligne qui commence par `Gemini indisponible`.

Sécurité des entrées : l'endpoint n'accepte que des nombres bornés et des valeurs fermées pour le rang et la langue. Il est donc impossible d'injecter du texte libre dans la consigne envoyée à Gemini.

## 10. Diagnostic

Depuis le dossier `backend`, avec l'environnement virtuel activé :

```
python -m app.diagnostic
```

Cette commande vérifie trois choses et affiche `[OK]` ou `[PROBLEME]` pour chacune :

1. MongoDB : la base utilisée par l'API, le nombre de documents de chaque collection et la liste des grilles Connections présentes ;
2. Gemini : la présence de la clé, puis un vrai appel avec l'erreur exacte en cas d'échec ;
3. les fichiers du projet restés dans une ancienne version.

C'est le premier outil à utiliser en cas de comportement inattendu.

## 11. Dépannage

**Le bouton Start Playing affiche une erreur ou la partie ne démarre pas.** Le backend n'est probablement pas lancé, ou la base est vide. Testez `http://localhost:8000/health`. Un message mentionnant une base vide signifie qu'il faut lancer `python -m app.seed_db`.

**Les logos ne s'affichent pas.** Vérifiez que le dossier `backend/logos` contient les images et que `VITE_API_ORIGIN` pointe vers le bon backend. Une image doit s'ouvrir directement à l'adresse `http://localhost:8000/logos/apple.png`.

**La même grille Connections revient à chaque partie.** Lancez le diagnostic pour vérifier que les 7 grilles sont en base, puis ouvrez `http://localhost:8000/api/game/session` plusieurs fois dans le navigateur. Si les catégories changent à chaque rafraîchissement, l'API est correcte et un ancien fichier du frontend est probablement resté en place.

**Le résumé affiché est le texte local, sans pastille AI.** Regardez la ligne `Gemini indisponible` dans le terminal d'`uvicorn`. Les cas les plus fréquents :

* la clé est absente du fichier `.env`, ou `uvicorn` n'a pas été redémarré après l'avoir ajoutée ;
* erreur 400 avec un message sur la clé : la clé est invalide ou mal recopiée ;
* erreur 403 : Google refuse l'accès au projet auquel la clé est rattachée. Créez la clé dans un nouveau projet sur Google AI Studio, ou essayez avec un autre compte Google ;
* erreur 404 : le nom du modèle n'existe pas. Corrigez `GEMINI_MODEL` ;
* erreur 429 : quota dépassé. Patientez, ou utilisez un modèle de la gamme Flash Lite ;
* erreur de connexion ou délai dépassé : vérifiez la connexion internet, un éventuel VPN ou proxy.

**Les modifications du fichier `.env` n'ont aucun effet.** Redémarrez `uvicorn`.

**Une erreur CORS apparaît dans la console du navigateur.** Le frontend n'atteint pas le backend. Vérifiez que `uvicorn` tourne sur le port 8000 et que `VITE_API_ORIGIN` est correct.

**Un port est déjà utilisé.** Fermez l'ancien processus, ou lancez `uvicorn` avec un autre port et ajustez `VITE_API_ORIGIN`.

**Un message de console parle de l'attribut `d` d'un élément `path`.** Il vient de l'animation SVG de la mascotte. Il n'empêche pas le jeu de fonctionner.

## 12. Personnaliser le jeu

### Ajouter ou modifier des manches

1. Pour un nouveau logo Zoom, déposez l'image PNG dans `backend/logos`.
2. Ajoutez la manche dans la liste correspondante du fichier `backend/app/seed_db.py`, en suivant les formats décrits dans la section Base de données.
3. Relancez `python -m app.seed_db` puis la partie : les nouvelles manches entrent dans le tirage au hasard.

### Régler le barème et les durées

Le fichier `jeu-mascotte/src/config/scoring.config.ts` regroupe les points par étape du Zoom, la durée de chaque étape, les points des groupes Connections, la pénalité d'erreur, les bonus de temps et les durées limites de Connections et de Timeline. Si vous changez les points maximums, mettez aussi à jour le seuil des rangs dans `Results.tsx` (240 et 150 sur 300).

### Modifier les textes de Bytie

Les phrases d'introduction de chaque jeu sont dans `pages/GameShell.tsx`. Les réactions pendant les parties sont dans les fichiers de chaque jeu, dans le dossier `games`.

### Changer l'apparence de la page de résultats

La disposition (Bytie et sa bulle à gauche, statistiques à droite) est dans `pages/Gameframe.tsx`. Le contenu de la carte de statistiques est dans `pages/Results.tsx`. La bulle et sa pastille IA sont dans `components/Speechbubble.tsx`.

## 13. Sécurité

* Ne placez jamais la clé Gemini dans le frontend : elle doit rester dans `backend/.env`, que seul le serveur lit.
* Ne partagez jamais le fichier `.env`, ni dans une archive, ni dans un dépôt Git, ni dans une capture d'écran. Le fichier `.gitignore` à la racine l'exclut du suivi Git. Si `.env` a déjà été ajouté à Git par le passé, retirez le du suivi avec `git rm --cached backend/.env`, puis révoquez la clé dans Google AI Studio et créez en une nouvelle, car l'ancienne reste visible dans l'historique.
* Si une clé a été exposée, révoquez la immédiatement.
* Pour un déploiement public, remplacez `allow_origins=["*"]` dans `backend/app/main.py` par la liste des adresses réelles de votre frontend, et n'exposez pas MongoDB sur internet.

## 14. Déploiement

1. Construisez le frontend avec `npm run build` en ayant défini `VITE_API_ORIGIN` sur l'adresse publique du backend. Le résultat se trouve dans `jeu-mascotte/dist` et peut être servi par n'importe quel hébergeur de fichiers statiques.
2. Lancez le backend avec `uvicorn app.main:app --host 0.0.0.0 --port 8000`, sans l'option `reload`, derrière un serveur web ou un proxy inverse en HTTPS.
3. Fournissez au backend un MongoDB rempli avec `python -m app.seed_db`, et les variables du fichier `.env` sous forme de variables d'environnement.
4. Restreignez les origines CORS comme indiqué dans la section Sécurité.
