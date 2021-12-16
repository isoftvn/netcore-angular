const path = require('path');
const fs = require('fs');
const util = require('util');
// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
console.log('\nRunning post-build tasks');
// our version.json will be in the dist folder
const versionFilePath = path.join(__dirname + '/../dist/assets/appInfo.json');
let mainHash = '';
let mainBundleFile = '';
// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?.js$/;
// read the dist folder files and find the one we're looking for
readDir(path.join(__dirname, '/../dist/'))
  .then(files => {
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));
    if (mainBundleFile) {
      let matchHash = mainBundleFile.match(mainBundleRegexp);
      // if it has a hash in it's name, mark it down
      if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
      }
    }
    console.log(`Replacing hash in file ${versionFilePath}`);

    // replace hash placeholder in our appInfo.json file
    return readFile(versionFilePath, 'utf8')
      .then(mainFileData => {
		let buildDate = new Date();
		let version = '1.'+buildDate.getYear()+buildDate.getMonth()+'.'+buildDate.getDate()+'.'+buildDate.getHours()+buildDate.getMinutes();
        const replacedFile = mainFileData.replace('#{EZP.POST_BUILD_HASH}', mainHash).replace('#{EZP.BuildDate}', buildDate.toLocaleString()).replace('#{EZP.Version}', version);
        return writeFile(versionFilePath, replacedFile);
      });
  }).then(() => {
    // main bundle file not found, dev build?
    if (!mainBundleFile) {
      return;
    }
    console.log(`Replacing hash in file ${mainBundleFile}`);
    // replace hash placeholder in our main.js file so the code knows it's current hash
    const mainFilepath = path.join(__dirname, '/../dist/', mainBundleFile);
    return readFile(mainFilepath, 'utf8')
      .then(mainFileData => {
        const replacedFile = mainFileData.replace('#{EZP.POST_BUILD_HASH}', mainHash);
        return writeFile(mainFilepath, replacedFile);
      });
  }).catch(err => {
    console.log('Error with post build:', err);
  });
