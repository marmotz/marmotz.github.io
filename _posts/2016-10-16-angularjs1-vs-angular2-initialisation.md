---
layout   : post
title    : "AngularJS 1 vs Angular 2 : Initialisation"
date     : 2016-10-16 20:23:00 +0200
tags     : [ Tutoriel, AngularJS 1, Angular 2, Comparaison versions AngularJS ]
comments : true
---
Angular 2 vient de sortir et vous vous demandez ce que vaut cette nouvelle version par rapport à la précédente, ses qualités, ses défauts, ses différences ?

Ça tombe bien, on va comparer, à chaque étape, les forces et les faiblesses de chacune des versions grâce au développement d'une même application: un agenda en ligne.

![Départ]({{ site.url }}/images/2016/2016-10-16-angularjs1-vs-angular2-initialisation.jpg)

# Avant propos

Je travaille avec Linux et ne connais que ça. Les instructions suivantes sont donc toutes pour cet OS.

Si un développeur MacOS peut m'indiquer les commandes et les éventuelles différences qu'il peut y avoir avec MacOS, je me ferai un plaisir de compléter ce tutoriel.

\<troll>Si un développeur Windows... ah non pardon, un vrai développeur n'utiliserait pas Windows.</troll>

# Pré-requis

Les outils utilisés pour développer sont tous conçus en Node.js. Il est donc nécessaire d'installer [Node.js](https://nodejs.org) et [npm](https://www.npmjs.com).

À moins d'utiliser une distribution Linux exotique ou de vouloir tout compiler à la main, on peut directement installer ces deux outils depuis son gestionnaire de paquet. Toute l'aide nécessaire est disponible sur leurs sites respectifs.

Pensez également à installer [git](https://git-scm.com), si ce n'est pas déjà fait.

Il est évident également que vous devez connaître les bases du HTML, du CSS et de Javascript.

# Initialisation de l'application

## AngularJS 1

_Out of the box_, [AngularJS 1](https://angularjs.org) n'offre aucun outil pour initialiser un projet facilement. Il existe néanmoins un certain nombre de projets qui permettent de démarrer rapidement.

Voici les 2 principaux:

* [yeoman](http://yeoman.io) + [generator-angular](https://github.com/yeoman/generator-angular#readme) : permet de générer le squelette d'un projet AngularJS 1 ainsi que des squelettes de controllers, directives, filtres, etc...
* [angular-seed](https://github.com/angular/angular-seed#readme) : un dépôt [git](https://git-scm.com/) à cloner pour avoir un squelette d'application.

La communauté Open Source a créé des outils de plus ou moins bonnes qualités, pour initialiser, maintenir et développer une application AngularJS 1. Malheureusement aucun n'est devenu un standard _de facto_ et aucun n'est officiellement supporté par l'équipe Angular.

Aucun, sauf le dépôt angular-seed. On va donc choisir cette méthode :

```bash
git clone --depth=1 https://github.com/angular/angular-seed.git calendar-angularjs1
cd calendar-angularjs1
npm install
```

Profitons du temps que va prendre l'installation des dépendances pour expliquer 2 ou 3 choses.

Dans le dépôt, il y a un fichier `package.json` contenant un objet JSON qui vous permet de configurer un projet avec npm. Il y a notamment `devDependencies` qui permet de définir les dépendances, liées au développement, à installer et `scripts` qui vous permet de définir des commandes à lancer.

Ce fichier contient déjà les dépendances et les scripts nécessaires pour initialiser l'application. Notamment, vous pouvez remarquer qu'il n'y a aucune trace d'AngularJS dans les dépendances mais qu'on installe [bower](https://bower.io) et que le script `postinstall` (qui sera automatiquement lancé après un `npm install`) lance `bower install`.

Bower, quant à lui, utilise le fichier `bower.json`. Dans ce fichier, on trouvera `dependencies` qui contient AngularJS 1.

Il y a donc une séparation entre les outils de développement, gérés par npm (le serveur HTTP et les outils de tests unitaires et fonctionnels), et les bibliothèques nécessaires à notre application, gérées par bower (actuellement le core d'AngularJS 1, quelques modules Angular et un boilerplate HTML5).

Une fois que l'installation est terminée, on va faire un peu de nettoyage pour avoir un projet vierge et utilisable:

```bash
rm -rf .git
rm -rf app/components/version
rm -rf app/view*
echo "" > app/app.css
rm app/index-async.html
```

Éditez le fichier `app/app.js` pour enlever les références à ce qu'on vient de supprimer:

```javascript
'use strict';

angular
    .module('myApp', [ 'ngRoute' ])
    .config(
        [
            '$locationProvider', '$routeProvider',
            function($locationProvider, $routeProvider) {
                $locationProvider.hashPrefix('!');
            }
        ]
    )
;
```

Éditez également le fichier `app/index.html`:

```html
<!DOCTYPE html>
<!--[if lt IE 7]>      <html lang="en" ng-app="myApp" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" ng-app="myApp" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" ng-app="myApp" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html lang="en" ng-app="myApp" class="no-js"> <!--<![endif]-->
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Calendar Angular1</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="bower_components/html5-boilerplate/dist/css/normalize.css">
  <link rel="stylesheet" href="bower_components/html5-boilerplate/dist/css/main.css">
  <link rel="stylesheet" href="app.css">
  <script src="bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js"></script>
</head>
<body>
  <!--[if lt IE 7]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
  <![endif]-->

  <h1>Agenda en ligne</h1>

  <div ng-view></div>

  <script src="bower_components/angular/angular.js"></script>
  <script src="bower_components/angular-route/angular-route.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

Maintenant, on peut enfin tester l'application en lançant le serveur HTTP:

```bash
npm start
```

... et en ouvrant [`http://localhost:8000`](http://localhost:8000){:target="_blank"} dans son navigateur préféré.

Et voilà ! Notre application AngularJS 1 est maintenant initialisée.


## Angular 2

Pour cette nouvelle version, c'est __beaucoup__ plus simple.

L'équipe Angular a créé un outil qui permet d'initialiser et de générer des bouts de code, sobrement appelé angular-cli.

<div class="notice" markdown="1">
**Note:** à l'heure de l'écriture de cet article, angular-cli est encore en beta mais commence à être suffisamment stable pour être utilisé.
</div>

Pour l'installer, rien de plus simple (n'ayez pas peur des nombreux messages, warnings et erreurs qui pourraient s'afficher durant l'installation):

```bash
sudo npm install -g angular-cli
```

L'initialisation du projet est toute aussi simple:

```bash
ng new calendar-angular2
cd calendar-angular2
```

Et pour accéder à l'application, il suffit de lancer le serveur:

```bash
ng serve
```

... et d'ouvrir [`http://localhost:4200`](http://localhost:4200){:target="_blank"} dans son navigateur préféré.

Et voilà ! Notre application Angular 2 est maintenant initialisée.

# Conclusion

Il n'y a pas photo.

D'un coté, Angular JS 1 n'a pas véritablement de standard pour initialiser et organiser son application.

De l'autre, Angular 2 a un outil officiel qui initialise l'application, installe les outils de développement et permet d'organiser son application et de générer les composants qu'on utilisera.

__Un point pour Angular 2 qui sort grand vainqueur de cette première étape.__

<div class="notice" markdown="1">
**Note:** Vous pouvez retrouver [le projet AngularJS 1](https://github.com/marmotz/calendar-angularjs1) et [le projet Angular 2](https://github.com/marmotz/calendar-angular2) dans leurs dépôts github respectifs.
</div>
