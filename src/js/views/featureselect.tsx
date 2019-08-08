import * as React from 'react';
import { IActionDispatcher, ViewUtils } from 'kombo';
import { GlobalComponents } from './global';
import { composeFilter, UDTagBuilderModel } from '../models/tagbuilder';

export interface FeatureSelectProps {
  error:Error|null;
  isLoaded:boolean;
  allFeatures:{};
  availableFeatures:{};
  filterFeatures:Array<string>;
  showCategory:string;
}

export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>):React.ComponentClass<FeatureSelectProps> {
  
  class CategoryDetail extends React.Component<{
    allValues:Array<string>;
    availableValues:Array<string>;
    onChangeHandler:(event) => void;
    categoryName:string;
    filterFeatures:Array<string>;
  }> {

    render() {
        let checkboxes = this.props.allValues.sort().map(
            value => <label key={value} style={this.props.availableValues.includes(value) ? {fontWeight: 'bold'} : {fontWeight: 'normal'}}><input
              onChange={this.props.onChangeHandler}
              type='checkbox'
              name={this.props.categoryName}
              value={value}
              checked={this.props.filterFeatures.includes(composeFilter(this.props.categoryName, value)) ? true : false}
            />{value}</label>
        );
        return(
            <div>{checkboxes}</div>
        );
    }
  }

  class CategorySelect extends React.Component<{
    allFeatures:{};
    availableFeatures:{};
    onSelectCategoryHandler:(event) => void;
  }> {

    render() {
      let categories = []
      for (let category of Object.keys(this.props.allFeatures).sort()) {
        const availableValuesCount = (category in this.props.availableFeatures ? this.props.availableFeatures[category].length : 0);
        categories.push(
          <button key={category} name={category} onClick={this.props.onSelectCategoryHandler}>
            {category + " (" + availableValuesCount + ")"}
          </button>
        );
      }
      return(
          <div>{categories}</div>
      );
    }
  }

  class QueryLine extends React.Component<{
    filterFeatures:Array<string>;
    handleRemoveFilter:(event) => void;
  }> {

    render() {
      let selected = []
      for (let filter of this.props.filterFeatures) {
        let [name, value] = filter.split("=");
        selected.push(
          <button key={filter} name={name} value={value} onClick={this.props.handleRemoveFilter}>
            {filter}
          </button>
        );
      }
      return <div><p>Remove filter: {selected}</p></div>;
    }
  }

  class FeatureSelect extends React.Component<FeatureSelectProps>{
    
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
        name: 'TAGHELPER_GET_INITIAL_FEATURES'
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
            handleRemoveFilter={this.handleRemoveFilter}
          />
          <CategorySelect
            allFeatures={this.props.allFeatures}
            availableFeatures={this.props.availableFeatures}
            onSelectCategoryHandler={this.handleCategorySelect}
          />
          <CategoryDetail
            onChangeHandler={(event) => this.handleCheckboxChange(event)}
            filterFeatures={this.props.filterFeatures}
            categoryName={this.props.showCategory}
            allValues={this.props.allFeatures[this.props.showCategory]}
            availableValues={this.props.showCategory in this.props.availableFeatures ? this.props.availableFeatures[this.props.showCategory] : []}
          />
        </div>
        );
      }
    }
  }

  return FeatureSelect;
}