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
import { Express, Request } from 'express';
import { ViewUtils } from 'kombo';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import * as Immutable from 'immutable';
import * as cors from 'cors';

import { AppTools } from '../appTools';
import { encodeArgs } from '../common/ajax';
import { AvailableLanguage } from '../common/hostPage';
import { SandboxConf} from '../conf';
import { GlobalComponents } from '../views/global';
import { init as layoutViewInit, LayoutProps } from '../views/layout';
import { SandboxRootComponentProps } from '../views/sandbox';
import { ServerSideActionDispatcher } from './core';


enum HTTPAction {
    MAIN = '/'
}


interface RenderResultArgs {
    layoutView:React.SFC<LayoutProps>;
    rootView:React.ComponentType<SandboxRootComponentProps>;
    sandboxConf:SandboxConf;
    returnUrl:string;
    isMobile:boolean;
}

function renderResult({layoutView, sandboxConf, returnUrl, rootView, isMobile}:RenderResultArgs):string {
    const appString = renderToString(
        React.createElement<LayoutProps>(
            layoutView,
            {
                sandboxConf: sandboxConf,
                uiLanguages: Immutable.List<AvailableLanguage>(Object.entries(sandboxConf.translations)),
                uiLang: sandboxConf.uiLang,
                returnUrl: returnUrl,
                RootComponent: rootView,
                isMobile: isMobile
            }
        )
    );
    return `<!DOCTYPE html>\n${appString}`;
}

function createHelperServices(conf:SandboxConf):[ViewUtils<GlobalComponents>, AppTools] {
    const viewUtils = new ViewUtils<GlobalComponents>({
        uiLang: conf.uiLang,
        translations: conf.translations,
        staticUrlCreator: (path) => conf.rootUrl + 'assets/' + path,
        actionUrlCreator: (path, args) => conf.hostUrl +
                (path.substr(0, 1) === '/' ? path.substr(1) : path ) +
                (Object.keys(args || {}).length > 0 ? '?' + encodeArgs(args) : '')
    });

    return [
        viewUtils,
        new AppTools({
            uiLang: conf.uiLang,
            translator: viewUtils,
            staticUrlCreator: viewUtils.createStaticUrl,
            actionUrlCreator: viewUtils.createActionUrl,
            mobileModeTest: ()=>false
        })
    ]
}

function mkReturnUrl(req:Request, rootUrl:string):string {
    return rootUrl.replace(/\/$/, '') +
        req.path +
        (req.query && Object.keys(req.query).length > 0 ? '?' + encodeArgs(req.query) : '');
}

function getLangFromCookie(req:Request, cookieName:string, languages:{[code:string]:string}):string {
    const ans = req.cookies[cookieName] || 'en-US';
    if (languages.hasOwnProperty(ans)) {
        return ans;

    } else {
        const srch = Object.keys(languages).find(k => k.split('-')[0] === ans.split('-')[0]);
        return srch ? srch : 'en-US';
    }
}


export const sandboxRouter = (conf:SandboxConf) => (app:Express) => {

    app.options(HTTPAction.MAIN, cors());

    app.get(HTTPAction.MAIN, (req, res, next) => {
        const dispatcher = new ServerSideActionDispatcher();
        const [viewUtils, appTools] = createHelperServices(conf);

        res.send(renderResult({
            sandboxConf: conf,
            layoutView: layoutViewInit(viewUtils),
            returnUrl: mkReturnUrl(req, conf.rootUrl),
            rootView: null, //sandboxViewInit(dispatcher, viewUtils, null),
            isMobile: false, // TODO should we detect the mode on server too
        }));
    });

    /*
    app.post(HTTPAction.SET_UI_LANG, (req, res, next) => {
        res.cookie(services.serverConf.langCookie, req.body.lang, {maxAge: 3600 * 24 * 365});
        res.redirect(req.body.returnUrl);
    });
    */
}