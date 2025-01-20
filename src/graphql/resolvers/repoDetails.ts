import logger from 'jet-logger';
import Bottleneck from 'bottleneck';

import githubApiClient from '@src/githubApiClient';
import { ContentsFileResponse, Repo, TreeResponse, WebHook } from '@src/types';

const limiter = new Bottleneck({
  maxConcurrent: 2,
});

const getRepoDetails = async (repoName: string) => {
  try {
    const [response, contents, webHooksResponse] = await Promise.all([
      githubApiClient.get<Repo>(`/repos/atsekin/${repoName}`),
      githubApiClient.get<TreeResponse>(
        `/repos/atsekin/${repoName}/git/trees/master?recursive=1`,
      ),
      githubApiClient.get<WebHook[]>(`/repos/atsekin/${repoName}/hooks`),
    ]);

    const { name, size, owner: { login }, private: isPrivate } = response.data;
    const files = contents.data.tree.filter(({ type }) => type === 'blob');
    const filesCount = files.length;

    const ymlFilePath = files.find(({ path }) => path.endsWith('.yml'))?.path;
    let ymlContent = null;

    if (ymlFilePath) {
      const ymlFile = await githubApiClient.get<ContentsFileResponse>(
        `/repos/atsekin/${repoName}/contents/${ymlFilePath}`,
      );
      ymlContent = Buffer.from(
        ymlFile.data.content, 'base64',
      ).toString('utf-8');
    }

    const webHooks = webHooksResponse.data
      .filter(({ active }) => active)
      .map(({ id, name, active, config }) => ({
        id,
        name,
        active,
        config: {
          url: config.url,
          contentType: config.contentType,
        },
      }));

    return {
      name,
      size,
      owner: login,
      isPrivate,
      filesCount,
      ymlContent,
      webHooks,
    };
  } catch (error) {
    logger.err(error);
    throw new Error('Failed to fetch repository details');
  }
};

export const repoDetailsResolver = async (
  _: unknown, { repoName }: { repoName: string },
) => {
  return await limiter.schedule(() => getRepoDetails(repoName));
};
