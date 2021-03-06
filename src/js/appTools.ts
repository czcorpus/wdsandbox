/*
 * Copyright 2019 Tomas Machalek <tomas.machalek@gmail.com>
 * Copyright 2019 Institute of the Czech National Corpus,
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
import { Observable, of as rxOf } from 'rxjs';
import { ITranslator } from 'kombo';

/**
 *
 */
export interface AppToolsArgs {
    uiLang:string;
    translator:ITranslator;
    staticUrlCreator:(path:string)=>string;
    actionUrlCreator:(path: string)=>string;
    mobileModeTest:()=>boolean;
}

/**
 *
 */
export class AppTools {

    private readonly translator:ITranslator;

    private readonly uiLang:string;

    private forcedMobileMode:boolean; // for debugging

    private readonly staticUrlCreator:(path:string) => string;

    private readonly actionUrlCreator:(path: string, args?:{[k:string]:string|Array<string>}|Array<[string, string]>) => string;

    private readonly mobileModeTest:()=>boolean;

    constructor({uiLang, translator, staticUrlCreator, actionUrlCreator, mobileModeTest}:AppToolsArgs) {
        this.uiLang = uiLang;
        this.translator = translator;
        this.staticUrlCreator = staticUrlCreator;
        this.actionUrlCreator = actionUrlCreator;
        this.forcedMobileMode = false;
        this.mobileModeTest = mobileModeTest;
    }

    translate(key: string, args?: {[key: string]: string;}): string {
        return this.translator.translate(key, args);
    }

    private importText<T>(label:string|{[lang:string]:T}):string|T {
        if (!label) {
            return '';

        } else if (typeof label === 'string') {
            return this.translate(label);

        } else if (typeof label === 'object' && Object.keys(label).length > 0) {
            for (let k in label) {
                if (k === this.uiLang || k.split('-')[0] === this.uiLang) {
                    return label[k];
                }
            }
            if ('en-US' in label) {
                return label['en-US'];

            } else {
                const k0 = Object.keys(label)[0];
                return `?? (${k0}: ${label[k0]})`;
            }
        }
        return '??';
    }

    importExternalMessage(label:string|{[lang:string]:string}):string {
        return this.importText<string>(label);
    }

    importExternalText(ident:string|{[lang:string]:string|{file:string}}, readResource:(path:string)=>Observable<string>):Observable<string> {
        const ans = this.importText<string|{file:string}>(ident);
        return typeof ans  === 'string' ? rxOf(ans) : readResource(ans.file);
    }

    formatDate(d: Date, timeFormat?: number): string {
        return this.translator.formatDate(d, timeFormat);
    }

    createStaticUrl(path:string):string {
        return this.staticUrlCreator(path);
    }

    createActionUrl(path:string, args?:{[k:string]:string|Array<string>}|Array<[string, string]>):string {
        return this.actionUrlCreator(path, args);
    }

    forceMobileMode():void {
        this.forcedMobileMode = true;
    }

    isMobileMode():boolean {
        return this.mobileModeTest() || this.forcedMobileMode;
    }

    getISO639UILang():string {
        return this.uiLang.split('-')[0];
    }

    getUILang():string {
        return this.uiLang;
    }

    getISODatetime():string {
        const dat = new Date();
        const lzv = (n:number) => n < 10 ? '0' + n : n.toFixed(0);
        const [y, m, d, h, M, s] =
            [dat.getFullYear(), dat.getMonth() + 1, dat.getDate(), dat.getHours(), dat.getMinutes(), dat.getSeconds()].map(lzv);
        return `${y}-${m}-${d}T${h}:${M}:${s}`;
    }
}