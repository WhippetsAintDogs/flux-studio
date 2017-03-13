var fs = require('fs'),
    bootstrap = require(process.cwd() + '/_test/api/bootstrap'),
    testCases = [],
    fcodeFile,
    conn;

testCases.push(new bootstrap.TestCase('upload fcode file').
    onStarting(function(deferred, conn) {
        fs.readFile(process.cwd() + '/_test/api/assets/circle-test.fc', function(err, data) {
            fcodeFile = data;
            conn.sendText(['upload', data.length].join(' '));
        });
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'continue':
            conn.sendBinary(fcodeFile);
            break;
        case 'ok':
        case 'progressing':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get image from fcode').
    onStarting(function(deferred, conn) {
        conn.sendText('get_img');
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'progressing':
            deferred.resolve(response);
            break;
        case 'complete':
            // ignore
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get metadata from fcode').
    onStarting(function(deferred, conn) {
        conn.sendText('get_meta');
    }).
    onProgress(function(response, deferred, conn) {
        // progress
        switch (response.status) {
        case 'complete':
            deferred.resolve(response);
            break;
        case 'fatal':
        default:
            bootstrap.err(response);
            break;
        }
    })
);

testCases.push(new bootstrap.TestCase('get path from fcode').
    onStarting(function(deferred, conn) {
        conn.sendText('get_path');
    }).
    onProgress(function(response, deferred, conn) {
        if (response instanceof Array) {
            deferred.resolve(response);
        }
        else {
            bootstrap.err(response);
        }
    })
);

bootstrap.executeTest('fcode reader', 'fcode-reader', testCases);