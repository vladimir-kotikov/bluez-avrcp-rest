
import { BaseFilter, IFilter } from "./BaseFilter";
import { CanMessage } from "../CanMessage";

const TAG = "[ecuid]";

export class EcuIDFilter extends BaseFilter implements IFilter {
    public static configName = "ecuIDs";

    private ecuIDs: number[] = [];

    constructor(content: any) {
        super();

        try {
            if (!Array.isArray(content)) {
                return;
            }

            content = content
                .map(int => parseInt(int))
                .filter(int => !isNaN(int));

            this.ecuIDs = content;

            let str = `Loaded ${content.length} ecu IDs: ${content.map((n: number) => "0x" + n.toString(16))}`;
            console.log(TAG, str);
        } catch (err) {
            return;
        }
    }
    passes(message: CanMessage): boolean {
        return this.ecuIDs.indexOf(message.ecuId) < 0;
    }
}
