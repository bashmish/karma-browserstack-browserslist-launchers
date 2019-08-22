const getCapabilities = require('@xerox/browserslist-browserstack').default;
const browserslist = require('browserslist');

async function run() {
  const username = process.argv[2];
  const accessKey = process.argv[3];
  const browsers = browserslist();
  const capabilities = await getCapabilities({
    username,
    accessKey,
    browserslist: { queries: browsers },
  });
  capabilities.forEach((c) => console.log(JSON.stringify(c)));
}

run().then(() => process.exit());
