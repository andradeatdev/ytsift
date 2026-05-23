import { BaseFilter } from "./base.js";

export class DurationFilter extends BaseFilter {
	constructor() {
		super();
		this.preset = null;
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
	}

	setRange(min, max, preset = "custom") {
		this.min = min;
		this.max = max;
		this.preset = preset;
		this.active = preset !== null;
	}

	reset() {
		this.preset = null;
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		const sec = metadata.durationSec;
		const minSec = this.min * 60;
		const maxSec = this.max * 60;
		return sec >= minSec && sec <= maxSec;
	}
}
