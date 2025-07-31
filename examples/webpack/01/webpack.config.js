module.exports = {
  entry: {
    app: {
      import: './src/app.js',
      dependOn: 'shared',
    },
    main: {
      import: './src/main.js',
      dependOn: 'shared',
    },
    shared: ['lodash']
  },
  mode: 'development'
};
