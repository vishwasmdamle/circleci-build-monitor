import React from 'react';
import ReactDOM from 'react-dom';
import BuildStatus from './BuildStatus';

export default class RepositoryCard extends React.Component {

  constructor() {
    super();
    this.getBranches = this.getBranches.bind(this);
  }

  getBranches() {
    return this.props.repoData.branches.map((branchData, index) => {
      return <BuildStatus key={index} buildData={branchData} />;
    })
  }

  render() {
    return (
      <div className="repo-container">
        <div className="repo-name">{this.props.repoData.repoName}</div>
        <div className="branches-section">
          {this.getBranches()}
        </div>
      </div>
    );
  }
}