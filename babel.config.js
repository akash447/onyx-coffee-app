module.exports = function(api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const isWeb = process.env.EXPO_PLATFORM === 'web';
  
  return {
    presets: [
      'babel-preset-expo',
      ...(isWeb ? [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            browsers: ['last 2 versions', 'ie >= 11']
          }
        }]
      ] : [])
    ],
    plugins: [
      // Platform-specific optimizations
      ...(isProduction ? [
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ] : []),
      
      // Web-specific optimizations
      ...(isWeb ? [
        ['babel-plugin-react-native-web'],
        ['@babel/plugin-transform-runtime', {
          helpers: true,
          regenerator: false,
        }]
      ] : []),
      
      // React Native optimizations
      'react-native-reanimated/plugin'
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          ['babel-plugin-transform-react-remove-prop-types', {
            removeImport: true
          }]
        ]
      }
    }
  };
};