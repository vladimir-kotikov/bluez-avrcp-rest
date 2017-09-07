import { existsSync, readFileSync, watch } from "fs";
import * as stripComments from "strip-json-comments";

import { BaseFilter, IFilter } from "./filters/BaseFilter";
import { EcuIDFilter } from "./filters/EcuIDFilter";
import { ChangingFilter } from "./filters/ChangingFilter";
import { CanMessage } from "./CanMessage";

const KNOWN_FILTERS = {
    [EcuIDFilter.configName]: EcuIDFilter,
    [ChangingFilter.configName]: ChangingFilter
};

const TAG = "[fltrs]";

export class FilterCollection implements IFilter {

    private filters: BaseFilter[] = [];

    constructor(private filename: string) {
        if (!existsSync(filename)) {
            console.log(TAG, `Can't find filters in ${filename}. Create one if you want to filter can messages`);
            return;
        }

        this.load();
        watch(filename, "utf8", () => this.load());

        console.log(TAG, `Watching for filters from ${filename}`);
    }

    private load() {
        try {
            let content = JSON.parse(stripComments(readFileSync(this.filename, "utf8")));

            const newFilters = Object.keys(content)
                .filter(filterName => !!content[filterName])
                .filter(filterName => KNOWN_FILTERS[filterName])
                .map(filterName => {
                    const filterDef = content[filterName];
                    const F = KNOWN_FILTERS[filterName];
                    return new F(filterDef);
                });

            this.filters = newFilters;

            console.log(TAG, `Loaded ${this.filters.length} filters`);
        } catch (err) {
            console.log(TAG, `Failed to load filters from ${this.filename}`);
        }
    }

    public passes(message: CanMessage): boolean {
        return this.filters.every(f => f.passes(message));
    }
}
