import { reposResolver } from './repos';
import { repoDetailsResolver } from './repoDetails';

export const resolvers = {
  Query: {
    repos: reposResolver,
    repoDetails: repoDetailsResolver,
  },
};
