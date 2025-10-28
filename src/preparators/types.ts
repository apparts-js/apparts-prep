import { Required, Schema, Obj, InferType } from "@apparts/types";
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";

export type OneOfReturnTypes<T extends Schema<Required, any>[]> = {
  [key in keyof T]: T[key] extends Schema<Required, any>
    ? T[key]["__type"]
    : never;
}[number];

export type BodyObj = Obj<Required, any>;
export type ParamsObj = Obj<Required, any>;
export type QueryObj = Obj<Required, any>;
export type ReturnsArray = Schema<Required, any>[];
export type AuthResponse = unknown;

export type LogErrorFn = (
  msg: string,
  req: ExpressRequest,
  res: ExpressResponse,
  obj: Record<string, any>
) => void;
export type LogResponseFn = (
  msg: string,
  req: ExpressRequest,
  res: ExpressResponse
) => void;

export type CheckAccessFn<AuthType extends AuthResponse> = {
  (req: ExpressRequest, res: ExpressResponse): Promise<AuthType>;
  description?: string;
  returns?: ReturnsArray;
};

export type OptionsType<
  BodyType extends BodyObj,
  ParamsType extends ParamsObj,
  QueryType extends QueryObj,
  ReturnTypes extends ReturnsArray,
  AuthType extends AuthResponse
> = {
  title: string;
  description?: string;
  receives: AssertionsType<BodyType, ParamsType, QueryType>;
  returns: ReturnTypes;
  auth?: string;
  logError?: LogErrorFn;
  logResponse?: LogResponseFn;
  hasAccess: CheckAccessFn<AuthType>;
  disableChecks?: boolean;
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
  ReturnTypes extends ReturnsArray,
  AuthType extends AuthResponse
> = (
  req: RequestType<BodyType, ParamsType, QueryType>,
  res: ResponseType,
  authResult: AuthType
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
