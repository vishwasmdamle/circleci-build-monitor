updateMonitor = function() {
  axios.get('https://circleci.com/api/v1.1/projects')
  .then(response => {
    ownerRepos = getOwnerRepos(response)
    displayOwnerRepos(ownerRepos);
  })
  .catch(error => {
    console.log(error);
  });
}

isOwnerInCommitters = function(branchData) {
  return _.contains(branchData['pusher_logins'], 'vishwasmdamle')
}

hasPushedInAnyBranch = function(repoData) {
  return _.any(repoData['branches'], isOwnerInCommitters)
}

getBranchData = function(branchDataSection, branchName) {
  return {
    branchName: branchName,
    lastExecutedBuild: _.first(branchDataSection['recent_builds']),
    currentlyRunningBuild: getRunningBuilds(branchDataSection)
  }
}

getOwnerRepos = function(response) {
  return _.chain(response.data)
  .filter(hasPushedInAnyBranch)
  .map(getRepoData)
  .value()
}

getRepoData = function(repoData) {
  return {
    'repoName': repoData['reponame'],
    'branches': getOwnerBranches(repoData)
  }
}

getOwnerBranches = function(repoData) {
  return _.reject(_.map(repoData['branches'], function(val, key) {
    if (isOwnerInCommitters(val)) {
      return getBranchData(val, key);
    }
  }), _.isUndefined)
}

getRunningBuilds = function(branchDataSection) {
 return _.first(_.filter(branchDataSection['running_builds'], function(buildData) {
    return buildData['status'] == 'running'
  }))
}

displayOwnerRepos = function(ownerRepos) {
  document.getElementById('owner-repos').innerHTML = "";
  _.each(ownerRepos, function(ownerRepo) {
    document.getElementById('owner-repos').appendChild(createRepoElement(ownerRepo))
  })
}

createRepoElement = function(ownerRepo) {
  repoElement =  document.createElement("div");
  repoElement.setAttribute("class", "repo-container" );

  repoName =  document.createElement("h2");
  repoName.setAttribute("class", "repo-name" );
  repoName.innerText = ownerRepo['repoName']
  repoElement.appendChild(repoName);

  branchesSection =  document.createElement("div");
  branchesSection.setAttribute("class", "branches-section");
  repoElement.appendChild(branchesSection);

  _.each(ownerRepo['branches'], function(branch) {
    isRunning = branch['currentlyRunningBuild'] != undefined;
    wasRed = branch['lastExecutedBuild']['outcome'] != 'success';
    buildColor = isRunning ? (wasRed ? 'orange' : 'yellow') : (wasRed ? 'red' : 'brightgreen')
    badgeText = isRunning ? 'Building' : (wasRed ? 'Failed' : 'Passed')

    badge = document.createElement("img")
    badge.setAttribute("class", "badge");
    badge.src = "https://img.shields.io/badge/" + branch['branchName'] + '-' + badgeText + '-' + buildColor + '.svg'
    branchesSection.append(badge)
  })

  return repoElement;
}

updateMonitor();
setInterval(updateMonitor, 5000);
