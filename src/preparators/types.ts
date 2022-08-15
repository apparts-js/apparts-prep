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

export type BodyObj = Obj<any, Required>;
export type ParamsObj = Obj<any, Required>;
export type QueryObj = Obj<any, Required>;
export type ReturnsArray = Schema<any, Required>[];

export type OptionsType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj,
  ReturnTypes extends ReturnsArray
> = {
  title: string;
  description?: string;
  receives: AssertionsType<BodyType, ParamsType, QueryType>;
  returns: ReturnTypes;
  auth?: string;
  strap?: boolean;
};

export type RequestType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj
> = {
  body: InferType<BodyType>;
  params: InferType<ParamsType>;
  query: InferType<QueryType>;
} & Omit<ExpressRequest, "body" | "params" | "query">;

export type ResponseType = ExpressResponse;

export type NextFnType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj,
  ReturnTypes extends ReturnsArray
> = (
  req: RequestType<BodyType, ParamsType, QueryType>,
  res: ResponseType
) => Promise<OneOfReturnTypes<ReturnTypes>>;

export type NextFnWithAuthType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj,
  ReturnTypes extends ReturnsArray,
  AuthElemt
> = (
  req: RequestType<BodyType, ParamsType, QueryType>,
  me: AuthElemt,
  res: ResponseType
) => Promise<OneOfReturnTypes<ReturnTypes>>;

export type AssertionsType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj
> = {
  body?: BodyType;
  params?: ParamsType;
  query?: QueryType;
};
