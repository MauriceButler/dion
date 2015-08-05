var FileServer = require('file-server');

function Dion(seaLion){
    if(!seaLion ||
        seaLion.constructor.name !== 'SeaLion' ||
        typeof seaLion.notFound !== 'function' ||
        typeof seaLion.methodNotAllowed !== 'function' ||
        typeof seaLion.error !== 'function'
    ){
        throw 'Must provide an instance of SeaLion to Dion';
    }

    this._fileServer = new FileServer(function(error, request, response){
        if(error.code === 404){
            return seaLion.notFound(request, response, error);
        }

        if(error.code === 405){
            return seaLion.methodNotAllowed(request, response, error);
        }

        seaLion.error(request, response, error);
    });
}

Dion.prototype.serveDirectory = function(rootDirectory, mimeTypes, maxAge){
    var serveDirectory = this._fileServer.serveDirectory(rootDirectory, mimeTypes, maxAge);

    return function(request, response, tokens){
        var fileName = tokens[Object.keys(tokens).pop()];

        if(typeof fileName !== 'string'){
            throw new Error('Dion was not passed any tokens (serveDirectory must be passed at least one token, such as "/`path...`")');
        }

        serveDirectory(request, response, fileName);
    };
};

Dion.prototype.serveFile = function(fileName, mimeType, maxAge){
    return this._fileServer.serveFile(fileName, mimeType, maxAge);
};


module.exports = Dion;