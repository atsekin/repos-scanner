import axios from 'axios';

const token = process.env.GITHUB_KEY;

const githubApiClient = axios.create({
  baseURL: 'https://api.github.com',
});

// Добавляем интерсептор запросов
githubApiClient.interceptors.request.use(
  (config) => {
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