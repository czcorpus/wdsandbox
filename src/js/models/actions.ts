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
import { Action } from 'kombo';

// ----------------------------------------------------------
// ------------- CORE ACTIONS (do not change) ---------------
// ----------------------------------------------------------

export enum CoreActionName {
    SetScreenMode = 'MAIN_SET_SCREEN_MODE'
}

export namespace CoreActions {

    export interface SetScreenMode extends Action<{
        isMobile:boolean;
        innerWidth:number;
        innerHeight:number;

    }> {
        name: CoreActionName.SetScreenMode;
    }
}


// ------------------------------------------------------------
// ---------------- SANDBOX ACTIONS (modify as you like) ------
// ------------------------------------------------------------


export enum ActionName {
    ClickFooButton = 'SANDBOX_CLICK_FOO_BUTTON',
    ClickDoubleValueButton = 'SANDBOX_CLICK_FOO2_BUTTON',
    DoubleOperationDone = 'SANDBOX_DOUBLE_OPERATION_DONE'
}


export namespace Actions {

    export interface ClickFooButton extends Action<{
    }> {
        name:ActionName.ClickFooButton;
    }

    export interface ClickDoubleValueButton extends Action<{
    }> {
        name:ActionName.ClickDoubleValueButton;
    }

    export interface DoubleOperationDone extends Action<{
        result:number;
    }> {
        name:ActionName.DoubleOperationDone;
    }

}
