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

import { IActionDispatcher, ViewUtils } from 'kombo';
import * as React from 'react';
import { GlobalComponents } from './global';
import { UDTagBuilderModel } from '../models/tagbuilder';
import { init as tagbuilderViewInit } from '../views/tagbuilder';


export interface SandboxRootComponentProps {
    isMobile:boolean;
}


export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>, model:UDTagBuilderModel) {

    const globalComponents = ut.getComponents();
    // --------------------------------------------------------------
    // --------------------------------------------------------------
    // --------------------------------------------------------------
    const TagBuilderComponent = tagbuilderViewInit(dispatcher, ut, model);


    const SandboxRootComponent:React.SFC<SandboxRootComponentProps> = (props) => {
        return (
            <div className="SandboxRootComponent">
                <TagBuilderComponent />
            </div>
        );
    }

    return SandboxRootComponent;
}