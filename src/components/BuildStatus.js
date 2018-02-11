import React from 'react';
import ReactDOM from 'react-dom';

export default class BuildStatus extends React.Component {

  escapeSpecialCharacters(text) {
    return text.replace(/_/g, '__').replace(/-/g, '--')
  }

  buildBadgePath(leftText, rightText, rightColor) {
    return this.escapeSpecialCharacters(leftText) + '-' + this.escapeSpecialCharacters(rightText) + '-' + rightColor + '.svg'
  }

  render() {
    let buildData = this.props.buildData;
    let isRunning = buildData['currentlyRunningBuild'] != undefined;
    let wasRed = buildData['lastExecutedBuild']!= undefined && buildData['lastExecutedBuild']['outcome'] != 'success';
    let buildColor = isRunning ? (wasRed ? 'orange' : 'yellow') : (wasRed ? 'ff0000' : '00aa00')
    let badgeText = isRunning ? 'Building' : (wasRed ? 'Failed' : 'Passed')

    let badgeURL = "https://img.shields.io/badge/" + this.buildBadgePath(buildData['branchName'], badgeText, buildColor)
    return (
      <img className="badge" src={badgeURL} />
    );
  }
}