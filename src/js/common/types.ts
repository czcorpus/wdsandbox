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


export type AnyInterface<T> = {
    [P in keyof T]: T[P];
};

export interface IMultiDict {
    getFirst(key:string):string;
    getList(key:string):Array<string>;
    set(key:string, value:number|boolean|string):void;
    add(key:string, value:any):void;
    replace(key:string, values:Array<string>);
    remove(key:string):void;
    items():Array<[string, string]>;
    has(key:string):boolean;
}

export type ListOfPairs = Array<[string, string|number]>;

export enum HTTPMethod {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    CONNECT = 'CONNECT',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH'
}


export type LocalizedConfMsg = string|{[lang:string]:string};


export type HTTPHeaders = {[key:string]:string};
