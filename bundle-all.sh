mkdir bundled
npm install react react-dom babel-cli
browserify src/components/* -o bundled/application.bundle.js -t [ babelify --presets es2015 --plugins transform-react-jsx ]