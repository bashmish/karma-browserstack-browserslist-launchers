# karma-browserstack-browserslist-launchers

Integrates with [karma-browserstack-launcher](https://github.com/karma-runner/karma-browserstack-launcher) and automatically configures karma `browsers` and launchers for them based on your [browserslist](https://github.com/browserslist/browserslist) config.

## Configuration

You need both `karma-browserstack-browserslist-launchers` and `karma-browserstack-launcher` to be installed.

- .browserslistrc (just an example)

  ```
  last 2 Chrome major versions
  last 2 Firefox major versions
  last 2 Safari major versions
  last 2 Edge major versions
  ```

- karma.conf.js

  ```js
  module.exports = (config) => {
    // ...
    
    // add to frameworks
    config.frameworks = ['browserStackBrowserslistLaunchers'];

    // configure karma-browserstack-launcher
    config.browserStack = {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      project: 'my-project',
    };

    // ...
  };
  ```

## Latest browser versions

Your browserslist config is always processed using [browserslist](https://github.com/browserslist/browserslist) NPM package which contains data about versions of different browsers.
To stay up-to-date and have latest versions of everything it is recommended to depend on it directly (`npm install browserslist --save-dev`) and update it from time to time.

Be aware though that BrowserStack itself might not have a certain version of a browser available.

## Processing of capabilities

After matching BrowserStack capabilities with browserslist config there are too many available capabilities, because each browser version might be available on many OS, e.g. Chrome 76 can be tested on Windows 7, 8, 10 and multiple version of macOS.
This is just too much to run and is not needed in the majority of cases.
Therefore by default the capabilities are filtered and each unique browser version will be tested only on one OS.

If you don't like the default strategy you can hook into the process and apply a different filtering like this:

- karma.conf.js

  ```js
  module.exports = (config) => {
    // ...

    config.browserStackBrowserslistLaunchers = {
      processCapabilities: (capabilities) => {
        // you can filter the array here
        return capabilities.filter(/* filter */);
      },
    };

    // ...
  };
  ```
