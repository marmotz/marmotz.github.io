---
layout   : post
title    : "AngularJS 1 vs Angular 2 : Premiers composants"
tags     : [ Tutoriel, AngularJS 1, Angular 2, Comparaison versions AngularJS ]
comments : true
---
Dans [l'épisode précédent]({% post_url 2016-10-16-angularjs1-vs-angular2-initialisation %}), nous avons initialisé nos projets [AngularJS 1](https://github.com/marmotz/calendar-angularjs1) et [Angular 2](https://github.com/marmotz/calendar-angular2). C'est bien, mais c'est vide... Et si nous nous mettions à construire quelque chose ?

![Une affaire de brique]({{ site.url }}/images/2016/2016-10-23-angularjs1-vs-angular2-premiers-composants.jpg)

* toc
{:toc}

Pour commencer, nous allons afficher le tableau de la semaine à venir avec des rendez-vous.

# AngularJS 1

## Renommage de l'application

Tout d'abord renommons l'application.

Dans `app/index.html`, modifiez les occurrences de `myApp` par un nom qui suit [les conventions de nommage](https://github.com/mgechev/angularjs-style-guide/blob/master/README-fr-fr.md#modules), par exemple `mzCalendar`:

```html
<!DOCTYPE html>
<!--[if lt IE 7]>      <html lang="en" ng-app="mzCalendar" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html lang="en" ng-app="mzCalendar" class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html lang="en" ng-app="mzCalendar" class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html lang="en" ng-app="mzCalendar" class="no-js"> <!--<![endif]-->
...
```

Idem pour le fichier `app/app.js`:

```javascript
'use strict';

angular
    .module('mzCalendar', [ 'ngRoute' ])
...
```

## Création du premier composant

<div class="notice" markdown="1">
**Les composants:**

La principale nouveauté d'AngularJS 1.5 a été l'arrivée des [composants](https://docs.angularjs.org/guide/component), un nouveau type de directive.

Le but principal est de décomposer en briques élémentaires l'application pour que, d'une part, elles soient réutilisables et que, d'autre part, elles soient spécialisées.

Au lieu de faire une grosse page HTML avec un controller qui gère tout, nous allons découper en plus petits éléments.

De plus, cette approche est la même que pour Angular2. Nous allons donc l'utiliser.
</div>

Nous allons maintenant créer notre premier composant qui sera la page d'accueil de notre agenda.

Créez les fichiers `app/components/calendar/calendar.js` et `app/components/calendar/calendar.html`.

```javascript
"use strict";

angular
    .module(
        'mzCalendar.component.calendar',
        [
            'ngRoute',
            'mzCalendar.service.booking',
        ]
    )
    .config(
        [
            '$routeProvider',
            function($routeProvider) {
                $routeProvider.when(
                    '/calendar',
                    {
                        template: '<mz-calendar></mz-calendar>',
                    }
                );
            }
        ]
    )

    .component(
        'mzCalendar',
        {
            templateUrl : 'components/calendar/calendar.html',
            controller  : [
                'BookingService',
                function(BookingService) {
                    var $ctrl = this;

                    // generate calendar days
                    $ctrl.days = [];

                    for (var i = 0; i < 7; i++) {
                        var date = new Date();
                        date.setDate(date.getDate() + i);

                        $ctrl.days.push(
                            {
                                date     : date,
                                bookings : BookingService.getByDate(date)
                            }
                        );
                    }
                }
            ]
        }
    )
;
```

```html{% raw %}
<table>
    <thead>
        <tr>
            <th ng-repeat="day in $ctrl.days">
                {{ day.date | date:'dd/MM/yyyy' }}
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td ng-repeat="day in $ctrl.days">
                <ul>
                    <li ng-repeat="booking in day.bookings">
                        {{ booking.datetime | date:'HH:mm' }} - {{ booking.label }}
                    </li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>
{% endraw %}```

Prenons quelques minutes pour expliquer ce que nous venons de créer.

### Arborescence

Tout d'abord notre composant est créé dans le répertoire `components` qui regroupera tous nos composants. Il est composé d'un fichier `.js` qui contient la définition du composant ainsi que son code métier, le controller, et d'un fichier `.html` qui contient la vue du composant, c'est à dire concrètement le code HTML.

### Mode strict

```javascript
"use strict";
```

C'est une directive javascript qui indique au navigateur d'exécuter le code en [mode strict](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Strict_mode). Prenez l'habitude de mettre systématiquement cette ligne au début de chacun de vos fichiers javascript, cela vous permettra de faire un code un peu plus propre car cela interdit un certain nombre de mauvaises pratiques provoquant des bugs parfois difficiles à identifier. Notamment, cela vous obligera à déclarer toutes les variables avant de pouvoir les utiliser.

### Création d'un nouveau module

```javascript
angular
    .module(
        'mzCalendar.component.calendar',
        [
            'ngRoute',
            'mzCalendar.service.booking',
        ]
    )
```

Nous commençons par créer un nouveau module.

`angular`, qui est une variable globale accessible partout, a une méthode `module` qui permet de créer un [module](https://docs.angularjs.org/guide/module). Pour créer un module, il est **obligatoire** de passer un tableau de dépendance en deuxième paramètre, même vide.

Si vous omettez ce deuxième paramètre, `module` tente de retourner un module qui porte ce nom ou lève une erreur dans le cas contraire.

Ici nous avons 2 dépendances:

* ngRoute est le module Angular standard pour gérer les routes. Nous y reviendrons plus tard.
* mzCalendar.service.booking est un service que nous allons écrire plus tard.

### Configuration de la route

```javascript
    .config(
        [
            '$routeProvider',
            function($routeProvider) {
                $routeProvider.when(
                    '/calendar',
                    {
                        template: '<mz-calendar></mz-calendar>',
                    }
                );
            }
        ]
    )
```

Ici nous appelons la méthode `config` de notre module qui va nous permettre de modifier la configuration de notre application. En l'occurrence, nous allons modifier la configuration du routeur pour créer une nouvelle route pour notre composant.

<div class="notice" markdown="1">
**Le routeur:**

Puisque notre application est en javascript et s'exécute entièrement sur le navigateur, coté client donc, nous n'allons pas recharger la page.

Comment allons-nous faire pour "changer de page" et afficher notre formulaire de création de rendez-vous ? Nous allons utiliser un routeur qui permet de dire ce qu'il faut exécuter en fonction de l'url courante.

Voici les deux principaux:

* [ngRoute](https://docs.angularjs.org/api/ngRoute), un routeur simple,
* [angular-ui-router](https://github.com/angular-ui/ui-router), un routeur bien plus complet.

Pour ce projet, nous allons utiliser ngRoute.
</div>

`$routeProvider` est un objet qui permet de configurer ngRoute. Ici, nous lui disons simplement que si l'url est `/calendar` alors il doit utiliser le template `<mz-calendar></mz-calendar>`. Cela signifie qu'il remplacera la page courante par ce code HTML. Toute la page ? Non, il va juste vider la balise qui contient l'attribut `ng-view` qui est dans `app/index.html`.

D'accord mais c'est quoi cette balise HTML ? C'est lié à notre composant. Nous en reparlons juste après. Mais d'abord, parlons quelques instants de l'injection de dépendances.

### Injection de dépendances

Angular est fourni avec un outil d'[injection de dépendances](https://docs.angularjs.org/guide/di).

Pour ceux qui ne sauraient pas ce que c'est, cela vous permet d'injecter des objets dans une méthode en fonction de vos besoins au lieu de tout déclarer en variable globale ou de tout initialiser à chaque fois que vous en avez besoin.

Vous pouvez remarquer que dans la méthode `config`, nous ne passons pas directement la fonction de configuration mais un tableau.

Angular lit automatiquement les premières valeurs de ce tableau, qui sont des chaînes de caractères et qui contiennent le nom du service à injecter, récupère les objets et les injecte dans la fonction qui est le dernier élément du tableau.

Les noms des paramètres de la fonction ne sont pas important. Les objets seront injectés selon l'ordre des services déclarés dans les premiers éléments du tableau. Nous aurions très bien pu écrire ceci:

```javascript
    .config(
        [
            '$routeProvider',
            function($router) {
                // $router est bien le service $routeProvider
            }
        ]
    )
```

Il existe deux autres façons de faire de l'injection de dépendance.

La première consiste à ne pas mettre le tableau:

```javascript
    .config(
        function($routeProvider) {
            // ...
        }
    )
```

Vous allez me dire que c'est bien plus simple, alors pourquoi s'embêter avec un tableau ? Parce que dans ce cas-là, Angular se base sur le nom du paramètre et qu'en cas de minification du code, votre paramètre sera renommé... et cela ne fonctionnera plus. Angular déconseille fortement cette façon de faire. À un moment ou un autre, vous allez minifier votre code et vous n'aurez plus qu'à vous ouvrir les veines ou repasser dans tous vos fichiers.

La deuxième façon de configurer l'injection de dépendances et d'utiliser la propriété d'annotation `$inject`:

```javascript
var routerConfig = function($routeProvider) {
    // ...
}
routerConfig.$inject = [ '$routeProvider' ];
myModule.config(routerConfig);
```

Cela oblige à créer une fonction ou un objet et la configuration se fait après la déclaration, soit très loin des paramètres. Ce n'est pas toujours simple à faire et à lire.

Angular préconise la méthode avec le tableau et déconseille fortement la méthode avec seulement la fonction.

### Création du composant

```javascript
    .component(
        'mzCalendar',
        {
            templateUrl : 'components/calendar/calendar.html',
            controller  : ...
        }
    )
;
```

Ici nous créons, à proprement parlé, le composant.

Le premier argument `mzCalendar` est le nom du composant. C'est à dire le nom sous lequel il sera instancié dès que Angular rencontre une balise portant ce nom. Enfin non, pas exactement. Sinon ce serait trop simple.

Le nom du composant est en lowerCamelCase, c'est à dire qu'il commence par une minuscule et que chaque mot suivant commence par une majuscule. En revanche, le nom de la balise est en dash-case (ou kebab-case), c'est à dire tout en minuscule et chaque mot est séparé par un tiret.

Donc pour un composant `mzCalendar`, la balise est `mz-calendar`. Et c'est justement ce que nous avons mis dans le `template` lors de la configuration du routeur.

Ensuite, il y a `templateUrl` qui indique le fichier contenant le template du composant.

Et enfin, le code du controller.

### Controller

```javascript
            [
                'BookingService',
                function(BookingService) {
                    var $ctrl = this;

                    // generate calendar days
                    $ctrl.days = [];

                    for (var i = 0; i < 7; i++) {
                        var date = new Date();
                        date.setDate(date.getDate() + i);

                        $ctrl.days.push(
                            {
                                date     : date,
                                bookings : BookingService.getByDate(date)
                            }
                        );
                    }
                }
            ]
```

Comme pour la configuration du routeur, vous pouvez remarquer que le controller est un tableau qui contient en premier le nom d'un objet à insérer et, en dernier élément, la fonction proprement dite du controller.

```javascript
                    var $ctrl = this;
```

Cette première ligne est une bonne habitude à avoir. Nous stockons `this`, qui représente le controller, dans une variable, ici `$ctrl`. De cette manière, même dans les fonction de callback, le controller est toujours accessible. Par exemple:

```javascript
function MyController() {
    var $ctrl = this;

    [1, 2, 3].map(
        function() {
            // ici, this n'est pas $ctrl
        }
    );
}
```

Le reste du code du controller est assez simple à comprendre. Nous générons un tableau de 7 objets qui contiennent chacun une propriété `date` et une propriété `bookings` qui contient les rendez-vous que nous retourne le service `BookingService` via la méthode `getByDate`.

Nous pouvons imaginer ici que cette méthode pourrait appeler une API pour récupérer les données ou bien que ce soit stocké dans le LocalStorage. Peu importe, c'est le service qui s'occupe de cela.

### Template

Tout d'abord, il faut savoir que dans le template, le controller du composant est accessible grâce à la variable `$ctrl`.

Vous pouvez voir dans le template, des balises avec un attribut [`ng-repeat`](https://docs.angularjs.org/api/ng/directive/ngRepeat) qui, comme son nom l'indique, permet de répéter la balise (et ses enfants) en fonction de l'expression passée en paramètre.

```html{% raw %}
            <th ng-repeat="day in $ctrl.days">
                {{ day.date | date:'dd/MM/yyyy' }}
            </th>
{% endraw %}```

Ce bout de code est donc une boucle sur tous les éléments de `$ctrl.days` (le tableau que nous avons généré dans le controler). Chaque élément de ce tableau sera accessible, tour à tour, à travers la variable `day`.

Quant à `{% raw %}{{ foo }}{% endraw %}`, cela permet d'afficher la valeur de la donnée `foo`. Évidemment, nous pouvons accéder aux propriétés d'un objet de la même manière qu'en javascript. `day.date` est donc la propriété `date` de l'élément courant du tableau `$ctrl.days`.

De plus, Angular propose un système de filtres qui permet de modifier, formater ou filtrer la donnée courante. En l’occurrence, le filtre `date` permet de formater la date `day.date` en fonction du format passé en paramètre.

Dans le `tbody`, il y a 2 `ng-repeat` imbriqués, mais c'est le même principe.

## Création du service BookingService

Créez le fichier `app/services/BookingService.js` avec:

```javascript
"use strict";

angular.module('mzCalendar.service.booking', [])
    .factory(
        'BookingService',
        [
            function() {
                function getRandomInt(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);

                    return Math.floor(Math.random() * (max - min)) + min;
                }

                var cpt = 1;

                function getRandomBooking(date) {
                    var datetime = new Date(date);
                    datetime.setHours(
                        getRandomInt(9, 18),
                        getRandomInt(0, 4) * 15
                    );

                    return {
                        datetime : date,
                        label    : 'Booking #' + (cpt++)
                    };
                }

                return {
                    getByDate: function(date) {
                        var bookings = [];

                        var nbBookings = getRandomInt(0, 10);
                        for (var i = 0; i < nbBookings; i++) {
                            bookings.push(
                                getRandomBooking(date)
                            );
                        }

                        return bookings.sort(
                            function(a, b) {
                                return a.datetime.getTime() - b.datetime.getTime()
                            }
                        );
                    }
                };
            }
        ]
    )
;
```

Nous retrouvons le mode strict et la création d'un nouveau module avec un tableau de dépendances vide que nous avons déjà vu.

Ici la création du service se fait grâce à la méthode `factory`.

<div class="notice" markdown="1">
**Les providers:**

Pour initialiser des objets dans l'injecteur de dépendances, angular propose un [système complet de providers](https://docs.angularjs.org/guide/providers) qui permet de faire tout ce que nous voulons.

Nous aurons sûrement l'occasion d'en rencontrer d'autres.
</div>

Voici une factory minimaliste:

```javascript
    .factory(
        'MyFactory',
        [
            function() {
                // du code privé
                // ...

                // retourne l'api public de object
                return {
                    method1: // ...
                    method2: // ...
                };
            }
        ]
    )
```

Cela peut aussi servir à instancier un objet en fonction d'autre chose ou d'initialiser l'objet instancié avec de la configuration par défaut, etc...

Le but d'une factory est donc de faire quelque chose de privé puis de retourner un objet qui sera le service.

Dans notre code, les deux méthodes `getRandomInt` et `getRandomBooking` sont privées et ne sont donc pas retournées dans le service. Elles servent seulement à générer des rendez-vous aléatoires afin que nous puissions tester notre composant. Idéalement, il faudrait lui faire contacter une API, mais nous verrons cela une prochaine fois.

## Intégration à l'application

Si vous lancez le serveur web (pour rappel, il suffit de lancer `npm start` puis d'accéder à `http://localhost:8000` dans votre navigateur préféré), vous ne verrez rien de plus. Et c'est normal.

### Chargement des fichiers javascript

Dans le fichier `app/index.html`, il faut d'abord ajouter le chargement des fichiers `*.js` que nous venons de créer:

```html
  ...
  <script src="bower_components/angular/angular.js"></script>
  <script src="bower_components/angular-route/angular-route.js"></script>
  <script src="app.js"></script>
  <script src="services/BookingService.js"></script>
  <script src="components/calendar/calendar.js"></script>
</body>
</html>
```

### Ajout des composants dans les dépendances.

Mais ce n'est pas tout. Tant que nous n'avons pas dit à notre application Angular qu'elle a besoin du composant que nous venons de créer, elle ne l'utilisera pas.

Modifions donc également notre fichier `app/app.js`:

```javascript
angular
    .module(
        'mzCalendar',
        [
            'ngRoute',
            'mzCalendar.component.calendar',
        ]
    )
```

Remarquez que nous n'ajoutons pas le BookingService dans les dépendances. Nous pourrions le faire, mais dans ce module précis, il n'est pas utilisé. Si nous l'ajoutions, tous les autres modules utilisés par notre application aurait, automatiquement, accès à ce service sans même devoir le mettre dans leurs propres dépendances. C'est d'ailleurs le cas du module `ngRoute`.

Néanmoins, il est conseillé de mettre les dépendances dans chaque module et pour plusieurs raisons:

* mettre toutes les dépendances dans le module root vous fera avoir une grosse quantité de dépendances et vous ne saurez pas facilement si une dépendance est toujours nécessaire.
* si demain, AngularJS1 implémente le lazy loading, c'est à dire le chargement au moment où nous en avons besoin, il y a fort à parier que cela utilisera le systême de dépendances. En mettant tout dans le module root, vous chargerez tout dès le début et vous aurez donc de moins bonnes performances au démarrage de l'application.
* si vous comptez sur les dépendances du module parent, il se peut que le module enfant ne fonctionne plus du jour au lendemain parce que le module parent aura supprimé une dépendance.

### Ajout d'une redirection par défaut

Si vous testez, cela ne fonctionne toujours pas et c'est toujours normal. Actuellement, aucun controller n'est exécuté puisque notre url est `/`.

En effet, nous avons dit que notre calendrier doit s'afficher sur l'url `/calendar`. Nous pourrions modifier l'url à la main mais ce n'est vraiment pas la bonne méthode.

Non. Nous allons configurer l'url par défaut. Modifier le fichier `app/app.js`:

```javascript
    .config(
        [
            '$locationProvider', '$routeProvider',
            function($locationProvider, $routeProvider) {
                $locationProvider.hashPrefix('!');

                $routeProvider.otherwise({
                    redirectTo: '/calendar'
                });
            }
        ]
    )
;
```

`$routeProvider` a une méthode `otherwise` qui permet de définir l'action à faire lorsque l'url courante ne correspond à aucune route configurée.

L'action que nous allons faire est une simple redirection vers une url définie: `/calendar`. Et cela tombe bien, c'est justement l'url que nous avons configuré dans notre composant.

Et voilà, nous avons enfin un calendrier avec des rendez-vous aléatoires qui s'affiche.

# AngularJS 2

Nous allons maintenant essayer de faire la même chose avec Angular2.

Tout d'abord il est important de noter qu'Angular2 peut utiliser javascript ES5, ES6 ou TypeScript.

<div class="notice" markdown="1">
**ES5 ? ES6 ? TypeScript ?**

Javascript, comme tous les langages, évolue dans le temps et a un certain nombre de version. La version la plus communément utilisées actuellement et la version ES5, pour ECMAScript Edition 5.

En juin 2015, une nouvelle version apportant un grand nombre d'amélioration est sortie sous le nom d'ES2015 ou ES6.

Toutes les nouveautés d'ES6 ne sont pas encore supportées par tous les navigateurs. Vous pouvez vérifier qu'une fonctionnalité est supportée par les principaux navigateurs sur le site [http://caniuse.com](http://caniuse.com/). Par exemple, on peut voir que les [arrow function](http://caniuse.com/#feat=arrow-functions) sont supportées sur les dernières versions des navigateurs, sauf IE et Opera Mini, que [`let`](http://caniuse.com/#feat=let) est supporté partout sauf sur Opera Mini, etc...

[TypeScript](https://www.typescriptlang.org/) est un langage développé par Microsoft qui est une surcouche à javascript et qui se transpile en ES5, c'est à dire que le code écrit en TypeScript sera ensuite traduit en code ES5 pour que les navigateurs puissent l'exécuter.

Google a travaillé activement avec Microsoft pour que la nouvelle version de TypeScript puisse répondre aux besoins d'Angular2.
</div>

L'équipe Angular recommande d'utiliser TypeScript. Alors c'est ce que nous allons utiliser. Et cela tombe bien, angular-cli nous a généré du TypeScript.

## Création du premier composant

### Création d'un nouveau module

Générons maintenant un nouveau module grâce à angular-cli:

```bash
ng generate module mz-calendar
```

Le répertoire `src/app/mz-calendar` sera créé et les fichiers `mz-calendar.module.ts`, `mz-calendar.component.css`, `mz-calendar.component.html`, `mz-calendar.component.spec.ts` et `mz-calendar.component.ts` seront générés dans ce répertoire.

Les fonctionnalités d'une application sont regroupées en [modules](https://angular.io/docs/ts/latest/guide/ngmodule.html). Contrairement à AngularJS 1, chaque module Angular2 doit préciser ce dont il a besoin et ce qu'il expose au reste de l'application.

Nous l'avons vu, la génération du module s'est accompagné de la génération d'un composant. Ce composant est automatiquement exposé au reste de l'application afin qu'il soit utilisé.

Modifions notre composant pour récupérer les rendez-vous:

```typescript
import { Component, OnInit } from '@angular/core';

import BookingService from '../shared/booking.service';
import Day from '../shared/day';

@Component({
    selector    : 'app-mz-calendar',
    templateUrl : './mz-calendar.component.html',
    styleUrls   : [ './mz-calendar.component.css' ],
    providers   : [ BookingService ]
})
export class MzCalendarComponent implements OnInit {
    private bookingService: BookingService;

    public days: Array<Day>;

    constructor(bookingService: BookingService) {
        this.bookingService = bookingService;
        this.days           = [];
    }

    ngOnInit() {
        // generate calendar days
        for (var i = 0; i < 7; i++) {
            var date = new Date();
            date.setDate(date.getDate() + i);

            this.days.push(
                {
                    date     : date,
                    bookings : this.bookingService.getByDate(date)
                }
            );
        }
    }
}
```

### Imports

```typescript
import { Component, OnInit } from '@angular/core';
```

Avec TypeScript, chaque fichier est indépendant et n'a aucun accès au reste de l'application sauf à l'importe explicitement.

Ici on importe l'annotation `Component` et l'interface `OnInit` depuis le module `@angular/core` qui est le principal module d'angular.

```typescript
import BookingService from '../shared/booking.service';
import Day from '../shared/day';
```

Sur ce même principe, les lignes précédentes importe des classes... que nous allons créer plus tard:

### Annotations

TypeScript supporte les annotations sous la forme de décorateurs.

Le composant généré par angular-cli est décoré par l'annotation `@Component` qui permet de préciser un certain nombre d'informations pour le composant dont la classe suit:

```typescript
@Component({
    selector    : 'app-mz-calendar',
    templateUrl : './mz-calendar.component.html',
    styleUrls   : [ './mz-calendar.component.css' ],
    providers   : [ BookingService ]
})
```

* `selector`: nom de la balise html que l'on peut utiliser et qui instanciera automatiquement ce composant.
* `templateUrl`: chemin vers le fichier HTML du template du composant.
* `styleUrls`: tableau de chemin de fichier CSS liés à ce composant.
* `providers`: tableau de services à injecter dans le constructeur du composant.

### Controller

```typescript
export class MzCalendarComponent implements OnInit {
    private bookingService: BookingService;

    public days: Array<Day>;

    constructor(bookingService: BookingService) {
        this.bookingService = bookingService;
        this.days           = [];
    }
```

`MzCalendarComponent` implémente l'interface `OnInit`. De ce fait, elle devra implémenter la méthode `ngOnInit` qui est automatiquement appelée dès lors que le composant est initialisé:

```typescript
    ngOnInit() {
        // generate calendar days
        for (var i = 0; i < 7; i++) {
            var date = new Date();
            date.setDate(date.getDate() + i);

            this.days.push(
                new Day(
                    date,
                    this.bookingService.getByDate(date)
                )
            );
        }
    }
}
```

### Modèles

Vous pouvez remarquer également l'utilisation de la classe Day plutôt que d'un objet anonyme.

Nous aurions pu faire la même chose en javascript avec AngularJS 1, mais l'utilisation des classes TypeScript et la génération facilitée par angular-cli rendent les choses plus évidentes avec Angular2.

```bash
ng generate class shared/day
```

Cela génère le fichier `src/app/shared/day.ts` que nous compléter comme cela:

```typescript
import Booking from './booking';

export default class Day {
    public date     : Date;
    public bookings : Array<Booking>;

    constructor(date, bookings) {
        this.date     = date;
        this.bookings = bookings;
    }
}
```

Idem pour le modèle `Booking`:

```bash
ng generate class shared/booking
```

Cela génère le fichier `src/app/shared/booking.ts` que nous compléter comme ceci:

```typescript
export default class Booking {
    public datetime: Date;
    public label: string;

    constructor(datetime, label) {
        this.datetime = datetime;
        this.label    = label;
    }
}
```

### Template

Revenons à notre composant. Dans son décorateur, il y a le lien vers un fichier HTML:

```typescript
@Component({
    selector    : 'app-mz-calendar',
    templateUrl : './mz-calendar.component.html',
    styleUrls   : [ './mz-calendar.component.css' ],
    providers   : [ BookingService ]
})
```

Modifions donc le fichier `src/app/mz-calendar/mz-calendar.component.html`:

```html
<table>
    <thead>
        <tr>
            <th *ngFor="let day of days">
                {{ day.date | date:'dd/MM/yyyy' }}
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td *ngFor="let day of days">
                <ul>
                    <li *ngFor="let booking of day.bookings">
                        {{ booking.datetime | date:'HH:mm' }} - {{ booking.label }}
                    </li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>
```

C'est un copié/collé de la version AngularJS 1 à quelques exceptions près.

L'équivalent de la directive ng-repeat est la directive ngFor. Notez que si les directives AngularJS 1 sont toutes en minuscule et en dash-case (séparées par des tirets), les directives Angular 2 sont en lowerCamelCase et sont donc sensibles à la casse.

La notation utilise `*` pour exprimer que cette directive modifie le HTML et, donc, qu'elle créé un nouveau template enfant. C'est en fait un raccourci pour une forme plus longue du template:

```html
<div *ngFor="let item of data">
    {{ item }}
</div>
```

... est l'équivalent de...

```html
<template ngFor let-item [ngForOf]="data">
    <div>{{ item }}</div>
</template>
```

Notez enfin que l'expression à l'intérieur des guillemets ressemble à [la nouvelle notation `for...of`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Instructions/for...of) apparu avec ES6.

## Création du service BookingService

Générons maintenant le service:

```bash
ng generate service shared/booking
```

Cela génère les fichiers `src/app/shared/booking.service.ts` et `src/app/shared/booking.service.spec.ts`. Modifiez le fichier `src/app/shared/booking.service.ts` comme ceci:

```typescript
import { Injectable } from '@angular/core';

import Booking from './booking';

@Injectable()
export default class BookingService {
    private cpt = 1;

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min)) + min;
    }

    private getRandomBooking(date) {
        let datetime = new Date(date);
        datetime.setHours(
            this.getRandomInt(9, 18),
            this.getRandomInt(0, 4) * 15
        );

        return new Booking(
            datetime,
            'Booking #' + (this.cpt++)
        );
    }

    public getByDate(date) {
        let bookings: Array<Booking> = [];

        let nbBookings = this.getRandomInt(0, 10);
        for (let i = 0; i < nbBookings; i++) {
            bookings.push(
                this.getRandomBooking(date)
            );
        }

        return bookings.sort(
            function(a, b) {
                return a.datetime.getTime() - b.datetime.getTime();
            }
        );
    }
}
```

Remarquez que le décorateur `Injectable` est importé puis utilisé sur la classe du service. Il sert à indiquer que cette classe peut être injecté via l'injecteur de dépendances d'Angular2 comme nous l'avons vu plus tôt.

## Intégration à l'application

Maintenant que nous avons notre composant, ses modèles et son service, il faut bien entendu l'intégrer à l'application.

### Utilisation du routeur

Contrairement à l'angular-seed qui avait déjà intégré le routeur, angular-cli ne nous l'a pas mis par défaut.

Et bien installons-le.

Modifiez le fichier `src/app/app.module.ts`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { MzCalendarModule } from './mz-calendar/mz-calendar.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '**', redirectTo: 'calendar' }
    ]),
    MzCalendarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Le routeur est importé depuis le module `@angular/router`, puis ajouté au tableau `imports` du décorateur du module tout en configurant la route par défaut:

```typescript
  imports: [
    // ...
    RouterModule.forRoot([
      { path: '**', redirectTo: 'calendar' }
    ]),
    MzCalendarModule
  ],
```

La route `**` est une route spéciale au cas où le chemin courant ne correspond à rien. C'est l'équivalent de la méthode `otherwise` du routeur d'AngularJS 1. Cette route fait une redirection vers l'url `calendar`.

<div class="notice" markdown="1">
**Les chemins du routeur ne commençent jamais par un `/`**
</div>

Remarquez que nous importons également le module `MzCalendarModule` que nous avons créé en même temps que le composant.

Modifions-le afin de configurer la route de notre composant:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MzCalendarComponent } from './mz-calendar.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'calendar', component: MzCalendarComponent }
    ])
  ],
  declarations: [MzCalendarComponent]
})
export class MzCalendarModule { }
```

La méthode `RouterModule.forRoot` ne doit être utilisée qu'à la racine de l'application, dans AppModule. Quand vous êtes dans un composant, utilisez la méthode `RouterModule.forChild` pour ajouter des routes.

Pour que notre composant soit accessible dans le reste de l'application (où ce module est importé), il faut rajouter `MzCalendarComponent` dans la propriété `declarations` du module.
