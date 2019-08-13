import * as React from 'react';
import { IActionDispatcher, ViewUtils, BoundWithProps } from 'kombo';
import { GlobalComponents } from './global';
import { UDTagBuilderModel, UDTagBuilderModelState } from '../models/tagbuilder';
import { KeyCodes } from '../common/types';
import { init as featureSelectInit } from './featureselect';

export interface ViewProps {
    sourceId:string;
    actionPrefix:string;
    range:[number, number];
    onInsert:()=>void;
    onEscKey:()=>void;
}


export function init(dispatcher:IActionDispatcher, ut:ViewUtils<GlobalComponents>, model:UDTagBuilderModel):React.ComponentClass<{}> {

    const FeatureSelect = featureSelectInit(dispatcher, ut);

    // ------------------------------ <TagDisplay /> ----------------------------

    const TagDisplay:React.SFC<{
        onEscKey:()=>void;
        displayPattern:string;
    }> = (props) => {


    const keyEventHandler = (evt:React.KeyboardEvent<{}>) => {
    evt.preventDefault();
    evt.stopPropagation();
    if (typeof props.onEscKey === 'function' && evt.keyCode === KeyCodes.ESC) {
        props.onEscKey();
    }
    };

    return <input type="text" className="tag-display-box" value={props.displayPattern}
            onKeyDown={keyEventHandler} readOnly
            ref={item => item ? item.focus() : null} />;
    }


    // ------------------------------ <InsertButton /> ----------------------------

    const InsertButton:React.SFC<{onClick:(evt:React.MouseEvent<{}>)=>void}> = (props) => {
        return (
            <button className="util-button" type="button"
                    value="insert" onClick={props.onClick}>
                {ut.translate('taghelper__insert_btn')}
            </button>
        );
    }

    // ------------------------------ <UndoButton /> ----------------------------

    const UndoButton:React.SFC<{onClick:(evt:React.MouseEvent<{}>)=>void; enabled:boolean}> = (props) => {
        if (props.enabled) {
            return (
                <button type="button" className="util-button" value="undo"
                        onClick={props.onClick}>
                    {ut.translate('taghelper__undo')}
                </button>
            );

        } else {
            return (
                <span className="util-button disabled">
                    {ut.translate('taghelper__undo')}
                </span>
            );
        }
    };

    // ------------------------------ <ResetButton /> ----------------------------

    const ResetButton:React.SFC<{onClick:(evt:React.MouseEvent<{}>)=>void; enabled:boolean}> = (props) => {
        if (props.enabled) {
            return (
                <button type="button" className="util-button cancel"
                        value="reset" onClick={props.onClick}>
                    {ut.translate('taghelper__reset')}
                </button>
            );

        } else {
            return (
                <span className="util-button disabled">
                    {ut.translate('taghelper__reset')}
                </span>
            );
        }
    };


    // <TagButtons /> --- taken from KonText source code - should not be changed unless it's really required

    const TagButtons:React.SFC<{
            range:[number, number];
            sourceId:string;
            onInsert?:()=>void;
            canUndo:boolean;
            displayPattern:string;
            actionPrefix:string;
        }> = (props) => {

        const buttonClick = (evt) => {
        if (evt.target.value === 'reset') {
            dispatcher.dispatch({
                name: 'TAGHELPER_RESET',
                payload: {}
            });

        } else if (evt.target.value === 'undo') {
            dispatcher.dispatch({
                name: 'TAGHELPER_UNDO',
                payload: {}
            });

        } else if (evt.target.value === 'insert') {
            if (Array.isArray(props.range) && props.range[0] && props.range[1]) {
                const query = `"${props.displayPattern}"`;
                dispatcher.dispatch({
                    name: `${props.actionPrefix}QUERY_INPUT_SET_QUERY`,
                    payload: {
                        sourceId: props.sourceId,
                        query: query,
                        insertRange: [props.range[0], props.range[1]],
                        rawAnchorIdx: null,
                        rawFocusIdx: null
                    }
                });

            } else {
                dispatcher.dispatch({
                    name: props.actionPrefix + 'QUERY_INPUT_APPEND_QUERY',
                    payload: {
                        sourceId: props.sourceId,
                        query: `[${props.displayPattern}]`
                    }
                });
            }
            dispatcher.dispatch({
                name: 'TAGHELPER_RESET',
                payload: {}
            });
            if (typeof props.onInsert === 'function') {
                props.onInsert();
            }
        }
        };

        return (
        <div className="buttons">
            <InsertButton onClick={buttonClick} />
            <UndoButton onClick={buttonClick} enabled={props.canUndo} />
            <ResetButton onClick={buttonClick} enabled={props.canUndo} />
        </div>
        );
    };

    // ----

    class UDTagBuilderWidget extends React.PureComponent<ViewProps & UDTagBuilderModelState> {

        render() {
            return (
                <div className="tag-builder-widget">
                    <h3>UD tag builder</h3>
                    <div className="tag-header">
                        <TagDisplay onEscKey={()=>undefined} displayPattern={this.props.displayPattern} />
                        <TagButtons range={this.props.insertRange} sourceId={this.props.sourceId}
                                onInsert={this.props.onInsert} canUndo={this.props.canUndo}
                                displayPattern={this.props.displayPattern}
                                actionPrefix={this.props.actionPrefix} />
                    </div>
                    <div>
                        <FeatureSelect
                            error={this.props.error}
                            isLoaded={this.props.isLoaded}
                            allFeatures={this.props.allFeatures}
                            availableFeatures={this.props.availableFeatures}
                            filterFeatures={this.props.filterFeaturesHistory.last()}
                            showCategory={this.props.showCategory} />
                    </div>
                </div>
            );
        }
    }


    return BoundWithProps<ViewProps, UDTagBuilderModelState>(UDTagBuilderWidget, model);

}