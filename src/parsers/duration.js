export const DurationParser = {
	parse(durationStr) {
		if (!durationStr) return 0;
		const cleanStr = durationStr.replace(/[^\d:]/g, "");
		const parts = cleanStr.split(":").map(Number);
		if (parts.length === 2) return parts[0] * 60 + parts[1];
		if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
		if (parts.length === 1) return parts[0];
		return 0;
	},
};
