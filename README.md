# dion

Simple wrapper around a [file-server](https://www.npmjs.com/package/file-server), with an API to make working with [sea-lion](https://www.npmjs.com/package/sea-lion) easier.


## Example

```js
var SeaLion = require('sea-lion'),
    seaLion = new SeaLion(),
    Dion = require('dion'),
    dion = new Dion(seaLion);

seaLion.add({
    '/robots':  {
        GET: dion.serveFile('./robots.txt', 'text/plain')
    },
    '/images/`imageFile...`': {
        GET: dion.serveDirectory('./images', {
            '.gif': 'image/gif',
            '.png': 'image/png',
            '.jpg': 'image/jpeg'
        })
    }
});

// Starts serve with routes defined above:
require('http').createServer(seaLion.createHandler()).listen(8080);
```


### `new Dion(seaLion)`

The Dion constructor takes 1 arguments `seaLion` that must be an instance of [sea-lion](https://www.npmjs.com/package/sea-lion) (or at least quack like one...)

### `dion.serveFile(fileName, mimeType, [maxAge])`

The `serveFile` method takes 3 arguments `fileName`, `mimeType` and an optional `maxAge`.

`fileName` is the name of the file to serve.

`mimeType` is a string, defining which mime type should be used.

`maxAge` will defaults to 0 (rely on ETags)

This will return a function that takes a `request` and a `response` and will stream the file to the response, or in the case of an error, call the corresponding error handlers on seaLion.

```js
var serveRobots = dion.serveFile('./robots.txt', 'text/plain');

serveRobots(request, response);
```

### `dion.serveDirectory(rootDirectory, mimeTypes, [maxAge])`

The `serveDirectory` method takes 3 arguments `rootDirectory`, `mimeTypes` and an optional `maxAge`.

`rootDirectory` is the base directory to serve files from. If a file above this directory is asked for it will call the 404 handler on seaLion.

`mimeTypes` is an object keyed by extension, defining which mime type should be used for the extension. If a file is asked for with an extension that is not defined  it will call the 404 handler on seaLion.

`maxAge` will defaults to 0 (rely on ETags)

This will return a function that takes a `request`, `response` and a `tokens` object. The filename in the last key on the `tokens` object will be streamed to the response, or in the case of an error, call the corresponding error handlers on seaLion.

```js
var serveImagesDirectory = dion.serveDirectory('./images', {
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
});

serveImagesDirectory(request, response, {
    foo: 'bar',
    fileName: '/kittens.jpg'
});
```
