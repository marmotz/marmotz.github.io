---
layout   : post
title    : "AngularJS 1 vs Angular 2 : Premiers composants"
tags     : [ Tutoriel, AngularJS 1, Angular 2, Comparaison versions AngularJS ]
comments : true
---
Dans [l'épisode précédent]({% post_url 2016-10-16-angularjs1-vs-angular2-initialisation %}), nous avons initialisé nos projets [AngularJS 1](https://github.com/marmotz/calendar-angularjs1) et [Angular 2](https://github.com/marmotz/calendar-angular2). C'est bien, mais c'est vide... Et si on se mettait à construire quelque chose ?

![Une affaire de brique]({{ site.url }}/images/2016/2016-10-23-angularjs1-vs-angular2-premiers-composants.jpg)

Pour commencer, nous allons afficher le tableau de la semaine à venir avec les rendez-vous pris.

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

La principale nouveauté d'AngularJS 1.5 a été l'arrivée des composants, un nouveau type de directive.

Le but principal est de décomposer en briques élémentaires l'application pour que, d'une part chaque brique soit réutilisable et que d'autre part chaque brique fasse une chose et une seule.

Au lieu de faire une grosse page HTML avec un controller qui gère tout ça, on va découper en plus petits éléments.

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

```html
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
                        {{ booking.date | date:'HH:mm' }} - {{ booking.label }}
                    </li>
                </ul>
            </td>
        </tr>
    </tbody>
</table>
```

### Explications

Prenons quelques minutes pour expliquer tout ça.

#### Arborescence

Tout d'abord notre composant est créé dans le répertoire component qui regroupera tous nos composants. Il est composé d'un fichier `.js` qui contient la définition du composant ainsi que son code métier, le controller, en javascript, et d'un fichier `.html` qui contient la vue du composant, c'est à dire concrètement le code HTML.

#### Mode strict

```javascript
"use strict";
```

C'est une directive javascript qui indique au navigateur d'exécuter le code en mode strict. Prenez l'habitude de mettre systématiquement cette ligne au début de chacun de vos fichiers javascript, ça vous permettra de faire un code javascript un peu plus propre car cela interdit un certain nombre de choses provoquant des bugs parfois difficiles à identifier. Notamment, cela vous obligera à déclarer toutes variables avant de l'utiliser.

#### Création d'un nouveau module

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

Nous commençons par créer un nouveau module. `angular`, qui est une variable globale accessible partout dans votre, a une méthode `module` qui permet de créer ou de récupérer un module préalablement créé en passant le nom d'un module.

Quand on créé un module, il est **obligatoire** de passer en deuxième paramètre un tableau de dépendance. Même vide. Sinon la méthode pense que vous voulez récupérer un module déjà existant.

Ici nous avons 2 dépendances:

* ngRoute est le module angular standard pour gérer les routes. J'y reviendrai plus tard.
* mzCalendar.service.booking est un service que nous allons écrire plus tard.

#### Configuration de la route

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

Comment allons-nous faire pour "changer de page" et afficher notre formulaire de création de rendez-vous ?

Le routeur est le module qui nous permet de faire ça en liant une url à un controller.
</div>

`$routeProvider` est un objet qui permet de configurer le routeur. Ici, nous lui disons simplement que si l'url est `/calendar` alors il doit utiliser le template `<mz-calendar></mz-calendar>`. Cela signifie qu'il remplacera la page courante par ce code HTML. Toute la page ? Non, il va juste vider la balise qui contient l'attribut `ng-view` qui est dans `app/index.html`.

D'accord mais c'est quoi cette balise HTML ? C'est lié à notre composant. On en reparle juste après. Mais d'abord, parlons quelques instants de l'injection de dépendances.

#### Injection de dépendances

Angular est fourni avec un outil d'injection de dépendances.

Pour ceux qui ne sauraient pas ce que c'est, ça vous permet d'injection des objets dans une méthode en fonction de vos besoins au lieu de tout déclarer en variable globale ou de tout initialiser à chaque fois que vous en avez besoin.

Vous pouvez remarquer que dans la méthode `config`, on ne passe pas directement la fonction de configuration mais un tableau.

Angular lit automatiquement les premières valeurs de ce tableau, qui sont des chaînes de caractères qui contiennent le nom du service à injecter, récupère les objets et les injecte dans la fonction qui est le dernier élément du tableau.

Remarquez que les noms des paramètres de la fonction n'est pas important. Les objets seront injectés selon l'ordre des services déclarés dans les premiers éléments du tableau. On aurait très bien pu faire ça:

```javascript
    .config(
        [
            '$routeProvider',
            function($router) {
                // ...
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

Vous allez me dire que c'est plus simple, pourquoi s'embêter avec un tableau ? Parce que dans ce cas-là, Angular se base sur le nom du paramètre et qu'en cas de minification du code, votre paramètre sera renommé... et ça ne fonctionnera plus. Je déconseille fortement cette façon de faire. À un moment ou un autre, vous allez minifier votre et vous n'aurez plus qu'à vous ouvrir les veines ou repasser sur tous votre code.

La deuxième façon de configurer l'injection de dépendances et d'utiliser la propriété d'annotation `$inject`:

```javascript
var routerConfig = function($routeProvider) {
    // ...
}
routerConfig.$inject = [ '$routeProvider' ];
myModule.config(routerConfig);
```

Ça oblige à créer une fonction ou un objet et la configuration se fait sous la fonction, soit très loin des paramètres, c'est pas toujours simple à faire et à lire, donc.

Angular préconise la méthode avec le tableau et déconseille fortement la méthode avec seulement la fonction.

#### Création du composant

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

Le premier argument `mzCalendar` est le nom du composant. C'est à dire le nom sous lequel il sera instancié dès que Angular rencontre une balise portant ce nom. Enfin non. Pas exactement. Sinon ce serait trop simple.

Le nom du composant est en lowerCamelCase, c'est à dire qu'il commence par une minuscule et que chaque mot suivant commence par une minuscule. En revanche, le nom de la balise est en dash-case (ou kebab-case).

Donc pour un composant mzCalendar, la balise est mz-calendar. Et c'est justement ce qu'on a mit dans le `template` lors de la configuration du routeur.

Ensuite, il y a `templateUrl` qui indique le fichier contenant le template du composant.

Et enfin, le code du controller.

#### Controller

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

Comme pour la configuration du routeur, vous pouvez remarquer que le controller est un tableau qui contient en premier le nom d'un objet à insérer en dernier élément, la fonctionnent proprement dite du controller.

```javascript
                    var $ctrl = this;
```

Cette première ligne non obligatoire et ici, totalement inutile est pourtant une bonne habitude à avoir. On stocke `this`, qui représente ici le controller, dans une variable, ici `$ctrl`. De cette manière, même dans les fonction de callback qu'il peut y avoir parfois, le controller est toujours accessible:

```javascript
function MyController() {
    var $ctrl = this;

    [1, 2, 3].map(
        function() {
            // ici, this, n'est pas $ctrl
        }
    );
}
```

Le reste du code du controller est assez simple à comprendre. On génère un tableau de 7 objets qui contiennent chacun une propriété date et une propriété bookings qui contient les rendez-vous que nous retourne le service `BookingService` via la méthode `getByDate`.

On peut imaginer ici que cette méthode appelle une API pour récupérer les données et que c'est stocké dans le LocalStorage. Peu importe, c'est le service qui s'occupe de ça.

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
                    date = new Date(date);
                    date.setHours(getRandomInt(9, 18), getRandomInt(0, 4) * 15);

                    return {
                        date  : date,
                        label : 'Booking #' + (cpt++)
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

                        return bookings;
                    }
                };
            }
        ]
    )
;
```

On retrouve le mode strict et la création d'un nouveau module avec un tableau de dépendances vide qu'on a déjà vu.

Ici la création du service se fait grâce à la méthode `factory`.

<div class="notice" markdown="1">
**Les providers:**

Pour initialiser des objets dans l'injecteur de dépendances, angular propose un [système complet de providers](https://docs.angularjs.org/guide/providers) qui permet de faire tout ce qu'on veut.

Nous aurons sûrement l'occasion d'en rencontrer d'autres.
</div>

Voici une factory minimaliste:

```javascript
    .factory(
        'MyFactory',
        [
            function() {
                // some private code
                // ...

                // return public object api
                return {
                    method1: // ...
                    method2: // ...
                };
            }
        ]
    )
```

Cela peut aussi service à instancier un objet en fonction d'autre chose ou d'initialiser l'objet instancié avec de la configuration par défaut, etc...

Le but d'une factory est donc de faire quelque chose de privé puis de retourner un objet qui sera le service.

Dans notre code, les deux méthodes getRandomInt et getRandomBooking sont privées et ne sont pas retournée dans le service. Elles servent seulement à générer des rendez-vous aléatoires afin qu'on puisse tester notre composant. Idéalement, il faudrait lui faire contacter une API, mais nous verrons cela une prochaine fois.

## Intégration à l'application

Si vous lancez le serveur web (pour rappel, il suffit de lancer `npm start` puis d'accéder à `http://localhost:8000` dans votre navigateur préféré), vous ne verrez rien de plus. C'est normal.

### Chargement des fichiers javascript

Dans le fichier `app/index.html`, il faut ajouter le chargement des fichiers `*.js` qu'on vient de créer:

```html

```
