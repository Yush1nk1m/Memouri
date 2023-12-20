import { HttpResponse, http } from 'msw';
import apiURL from '../shared/apiConfig';
const userData = {
  id: 'asd',
  password: 'asd123',
};

const tokens = {
  accessToken: 'asf12480124asd',
  refreshToken: 'qfjhlk12498zfs',
};

export const handlers = [
  http.post(`${apiURL}/api/users/login`, (req, res, ctx) => {}),
];
