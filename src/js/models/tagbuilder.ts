import { StatelessModel, IActionDispatcher, Action, SEDispatcher } from 'kombo';
import { ajax$ } from '../common/ajax';
import { HTTPMethod } from '../common/types';



export interface UDTagBuilderModelState {

    // where in the current CQL query the resulting
    // expression will by inserteds
    insertRange:[number, number];

    canUndo:boolean;

    // a string-exported variant of the current UD props selection
    displayPattern:string;


    // ...
}


export class UDTagBuilderModel extends StatelessModel<UDTagBuilderModelState> {

    constructor(dispatcher:IActionDispatcher, initialState:UDTagBuilderModelState) {
        super(dispatcher, initialState);

        this.actionMatch = {
            'TAGHELPER_PRESET_PATTERN': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;

            },
            'TAGHELPER_GET_INITIAL_DATA': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                console.log('get initial data');
                return newState;
            },
            'TAGHELPER_GET_INITIAL_DATA_DONE': (state, action) => {
                const newState = this.copyState(state);
                action.payload['data']
                // TODO
                return newState;
            },
            // 'TAGHELPER_CHECKBOX_CHANGED': probably not applicable
            'TAGHELPER_ATTR_VALUE_SELECTED': (state, action) => { // <-- just a suggestion
                const newState = this.copyState(state);
                // TODO
                return newState;
            },
            'TAGHELPER_LOAD_FILTERED_DATA_DONE': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;
            },
            'TAGHELPER_UNDO': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;
            },
            'TAGHELPER_RESET': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;
            }
        };
    }

    sideEffects(state:UDTagBuilderModelState, action:Action, dispatch:SEDispatcher) {
        switch (action.name) {
            case 'TAGHELPER_GET_INITIAL_DATA':
                ajax$(
                    HTTPMethod.GET,
                    '/ajax_get_tag_variants',
                    {}

                ).subscribe(
                    (data) => {
                        dispatch({
                            name: 'TAGHELPER_GET_INITIAL_DATA_DONE',
                            data: data
                        })
                    },
                    (err) => {
                        dispatch({
                            name: 'TAGHELPER_GET_INITIAL_DATA_DONE',
                            error: err
                        })
                    }
                )
            break;
            case 'TAGHELPER_ATTR_VALUE_SELECTED':

            break;
        }
    }

}

