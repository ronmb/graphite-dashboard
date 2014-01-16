$(function() {

    function updateGraph($parent, templateString, interval, additionalParams) {
        var splitted = templateString.split(/[(),]/);
        var templateName = splitted[0], host = $.trim(splitted[1]), source = $.trim(splitted[2]);
        var template = graphTemplates[templateName];
        var target = template.target.replace(/{{host}}/g, host).replace(/{{source}}/g, source);

        var params = [target, config.basicGraphParams, 'width=' + $parent.width(), 'height=' + $parent.height(),
                      'from=-' + interval, additionalParams];

        if (template.options) {
            params.push(template.options);
        }

        var src = config.graphiteUrl + '/render?target=' + params.join('&');

        if ($parent.children('img').length == 0) {
            $parent.append('<img src=\'' + src + '\'/>');
        } else {
            $parent.find('img').attr('src', src);
        }
    }

    function redrawGraphs(interval, additionalParams) {
        $('#dashboard li[data-template]').each(function() {
            var template = $(this).attr('data-template'),
                zoomTemplate = $(this).attr('data-template-zoom');

            if (!zoomTemplate) {
                updateGraph($(this), template, interval, additionalParams);
            }
        });
    }

    function addCounter(counter, callback) {
        setInterval(function() {
            var counterUrl = config.graphiteUrl + '/render?target=' + counter.target +
                '&format=json&from=-' + counter.period + 'sec';

            $.ajax({
                url: counterUrl,
                success: function(counterData) {
                    var sum = 0;
                    for (var i = 0; i < counterData[0].datapoints.length; i++) {
                        sum += counterData[0].datapoints[i][0];
                    }

                    callback(sum / counter.period);
                }
            });

        }, counter.updateInterval);
    }

    function setCounters(callbacks) {
        for (var c in counters) {
            if (c in callbacks) {
                addCounter(counters[c], callbacks[c]);
            }
        }
    }

    window.redrawGraphs = redrawGraphs;
    window.setCounters = setCounters;
});
