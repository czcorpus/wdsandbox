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

import { BoundWithProps, IActionDispatcher, ViewUtils } from 'kombo';
import * as React from 'react';

import { ActionName, Actions } from '../models/actions';
import { GlobalComponents } from './global';
import { MyModel, MyModelState } from '../models/sandbox';


export interface SandboxRootComponentProps {
    isMobile:boolean;
}


export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>, model:MyModel) {

    const globalComponents = ut.getComponents();

    // ------------------------------------------------------------
    // my components here
    // ------------------------------------------------------------

    const FooButton:React.SFC<{}> = (props) => {

        const handleClick = () => {
            dispatcher.dispatch<Actions.ClickFooButton>({
                name: ActionName.ClickFooButton,
                payload: {}
            });
        };

        return <button type="button" onClick={handleClick}>Increase</button>
    };

    // ---

    const DoubleValueButton:React.SFC<{}> = (props) => {

        const handleClick = () => {
            dispatcher.dispatch<Actions.ClickDoubleValueButton>({
                name: ActionName.ClickDoubleValueButton,
                payload: {}
            });
        };

        return <button type="button" onClick={handleClick}>Double (async)</button>
    };


    const Widget:React.SFC<{version:string} & MyModelState> = (props) => {

        return (
            <section className="widget1">
                <h2>WIDGET 1</h2>
                <p>
                    <FooButton /> <strong>num of clicks: {props.numOfClicks}</strong>
                </p>
                <p>
                    <DoubleValueButton />
                    {props.isBusy ? ' working...' : null}
                </p>
                <p>
                    {props.screenMode !== null ?
                    <span>{`(last screen change: ${props.screenMode.width} x ${props.screenMode.height})`}</span> :
                    null}
                </p>
                <p>version: {props.version}</p>
            </section>
        );
    }

    const BoundWidget = BoundWithProps<{version:string}, MyModelState>(Widget, model);

    // --------------------------------------------------------------
    // --------------------------------------------------------------
    // --------------------------------------------------------------


    const SandboxRootComponent:React.SFC<SandboxRootComponentProps> = (props) => {
        return (
            <div className="SandboxRootComponent">
                <BoundWidget version="2020-08-07" />
            </div>
        );
    }

    return SandboxRootComponent;
}