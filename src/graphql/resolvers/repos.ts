import logger from 'jet-logger';

import githubApiClient from '@src/githubApiClient';
import { Repo } from '@src/types';

export const reposResolver = async (_: unknown, { token }: { token: string }) => {
  try {
    const response = await githubApiClient.get<Repo[]>('/user/repos', { headers: { Authorization: `token ${token}` } });
    return response.data.map(({ name, size, owner: { login } }) => ({
      name,
      size,
      owner: login,
    }));
  } catch (error) {
    logger.err(error);
    throw new Error('Failed to fetch repositories');
  }
};