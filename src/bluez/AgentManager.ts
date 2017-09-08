import { DBus } from "dbus-native";
import { DBusProxy } from "./DBusProxy";

type AgentCapability = "NoInputNoOutput" | "KeyboardDisplay";

export class AgentManager extends DBusProxy {
    constructor(bus: DBus) {
        super(bus, "org.bluez", `/org/bluez`, "org.bluez.AgentManager1");
    }

    public RegisterAgent(agentPath: string, capability: AgentCapability) {
        return this.invokeMethod("RegisterAgent", {
            body: [agentPath, capability],
            signature: "os"
        });
    }

    public UnregisterAgent(agentPath: string) {
        return this.invokeMethod("UnregisterAgent", {
            body: [agentPath],
            signature: "o"
        });
    }
    public RequestDefaultAgent(agentPath: string) {
        return this.invokeMethod("RequestDefaultAgent", {
            body: [agentPath],
            signature: "o"
        });
    }
}
