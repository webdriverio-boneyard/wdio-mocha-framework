WDIO Mocha [![Build Status](https://travis-ci.org/webdriverio/wdio-mocha-framework.svg?branch=master)](https://travis-ci.org/webdriverio/wdio-mocha-framework) [![Code Climate](https://codeclimate.com/github/webdriverio/wdio-mocha-framework/badges/gpa.svg)](https://codeclimate.com/github/webdriverio/wdio-mocha-framework) [![Test Coverage](https://codeclimate.com/github/webdriverio/wdio-mocha-framework/badges/coverage.svg)](https://codeclimate.com/github/webdriverio/wdio-mocha-framework/coverage)
==========

> A WebdriverIO plugin. Adapter for Mocha testing framework.

## Installation

The easiest way is to keep `wdio-mocha-framework` as a devDependency in your `package.json`.

```json
{
  "devDependencies": {
    "wdio-mocha-framework": "~0.1"
  }
}
```

You can simple do it by:

```bash
npm install wdio-mocha-framework --save-dev
```

Instructions on how to install `WebdriverIO` can be found [here.](http://webdriver.io/guide/getstarted/install.html)

## Configuration

Following code shows the default wdio test runner configuration...

```js
// wdio.conf.js
module.exports = {
  // ...
  framework: 'mocha'
  mochaOpts: {
    ui: 'bdd'
  }
  // ...
};
```

## `mochaOpts` Options

Options will be passed to the Mocha instance. See the full list of Mocha options at [http://mochajs.org/](http://mochajs.org/)

----

For more information on WebdriverIO see the [homepage](http://webdriver.io).
