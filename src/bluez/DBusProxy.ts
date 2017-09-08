import * as assert from "assert";
import { DBus, DBusMessage } from "dbus-native";

export abstract class DBusProxy {
    private payload: {
        destination: string;
        path: string;
        interface: string;
        body?: any;
        signature?: string
    };

    constructor(private bus: DBus, serviceName: string,
        objectPath: string, private interfaceName: string) {

        this.payload = {
            destination: serviceName,
            path: objectPath,
            interface: interfaceName
        }

        assert(this.interfaceName !== undefined, "interfaceName must be defined");
    }

    private async invoke(message: DBusMessage): Promise<any> {
        return new Promise((resolve, reject) => {
            this.bus.invoke(message, (err, result) => err ? reject(err) : resolve(result));
        });
    }

    protected async invokeMethod(methodName: string,
        additionalFields?: { body?: any, signature?: string }): Promise<any> {

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

            return this.invoke(message);
    }

    public async Get(propertyName: string) {
        return this.invoke({
            ...this.payload,
            interface: "org.freedesktop.DBus.Properties",
            member: "Get",
            body: [this.interfaceName, propertyName],
            signature: "ss"
        });
    }

    public Set(propertyName: string, propertyValue: any) {
        return this.invoke({
            ...this.payload,
            interface: "org.freedesktop.DBus.Properties",
            member: "Set",
            body: [this.interfaceName, propertyName, propertyValue],
            signature: "ssv"
        });
    }

    public GetAll() {
        return this.invoke({
            ...this.payload,
            interface: "org.freedesktop.DBus.Properties",
            member: "GetAll",
            body: [this.interfaceName],
            signature: "s"
        });
    }
}
