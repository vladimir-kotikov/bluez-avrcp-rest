import { CanMessage } from "../CanMessage";

export interface IFilter {
    passes(message: CanMessage): boolean;
}

export abstract class BaseFilter implements IFilter{
    static configName: string = "";

    constructor() { }

    abstract passes(message: CanMessage): boolean;
}
