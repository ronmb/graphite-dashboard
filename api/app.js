(function(){
    'use strict';

    var templates = {
        'semaphore': 'group('+
            //'alias(color(sum(hosts.api*.counts.{{SOURCE}}.sum), "f629d9"), "sum"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.5*)), "ffffff"), "5**"),'+  // aka "нефть"

            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.green)), "00cc00"), "< 0.3 (not 5**)"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.yellow)), "cccc00"), "< 1.0 (not 5**)"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.red)), "cc0000"), "> 1.0 (not 5**)")'+
        ')',

        'codes': 'group('+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.5*)), "ffffff"), "5xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.3*)), "blue"), "3xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.4*)), "006600"), "4xx"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.code.2*)), "00cc00"), "2xx")'+
        ')',

        'response_time': 'group('+
            'threshold(0.3, "0.3 sec", "cc0000"),'+
            'alias(color(stacked(maxSeries(hosts.api*.stages.{{SOURCE}}.total.q95)), "00cc00"), "total")'+
        ')'
    };

    var fromValues = ['-1h', '-4h', '-12h', '-1d', '-7d'];
    var ymaxValues = ['0', '5', '10', '25', '50', '100', '150', '500'];

    var refreshTimeout = 30000;

    var renderOptions = {
        fontSize: '12',
        fontName: 'FreeMono',
        fontBold: 'true',
        lineWidth: '1',
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
        var from = '-1h';
        var yMax = '0';
        var hash = window.location.search;
        if (hash) {
            hash = hash.substring(1);
            var delimiterIndex = hash.indexOf('/');
            if (delimiterIndex === -1) {
                from = hash;
            } else {
                from = hash.substring(0, delimiterIndex);
                yMax = hash.substring(delimiterIndex+1);
            }
        }
        fromNode.value = from;
        ymaxNode.value = yMax;
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

    };


    var images = [];

    var draw = function(){
        graphs.forEach(function(item, index){
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
        $.ajax({
            'success': function(data) {
                if (data && data.length > 0 && data[0].datapoints) {
                    var res = data[0].datapoints.reduce(
                        function(acc, data_point) {
                            var weight = data_point.length > 0 ? data_point[0] : 0;
                            return acc + weight;
                        },
                        0
                    ) / period;
                    $(numbersNode).text('5** RPS: ' + Math.round(res * 1000) / 1000);
                } else {
                    $(numbersNode).text('error');
                }
            },
            'complete': function() {
                window.setTimeout(getNumbers, period * 1000);
            },
            'url': 'http://graphite.hh.ru/render?target=sum(hosts.api*.counts.total.code.5*)&format=json&from=-' +
                    period + 'sec'
        });
    };


    appendSelects();
    setParamsFromLocation();

    document.body.appendChild(graphsNode);


    graphs.forEach(function(item){
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

    var firstImg = document.querySelectorAll('#graphs > img')[1];
    numbersNode.style.height = firstImg.height + 'px';
    numbersNode.style.width = firstImg.width * 3 + 'px';
    numbersNode.style.top = firstImg.offsetTop + 'px';
    numbersNode.style.left = firstImg.offsetLeft + 'px';
    numbersNode.style.fontSize = (firstImg.height / 3) + 'px';
    numbersNode.style.textAlign = 'left';
    numbersNode.innerHTML = 'load ...';
    document.body.appendChild(numbersNode);

    draw();
    getNumbers();
    fromNode.addEventListener('change', draw);
    ymaxNode.addEventListener('change', draw);

    window.setInterval(draw, refreshTimeout);
    window.setTimeout(getNumbers, refreshTimeout);

})();

