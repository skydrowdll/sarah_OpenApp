
# PLUGIN SARAH V3: OPEN APP

- le plugin OPEN APP (pour Sarah v3) permet d'ouvrir n'importe quel programe de votre ordinateur via un simple fichier json.

:::: INSTALATION ::::
- (1) Vous devez avoir installé et configuré le plugin SCRIBE => https://github.com/tilleul/Sarah.Scribe
- (2) Télécharger le plugin Open App et installez le dans le dossier plugins.

:::: FICHIERS ::::
- OpenApp.json 

Le fichier OpenApp.json contient les programmes a ouvrir, copié collé la ligne d'example avec google chrome et changé le chemin de votre programme.

name => nom du programe au quel sarah fera reference (ex. google chrome).

disk => le disque dur sur le quel votre programme est installé (ex. C ).

directory => l'emplacement sans le disque dur (ex. Program Files (x86)\Google\Chrome\Application\chrome.exe).

- CloseApp.json 
Le fichier CloseApp.json contient les programmes a fermer, copié collé la ligne d'example avec google chrome et changé le processus de votre programme

name => nom du programe au quel sarah fera reference le meme que celui de openapp.json (ex. google chrome).

process => le processus qui se fermera (ex. chrome.exe ).

:::: UTILISATION ::::

- Dite "SARAH DEMARRE GOOGLE CHROME" suite a cela google chrome s'ouvrira.
- Dite "SARAH TERMINE GOOGLE CHROME" suite a cela google chrome se fermera.

:::: IMPORTANT ::::

Il est recomander d'enlever le mot demarrer et terminé de vos autres plugin afin d'eviter des conflis de plugins
