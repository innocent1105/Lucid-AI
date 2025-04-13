module.exports = function (api) {
    api.cache(true); // To cache the Babel config
  
    return {
      presets: ['babel-preset-expo'],
      plugins: ['nativewind/babel'], // Use NativeWind's Babel plugin
    };
  };
  