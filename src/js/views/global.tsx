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
import { ViewUtils, IActionDispatcher } from 'kombo';
import * as React from 'react';
import { Observable } from 'rxjs';

import { ScreenProps } from '../common/hostPage';
import { KeyCodes } from '../common/util';

export interface SourceInfo {
    corp:string;
    subcorp?:string;
}

export type TooltipValues = {[key:string]:number|string}|null;

export interface GlobalComponents {

    AjaxLoader:React.SFC<{
        htmlClass?:string;
    }>;

    ErrorBoundary:React.ComponentClass;

    ModalBox:React.ComponentClass<{
        onCloseClick?:()=>void;
        title:string;
    }>;

    ImageWithMouseover:React.SFC<{
        file:string;
        alt:string;
        file2?:string;
        htmlClass?:string;
    }>;

    ResponsiveWrapper:React.ComponentClass<{
        render:(width:number, height:number)=>React.ReactElement<{width:number, height:number} & {}>;
    }>;

    ElementTooltip:React.SFC<{
        x:number;
        y:number;
        visible:boolean;
        values:TooltipValues;
    }>;
}

export function init(dispatcher:IActionDispatcher, ut:ViewUtils<{}>, resize$:Observable<ScreenProps>):GlobalComponents {

    // --------------- <AjaxLoader /> -------------------------------------------

    const AjaxLoader:GlobalComponents['AjaxLoader'] = (props) => {
        return <img src={ut.createStaticUrl('ajax-loader.gif')}
                    alt={ut.translate('global__alt_loading')}
                    className={props.htmlClass ? `AjaxLoader ${props.htmlClass}` : 'AjaxLoader'} />;
    }


    // --------------- <ErrorBoundary /> -------------------------------------------

    class ErrorBoundary extends React.Component<{}, {error: string}> {

        constructor(props) {
            super(props);
            this.state = {error: null};
        }

        componentDidCatch(error, info) {
            console.error(error);
            this.setState({error: error});
        }

        render() {
            if (this.state.error) {
                return (
                    <div className="cnc-tile-body">
                        <p>
                            <strong style={{color: 'red'}}>
                                {ut.translate('global__failed_to_render_component')}
                            </strong>
                        </p>
                        <div />
                    </div>
                );

            } else {
                return this.props.children;
            }
        }
    }

    // --------------- <ModalBox /> -------------------------------------------

    class ModalBox extends React.PureComponent<{onCloseClick:()=>void; title:string}> {

        private ref:React.RefObject<HTMLButtonElement>;

        constructor(props) {
            super(props);
            this.ref = React.createRef();
            this.handleKey = this.handleKey.bind(this);
        }

        componentDidMount() {
            if (this.ref.current) {
                this.ref.current.focus();
            }
        }

        private handleKey(evt:React.KeyboardEvent) {
            if (evt.keyCode === KeyCodes.ESC) {
                this.props.onCloseClick();
            }
        }

        render() {
            return (
                <div id="modal-overlay">
                    <div className="box cnc-tile">
                        <header className="cnc-tile-header">
                            <span>{this.props.title}</span>
                            <button className="close"
                                    ref={this.ref}
                                    onClick={this.props.onCloseClick}
                                    onKeyDown={this.handleKey}>
                                <img src={ut.createStaticUrl('close-icon.svg')} alt="close icon" />
                            </button>
                        </header>
                        <div className="content cnc-tile-body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            );
        }
    }

    // --------- <ImageWithMouseover /> ---------------------------------------------------------

    const ImageWithMouseover:GlobalComponents['ImageWithMouseover'] = (props) => {

        const [is2ndState, set2ndState] = React.useState(false);

        let file2 = props.file2;
        if (!file2) {
            const items = props.file.split('.');
            file2 = `${items.slice(0, items.length - 1).join('.')}_s.${items[items.length - 1]}`;
        }

        return (
            <img src={ut.createStaticUrl(is2ndState ? file2 : props.file)}
                    onMouseOver={()=>set2ndState(!is2ndState)}
                    onMouseOut={()=>set2ndState(!is2ndState)} />
        );
    };

    // --------- <ResponsiveWrapper /> ----------------------------------------------

    class ResponsiveWrapper extends React.Component<{
            render:(width:number, height:number)=>React.ReactElement<{width: number, height:number} & {}>;
       },
       {
            width:number;
            height:number;
        }> {

        private readonly ref:React.RefObject<HTMLDivElement>;

        constructor(props) {
            super(props);
            this.state = {
                width: 1,
                height: 1,
            };
            this.ref = React.createRef();
            this.handleWindowResize = this.handleWindowResize.bind(this);
            resize$.subscribe(this.handleWindowResize);
        }

        componentDidMount() {
            if (this.ref.current) {
                this.setState({
                    width: this.ref.current.getBoundingClientRect().width,
                    height: this.ref.current.getBoundingClientRect().height
                });
            }
        }

        private handleWindowResize(props:ScreenProps) {
            if (this.ref.current) {
                this.setState({
                    width: this.ref.current.getBoundingClientRect().width,
                    height: this.ref.current.getBoundingClientRect().height
                });
            }
        }

        render() {
            return <div style={{width: '100%', height: '100%'}} ref={this.ref}>{this.props.render(this.state.width, this.state.height)}</div>;
        }

    };


    // -------------------- <ElementTooltip /> ----------------------------------------------


    const ElementTooltip:GlobalComponents['ElementTooltip'] = (props) => {

        const ref = React.useRef(null);

        const calcXPos = () =>
            ref.current ? Math.max(0, props.x - ref.current.getBoundingClientRect().width - 20) : props.x;

        const calcYPos = () =>
            ref.current ? props.y +  10 : props.y;

        const style:React.CSSProperties = {
            display: props.visible ? 'block' : 'none',
            visibility: ref.current ? 'visible' : 'hidden',
            top: calcYPos(),
            left: calcXPos()
        };

        return (
            <div className="sandbox-tooltip" ref={ref} style={style}>
                <table>
                    <tbody>
                        {Object.keys(props.values || {}).map(label => {
                            const v = props.values[label];
                            return (
                                <tr key={label}>
                                <th>{label}:</th>
                                {typeof v === 'number' ?
                                    <td className="num">{ut.formatNumber(v, 1)}</td> :
                                    <td>{v}</td>
                                }
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    // ===================

    return {
        AjaxLoader: AjaxLoader,
        ErrorBoundary: ErrorBoundary,
        ModalBox: ModalBox,
        ImageWithMouseover: ImageWithMouseover,
        ResponsiveWrapper: ResponsiveWrapper,
        ElementTooltip: ElementTooltip
    };
}
