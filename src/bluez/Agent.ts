import { DBus, InterfaceDefinition } from "dbus-native";
import { AgentManager } from "./AgentManager";

const PASSKEY = 123456

const TAG = "[AGNT]"
const AGENT_PATH = "/io/github/vlkoti/bthagent";
const AGENT_NAME = "io.github.vlkoti.bthagent";
const AGENT_CAPABILITY = "NoInputNoOutput";

export const INTERFACE_DEFINITION: InterfaceDefinition = {
    name: "org.bluez.Agent1",
    methods: {
        Release: ["", "", [], []],
        RequestPinCode: ["o", "s", ["requester_device"], ["pin_code"]],
        RequestPasskey: ["o", "u", ["requester_device"], ["passkey"]],
        RequestConfirmation: ["ou", "", ["requester_device", "passkey"], []],
        RequestAuthorization: ["o", "", ["requester_device"], []],
        AuthorizeService: ["os", "", ["requester_device", "uuid"], []],
        Cancel: ["", "", [], []]
    }
};

export class Agent {

    public static async register(bus: DBus): Promise<void> {
        const requestName = new Promise((resolve, reject) => {
            console.log(TAG, `Requesting name for agent ${AGENT_NAME}`)
            bus.requestName(AGENT_NAME, 0, (err: any) => {
                err ? reject(err) : resolve();
            });
        });

        await requestName;

        bus.exportInterface(Agent, AGENT_PATH, INTERFACE_DEFINITION);
        const agentManager = new AgentManager(bus);

        console.log(TAG, `Registering agent at ${AGENT_PATH}`);
        await agentManager.RegisterAgent(AGENT_PATH, AGENT_CAPABILITY);
        await agentManager.RequestDefaultAgent(AGENT_PATH);
        console.log(TAG, "Agent registered");
    }

    /**
     * This method gets called when the service daemon
     * unregisters the agent. An agent can use it to do
     * cleanup tasks. There is no need to unregister the
     * agent, because when this method gets called it has
     * already been unregistered.
     */
    static Release () {
        console.log(TAG, "Release");
    }

    /**
     *This method gets called when the service daemon
     * needs to get the passkey for an authentication.
     *
     * The return value should be a string of 1- 16 characters
     * length.The string can be alphanumeric.
     *
     * Possible errors: org.bluez.Error.Rejected
     *                  org.bluez.Error.Canceled
     *
     * @memberof Agent
     */
    static RequestPinCode (device: any): string {
        console.log(TAG, "RequestPinCode", device);
        return PASSKEY.toString();
    }

    /**
     * This method gets called when the service daemon
     * needs to get the passkey for an authentication.
     *
     * The return value should be a numeric value
     * between 0-999999.
     *
     * Possible errors: org.bluez.Error.Rejected
     *                  org.bluez.Error.Canceled
     * @param {any} device
     * @memberof Agent
     */
    static RequestPasskey (device: any): number {
        console.log(TAG, "RequestPasskey", device);
        return PASSKEY;
    }

    /**
     * This method gets called when the service daemon
     * needs to confirm a passkey for an authentication.
     *
     * To confirm the value it should return an empty reply
     * or an error in case the passkey is invalid.
     *
     * Note that the passkey will always be a 6-digit number,
     * so the display should be zero- padded at the start if
     * the value contains less than 6 digits.
     *
     * Possible errors: org.bluez.Error.Rejected
     *                  org.bluez.Error.Canceled
     * @param {any} [object=device]
     * @param {any} [uint32=passkey]
     * @memberof Agent
     */
    static RequestConfirmation (device: any, passkey: number) {
        console.log(TAG, "RequestConfirmation", device, passkey);
        if (passkey !== PASSKEY) {
            throw "Passkey invalid";
        }
    }

    /**
     * This method gets called to request the user to
     * authorize an incoming pairing attempt which
     * would in other circumstances trigger the just- works
     * model.
     *
     * Possible errors: org.bluez.Error.Rejected
     *                  org.bluez.Error.Canceled
     * @param {any} [object=device]
     * @memberof Agent
     */
    static RequestAuthorization (device: any) {
        console.log(TAG, "RequestAuthorization", device);
    }

    /**
     * This method gets called when the service daemon
     * needs to authorize a connection/service request.
     *
     * Possible errors: org.bluez.Error.Rejected
     *                  org.bluez.Error.Canceled
     * @param {any} [object=device]
     * @param {any} [string=uuid]
     * @memberof Agent
     */
    static AuthorizeService(device: any, uuid: string) {
        // TODO: set paired and trusted properties for device
        console.log(TAG, "AuthorizeService", device, uuid);
    }

    /**
     * This method gets called to indicate that the agent
     * request failed before a reply was returned.
     * @memberof Agent
     */
    static Cancel () {
        console.log(TAG, "Cancel");
    }
}
