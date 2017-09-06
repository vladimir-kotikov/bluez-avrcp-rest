import * as dbus from "dbus-native";
import { Agent } from "./agent";

const TAG = "[REGSVC]"
const bus = dbus.systemBus();

Agent.register(bus)
    .then(agent => {
        console.log(TAG, "Agent started");
    });