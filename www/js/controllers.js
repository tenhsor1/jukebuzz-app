angular.module('jukebuzz.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, Auth) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

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

.controller('PlaylistsCtrl', function($scope, ionicMaterialMotion, ionicMaterialInk, $localstorage) {
  // Set Header
  $scope.$parent.showHeader();
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
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
  if(typeof $localstorage.get('token') === 'undefined' ||
            $localstorage.get('token') === null){
    $scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();
    function successAuth(res){
      $localstorage.set('token',  res.data.token);
      $state.go('app.playlists');
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
  }else{
    $state.go('app.playlists');
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
            $localstorage.set('token', data.token);
            var alertPopup = $ionicPopup.alert({
              title: 'Registro exitoso!',
              template: 'Se creó correctamente tu cuenta ' + $scope.signup.name + '!'
            });
            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });
            $state.go("app.playlists");
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
