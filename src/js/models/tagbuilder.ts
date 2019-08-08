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
    error: Error|null;
    isLoaded: boolean;
    allFeatures: {},
    availableFeatures: {},
    filterFeatures: Array<string>;
    showCategories: boolean;
    requestUrl: string;
}

export function composeFilter(name:string, value:string):string {
    return name + "=" + value;
}

export class UDTagBuilderModel extends StatelessModel<UDTagBuilderModelState> {

    constructor(dispatcher:IActionDispatcher, initialState:UDTagBuilderModelState) {
        super(dispatcher, initialState);
        this.DEBUG_onActionMatch((state, action, _) => {console.log(action)});
        this.actionMatch = {
            'TAGHELPER_PRESET_PATTERN': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;

            },
            'TAGHELPER_GET_INITIAL_DATA': (state, action) => {
                const newState = this.copyState(state);
                // TODO
                return newState;
            },
            'TAGHELPER_GET_INITIAL_FEATURES_DONE': (state, action) => {
                const newState = this.copyState(state);
                newState.isLoaded = true;
                if (!action.error) {
                    newState.allFeatures = action.payload['result'];
                    newState.availableFeatures = action.payload['result'];
                } else {
                    newState.error = action.error;                    
                }
                return newState;
            },
            'TAGHELPER_ADD_FILTER': (state, action) => {
                const newState = this.copyState(state);
                const filter = composeFilter(action.payload['name'], action.payload['value']);
                if (!newState.filterFeatures.includes(filter)) {
                    newState.filterFeatures = [...newState.filterFeatures, filter];
                }
                dispatcher.dispatch({
                    name: 'TAGHELPER_GET_FILTERED_FEATURES',
                    payload: {filter: newState.filterFeatures}
                });
                return newState;
            },
            'TAGHELPER_REMOVE_FILTER': (state, action) => {
                const newState = this.copyState(state);
                const filter = composeFilter(action.payload['name'], action.payload['value']);
                if (newState.filterFeatures.includes(filter)) {
                    newState.filterFeatures = newState.filterFeatures.filter((value, index, arr) => (value !== filter))
                }
                dispatcher.dispatch({
                    name: 'TAGHELPER_GET_FILTERED_FEATURES',
                    payload: {filter: newState.filterFeatures}
                });
                return newState;
            },
            'TAGHELPER_LOAD_FILTERED_DATA_DONE': (state, action) => {
                const newState = this.copyState(state);
                newState.isLoaded = true;
                if (!action.error) {
                    newState.availableFeatures = action.payload['result'];
                } else {
                    newState.error = action.error;                    
                }
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
            case 'TAGHELPER_GET_INITIAL_FEATURES':
                fetch(state.requestUrl).then(res => res.json()).then(
                    (result) => {
                        dispatch({
                            name: 'TAGHELPER_GET_INITIAL_FEATURES_DONE',
                            payload: {result: result}
                        });
                    },
                    (error) => {
                        dispatch({
                            name: 'TAGHELPER_GET_INITIAL_FEATURES_DONE',
                            error: error
                        });
                    }
                )
            break;

            case 'TAGHELPER_GET_FILTERED_FEATURES':
                let query = ''
                for (let feature of action.payload['filter']) {
                    if (query) {
                        query += "&" + feature;
                    } else {
                        query = "?" + feature;
                    }
                }
                console.log('Sending request...', action.payload['filter'])
                fetch(state.requestUrl + query).then(res => res.json())
                .then(
                    (result) => {
                        dispatch({
                            name: 'TAGHELPER_LOAD_FILTERED_DATA_DONE',
                            payload: {result: result}
                        });
                    },
                    (error) => {
                        dispatch({
                            name: 'TAGHELPER_LOAD_FILTERED_DATA_DONE',
                            error: error
                        });
                    }
                )
            break;

            case 'TAGHELPER_ATTR_VALUE_SELECTED':
            break;
        }
    }

}

