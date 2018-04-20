var myApp = angular.module('myApp', ['ngRoute', 'ngCookies', 'ui.bootstrap']);
angular.module('myApp.controllers', []);

/*-CONFIG -*/

myApp.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

        $routeProvider
            .when('/login', {
                controller: 'loginCtrl',
                templateUrl: './templates/login.html'
            })
        .when('/', {
            templateUrl: './templates/home.html',
            controller: 'homeCtrl'
        })
        .when('/home', {
            templateUrl: './templates/home.html',
            controller: 'homeCtrl'
        })
        .when('/public', {
            templateUrl: './templates/public.html',
            controller: 'homeCtrl'
        })
        .when('/about', {
            templateUrl: './templates/about.html',
            controller: 'aboutCtrl'
        })
        .when("/activities", {
            templateUrl: "./templates/activities.html",
            controller: "activitiesCtrl"
        })
        .when("/allbadges", {
            templateUrl: "./templates/allbadges.html",
            controller: "allbadgesCtrl"
        })
        .when("/awards", {
            templateUrl: "./templates/awards.html",
            controller: "awardsCtrl"
        })
        .when("/badges-in-cat1", {
            templateUrl: "./templates/badges-in-cat1.html",
            controller: "multiCtrl"
        })
        .when("/badges-in-cat2", {
            templateUrl: "./templates/badges-in-cat2.html",
            controller: "multiCtrl"
        })
        .when("/badges-in-cat3", {
            templateUrl: "./templates/badges-in-cat3.html",
            controller: "multiCtrl"
        })
        .when("/badges-in-cat4", {
            templateUrl: "./templates/badges-in-cat4.html",
            controller: "multiCtrl"
        })
        .when("/categories", {
            templateUrl: "./templates/allcats.html",
            controller: 'multiCtrl'
        })
        .when("/dashboard", {
            templateUrl: "./templates/dashboard.html",
            controller: 'multiCtrl'
        })
        .when("/eventsfeed", {
            templateUrl: "./templates/eventsfeed.html",
            controller: 'eventsCtrl'
        })
        .when("/messages", {
            templateUrl: "./templates/messages.html",
            controller: 'messagesCtrl'
        })
        .when("/privacy", {
            templateUrl: "./templates/privacy.html",
            controller: "privacyCtrl"
        })
        .when("/suggestedbadges", {
            templateUrl: "./templates/suggestedbadges.html",
            controller: "nextBadgesCtrl"
        })
        .when("/achievements", {
            templateUrl: "./templates/achievements.html",
            controller: "myBadgesCtrl"
        })

        // For any unmatched url, redirect to /login
        .otherwise({ redirectTo: '/login' });

        //$locationProvider.html5Mode(true);
    }
]);

myApp.run(['$rootScope', '$location', '$http', '$cookies', 'getActivities', 'getMessages', 'getNextBadges', 'getPrivacy', 'getMyBadges',
function ($rootScope, $location, $http, $cookies, getActivities, getMessages, getNextBadges, getPrivacy, getMyBadges) {
    // keep user logged in after page refresh
    // $rootScope.globals = $cookies.get('globals') || {};
    $rootScope.globals = $.jStorage.get('globals', '') || {};
    if ($rootScope.globals.currentUser) {
       // $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.token; // jshint ignore:line
        $location.path('/');
    }

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
            $location.path('/login');
        }
    });

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.hideOverlay = true;
        $rootScope.hideMenuPanel = true;
        //reset all the services to null
        getActivities.reset(null); 
        getMessages.reset(null);
        getNextBadges.reset(null);
        getPrivacy.reset(null);
        getMyBadges.reset(null);
        //signMeUp.reset(null);
        //updateActivities.reset(null);
        //updateMessages.reset(null);
        //setPrivacy.reset(null);
    });

}]);

/* source: http://jsfiddle.net/asgoth/WaRKv/ */
myApp.directive('siteHeader', function () {
    return {
        restrict: 'E',
        template: '<button id="back" class="icon white back"><i class="fa fa-arrow-circle-left fa-2x"></i></button>',
        scope: {
            back: '@back',
            forward: '@forward',
            icons: '@icons'
        },
        link: function (scope, element, attrs) {
            $(element[0]).on('click', function () {
                history.back();
                scope.$apply();
            });
            $(element[1]).on('click', function () {
                history.forward();
                scope.$apply();
            });
        }
    };
});

/* source: http://jasonwatmore.com/post/2014/05/26/angularjs-basic-http-authentication-example */

/* SERVICES */

myApp.factory('AuthenticationService',
       ['$http', '$cookies', '$rootScope', '$timeout', '$log',
       function ($http, $cookies, $rootScope, $timeout, $log) {
           var service = {};

           service.Login = function (username, password, callback) {

               if ((username.length && password.length) && (username !== '' && password != '')) {

                   var loginUrl = 'https://moodle.company.name/login/token.php';

                   // use a jQuery function to serialize the data
                   var data = $.param({
                       username: username,
                       password: password,
                       service: 'My Badges_ws'
                   });

                   var config = {
                       headers: {
                           'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                       }
                   }

                   $http.post(loginUrl, data, config)
                           .success(function (data, status, headers, config) {
                               $log.info(data);
                               myToken = data.token;
                               dataString = JSON.stringify(data);
                               if (dataString.indexOf('error') > 0 || dataString.indexOf('invalid') > 0 || dataString == '') {
                                   
                                   $rootScope.className = 'error';
                                   $rootScope.PostDataResponse = 'Invalid user credentials, please try again';
                                   $rootScope.isAuthenticated = false;
                                   $rootScope.dataLoading = false;
                               }
                               else {
                                    $.jStorage.set('session', myToken, { TTL: 28800000 });
                                   //$cookies.put('session', myToken);
                               }

                               $rootScope.isAuthenticated = true;
                              // $log.info('isAuthenticated = true');
                               callback(dataString);
                           })
                           .error(function (data, status, header, config) {
                               $rootScope.isAuthenticated = false;
                               $rootScope.ResponseDetails = "data: " + data +
                                       "; status: " + status +
                                       "; headers: " + header +
                                       "; config: " + JSON.stringify(config);
                               responsedata = JSON.stringify(data);
                               callback(responsedata);
                               $log.info('error: '+$rootScope.ResponseDetails);
                           });
               } else {
                   
                   $rootScope.className = 'error';
                   $rootScope.isAuthenticated = false;
                   $rootScope.PostDataResponse = 'Please enter a username and password';
               }

           };

           service.SetCredentials = function (sessionToken) {

               var JSONObject = JSON.parse(sessionToken);
               var key = 'token';
               myToken = JSONObject[key];
               $log.info('session Token: ' + sessionToken);
               $log.info('myToken: ' + myToken);
               $rootScope.globals = {
                   currentUser: {
                       token: myToken
                   }
               };

               $http.defaults.headers.common['Authorization'] = 'Basic ' + sessionToken; // jshint ignore:line

               //retrieve last login date and then update it
               $rootScope.lastLogin = $.jStorage.get('lastLogin', '');
               var today = new Date();
               epochToday = Math.round(today.getTime() / 1000);
               $.jStorage.set('lastLogin', epochToday, { TTL: 28800000 });
               //$log.info('Rootscope Last Login: '+$rootScope.lastLogin);

               $.jStorage.set('globals', $rootScope.globals, { TTL: 28800000 });
               $.jStorage.set('session', myToken, { TTL: 28800000 });
               $.jStorage.set('loginStatus', 'logged in', { TTL: 28800000 });
               //$cookies.put('globals', $rootScope.globals);
               //$cookies.put('session', myToken);
               //$cookies.put('loginStatus', 'logged in');

               $log.info('Token (jStorage) ' + $.jStorage.get('session', ''));
               //$log.info('Last login (jStorage) ' + $.jStorage.get('lastLogin', ''));
               //$log.info('Login status (jStorage) ' + $.jStorage.get('loginStatus', ''));
           };

           service.ClearCredentials = function () {
               $rootScope.globals = {};
               //$cookies.remove('globals');
               //$cookies.remove('session');
               $.jStorage.deleteKey('globals');
               $.jStorage.deleteKey('session');
               $http.defaults.headers.common.Authorization = 'Basic ';
           };

           return service;
       }])

/* get activities service */
.factory('getActivities', ['$http', '$cookies', function ($http, $cookies) {

    var service = {};

    service.fetch = function (callback) {
        var session = $.jStorage.get('session', ''); // syntax: $.jStorage.get(keyname, "default value")
        //var session = $cookies.get('session');
        var url = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_get_activities';

        $http.get(url)
            .success(callback)
            .error(callback);
    }

    service.reset = function () {
        return [];
    }
    return service;

}])

    .factory('updateActivities', ['$http', '$q', '$cookies', '$rootScope', function ($http, $q, $cookies, $rootScope) {
        var service = {};

            service.sendit = function (data, callback) {
                //alert(data);
                var session = $.jStorage.get('session', '');
                //var session = $cookies.get('session');
                var updateUrl = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_set_badge_cancel';

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }

                $http.post(updateUrl, data, config)
              .success(function (data, status, headers, config) {
                  responsedata = JSON.stringify(data);
                  /* error handling*/
                  if (responsedata.indexOf('error') > 0 || responsedata.indexOf('invalid') > 0) {
                      $rootScope.className = 'error';
                      $rootScope.PostDataResponse = data.message;
                      console.log(data.message);
                  }
                  else {
                      $rootScope.className = 'success';
                      $rootScope.hideDesc = true;
                      console.log('unenrolled from: ',data);
                      $rootScope.$emit('refresh_data', data);
                      $rootScope.PostDataResponse = "You are no longer signed up for this activity!";
                  }
                  callback;
              })
              .error(function (data, status, header, config) {
                  //responsedata = JSON.stringify(data);
                  callback;
                  $rootScope.PostDataResponse = "Unexpected error";
                  console.log(data);
              });
            }
            service.reset = function () {
                return [];
            }
            return service;

    }]);

/* get messages service */
myApp.factory('getMessages', ['$http', '$cookies', '$log', function ($http, $cookies, $log) {

    var service = {};

    service.fetch = function (callback) {
        var session = $.jStorage.get('session', '');
        //var session = $cookies.get('session');
        var url = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_get_email';

        $http.get(url)
            .success(callback)
            .error(callback);
    }

    service.reset = function () {
        return [];
    }
    return service;

}])
    .factory('updateMessages', ['$http', '$cookies', '$rootScope', '$timeout', function ($http, $cookies, $rootScope, $timeout) {
        var service = {};

            service.sendit = function (data, callback) {
                //alert(data);
                var session = $.jStorage.get('session', '');
                //var session = $cookies.get('session');
                var updateUrl = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_set_message_read';

                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }
                $http.post(updateUrl, data, config)
              .success(function (data, status, headers, config) {
                  responsedata = JSON.stringify(data);
                  /* error handling*/
                  if (responsedata.indexOf('error') > 0 || responsedata.indexOf('invalid') > 0) {
                      
                      $rootScope.className = 'error';
                      $rootScope.PostDataResponse = data.message;
                      
                      $timeout(function () {
                          $rootScope.hideMe = true;
                      }, 4000);
                  }
                  else {
                     
                      $rootScope.className = 'success';
                      console.log('message ', data);
                     
                      //silent success
                      $rootScope.$emit('refresh_messages', data);
                  }
                  callback;
              })
              .error(function (data, status, header, config) {
                  //responsedata = JSON.stringify(data);
                  callback;
                  $rootScope.PostDataResponse = "Unexpected error";
              });
            }

            service.reset = function () {
                return [];
            }
            return service;
    }]);

/* get privacy settings service */
myApp.factory('getPrivacy', ['$http', '$cookies', function ($http, $cookies) {

    var service = {};

    service.fetch = function (callback) {
        var session = $.jStorage.get('session', '');
        //var session = $cookies.get('session');
        var url = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_get_privacy_setting';

        $http.get(url)
            .success(callback)
            .error(callback);
    }

    service.reset = function () {
        return [];
    }
    return service;
}])
    .factory('setPrivacy', ['$http', '$cookies', '$rootScope', function ($http, $cookies, $rootScope) {
        var service = {};

            service.sendit = function (data, callback) {
                //alert(data);
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                }

                var session = $.jStorage.get('session', '');
                //var session = $cookies.get('session');
                var updateUrl = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_set_privacy_setting';    // SET

                $http.post(updateUrl, data, config)
              .success(function (data, status, headers, config) {
                  responsedata = JSON.stringify(data);
                  /* error handling*/
                  if (responsedata.indexOf('error') > 0 || responsedata.indexOf('invalid') > 0) {

                      $rootScope.className = 'error';
                      $rootScope.PostDataResponse = data.message;
                      
                  }
                  else {

                      $rootScope.className = 'success';
                      $rootScope.hideDesc = true;
                      $rootScope.PostDataResponse = "You have updated your privacy settings";
                  }
                  callback;
              })
              .error(function (data, status, header, config) {
                  //responsedata = JSON.stringify(data);
                  callback;
                  $rootScope.PostDataResponse = "Unexpected error";
              });
            }

            service.reset = function () {
                return [];
            }
            return service;

    }])

/* get next badges service */
.factory('getNextBadges', ['$http', '$cookies', function ($http, $cookies) {

    var service = {};

    service.fetch = function (callback) {
        var session = $.jStorage.get('session', '');
        //var session = $cookies.get('session');
        var url = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_get_nextbadges';

        $http.get(url)
            .success(callback)
            .error(callback);
    }

    service.reset = function () {
        return [];
    }
    return service;
}])
  .factory('signMeUp', ['$http', '$cookies', '$rootScope', function ($http, $cookies, $rootScope) {
      var service = {};

          service.sendit = function (data, callback) {
              var session = $.jStorage.get('session', '');
              //var session = $cookies.get('session');
              var updateUrl = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_set_badge_signup';

              var config = {
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                  }
              }

              $http.post(updateUrl, data, config)
              .success(function (data, status, headers, config) {
                  responsedata = JSON.stringify(data);
                  /* error handling*/
                  if (responsedata.indexOf('error') > 0 || responsedata.indexOf('invalid') > 0) {
                      $rootScope.className = 'error';
                      $rootScope.PostDataResponse = data.message;
                      console.log(data.message);
                  }
                  else {
                      $rootScope.className = 'success';
                      $rootScope.hideDesc = true;
                      $rootScope.PostDataResponse = "You have signed up!";
                      console.log('signed up for: ', data);
                  }
                  callback;
              })
              .error(function (data, status, header, config) {
                  callback;
                  $rootScope.className = 'error';
                  $rootScope.PostDataResponse = "Unexpected error";
                  console.log(data);
              });
          }

          service.reset = function () {
              return [];
          }
          return service;

  }])

/* get badges service */
.factory('getMyBadges', ['$http', '$cookies', function ($http, $cookies) {

    var service = {};

    service.fetch = function (callback) {
        var session = $.jStorage.get('session', '');
        //var session = $cookies.get('session');
        var url = 'https://moodle.company.name/webservice/rest/server.php?moodlewsrestformat=json&wstoken=' + session + '&wsfunction=local_My Badges_ws_get_badges_issued';

        $http.get(url)
            .success(callback)
            .error(callback);
    }

    service.reset = function () {
        return [];
    }
    return service;
}])

        /* CONTROLLERS */

 .controller('loginCtrl',
     ['$scope', '$rootScope', '$location', 'AuthenticationService', '$routeParams', '$http',
     function ($scope, $rootScope, $location, AuthenticationService, $routeParams, $http) {
         // reset login status
         //AuthenticationService.ClearCredentials();

         //hide menu button and panel initially
         $rootScope.hideMenuButton = true;
         $rootScope.hideMenuPanel = true;
         $rootScope.hidePopup = true;

         $scope.login = function () {
             $scope.dataLoading = true;
             AuthenticationService.Login($scope.username, $scope.password, function (response) {
                 responsedata = JSON.stringify(response);
                 /* error handling*/
                 if (responsedata.indexOf('error') > 0 || responsedata.indexOf('invalid') > 0 || responsedata == '') {
                     $scope.error = response.message;
                     $rootScope.className = 'error';
                     $rootScope.dataLoading = false;
                     $rootScope.hideMenuButton = true;
                     $location.path('/login');

                 } else {
                     AuthenticationService.SetCredentials(response);
                     console.log('response: '+responsedata);
                     $location.path('/home');
                     $rootScope.hideMenuButton = false;
                     var popup = $.jStorage.get('popup', '');
                     if (popup == 'hide') {
                         $rootScope.hidePopup = true;
                         $rootScope.buttonLabel = 'Show tooltips';
                     } else {
                         $rootScope.hidePopup = false;
                         $rootScope.buttonLabel = 'Hide tooltips';
                     }
                 };

                 //if (responsedata.indexOf('token') > 0) {
                 //        AuthenticationService.SetCredentials(response);
                 //        console.log('response: '+responsedata);
                 //        $location.path('/home');
                 //        $rootScope.hideMenuButton = false;
                 //}
                 //else {
                 //        $scope.error = response.message;
                 //        $rootScope.className = 'error';
                 //        $rootScope.dataLoading = false;
                 //        $rootScope.hideMenuButton = true;
                 //        $location.path('/login');
                 //}
             });
         };

         $scope.reload = function () {
             $scope.$emit('refresh_data');
             $rootScope.hideMenuPanel = true;
             $scope.hideMenuPanel = true;
             $rootScope.dataLoading = false;
             $rootScope.loadingFinished = false;
             $rootScope.hideMe = true;
             $rootScope.PostDataResponse = '';
             $rootScope.ResponseDetails = '';
             console.log('refresh event');
             var popup = $.jStorage.get('popup', '');
             if (popup == 'hide') {
                 $rootScope.hidePopup = true;
             } else {
                 $rootScope.hidePopup = false;
             }
         };

         $scope.logout = function () {

             $rootScope.hideMenuButton = true;
             $rootScope.hideMenuPanel = true;
             $scope.hideMenuPanel = true;
             $rootScope.dataLoading = false;
             $rootScope.hideMe = true;
             $rootScope.PostDataResponse = '';
             $rootScope.ResponseDetails = '';
             //alert('logging out');
             AuthenticationService.ClearCredentials();
         };

         $scope.showMenuPanel = function () {
             $scope.hideMenuPanel = false;
         };

         $scope.doHideMenuPanel = function () {
             $scope.hideMenuPanel = true;
             $rootScope.PostDataResponse = '';
         };

         $scope.doHidePopup = function () {
             $scope.hidePopup = true;
             $rootScope.buttonLabel = 'Show tooltips';
             $.jStorage.set('popup', 'hide', { TTL: 28800000 });
         };

         $rootScope.showBackButton = true;

     }])

     .controller('homeCtrl',
        ['$scope', '$rootScope', '$route', '$location', '$log', '$routeParams', '$uibModal',
        function ($scope, $rootScope, $route, $location, $log, $routeParams, $uibModal) {
            //$log.info('you are at ' + $location.path());
            $rootScope.hideMenuPanel = true;
            $rootScope.hideMenuButton = false;

            $scope.showModal = false;
            $scope.showExplanation = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatMy Badges.html'
                });
            };

        }])

     .controller('aboutCtrl',
        ['$scope', '$rootScope', '$route', '$location', '$log', '$routeParams',
        function ($scope, $rootScope, $route, $location, $log, $routeParams) {
            //$log.info('you are at ' + $location.path());
            $rootScope.hideMenuPanel = true;
            $rootScope.hideMenuButton = false;

            $scope.section1Open = true;
            $scope.section1toggle = function () {
                $scope.section1Open = $scope.section1Open === false ? true : false;
            }
            $scope.section2Open = true;
            $scope.section2toggle = function () {
                $scope.section2Open = $scope.section2Open === false ? true : false;
            }
            $scope.section3Open = true;
            $scope.section3toggle = function () {
                $scope.section3Open = $scope.section3Open === false ? true : false;
            }
            $scope.section4Open = true;
            $scope.section4toggle = function () {
                $scope.section4Open = $scope.section4Open === false ? true : false;
            }
            $scope.section5Open = true;
            $scope.section5toggle = function () {
                $scope.section5Open = $scope.section5Open === false ? true : false;
            }

        }])

/* modal instance - explanatory popups */
.controller('explanationModalInstanceCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$uibModalInstance',
    function ($scope, $rootScope, $routeParams, $http, $timeout, $uibModalInstance) {

        $scope.cancel = function () {

            $uibModalInstance.close({});
            $rootScope.hideOverlay = true;

        };

    }])

/* main controller - activities */
    .controller('activitiesCtrl',
['$rootScope', '$scope', '$routeParams', '$uibModal', '$http', 'getActivities',
    function ($rootScope, $scope, $routeParams, $uibModal, $http, getActivities) {

        $scope.loadMyData = function () {
            $scope.activities = [];

            var myActivities = getActivities.fetch(function (activities) {
                $scope.activities = activities;
                $scope.loadingFinished = true;
            });

            $scope.showModal = false;
            $scope.openActivity = function (activity) {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: "activitiesModalInstanceCtrl",
                    templateUrl: './modals/activityModalContent.html',
                    resolve: {
                        activity: function () {
                            return activity;
                        }
                    }
                });
            };

            $scope.showExplanation = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatActivity.html'
                });
            };
        };

        //initial load
        $scope.loadMyData();
        $rootScope.hideMenuPanel = true;

        $rootScope.$on('refresh_data', function (event, data) {
            //console.log('unenrolled from: ', data);
            $scope.loadingFinished = false;
            $rootScope.hideMenuPanel = true;
            $rootScope.PostDataResponse = "";
            $scope.loadMyData();
        });

    }])

/* modal instance - activities */
.controller('activitiesModalInstanceCtrl',
             ['$scope', '$routeParams', '$rootScope', '$timeout', '$uibModalInstance', '$http', 'updateActivities', 'activity',
    function ($scope, $routeParams, $rootScope, $timeout, $uibModalInstance, $http, updateActivities, activity) {

        $scope.activity = activity;

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
            $rootScope.hideOverlay = true;
        };

        $scope.unenrol = function () {
            var unenrol_courseid = $scope.activity.activity_id;

            var postdata = 'courseid=' + unenrol_courseid;
           // alert(postdata);
            var unenrolActivity = updateActivities.sendit(postdata);
            $timeout(function () {
                $uibModalInstance.close({});
                $rootScope.className = '';
                $rootScope.hideOverlay = true;
            }, 3000);
                $scope.$emit('refresh_data');
        }

    }])


    /* controller for badge search page */

    .controller('allbadgesCtrl', ['$scope', '$rootScope', '$uibModal', '$http', '$log', '$filter', '$timeout', 'getMyBadges', 'getActivities', 'getNextBadges', 
        function ($scope, $rootScope, $uibModal, $http, $log, $filter, $timeout, getMyBadges, getActivities, getNextBadges) {
            $scope.loading = true;
            $scope.createData = function () {
                $scope.noresults = true;
                //initialise all the things
                var theBadges = [];
                var theActivities = [];
                var theNextBadges = [];
                $scope.badges = [];
                $scope.activities = [];
                $scope.nextbadges = [];
                var badgeListArray = [];
                $scope.things = [];

                //fetch the data
                var myActivities = getActivities.fetch(function (activities) {
                    $scope.activities = activities;
                    var theActivities = $scope.activities;
                    angular.forEach(theActivities, function (activity) {
                        badgeListArray.push({
                            badge_id: '',
                            courseid: activity.activity_id,
                            activity_name: activity.activity_name,
                            badge_name: '',
                            badge_category: activity.activity_category,
                            description: activity.activity_description,
                            badge_icon: 'activity',
                        });
                    });
                    $scope.things = badgeListArray; //assign to the scope variable; in the end we will have whole list from both async calls..
                    $log.info('loading activities');

                });

                var myNextBadges = getNextBadges.fetch(function (nextbadges) {
                    $scope.nextbadges = nextbadges;
                    var theNextBadges = $scope.nextbadges;
                    angular.forEach(theNextBadges, function (nextbadge) {
                        badgeListArray.push({
                            badge_id: nextbadge.next_badge_id,
                            courseid: nextbadge.courseid,
                            activity_name: nextbadge.coursename,
                            badge_name: nextbadge.next_badge_name,
                            badge_category: nextbadge.next_badge_category,
                            description: nextbadge.coursedescription,  //fix for error reported by Lindsay 
                            badge_icon: 'suggested',
                        });
                    });

                    $scope.things = badgeListArray; //assign to the scope variable; in the end we will have whole list from both async calls..
                    $log.info('loading suggested badges');
                });

                var myBadges = getMyBadges.fetch(function (badges) {
                    $scope.badges = badges;
                    var theBadges = $scope.badges;
                    // badges
                    angular.forEach(theBadges, function (badge) {
                        badgeListArray.push({
                            badge_id: badge.badge_id,
                            courseid: '',
                            activity_name: '',
                            badge_name: badge.badge_name,
                            badge_category: badge.badge_category,
                            description: badge.badge_description,
                            badge_icon: 'achievement',
                        });
                    });

                    $scope.things = badgeListArray; //assign to the scope variable; in the end we will have whole list from both async calls..
                    $log.info('loading awarded badges');
                        
                    // hide the spinner
                    $scope.loading = false;
                    $scope.noresults = false;
                });


                $scope.openMyThing = function (thing) {

                    $rootScope.hideOverlay = false;
                    var modalInstance = $uibModal.open({
                        controller: "myThingsModalInstanceCtrl",
                        templateUrl: './modals/myThingModalContent.html',
                        resolve: {
                            thing: function () {
                                return thing;
                            }
                        }
                    });
                };
                $scope.things = badgeListArray; // assign to the scope variable as we don't know which requests complete first..


            $timeout(function () {
                $scope.things = $filter('orderBy')($scope.things, 'activity_name', 'badge_name');
                $scope.loading = false;
                $scope.loadingFinished = true;
            }, 2000);
        }
            $scope.createData();

            $scope.query = {}
            $scope.queryBy = '$'
            $scope.orderProp = "badge_name";

            $rootScope.$on('refresh_data', function (event, data) {
                var myData = JSON.stringify(data);
                console.log('allBadgesCtrl: ', myData);
                $rootScope.hideMenuPanel = true;
                $scope.createData();
            });
        }])

/* controller - awards: uses getMyBadges service*/
.controller('awardsCtrl',
    ['$rootScope', '$scope', '$routeParams', '$http', '$uibModal', 'getMyBadges',
    function ($rootScope, $scope, $routeParams, $http, $uibModal, getMyBadges) {

        $scope.awards = [];

        var myAwards = getMyBadges.fetch(function (awards) {
            $scope.awards = awards;
        });

        /* popups with list of badges */
        $scope.toggle1 = true;
        $scope.toggleFilter1 = function () {

            $rootScope.hideOverlay = $scope.toggle1 === true ? false : true;
            $scope.toggle1 = $scope.toggle1 === false ? true : false;
        }
        $scope.toggle2 = true;
        $scope.toggleFilter2 = function () {

            $rootScope.hideOverlay = $scope.toggle2 === true ? false : true;
            $scope.toggle2 = $scope.toggle2 === false ? true : false;
        }
        $scope.toggle3 = true;
        $scope.toggleFilter3 = function () {

            $rootScope.hideOverlay = $scope.toggle3 === true ? false : true;
            $scope.toggle3 = $scope.toggle3 === false ? true : false;
        }
        $scope.toggle4 = true;
        $scope.toggleFilter4 = function () {

            $rootScope.hideOverlay = $scope.toggle4 === true ? false : true;
            $scope.toggle4 = $scope.toggle4 === false ? true : false;
        }

        $scope.showExplanation = function () {
            $rootScope.hideOverlay = false;

            var modalInstance = $uibModal.open({
                controller: 'explanationModalInstanceCtrl',
                templateUrl: './modals/whatAward.html'
            });
        };

    }])

    /* controller for events feed */

    .controller('eventsCtrl', ['$scope', '$rootScope', '$http', '$filter', '$timeout', 'getMyBadges', 'getActivities',
        function ($scope, $rootScope, $http, $filter, $timeout, getMyBadges, getActivities) {
            $scope.loading = true;
            $scope.createData = function () {

                //initialise all the things
                var theBadges = [];
                var theActivities = [];
                $scope.badges = [];
                $scope.activities = [];
                var eventsListArray = [];
                $scope.events = [];

                //fetch the data
                var myActivities = getActivities.fetch(function (activities) {
                    $scope.activities = activities;
                    var theActivities = $scope.activities;
                    angular.forEach(theActivities, function (activity) {
                        eventsListArray.push({
                            event_id: activity.activity_id,
                            event_preamble: 'You signed up for ',
                            event_name: activity.activity_name,
                            event_type: 'sign-up',
                            event_category: activity.activity_category,
                            event_date: activity.signed_up
                        });
                    });
                    $scope.events = eventsListArray; //assign to the scope variable; in the end we will have whole list from both async calls..
                });

                var myBadges = getMyBadges.fetch(function (badges) {
                    $scope.badges = badges;
                    var theBadges = $scope.badges;
                    var confCount = 0;
                    var connCount = 0;
                    var entcCount = 0;
                    var gensCount = 0;
                    var newCount = 0;
                    angular.forEach(theBadges, function (badge) {
                        if (badge.issue_date > $rootScope.lastLogin) {
                            newCount += 1;
                        }
                        // badge events
                        eventsListArray.push({
                            event_id: badge.badge_id,
                            event_preamble: 'You completed the ',
                            event_name: badge.badge_name + ' achievement',
                            event_type: 'badge-issued',
                            event_category: badge.badge_category,
                            event_date: badge.issue_date
                        });
                        //award events
                        if (badge.badge_category == 'CONF') {
                            confCount += 1;
                            if (confCount !== 1 && confCount !== 4) {
                                if (badge.issue_date > $rootScope.lastLogin) {
                                    newCount += 1;
                                }
                                eventsListArray.push({
                                    event_id: 'A' + badge.badge_id,
                                    event_preamble: 'You were awarded ',
                                    event_name: 'count' + confCount,
                                    event_type: 'award-issued',
                                    event_category: 'CONF',
                                    event_date: badge.issue_date
                                });
                            }
                        }
                        if (badge.badge_category == 'CONN') {
                            connCount += 1;
                            if (connCount !== 1 && connCount !== 4) {
                                if (badge.issue_date > $rootScope.lastLogin) {
                                    newCount += 1;
                                }
                                eventsListArray.push({
                                    event_id: 'A' + badge.badge_id,
                                    event_preamble: 'You were awarded ',
                                    event_name: 'count' + connCount,
                                    event_type: 'award-issued',
                                    event_category: 'CONN',
                                    event_date: badge.issue_date
                                });
                            }
                        }
                        if (badge.badge_category == 'ENTC') {
                            entcCount += 1;
                            if (entcCount !== 1 && entcCount !== 4) {
                                if (badge.issue_date > $rootScope.lastLogin) {
                                    newCount += 1;
                                }
                                eventsListArray.push({
                                    event_id: 'A' + badge.badge_id,
                                    event_preamble: 'You were awarded ',
                                    event_name: 'count' + entcCount,
                                    event_type: 'award-issued',
                                    event_category: 'ENTC',
                                    event_date: badge.issue_date
                                });
                            }
                        }
                        if (badge.badge_category == 'GENS') {
                            gensCount += 1;
                            if (gensCount !== 1 && gensCount !== 4) {
                                if (badge.issue_date > $rootScope.lastLogin) {
                                    newCount += 1;
                                }
                                eventsListArray.push({
                                    event_id: 'A' + badge.badge_id,
                                    event_preamble: 'You were awarded ',
                                    event_name: 'count' + gensCount,
                                    event_type: 'award-issued',
                                    event_category: 'GENS',
                                    event_date: badge.issue_date
                                });
                            }
                        }
                        $scope.loading = false;
                    },
                    function (error) {
                        $scope.loading = true;
                        $log.error('failure loading', error);

                    });

                    $scope.events = eventsListArray; // assign to the scope variable as we don't know which requests complete first..
                    $scope.newCount = newCount;
                });

                $timeout(function () {
                    $scope.events = $filter('orderBy')($scope.events, 'event_date');
                    $scope.loading = false;
                    $scope.loadingFinished = true;
                }, 2000);
            }


            $scope.createData();
        }])
/* controller for dashboard, badges in category, categories */

    .controller('multiCtrl', ['$scope', '$rootScope', '$http', '$uibModal', '$q', 'getActivities', 'updateActivities', 'getNextBadges', 'signMeUp', 'getMyBadges',
        function ($scope, $rootScope, $http, $uibModal, $q, getActivities, updateActivities, getNextBadges, signMeUp, getMyBadges) {

            $scope.initial = [];
            $scope.loading = true;

            $rootScope.$on("logout", function (event) {
                $scope.activities = angular.copy($scope.initial);
                $scope.badges = angular.copy($scope.initial);
                $scope.nextbadges = angular.copy($scope.initial);
                $scope.awards = angular.copy($scope.initial);
            });

            // in dashboard page, show sections
            $scope.achieveOpen = true;
            $scope.achieveToggle = function () {
                $scope.achieveOpen = $scope.achieveOpen === false ? true : false;
            }
            $scope.activityOpen = true;
            $scope.activityToggle = function () {
                $scope.activityOpen = $scope.activityOpen === false ? true : false;
            }
            $scope.suggestedOpen = true;
            $scope.suggestedToggle = function () {
                $scope.suggestedOpen = $scope.suggestedOpen === false ? true : false;
            }
            $scope.awardsOpen = true;
            $scope.awardsToggle = function () {
                $scope.awardsOpen = $scope.awardsOpen === false ? true : false;
            }

            // in categories page, show sections
            $scope.confOpen = true;
            $scope.confToggle = function () {
                $scope.confOpen = $scope.confOpen === false ? true : false;
            }
            $scope.entcOpen = true;
            $scope.entcToggle = function () {
                $scope.entcOpen = $scope.entcOpen === false ? true : false;
            }
            $scope.connOpen = true;
            $scope.connToggle = function () {
                $scope.connOpen = $scope.connOpen === false ? true : false;
            }
            $scope.gensOpen = true;
            $scope.gensToggle = function () {
                $scope.gensOpen = $scope.gensOpen === false ? true : false;
            }

            // load explanatory Modals
            $scope.showConf = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatConfidence.html'
                });
            };
            $scope.showConn = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatConnectedness.html'
                });
            };
            $scope.showEntC = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatEntC.html'
                });
            };
            $scope.showGenS = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatGenS.html'
                });
            };

            $scope.showCatExplanation = function () {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: 'explanationModalInstanceCtrl',
                    templateUrl: './modals/whatCategory.html'
                });
            };

            // load activities, badges, next badges
            $scope.loadMyBadges = function () {
                $scope.badges = [];
                $scope.awards = [];

                var newBadgeCount = 0;

                var myBadges = getMyBadges.fetch(function (badges) {
                    $scope.badges = badges;
                    //console.log('in myBadges');
                    $scope.myBadgeLoadingFinished = true;

                    var theBadges = $scope.badges;
                    angular.forEach(theBadges, function (badge) {
                        if (badge.issue_date > $rootScope.lastLogin) {
                            newBadgeCount += 1;
                        }
                    });
                    $scope.newBadgeCount = newBadgeCount;
                });

                $scope.loading = false;
                $scope.showModal = false;
                };

                $scope.openMyBadge = function (badge) {

                    $rootScope.hideOverlay = false;
                    var modalInstance = $uibModal.open({
                        controller: "myBadgesModalInstanceCtrl",
                        templateUrl: './modals/myBadgeModalContent.html',
                        resolve: {
                            badge: function () {
                                return badge;
                            }
                        }
                    });
                };


                $scope.loadNextBadges = function () {

                $scope.nextbadges = [];
                var myNextBadges = getNextBadges.fetch(function (nextbadges) {
                    $scope.nextbadges = nextbadges;
                    //console.log('in myNextBadges');
                    $scope.nextBadgeLoadingFinished = true;
                });
         
                $scope.openNextBadge = function (nextbadge) {

                    $rootScope.hideOverlay = false;

                    var modalInstance = $uibModal.open({
                        controller: "nextBadgesModalInstanceCtrl",
                        templateUrl: './modals/nextBadgeModalContent.html',
                        resolve: {
                            nextbadge: function () {
                                return nextbadge;
                            }
                        }
                    });
                };
            };

                $scope.loadActivities = function () {
                    $scope.activities = [];

                    var myActivities = getActivities.fetch(function (activities) {
                        $scope.activities = activities;
                        //console.log('in myActivities');
                        $scope.activityLoadingFinished = true;
                    });

                    $scope.openActivity = function (activity) {

                        $rootScope.hideOverlay = false;
                        var modalInstance = $uibModal.open({
                            controller: "activitiesModalInstanceCtrl",
                            templateUrl: './modals/activityModalContent.html',
                            resolve: {
                                activity: function () {
                                    return activity;
                                }
                            }
                        });
                    };

                };

                $scope.resetModals = function () {
                    $rootScope.hideDesc = false;
                    $rootScope.hideMe = true;
                    $rootScope.PostDataResponse = "";
                    $rootScope.ResponseDetails = "";
                };

            //initial load
            $scope.loadMyBadges();
            $scope.loadNextBadges();
            $scope.loadActivities();
            $rootScope.hideMenuPanel = true;

            $rootScope.$on('refresh_data', function (event, data) {
                var myData = JSON.stringify(data);
                console.log('multiCtrl: ',myData);
                $scope.loadingFinished = false;
                $scope.activityLoadingFinished = false;
                $scope.myBadgeLoadingFinished = false;
                $scope.nextBadgeLoadingFinished = false;
                $rootScope.hideMenuPanel = true;
                
                //var deferred = $q.defer();
                //var promise = deferred.promise.then($scope.loadMyBadges()).then($scope.loadNextBadges()).then($scope.loadActivities()).then($scope.resetModals());
                $scope.loadMyBadges();
                $scope.loadNextBadges();
                $scope.loadActivities();
            });

            
        }]) // end of multiCtrl


/* main controller - messages */
 .controller('messagesCtrl',
['$rootScope', '$scope', '$uibModal', '$routeParams', '$log', '$timeout', '$http', 'getMessages',
    function ($rootScope, $scope, $uibModal, $routeParams, $log, $timeout, $http, getMessages) {

        $scope.loadMessageData = function () {
            $scope.emails = [];
            var myMessages = getMessages.fetch(function (emails) {
                $scope.emails = emails;
                $scope.loadingFinished = true;
            });

            $scope.openMsg = function (email) {

                $rootScope.hideOverlay = false;
                var modalInstance = $uibModal.open({
                    controller: "messagesModalInstanceCtrl",
                    templateUrl: './modals/myEmailModalContent.html',
                    resolve: {
                        email: function () {
                            return email;
                        }
                    }
                });
            };

        }
        //initial load
        $scope.loadMessageData();
        $rootScope.hideMenuPanel = true;

        $rootScope.$on('refresh_messages', function (event, data) {
            $scope.loadingFinished = false;
            $scope.loadMessageData(data);
            $rootScope.hideMenuPanel = true;
        });
    }])

/* modal instance - messages */
.controller('messagesModalInstanceCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$uibModalInstance', 'updateMessages', 'email',
    function ($scope, $rootScope, $routeParams, $http, $timeout, $uibModalInstance, updateMessages, email) {
        $scope.email = email;

        $scope.Math = window.Math;
        $scope.date = new Date();
        $scope.epoch = Math.round($scope.date.getTime() / 1000);

        $scope.cancel = function () {
            var read_message_id = $scope.email.message_id;
            var time_message_read = $scope.epoch;

            var postdata = 'messageid=' + read_message_id + '&timeread=' + time_message_read;

            var readMyMessages = updateMessages.sendit(postdata);

            $uibModalInstance.close({});

            $scope.$emit('refresh_messages');
            $rootScope.hideOverlay = true;
        };

    }])



/* controller - privacy */
.controller('privacyCtrl', ['$scope', '$rootScope', '$http', '$routeParams', '$log', 'getPrivacy', 'setPrivacy', function ($scope, $rootScope, $http, $routeParams, $log, getPrivacy, setPrivacy) {

    $scope.privacy = [];
    $scope.refreshed = false;

    var myPrivacy = getPrivacy.fetch(function (privacy) {
        $scope.privacy = privacy;
    });

    $scope.checked = function () {
        $log.info($scope.privacy);
    }

    $scope.SendData = function () {
        // use $.param jQuery function to serialize data from JSON
        if ($scope.privacy.badgeprivacysetting == true) {
            var data = $.param({
                badgeprivacysetting: 1
            });
        }
        else {
            var data = $.param({
                badgeprivacysetting: 0
            });
        }

        var myPrivacy = setPrivacy.sendit(data);
    };

    $rootScope.hideMenuPanel = true;

    var popup = $.jStorage.get('popup', '');
    if (popup == 'hide') {
        $rootScope.buttonLabel = 'Show tooltips';
    } else {
        $rootScope.buttonLabel = 'Hide tooltips';
    }

    $rootScope.showPopup = function () {
        $rootScope.hidePopup = $scope.hidePopup === true ? false : true;
        $.jStorage.set('popup', '', { TTL: 28800000 });
        if($rootScope.hidePopup == true) {
            $rootScope.buttonLabel = 'Show tooltips';
        } else {
            $rootScope.buttonLabel = 'Hide tooltips';
        }
    };

    $scope.reload = function () {
        $scope.$emit('refresh_data');
        $rootScope.hideMenuPanel = true;
        $scope.hideMenuPanel = true;
        $rootScope.dataLoading = false;
        $rootScope.loadingFinished = false;
        $rootScope.hideMe = true;
        $rootScope.PostDataResponse = '';
        $rootScope.ResponseDetails = '';
        console.log('refresh event');
        var popup = $.jStorage.get('popup', '');
        if (popup == 'hide') {
            $rootScope.hidePopup = true;
        } else {
            $rootScope.hidePopup = false;
        }
        $scope.refreshed = true;
    };

}])



/* main controller - suggested badges */
    .controller('nextBadgesCtrl',
['$rootScope', '$scope', '$uibModal', '$http', '$routeParams', '$timeout', 'getNextBadges', 'getMyBadges',
    function ($rootScope, $scope, $uibModal, $http, $routeParams, $timeout, getNextBadges, getMyBadges) {

        $scope.loadData = function () {
            $scope.nextbadges = [];
            $scope.loading = true;

            var myNextBadges = getNextBadges.fetch(function (nextbadges) {
                $scope.nextbadges = nextbadges;
                $scope.loading = false;
                $scope.loadingFinished = true;
            });

            $scope.badges = [];

            var myBadges = getMyBadges.fetch(function (badges) {
                $scope.badges = badges;
            });

            $scope.confDetailOpen = true;
            $scope.confDetailToggle = function () {
                $scope.confDetailOpen = $scope.confDetailOpen === false ? true : false;
            }
            $scope.entcDetailOpen = true;
            $scope.entcDetailToggle = function () {
                $scope.entcDetailOpen = $scope.entcDetailOpen === false ? true : false;
            }
            $scope.connDetailOpen = true;
            $scope.connDetailToggle = function () {
                $scope.connDetailOpen = $scope.connDetailOpen === false ? true : false;
            }
            $scope.gensDetailOpen = true;
            $scope.gensDetailToggle = function () {
                $scope.gensDetailOpen = $scope.gensDetailOpen === false ? true : false;
            }

            $scope.showModal = false;
            $scope.openNextBadge = function (nextbadge) {

                $rootScope.hideOverlay = false;

                var modalInstance = $uibModal.open({
                    controller: "nextBadgesModalInstanceCtrl",
                    templateUrl: './modals/nextBadgeModalContent.html',
                    resolve: {
                        nextbadge: function () {
                            return nextbadge;
                        }
                    }
                });

            }; // end of $scope.open

        }; // end of loadData

        //initial load
        $scope.loadData();
        $rootScope.hideMenuPanel = true;

        $rootScope.$on('refresh_data', function (event, data) {
            // console.log('signed up for: ', data);
            $scope.loadingFinished = false;
            $rootScope.hideMenuPanel = true;
            $scope.loadData();
        });

    }])



/* modal instance - suggested badges */
.controller('nextBadgesModalInstanceCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$uibModalInstance', 'signMeUp', 'nextbadge',
function ($scope, $rootScope, $routeParams, $http, $timeout, $uibModalInstance, signMeUp, nextbadge) {
    $scope.nextbadge = nextbadge;
    $scope.cancel = function () {
        $uibModalInstance.dismiss();

        $rootScope.hideOverlay = true;
    };

    $scope.confirm = function () {

        var signup_courseid = $scope.nextbadge.courseid;

        var postdata = 'courseid=' + signup_courseid;

        var mySignUp = signMeUp.sendit(postdata);

        $timeout(function () {
            $uibModalInstance.close({});
            $rootScope.className = '';
            $rootScope.hideOverlay = true;
        }, 4000);
            $scope.$emit('refresh_data');
    };

}])


/* modal instance - THINGS */
.controller('myThingsModalInstanceCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$uibModalInstance', 'signMeUp', 'updateActivities', 'thing',
function ($scope, $rootScope, $routeParams, $http, $timeout, $uibModalInstance, signMeUp, updateActivities,  thing) {
    $scope.thing = thing;
    $scope.cancel = function () {
        $uibModalInstance.dismiss();

        $rootScope.hideOverlay = true;
    };

    $scope.confirm = function () {

        var signup_courseid = $scope.thing.courseid;

        var postdata = 'courseid=' + signup_courseid;

        var mySignUp = signMeUp.sendit(postdata);

        $timeout(function () {
            $uibModalInstance.close({});
            $rootScope.className = '';
            $rootScope.hideOverlay = true;
            $scope.$emit('refresh_data');
        }, 4000);
    };

    $scope.unenrol = function () {
        var unenrol_courseid = $scope.thing.courseid;

        var postdata = 'courseid=' + unenrol_courseid;
        // alert(postdata);
        var unenrolActivity = updateActivities.sendit(postdata);
        $timeout(function () {
            $uibModalInstance.close({});
            $rootScope.className = '';
            $rootScope.hideOverlay = true;
        }, 3000);
        $scope.$emit('refresh_data');
    }

}])
/* main controller - your badges */
.controller('myBadgesCtrl',
['$rootScope', '$scope', '$routeParams', '$uibModal', '$http', 'getMyBadges',
    function ($rootScope, $scope, $routeParams, $uibModal, $http, getMyBadges) {
        $scope.badges = [];

        var myBadges = getMyBadges.fetch(function (badges) {
            $scope.badges = badges;
            $scope.loadingFinished = true;
        });

        $scope.showModal = false;
        $scope.openMyBadge = function (badge) {

            $rootScope.hideOverlay = false;
            var modalInstance = $uibModal.open({
                controller: "myBadgesModalInstanceCtrl",
                templateUrl: './modals/myBadgeModalContent.html',
                resolve: {
                    badge: function () {
                        return badge;
                    }
                }
            });
        };

        $scope.showExplanation = function () {

            $rootScope.hideOverlay = false;
            var modalInstance = $uibModal.open({
                controller: 'explanationModalInstanceCtrl',
                templateUrl: './modals/whatBadge.html'
            });
        };

        $rootScope.hideMenuPanel = true;

    }])

/* modal instance - your badges */
.controller('myBadgesModalInstanceCtrl', ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$uibModalInstance', 'badge',
function ($scope, $rootScope, $routeParams, $http, $timeout, $uibModalInstance, badge) {
    $scope.badge = badge;
    $scope.cancel = function () {
        $uibModalInstance.dismiss();

        $rootScope.hideOverlay = true;
    };

}])


/***
  * FILTERS
  ***/

    .filter('split', function () {
        return function (input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            return input.split(splitChar)[splitIndex];
        }
    })

    .filter('isTruthy', function () {
        return function (input) {
            // Add here, as many 'true' values as you want, this is not case sensitive...
            var truffies = [1, '1', true, 'true', 'yes', 'y'];

            if (typeof input == 'String')
                input = input.toLowerCase();

            return truffies.indexOf(input) > -1;
        };
    })

    .filter('htmlToPlainText', function () {
        return function (text) {
            return text ? String(text).replace(/(&nbsp;|<([^>]+)>)/gm, '') : '';
        };
    });
