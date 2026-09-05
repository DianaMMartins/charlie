const fs = require("fs");
const archiver = require("archiver");

const output = fs.createWriteStream("game.zip");

const archive = archiver("zip", {
    zlib: { level: 9 }
});

output.on("close", () => {
    const size = fs.statSync("game.zip").size;
    const limit = 13312;

    console.log(`ZIP size: ${size} bytes / ${limit} bytes`);

    if (size > limit) {
        console.error(`OVER LIMIT by ${size - limit} bytes`);
        process.exit(1);
    }

    console.log(`UNDER LIMIT by ${limit - size} bytes`);
});

archive.on("error", err => {
    throw err;
});

archive.pipe(output);
archive.directory("dist/", false);
archive.finalize();