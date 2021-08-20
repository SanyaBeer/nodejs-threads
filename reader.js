const fs = require('fs');
const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

const chunkCount = 4;

const combineChunks = async (promises) => {
    const values = await Promise.all(promises);
    fs.writeFile(
        'chunkSorted.json',
        JSON.stringify(
            values.flat(1)
                .sort((a, b) => a.name.localeCompare(b.name))
        ),
        {encoding: "utf8"},
        (err) => { if (err) throw err; }
    )
}

if (isMainThread) {
    console.time()
    const promises = [];
    for (let i = 0; i < chunkCount; i++) {
        promises.push(
            new Promise(
                (resolve, reject) => {
                    const worker = new Worker(
                        __filename,
                        {
                            workerData: i
                        }
                    )
                    worker.on('message', resolve);
                    worker.on('error', reject);
                    worker.on(
                        'exit',
                        (code) => {
                            if (code !== 0) {
                                reject(new Error(`Exit with code ${code}`))
                            }
                        }
                    );
                }
            )
        )
    }
    combineChunks(promises)
        .then(() => console.timeEnd())
        .catch((e) => console.error(e));
} else {
    console.log('Child thread')
    fs.readFile(
        'chunk'+workerData+'.json',
        'utf8',
        (err, d) => {
            if (err) throw err;
            parentPort.postMessage(JSON.parse(d));
        }
    );
}