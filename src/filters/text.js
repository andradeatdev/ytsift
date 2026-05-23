import { BaseFilter } from "@/filters/base.js";

export class TextFilter extends BaseFilter {
	constructor() {
		super();
		this.query = "";
		this.positiveWords = [];
		this.negativeWords = [];
	}

	setQuery(query) {
		this.query = query;
		const allWords = query.toLowerCase().split(/\s+/).filter(Boolean);
		this.positiveWords = [];
		this.negativeWords = [];
		for (const word of allWords) {
			if (word.startsWith("-") && word.length > 1) {
				this.negativeWords.push(word.slice(1));
				continue;
			}
			this.positiveWords.push(word);
		}
		this.active =
			this.positiveWords.length > 0 || this.negativeWords.length > 0;
	}

	reset() {
		this.query = "";
		this.positiveWords = [];
		this.negativeWords = [];
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		const titleLower = (metadata.title || "").toLowerCase();
		const matchesPositive = this.positiveWords.every((word) =>
			titleLower.includes(word),
		);
		const matchesNegative = this.negativeWords.some((word) =>
			titleLower.includes(word),
		);
		return matchesPositive && !matchesNegative;
	}
}
