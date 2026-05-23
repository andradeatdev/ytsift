import { CONFIG } from "@/config.js";
import { State } from "@/core/state.js";
import { DataModelResolver } from "@/dom/resolver.js";
import { AgeParser } from "@/parsers/age.js";
import { DurationParser } from "@/parsers/duration.js";
import { ViewsParser } from "@/parsers/views.js";

export const FilterEngine = {
	apply() {
		const cards = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD);
		let matchCount = 0;

		for (const card of cards) {
			const cardData = DataModelResolver.getCardData(card);

			// Static video title is cached on the DOM node for performance
			let title = card.__ytsift_title;
			if (title === undefined) {
				let resolvedTitle = "";
				if (cardData) {
					resolvedTitle = DataModelResolver.getVideoTitle(cardData);
				}
				if (!resolvedTitle) {
					const titleEl = card.querySelector(CONFIG.SELECTORS.VIDEO_TITLE);
					resolvedTitle = titleEl
						? (titleEl.getAttribute("title") || "").trim()
						: "";
				}
				title = resolvedTitle || "";
				card.__ytsift_title = title;
			}

			// Static duration is cached on the DOM node to avoid redundant parsing
			let durationSec = card.__ytsift_duration_sec;
			if (durationSec === undefined) {
				let durationStr = "";
				if (cardData) {
					durationStr = DataModelResolver.getVideoDuration(cardData);
				}
				if (!durationStr) {
					const durationEl = card.querySelector(
						CONFIG.SELECTORS.VIDEO_DURATION,
					);
					durationStr = durationEl ? durationEl.textContent.trim() : "";
				}
				durationSec = DurationParser.parse(durationStr);
				card.__ytsift_duration_sec = durationSec;
			}

			// Static view count is cached on the DOM node to avoid redundant parsing
			let views = card.__ytsift_views;
			if (views === undefined) {
				let parsed = Number.NaN;

				if (cardData) {
					const viewsPart = DataModelResolver.getVideoViewsPart(cardData);
					if (viewsPart) {
						const shortText = DataModelResolver.getNestedValue(
							viewsPart,
							"text.content",
						);
						const longText = DataModelResolver.getNestedValue(
							viewsPart,
							"text.accessibility.accessibilityData.label",
						);

						// 1. Try short text first
						if (shortText) {
							parsed = ViewsParser.parseViewsWithRules(shortText);
						}

						// 2. If short text fails, try long text
						if (Number.isNaN(parsed) && longText) {
							parsed = ViewsParser.parseViewsWithRules(longText);
						}
					}
				}

				// 3. Fallback to DOM scraping if data-model parsing failed or was not available
				let domViewsStr = "";
				if (Number.isNaN(parsed)) {
					const metaSpans = card.querySelectorAll(CONFIG.SELECTORS.VIDEO_VIEWS);
					for (let i = 0; i < metaSpans.length; i++) {
						const txt = metaSpans[i].textContent.toLowerCase();
						if (
							txt.includes("view") ||
							txt.includes("visualiza") ||
							txt.includes("vista") ||
							txt.includes("assist")
						) {
							domViewsStr = metaSpans[i].textContent;
							break;
						}
					}
					if (domViewsStr) {
						parsed = ViewsParser.parseViewsWithRules(domViewsStr);
					}
				}

				// 4. If all fail, display warning in console and default to 0
				if (Number.isNaN(parsed)) {
					const shortText = cardData
						? DataModelResolver.getNestedValue(
								DataModelResolver.getVideoViewsPart(cardData),
								"text.content",
							)
						: "N/A";
					const longText = cardData
						? DataModelResolver.getNestedValue(
								DataModelResolver.getVideoViewsPart(cardData),
								"text.accessibility.accessibilityData.label",
							)
						: "N/A";
					console.warn(
						`[ytsift] Failed to parse views for video: "${title}". Short: "${shortText}", Long: "${longText}", DOM: "${domViewsStr}"`,
					);
					parsed = 0;
				}

				views = parsed;
				card.__ytsift_views = views;
			}

			// Static age in days is cached on the DOM node to avoid redundant parsing
			let ageDays = card.__ytsift_age_days;
			if (ageDays === undefined) {
				let parsed = Number.NaN;

				if (cardData) {
					const agePart = DataModelResolver.getVideoAgePart(cardData);
					if (agePart) {
						const shortText = DataModelResolver.getNestedValue(
							agePart,
							"text.content",
						);
						const longText = DataModelResolver.getNestedValue(
							agePart,
							"text.accessibility.accessibilityData.label",
						);

						if (shortText) {
							parsed = AgeParser.parseToDays(shortText);
						}
						if ((Number.isNaN(parsed) || parsed === 0) && longText) {
							parsed = AgeParser.parseToDays(longText);
						}
					}
				}

				// Fallback to DOM scraping if data-model parsing failed or was not available
				let domAgeStr = "";
				if (Number.isNaN(parsed) || parsed === 0) {
					const metaSpans = card.querySelectorAll(CONFIG.SELECTORS.VIDEO_VIEWS);
					for (let i = 0; i < metaSpans.length; i++) {
						const txt = metaSpans[i].textContent.toLowerCase();
						if (
							txt.includes("ago") ||
							txt.includes("há") ||
							txt.includes("minut") ||
							txt.includes("hour") ||
							txt.includes("hora") ||
							txt.includes("day") ||
							txt.includes("dia") ||
							txt.includes("week") ||
							txt.includes("semana") ||
							txt.includes("month") ||
							txt.includes("mês") ||
							txt.includes("meses") ||
							txt.includes("year") ||
							txt.includes("ano")
						) {
							domAgeStr = metaSpans[i].textContent;
							break;
						}
					}
					if (domAgeStr) {
						parsed = AgeParser.parseToDays(domAgeStr);
					}
				}

				if (Number.isNaN(parsed)) {
					parsed = 0;
				}

				ageDays = parsed;
				card.__ytsift_age_days = ageDays;
			}

			// Watched percentage must be queried dynamically to reflect live watch state changes
			const watchedPercent = DataModelResolver.getVideoWatchedPercent(
				cardData,
				card,
			);

			const metadata = {
				title,
				durationSec,
				views,
				watchedPercent,
				ageDays,
			};

			const textMatch = State.filters.text.matches(metadata);
			const watchedMatch = State.filters.watched.matches(metadata);
			const durationMatch = State.filters.duration.matches(metadata);
			const viewsMatch = State.filters.views.matches(metadata);
			const ageMatch = State.filters.age.matches(metadata);

			const shouldHide = !(
				textMatch &&
				watchedMatch &&
				durationMatch &&
				viewsMatch &&
				ageMatch
			);
			card.classList.toggle(CONFIG.CLASSES.HIDDEN, shouldHide);

			if (!shouldHide) {
				matchCount++;
			}
		}

		const counterEl = document.getElementById("ytsift-counter");
		if (counterEl) {
			counterEl.textContent = `${matchCount} / ${cards.length}`;
		}
	},
};
