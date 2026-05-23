export const AgeParser = {
	parseToDays(ageStr) {
		if (!ageStr) return 0;
		const clean = ageStr.toLowerCase().trim();

		// Match numbers and potential time units
		const match = clean.match(
			/(\d+)\s*(minute|hour|day|week|month|year|minuto|hora|dia|semana|mês|meses|ano)s?/,
		);
		if (!match) return 0;

		const value = Number.parseInt(match[1], 10);
		const unit = match[2];

		switch (unit) {
			case "minute":
			case "minuto":
				return value / (24 * 60);
			case "hour":
			case "hora":
				return value / 24;
			case "day":
			case "dia":
				return value;
			case "week":
			case "semana":
				return value * 7;
			case "month":
			case "mês":
			case "meses":
				return value * 30;
			case "year":
			case "ano":
				return value * 365;
			default:
				return 0;
		}
	},
};
