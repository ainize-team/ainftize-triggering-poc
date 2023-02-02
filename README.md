# ainftize-triggering-poc

## Prerequisite
```
$ yarn install
```

## Test
```
$ node docker/index.js 
```

## Dockerization
```
docker build -t {owner}/ainftize-triggering-poc .
...
docker run -it -p 6688:80 {owner}/ainftize-triggering-poc 
```
