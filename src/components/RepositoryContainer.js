import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import RepositoryCard from './RepositoryCard';
import { CircleCIRepositoryDataCruncher } from '../util/CircleCIRepositoryDataCruncher';

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
    this.recurringInterval = setInterval(this.fetchAndRender.bind(this), 5000);
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
    .then((response) => {
      let repositories = new CircleCIRepositoryDataCruncher(this.ownerUsername).buildRepositoriesData(response);
      this.setState({repositories: repositories});
    })
    .catch((error) => {
      this.setState({hasError: true}) //TODO: "Error: Request failed with status code 401" is for Login error
    });
  }

  getRepositoryCards() {
    return this.state.repositories.map((repositoryData, index) => {
      return (<RepositoryCard key={index} repoData={repositoryData}></RepositoryCard>);
    });
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