const fs = require('fs');

console.time()
fs.readFile(
    'cities.json',
    'utf8',
    (err, d) => {
        if (err) throw err;
        fs.writeFile(
            'simpleSorted.json',
            JSON.stringify(JSON.parse(d).sort((a, b) => a.name.localeCompare(b.name))),
            {encoding: "utf8"},
            (err) => {}
        )
        console.timeEnd()
    }
);