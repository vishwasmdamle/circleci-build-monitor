var ownerUsername;
updateMonitor = function() {
  axios.get('https://circleci.com/api/v1.1/projects')
  .then(response => {
    ownerRepos = getOwnerRepos(response.data)
    displayOwnerRepos(ownerRepos);
  })
  .catch(error => {
    console.log(error);
  });
}

isOwnerInCommitters = function(branchData) {
  return _.contains(branchData['pusher_logins'], ownerUsername) && isRecentlyBuilt(branchData)
}

hasPushedInAnyBranch = function(repoData) {
  return _.any(repoData['branches'], isOwnerInCommitters)
}

isRecentlyBuilt = function(branchData) {
  return branchData['recent_builds'] != undefined
    && branchData['recent_builds'].length > 0
    && new Date(branchData['recent_builds'][0]['pushed_at']).between((10).days().ago(), Date.now())
}

getBranchData = function(branchDataSection, branchName) {
  return {
    branchName: branchName,
    lastExecutedBuild: _.first(branchDataSection['recent_builds']),
    currentlyRunningBuild: getRunningBuilds(branchDataSection)
  }
}

getOwnerRepos = function(data) {
  return _.chain(data)
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

buildBadgePath = function(leftText, rightText, rightColor) {
  escapeSpecialCharacters = function(text) {
    return text.replace(/_/g, '__').replace(/-/g, '--')
  }
  return escapeSpecialCharacters(leftText) + '-' + escapeSpecialCharacters(rightText) + '-' + buildColor + '.svg'
}

createRepoElement = function(ownerRepo) {
  repoElement =  document.createElement("div");
  repoElement.setAttribute("class", "repo-container" );

  repoName =  document.createElement("div");
  repoName.setAttribute("class", "repo-name" );
  repoName.innerText = ownerRepo['repoName']
  repoElement.appendChild(repoName);

  branchesSection =  document.createElement("div");
  branchesSection.setAttribute("class", "branches-section");
  repoElement.appendChild(branchesSection);

  _.each(ownerRepo['branches'], function(branch) {
    isRunning = branch['currentlyRunningBuild'] != undefined;
    wasRed = branch['lastExecutedBuild']!= undefined && branch['lastExecutedBuild']['outcome'] != 'success';
    buildColor = isRunning ? (wasRed ? 'orange' : 'yellow') : (wasRed ? 'ff0000' : '00aa00')
    badgeText = isRunning ? 'Building' : (wasRed ? 'Failed' : 'Passed')

    badge = document.createElement("img")
    badge.setAttribute("class", "badge");
    badge.src = "https://img.shields.io/badge/" + buildBadgePath(branch['branchName'], badgeText, buildColor)
    branchesSection.append(badge)
  })

  return repoElement;
}

startMonitor = function() {
  axios.get('https://circleci.com/api/v1.1/me')
  .then(response => {
    ownerUsername = response.data['login'];
    if (ownerUsername) {
      updateMonitor();
      setInterval(updateMonitor, 10000);
    }
  })
  .catch(error => {
    document.getElementById("error-container").removeAttribute("class");
    console.log(error);
  });
}

startMonitor()

