## About

"GitHub Scanner" system in TypeScript

This GraphQL API provides two main queries for interacting with repository data:

repos: Fetches a list of repositories.

repoDetails: Fetches detailed information about a specific repository.

## How to use

Dev mode (localhost:3000):
### `npm install`
### `npm run dev`

Production mode (localhost:8081)
### `npm install`
### `npm run build`
### `npm run start`

## Running Queries

### Client

You can view repos list at root page of app.

To see repo details, click "View details" button

To reach endpoints directly please refer to docs below

### GraphQL Endpoint

The API is available at: `http://localhost:4000/graphql`


## Queries

- ### repos
    This query returns a list of repositories for the authenticated user.

    ### Query
    ```
    query GetRepos {
        repos {
            name
            size
            owner
        }
    }
    ```
    ### Response
    The response contains the following fields for each repository:

    `name (String!)`: The name of the repository.

    `size (Int!)`: The size of the repository in kilobytes.

    `owner (String!)`: The username of the repository owner.

- ### repoDetails

    This query returns detailed information about a specific repository.

    ### Query
    ```
    query GetRepoDetails($repoName: String!) {
        repoDetails(repoName: $repoName) {
            name
            size
            owner
            isPrivate
            filesCount
            ymlContent
            webHooks {
                id
                name
                active
                config {
                    url
                    contentType
                }
            }
        }
    }
    ```

    ### Arguments
    `repoName (String!)`: The name of the repository to fetch details for.

    ### Response
    The response contains the following fields:

    - `name (String!)`: The name of the repository.

    - `size (Int!)`: The size of the repository in kilobytes.

    - `owner (String!)`: The username of the repository owner.

    - `isPrivate (Boolean!)`: Indicates whether the repository is private.

    - `filesCount (Int!)`: The total number of files in the repository.

    - `ymlContent (String)`: The content of the first .yml file found in the repository, decoded from base64.

    - `webHooks ([WebHook!]!)`: A list of active webhooks for the repository.

        - `id (ID!)`: The ID of the webhook.
    
        - `name (String)`: The name of the webhook.

        - `active (Boolean)`: Indicates whether the webhook is active.

        - `config (WebHookConfig)`: Configuration details of the webhook.

            - `url (String)`: The URL the webhook points to.

            - `contentType (String)`: The content type of the webhook payload.


    
