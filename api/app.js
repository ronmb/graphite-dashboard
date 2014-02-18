(function(){

    var templates = {
        'semaphore': 'group('+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.green)), "00cc00"), "< 0.3"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.yellow)), "cccc00"), "< 1.0"),'+
            'alias(color(stacked(sum(hosts.api*.counts.{{SOURCE}}.semaphore.red)), "cc0000"), "> 1.0")'+
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
        ')',
        'code': 'sum(hosts.api*.counts.total.code.{{SOURCE}})'
    };

    var fromValues = ['-1h', '-4h', '-12h', '-1d', '-7d'];
    var ymaxValues = ['5', '10', '25', '50', '100', '150', '500'];

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

    var setParamsFromLocation = function(){
        var from = '-1h';
        var yMax = '25';
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
            preloadImage(
                image.node,
                image.url + urlencode({
                    from: fromNode.value,
                    yMax: ymaxNode.value
                })
            );
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

    draw();
    fromNode.addEventListener('change', draw);
    ymaxNode.addEventListener('change', draw);

    window.setInterval(draw, refreshTimeout);

})();

