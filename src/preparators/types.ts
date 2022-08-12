import { Required, Schema, Obj, InferType } from "@apparts/types";
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";

export type OneOfReturnTypes<T extends Schema<any, Required>[]> = {
  [key in keyof T]: T[key] extends Schema<any, Required>
    ? T[key]["__type"]
    : never;
}[number];

export type OptionsType<ReturnTypes> = {
  strap?: boolean;
  title: string;
  description?: string;
  returns: ReturnTypes;
  auth?: string;
};

export type RequestType<
  BodyType extends Obj<any, Required>,
  ParamsType extends Obj<any, Required>,
  QueryType extends Obj<any, Required>
> = {
  body: InferType<BodyType>;
  params: InferType<ParamsType>;
  query: InferType<QueryType>;
};

export type NextFnType<
  BodyType extends Obj<any, Required>,
  ParamsType extends Obj<any, Required>,
  QueryType extends Obj<any, Required>,
  ReturnTypes extends Schema<any, Required>[]
> = (
  req: ExpressRequest & RequestType<BodyType, ParamsType, QueryType>,
  res: ExpressResponse
) => Promise<OneOfReturnTypes<ReturnTypes>>;

export type AssertionsType<
  BodyType extends Obj<any, Required>,
  ParamsType extends Obj<any, Required>,
  QueryType extends Obj<any, Required>
> = {
  body?: BodyType;
  params?: ParamsType;
  query?: QueryType;
};
