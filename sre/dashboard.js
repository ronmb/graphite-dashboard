graphTemplates = {
    'semaphore': {
        target: 'group(' +
            'alias(color(stacked(sum(hosts.{{host}}.counts.{{source}}.code.5*)), "black"), "5xx"),' +
            'alias(color(stacked(sum(hosts.{{host}}.counts.{{source}}.semaphore.green)), "00bf47"), "< 0.3"),' +
            'alias(color(stacked(sum(hosts.{{host}}.counts.{{source}}.semaphore.yellow)), "ffef49"), "< 1.0"),' +
            'alias(color(stacked(sum(hosts.{{host}}.counts.{{source}}.semaphore.red)), "ff510c"), "> 1.0"),' +
            'alias(color(sum(hosts.{{host}}.counts.{{source}}.code.3*), "eaaf00"), "3xx"),' +
            'alias(color(sum(hosts.{{host}}.counts.{{source}}.code.4*), "blue"), "4xx")' +
        ')'
    },

    'stages-frontik-q95': {
        target: 'group(' +
            'threshold(1, "1 sec", "red"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.{prepare,session}.q95)), "002a97"), "prepare + session"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.page.q95)), "c0c0c0"), "page"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.xsl.q95)), "fff200"), "xsl"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.postprocess.q95)), "b90054"), "post")' +
        ')'
    },

    'stages-logic-q95': {
        target: 'group(' +
            'threshold(0.3, "300 msec", "red"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.{prepare,session}.q95)), "002a97"), "prepare + session"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.page.q95)), "c0c0c0"), "page"),' +
            'alias(color(stacked(maxSeries(hosts.{{host}}.stages.{{source}}.postprocess.q95)), "b90054"), "post")' +
        ')'
    },

    'rps_by_host': {
        target: 'group(' +
            'highestCurrent(hosts.{{host}}.counts.total.sum, 1),' +
            'lowestCurrent(hosts.{{host}}.counts.total.sum, 1)' +
        ')'
    },

    'timings_by_host': {
        target: 'group(' + 
            'threshold(0.5, "0.5 sec", "red"),' +
            'highestCurrent(hosts.{{host}}.stages.total.total.avg, 1),' +
            'lowestCurrent(hosts.{{host}}.stages.total.total.avg, 1)' +
        ')'
    }
}

counters = {
    RPS: {
        target: 'sum(hosts.frontik[0-9]*.counts.total.sum*)',
        period: 60,
        updateInterval: 15000
    },
    errors: {
        target: 'sum(hosts.frontik[0-9]*.counts.total.code.5*)',
        period: 60,
        updateInterval: 15000
    }
}
