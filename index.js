const browserslist = require('browserslist');
const os = require('os');
const { spawnSync } = require('child_process');

function processCapabilities(capabilities) {
  // keep only one capability for each unique browser
  return capabilities.filter((c) => (
    c === capabilities.find((c2) => (
      c2.browser === c.browser && c2.browser_version === c.browser_version
    ))
  ));
}

const BrowserstackBrowserslistLaunchers = (config, logger, injector) => {
  const log = logger.create('framework.browserstack-browserslist-launchers');

  function loadCapabilitiesSync(username, accessKey) {
    const result = spawnSync('node', ['load-capabilities-cli.js', username, accessKey], {
      cwd: __dirname,
    });

    const stdout = result.stdout.toString();
    const stderr = result.stderr.toString();

    if (stderr) {
      log.error(stderr);
    }

    if (result.status !== 0) {
      process.exit(result.status);
    }

    const capabilitiesString = `[${stdout.split(os.EOL).filter(Boolean).join(',')}]`;
    return JSON.parse(capabilitiesString);
  }

  config = config || {};
  config.browserStack = config.browserStack || {};
  config.browserStackBrowserslistLaunchers = config.browserStackBrowserslistLaunchers || {};

  if (!config.browserStack.username || !config.browserStack.accessKey) {
    log.error(`Either browserStack.username or browserStack.accessKey (or both) is not defined in your config.`);
    process.exit();
  }

  if (browserslist().length === 0) {
    log.error(`Your browserslist config does not contain any queries.`);
    process.exit();
  }

  if (!config.browserStackBrowserslistLaunchers.processCapabilities) {
    config.browserStackBrowserslistLaunchers.processCapabilities = processCapabilities;
  }

  const allCapabilities = loadCapabilitiesSync(
    config.browserStack.username,
    config.browserStack.accessKey,
  );

  const noChangesMessage = 'No changes will be made to config.browsers.';

  if (allCapabilities.length === 0) {
    log.error(`BrowserStack doesn't look to have capabilities available for your browserslist config. ${noChangesMessage}`);
    return;
  }

  const capabilities = config
    .browserStackBrowserslistLaunchers
    .processCapabilities(allCapabilities);

  if (capabilities.length === 0) {
    log.error(`After processing capabilities there are 0 left. ${noChangesMessage}`);
    return;
  }

  const browsers = [];
  const customLaunchers = {};
  capabilities.forEach((c) => {
    const uniqueName = `${c.browser} ${c.browser_version} (${c.os} ${c.os_version})`;
    browsers.push(uniqueName);
    customLaunchers[uniqueName] = c;
  });

  config.browsers = browsers;

  // instead of setting config.customLaunchers which has no effect at this point
  // we need to create a factory for each custom launcher
  Object.keys(customLaunchers).forEach((name) => {
    const launcher = customLaunchers[name];
    function launcherFactory(injector) {
      return injector.createChild(
        [{ args: ['value', launcher] }],
        ['launcher:BrowserStack'],
      ).get('launcher:BrowserStack');
    }
    launcherFactory.$inject = ['injector'];
    // this is a super hacky way to create a dependency in an existing injector using private API :(
    // TODO: find a non-hacky way (might need a change to karma customLaunchers feature or node-di)
    injector._providers[`launcher:${name}`] = [
      injector.invoke,
      launcherFactory,
      'factory',
    ];
  });
};

BrowserstackBrowserslistLaunchers.$inject = ['config', 'logger', 'injector'];

module.exports = {
  processCapabilities,
  'framework:browserStackBrowserslistLaunchers': ['factory', BrowserstackBrowserslistLaunchers],
};
