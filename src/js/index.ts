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
/// <reference path="./translations.d.ts" />
import { ActionDispatcher, ViewUtils } from 'kombo';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import * as translations from 'translations';

import { AppTools } from './appTools';
import { encodeArgs } from './common/ajax';
import { GlobalComponents } from './views/global';
import { createRootComponent } from './sandbox';
import { ScreenProps } from './common/hostPage';
import { SandboxConf } from './conf';
import { CoreActions, CoreActionName } from './models/actions';

declare var DocumentTouch;
declare var require:(src:string)=>void;  // webpack
require('../css/index.less');
require('../css/global.less');
require('../css/mobile.less');


export const initClient = (mountElement:HTMLElement, conf:SandboxConf) => {
    const dispatcher = new ActionDispatcher();
    const uiLangSel = conf.uiLang || 'en-US';
    const viewUtils = new ViewUtils<GlobalComponents>({
        uiLang: uiLangSel,
        translations: translations,
        staticUrlCreator: (path) => conf.rootUrl + 'assets/' + path,
        actionUrlCreator: (path, args) => conf.hostUrl +
                (path.substr(0, 1) === '/' ? path.substr(1) : path ) +
                (Object.keys(args || {}).length > 0 ? '?' + encodeArgs(args) : '')
    });
    const appTools = new AppTools({
        uiLang: conf.uiLang,
        translator: viewUtils,
        staticUrlCreator: viewUtils.createStaticUrl,
        actionUrlCreator: viewUtils.createActionUrl,
        mobileModeTest: () => window.matchMedia('screen and (max-width: 480px)').matches
                && (('ontouchstart' in window) || window['DocumentTouch'] && document instanceof DocumentTouch)
    });
    //appTools.forceMobileMode(); // DEBUG

    const windowResize$:Observable<ScreenProps> = fromEvent(window, 'resize')
    .pipe(
        debounceTime(500),
        map(v => ({
            isMobile: appTools.isMobileMode(),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        }))

    );

    const SandboxRootComponent = createRootComponent({
        appTools: appTools,
        dispatcher: dispatcher,
        onResize: windowResize$,
        viewUtils: viewUtils
    });

    windowResize$.subscribe(
        (props) => {
            dispatcher.dispatch<CoreActions.SetScreenMode>({
                name: CoreActionName.SetScreenMode,
                payload: props
            });
        }
    );

    ReactDOM.render(
        React.createElement(
            SandboxRootComponent,
            {
                isMobile: appTools.isMobileMode()
            }
        ),
        mountElement
    );
}