import axios from 'axios';

const githubApiClient = axios.create({
  baseURL: 'https://api.github.com',
});

export default githubApiClient;