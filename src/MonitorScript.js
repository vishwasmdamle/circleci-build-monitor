axios.get('https://circleci.com/api/v1.1/projects')
.then(response => {
console.log("CSCCM");
})
.catch(error => {
console.log("CSCCM");
console.log(error);
});