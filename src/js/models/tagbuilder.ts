import { StatelessModel, IActionDispatcher, Action, SEDispatcher } from 'kombo';
import { ajax$ } from '../common/ajax';
import { HTTPMethod } from '../common/types';
import * as Immutable from 'immutable';
import { string } from 'prop-types';


export class FilterRecord extends Immutable.Record({name: undefined, value: undefined}) {
    composeString():string {
        return this.get('name') + '=' + this.get('value');
    }

    compare(that:FilterRecord):number {
        return this.composeString < that.composeString ? -1 : 1;
    }
}

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
    allFeatures: Immutable.Map<string, Immutable.List<string>>,
    availableFeatures: Immutable.Map<string, Immutable.List<string>>,
    filterFeaturesHistory: Immutable.List<Immutable.List<FilterRecord>>;
    showCategory: string;
    requestUrl: string;
}

function composePattern(state:UDTagBuilderModelState):string {
    return state.filterFeaturesHistory.last().map(x => x.composeString()).sort().join('|');
}

export class UDTagBuilderModel extends StatelessModel<UDTagBuilderModelState> {

    constructor(dispatcher:IActionDispatcher, initialState:UDTagBuilderModelState) {
        super(dispatcher, initialState);
        this.DEBUG_onActionMatch((state, action, _) => {console.log(action)});
        this.actionMatch = {
            'TAGHELPER_SELECT_CATEGORY': (state, action) => {
                const newState = this.copyState(state);
                newState.showCategory = action.payload['name'];
                return newState;
            },
            'TAGHELPER_GET_INITIAL_FEATURES_DONE': (state, action) => {
                const newState = this.copyState(state);
                newState.isLoaded = true;
                if (!action.error) {
                    newState.allFeatures = Immutable.fromJS(action.payload['result']);
                    newState.availableFeatures = newState.allFeatures;
                    newState.showCategory = newState.allFeatures.keySeq().sort().first()
                } else {
                    newState.error = action.error;
                }
                return newState;
            },
            'TAGHELPER_LOAD_FILTERED_DATA_DONE': (state, action) => {
                const newState = this.copyState(state);
                newState.isLoaded = true;
                if (!action.error) {
                    newState.availableFeatures = Immutable.fromJS(action.payload['result']);
                } else {
                    newState.error = action.error;
                }
                return newState;
            },
            'TAGHELPER_ADD_FILTER': (state, action) => {
                const newState = this.copyState(state);
                const filter = new FilterRecord(action.payload);
                const filterFeatures = newState.filterFeaturesHistory.last();
                if (filterFeatures.every(x => !x.equals(filter))) {
                    const newFilterFeatures = filterFeatures.push(filter);
                    newState.filterFeaturesHistory = newState.filterFeaturesHistory.push(newFilterFeatures);
                    newState.canUndo = true;
                    newState.displayPattern = composePattern(newState);
                }
                return newState;
            },
            'TAGHELPER_REMOVE_FILTER': (state, action) => {
                const newState = this.copyState(state);
                const filter = new FilterRecord(action.payload);
                const filterFeatures = newState.filterFeaturesHistory.last();

                const newFilterFeatures = filterFeatures.filterNot((value) => value.equals(filter));
                newState.filterFeaturesHistory = newState.filterFeaturesHistory.push(Immutable.List(newFilterFeatures))
                newState.canUndo = true;
                newState.displayPattern = composePattern(newState);

                return newState;
            },
            'TAGHELPER_UNDO': (state, action) => {
                const newState = this.copyState(state);
                newState.filterFeaturesHistory = newState.filterFeaturesHistory.delete(-1);
                if (newState.filterFeaturesHistory.size===1) {
                    newState.canUndo = false;
                }
                newState.displayPattern = composePattern(newState);
                return newState;
            },
            'TAGHELPER_RESET': (state, action) => {
                const newState = this.copyState(state);
                newState.filterFeaturesHistory = Immutable.List([Immutable.List([])]);
                newState.availableFeatures = newState.allFeatures;
                newState.canUndo = false;
                newState.displayPattern = composePattern(newState);
                return newState;
            }
        };
    }

    sideEffects(state:UDTagBuilderModelState, action:Action, dispatch:SEDispatcher) {
        switch (action.name) {
            case 'TAGHELPER_GET_INITIAL_FEATURES':
                getFilteredFeatures(state, dispatch, 'TAGHELPER_GET_INITIAL_FEATURES_DONE');
            break;

            case 'TAGHELPER_ADD_FILTER':
            case 'TAGHELPER_REMOVE_FILTER':
            case 'TAGHELPER_UNDO':
                getFilteredFeatures(state, dispatch, 'TAGHELPER_LOAD_FILTERED_DATA_DONE');
            break;
        }
    }

}

function getFilteredFeatures(state:UDTagBuilderModelState, dispatch:SEDispatcher, actionDone: string) {
    const query = state.filterFeaturesHistory.last().map(x => x.composeString()).join('&');
        ajax$(
            HTTPMethod.GET,
            query ? state.requestUrl + '?' + query : state.requestUrl,
            {}
        ).subscribe(
            (result) => {
                dispatch({
                    name: actionDone,
                    payload: {result: result}
                });
            },
            (error) => {
                dispatch({
                    name: actionDone,
                    error: error
                });
            }
        )
}
