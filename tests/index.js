var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    pathToObjectUnderTest ='../';

fraudster.registerAllowables([pathToObjectUnderTest]);

function resetMocks(){
    fraudster.registerMock('file-server', function(){
        this.serveFile = function(){};
        this.serveDirectory = function(){};
    });
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    fraudster.enable();
    var objectUnderTest = require(pathToObjectUnderTest);
    fraudster.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('Dion is a function', function (t) {
    t.plan(1);

    var Dion = getCleanTestObject();

    t.equal(typeof Dion, 'function', 'Dion is a function');
});

test('Dion requires a seaLion', function (t) {
    t.plan(5);

    var Dion = getCleanTestObject();

    t.throws(function(){
        new Dion();
    }, 'Dion throws if no seaLion');

    t.throws(function(){
        new Dion({
            constructor: {
                name: 'SeaLion'
            }
        });
    }, 'Dion throws if no notFound');

    t.throws(function(){
        new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){}
        });
    }, 'Dion throws if no methodNotAllowed');

    t.throws(function(){
        new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){},
            methodNotAllowed: function(){}
        });
    }, 'Dion throws if no error');

    t.ok(new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){},
            methodNotAllowed: function(){},
            error: function(){}
        }
    ), 'Continues if instance of Sealion');
});

test('Dion creates and sets a fileServer', function (t) {
    t.plan(1);

    var testFileServer = {};

    fraudster.registerMock('file-server', function(){
        return testFileServer;
    });

    var Dion = getCleanTestObject(),
        dion = new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){},
            methodNotAllowed: function(){},
            error: function(){}
        });

    t.equal(dion._fileServer, testFileServer, 'Dion created and set a fileServer');
});

test('Dion creates a fileServer with selion error handlers', function (t) {
    t.plan(9);

    var testRequest = {},
        testResponse = {},
        testError = {
            code: 500
        };

    fraudster.registerMock('file-server', function(errorCallback){
        errorCallback(testError, testRequest, testResponse);
        testError.code = 405;
        errorCallback(testError, testRequest, testResponse);
        testError.code = 404;
        errorCallback(testError, testRequest, testResponse);
    });

    var Dion = getCleanTestObject();

    new Dion({
        constructor: {
            name: 'SeaLion'
        },
        notFound: function(request, response, data){
            t.equal(data, testError, 'got data');
            t.equal(request, testRequest, 'got request');
            t.equal(response, testResponse, 'got response');
        },
        methodNotAllowed: function(request, response, data){
            t.equal(data, testError, 'got data');
            t.equal(request, testRequest, 'got request');
            t.equal(response, testResponse, 'got response');
        },
        error: function(request, response, error){
            t.equal(error, testError, 'got error');
            t.equal(request, testRequest, 'got request');
            t.equal(response, testResponse, 'got response');
        }
    });
});

test('Dion serveFile passes straight through', function (t) {
    t.plan(4);

    var testFileName = {},
        testMimeType = {},
        testMaxAge = {},
        testResult = {};

    fraudster.registerMock('file-server', function(){
        this.serveFile = function(fileName, mimeType, maxAge){
            t.equal(fileName, testFileName, 'got fileName');
            t.equal(mimeType, testMimeType, 'got mimeType');
            t.equal(maxAge, testMaxAge, 'got maxAge');
            return testResult;
        };
    });

    var Dion = getCleanTestObject(),
        dion = new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){},
            methodNotAllowed: function(){},
            error: function(){}
        }),
        serveFile = dion.serveFile(testFileName, testMimeType, testMaxAge);

    t.equal(serveFile, testResult, 'got testResult');

});

test('Dion serveDirectory wraps return function', function (t) {
    t.plan(7);

    var testRequest = {},
        testResponse = {},
        testRootDirectory = {},
        testMimeTypes = {},
        testMaxAge = {},
        testTokens = {
            foo: 'bar',
            meh: 'stuff'
        },
        testResult = function(request, response, fileName){
            t.equal(request, testRequest, 'got request');
            t.equal(response, testResponse, 'got response');
            t.equal(fileName, testTokens.meh, 'got fileName');
        };

    fraudster.registerMock('file-server', function(){
        this.serveDirectory = function(rootDirectory, mimeTypes, maxAge){
            t.equal(rootDirectory, testRootDirectory, 'got rootDirectory');
            t.equal(mimeTypes, testMimeTypes, 'got mimeTypes');
            t.equal(maxAge, testMaxAge, 'got maxAge');
            return testResult;
        };
    });

    var Dion = getCleanTestObject(),
        dion = new Dion({
            constructor: {
                name: 'SeaLion'
            },
            notFound: function(){},
            methodNotAllowed: function(){},
            error: function(){}
        }),
        serveDirectory = dion.serveDirectory(testRootDirectory, testMimeTypes, testMaxAge);

    t.notEqual(serveDirectory, testResult, 'testResult is different');

    serveDirectory(testRequest, testResponse, testTokens);
});