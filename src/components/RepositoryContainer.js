import React from 'react';
import ReactDOM from 'react-dom';

class RepositoryContainer extends React.Component {
  render() {
  return (<div> Hell World </div>);
  }
}
ReactDOM.render(
  <RepositoryContainer />,
  document.getElementById('react-root')
);