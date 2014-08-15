/* global GRAPHS */
(function(){
    'use strict';
    var color, colors;
    if (getQueryParam("colored") === "true") {
        colors = {
            '2xx': 'be84ff',
            '3xx': '66d9ef',
            '4xx': '323a9d',
            '5xx': 'ffffff',
            response_time: 'ee6775',
            semaphore_green: '00cc00',
            semaphore_yellow: 'cccc00',
            semaphore_red: 'cc0000'
        };
    } else {
        colors = {
            '2xx': '00cc00',
            '3xx': 'blue',
            '4xx': '006600',
            '5xx': 'ffffff',
            response_time: '00cc00',
            semaphore_green: '00cc00',
            semaphore_yellow: 'cccc00',
            semaphore_red: 'cc0000'
        };
    }

    for (color in colors) {
        if (colors.hasOwnProperty(color)) {
            var userColor = getQueryParam(color);
            if (userColor) {
                colors[color] = userColor;
            }
        }
    }

    var templates = {
        'semaphore': 'group('+
            //'alias(color(sum(hosts.api*.counts.{{SOURCE}}.sum), "f629d9"), "sum"),'+

            // aka "нефть"
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.5*)), "' + colors['5xx'] + '"), "5**"),' +

            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.green)), "' + colors.semaphore_green +
                '"), "< 0.3 (not 5**)"),' +
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.yellow)), "' + colors.semaphore_yellow +
                '"), "< 1.0 (not 5**)"),' +
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.red)), "' + colors.semaphore_red +
                '"), "> 1.0 (not 5**)")' +
        ')',

        'codes': 'group('+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.5*)), "' + colors['5xx'] + '"), "5xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.3*)), "' + colors['3xx'] + '"), "3xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.4*)), "' + colors['4xx'] + '"), "4xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.2*)), "' + colors['2xx'] + '"), "2xx")'+
        ')',

        'response_time': 'group('+
            'threshold(0.3, "0.3 sec", "cc0000"),'+
            'alias(color(stacked(maxSeries(hosts.api*.stages.{{SOURCE}}.total.q95)), "' + colors.response_time +
                '"), "total")'+
        ')'
    };

    window.console && console.debug && console.debug(templates, 'templates');

    var fromValues = ['-15min', '-30min', '-1h', '-4h', '-12h', '-1d', '-7d'];
    var ymaxValues = ['0', '5', '10', '25', '50', '100', '150', '500'];

    var refreshTimeout = 30000;

    var renderOptions = {
        fontSize: '12',
        fontName: 'FreeMono',
        fontBold: 'true',
        lineWidth: '0',
        margin: '5',
        areaAlpha: '.5',
        bgcolor: 'black',
        fgcolor: 'gray',
        hideLegend: 'false',
        yMin: '0',
        width: '316',
        height: '216'
    };

    var urlencode = function(obj){
        return Object.keys(obj).reduce(function(acc, val){
            return acc + '&' + val + '=' + obj[val];
        }, '');
    };

    var preloadImage = function(imgNode, src){
        var image = new Image();
        var cb = function(){
            imgNode.src = image.src;
            image.removeEventListener('load', cb);
        };
        image.addEventListener('load', cb);
        image.src = src;
        if (image.complete) {
            imgNode.src = image.src;
        }
    };

    var fromNode = document.createElement('select');
    fromNode.id = 'from';

    var ymaxNode = document.createElement('select');
    ymaxNode.id = 'yMax';

    var graphsNode = document.createElement('div');
    graphsNode.id = 'graphs';

    var numbersNode = document.createElement('div');
    numbersNode.id = 'fifties';

    var setParamsFromLocation = function(){
        fromNode.value = getQueryParam("from_node") || '-1h';
        ymaxNode.value = getQueryParam("y_max") || '0';
    };

    var appendSelects = function(){

        var genOptions = function(container, prefix, value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value + prefix;
            container.appendChild(option);
        };

        fromValues.forEach(genOptions.bind(null, fromNode, ''));
        ymaxValues.forEach(genOptions.bind(null, ymaxNode, 'rps'));

        document.body.appendChild(fromNode);
        document.body.appendChild(ymaxNode);

        var colored = document.createElement('a');
        if (getQueryParam("colored")) {
            colored.href = '?';
            colored.appendChild(document.createTextNode('убрать цвета'));
        } else {
            colored.href = '?colored=true';
            colored.appendChild(document.createTextNode('добавить цвета'));
        }
        document.body.appendChild(document.createTextNode(' '));
        document.body.appendChild(colored);
    };


    var images = [];

    var draw = function(){
        GRAPHS.forEach(function() {
            var index = arguments[1];
            var image = images[index];

            var url = image.url + urlencode({from: fromNode.value});

            if (ymaxNode.value !== '0') {
                url = url + urlencode({yMax: ymaxNode.value});
            }

            preloadImage(image.node, url);
        });
    };

    var getNumbers = function(){
        var period = 60;  // seconds
        var url = 'http://graphite.hh.ru/render?target=sum(hosts.api*.counts.total.code.5*)&format=json&from=-' +
                    period + 'sec';
        var xhr = new XMLHttpRequest();

        var parseResponse = function() {
            try {
                var dataPoints = JSON.parse(this.responseText)[0].datapoints;
                var number = dataPoints.reduce(
                    function(acc, dataPoint) {
                        var weight = dataPoint.length > 0 ? dataPoint[0] : 0;
                        return acc + weight;
                    }, 0);
                numbersNode.innerHTML = Math.round(number / period * 1000) / 1000;
            } catch(e) {
                numbersNode.innerHTML = '…';
            }finally {
                window.setTimeout(getNumbers, period * 1000);
            }
        };

        xhr.addEventListener('load', parseResponse, false);
        xhr.open('get', url);
        xhr.send();
    };


    appendSelects();
    setParamsFromLocation();

    GRAPHS.forEach(function(item){
        var image = new Image();
        image.width = renderOptions.width;
        image.height = renderOptions.height;
        graphsNode.appendChild(image);
        images.push({
            node: image,
            url: 'http://graphite.hh.ru/render?' + urlencode({
                title: item[0],
                target: templates[item[1]].replace(/{{SOURCE}}/g, item[2])
            }) + urlencode(renderOptions)
        });
    });

    document.body.appendChild(graphsNode);

    var firstImg = document.querySelector('#graphs > img');
    numbersNode.style.top = firstImg.offsetTop + 'px';
    numbersNode.style.left = firstImg.offsetLeft + 'px';
    numbersNode.style.fontSize = (firstImg.height / 3) + 'px';
    numbersNode.style.textAlign = 'left';
    numbersNode.innerHTML = '…';

    document.body.appendChild(numbersNode);

    draw();
    getNumbers();
    fromNode.addEventListener('change', draw);
    ymaxNode.addEventListener('change', draw);

    window.setInterval(draw, refreshTimeout);
    window.setTimeout(getNumbers, refreshTimeout);

    //utils

    function getQueryParam(param) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === param) {
                return decodeURIComponent(pair[1]);
            }
        }
        return undefined;
    }

})();

