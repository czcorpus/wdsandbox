/*
 * Copyright 2018 Tomas Machalek <tomas.machalek@gmail.com>
 * Copyright 2018 Institute of the Czech National Corpus,
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
import * as Immutable from 'immutable';
import { ViewUtils } from 'kombo';
import * as React from 'react';
import { resolve as urlResolve } from 'url';

import { AvailableLanguage } from '../common/hostPage';
import { GlobalComponents } from './global';
import { SandboxRootComponentProps } from './sandbox';
import { SandboxConf } from '../conf';



export interface LayoutProps {
    sandboxConf:SandboxConf;
    uiLanguages:Immutable.List<AvailableLanguage>;
    uiLang:string;
    returnUrl:string;
    RootComponent:React.ComponentType<SandboxRootComponentProps>;
    isMobile:boolean;
}


export function init(ut:ViewUtils<GlobalComponents>):React.SFC<LayoutProps> {

    const Layout:React.SFC<LayoutProps> = (props) => {

        const createScriptStr = () => {
            return `indexPage.initClient(document.querySelector('.sandbox-mount'), ${JSON.stringify(props.sandboxConf)});`
        };

        return (
            <html lang={props.uiLang}>
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>{ut.translate('global__sandbox_title')}</title>
                    <link href={`${urlResolve(props.sandboxConf.hostUrl, 'dist/common.css')}`} rel="stylesheet" type="text/css" />
                </head>
                <body>
                    <header className="sandbox-header">
                        <a href={props.sandboxConf.hostUrl} title={ut.translate('global__sandbox_title')}>
                            TypeScript + React Sandbox
                        </a>
                    </header>
                    <section className="sandbox-mount">
                        {props.RootComponent ?
                            <props.RootComponent isMobile={props.isMobile} /> : null}
                    </section>
                    <script type="text/javascript" src={`${urlResolve(props.sandboxConf.hostUrl, 'dist/common.js')}`}></script>
                    <script type="text/javascript" src={`${urlResolve(props.sandboxConf.hostUrl, 'dist/index.js')}`}></script>
                    <script type="text/javascript" dangerouslySetInnerHTML={{__html: createScriptStr()}} />
                </body>
            </html>
        );
    }

    return Layout;
}
