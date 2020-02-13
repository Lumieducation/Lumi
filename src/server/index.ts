import http from 'http';

import app from './boot/app';

export default http.createServer(app);
