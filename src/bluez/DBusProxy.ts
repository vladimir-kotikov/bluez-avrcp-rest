import { DBus } from "dbus-native";
export abstract class DBusProxy {
    private payload: {
        destination: string;
        path: string;
        interface: string;
        body?: any;
        signature?: string
    };

    constructor(private bus: DBus, serviceName: string,
        objectPath: string, interfaceName: string) {

        this.payload = {
            destination: serviceName,
            path: objectPath,
            interface: interfaceName
        }
    }

    protected async invokeMethod(methodName: string,
        additionalFields?: { body?: any, signature?: string }): Promise<any> {

        return new Promise((resolve, reject) => {
            let message = {
                ...this.payload,
                member: methodName
            }

            if (additionalFields) {
                message = {
                    ...message,
                    ...additionalFields
                }
            }

            this.bus.invoke(message, (err, result) => err ? reject(err) : resolve(result));
        });
    }
}