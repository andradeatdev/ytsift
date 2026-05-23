import { LANGUAGE_RULES } from "@/parsers/language-rules.js";

export const ViewsParser = {
	parsePlainNumber(numStr) {
		const clean = numStr.trim();
		if (!clean) return Number.NaN;
		if (clean.includes(",") && clean.includes(".")) {
			const commaIndex = clean.lastIndexOf(",");
			const dotIndex = clean.lastIndexOf(".");
			if (dotIndex > commaIndex) {
				return Number.parseFloat(clean.replace(/,/g, ""));
			}
			return Number.parseFloat(clean.replace(/\./g, "").replace(",", "."));
		}
		if (clean.includes(",")) {
			const parts = clean.split(",");
			if (parts.length === 2 && parts[1].length !== 3) {
				return Number.parseFloat(clean.replace(",", "."));
			}
			return Number.parseFloat(clean.replace(/,/g, ""));
		}
		if (clean.includes(".")) {
			const parts = clean.split(".");
			if (parts.length === 2 && parts[1].length !== 3) {
				return Number.parseFloat(clean);
			}
			return Number.parseFloat(clean.replace(/\./g, ""));
		}
		return Number.parseFloat(clean);
	},

	parseViewsWithRules(text) {
		if (!text) return Number.NaN;
		const cleanStr = text.toLowerCase().trim();

		for (const langKey of Object.keys(LANGUAGE_RULES)) {
			const lang = LANGUAGE_RULES[langKey];
			for (const mult of lang.multipliers) {
				const escapedSuffix = mult.suffix.replace(
					/[-/\\^$*+?.()|[\]{}]/g,
					"\\$&",
				);
				const regex = new RegExp(
					`([\\d.,]+)\\s*${escapedSuffix}(?:\\b|$|[^a-zA-Záéíóúâêôãõç])`,
					"i",
				);
				const match = cleanStr.match(regex);
				if (match) {
					const numStr = match[1];
					let cleanedNum = numStr;
					if (lang.thousandSeparator) {
						cleanedNum = cleanedNum.replaceAll(lang.thousandSeparator, "");
					}
					if (lang.decimalSeparator && lang.decimalSeparator !== ".") {
						cleanedNum = cleanedNum.replaceAll(lang.decimalSeparator, ".");
					}
					const val = Number.parseFloat(cleanedNum);
					if (!Number.isNaN(val)) {
						return Math.round(val * mult.value);
					}
				}
			}
		}

		const plainMatch = cleanStr.match(/[\d.,]+/);
		if (plainMatch) {
			const val = this.parsePlainNumber(plainMatch[0]);
			if (!Number.isNaN(val)) {
				return Math.round(val);
			}
		}

		return Number.NaN;
	},

	parseViews(viewsStr) {
		const val = this.parseViewsWithRules(viewsStr);
		return Number.isNaN(val) ? 0 : val;
	},
};
