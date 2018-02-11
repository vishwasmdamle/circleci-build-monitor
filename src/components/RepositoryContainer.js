import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import _ from 'underscore';

import RepositoryCard from './RepositoryCard';
//TODO: Please extract the data crunching logic to separate class for god's sake.

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
    this.setupOwnerUsername.bind(this);
    this.setupOwnerUsername();
    this.fetchAndRender();
    // this.clock = setInterval(this.fetchAndRender.bind(this), 5000);
  }

  setupOwnerUsername() {
    axios.get('https://circleci.com/api/v1.1/me')
    .then(response => {
      this.ownerUsername = response.data['login'];
    })
    .catch((error) => {
      this.setState({hasError: true}) //TODO: "Error: Request failed with status code 401" is for Login error
    });
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
      return (<RepositoryCard key={index} repoData={repositoryData}></RepositoryCard>);
    });
  }

  buildRepositoriesData(response) {
    let repositories = _.chain(response.data)
    .filter(this.hasPushedInAnyBranch.bind(this))
    .map(this.getRepoData.bind(this))
    .value();
    this.setState({repositories: repositories})
  }

  getRepoData(repoData) {
    return {
      'repoName': repoData['reponame'],
      'branches': this.getOwnerBranches.bind(this)(repoData)
    }
  }

  getOwnerBranches(repoData) {
    return _.reject(_.map(repoData['branches'], function(val, key) {
      if (this.isOwnerInCommitters(val)) {
        return this.getBranchData.bind(this)(val, key);
      }
    }.bind(this)), _.isUndefined)
  }

  hasPushedInAnyBranch(repoData) {
    return _.any(repoData['branches'], this.isOwnerInCommitters.bind(this))
  }

  getBranchData(branchDataSection, branchName) {
    return {
      branchName: branchName,
      lastExecutedBuild: _.first(branchDataSection['recent_builds']),
      currentlyRunningBuild: this.getRunningBuilds(branchDataSection)
    }
  }

  getRunningBuilds(branchDataSection) {
    return _.first(_.filter(branchDataSection['running_builds'], function(buildData) {
       return buildData['status'] == 'running'
     }))
   }

  isOwnerInCommitters(branchData) {
    return _.contains(branchData['pusher_logins'], this.ownerUsername) && this.isRecentlyBuilt(branchData)
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