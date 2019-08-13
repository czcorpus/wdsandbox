import * as React from 'react';
import { IActionDispatcher, ViewUtils } from 'kombo';
import { GlobalComponents } from './global';
import { FilterRecord, UDTagBuilderModel } from '../models/tagbuilder';
import * as Immutable from 'immutable';

export interface FeatureSelectProps {
    error:Error|null;
    isLoaded:boolean;
    allFeatures:Immutable.Map<string, Immutable.List<string>>;
    availableFeatures:Immutable.Map<string, Immutable.List<string>>;
    filterFeatures:Immutable.List<FilterRecord>;
    showCategory:string;
}

export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>):React.ComponentClass<FeatureSelectProps> {
  
    const CategoryDetail:React.FunctionComponent<{
        allValues:Immutable.List<string>;
        availableValues:Immutable.List<string>;
        onChangeHandler:(event) => void;
        categoryName:string;
        filterFeatures:Immutable.List<FilterRecord>;
    }> = (props) => {
        const checkboxes = props.allValues.sort().map(
            (value) => <li key={value}>
                <label style={props.availableValues.includes(value) ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}>
                    <input
                        onChange={props.onChangeHandler}
                        type='checkbox'
                        name={props.categoryName}
                        value={value}
                        checked={props.filterFeatures.some(x => (x.get('name')===props.categoryName && x.get('value')===value) ? true : false)} />
                    {value}
                </label>
            </li>
        );
        return <ul>{checkboxes}</ul>;
    }

    const CategorySelect:React.FunctionComponent<{
        selectedCategory:string;
        allFeatures:Immutable.Map<string, Immutable.List<string>>;
        availableFeatures:Immutable.Map<string, Immutable.List<string>>;
        onSelectCategoryHandler:(event) => void;
    }> = (props) => {
        const categories = props.allFeatures.keySeq().sort().map(function(category) {
            const availableValuesCount = (props.availableFeatures.has(category) ? props.availableFeatures.get(category).size : 0);
            return <button
                    key={category}
                    name={category}
                    onClick={props.onSelectCategoryHandler}
                    className={'util-button'}
                    style={props.selectedCategory===category ? {backgroundColor: 'yellow'} : {backgroundColor: null}}>
                {category + " (" + availableValuesCount + ")"}
                </button>
        })
        return <div>{categories}</div>;
    }

    const QueryLine:React.FunctionComponent<{
        filterFeatures:Immutable.List<FilterRecord>;
        handleRemoveFilter:(event) => void;
    }> = (props) => {
        const selected = props.filterFeatures.sort((a, b) => a.compare(b)).map( filter => {
            <button
                key={filter.composeString()}
                name={filter.get('name')}
                value={filter.get('value')}
                className={'util-button'}
                onClick={props.handleRemoveFilter}>
            {filter}
            </button>
        })
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
                        <div style={{display: "flex", alignItems: "flex-start"}}>
                            <div style={{whiteSpace: "nowrap", padding: "1em", margin: "0 2em", borderStyle: "solid"}}>
                                <p>POS tag:</p>
                                <CategoryDetail
                                    onChangeHandler={(event) => this.handleCheckboxChange(event)}
                                    filterFeatures={this.props.filterFeatures}
                                    categoryName="POS"
                                    allValues={this.props.allFeatures.get("POS")}
                                    availableValues={
                                        this.props.availableFeatures.has("POS") ?
                                        this.props.availableFeatures.get("POS") :
                                        Immutable.List([])
                                    } />
                            </div>
                            <div>
                                <CategorySelect
                                    allFeatures={this.props.allFeatures.delete("POS")}
                                    availableFeatures={this.props.availableFeatures}
                                    onSelectCategoryHandler={this.handleCategorySelect}
                                    selectedCategory={this.props.showCategory} />
                                <CategoryDetail
                                    onChangeHandler={(event) => this.handleCheckboxChange(event)}
                                    filterFeatures={this.props.filterFeatures}
                                    categoryName={this.props.showCategory}
                                    allValues={this.props.allFeatures.get(this.props.showCategory)}
                                    availableValues={
                                        this.props.availableFeatures.has(this.props.showCategory) ?
                                        this.props.availableFeatures.get(this.props.showCategory) :
                                        Immutable.List([])
                                    } />
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    return FeatureSelect;
}
