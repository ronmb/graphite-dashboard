var hhd = hhd || {};
hhd.__templates = {
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
    
    'mailing_employer_event_block' : 'group('+
        'alias(color(stacked(sum(hosts.*.mailing.employer.event_mailing.{{SOURCE}}.success)),"00cc00"),"success"),'+
        'alias(color(stacked(sum(hosts.*.mailing.employer.event_mailing.{{SOURCE}}.error)),"cc0000"),"error")' +
    ')'
};
