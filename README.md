# circleci-build-monitor
CircleCI Build Monitor Chrome extension for feature branch based development

Use `bundle-all.sh` for building bundled application JS.

* This plugin expects you to be logged in into CircleCI
* It fetches username of the logged in user from `/api/v1.1/me` API and gets information of all projects from `/api/v1.1/projects` API.
* It filters projects and branches user has committed in and shows the status of branches updated in last 10 days.
* Doesn't look at the builds triggered using tags as of now.
