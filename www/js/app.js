// Jukebuzz App
// 'jukebuzz.controllers' is found in controllers.js
angular.module('jukebuzz', ['ionic', 'ionic-material', 'jukebuzz.utils', 'jukebuzz.controllers', 'ionMdInput'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.constant('urls', {
     BASE_API: 'http://192.168.100.11:3000/v1'
})
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })
  .state('app.login', {
      url: "/login",
      views: {
        'menuContent': {
          templateUrl: "templates/login.html",
          controller: 'LoginCtrl'
        }
      }
    })

  .state('app.signup', {
      url: "/signup",
      views: {
        'menuContent': {
          templateUrl: "templates/signup.html",
          controller: 'SignUpCtrl'
        }
      }
    })
  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
    .state('app.places', {
      url: '/places',
      views: {
        'menuContent': {
          templateUrl: 'templates/places.html',
          controller: 'PlacesCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/places/:placeId',
    views: {
      'menuContent': {
        templateUrl: 'templates/place.html',
        controller: 'PlaceCtrl'
      }
    }

  })
  .state('app.jukebox', {
    url: '/jukeboxes/:placeId/:jukeboxId',
    views: {
      'menuContent': {
        templateUrl: 'templates/jukebox.html',
        controller: 'JukeboxCtrl'
      }
    }

  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');

  $httpProvider.interceptors.push(['$q', '$localstorage', '$injector',
    function($q, $localstorage, $injector){
      //return two functions, one for onbefore requests, and one for handling
      //errors
      return {
        'request': function(config){
          config.headers = config.headers || {};
          if($localstorage.get('token')){
            config.headers.Authorization = 'JWT ' + $localstorage.get('token');
          }
          return config;
        },
        'responseError': function(response){
          if(response.status == 403){
          }
          return $q.reject(response);
        }
      };
    }
  ]);
});
