import { BaseFilter } from "@/filters/base.js";

export class ViewsFilter extends BaseFilter {
	constructor() {
		super();
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
	}

	setRange(min, max) {
		this.min = min;
		this.max = max;
		this.active = min > 0 || max < Number.POSITIVE_INFINITY;
	}

	reset() {
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		return metadata.views >= this.min && metadata.views <= this.max;
	}
}
