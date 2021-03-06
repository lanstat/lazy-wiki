var app = angular.module('lazyWiki',['ngRoute', 'ngSanitize','jkuri.slimscroll']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/', {
            controller: 'homeController',
            template: function(){
                return document.getElementById('homeTpl').innerHTML;
            }
        })
        .when('/wiki/:name', {
            controller: 'wikiController',
            template: function(){
                return document.getElementById('articleTpl').innerHTML;
            }
        })
        .when('/wiki/:name/edit', {
            controller: 'wikiEditController',
            template: function(){
                return document.getElementById('editArticleTpl').innerHTML;
            }
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('mainController', ['$scope', function($scope){
    $scope.currentSection = 1;
    
    $scope.saveDatabase = function(){
        var data = 'window.wikiDataBase={';

        var convertToString = function(item){
            var count = 0;
            var content  = '{';
            for (var param in item) {
                if (item.hasOwnProperty(param)) {
                    if (typeof item[param] === 'object'){
                        content += param + ':' + convertToString(item[param]).content;
                    }else{
                        var line = item[param].replace(/'/g,'\\\'');
                        line = line.replace(/\n/g, '\\n');
                        content += param + ':\'' + line + '\'';
                    }
                    content  += ',';
                    count++;
                }
            }
            content = content.substring(0, content.length -1);
            content += '}';
            return {content: content, count: count};
        };

        var convert = convertToString(wikiDataBase.articles);

        data += 'count:' + convert.count + ',articles:'+ convert.content + '};';

        var blob = new Blob([data], {type: 'application/javascript;charset=utf-8;'});
        var link = angular.element('<a></a>');
        link.attr('href', window.URL.createObjectURL(blob));
        link.attr('download', 'data.js');
        link[0].click();
    };

    $scope.days = [];

    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
    $scope.days.push({image: 'assets/data/taj-mahal.jpg', content: 'Taj mahal'});
}]);

app.controller('menuController', ['$scope', '$location',function($scope, $location){
    $scope.navigation = [
        {title:'Interaccion', items:[
            {title:'Ayuda', link:'#/'},
            {title:'Acerca de', link:'#/'}
        ]},
        {title:'Herramientas', items:[
            {title:'Informacion de pagina', link:'#/'}
        ]}
    ];

    $scope.getRandomPage = function(){
        var seed = parseInt(Math.random() * wikiDataBase.count);
        var index = 0;
        var page = '';

        for (var param in wikiDataBase.articles){
            if (wikiDataBase.articles.hasOwnProperty(param)) {
                if(seed == index){
                    page = param;
                    break;
                }
            }
            index ++;
        }

        $location.path('/wiki/'+page);
    };
}]);

app.controller('homeController', ['$scope', function($scope){

}]);

app.controller('wikiController', ['$scope', '$routeParams', '$route', '$sce', '$location', '$rootScope',
                                    function($scope, $routeParams, $route, $sce, $location, $rootScope){
    wikiDataBase.read($routeParams.name, function(status, article){
        $scope.$apply(function(){
            $scope.routeName = $routeParams.name;
            if (article){
                $scope.title = article.title;
                $scope.content = WIKI.decode(article.content);
            } else {
                $location.path('/wiki/'+$routeParams.name+ '/edit');
            }
            $rootScope.$broadcast('openArticle', $scope.content);
        });
    });

    $scope.toTrusted = function(html_code) {
        return $sce.trustAsHtml(html_code);
    };
}]);

app.controller('wikiEditController', ['$scope', '$routeParams', '$location', function($scope, $routeParams, $location){
    wikiDataBase.read($routeParams.name, function(status, article){
        if (status > -1){
            $scope.$apply(function(){
                $scope.formData = {
                    title: article.title,
                    content: article.content
                };
            });
        } else {
            $scope.$apply(function(){
                $scope.formData = {
                    title: $routeParams.name,
                    content: ''
                };
            });
        }
    });

    $scope.store = function(){
        var article = {hash: $routeParams.name.replace(' ', '_'), title: $scope.formData.title, content: $scope.formData.content};

        wikiDataBase.write(article, function(){
            $scope.$apply(function(){
                $location.path('/wiki/'+article.hash);
            });
        });
    };
}]);

app.controller('notesController', ['$scope', function($scope){
    $scope.notes = [];

    $scope.add = function(){
        $scope.notes.push({msg:'hola'});
    }
}]);

app.controller('readOptionController', ['$scope', function($scope){
    $scope.links = true;
    $scope.wordCount = 0;
    $scope.wordPerMinute = 0;

    $scope.$on('openArticle', function(event, content){
        var element = document.createElement('div');
        element.innerHTML = content;
        $scope.wordCount = element.innerText.split(' ').length;
        $scope.wordPerMinute = parseInt($scope.wordCount / 200) + 1;
    });

    $scope.toggleLinks = function(){
        var element = document.getElementById('wikiRender');
        var items = element.getElementsByTagName('a');
        for (var i=0;i<items.length;i++){
            if ($scope.links){
                items[i].className += ' light-black';
            } else {
                items[i].className = items[i].className.replace('light-black', '');
            }
        }
        $scope.links = !$scope.links;
    };

    $scope.resizeFont = function(dir){
        var element = document.getElementById('wikiRender');
        var size = parseInt(element.style.fontSize.replace('px', ''));
        element.style.fontSize = (size + dir) + 'px';
    }
}]);

app.filter('safe', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}]);
