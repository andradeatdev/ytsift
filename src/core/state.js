import { AgeFilter } from "../filters/age.js";
import { DurationFilter } from "../filters/duration.js";
import { TextFilter } from "../filters/text.js";
import { ViewsFilter } from "../filters/views.js";
import { WatchedFilter } from "../filters/watched.js";

export const State = {
	filters: {
		text: new TextFilter(),
		watched: new WatchedFilter(),
		duration: new DurationFilter(),
		views: new ViewsFilter(),
		age: new AgeFilter(),
	},
	lastCardCount: 0,
	lastFetchTime: 0,

	// Global URLPattern instances to avoid recreation on every fetch
	channelVideosPattern: new URLPattern({ pathname: "/:username/videos" }),
	channelIdVideosPattern: new URLPattern({ pathname: "/channel/:id/videos" }),

	reset() {
		for (const key of Object.keys(this.filters)) {
			this.filters[key].reset();
		}
		this.lastCardCount = 0;
	},

	isFilterActive() {
		return Object.values(this.filters).some((filter) => filter.isActive());
	},
};
