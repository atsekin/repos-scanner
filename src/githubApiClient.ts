import axios from 'axios';

const githubApiClient = axios.create({
  baseURL: 'https://api.github.com',
});

// Добавляем интерсептор запросов
githubApiClient.interceptors.request.use(
  (config) => {
    const token = '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';
    if (token) {
      config.headers.Authorization = `token ${token}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  },
);

export default githubApiClient;