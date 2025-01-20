const loadRepos = () => {
  fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
      query {
        repos {
          name
          size
          owner
        }
      }
    `
    }),
  })
    .then(response => response.json())
    .then(({ data }) => {
      const reposTemplate = document.getElementById('all-repos-template');
      const reposTemplateHtml = reposTemplate.innerHTML;
      const template = Handlebars.compile(reposTemplateHtml);

      const allUsersAnchor = document.getElementById('all-repos-anchor');
      allUsersAnchor.innerHTML = template({
        repos: data.repos,
      });
    })
    .catch(error => console.error('Error:', error));
};

const loadRepoDetails = (repoName) => {
  fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
      query {
        repoDetails(repoName: "${repoName}") {
          name
          size
          owner
          isPrivate
          filesCount
          ymlContent
          webHooks {
            name
          }
        }
      }
    `
    }),
  })
    .then(response => response.json())
    .then(({ data }) => {
      const repoDetailsTemplate = document.getElementById('repo-details-template');
      const repoDetailsTemplateHtml = repoDetailsTemplate.innerHTML;
      const template = Handlebars.compile(repoDetailsTemplateHtml);

      const repoDetailsAnchor = document.getElementById(`repo-details-${repoName}`);
      repoDetailsAnchor.innerHTML = template(data.repoDetails);
    })
    .catch(error => console.error('Error:', error));
}

window.addEventListener('load', loadRepos);