export const typeDefs = `
  type Repository {
    name: String!
    size: Int!
    owner: String!
  }

  type RepositoryDetails {
    name: String!
    size: Int!
    owner: String!
    isPrivate: Boolean!
    filesCount: Int!
    ymlContent: String
    webHooks: [WebHook!]!
  }

  type WebHook {
    id: ID!
    name: String
    active: Boolean
    config: WebHookConfig
  }

  type WebHookConfig {
    url: String
    contentType: String
  }

  type Query {
    repos: [Repository!]!
    repoDetails(repoName: String!): RepositoryDetails
  }
`;