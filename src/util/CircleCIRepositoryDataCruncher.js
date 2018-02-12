import _ from 'underscore';

export class CircleCIRepositoryDataCruncher {

  constructor(ownerUsername) {
    this.ownerUsername = ownerUsername;
  }

  buildRepositoriesData(response) {
    return _.chain(response.data)
    .filter(this.hasPushedInAnyBranch.bind(this))
    .map(this.getRepoData.bind(this))
    .value();
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
}