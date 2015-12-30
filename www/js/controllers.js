angular.module('jukebuzz.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, Auth) {

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

  $scope.hideHeader = function() {
    $scope.hideNavBar();
    $scope.noHeader();
  };

  $scope.clearFabs = function() {
    var fabs = document.getElementsByClassName('button-fab');
    if (fabs.length && fabs.length > 1) {
        fabs[0].remove();
    }
  };

  $scope.logout = function(){
    Auth.logout(function(){
      $state.go('app.login');
    });
  };
})

.controller('PlacesCtrl', function(
  $scope,
  $http,
  $ionicPopup,
  ionicMaterialMotion,
  ionicMaterialInk,
  $localstorage,
  urls
  ) {
  // Set Header
  $scope.$parent.showHeader();

  $scope.places = [];
  var user = $localstorage.getObject('user');

  $http.get(urls.BASE_API + '/places/state/' + user.stateId)
    .success(function(result, status){
      $scope.places = result.data;
    })
    .error(function(result, status){
      console.log(result);
    });
})

.controller('PlaceCtrl', function(
  $scope,
  $stateParams,
  $http,
  $interval,
  $ionicPopup,
  $ionicHistory,
  urls) {
  var placeId  = $stateParams.placeId;
  $scope.jukeboxes = [];

  function getJukeboxes(){
    $http.get(urls.BASE_API + '/places/' + placeId + '/jukeboxes')
    .success(function(result, status){
      $scope.jukeboxes = result.data;
    });
  }

  $http.get(urls.BASE_API + '/places/' + placeId + '/jukeboxes')
    .success(function(result, status){
      $scope.jukeboxes = result.data;
      if($scope.jukeboxes.length <= 0){
        var alertPopup = $ionicPopup.alert({
            title: 'No hay rockolas',
            template: 'No se encontraron rockolas activas para éste establecimiento.'
        });
        alertPopup.then(function(res) {
          $ionicHistory.goBack();
        });

      }
    })
    .error(function(result, status){
      $scope.jukeboxes = [];
      console.log(result);
      var alertPopup = $ionicPopup.alert({
            title: 'No hay rockolas',
            template: 'No se encontraron rockolas activas para éste establecimiento.'
        });
      alertPopup.then(function(res) {
        $ionicHistory.goBack();
      });
    });

  $interval(getJukeboxes, 10000);

})
.controller('JukeboxCtrl', function(
  $scope,
  $stateParams,
  $http,
  $interval,
  $ionicPopup,
  $ionicHistory,
  urls,
  Errors
  ){
  var jukeboxId  = $stateParams.jukeboxId;
  var placeId = $stateParams.placeId;
  $scope.songs = [];

  $scope.vote = function(song){
    var params = {
      'songId': song.id,
      'listId': song.listId,
      'jukeboxId': song.jukeboxId,
      'placeId': placeId
    };

    $http.post(urls.BASE_API + '/votes', params)
    .success(function(result, status){
      var alertPopup = $ionicPopup.alert({
          title: 'Exito!',
          template: 'El voto fue generado correctamente'
      });
    })
    .error(function(error, status){
      message = Errors.postVote(error);
      var alertPopup = $ionicPopup.alert({
          title: 'Error al votar!',
          template: message
      });
    });
  };

   $http.get(urls.BASE_API + '/jukeboxes/' + jukeboxId + '?populate=lists')
    .success(function(result, status){
      var lists = result.data.lists;
      if(lists.length <= 0){
        var alertPopup = $ionicPopup.alert({
            title: 'No hay canciones',
            template: 'La rockola seleccionada no cuenta con canciones'
        });
        alertPopup.then(function(res) {
          $ionicHistory.goBack();
        });
      }else{
        for (var i = 0; i < lists.length; i++) {
          var list = lists[i];
          $http.get(urls.BASE_API + '/lists/' + list.id + '/songs')
          .success(function(result, status){
            var songs = result.data;
            for (var j = 0; j < songs.length; j++) {
              var song = songs[j];
              song.listId = list.id;
              song.jukeboxId = jukeboxId;
              $scope.songs.push(song);
            }
          });
        }
      }
    })
    .error(function(result, status){
      $scope.songs = [];
      var alertPopup = $ionicPopup.alert({
            title: 'No hay canciones',
            template: 'La rockola seleccionada no cuenta con canciones'
        });
      alertPopup.then(function(res) {
        $ionicHistory.goBack();
      });
    });
})
.controller('LoginCtrl', function(
  $scope,
  $timeout,
  $state,
  $stateParams,
  $ionicPopup,
  $ionicHistory,
  $localstorage,
  ionicMaterialInk,
  Auth
  ) {
  $ionicHistory.nextViewOptions({
    disableAnimate: true,
    disableBack: true
  });

  function successAuth(res){
    $localstorage.set('token',  res.data.token);
    $localstorage.setObject('user',  res.data.user);
    $state.go('app.places');
  }

  $scope.login = function(){
    var formData = {
      email: $scope.login.email,
      password: $scope.login.password
    };
    Auth.signin(formData, successAuth, function(){
      var alertPopup = $ionicPopup.alert({
          title: 'Inicio de sesión incorrecto!',
          template: 'El usuario o contraseña son incorrectos.'
      });
    });
  };

  if(typeof $localstorage.get('token') === 'undefined' ||
            $localstorage.get('token') === null){
    $scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();
  }else{
    $state.go('app.places');
  }
})
.controller('SignUpCtrl', function(
  $scope,
  $state,
  $timeout,
  $ionicHistory,
  $localstorage,
  $http,
  $ionicPopup,
  ionicMaterialInk,
  Auth,
  Errors,
  urls){

  $scope.signup = {};
  $scope.errorMessage = null;

  $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
  ionicMaterialInk.displayEffect();

  $http.get(urls.BASE_API + '/countries')
    .success(function(result, status){
      $scope.countries = result.data;
    })
    .error(function(result, status){
      console.log(result);
    });

  $scope.populateStates = function(){
      var idCountry = $scope.signup.country;
      if(idCountry){
        $http.get(urls.BASE_API + '/countries/' + idCountry + '/states')
        .success(function(result, status){
          $scope.states = result.data;
        })
        .error(function(result, status){
          console.log(result);
        });
      }else{
        $scope.states = [];
      }
    };

  $scope.submit = function(form){
    console.log('entered submit');
      if (form.$invalid) {
        var alertPopup = $ionicPopup.alert({
            title: 'Error al crear cuenta',
            template: 'Todos los campos son requeridos, verifica que el e-mail sea valido.'
        });
        return;
      }else{
        $scope.signup.role = 1;
        Auth.signup($scope.signup,
          function(result, status){
            //if the user was correctly created, then
            //save the token in local storage and redirect to the admin panel
            var data = result.data;
            var user = data.user;
            $localstorage.set('token', data.token);
            $localstorage.setObject('user', user);

            var alertPopup = $ionicPopup.alert({
              title: 'Registro exitoso!',
              template: 'Se creó correctamente tu cuenta ' + $scope.signup.firstName + '!'
            });
            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });
            $state.go("app.places");
          },
          function(error, status){
            //if there is a new error, then Call the service Error
            //for handling the response from the server
            $scope.errorMessage = Errors.signup(error);
            var alertPopup = $ionicPopup.alert({
                title: 'Error al crear cuenta',
                template: $scope.errorMessage
            });
          }
        );
      }
    };
});
