import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Date from 'date.js';
import _ from 'underscore';

class RepositoryContainer extends React.Component {

  constructor() {
    super();
    this.getRepositoryCards = this.getRepositoryCards.bind(this);
    this.state = {
      hasError: false,
      repositories: []
    }
  }

  componentDidMount() {
    this.fetchAndRender();
    // this.clock = setInterval(this.fetchAndRender.bind(this), 5000);
  }

  fetchAndRender() {
    axios.get('https://circleci.com/api/v1.1/projects')
    .then(this.buildRepositoriesData.bind(this))
    .catch((error) => {
      this.setState({hasError: true}) //TODO: "Error: Request failed with status code 401" is for Login error
    });
  }

  getRepositoryCards() {
    return this.state.repositories.map((repositoryData, index) => {
      return (<div key={index}>{repositoryData.repoName}</div>);
    });
  }

  buildRepositoriesData(response) {
    let repositories = _.chain(response.data)
    .filter(hasPushedInAnyBranch)
    .map(getRepoData)
    .value();
    this.setState({repositories: repositories})
  }


  hasPushedInAnyBranch(repoData) {
    return _.any(repoData['branches'], isOwnerInCommitters)
  }

  isOwnerInCommitters(branchData) {
    return _.contains(branchData['pusher_logins'], ownerUsername) && isRecentlyBuilt(branchData)
  }

  isRecentlyBuilt(branchData) {
    return branchData['recent_builds'] != undefined
      && branchData['recent_builds'].length > 0
      && new Date(branchData['recent_builds'][0]['pushed_at']).between((10).days().ago(), Date.now())
  }

  render() {
    let errorMessage;
     if(this.state.hasError) {
        errorMessage = <div id="error-container">
          <h2 className="error">
              Please log in into CircleCI!
          </h2>
      </div>
    }

    return (
      <div>
        {errorMessage}
        <div id="owner-branch-section">
            <h1>Branches I committed in:</h1>
            {this.getRepositoryCards()}
        </div>
      </div>
    );
  }
}
ReactDOM.render(
  <RepositoryContainer />,
  document.getElementById('react-root')
);