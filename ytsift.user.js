// ==UserScript==
// @name               ytsift - Lightweight YouTube channel filter
// @name:pt-BR         ytsift - Filtro de vídeos em canais do YouTube
// @namespace          https://greasyfork.org/users/821661
// @match              https://www.youtube.com/*
// @grant              GM_addStyle
// @noframes
// @version            1.0.1
// @author             hdyzen
// @description        Lightweight YouTube channel filter for titles, duration, views, age and watch state.
// @description:pt-BR  Filtro leve para canais do YouTube por título, duração, visualizações, idade e status de visualização.
// @license            GPL-3.0
// ==/UserScript==

const CONFIG = {
	THROTTLE_DELAY: 1500,
	CLASSES: {
		HIDDEN: "ytsift-hidden",
		CONTROLS_WRAPPER: "ytsift-controls-wrapper",
		CHIP: "ytsift-chip",
		ACTIVE: "active",
		DURATION_CHIP: "ytsift-duration-chip",
		SEPARATOR: "ytsift-separator",
		COUNTER: "ytsift-counter",
		SEARCH_CONTAINER: "ytsift-search-container",
		SEARCH_ICON: "ytsift-search-icon",
		SEARCH_INPUT: "ytsift-search-input",
		CLEAR_BTN: "ytsift-search-clear-btn",
	},
	SELECTORS: {
		CHIP_BAR: "chip-bar-view-model",
		VIDEO_CARD: "ytd-rich-item-renderer",
		VIDEO_TITLE: ".ytLockupMetadataViewModelHeadingReset",
		VIDEO_DURATION: "yt-thumbnail-bottom-overlay-view-model .ytBadgeShapeText",
		VIDEO_WATCHED: "yt-thumbnail-overlay-progress-bar-view-model",
		VIDEO_VIEWS: "#metadata-line span.inline-metadata-item",
	},
};

const Settings = {
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

const StyleManager = {
	inject() {
		GM_addStyle(`
            :root {
                /* Color design tokens */
                --ytsift-text-primary: var(--yt-sys-color-baseline--text-primary, #0f0f0f);
                --ytsift-text-primary-inverse: var(--yt-sys-color-baseline--text-primary-inverse, #fff);
                --ytsift-text-secondary: var(--yt-sys-color-baseline--text-secondary, #606060);
                --ytsift-text-disabled: var(--yt-sys-color-baseline--text-disabled, #909090);
                --ytsift-outline: var(--yt-sys-color-baseline--outline, rgba(0, 0, 0, 0.15));
                --ytsift-tonal-bg: var(--yt-sys-color-baseline--tonal-background, rgba(0, 0, 0, 0.05));
                --ytsift-hover-bg: var(--yt-sys-color-baseline--button-chip-background-hover, rgba(0, 0, 0, 0.08));
                
                /* Base typography sizes */
                --ytsift-base-font-size: 14px;
                --ytsift-popover-font-size: 13px;

                /* Controls Layout (in ems, relative to --ytsift-base-font-size) */
                --ytsift-controls-height: initial;
                --ytsift-chip-height: 2.29em;
                
                /* Native Classic Popover Tokens */
                --ytsift-pop-bg: #282828;
                --ytsift-pop-border: rgba(255, 255, 255, 0.1);
                --ytsift-accent: #3ea6ff;
                --ytsift-accent-text: #0f0f0f;
            }

            .ytsift-controls-wrapper {
                display: inline-flex;
                align-items: flex-end;
                gap: 0.57em; /* 8px */
                margin-right: 0.86em; /* 12px */
                vertical-align: middle;
                height: var(--ytsift-controls-height);
                font-size: var(--ytsift-base-font-size);
            }

            .ytsift-filters-left {
                display: inline-flex;
                align-items: center;
                gap: 0.57em; /* 8px */
                flex-shrink: 0;
            }

            .ytsift-actions-right {
                display: inline-flex;
                align-items: center;
                gap: 0.57em; /* 8px */
                flex-shrink: 0;
            }

            .ytsift-search-container {
                display: inline-flex;
                align-items: center;
                background-color: var(--ytsift-tonal-bg);
                border-radius: 0.57em; /* 8px */
                height: var(--ytsift-chip-height);
                padding: 0 0.71em; /* 10px */
                box-sizing: border-box;
                border: 1px solid transparent;
                transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                            border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                width: 14.29em; /* 200px */
            }

            .ytsift-search-container:hover {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-search-container:focus-within {
                background-color: var(--ytsift-tonal-bg);
                border-color: var(--ytsift-text-primary);
            }

            .ytsift-search-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--ytsift-text-secondary);
                width: 1.14em; /* 16px */
                height: 1.14em; /* 16px */
                margin-right: 0.43em; /* 6px */
                transition: color 0.2s;
            }

            .ytsift-search-container:focus-within .ytsift-search-icon {
                color: var(--ytsift-text-primary);
            }

            .ytsift-search-icon svg {
                width: 100%;
                height: 100%;
                fill: currentColor;
            }

            .ytsift-search-input {
                border: none;
                background: transparent;
                color: var(--ytsift-text-primary);
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 1em; /* 14px */
                outline: none;
                padding: 0;
                margin: 0;
                flex: 1;
                min-width: 0;
            }

            .ytsift-search-input::placeholder {
                color: var(--ytsift-text-disabled);
                opacity: 0.8;
            }

            .ytsift-search-clear-btn {
                border: none;
                background: transparent;
                padding: 0;
                margin: 0;
                margin-left: 0.43em; /* 6px */
                color: var(--ytsift-text-secondary);
                cursor: pointer;
                display: flex;
                visibility: hidden;
                align-items: center;
                justify-content: center;
                width: 1.29em; /* 18px */
                height: 1.29em; /* 18px */
                border-radius: 50%;
                transition: background-color 0.2s, color 0.2s;
            }

            .ytsift-search-clear-btn:hover {
                background-color: var(--ytsift-hover-bg);
                color: var(--ytsift-text-primary);
            }

            .ytsift-search-clear-btn svg {
                width: 0.86em; /* 12px */
                height: 0.86em; /* 12px */
                fill: currentColor;
            }

            .ytsift-chip {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background-color: var(--ytsift-tonal-bg);
                color: var(--ytsift-text-primary);
                border-radius: 0.57em; /* 8px */
                height: var(--ytsift-chip-height);
                padding: 0 0.86em; /* 12px */
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 1em; /* 14px */
                font-weight: 500;
                cursor: pointer;
                border: none;
                box-sizing: border-box;
                transition: background-color 0.2s, color 0.2s;
                user-select: none;
            }

            .ytsift-chip:hover {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-chip:focus-visible {
                outline: 2px solid var(--ytsift-text-primary);
                outline-offset: 2px;
            }

            .ytsift-chip.active {
                background-color: var(--ytsift-text-primary);
                color: var(--ytsift-text-primary-inverse);
            }

            .ytsift-chip.active:hover {
                background-color: var(--yt-sys-color-baseline--mono-filled-hover, #d9d9d9);
            }

            .ytsift-counter {
                display: inline-flex;
                align-items: center;
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 0.93em; /* 13px */
                font-weight: 500;
                color: var(--ytsift-text-secondary);
                padding: 0 0.57em; /* 8px */
                height: var(--ytsift-chip-height);
                pointer-events: none;
                user-select: none;
            }

            .ytsift-clear-all-btn,
            .ytsift-enqueue-all-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background-color: transparent;
                border-radius: 0.57em; /* 8px */
                height: var(--ytsift-chip-height);
                padding: 0 0.86em; /* 12px */
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 1em; /* 14px */
                font-weight: 500;
                cursor: pointer;
                border: none;
                box-sizing: border-box;
                transition: background-color 0.2s, color 0.2s;
                user-select: none;
            }

            .ytsift-clear-all-btn {
                color: var(--ytsift-text-secondary);
            }
            .ytsift-clear-all-btn:hover {
                background-color: var(--ytsift-hover-bg);
                color: var(--ytsift-text-primary);
            }

            .ytsift-enqueue-all-btn {
                color: var(--ytsift-accent);
            }
            .ytsift-enqueue-all-btn:hover {
                background-color: rgba(62, 166, 255, 0.15);
            }

            .ytsift-clear-all-btn:focus-visible,
            .ytsift-enqueue-all-btn:focus-visible {
                outline: 2px solid var(--ytsift-text-primary);
                outline-offset: 2px;
            }

            .ytsift-clear-all-btn:disabled,
            .ytsift-enqueue-all-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background-color: transparent !important;
            }

            .ytsift-separator {
                width: 0.07em; /* 1px */
                height: 1.43em; /* 20px */
                background-color: var(--ytsift-outline);
                margin: 0 0.43em 0.43em; /* 0 6px 6px */
                flex-shrink: 0;
            }

            .ytsift-popover {
                position: absolute;
                background: var(--ytsift-pop-bg, #282828);
                border: 1px solid var(--ytsift-pop-border, rgba(255, 255, 255, 0.1));
                border-radius: 12px;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
                padding: 16px;
                width: 260px;
                box-sizing: border-box;
                z-index: 10000;
                font-family: "Roboto", Arial, sans-serif;
                display: none;

                --ytsift-text-primary: #f1f1f1;
                --ytsift-text-secondary: #aaaaaa;
                --ytsift-hover-bg: rgba(255, 255, 255, 0.15);
            }
            .ytsift-popover:popover-open {
                display: block;
            }

            .segmented-control {
                display: flex;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 3px;
                margin-bottom: 16px;
                border: 1px solid var(--ytsift-pop-border);
            }
            .segmented-btn {
                flex: 1;
                background: transparent;
                border: none;
                border-radius: 6px;
                padding: 6px 0;
                font-size: 12px;
                font-weight: 500;
                color: var(--ytsift-text-secondary);
                cursor: pointer;
                transition: 0.2s;
                text-align: center;
            }
            .segmented-btn.active {
                background: #ffffff;
                color: var(--ytsift-accent-text);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .slider-row {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
            }
            .slider-row:last-of-type {
                margin-bottom: 0;
            }
            .slider-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: var(--ytsift-text-secondary);
            }

            .ytsift-slider {
                -webkit-appearance: none;
                width: 100%;
                height: 4px;
                border-radius: 2px;
                outline: none;
                margin: 4px 0;
                background: linear-gradient(to right, var(--ytsift-accent) var(--slider-progress, 0%), rgba(255,255,255,0.1) var(--slider-progress, 0%));
            }
            .ytsift-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: var(--ytsift-accent);
                cursor: pointer;
                transition: transform 0.1s ease;
            }
            .ytsift-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }
            .ytsift-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border: none;
                border-radius: 50%;
                background: var(--ytsift-accent);
                cursor: pointer;
                transition: transform 0.1s ease;
            }
            .ytsift-slider::-moz-range-thumb:hover {
                transform: scale(1.2);
            }

            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
            }
            input[type=number] {
                -moz-appearance: textfield;
                font-variant-numeric: tabular-nums;
            }

            .num-outlined {
                display: inline-flex;
                align-items: stretch;
                border: 1px solid var(--ytsift-pop-border);
                border-radius: 4px;
                height: 26px;
                overflow: hidden;
                background: rgba(0, 0, 0, 0.2);
                transition: border-color 0.2s;
                width: 96px;
                flex-shrink: 0;
                box-sizing: border-box;
            }
            .num-outlined * {
                box-sizing: border-box;
            }
            .num-outlined:focus-within {
                border-color: var(--ytsift-accent);
            }
            .num-outlined button {
                background: transparent;
                border: none;
                color: var(--ytsift-text-primary);
                width: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                padding: 0;
                transition: background 0.2s, color 0.2s;
            }
            .num-outlined button:hover {
                background: var(--ytsift-hover-bg);
                color: var(--ytsift-accent);
            }
            .num-outlined input {
                flex: 1;
                min-width: 0;
                text-align: center;
                background: transparent;
                border: none;
                border-left: 1px solid var(--ytsift-pop-border);
                border-right: 1px solid var(--ytsift-pop-border);
                color: var(--ytsift-text-primary);
                font-size: 12px;
                font-weight: 500;
                outline: none;
            }

            .popover-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 16px;
                padding-top: 12px;
                border-top: 1px solid var(--ytsift-pop-border);
            }

            .toggle-mode-btn {
                background: transparent;
                border: none;
                color: var(--ytsift-accent);
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                cursor: pointer;
                padding: 0;
                text-align: left;
            }
            .toggle-mode-btn:hover {
                opacity: 0.8;
            }

            .clear-filter-btn {
                background: transparent;
                border: none;
                color: var(--ytsift-accent);
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                cursor: pointer;
                padding: 0;
                text-align: right;
            }
            .clear-filter-btn:hover {
                opacity: 0.8;
            }

            ytd-rich-item-renderer.ytsift-hidden {
                display: none !important;
            }

            /* Settings styles */
            .ytsift-settings-btn {
                background: transparent;
                border: none;
                color: var(--ytsift-text-primary);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
            }
            .ytsift-settings-btn:hover {
                background-color: var(--ytsift-hover-bg);
            }
            .ytsift-settings-btn svg {
                width: 20px;
                height: 20px;
                fill: currentColor;
            }

            .ytsift-popover.right-align {
                left: auto;
                right: 0;
            }

            .settings-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid var(--ytsift-pop-border);
            }
            .settings-item:last-child {
                border-bottom: none;
            }
            .settings-label {
                font-size: 13px;
                color: var(--ytsift-text-primary);
            }
            .settings-desc {
                font-size: 11px;
                color: var(--ytsift-text-disabled);
                margin-top: 2px;
            }

            .toggle-switch {
                position: relative;
                width: 34px;
                height: 20px;
                background-color: var(--ytsift-text-disabled);
                border-radius: 10px;
                cursor: pointer;
                transition: background-color 0.2s;
                flex-shrink: 0;
            }
            .toggle-switch::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 16px;
                height: 16px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.2s;
            }
            .toggle-switch.active {
                background-color: var(--ytsift-accent, #3ea6ff);
            }
            .toggle-switch.active::after {
                transform: translateX(14px);
            }
        `);
	},
};

class BaseFilter {
	constructor() {
		this.active = false;
	}
	isActive() {
		return this.active;
	}
	reset() {
		this.active = false;
	}
	matches(_metadata) {
		return true;
	}
}

class TextFilter extends BaseFilter {
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

class WatchedFilter extends BaseFilter {
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

class DurationFilter extends BaseFilter {
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

class ViewsFilter extends BaseFilter {
	constructor() {
		super();
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
	}

	setRange(min, max) {
		this.min = min;
		this.max = max;
		this.active = min > 0 || max < Number.POSITIVE_INFINITY;
	}

	reset() {
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		return metadata.views >= this.min && metadata.views <= this.max;
	}
}

class AgeFilter extends BaseFilter {
	constructor() {
		super();
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
	}

	setRange(min, max) {
		this.min = min;
		this.max = max;
		this.active = min > 0 || max < Number.POSITIVE_INFINITY;
	}

	reset() {
		this.min = 0;
		this.max = Number.POSITIVE_INFINITY;
		this.active = false;
	}

	matches(metadata) {
		if (!this.isActive()) return true;
		const days = metadata.ageDays;
		return days >= this.min && days <= this.max;
	}
}

const State = {
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

const LANGUAGE_RULES = {
	en: {
		multipliers: [
			{ suffix: "billion", value: 1000000000 },
			{ suffix: "b", value: 1000000000 },
			{ suffix: "million", value: 1000000 },
			{ suffix: "m", value: 1000000 },
			{ suffix: "thousand", value: 1000 },
			{ suffix: "k", value: 1000 },
		],
		thousandSeparator: ",",
		decimalSeparator: ".",
	},
	pt: {
		multipliers: [
			{ suffix: "bilhão", value: 1000000000 },
			{ suffix: "bilhões", value: 1000000000 },
			{ suffix: "b", value: 1000000000 },
			{ suffix: "milhão", value: 1000000 },
			{ suffix: "milhões", value: 1000000 },
			{ suffix: "mi", value: 1000000 },
			{ suffix: "m", value: 1000000 },
			{ suffix: "mil", value: 1000 },
		],
		thousandSeparator: ".",
		decimalSeparator: ",",
	},
};

const DOMRenderer = {
	// SVG nodes created programmatically to comply with Trusted Types CSP
	createSvgIcon(pathD) {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", pathD);
		svg.appendChild(path);
		return svg;
	},

	createChip({ id, text, duration, pressed }) {
		const chip = document.createElement("button");
		chip.className = CONFIG.CLASSES.CHIP;
		if (duration) chip.classList.add(CONFIG.CLASSES.DURATION_CHIP);
		chip.id = id;
		chip.textContent = text;
		if (duration) chip.setAttribute("data-duration", duration);
		chip.setAttribute("aria-pressed", pressed ? "true" : "false");
		return chip;
	},
};

const DurationParser = {
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

const ViewsParser = {
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

const AgeParser = {
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

const DataModelResolver = {
	getCardData(card) {
		if (!card) return null;
		return card.data || card.__data || null;
	},

	getNestedValue(obj, path) {
		if (!obj || !path) return undefined;
		const parts = path.split(".");
		let current = obj;
		for (const part of parts) {
			if (current == null) return undefined;
			current = current[part];
		}
		return current;
	},

	getVideoTitle(data) {
		return (
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.title.content",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.title.content",
			)
		);
	},

	getVideoDuration(data) {
		const overlays =
			this.getNestedValue(
				data,
				"content.lockupViewModel.contentImage.thumbnailViewModel.overlays",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.contentImage.thumbnailViewModel.overlays",
			);
		if (Array.isArray(overlays)) {
			for (const overlay of overlays) {
				const timeStatus = overlay.thumbnailOverlayTimeStatusRenderer;
				if (timeStatus) {
					const content = this.getNestedValue(timeStatus, "text.content");
					if (content) return content;
				}
				const bottomOverlay = overlay.thumbnailBottomOverlayViewModel;
				if (bottomOverlay && Array.isArray(bottomOverlay.badges)) {
					for (const badge of bottomOverlay.badges) {
						const badgeModel = badge.thumbnailBadgeViewModel;
						if (badgeModel?.text) {
							return badgeModel.text;
						}
					}
				}
			}
		}
		return undefined;
	},

	getVideoWatchedPercent(data, card) {
		if (data) {
			const overlays =
				this.getNestedValue(
					data,
					"content.lockupViewModel.contentImage.thumbnailViewModel.overlays",
				) ||
				this.getNestedValue(
					data,
					"lockupViewModel.contentImage.thumbnailViewModel.overlays",
				);
			if (Array.isArray(overlays)) {
				for (const overlay of overlays) {
					const pb = this.getNestedValue(
						overlay,
						"thumbnailBottomOverlayViewModel.progressBar.thumbnailOverlayProgressBarViewModel",
					);
					if (pb && pb.startPercent !== undefined) {
						return pb.startPercent;
					}
					const renderer = overlay.thumbnailOverlayProgressBarRenderer;
					if (renderer && renderer.percentWatched !== undefined) {
						return renderer.percentWatched;
					}
				}
			}
		}
		// DOM fallback
		const pbEl = card.querySelector(
			"ytd-thumbnail-overlay-progress-bar-renderer, yt-thumbnail-overlay-progress-bar-view-model, [role='progressbar']",
		);
		if (pbEl) {
			const getPercentFromStyle = (el) => {
				const widthStr = el.style.width;
				if (widthStr?.includes("%")) {
					const match = widthStr.match(/(\d+(?:\.\d+)?)\s*%/);
					if (match) return Number.parseFloat(match[1]);
				}
				return null;
			};
			let p = getPercentFromStyle(pbEl);
			if (p === null) {
				const children = pbEl.querySelectorAll("*");
				for (const child of children) {
					p = getPercentFromStyle(child);
					if (p !== null) break;
				}
			}
			if (p !== null) return p;
			return 100; // Found progress bar but no style width, assume fully watched
		}
		return 0;
	},

	getVideoViewsPart(data) {
		const metadataParts = [];

		const partsA =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			);
		if (Array.isArray(partsA)) {
			metadataParts.push(...partsA);
		}

		const rowsB =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			);
		if (Array.isArray(rowsB)) {
			for (const row of rowsB) {
				if (Array.isArray(row.metadataParts)) {
					metadataParts.push(...row.metadataParts);
				}
			}
		}

		for (const part of metadataParts) {
			const text = this.getNestedValue(part, "text.content");
			const label = this.getNestedValue(
				part,
				"text.accessibility.accessibilityData.label",
			);
			const combined = `${text || ""} ${label || ""}`.toLowerCase();
			if (
				combined.includes("view") ||
				combined.includes("visualiza") ||
				combined.includes("vista") ||
				combined.includes("assist")
			) {
				return part;
			}
		}
		return undefined;
	},

	getVideoAgePart(data) {
		const metadataParts = [];

		const partsA =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			);
		if (Array.isArray(partsA)) {
			metadataParts.push(...partsA);
		}

		const rowsB =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			);
		if (Array.isArray(rowsB)) {
			for (const row of rowsB) {
				if (Array.isArray(row.metadataParts)) {
					metadataParts.push(...row.metadataParts);
				}
			}
		}

		for (const part of metadataParts) {
			const text = this.getNestedValue(part, "text.content");
			const label = this.getNestedValue(
				part,
				"text.accessibility.accessibilityData.label",
			);
			const combined = `${text || ""} ${label || ""}`.toLowerCase();
			if (
				combined.includes("ago") ||
				combined.includes("há ") ||
				combined.includes("minut") ||
				combined.includes("hour") ||
				combined.includes("hora") ||
				combined.includes("day") ||
				combined.includes("dia") ||
				combined.includes("week") ||
				combined.includes("semana") ||
				combined.includes("month") ||
				combined.includes("mês") ||
				combined.includes("meses") ||
				combined.includes("year") ||
				combined.includes("ano")
			) {
				return part;
			}
		}
		return undefined;
	},

	getVideoId(data, card) {
		if (data) {
			const path1 =
				"content.lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
			const path2 =
				"lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
			const path3 =
				"content.lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
			const path4 =
				"lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
			const id =
				this.getNestedValue(data, path1) ||
				this.getNestedValue(data, path2) ||
				this.getNestedValue(data, path3) ||
				this.getNestedValue(data, path4);
			if (id) return id;
		}

		// DOM fallback
		const anchor = card.querySelector("a[href*='/watch?v=']");
		if (anchor) {
			const href = anchor.getAttribute("href");
			const match = href.match(/[?&]v=([^&#]+)/);
			if (match) return match[1];
		}
		return null;
	},
};

const PopoverManager = {
	durationPopover: null,
	viewsPopover: null,
	watchedPopover: null,
	agePopover: null,
	settingsPopover: null,
	lastDurationClosedTime: 0,
	lastViewsClosedTime: 0,
	lastWatchedClosedTime: 0,
	lastAgeClosedTime: 0,
	lastSettingsClosedTime: 0,

	init() {
		if (this.durationPopover) return;

		this.durationPopover = document.createElement("div");
		this.durationPopover.id = "ytsift-duration-popover";
		this.durationPopover.className = "ytsift-popover";
		this.durationPopover.setAttribute("popover", "auto");
		this.durationPopover.addEventListener("beforetoggle", (e) => {
			if (e.newState === "open") {
				const trigger = document.getElementById("ytsift-chip-duration");
				if (trigger) {
					this.position(this.durationPopover, trigger);
				}
			}
			if (e.newState === "closed") {
				this.lastDurationClosedTime = Date.now();
			}
		});

		this.viewsPopover = document.createElement("div");
		this.viewsPopover.id = "ytsift-views-popover";
		this.viewsPopover.className = "ytsift-popover";
		this.viewsPopover.setAttribute("popover", "auto");
		this.viewsPopover.addEventListener("beforetoggle", (e) => {
			if (e.newState === "open") {
				const trigger = document.getElementById("ytsift-chip-views");
				if (trigger) {
					this.position(this.viewsPopover, trigger);
				}
			}
			if (e.newState === "closed") {
				this.lastViewsClosedTime = Date.now();
			}
		});

		this.watchedPopover = document.createElement("div");
		this.watchedPopover.id = "ytsift-watched-popover";
		this.watchedPopover.className = "ytsift-popover";
		this.watchedPopover.setAttribute("popover", "auto");
		this.watchedPopover.addEventListener("beforetoggle", (e) => {
			if (e.newState === "open") {
				const trigger = document.getElementById("ytsift-chip-watched");
				if (trigger) {
					this.position(this.watchedPopover, trigger);
				}
			}
			if (e.newState === "closed") {
				this.lastWatchedClosedTime = Date.now();
			}
		});

		this.agePopover = document.createElement("div");
		this.agePopover.id = "ytsift-age-popover";
		this.agePopover.className = "ytsift-popover";
		this.agePopover.setAttribute("popover", "auto");
		this.agePopover.addEventListener("beforetoggle", (e) => {
			if (e.newState === "open") {
				const trigger = document.getElementById("ytsift-chip-age");
				if (trigger) {
					this.position(this.agePopover, trigger);
				}
			}
			if (e.newState === "closed") {
				this.lastAgeClosedTime = Date.now();
			}
		});

		this.settingsPopover = document.createElement("div");
		this.settingsPopover.id = "ytsift-settings-popover";
		this.settingsPopover.className = "ytsift-popover right-align";
		this.settingsPopover.setAttribute("popover", "auto");
		this.settingsPopover.addEventListener("beforetoggle", (e) => {
			if (e.newState === "open") {
				const trigger = document.getElementById("ytsift-settings-btn");
				if (trigger) {
					this.position(this.settingsPopover, trigger);
				}
			}
			if (e.newState === "closed") {
				this.lastSettingsClosedTime = Date.now();
			}
		});

		document.body.appendChild(this.durationPopover);
		document.body.appendChild(this.viewsPopover);
		document.body.appendChild(this.watchedPopover);
		document.body.appendChild(this.agePopover);
		document.body.appendChild(this.settingsPopover);

		this.buildDurationContent();
		this.buildViewsContent();
		this.buildWatchedContent();
		this.buildAgeContent();
		this.buildSettingsContent();
	},

	position(popover, target) {
		const rect = target.getBoundingClientRect();
		popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
		popover.style.left = `${rect.left + window.scrollX}px`;
	},

	buildDurationContent() {
		const presetsRow = document.createElement("div");
		presetsRow.className = "segmented-control";

		const btnShort = document.createElement("button");
		btnShort.id = "ytsift-popover-preset-short";
		btnShort.className = "segmented-btn";
		btnShort.textContent = "< 4m";

		const btnMedium = document.createElement("button");
		btnMedium.id = "ytsift-popover-preset-medium";
		btnMedium.className = "segmented-btn";
		btnMedium.textContent = "4-20m";

		const btnLong = document.createElement("button");
		btnLong.id = "ytsift-popover-preset-long";
		btnLong.className = "segmented-btn";
		btnLong.textContent = "> 20m";

		presetsRow.appendChild(btnShort);
		presetsRow.appendChild(btnMedium);
		presetsRow.appendChild(btnLong);

		// Min Duration Slider
		const minContainer = document.createElement("div");
		minContainer.className = "slider-row";

		const minHeader = document.createElement("div");
		minHeader.className = "slider-header";
		const minLabel = document.createElement("span");
		minLabel.textContent = "Min Duration";
		const { wrapper: minValWrapper, input: minValInput } =
			this.createNumericInput("ytsift-popover-duration-min-val", 0, 0, 60, 1);
		minHeader.appendChild(minLabel);
		minHeader.appendChild(minValWrapper);

		const minSlider = document.createElement("input");
		minSlider.id = "ytsift-popover-duration-min-slider";
		minSlider.className = "ytsift-slider";
		minSlider.type = "range";
		minSlider.min = "0";
		minSlider.max = "60";
		minSlider.step = "1";
		minSlider.value = "0";

		minContainer.appendChild(minHeader);
		minContainer.appendChild(minSlider);

		// Max Duration Slider
		const maxContainer = document.createElement("div");
		maxContainer.className = "slider-row";

		const maxHeader = document.createElement("div");
		maxHeader.className = "slider-header";
		const maxLabel = document.createElement("span");
		maxLabel.textContent = "Max Duration";
		const { wrapper: maxValWrapper, input: maxValInput } =
			this.createNumericInput(
				"ytsift-popover-duration-max-val",
				120,
				0,
				120,
				1,
			);
		maxHeader.appendChild(maxLabel);
		maxHeader.appendChild(maxValWrapper);

		const maxSlider = document.createElement("input");
		maxSlider.id = "ytsift-popover-duration-max-slider";
		maxSlider.className = "ytsift-slider";
		maxSlider.type = "range";
		maxSlider.min = "0";
		maxSlider.max = "120"; // 120 represents Max (Infinity)
		maxSlider.step = "1";
		maxSlider.value = "120";

		maxContainer.appendChild(maxHeader);
		maxContainer.appendChild(maxSlider);

		this.durationPopover.appendChild(presetsRow);
		this.durationPopover.appendChild(minContainer);
		this.durationPopover.appendChild(maxContainer);

		// Footer (Clear Filter and Advanced Toggle)
		const footer = document.createElement("div");
		footer.className = "popover-footer";

		const toggleModeBtn = document.createElement("button");
		toggleModeBtn.className = "toggle-mode-btn";

		const clearBtn = document.createElement("button");
		clearBtn.className = "clear-filter-btn";
		clearBtn.textContent = "Clear Filter";

		footer.appendChild(toggleModeBtn);
		footer.appendChild(clearBtn);
		this.durationPopover.appendChild(footer);

		const applyMode = () => {
			if (Settings.durationAdvancedMode) {
				presetsRow.style.display = "none";
				minContainer.style.display = "flex";
				maxContainer.style.display = "flex";
				toggleModeBtn.textContent = "Presets";
				return;
			}
			presetsRow.style.display = "flex";
			minContainer.style.display = "none";
			maxContainer.style.display = "none";
			toggleModeBtn.textContent = "Advanced";
		};

		toggleModeBtn.addEventListener("click", () => {
			Settings.durationAdvancedMode = !Settings.durationAdvancedMode;
			Settings.save();
			applyMode();
		});

		applyMode();

		const updatePresetActiveClasses = (activePreset) => {
			btnShort.classList.toggle("active", activePreset === "short");
			btnMedium.classList.toggle("active", activePreset === "medium");
			btnLong.classList.toggle("active", activePreset === "long");
		};

		const updateUI = () => {
			const min = State.filters.duration.min;
			const max = State.filters.duration.max;

			minSlider.value = min.toString();
			minValInput.value = min.toString();
			this.updateTrack(minSlider);

			if (max === Number.POSITIVE_INFINITY) {
				maxSlider.value = "120";
				maxValInput.value = "120";
				this.updateTrack(maxSlider);
				return;
			}
			maxSlider.value = max.toString();
			maxValInput.value = max.toString();
			this.updateTrack(maxSlider);
		};

		const handlePresetClick = (preset) => {
			const isCurrent = State.filters.duration.preset === preset;
			if (isCurrent) {
				State.filters.duration.reset();
				updateUI();
				updatePresetActiveClasses(State.filters.duration.preset);
				UIBuilder.updateDurationChipText();
				FilterEngine.apply();
				return;
			}

			let min = 0;
			let max = Number.POSITIVE_INFINITY;
			if (preset === "short") {
				min = 0;
				max = 4;
			}
			if (preset === "medium") {
				min = 4;
				max = 20;
			}
			if (preset === "long") {
				min = 20;
				max = Number.POSITIVE_INFINITY;
			}
			State.filters.duration.setRange(min, max, preset);
			updateUI();
			updatePresetActiveClasses(State.filters.duration.preset);
			UIBuilder.updateDurationChipText();
			FilterEngine.apply();

			// Auto-dismiss
			try {
				this.durationPopover.hidePopover();
			} catch {
				this.durationPopover.style.display = "none";
			}
		};

		btnShort.addEventListener("click", () => handlePresetClick("short"));
		btnMedium.addEventListener("click", () => handlePresetClick("medium"));
		btnLong.addEventListener("click", () => handlePresetClick("long"));

		const handleSliderChange = () => {
			let min = Number.parseInt(minSlider.value, 10);
			const max = Number.parseInt(maxSlider.value, 10);

			if (max !== 120 && min > max) {
				min = max;
				minSlider.value = min.toString();
			}

			const limitMax = max === 120 ? Number.POSITIVE_INFINITY : max;

			let preset = "custom";
			if (min === 0 && limitMax === 4) {
				preset = "short";
			}
			if (min === 4 && limitMax === 20) {
				preset = "medium";
			}
			if (min === 20 && limitMax === Number.POSITIVE_INFINITY) {
				preset = "long";
			}
			State.filters.duration.setRange(min, limitMax, preset);

			updateUI();
			updatePresetActiveClasses(State.filters.duration.preset);
			UIBuilder.updateDurationChipText();
			FilterEngine.apply();
		};

		minSlider.addEventListener("input", handleSliderChange);
		maxSlider.addEventListener("input", handleSliderChange);

		// Bidirectional sync for min number input
		minValInput.addEventListener("input", () => {
			let val = Number.parseInt(minValInput.value, 10);
			if (Number.isNaN(val)) return;
			if (val < 0) val = 0;
			if (val > 60) val = 60;

			const maxVal = Number.parseInt(maxSlider.value, 10);
			if (maxVal !== 120 && val > maxVal) {
				val = maxVal;
				minValInput.value = val.toString();
			}

			minSlider.value = val.toString();
			this.updateTrack(minSlider);

			const limitMax = maxVal === 120 ? Number.POSITIVE_INFINITY : maxVal;
			State.filters.duration.setRange(val, limitMax, "custom");
			updatePresetActiveClasses(State.filters.duration.preset);
			UIBuilder.updateDurationChipText();
			FilterEngine.apply();
		});

		// Bidirectional sync for max number input
		maxValInput.addEventListener("input", () => {
			let val = Number.parseInt(maxValInput.value, 10);
			if (Number.isNaN(val)) return;
			if (val < 0) val = 0;
			if (val > 120) val = 120;

			const minVal = Number.parseInt(minSlider.value, 10);
			if (val < minVal) {
				val = minVal;
				maxValInput.value = val.toString();
			}

			maxSlider.value = val.toString();
			this.updateTrack(maxSlider);

			const limitMax = val === 120 ? Number.POSITIVE_INFINITY : val;
			State.filters.duration.setRange(minVal, limitMax, "custom");
			updatePresetActiveClasses(State.filters.duration.preset);
			UIBuilder.updateDurationChipText();
			FilterEngine.apply();
		});

		clearBtn.addEventListener("click", () => {
			State.filters.duration.reset();
			updateUI();
			updatePresetActiveClasses(State.filters.duration.preset);
			UIBuilder.updateDurationChipText();
			FilterEngine.apply();
		});
	},

	buildViewsContent() {
		const VIEW_STEPS = [
			0,
			100,
			500,
			1000,
			2000,
			5000,
			10000,
			20000,
			50000,
			100000,
			200000,
			500000,
			1000000,
			2000000,
			5000000,
			10000000,
			Number.POSITIVE_INFINITY,
		];

		const minContainer = document.createElement("div");
		minContainer.className = "slider-row";

		const minHeader = document.createElement("div");
		minHeader.className = "slider-header";
		const minLabel = document.createElement("span");
		minLabel.textContent = "Min Views";
		const { wrapper: minValWrapper, input: minValInput } =
			this.createNumericInput("ytsift-popover-views-min-val", 0, 0, null, 1000);
		minHeader.appendChild(minLabel);
		minHeader.appendChild(minValWrapper);

		const minSlider = document.createElement("input");
		minSlider.id = "ytsift-popover-views-min-slider";
		minSlider.className = "ytsift-slider";
		minSlider.type = "range";
		minSlider.min = "0";
		minSlider.max = (VIEW_STEPS.length - 1).toString();
		minSlider.step = "1";
		minSlider.value = "0";

		minContainer.appendChild(minHeader);
		minContainer.appendChild(minSlider);

		const maxContainer = document.createElement("div");
		maxContainer.className = "slider-row";

		const maxHeader = document.createElement("div");
		maxHeader.className = "slider-header";
		const maxLabel = document.createElement("span");
		maxLabel.textContent = "Max Views";
		const { wrapper: maxValWrapper, input: maxValInput } =
			this.createNumericInput(
				"ytsift-popover-views-max-val",
				"",
				0,
				null,
				1000,
			);
		maxHeader.appendChild(maxLabel);
		maxHeader.appendChild(maxValWrapper);

		const maxSlider = document.createElement("input");
		maxSlider.id = "ytsift-popover-views-max-slider";
		maxSlider.className = "ytsift-slider";
		maxSlider.type = "range";
		maxSlider.min = "0";
		maxSlider.max = (VIEW_STEPS.length - 1).toString();
		maxSlider.step = "1";
		maxSlider.value = (VIEW_STEPS.length - 1).toString();

		maxContainer.appendChild(maxHeader);
		maxContainer.appendChild(maxSlider);

		this.viewsPopover.appendChild(minContainer);
		this.viewsPopover.appendChild(maxContainer);

		const updateUI = () => {
			const minVal = State.filters.views.min;
			const maxVal = State.filters.views.max;

			const minIndex =
				VIEW_STEPS.indexOf(minVal) !== -1 ? VIEW_STEPS.indexOf(minVal) : 0;
			const maxIndex =
				VIEW_STEPS.indexOf(maxVal) !== -1
					? VIEW_STEPS.indexOf(maxVal)
					: VIEW_STEPS.length - 1;

			minSlider.value = minIndex.toString();
			maxSlider.value = maxIndex.toString();

			minValInput.value =
				minVal === Number.POSITIVE_INFINITY ? "" : minVal.toString();
			maxValInput.value =
				maxVal === Number.POSITIVE_INFINITY ? "" : maxVal.toString();

			this.updateTrack(minSlider);
			this.updateTrack(maxSlider);
		};

		const handleSliderChange = () => {
			let minIndex = Number.parseInt(minSlider.value, 10);
			const maxIndex = Number.parseInt(maxSlider.value, 10);

			if (minIndex > maxIndex) {
				minIndex = maxIndex;
				minSlider.value = minIndex.toString();
			}

			const minVal = VIEW_STEPS[minIndex];
			const maxVal = VIEW_STEPS[maxIndex];

			minValInput.value =
				minVal === Number.POSITIVE_INFINITY ? "" : minVal.toString();
			maxValInput.value =
				maxVal === Number.POSITIVE_INFINITY ? "" : maxVal.toString();

			this.updateTrack(minSlider);
			this.updateTrack(maxSlider);

			State.filters.views.setRange(minVal, maxVal);
			UIBuilder.updateViewsChipText();
			FilterEngine.apply();
		};

		minSlider.addEventListener("input", handleSliderChange);
		maxSlider.addEventListener("input", handleSliderChange);

		// Bidirectional sync for min views input
		minValInput.addEventListener("input", () => {
			let val = Number.parseInt(minValInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = 0;
			}
			const minIndex = this.findClosestIndex(val, VIEW_STEPS);
			minSlider.value = minIndex.toString();
			this.updateTrack(minSlider);

			const maxVal = State.filters.views.max;
			State.filters.views.setRange(val, maxVal);
			UIBuilder.updateViewsChipText();
			FilterEngine.apply();
		});

		// Bidirectional sync for max views input
		maxValInput.addEventListener("input", () => {
			let val = Number.parseInt(maxValInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = Number.POSITIVE_INFINITY;
			}
			const maxIndex = this.findClosestIndex(val, VIEW_STEPS);
			maxSlider.value = maxIndex.toString();
			this.updateTrack(maxSlider);

			const minVal = State.filters.views.min;
			State.filters.views.setRange(minVal, val);
			UIBuilder.updateViewsChipText();
			FilterEngine.apply();
		});

		// Add Clear Filter Button
		const footer = document.createElement("div");
		footer.className = "popover-footer";

		const clearBtn = document.createElement("button");
		clearBtn.className = "clear-filter-btn";
		clearBtn.textContent = "Clear Filter";
		clearBtn.addEventListener("click", () => {
			State.filters.views.reset();
			updateUI();
			UIBuilder.updateViewsChipText();
			FilterEngine.apply();
		});
		footer.appendChild(document.createElement("div"));
		footer.appendChild(clearBtn);
		this.viewsPopover.appendChild(footer);
	},

	buildWatchedContent() {
		const presetsRow = document.createElement("div");
		presetsRow.className = "segmented-control";

		const btnAll = document.createElement("button");
		btnAll.id = "ytsift-popover-watched-all";
		btnAll.className = "segmented-btn active";
		btnAll.textContent = "All";

		const btnUnwatched = document.createElement("button");
		btnUnwatched.id = "ytsift-popover-watched-unwatched";
		btnUnwatched.className = "segmented-btn";
		btnUnwatched.textContent = "Unwatched";

		const btnWatched = document.createElement("button");
		btnWatched.id = "ytsift-popover-watched-watched";
		btnWatched.className = "segmented-btn";
		btnWatched.textContent = "Watched";

		presetsRow.appendChild(btnAll);
		presetsRow.appendChild(btnUnwatched);
		presetsRow.appendChild(btnWatched);

		const sliderContainer = document.createElement("div");
		sliderContainer.className = "slider-row";

		const sliderHeader = document.createElement("div");
		sliderHeader.className = "slider-header";

		const sliderLabel = document.createElement("span");
		sliderLabel.textContent = "Threshold";

		const { wrapper: watchedValWrapper, input: watchedValInput } =
			this.createNumericInput("ytsift-popover-watched-value", 10, 0, 100, 5);

		sliderHeader.appendChild(sliderLabel);
		sliderHeader.appendChild(watchedValWrapper);

		const slider = document.createElement("input");
		slider.id = "ytsift-popover-watched-slider";
		slider.className = "ytsift-slider";
		slider.type = "range";
		slider.min = "0";
		slider.max = "100";
		slider.step = "5";
		slider.value = "10";

		sliderContainer.appendChild(sliderHeader);
		sliderContainer.appendChild(slider);

		this.watchedPopover.appendChild(presetsRow);
		this.watchedPopover.appendChild(sliderContainer);

		const updateUI = () => {
			const currentType = State.filters.watched.type;
			const currentPercent = State.filters.watched.percent;

			btnAll.classList.toggle("active", currentType === "all");
			btnUnwatched.classList.toggle("active", currentType === "unwatched");
			btnWatched.classList.toggle("active", currentType === "watched");

			slider.value = currentPercent.toString();
			watchedValInput.value = currentPercent.toString();
			this.updateTrack(slider);

			if (currentType === "all") {
				sliderContainer.style.opacity = "0.5";
				slider.disabled = true;
				watchedValInput.disabled = true;
				return;
			}
			sliderContainer.style.opacity = "1";
			slider.disabled = false;
			watchedValInput.disabled = false;
		};

		const handleTypeClick = (type) => {
			State.filters.watched.setCriteria(
				type,
				Number.parseInt(slider.value, 10),
			);
			updateUI();
			UIBuilder.updateWatchedChipText();
			FilterEngine.apply();

			// Auto-dismiss for unwatched/watched presets
			if (type !== "all") {
				try {
					this.watchedPopover.hidePopover();
				} catch {
					this.watchedPopover.style.display = "none";
				}
			}
		};

		btnAll.addEventListener("click", () => handleTypeClick("all"));
		btnUnwatched.addEventListener("click", () => handleTypeClick("unwatched"));
		btnWatched.addEventListener("click", () => handleTypeClick("watched"));

		slider.addEventListener("input", () => {
			const percent = Number.parseInt(slider.value, 10);
			watchedValInput.value = percent.toString();
			this.updateTrack(slider);
			if (State.filters.watched.type !== "all") {
				State.filters.watched.setCriteria(State.filters.watched.type, percent);
				UIBuilder.updateWatchedChipText();
				FilterEngine.apply();
			}
		});

		// Bidirectional sync for watched input value
		watchedValInput.addEventListener("input", () => {
			let percent = Number.parseInt(watchedValInput.value, 10);
			if (Number.isNaN(percent) || percent < 0) {
				percent = 0;
			}
			if (percent > 100) {
				percent = 100;
			}

			slider.value = percent.toString();
			this.updateTrack(slider);
			if (State.filters.watched.type !== "all") {
				State.filters.watched.setCriteria(State.filters.watched.type, percent);
				UIBuilder.updateWatchedChipText();
				FilterEngine.apply();
			}
		});

		// Add Clear Filter Button
		const footer = document.createElement("div");
		footer.className = "popover-footer";

		const clearBtn = document.createElement("button");
		clearBtn.className = "clear-filter-btn";
		clearBtn.textContent = "Clear Filter";
		clearBtn.addEventListener("click", () => {
			State.filters.watched.reset();
			updateUI();
			UIBuilder.updateWatchedChipText();
			FilterEngine.apply();
		});
		footer.appendChild(document.createElement("div"));
		footer.appendChild(clearBtn);
		this.watchedPopover.appendChild(footer);
	},

	buildAgeContent() {
		const AGE_STEPS = [
			0,
			1,
			2,
			3,
			5,
			7,
			14,
			30,
			90,
			180,
			365,
			730,
			1095,
			Number.POSITIVE_INFINITY,
		];

		const minContainer = document.createElement("div");
		minContainer.className = "slider-row";

		const minHeader = document.createElement("div");
		minHeader.className = "slider-header";
		const minLabel = document.createElement("span");
		minLabel.textContent = "Min Age";
		const { wrapper: minValWrapper, input: minValInput } =
			this.createNumericInput("ytsift-popover-age-min-val", 0, 0, null, 1);
		minHeader.appendChild(minLabel);
		minHeader.appendChild(minValWrapper);

		const minSlider = document.createElement("input");
		minSlider.id = "ytsift-popover-age-min-slider";
		minSlider.className = "ytsift-slider";
		minSlider.type = "range";
		minSlider.min = "0";
		minSlider.max = (AGE_STEPS.length - 1).toString();
		minSlider.step = "1";
		minSlider.value = "0";

		minContainer.appendChild(minHeader);
		minContainer.appendChild(minSlider);

		const maxContainer = document.createElement("div");
		maxContainer.className = "slider-row";

		const maxHeader = document.createElement("div");
		maxHeader.className = "slider-header";
		const maxLabel = document.createElement("span");
		maxLabel.textContent = "Max Age";
		const { wrapper: maxValWrapper, input: maxValInput } =
			this.createNumericInput("ytsift-popover-age-max-val", "", 0, null, 1);
		maxHeader.appendChild(maxLabel);
		maxHeader.appendChild(maxValWrapper);

		const maxSlider = document.createElement("input");
		maxSlider.id = "ytsift-popover-age-max-slider";
		maxSlider.className = "ytsift-slider";
		maxSlider.type = "range";
		maxSlider.min = "0";
		maxSlider.max = (AGE_STEPS.length - 1).toString();
		maxSlider.step = "1";
		maxSlider.value = (AGE_STEPS.length - 1).toString();

		maxContainer.appendChild(maxHeader);
		maxContainer.appendChild(maxSlider);

		this.agePopover.appendChild(minContainer);
		this.agePopover.appendChild(maxContainer);

		const updateUI = () => {
			const minVal = State.filters.age.min;
			const maxVal = State.filters.age.max;

			const minIndex =
				AGE_STEPS.indexOf(minVal) !== -1 ? AGE_STEPS.indexOf(minVal) : 0;
			const maxIndex =
				AGE_STEPS.indexOf(maxVal) !== -1
					? AGE_STEPS.indexOf(maxVal)
					: AGE_STEPS.length - 1;

			minSlider.value = minIndex.toString();
			maxSlider.value = maxIndex.toString();

			minValInput.value =
				minVal === Number.POSITIVE_INFINITY ? "" : minVal.toString();
			maxValInput.value =
				maxVal === Number.POSITIVE_INFINITY ? "" : maxVal.toString();

			this.updateTrack(minSlider);
			this.updateTrack(maxSlider);
		};

		const handleSliderChange = () => {
			let minIndex = Number.parseInt(minSlider.value, 10);
			const maxIndex = Number.parseInt(maxSlider.value, 10);

			if (minIndex > maxIndex) {
				minIndex = maxIndex;
				minSlider.value = minIndex.toString();
			}

			const minVal = AGE_STEPS[minIndex];
			const maxVal = AGE_STEPS[maxIndex];

			minValInput.value =
				minVal === Number.POSITIVE_INFINITY ? "" : minVal.toString();
			maxValInput.value =
				maxVal === Number.POSITIVE_INFINITY ? "" : maxVal.toString();

			this.updateTrack(minSlider);
			this.updateTrack(maxSlider);

			State.filters.age.setRange(minVal, maxVal);
			UIBuilder.updateAgeChipText();
			FilterEngine.apply();
		};

		minSlider.addEventListener("input", handleSliderChange);
		maxSlider.addEventListener("input", handleSliderChange);

		// Bidirectional sync for min age input
		minValInput.addEventListener("input", () => {
			let val = Number.parseInt(minValInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = 0;
			}
			const minIndex = this.findClosestIndex(val, AGE_STEPS);
			minSlider.value = minIndex.toString();
			this.updateTrack(minSlider);

			const maxVal = State.filters.age.max;
			State.filters.age.setRange(val, maxVal);
			UIBuilder.updateAgeChipText();
			FilterEngine.apply();
		});

		// Bidirectional sync for max age input
		maxValInput.addEventListener("input", () => {
			let val = Number.parseInt(maxValInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = Number.POSITIVE_INFINITY;
			}
			const maxIndex = this.findClosestIndex(val, AGE_STEPS);
			maxSlider.value = maxIndex.toString();
			this.updateTrack(maxSlider);

			const minVal = State.filters.age.min;
			State.filters.age.setRange(minVal, val);
			UIBuilder.updateAgeChipText();
			FilterEngine.apply();
		});

		// Add Clear Filter Button
		const footer = document.createElement("div");
		footer.className = "popover-footer";

		const clearBtn = document.createElement("button");
		clearBtn.className = "clear-filter-btn";
		clearBtn.textContent = "Clear Filter";
		clearBtn.addEventListener("click", () => {
			State.filters.age.reset();
			updateUI();
			UIBuilder.updateAgeChipText();
			FilterEngine.apply();
		});
		footer.appendChild(document.createElement("div"));
		footer.appendChild(clearBtn);
		this.agePopover.appendChild(footer);
	},

	findClosestIndex(val, steps) {
		let closestIdx = 0;
		let minDiff = Number.POSITIVE_INFINITY;
		for (let i = 0; i < steps.length; i++) {
			const stepVal = steps[i];
			const diff = Math.abs(
				(stepVal === Number.POSITIVE_INFINITY ? 999999999 : stepVal) - val,
			);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		}
		return closestIdx;
	},

	updateTrack(slider) {
		if (!slider) return;
		const min = Number.parseFloat(slider.min) || 0;
		const max = Number.parseFloat(slider.max) || 100;
		const val = Number.parseFloat(slider.value) || 0;
		const pct = ((val - min) / (max - min)) * 100;
		slider.style.setProperty("--slider-progress", `${pct}%`);
	},

	updateDurationInputs(min, max) {
		const minSlider = this.durationPopover.querySelector(
			"#ytsift-popover-duration-min-slider",
		);
		const maxSlider = this.durationPopover.querySelector(
			"#ytsift-popover-duration-max-slider",
		);
		const minValInput = this.durationPopover.querySelector(
			"#ytsift-popover-duration-min-val",
		);
		const maxValInput = this.durationPopover.querySelector(
			"#ytsift-popover-duration-max-val",
		);

		const btnShort = this.durationPopover.querySelector(
			"#ytsift-popover-preset-short",
		);
		const btnMedium = this.durationPopover.querySelector(
			"#ytsift-popover-preset-medium",
		);
		const btnLong = this.durationPopover.querySelector(
			"#ytsift-popover-preset-long",
		);

		const activePreset = State.filters.duration.preset;
		if (btnShort) btnShort.classList.toggle("active", activePreset === "short");
		if (btnMedium)
			btnMedium.classList.toggle("active", activePreset === "medium");
		if (btnLong) btnLong.classList.toggle("active", activePreset === "long");

		if (minSlider) {
			minSlider.value = min === "" ? "0" : min.toString();
			this.updateTrack(minSlider);
		}
		if (minValInput) minValInput.value = min === "" ? "0" : min.toString();

		if (maxSlider) {
			maxSlider.value =
				max === Number.POSITIVE_INFINITY || max === "" ? "120" : max.toString();
			this.updateTrack(maxSlider);
		}
		if (maxValInput) {
			maxValInput.value =
				max === Number.POSITIVE_INFINITY || max === "" ? "120" : max.toString();
		}
	},

	updateViewsInputs(min, max) {
		const VIEW_STEPS = [
			0,
			100,
			500,
			1000,
			2000,
			5000,
			10000,
			20000,
			50000,
			100000,
			200000,
			500000,
			1000000,
			2000000,
			5000000,
			10000000,
			Number.POSITIVE_INFINITY,
		];

		const minSlider = this.viewsPopover.querySelector(
			"#ytsift-popover-views-min-slider",
		);
		const maxSlider = this.viewsPopover.querySelector(
			"#ytsift-popover-views-max-slider",
		);
		const minValInput = this.viewsPopover.querySelector(
			"#ytsift-popover-views-min-val",
		);
		const maxValInput = this.viewsPopover.querySelector(
			"#ytsift-popover-views-max-val",
		);

		const actualMin = min === "" ? 0 : min;
		const actualMax = max === "" ? Number.POSITIVE_INFINITY : max;

		let minIndex = VIEW_STEPS.indexOf(actualMin);
		if (minIndex === -1) minIndex = 0;

		let maxIndex = VIEW_STEPS.indexOf(actualMax);
		if (maxIndex === -1) maxIndex = VIEW_STEPS.length - 1;

		if (minSlider) {
			minSlider.value = minIndex.toString();
			this.updateTrack(minSlider);
		}
		if (minValInput) {
			minValInput.value =
				actualMin === Number.POSITIVE_INFINITY ? "" : actualMin.toString();
		}

		if (maxSlider) {
			maxSlider.value = maxIndex.toString();
			this.updateTrack(maxSlider);
		}
		if (maxValInput) {
			maxValInput.value =
				actualMax === Number.POSITIVE_INFINITY ? "" : actualMax.toString();
		}
	},

	updateWatchedInputs(type, percent) {
		const slider = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-slider",
		);
		const watchedValInput = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-value",
		);
		const btnAll = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-all",
		);
		const btnUnwatched = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-unwatched",
		);
		const btnWatched = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-watched",
		);
		const sliderContainer = this.watchedPopover.querySelector(".slider-row");

		if (slider) {
			slider.value = percent.toString();
			this.updateTrack(slider);
		}
		if (watchedValInput) watchedValInput.value = percent.toString();

		if (btnAll) btnAll.classList.toggle("active", type === "all");
		if (btnUnwatched)
			btnUnwatched.classList.toggle("active", type === "unwatched");
		if (btnWatched) btnWatched.classList.toggle("active", type === "watched");

		if (sliderContainer) {
			const isAll = type === "all";
			sliderContainer.style.opacity = isAll ? "0.5" : "1";
			if (slider) slider.disabled = isAll;
		}
	},

	updateAgeInputs(min, max) {
		const AGE_STEPS = [
			0,
			1,
			2,
			3,
			5,
			7,
			14,
			30,
			90,
			180,
			365,
			730,
			1095,
			Number.POSITIVE_INFINITY,
		];

		const minSlider = this.agePopover.querySelector(
			"#ytsift-popover-age-min-slider",
		);
		const maxSlider = this.agePopover.querySelector(
			"#ytsift-popover-age-max-slider",
		);
		const minValInput = this.agePopover.querySelector(
			"#ytsift-popover-age-min-val",
		);
		const maxValInput = this.agePopover.querySelector(
			"#ytsift-popover-age-max-val",
		);

		const actualMin = min === "" ? 0 : min;
		const actualMax = max === "" ? Number.POSITIVE_INFINITY : max;

		let minIndex = AGE_STEPS.indexOf(actualMin);
		if (minIndex === -1) minIndex = 0;

		let maxIndex = AGE_STEPS.indexOf(actualMax);
		if (maxIndex === -1) maxIndex = AGE_STEPS.length - 1;

		if (minSlider) {
			minSlider.value = minIndex.toString();
			this.updateTrack(minSlider);
		}
		if (minValInput) {
			minValInput.value =
				actualMin === Number.POSITIVE_INFINITY ? "" : actualMin.toString();
		}

		if (maxSlider) {
			maxSlider.value = maxIndex.toString();
			this.updateTrack(maxSlider);
		}
		if (maxValInput) {
			maxValInput.value =
				actualMax === Number.POSITIVE_INFINITY ? "" : actualMax.toString();
		}
	},

	showDuration(target) {
		this.position(this.durationPopover, target);
		try {
			this.durationPopover.showPopover();
		} catch {
			this.durationPopover.style.display = "block";
		}
	},

	showViews(target) {
		this.position(this.viewsPopover, target);
		try {
			this.viewsPopover.showPopover();
		} catch {
			this.viewsPopover.style.display = "block";
		}
	},

	showWatched(target) {
		this.position(this.watchedPopover, target);
		try {
			this.watchedPopover.showPopover();
		} catch {
			this.watchedPopover.style.display = "block";
		}
	},

	showAge(target) {
		this.position(this.agePopover, target);
		try {
			this.agePopover.showPopover();
		} catch {
			this.agePopover.style.display = "block";
		}
	},

	showSettings(target) {
		this.position(this.settingsPopover, target);
		try {
			this.settingsPopover.showPopover();
		} catch {
			this.settingsPopover.style.display = "block";
		}
	},

	isDurationOpen() {
		return (
			this.durationPopover &&
			(this.durationPopover.matches(":popover-open") ||
				this.durationPopover.style.display === "block")
		);
	},

	isViewsOpen() {
		return (
			this.viewsPopover &&
			(this.viewsPopover.matches(":popover-open") ||
				this.viewsPopover.style.display === "block")
		);
	},

	isWatchedOpen() {
		return (
			this.watchedPopover &&
			(this.watchedPopover.matches(":popover-open") ||
				this.watchedPopover.style.display === "block")
		);
	},

	isAgeOpen() {
		return (
			this.agePopover &&
			(this.agePopover.matches(":popover-open") ||
				this.agePopover.style.display === "block")
		);
	},

	isSettingsOpen() {
		return (
			this.settingsPopover &&
			(this.settingsPopover.matches(":popover-open") ||
				this.settingsPopover.style.display === "block")
		);
	},

	createNumericInput(id, value, min, max, step) {
		const wrapper = document.createElement("div");
		wrapper.className = "num-outlined";

		const btnDec = document.createElement("button");
		btnDec.type = "button";
		btnDec.className = "btn-dec";
		btnDec.setAttribute("aria-label", "Decrease");
		btnDec.textContent = "－";

		const input = document.createElement("input");
		input.type = "number";
		input.id = id;
		input.className = "number-input";
		input.value = value.toString();
		if (min !== undefined && min !== null) {
			input.setAttribute("min", min.toString());
		}
		if (max !== undefined && max !== null) {
			input.setAttribute("max", max.toString());
		}
		if (step !== undefined && step !== null) {
			input.setAttribute("step", step.toString());
		}

		const btnInc = document.createElement("button");
		btnInc.type = "button";
		btnInc.className = "btn-inc";
		btnInc.setAttribute("aria-label", "Increase");
		btnInc.textContent = "＋";

		wrapper.appendChild(btnDec);
		wrapper.appendChild(input);
		wrapper.appendChild(btnInc);

		const updateValue = (amount) => {
			const minValue = input.hasAttribute("min")
				? Number.parseFloat(input.getAttribute("min") || "0")
				: Number.NEGATIVE_INFINITY;
			const maxValue = input.hasAttribute("max")
				? Number.parseFloat(input.getAttribute("max") || "0")
				: Number.POSITIVE_INFINITY;
			const stepValue = input.hasAttribute("step")
				? Number.parseFloat(input.getAttribute("step") || "1")
				: 1;

			const currentValue = Number.parseFloat(input.value) || 0;
			let newValue = currentValue + amount * stepValue;

			if (newValue < minValue) {
				newValue = minValue;
			}
			if (newValue > maxValue) {
				newValue = maxValue;
			}

			const decimals = (stepValue.toString().split(".")[1] || "").length;
			input.value = newValue.toFixed(decimals);

			input.dispatchEvent(new Event("input", { bubbles: true }));
		};

		btnDec.addEventListener("click", () => updateValue(-1));
		btnInc.addEventListener("click", () => updateValue(1));

		input.addEventListener("blur", () => {
			const minValue = input.hasAttribute("min")
				? Number.parseFloat(input.getAttribute("min") || "0")
				: Number.NEGATIVE_INFINITY;
			const maxValue = input.hasAttribute("max")
				? Number.parseFloat(input.getAttribute("max") || "0")
				: Number.POSITIVE_INFINITY;
			let val = Number.parseFloat(input.value);

			if (Number.isNaN(val)) {
				val = minValue !== Number.NEGATIVE_INFINITY ? minValue : 0;
			}
			if (val < minValue) {
				val = minValue;
			}
			if (val > maxValue) {
				val = maxValue;
			}

			input.value = val.toString();
			input.dispatchEvent(new Event("input", { bubbles: true }));
		});

		return { wrapper, input };
	},

	buildSettingsContent() {
		const container = document.createElement("div");
		container.className = "ytsift-popover-settings-container";

		// 1. Queue Throttle Setting
		const throttleRow = document.createElement("div");
		throttleRow.className = "settings-item";

		const throttleInfo = document.createElement("div");
		const throttleLabel = document.createElement("div");
		throttleLabel.className = "settings-label";
		throttleLabel.textContent = "Queue Delay (ms)";
		const throttleDesc = document.createElement("div");
		throttleDesc.className = "settings-desc";
		throttleDesc.textContent = "Delay between queue additions";
		throttleInfo.appendChild(throttleLabel);
		throttleInfo.appendChild(throttleDesc);

		const { wrapper: throttleWrapper, input: throttleInput } =
			this.createNumericInput(
				"setting-throttle",
				Settings.queueThrottle,
				0,
				null,
				50,
			);

		throttleInput.addEventListener("input", () => {
			let val = Number.parseInt(throttleInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = 0;
			}
			Settings.queueThrottle = val;
			Settings.save();
		});

		throttleRow.appendChild(throttleInfo);
		throttleRow.appendChild(throttleWrapper);
		container.appendChild(throttleRow);

		// 2. Scroll Request Delay Setting
		const requestRow = document.createElement("div");
		requestRow.className = "settings-item";

		const requestInfo = document.createElement("div");
		const requestLabel = document.createElement("div");
		requestLabel.className = "settings-label";
		requestLabel.textContent = "Scroll Request Delay (ms)";
		const requestDesc = document.createElement("div");
		requestDesc.className = "settings-desc";
		requestDesc.textContent = "Delay between network fetch requests";
		requestInfo.appendChild(requestLabel);
		requestInfo.appendChild(requestDesc);

		const { wrapper: requestWrapper, input: requestInput } =
			this.createNumericInput(
				"setting-request-throttle",
				Settings.requestThrottle,
				0,
				null,
				100,
			);

		requestInput.addEventListener("input", () => {
			let val = Number.parseInt(requestInput.value, 10);
			if (Number.isNaN(val) || val < 0) {
				val = 0;
			}
			Settings.requestThrottle = val;
			Settings.save();
		});

		requestRow.appendChild(requestInfo);
		requestRow.appendChild(requestWrapper);
		container.appendChild(requestRow);

		// 3. Watched Threshold Setting
		const watchedRow = document.createElement("div");
		watchedRow.className = "settings-item";

		const watchedInfo = document.createElement("div");
		const watchedLabel = document.createElement("div");
		watchedLabel.className = "settings-label";
		watchedLabel.textContent = "Watched Threshold (%)";
		const watchedDesc = document.createElement("div");
		watchedDesc.className = "settings-desc";
		watchedDesc.textContent = "Minimum watched percentage to hide/show";
		watchedInfo.appendChild(watchedLabel);
		watchedInfo.appendChild(watchedDesc);

		const { wrapper: watchedWrapper, input: watchedInput } =
			this.createNumericInput(
				"setting-watched",
				Settings.defaultWatched,
				1,
				100,
				1,
			);

		watchedInput.addEventListener("input", () => {
			let val = Number.parseInt(watchedInput.value, 10);
			if (Number.isNaN(val) || val < 1) {
				val = 1;
			}
			if (val > 100) {
				val = 100;
			}
			Settings.defaultWatched = val;
			Settings.save();
		});

		watchedRow.appendChild(watchedInfo);
		watchedRow.appendChild(watchedWrapper);
		container.appendChild(watchedRow);

		// Helper to create toggle switches
		const createToggleRow = (labelText, descText, key, onToggle) => {
			const row = document.createElement("div");
			row.className = "settings-item";

			const info = document.createElement("div");
			const label = document.createElement("div");
			label.className = "settings-label";
			label.textContent = labelText;
			const desc = document.createElement("div");
			desc.className = "settings-desc";
			desc.textContent = descText;
			info.appendChild(label);
			info.appendChild(desc);

			const toggle = document.createElement("div");
			toggle.className = `toggle-switch${Settings[key] ? " active" : ""}`;
			toggle.addEventListener("click", () => {
				const active = !toggle.classList.contains("active");
				toggle.classList.toggle("active", active);
				Settings[key] = active;
				Settings.save();
				if (onToggle) {
					onToggle(active);
				}
			});

			row.appendChild(info);
			row.appendChild(toggle);
			return row;
		};

		// 4. Status Chip Toggle
		const toggleStatus = createToggleRow(
			"Status Filter",
			"Show status filter chip",
			"showStatusChip",
			() => {
				UIBuilder.updateChipVisibilities();
			},
		);
		container.appendChild(toggleStatus);

		// 5. Duration Chip Toggle
		const toggleDuration = createToggleRow(
			"Duration Filter",
			"Show duration filter chip",
			"showDurationChip",
			() => {
				UIBuilder.updateChipVisibilities();
			},
		);
		container.appendChild(toggleDuration);

		// 6. Age Chip Toggle
		const toggleAge = createToggleRow(
			"Age Filter",
			"Show age filter chip",
			"showAgeChip",
			() => {
				UIBuilder.updateChipVisibilities();
			},
		);
		container.appendChild(toggleAge);

		// 7. Views Chip Toggle
		const toggleViews = createToggleRow(
			"Views Filter",
			"Show views filter chip",
			"showViewsChip",
			() => {
				UIBuilder.updateChipVisibilities();
			},
		);
		container.appendChild(toggleViews);

		this.settingsPopover.appendChild(container);
	},

	hideAll() {
		try {
			this.durationPopover?.hidePopover();
			this.viewsPopover?.hidePopover();
			this.watchedPopover?.hidePopover();
			this.agePopover?.hidePopover();
			this.settingsPopover?.hidePopover();
		} catch {
			if (this.durationPopover) this.durationPopover.style.display = "none";
			if (this.viewsPopover) this.viewsPopover.style.display = "none";
			if (this.watchedPopover) this.watchedPopover.style.display = "none";
			if (this.agePopover) this.agePopover.style.display = "none";
			if (this.settingsPopover) this.settingsPopover.style.display = "none";
		}
	},
};

const FilterEngine = {
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

const QueueManager = {
	enqueueVideo(videoId) {
		const targetWindow =
			typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
		const ytdApp = targetWindow.document.querySelector("ytd-app");
		if (!ytdApp) {
			console.error("[ytsift] Element ytd-app not found.");
			return false;
		}

		const commandExecutor =
			ytdApp.resolveCommand || ytdApp.__data__?.commandExecutor;
		const apiService = ytdApp.apiService_ || ytdApp.services_?.api;

		const actionPayload = {
			clickTrackingParams: "CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
			addToPlaylistCommand: {
				openMiniplayer: true,
				videoId: videoId,
				listType: "PLAYLIST_EDIT_LIST_TYPE_QUEUE",
				onCreateListCommand: {
					clickTrackingParams:
						"CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
					commandMetadata: {
						webCommandMetadata: {
							sendPost: true,
							apiUrl: "/youtubei/v1/playlist/create",
						},
					},
					createPlaylistServiceEndpoint: {
						videoIds: [videoId],
						params: "CAQ%3D",
					},
				},
				videoIds: [videoId],
				videoCommand: {
					clickTrackingParams:
						"CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
					commandMetadata: {
						webCommandMetadata: {
							url: `/watch?v=${videoId}`,
							webPageType: "WEB_PAGE_TYPE_WATCH",
							rootVe: 3832,
						},
					},
					watchEndpoint: { videoId: videoId },
				},
			},
		};

		if (typeof commandExecutor === "function") {
			try {
				commandExecutor.call(ytdApp, {
					signalServiceEndpoint: {
						signal: "CLIENT_SIGNAL",
						actions: [actionPayload],
					},
				});
				console.log(`[ytsift] Native command executed for video: ${videoId}`);
				return true;
			} catch (e) {
				console.warn(
					"[ytsift] Native commandExecutor failed, trying apiService...",
					e,
				);
			}
		}

		if (apiService && typeof apiService.executeServiceAction === "function") {
			try {
				apiService.executeServiceAction({
					actionName: "yt-service-request-action",
					args: [actionPayload, ytdApp],
				});
				console.log(`[ytsift] API service executed for video: ${videoId}`);
				return true;
			} catch (e) {
				console.error("[ytsift] API service execution failed.", e);
			}
		}

		return false;
	},

	getVisibleVideoIds() {
		const cards = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD);
		const ids = new Set();
		for (const card of cards) {
			if (!card.classList.contains(CONFIG.CLASSES.HIDDEN)) {
				const data = DataModelResolver.getCardData(card);
				const id = DataModelResolver.getVideoId(data, card);
				if (id) {
					ids.add(id);
				}
			}
		}
		return Array.from(ids);
	},
};

const FetchInterceptor = {
	install() {
		const targetWindow =
			typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

		targetWindow.fetch = new Proxy(targetWindow.fetch, {
			apply(target, thisArg, argArray) {
				const [input, init] = argArray;
				const url = typeof input === "string" ? input : input?.url || "";
				const isBrowseReq = url.includes(
					"/youtubei/v1/browse?prettyPrint=false",
				);

				const isVideosTab =
					State.channelVideosPattern.test(window.location.href) ||
					State.channelIdVideosPattern.test(window.location.href);

				const method =
					init?.method || (typeof input === "object" && input?.method) || "GET";
				const isPost = method.toUpperCase() === "POST";
				const areFiltersActive = State.isFilterActive();

				if (isBrowseReq && isVideosTab && isPost && areFiltersActive) {
					const now = Date.now();
					const timeSinceLast = now - State.lastFetchTime;
					if (timeSinceLast < Settings.requestThrottle) {
						const waitTime = Settings.requestThrottle - timeSinceLast;
						return new Promise((resolve) => setTimeout(resolve, waitTime)).then(
							() => {
								State.lastFetchTime = Date.now();
								return Reflect.apply(target, thisArg, argArray);
							},
						);
					}
					State.lastFetchTime = Date.now();
				}

				return Reflect.apply(target, thisArg, argArray);
			},
		});
	},
};

const UIBuilder = {
	build(chipBar) {
		State.reset();

		const wrapper = document.createElement("div");
		wrapper.className = CONFIG.CLASSES.CONTROLS_WRAPPER;

		// ── LEFT: Filters ──────────────────────────────────────
		const filtersLeft = document.createElement("div");
		filtersLeft.className = "ytsift-filters-left";

		// 1. Search
		const searchContainer = document.createElement("div");
		searchContainer.className = CONFIG.CLASSES.SEARCH_CONTAINER;

		const searchIconSpan = document.createElement("span");
		searchIconSpan.className = CONFIG.CLASSES.SEARCH_ICON;
		searchIconSpan.appendChild(
			DOMRenderer.createSvgIcon(
				"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
			),
		);

		const input = document.createElement("input");
		input.type = "text";
		input.className = CONFIG.CLASSES.SEARCH_INPUT;
		input.placeholder = "Filter by title...";
		input.value = State.filters.text.query;
		input.setAttribute("aria-label", "Filter videos by keyword");

		const clearBtn = document.createElement("button");
		clearBtn.className = CONFIG.CLASSES.CLEAR_BTN;
		clearBtn.appendChild(
			DOMRenderer.createSvgIcon(
				"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
			),
		);
		clearBtn.setAttribute("aria-label", "Clear search");

		searchContainer.appendChild(searchIconSpan);
		searchContainer.appendChild(input);
		searchContainer.appendChild(clearBtn);
		filtersLeft.appendChild(searchContainer);

		// 2. Status chip
		const watchedChip = DOMRenderer.createChip({
			id: "ytsift-chip-watched",
			text: "Status ▾",
			pressed: State.filters.watched.isActive(),
		});
		filtersLeft.appendChild(watchedChip);

		// Separator between general and duration/age section
		const sep1 = document.createElement("div");
		sep1.className = CONFIG.CLASSES.SEPARATOR;
		sep1.id = "ytsift-sep-1";
		filtersLeft.appendChild(sep1);

		// 3. Duration chip
		const durationChip = DOMRenderer.createChip({
			id: "ytsift-chip-duration",
			text: "Duration ▾",
			pressed: State.filters.duration.isActive(),
		});
		filtersLeft.appendChild(durationChip);

		// 4. Age chip
		const ageChip = DOMRenderer.createChip({
			id: "ytsift-chip-age",
			text: "Age ▾",
			pressed: State.filters.age.isActive(),
		});
		filtersLeft.appendChild(ageChip);

		// Separator between duration/age and views section
		const sep2 = document.createElement("div");
		sep2.className = CONFIG.CLASSES.SEPARATOR;
		sep2.id = "ytsift-sep-2";
		filtersLeft.appendChild(sep2);

		// 5. Views chip
		const viewsChip = DOMRenderer.createChip({
			id: "ytsift-chip-views",
			text: "Views ▾",
			pressed: State.filters.views.isActive(),
		});
		filtersLeft.appendChild(viewsChip);

		wrapper.appendChild(filtersLeft);

		// ── SEPARATOR between filters and actions ──────────────
		const sepActions = document.createElement("div");
		sepActions.className = CONFIG.CLASSES.SEPARATOR;
		sepActions.id = "ytsift-sep-actions";
		wrapper.appendChild(sepActions);

		// ── RIGHT: Actions ─────────────────────────────────────
		const actionsRight = document.createElement("div");
		actionsRight.className = "ytsift-actions-right";

		const counterBadge = document.createElement("span");
		counterBadge.className = CONFIG.CLASSES.COUNTER;
		counterBadge.id = "ytsift-counter";
		counterBadge.textContent = "0 / 0";
		counterBadge.setAttribute("role", "status");
		counterBadge.setAttribute("aria-live", "polite");
		actionsRight.appendChild(counterBadge);

		const clearAllBtn = document.createElement("button");
		clearAllBtn.id = "ytsift-clear-all";
		clearAllBtn.className = "ytsift-clear-all-btn";
		clearAllBtn.textContent = "Clear All";
		actionsRight.appendChild(clearAllBtn);

		const enqueueAllBtn = document.createElement("button");
		enqueueAllBtn.id = "ytsift-enqueue-all";
		enqueueAllBtn.className = "ytsift-enqueue-all-btn";
		enqueueAllBtn.textContent = "+ Queue";
		actionsRight.appendChild(enqueueAllBtn);

		// Settings button
		const settingsWrapper = document.createElement("div");
		settingsWrapper.className = "ytsift-popover-wrapper";

		const settingsBtn = document.createElement("button");
		settingsBtn.id = "ytsift-settings-btn";
		settingsBtn.className = "ytsift-settings-btn";
		settingsBtn.title = "Settings";
		settingsBtn.appendChild(
			DOMRenderer.createSvgIcon(
				"M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
			),
		);
		settingsWrapper.appendChild(settingsBtn);
		actionsRight.appendChild(settingsWrapper);

		wrapper.appendChild(actionsRight);

		chipBar.prepend(wrapper);
		State.lastCardCount = document.querySelectorAll(
			CONFIG.SELECTORS.VIDEO_CARD,
		).length;

		this.wireEvents(
			input,
			clearBtn,
			watchedChip,
			durationChip,
			viewsChip,
			ageChip,
			clearAllBtn,
			enqueueAllBtn,
			settingsBtn,
		);
		this.updateWatchedChipText();
		this.updateAgeChipText();
		this.updateChipVisibilities();

		FilterEngine.apply();
	},

	updateWatchedChipText() {
		const chip = document.getElementById("ytsift-chip-watched");
		if (!chip) return;

		chip.textContent = "Status ▾";

		if (!State.filters.watched.isActive()) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");
	},

	updateDurationChipText() {
		const chip = document.getElementById("ytsift-chip-duration");
		if (!chip) return;

		chip.textContent = "Duration ▾";

		if (State.filters.duration.preset === null) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");
	},

	formatViewsLabel(val) {
		if (val >= 1000000)
			return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
		if (val >= 1000) return `${(val / 1000).toFixed(1).replace(".0", "")}k`;
		return val;
	},

	updateViewsChipText() {
		const chip = document.getElementById("ytsift-chip-views");
		if (!chip) return;

		chip.textContent = "Views ▾";

		if (!State.filters.views.isActive()) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		const min = State.filters.views.min;
		const max = State.filters.views.max;

		if (min === 0 && max === Number.POSITIVE_INFINITY) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			State.filters.views.reset();
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");
	},

	updateAgeChipText() {
		const chip = document.getElementById("ytsift-chip-age");
		if (!chip) return;

		chip.textContent = "Age ▾";

		if (!State.filters.age.isActive()) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		const min = State.filters.age.min;
		const max = State.filters.age.max;

		if (min === 0 && max === Number.POSITIVE_INFINITY) {
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			State.filters.age.reset();
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");
	},

	wireEvents(
		input,
		clearBtn,
		watchedChip,
		durationChip,
		viewsChip,
		ageChip,
		clearAllBtn,
		enqueueAllBtn,
		settingsBtn,
	) {
		input.addEventListener("input", () => {
			State.filters.text.setQuery(input.value);
			clearBtn.style.visibility = input.value.length > 0 ? "visible" : "hidden";
			FilterEngine.apply();
		});

		clearBtn.addEventListener("click", () => {
			input.value = "";
			State.filters.text.reset();
			clearBtn.style.visibility = "hidden";
			FilterEngine.apply();
			input.focus();
		});

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				input.blur();
			}
			if (e.key === "Escape") {
				input.value = "";
				State.filters.text.reset();
				clearBtn.style.visibility = "hidden";
				FilterEngine.apply();
				input.blur();
			}
		});

		watchedChip.addEventListener("click", () => {
			const wasJustClosed =
				Date.now() - PopoverManager.lastWatchedClosedTime < 150;
			PopoverManager.hideAll();

			if (wasJustClosed) {
				return;
			}

			PopoverManager.updateWatchedInputs(
				State.filters.watched.type,
				State.filters.watched.percent,
			);
			PopoverManager.showWatched(watchedChip);
		});

		durationChip.addEventListener("click", () => {
			const wasJustClosed =
				Date.now() - PopoverManager.lastDurationClosedTime < 150;
			PopoverManager.hideAll();

			if (wasJustClosed) {
				return;
			}

			PopoverManager.updateDurationInputs(
				!State.filters.duration.isActive() ? "" : State.filters.duration.min,
				State.filters.duration.max === Number.POSITIVE_INFINITY
					? ""
					: State.filters.duration.max,
			);
			PopoverManager.showDuration(durationChip);
		});

		viewsChip.addEventListener("click", () => {
			const wasJustClosed =
				Date.now() - PopoverManager.lastViewsClosedTime < 150;
			PopoverManager.hideAll();

			if (wasJustClosed) {
				return;
			}

			PopoverManager.updateViewsInputs(
				!State.filters.views.isActive() ? "" : State.filters.views.min,
				State.filters.views.max === Number.POSITIVE_INFINITY
					? ""
					: State.filters.views.max,
			);
			PopoverManager.showViews(viewsChip);
		});

		ageChip.addEventListener("click", () => {
			const wasJustClosed = Date.now() - PopoverManager.lastAgeClosedTime < 150;
			PopoverManager.hideAll();

			if (wasJustClosed) {
				return;
			}

			PopoverManager.updateAgeInputs(
				!State.filters.age.isActive() ? "" : State.filters.age.min,
				State.filters.age.max === Number.POSITIVE_INFINITY
					? ""
					: State.filters.age.max,
			);
			PopoverManager.showAge(ageChip);
		});

		enqueueAllBtn.addEventListener("click", async () => {
			const videoIds = QueueManager.getVisibleVideoIds();
			if (videoIds.length === 0) return;

			// Freeze width to prevent layout shifting
			enqueueAllBtn.style.width = `${enqueueAllBtn.offsetWidth}px`;
			enqueueAllBtn.disabled = true;
			enqueueAllBtn.style.opacity = "0.5";
			enqueueAllBtn.style.cursor = "not-allowed";

			const total = videoIds.length;
			for (let i = 0; i < total; i++) {
				const pct = Math.round(((i + 1) / total) * 100);
				enqueueAllBtn.textContent = `Queuing (${i + 1}/${total})`;
				enqueueAllBtn.style.background = `linear-gradient(to right, var(--ytsift-hover-bg) ${pct}%, transparent ${pct}%)`;
				QueueManager.enqueueVideo(videoIds[i]);
				await new Promise((resolve) =>
					setTimeout(resolve, Settings.queueThrottle),
				);
			}

			enqueueAllBtn.textContent = "Done!";
			setTimeout(() => {
				enqueueAllBtn.textContent = "+ Queue";
				enqueueAllBtn.disabled = false;
				enqueueAllBtn.style.opacity = "1";
				enqueueAllBtn.style.cursor = "pointer";
				enqueueAllBtn.style.width = "";
				enqueueAllBtn.style.background = "";
			}, 1000);
		});

		settingsBtn.addEventListener("click", () => {
			const wasJustClosed =
				Date.now() - PopoverManager.lastSettingsClosedTime < 150;
			PopoverManager.hideAll();

			if (wasJustClosed) {
				return;
			}

			PopoverManager.showSettings(settingsBtn);
		});

		clearAllBtn.addEventListener("click", () => {
			input.value = "";
			clearBtn.style.visibility = "hidden";

			watchedChip.classList.remove(CONFIG.CLASSES.ACTIVE);
			watchedChip.setAttribute("aria-pressed", "false");

			durationChip.classList.remove(CONFIG.CLASSES.ACTIVE);
			durationChip.setAttribute("aria-pressed", "false");

			viewsChip.classList.remove(CONFIG.CLASSES.ACTIVE);
			viewsChip.setAttribute("aria-pressed", "false");

			ageChip.classList.remove(CONFIG.CLASSES.ACTIVE);
			ageChip.setAttribute("aria-pressed", "false");

			PopoverManager.hideAll();
			PopoverManager.updateDurationInputs("", "");
			PopoverManager.updateViewsInputs("", "");
			PopoverManager.updateWatchedInputs("all", Settings.defaultWatched);
			PopoverManager.updateAgeInputs("", "");

			const btnShort = PopoverManager.durationPopover.querySelector(
				"#ytsift-popover-preset-short",
			);
			const btnMedium = PopoverManager.durationPopover.querySelector(
				"#ytsift-popover-preset-medium",
			);
			const btnLong = PopoverManager.durationPopover.querySelector(
				"#ytsift-popover-preset-long",
			);
			if (btnShort) btnShort.classList.remove("active");
			if (btnMedium) btnMedium.classList.remove("active");
			if (btnLong) btnLong.classList.remove("active");

			State.reset();
			this.updateDurationChipText();
			this.updateViewsChipText();
			this.updateWatchedChipText();
			this.updateAgeChipText();
			FilterEngine.apply();
		});
	},

	updateChipVisibilities() {
		const watchedChip = document.getElementById("ytsift-chip-watched");
		const durationChip = document.getElementById("ytsift-chip-duration");
		const ageChip = document.getElementById("ytsift-chip-age");
		const viewsChip = document.getElementById("ytsift-chip-views");

		const sep1 = document.getElementById("ytsift-sep-1");
		const sep2 = document.getElementById("ytsift-sep-2");

		// Apply visibility from settings
		const statusVisible = Settings.showStatusChip;
		const durationVisible = Settings.showDurationChip;
		const ageVisible = Settings.showAgeChip;
		const viewsVisible = Settings.showViewsChip;

		if (watchedChip)
			watchedChip.style.display = statusVisible ? "inline-flex" : "none";
		if (durationChip)
			durationChip.style.display = durationVisible ? "inline-flex" : "none";
		if (ageChip) ageChip.style.display = ageVisible ? "inline-flex" : "none";
		if (viewsChip)
			viewsChip.style.display = viewsVisible ? "inline-flex" : "none";

		// Separator 1 sits between Status and Duration/Age.
		// Show it only when there's at least one visible chip on BOTH sides.
		const leftOfSep1 = statusVisible;
		const rightOfSep1 = durationVisible || ageVisible;
		if (sep1) sep1.style.display = leftOfSep1 && rightOfSep1 ? "block" : "none";

		// Separator 2 sits between Duration/Age and Views.
		// Show it only when there's at least one visible chip on BOTH sides.
		const leftOfSep2 = durationVisible || ageVisible;
		const rightOfSep2 = viewsVisible;
		if (sep2) sep2.style.display = leftOfSep2 && rightOfSep2 ? "block" : "none";
	},
};

function throttle(func, limit) {
	let inThrottle;
	return function (...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
}

const AppObserver = {
	observer: null,
	throttledApply: null,

	init() {
		this.throttledApply = throttle(() => {
			FilterEngine.apply();
		}, 250);

		this.observer = new MutationObserver((mutations) =>
			this.handleMutations(mutations),
		);
		this.observer.observe(document.body, { childList: true, subtree: true });
	},

	handleMutations(mutations) {
		// Quick URL check: are we on the videos tab?
		const isVideosTab =
			State.channelVideosPattern.test(window.location.href) ||
			State.channelIdVideosPattern.test(window.location.href);
		if (!isVideosTab) return;

		const chipBar = document.querySelector(CONFIG.SELECTORS.CHIP_BAR);
		if (!chipBar) return;

		const controlsWrapper = chipBar.querySelector(
			`.${CONFIG.CLASSES.CONTROLS_WRAPPER}`,
		);
		if (!controlsWrapper) {
			UIBuilder.build(chipBar);
			return;
		}

		// Only perform query if mutations actually contain nodes added/removed to avoid redundant queries
		let hasCardMutation = false;
		for (let i = 0; i < mutations.length; i++) {
			if (
				mutations[i].addedNodes.length > 0 ||
				mutations[i].removedNodes.length > 0
			) {
				hasCardMutation = true;
				break;
			}
		}

		if (hasCardMutation) {
			const currentCardCount = document.querySelectorAll(
				CONFIG.SELECTORS.VIDEO_CARD,
			).length;
			if (currentCardCount !== State.lastCardCount) {
				State.lastCardCount = currentCardCount;
				this.throttledApply();
			}
		}
	},
};

const App = {
	init() {
		Settings.load();
		StyleManager.inject();
		PopoverManager.init();
		FetchInterceptor.install();
		AppObserver.init();
	},
};

App.init();
