mkdir bundled
npm install react react-dom babel-cli axios date.js underscore
browserify src/**/* -o bundled/application.bundle.js -t [ babelify --presets es2015 --plugins transform-react-jsx ]
