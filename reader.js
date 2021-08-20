const fs = require('fs');
const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

const chunkCount = 4;

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
    Promise.all(promises).then(
        (values) => {
            fs.writeFile(
                'chunkSorted.json',
                JSON.stringify(
                    values.flat(1)
                        .sort((a, b) => a.name.localeCompare(b.name))
                ),
                {encoding: "utf8"},
                (err) => {}
            )
            console.timeEnd()
        }
    )
} else {
    fs.readFile(
        'chunk'+workerData+'.json',
        'utf8',
        (err, d) => {
            if (err) throw err;
            parentPort.postMessage(JSON.parse(d));
        }
    );
}