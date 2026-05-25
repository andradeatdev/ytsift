export const Settings = {
	queueThrottle: 150,
	requestThrottle: 1500,
	defaultWatched: 10,
	showStatusChip: true,
	showDurationChip: true,
	showAgeChip: true,
	showViewsChip: true,
	durationAdvancedMode: false,

	load() {
		try {
			const saved = localStorage.getItem("ytsift-settings");
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.queueThrottle !== undefined)
					this.queueThrottle = Number(parsed.queueThrottle);
				if (parsed.requestThrottle !== undefined)
					this.requestThrottle = Number(parsed.requestThrottle);
				if (parsed.defaultWatched !== undefined)
					this.defaultWatched = Number(parsed.defaultWatched);
				if (parsed.showStatusChip !== undefined)
					this.showStatusChip = Boolean(parsed.showStatusChip);
				if (parsed.showDurationChip !== undefined)
					this.showDurationChip = Boolean(parsed.showDurationChip);
				if (parsed.showAgeChip !== undefined)
					this.showAgeChip = Boolean(parsed.showAgeChip);
				if (parsed.showViewsChip !== undefined)
					this.showViewsChip = Boolean(parsed.showViewsChip);
				if (parsed.durationAdvancedMode !== undefined)
					this.durationAdvancedMode = Boolean(parsed.durationAdvancedMode);
			}
		} catch (e) {
			console.error("Failed to load settings", e);
		}
	},

	save() {
		try {
			localStorage.setItem(
				"ytsift-settings",
				JSON.stringify({
					queueThrottle: this.queueThrottle,
					requestThrottle: this.requestThrottle,
					defaultWatched: this.defaultWatched,
					showStatusChip: this.showStatusChip,
					showDurationChip: this.showDurationChip,
					showAgeChip: this.showAgeChip,
					showViewsChip: this.showViewsChip,
					durationAdvancedMode: this.durationAdvancedMode,
				}),
			);
		} catch (e) {
			console.error("Failed to save settings", e);
		}
	},
};
