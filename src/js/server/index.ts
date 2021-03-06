/*
 * Copyright 2019 Tomas Machalek <tomas.machalek@gmail.com>
 * Copyright 2019 Institute of the Czech National Corpus,
 *                Faculty of Arts, Charles University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path="../translations.d.ts" />
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as translations from 'translations';
import * as cors from 'cors';

import { SandboxConf, ServerConf } from '../conf';
import { sandboxRouter } from './routes';

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    'origin': '*',
    'methods': 'GET,POST',
    'allowedHeaders': ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    'credentials': true
}));

const serverConf:ServerConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../conf/server.json'), 'utf8'));
const conf:SandboxConf = {
    translations: translations,
    uiLang: 'en-US',
    rootUrl: '/',
    clientSrcUrl: `http://${serverConf.address}:${serverConf.develServer.port}${serverConf.develServer.urlRootPath}`
};

sandboxRouter(conf)(app);

const server = app.listen(serverConf.port, serverConf.address, () => {
    const addr = server.address();
    console.log(`Sandbox server is running @ ${typeof addr === 'string' ? addr : addr.address + ':' + addr.port}`);
});