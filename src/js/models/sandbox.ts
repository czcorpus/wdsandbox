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

import { StatelessModel, Action, SEDispatcher } from 'kombo';
import { ActionName, Actions, CoreActionName, CoreActions } from './actions';


export interface MyModelState {
    isBusy:boolean;
    numOfClicks:number;
    screenMode:{width:number; height:number; isMobile:boolean}|null;
}

export class MyModel extends StatelessModel<MyModelState> {


    constructor(dispatcher, initialState:MyModelState)  {
        super(dispatcher, initialState);
        this.actionMatch = {
            [ActionName.ClickFooButton]: (state, action:Actions.ClickFooButton) => {
                const newState = this.copyState(state);
                newState.numOfClicks += 1;
                return newState;
            },
            [ActionName.ClickDoubleValueButton]: (state, action:Actions.ClickDoubleValueButton) => {
                const newState = this.copyState(state);
                newState.isBusy = true;
                return newState;
            },
            [ActionName.DoubleOperationDone]: (state, action:Actions.DoubleOperationDone) => {
                const newState = this.copyState(state);
                newState.isBusy = false;
                newState.numOfClicks = action.payload.result;
                return newState;
            },
            [CoreActionName.SetScreenMode]: (state, action:CoreActions.SetScreenMode) => {
                const newState = this.copyState(state);
                newState.screenMode = {
                    width: action.payload.innerWidth,
                    height: action.payload.innerHeight,
                    isMobile: action.payload.isMobile
                };
                return newState;
            }
        };
    }



    sideEffects(state:MyModelState, action:Action, dispatch:SEDispatcher):void {
        switch (action.name) {
            case ActionName.ClickDoubleValueButton:
                setTimeout(() => {
                    dispatch<Actions.DoubleOperationDone>({
                        name: ActionName.DoubleOperationDone,
                        payload: {
                            result: state.numOfClicks * 2
                        }
                    });
                }, 2000);
            break;
        }
    }
}