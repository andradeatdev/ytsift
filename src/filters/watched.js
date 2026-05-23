import { BaseFilter } from "./base.js";

export class WatchedFilter extends BaseFilter {
	constructor() {
		super();
		this.type = "all"; // "all" | "watched" | "unwatched"
		this.percent = 10; // threshold percentage (default 10%)
	}

	setCriteria(type, percent) {
		this.type = type;
		this.percent = percent;
		this.active = type !== "all";
	}

	reset() {
		this.type = "all";
		this.percent = 10;
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		const videoPercent = metadata.watchedPercent || 0;
		if (this.type === "watched") {
			return videoPercent >= this.percent;
		}
		if (this.type === "unwatched") {
			return videoPercent < this.percent;
		}
		return true;
	}
}
