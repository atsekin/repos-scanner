export interface Repo {
  name: string;
  size: number;
  owner: {
    login: string,
  };
  private: boolean;
}

export interface WebHook {
  id: string;
  name: string | null;
  active: boolean;
  config: {
    url: string,
    content_type: string,
  };
}

export interface TreeNode {
  path: string;
  type: string;
}

export interface TreeResponse {
  tree: TreeNode[];
};

export interface ContentsFileResponse {
  data: {
    content: string,
  };
}