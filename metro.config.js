const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Platform-specific optimizations
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Web optimizations
config.resolver.alias = {
  'react-native$': 'react-native-web'
};

// Performance optimizations
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
  },
};

// Bundle size optimization
config.resolver.blockList = [
  /node_modules\/.*\/Pods\/.*/,
  /node_modules\/@react-native-community\/cli-platform-ios\/native_modules\.rb/,
  /node_modules\/@react-native-community\/cli-platform-android\/native_modules\.gradle/,
];

module.exports = config;