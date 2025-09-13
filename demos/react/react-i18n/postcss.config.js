module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'iOS >= 9',
        'Android >= 4.4'
      ]
    })
  ]
};
