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
  showCategory:string; // TODO, toggle categories
}

export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>):React.ComponentClass<FeatureSelectProps> {
  
  class Category extends React.Component<{
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
            <div>
                <button>
                    {this.props.categoryName + " (" + this.props.availableValues.length + ")"}
                </button>
                {checkboxes}
            </div>
        );
    }
  }

  class FeatureSelect extends React.Component<FeatureSelectProps>{
    constructor(props) {
      super(props);
      this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleCheckboxChange(event) {
      if (event.target.checked) {
          dispatcher.dispatch({
            name: 'TAGHELPER_ADD_FILTER',
            payload: {name: event.target.name, value: event.target.value}
          });
      } else {
          dispatcher.dispatch({
            name: 'TAGHELPER_REMOVE_FILTER',
            payload: {name: event.target.name, value: event.target.value}
          });
      }
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
        let categories = []
        for (let category of Object.keys(this.props.allFeatures).sort()) {
            categories.push(<Category
              key={category}
              onChangeHandler={this.handleCheckboxChange}
              filterFeatures={this.props.filterFeatures}
              categoryName={category}
              allValues={this.props.allFeatures[category]}
              availableValues={category in this.props.availableFeatures ? this.props.availableFeatures[category] : []}
            />)
        }
        return <div>{categories}</div>;
      }
    }
  }

  return FeatureSelect;
}
