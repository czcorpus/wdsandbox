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

import * as React from 'react';
import { Observable } from 'rxjs';

import { ScreenProps } from './common/hostPage';
import { IActionDispatcher, ViewUtils } from 'kombo';
import { AppTools } from './appTools';
import { GlobalComponents,  init as globalCompInit  } from './views/global';
import { SandboxRootComponentProps, init as sandboxViewInit } from './views/sandbox';
import { MyModel } from './models/sandbox';


export interface InitIntArgs {
    appTools:AppTools;
    dispatcher:IActionDispatcher;
    onResize:Observable<ScreenProps>;
    viewUtils:ViewUtils<GlobalComponents>;
}


export function createRootComponent({dispatcher, onResize, viewUtils}:InitIntArgs):React.FunctionComponent<SandboxRootComponentProps> {

    const globalComponents = globalCompInit(dispatcher, viewUtils, onResize);
    viewUtils.attachComponents(globalComponents);

    // ---------------------------------------------------------
    // ------- HERE SANDBOX BEGINS -----------------------------
    // ---------------------------------------------------------

    const myModel = new MyModel(
        dispatcher,
        {
            numOfClicks: 0,
            isBusy: false
        }
    );
    return sandboxViewInit(dispatcher, viewUtils, myModel);
}