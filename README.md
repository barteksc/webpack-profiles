# webpack-profiles
Profiles support for webpack module bundler. It allows you to define multiple configuration profiles in separated file and trigger them e.g. for different build types.

## Installation

`$ npm install webpack-profiles --save-dev`

## Define profiles
Profiles are defined in `profiles.js` file, placed in the root directory of project. Filename can be modified (see [Configuration](#configuration)).

Sample `profiles.js`:

```javascript
var webpack = require('webpack');
module.exports = {
    production: {
        vars: { //section with variables passed to webpack.DefinePlugin
            API_URL: "'http://my.api.com'"
        },
        config: { //section with config merged with main webpack config
            devtool: 'source-map',
            plugins: [
                new webpack.optimize.UglifyJsPlugin()
            ]
        }
    },
    dev: {
        activeByDefault: true, // profile will be triggered if no profiles passed via cmd or options
        vars: {
            API_URL: "'http://localhost:8080'"
        },
        config: {
            devtool: eval
        }
    },
    ...
};
```

## Applying profiles

Profiles are applied by webpack-profiles helper function, i.e. `webpackProfiles(webpackConfigObject, [options])`:

`webpack.config.js`:
```javascript
    
    var webpackProfiles = require('webpack-profiles');

    var config = {
        entry: {
            app: './index.js'
        },
        output: {
            ...
        },
        plugins: [
            ...
        ],
        ...
    };
    
    module.exports = webpackProfiles(config, {profilesFilename: 'name.js'});
```

## Activating profiles
Profiles can be activated in 3 ways:
* passing cmd argument (see [Command line](#command-line))
* providing configuration options (see [Options](#options))
* using `activeByDefault: true` (see [Define profiles](#define-profiles))

## Configuration

### Options
Options can be passed as second argument to webpack-profiles helper function:

```javascript
    defaults: {
        profiles: '', //multiple profiles can be pased as 'profile1,profile2,...'
        profilesFilename: 'profiles.js',
        returnProfiles: false, //see description below
        extend: {
            isDeep: true,
            arrays: 'concat'
        }
    }
```

Webpack configuration is merged using [extendify](https://github.com/bigShai/extendify), additional options can be passed as `extend` (instead of `inPlace`, it's always `true`).

`returnProfiles`: if you set it to `true`, webpack-profiles helper function will return following object:

```javascript
    {
        config: *merged webpack config*,
        profiles: *array with configuration of profiles, that was used in current build*
    }
```

It can be useful when you want to make some custom operations depending on triggered profiles.

### Command line
Some options can be passed as cmd arguments, that way they override values from options object:
* profiles, e.g. `$ webpack --profiles=dev,profile1,profile2`
* profilesFilename, e.g. `$ webpack --profilesFilename=webpack.profiles.js`

Command line argument can be passed in format supported by [yargs](https://github.com/yargs/yargs).


