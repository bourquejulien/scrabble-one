# LOG2990 - Serveur

Pour accéder au serveur, trois options s'offrent à vous :
1. Accéder à la page web du projet : (scrabble.one)[https://scrabble.one].
2. Exécuter ```sudo docker compose up``` (ou bien ```sudo docker-compose up```) dans le répertoire du seveur.
3. Lancer la commande ```npm start``` dans le répertoire du serveur.

## Précisions
### Option 2
Il faut au préalable avoir installé Docker et Docker compose.
- Docker : https://docs.docker.com/engine/install/
- Compose : https://docs.docker.com/compose/cli-command/

Puis exécuter ```sudo docker compose up``` dans le répertorie du serveur.

Un service mongodb sera automatiquement lancé avec le serveur du projet.

### Option 3
Il faut au préalable avoir créé un fichier ``.env`` dans le répertoire du projet.

Il est possible de fournir le serveur mongo de votre choix. Une URL vous est également déjà fournie dans le fichier ``sample.env``.


Bonne correction !
