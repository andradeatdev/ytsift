import { Settings } from "@/core/settings.js";
import { BaseFilter } from "@/filters/base.js";

export class WatchedFilter extends BaseFilter {
	constructor() {
		super();
		this.type = "all"; // "all" | "watched" | "unwatched"
		this.percent = Settings.defaultWatched; // threshold percentage from settings
	}

	setCriteria(type, percent) {
		this.type = type;
		this.percent = percent;
		this.active = type !== "all";
	}

	reset() {
		this.type = "all";
		this.percent = Settings.defaultWatched;
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
