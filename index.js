const fs = require('fs');

console.time();
console.log("start");

const locale = 'ru-RU';
const formatter = new Intl.NumberFormat(locale);
const chunkCount = 4;

const readFile = (resolve, reject, err, data) => {
        if(err) throw err;
        resolve(JSON.parse(data))
}

const makeChunk = (arr, chunkSize) => {
        const chunks = []
        while (arr.length) {
                chunks.push(arr.splice(0, chunkSize));
        }
        return chunks;
}


// Run

const citiesPromise = new Promise((resolve, reject) => {
        fs.readFile(
            'cities.json',
            'utf8',
            readFile.bind(undefined, resolve, reject)
        );
});

citiesPromise.then(
    cities => {
            console.log("Cities count: ", formatter.format(cities.length));
            sortSaveBigArray(cities);
            prepareChunkArrayFiles(cities);
            console.timeEnd();
    }
)

const sortSaveBigArray = (cities) => {
        console.time('Big array');
        cities = [...cities].sort((a, b) => a.name.localeCompare(b.name));
        console.timeEnd('Big array');
}

const prepareChunkArrayFiles = (cities) => {
        const citiesCount = cities.length;
        const chunkSize   = Math.ceil(citiesCount / chunkCount);
        const chunks = makeChunk(cities, chunkSize);
        chunks.forEach((chunk, index, array) => {
                fs.writeFile('./chunk'+index+'.json', JSON.stringify(chunk), 'utf8', (err) => {
                        if (err) throw err;
                        console.log(`Chunk ${index} done`);
                });
        });
        console.log(chunks.map(i => i.length))
}


