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

var hhd = hhd || {};

hhd.init = function(){
    var nodeForWidthCalc = document.createElement('div');
    nodeForWidthCalc.style.height = '5000px';
    document.body.appendChild(nodeForWidthCalc);
    var imgWidth = document.body.clientWidth;
    var imgHeight = document.body.clientHeight;
    document.body.removeChild(nodeForWidthCalc);

    var rows = hhd.options.itemsInRow;
    var cols = hhd.options.itemsInCol;
    var query = window.location.search;

    if (query) {
        query = query.substr(1).split('x');
        rows = query[0];
        cols = query[1];
    }

    if (imgWidth > 500) {
        imgWidth = Math.floor(imgWidth / rows);
    }

    if (imgHeight > 500) {
        imgHeight = Math.floor(imgHeight / cols);
    }

    var container = document.createElement('div');
    container.id = 'graphs';
    document.body.appendChild(container);

    hhd.images = [];

    hhd.graphs.forEach(function(item){
        var image = new Image();
        image.width = imgWidth;
        image.height = imgHeight;
        container.appendChild(image);
        hhd.images.push({
            node: image,
            url: hhd.options.url + '/render?' + urlencode({
                title: item[0],
                target: hhd.__templates[item[1]].replace(/{{SOURCE}}/g, item[2]),
                width: imgWidth,
                height: imgHeight
            }) + urlencode(hhd.renderOptions)
        });
    });
    document.getElementById('period').addEventListener('change', hhd.draw);
    hhd.draw();
    
    window.setInterval(hhd.draw, hhd.options.refreshTimeout);
    
};

hhd.draw = function(){
    hhd.graphs.forEach(function(item, index){
        var image = hhd.images[index];
        preloadImage(image.node, image.url + urlencode({from: document.getElementById('period').value}));
    });
};

window.addEventListener('load', hhd.init);