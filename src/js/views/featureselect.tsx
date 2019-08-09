import * as React from 'react';
import { IActionDispatcher, ViewUtils } from 'kombo';
import { GlobalComponents } from './global';
import { composeFilter, UDTagBuilderModel } from '../models/tagbuilder';
import * as Immutable from 'immutable';

export interface FeatureSelectProps {
    error:Error|null;
    isLoaded:boolean;
    allFeatures:{};
    availableFeatures:{};
    filterFeatures:Immutable.List<string>;
    showCategory:string;
}

export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>):React.ComponentClass<FeatureSelectProps> {
  
    const CategoryDetail:React.FunctionComponent<{
        allValues:Array<string>;
        availableValues:Array<string>;
        onChangeHandler:(event) => void;
        categoryName:string;
        filterFeatures:Immutable.List<string>;
    }> = (props) => {
        let checkboxes = props.allValues.sort().map(
            (value) => <li key={value}>
                <label style={props.availableValues.includes(value) ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                    <input
                        onChange={props.onChangeHandler}
                        type='checkbox'
                        name={props.categoryName}
                        value={value}
                        checked={props.filterFeatures.includes(composeFilter(props.categoryName, value)) ? true : false} />
                    {value}
                </label>
            </li>
        );
        return <ul>{checkboxes}</ul>;
    }

    const CategorySelect:React.FunctionComponent<{
        selectedCategory:string;
        allFeatures:{};
        availableFeatures:{};
        onSelectCategoryHandler:(event) => void;
    }> = (props) => {
        let categories = []
        for (let category of Object.keys(props.allFeatures).sort()) {
            const availableValuesCount = (category in props.availableFeatures ? props.availableFeatures[category].length : 0);
            categories.push(
                <button
                    key={category}
                    name={category}
                    onClick={props.onSelectCategoryHandler}
                    className={'util-button'}
                    style={props.selectedCategory===category ? {backgroundColor: 'yellow'} : {backgroundColor: null}}>
                {category + " (" + availableValuesCount + ")"}
                </button>
            );
        }
        return <div>{categories}</div>;
    }

    const QueryLine:React.FunctionComponent<{
        filterFeatures:Immutable.List<string>;
        handleRemoveFilter:(event) => void;
    }> = (props) => {
        let selected = []
        for (let filter of props.filterFeatures[Symbol.iterator]()) {
            let [name, value] = filter.split("=");
            selected.push(
                <button
                    key={filter}
                    name={name}
                    value={value}
                    className={'util-button'}
                    onClick={props.handleRemoveFilter}>
                {filter}
                </button>
            );
        }
        return <div><p>Remove filter: {selected}</p></div>;
    }

    class FeatureSelect extends React.Component<FeatureSelectProps> {
        handleCheckboxChange(event) {
            if (event.target.checked) {
                dispatcher.dispatch({
                    name: 'TAGHELPER_ADD_FILTER',
                    payload: {name: event.target.name, value: event.target.value}
                });
            } else {
                this.handleRemoveFilter(event);
            }
        }

        handleRemoveFilter(event) {
            dispatcher.dispatch({
                name: 'TAGHELPER_REMOVE_FILTER',
                payload: {name: event.target.name, value: event.target.value}
            });
        };

        handleCategorySelect(event) {
            dispatcher.dispatch({
                name: 'TAGHELPER_ON_SELECT_CATEGORY',
                payload: {name: event.target.name}
            });
        }

        componentDidMount() {
            dispatcher.dispatch({
                name: 'TAGHELPER_GET_INITIAL_FEATURES',
                payload: {}
            });
        }

        render() {
            if (this.props.error) {
                return <div>Error: {this.props.error.message}</div>;
            } else if (!this.props.isLoaded) {
                return <div>Loading...</div>;
            } else {
                return(
                    <div>
                        <QueryLine
                            filterFeatures={this.props.filterFeatures}
                            handleRemoveFilter={this.handleRemoveFilter} />
                        <CategorySelect
                            allFeatures={this.props.allFeatures}
                            availableFeatures={this.props.availableFeatures}
                            onSelectCategoryHandler={this.handleCategorySelect}
                            selectedCategory={this.props.showCategory} />
                        <CategoryDetail
                            onChangeHandler={(event) => this.handleCheckboxChange(event)}
                            filterFeatures={this.props.filterFeatures}
                            categoryName={this.props.showCategory}
                            allValues={this.props.allFeatures[this.props.showCategory]}
                            availableValues={
                                this.props.showCategory in this.props.availableFeatures ?
                                this.props.availableFeatures[this.props.showCategory] :
                                []
                            } />
                    </div>
                );
            }
        }
    }

    return FeatureSelect;
}
