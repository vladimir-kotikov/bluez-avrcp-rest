type BusName = 'system' | 'session';

declare namespace dbus {

    type MethodCallOptions = {
        timeout: number;
    };

    type MethodCallback<T> = (err: any, result: T) => void;
    type MethodCall<T> = (emptyArg: null | undefined, options: MethodCallOptions, callback: MethodCallback<T>) => void;

    interface Introspectable {
        Introspect: MethodCall<string>
    }
}

declare module "dbus" {
    export default class DBus {
        static getBus(busName: BusName): DBus;
        static registerService(busName: BusName, serviceName: string): Service;
        getInterface<I>(
            serviceName: string,
            objectPath: string,
            interfaceName: string,
            callback: (err: any, interface: I) => void
        ): void;
    }

    interface Interface {

    }

    interface Service {

    }
}
