var path = require('path');
var argv = require('yargs').argv;
var webpack = require('webpack');
var extendify = require('extendify');
var colog = require('colog');
var util = require('util');
var _ = require('lodash');

var defaultOptions = {
    profiles: '',
    profilesFilename: 'profiles.js',
    returnProfiles: false,
    extend: {
        isDeep: true,
        arrays: 'concat'
    }
};

module.exports = function (webpackConfig, options) {

    _.merge(defaultOptions, options);

    var cmdOptions = {
        profiles: argv.profiles,
        profilesFilename: argv.profilesFilename
    };

    _.merge(defaultOptions, cmdOptions);

    var profiles = require(path.join(path.dirname(module.parent.filename), defaultOptions.profilesFilename));

    var profilesNames = [];

    // if profiles are not undefined split them, else check if default profile exists
    if (defaultOptions.profiles) {
        profilesNames = defaultOptions.profiles.split(/[\s,]+/);
    } else {
        Object.keys(profiles).forEach(function (profileName) {
            if (profiles[profileName].activeByDefault) {
                profilesNames.push(profileName);
            }
        });

        if(profilesNames.length) {
            colog.info(util.format('No profiles specified, using default %s', profilesNames.join(', ')));
        }
    }

    profilesNames.forEach(function (profileName) {
        var profile = null;
        if (profileName in profiles) {
            profile = profiles[profileName];
        } else {
            throw util.format('Profile %s not found, aborting.', profile);
        }

        colog.info(util.format('Applying profile %s', profileName))  ;

        if (profile.vars) {
            var define = new webpack.DefinePlugin(profile.vars);
            if (webpackConfig.plugins) {
                webpackConfig.plugins.unshift(define);
            } else {
                webpackConfig.plugins = [
                    define
                ];
            }
        }

        extendify(
            _.assign(defaultOptions.extend, {inPlace: true})
        )(webpackConfig, profile.config);
    });

    if(defaultOptions.returnProfiles) {
        return {
            config: webpackConfig,
            profiles: _.pick(profiles, profilesNames)
        };
    }

    return webpackConfig;
};