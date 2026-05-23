// ==UserScript==
// @name            YouTube - ytsift
// @namespace       https://greasyfork.org/users/821661
// @match           https://www.youtube.com/*
// @grant           GM_addStyle
// @noframes
// @version         1.0.0
// @author          hdyzen
// @description     Intelligent local filter for YouTube channel videos
// @license         GPL-3.0
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
                --ytsift-controls-height: 3.43em; /* 48px */
                --ytsift-chip-height: 2.29em; /* 32px */
                
                /* Popover system (in ems, relative to --ytsift-popover-font-size) */
                --ytsift-popover-bg: var(--yt-sys-color-baseline--menu-background, var(--yt-spec-menu-background, rgba(255, 255, 255, 0.95)));
                --ytsift-popover-shadow: 0 0.31em 1.54em rgba(0, 0, 0, 0.15); /* 0 4px 20px */
                --ytsift-popover-padding: 0.92em; /* 12px */
                --ytsift-popover-radius: 0.77em; /* 10px */
                --ytsift-popover-blur: 12px;
                
                /* Input layout (in ems, relative to --ytsift-popover-font-size) */
                --ytsift-input-radius: 0.46em; /* 6px */
            }

            .ytChipBarViewModelChipBarScrollContainer {
                align-items: end !important;
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

            .ytsift-section-general,
            .ytsift-section-duration,
            .ytsift-section-views,
            .ytsift-section-actions {
                position: relative;
                padding-top: 1em; /* 14px */
                display: inline-flex;
                align-items: center;
                gap: 0.57em; /* 8px */
            }

            .ytsift-section-general::before,
            .ytsift-section-duration::before,
            .ytsift-section-views::before,
            .ytsift-section-actions::before {
                position: absolute;
                top: 0;
                left: 0;
                font-size: 0.64em; /* 9px */
                font-weight: 700;
                color: var(--ytsift-text-disabled);
                letter-spacing: 0.06em; /* 0.8px */
                text-transform: uppercase;
                font-family: "Roboto", "Arial", sans-serif;
                line-height: 1;
                pointer-events: none;
            }

            .ytsift-section-general::before {
                content: "GENERAL";
            }

            .ytsift-section-duration::before {
                content: "TIME";
            }

            .ytsift-section-views::before {
                content: "VIEWS";
            }

            .ytsift-section-actions::before {
                content: "STATUS";
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

            .ytsift-separator {
                width: 0.07em; /* 1px */
                height: 1.43em; /* 20px */
                background-color: var(--ytsift-outline);
                margin: 0 0.43em 0.43em; /* 0 6px 6px */
                flex-shrink: 0;
            }

            .ytsift-popover {
                position: absolute;
                background-color: var(--ytsift-popover-bg);
                border: 1px solid var(--ytsift-outline);
                border-radius: var(--ytsift-popover-radius);
                box-shadow: var(--ytsift-popover-shadow);
                z-index: 10000;
                padding: var(--ytsift-popover-padding);
                box-sizing: border-box;
                display: none;
                backdrop-filter: blur(var(--ytsift-popover-blur)) saturate(180%);
                -webkit-backdrop-filter: blur(var(--ytsift-popover-blur)) saturate(180%);
                font-size: var(--ytsift-popover-font-size);
            }

            .ytsift-popover:popover-open {
                display: block;
            }

            .ytsift-popover-duration-container {
                display: flex;
                flex-direction: column;
                gap: 0.62em; /* 8px */
            }

            .ytsift-popover-presets-row {
                display: flex;
                gap: 0.46em; /* 6px */
            }

            .ytsift-popover-inputs-row {
                display: flex;
                align-items: center;
                gap: 0.46em; /* 6px */
                justify-content: center;
                border-top: 1px solid var(--ytsift-outline);
                padding-top: 0.62em; /* 8px */
                margin-top: 0.15em; /* 2px */
            }

            .ytsift-popover-inputs-row span {
                font-size: 0.92em; /* 12px */
                font-family: "Roboto", "Arial", sans-serif;
                color: var(--ytsift-text-secondary);
            }

            .ytsift-popover-views-container {
                display: flex;
                align-items: center;
                gap: 0.46em; /* 6px */
            }

            .ytsift-popover-views-container span {
                font-size: 0.92em; /* 12px */
                font-family: "Roboto", "Arial", sans-serif;
                color: var(--ytsift-text-secondary);
            }

            .ytsift-popover-preset-btn {
                background-color: var(--ytsift-tonal-bg);
                color: var(--ytsift-text-primary);
                border: 1px solid transparent;
                border-radius: var(--ytsift-input-radius);
                padding: 0.46em 0.92em; /* 6px 12px */
                font-size: 0.92em; /* 12px */
                font-weight: 500;
                font-family: "Roboto", "Arial", sans-serif;
                cursor: pointer;
                transition: background-color 0.2s, border-color 0.2s;
            }

            .ytsift-popover-preset-btn:hover {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-popover-preset-btn.active {
                background-color: var(--ytsift-text-primary);
                color: var(--ytsift-text-primary-inverse);
            }

            .ytsift-popover-preset-btn.active:hover {
                background-color: var(--yt-sys-color-baseline--mono-filled-hover, #333);
            }

            .ytsift-clear-all-btn {
                border: none;
                background: transparent;
                color: var(--yt-sys-color-baseline--call-to-action, #3ea6ff);
                cursor: pointer;
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 0.93em; /* 13px */
                font-weight: 500;
                margin-left: 0.57em; /* 8px */
                padding: 0 0.29em; /* 4px */
                height: var(--ytsift-chip-height);
                display: inline-flex;
                align-items: center;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .ytsift-clear-all-btn:hover {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-enqueue-all-btn {
                border: none;
                background: transparent;
                color: var(--yt-sys-color-baseline--call-to-action, #3ea6ff);
                cursor: pointer;
                font-family: "Roboto", "Arial", sans-serif;
                font-size: 0.93em; /* 13px */
                font-weight: 500;
                margin-left: 0.57em; /* 8px */
                padding: 0 0.29em; /* 4px */
                height: var(--ytsift-chip-height);
                display: inline-flex;
                align-items: center;
                border-radius: 4px;
                transition: background-color 0.2s, opacity 0.2s;
            }

            .ytsift-enqueue-all-btn:hover:not(:disabled) {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-popover-slider-container {
                display: flex;
                flex-direction: column;
                gap: 0.46em; /* 6px */
                border-top: 1px solid var(--ytsift-outline);
                padding-top: 0.62em; /* 8px */
                margin-top: 0.15em; /* 2px */
            }

            .ytsift-slider-header {
                display: flex;
                justify-content: space-between;
                font-size: 0.92em; /* 12px */
                font-family: "Roboto", "Arial", sans-serif;
                color: var(--ytsift-text-secondary);
            }

            .ytsift-slider {
                -webkit-appearance: none;
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--ytsift-tonal-bg);
                outline: none;
                margin: 0.62em 0;
            }

            .ytsift-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--ytsift-text-primary);
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            .ytsift-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }

            .ytsift-slider::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border: none;
                border-radius: 50%;
                background: var(--ytsift-text-primary);
                cursor: pointer;
                transition: transform 0.1s ease;
            }

            .ytsift-slider::-moz-range-thumb:hover {
                transform: scale(1.2);
            }

            ytd-rich-item-renderer.ytsift-hidden {
                display: none !important;
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
    matches(metadata) {
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
            } else {
                this.positiveWords.push(word);
            }
        }
        this.active = this.positiveWords.length > 0 || this.negativeWords.length > 0;
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
        const matchesPositive = this.positiveWords.every((word) => titleLower.includes(word));
        const matchesNegative = this.negativeWords.some((word) => titleLower.includes(word));
        return matchesPositive && !matchesNegative;
    }
}

class WatchedFilter extends BaseFilter {
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

class DurationFilter extends BaseFilter {
    constructor() {
        super();
        this.preset = null;
        this.min = 0;
        this.max = Infinity;
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
        this.max = Infinity;
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
        this.max = Infinity;
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
        this.active = min > 0 || max < Infinity;
    }

    reset() {
        this.min = 0;
        this.max = Infinity;
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
        this.max = Infinity;
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
        this.active = min > 0 || max < Infinity;
    }

    reset() {
        this.min = 0;
        this.max = Infinity;
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
        let seconds = 0;
        if (parts.length === 2) {
            seconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 1) {
            seconds = parts[0];
        }
        return seconds;
    },
};

const ViewsParser = {
    parsePlainNumber(numStr) {
        const clean = numStr.trim();
        if (!clean) return NaN;
        if (clean.includes(",") && clean.includes(".")) {
            const commaIndex = clean.lastIndexOf(",");
            const dotIndex = clean.lastIndexOf(".");
            if (dotIndex > commaIndex) {
                return parseFloat(clean.replace(/,/g, ""));
            }
            return parseFloat(clean.replace(/\./g, "").replace(",", "."));
        }
        if (clean.includes(",")) {
            const parts = clean.split(",");
            if (parts.length === 2 && parts[1].length !== 3) {
                return parseFloat(clean.replace(",", "."));
            }
            return parseFloat(clean.replace(/,/g, ""));
        }
        if (clean.includes(".")) {
            const parts = clean.split(".");
            if (parts.length === 2 && parts[1].length !== 3) {
                return parseFloat(clean);
            }
            return parseFloat(clean.replace(/\./g, ""));
        }
        return parseFloat(clean);
    },

    parseViewsWithRules(text) {
        if (!text) return NaN;
        const cleanStr = text.toLowerCase().trim();

        for (const langKey of Object.keys(LANGUAGE_RULES)) {
            const lang = LANGUAGE_RULES[langKey];
            for (const mult of lang.multipliers) {
                const escapedSuffix = mult.suffix.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
                const regex = new RegExp(`([\\d.,]+)\\s*${escapedSuffix}(?:\\b|$|[^a-zA-Záéíóúâêôãõç])`, "i");
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
                    const val = parseFloat(cleanedNum);
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

        return NaN;
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
        const match = clean.match(/(\d+)\s*(minute|hour|day|week|month|year|minuto|hora|dia|semana|mês|meses|ano)s?/);
        if (!match) return 0;

        const value = parseInt(match[1]);
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
            this.getNestedValue(data, "content.lockupViewModel.metadata.lockupMetadataViewModel.title.content") ||
            this.getNestedValue(data, "lockupViewModel.metadata.lockupMetadataViewModel.title.content")
        );
    },

    getVideoDuration(data) {
        const overlays =
            this.getNestedValue(data, "content.lockupViewModel.contentImage.thumbnailViewModel.overlays") ||
            this.getNestedValue(data, "lockupViewModel.contentImage.thumbnailViewModel.overlays");
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
                        if (badgeModel && badgeModel.text) {
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
                this.getNestedValue(data, "content.lockupViewModel.contentImage.thumbnailViewModel.overlays") ||
                this.getNestedValue(data, "lockupViewModel.contentImage.thumbnailViewModel.overlays");
            if (Array.isArray(overlays)) {
                for (const overlay of overlays) {
                    const pb = this.getNestedValue(overlay, "thumbnailBottomOverlayViewModel.progressBar.thumbnailOverlayProgressBarViewModel");
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
        const pbEl = card.querySelector("ytd-thumbnail-overlay-progress-bar-renderer, yt-thumbnail-overlay-progress-bar-view-model, [role='progressbar']");
        if (pbEl) {
            const getPercentFromStyle = (el) => {
                const widthStr = el.style.width;
                if (widthStr && widthStr.includes("%")) {
                    const match = widthStr.match(/(\d+(?:\.\d+)?)\s*%/);
                    if (match) return parseFloat(match[1]);
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
            this.getNestedValue(data, "content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts") ||
            this.getNestedValue(data, "lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts");
        if (Array.isArray(partsA)) {
            metadataParts.push(...partsA);
        }

        const rowsB =
            this.getNestedValue(data, "content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows") ||
            this.getNestedValue(data, "lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows");
        if (Array.isArray(rowsB)) {
            for (const row of rowsB) {
                if (Array.isArray(row.metadataParts)) {
                    metadataParts.push(...row.metadataParts);
                }
            }
        }

        for (const part of metadataParts) {
            const text = this.getNestedValue(part, "text.content");
            const label = this.getNestedValue(part, "text.accessibility.accessibilityData.label");
            const combined = `${text || ""} ${label || ""}`.toLowerCase();
            if (combined.includes("view") || combined.includes("visualiza") || combined.includes("vista") || combined.includes("assist")) {
                return part;
            }
        }
        return undefined;
    },

    getVideoAgePart(data) {
        const metadataParts = [];

        const partsA =
            this.getNestedValue(data, "content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts") ||
            this.getNestedValue(data, "lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts");
        if (Array.isArray(partsA)) {
            metadataParts.push(...partsA);
        }

        const rowsB =
            this.getNestedValue(data, "content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows") ||
            this.getNestedValue(data, "lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows");
        if (Array.isArray(rowsB)) {
            for (const row of rowsB) {
                if (Array.isArray(row.metadataParts)) {
                    metadataParts.push(...row.metadataParts);
                }
            }
        }

        for (const part of metadataParts) {
            const text = this.getNestedValue(part, "text.content");
            const label = this.getNestedValue(part, "text.accessibility.accessibilityData.label");
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
            const path1 = "content.lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
            const path2 = "lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
            const path3 = "content.lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
            const path4 = "lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
            const id = this.getNestedValue(data, path1) || 
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
    lastDurationClosedTime: 0,
    lastViewsClosedTime: 0,
    lastWatchedClosedTime: 0,
    lastAgeClosedTime: 0,

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
            } else if (e.newState === "closed") {
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
            } else if (e.newState === "closed") {
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
            } else if (e.newState === "closed") {
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
            } else if (e.newState === "closed") {
                this.lastAgeClosedTime = Date.now();
            }
        });

        document.body.appendChild(this.durationPopover);
        document.body.appendChild(this.viewsPopover);
        document.body.appendChild(this.watchedPopover);
        document.body.appendChild(this.agePopover);

        this.buildDurationContent();
        this.buildViewsContent();
        this.buildWatchedContent();
        this.buildAgeContent();
    },

    position(popover, target) {
        const rect = target.getBoundingClientRect();
        popover.style.top = `${rect.bottom + window.scrollY + 6}px`;
        popover.style.left = `${rect.left + window.scrollX}px`;
    },

    buildDurationContent() {
        const container = document.createElement("div");
        container.className = "ytsift-popover-duration-container";

        const presetsRow = document.createElement("div");
        presetsRow.className = "ytsift-popover-presets-row";

        const btnShort = document.createElement("button");
        btnShort.id = "ytsift-popover-preset-short";
        btnShort.className = "ytsift-popover-preset-btn";
        btnShort.textContent = "Short (< 4m)";

        const btnMedium = document.createElement("button");
        btnMedium.id = "ytsift-popover-preset-medium";
        btnMedium.className = "ytsift-popover-preset-btn";
        btnMedium.textContent = "Medium (4-20m)";

        const btnLong = document.createElement("button");
        btnLong.id = "ytsift-popover-preset-long";
        btnLong.className = "ytsift-popover-preset-btn";
        btnLong.textContent = "Long (> 20m)";

        presetsRow.appendChild(btnShort);
        presetsRow.appendChild(btnMedium);
        presetsRow.appendChild(btnLong);

        // Sliders
        const slidersContainer = document.createElement("div");
        slidersContainer.className = "ytsift-popover-slider-container";
        slidersContainer.style.borderTop = "1px solid var(--ytsift-outline)";
        slidersContainer.style.paddingTop = "0.62em";
        slidersContainer.style.marginTop = "0.15em";
        slidersContainer.style.display = "flex";
        slidersContainer.style.flexDirection = "column";
        slidersContainer.style.gap = "0.62em";

        // Min Duration Slider
        const minContainer = document.createElement("div");
        minContainer.style.display = "flex";
        minContainer.style.flexDirection = "column";
        minContainer.style.gap = "0.23em";

        const minHeader = document.createElement("div");
        minHeader.className = "ytsift-slider-header";
        const minLabel = document.createElement("span");
        minLabel.textContent = "Min Duration";
        const minValSpan = document.createElement("span");
        minValSpan.id = "ytsift-popover-duration-min-val";
        minValSpan.textContent = "0m";
        minHeader.appendChild(minLabel);
        minHeader.appendChild(minValSpan);

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
        maxContainer.style.display = "flex";
        maxContainer.style.flexDirection = "column";
        maxContainer.style.gap = "0.23em";

        const maxHeader = document.createElement("div");
        maxHeader.className = "ytsift-slider-header";
        const maxLabel = document.createElement("span");
        maxLabel.textContent = "Max Duration";
        const maxValSpan = document.createElement("span");
        maxValSpan.id = "ytsift-popover-duration-max-val";
        maxValSpan.textContent = "Max";
        maxHeader.appendChild(maxLabel);
        maxHeader.appendChild(maxValSpan);

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

        slidersContainer.appendChild(minContainer);
        slidersContainer.appendChild(maxContainer);

        container.appendChild(presetsRow);
        container.appendChild(slidersContainer);
        this.durationPopover.appendChild(container);

        const updatePresetActiveClasses = (activePreset) => {
            btnShort.classList.toggle("active", activePreset === "short");
            btnMedium.classList.toggle("active", activePreset === "medium");
            btnLong.classList.toggle("active", activePreset === "long");
        };

        const updateUI = () => {
            const min = State.filters.duration.min;
            const max = State.filters.duration.max;

            minSlider.value = min;
            minValSpan.textContent = `${min}m`;

            if (max === Infinity) {
                maxSlider.value = "120";
                maxValSpan.textContent = "Max";
            } else {
                maxSlider.value = max;
                maxValSpan.textContent = `${max}m`;
            }
        };

        const handlePresetClick = (preset) => {
            const isCurrent = State.filters.duration.preset === preset;
            if (isCurrent) {
                State.filters.duration.reset();
            } else {
                let min = 0;
                let max = Infinity;
                if (preset === "short") {
                    min = 0;
                    max = 4;
                } else if (preset === "medium") {
                    min = 4;
                    max = 20;
                } else if (preset === "long") {
                    min = 20;
                    max = Infinity;
                }
                State.filters.duration.setRange(min, max, preset);
            }
            updateUI();
            updatePresetActiveClasses(State.filters.duration.preset);
            UIBuilder.updateDurationChipText();
            FilterEngine.apply();
        };

        btnShort.addEventListener("click", () => handlePresetClick("short"));
        btnMedium.addEventListener("click", () => handlePresetClick("medium"));
        btnLong.addEventListener("click", () => handlePresetClick("long"));

        const handleSliderChange = () => {
            let min = parseInt(minSlider.value);
            let max = parseInt(maxSlider.value);

            if (max !== 120 && min > max) {
                min = max;
                minSlider.value = min;
            }

            const limitMax = max === 120 ? Infinity : max;

            let preset = "custom";
            if (min === 0 && limitMax === 4) {
                preset = "short";
            } else if (min === 4 && limitMax === 20) {
                preset = "medium";
            } else if (min === 20 && limitMax === Infinity) {
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
    },

    buildViewsContent() {
        const VIEW_STEPS = [0, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, Infinity];

        const formatViewsValue = (val) => {
            if (val === 0) return "0";
            if (val === Infinity) return "Max";
            if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1).replace(".0", "")}k`;
            return val.toString();
        };

        const container = document.createElement("div");
        container.className = "ytsift-popover-duration-container";
        container.style.width = "12.31em";

        const minContainer = document.createElement("div");
        minContainer.style.display = "flex";
        minContainer.style.flexDirection = "column";
        minContainer.style.gap = "0.23em";

        const minHeader = document.createElement("div");
        minHeader.className = "ytsift-slider-header";
        const minLabel = document.createElement("span");
        minLabel.textContent = "Min Views";
        const minValSpan = document.createElement("span");
        minValSpan.id = "ytsift-popover-views-min-val";
        minValSpan.textContent = "0";
        minHeader.appendChild(minLabel);
        minHeader.appendChild(minValSpan);

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
        maxContainer.style.display = "flex";
        maxContainer.style.flexDirection = "column";
        maxContainer.style.gap = "0.23em";

        const maxHeader = document.createElement("div");
        maxHeader.className = "ytsift-slider-header";
        const maxLabel = document.createElement("span");
        maxLabel.textContent = "Max Views";
        const maxValSpan = document.createElement("span");
        maxValSpan.id = "ytsift-popover-views-max-val";
        maxValSpan.textContent = "Max";
        maxHeader.appendChild(maxLabel);
        maxHeader.appendChild(maxValSpan);

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

        container.appendChild(minContainer);
        container.appendChild(maxContainer);
        this.viewsPopover.appendChild(container);

        const handleSliderChange = () => {
            let minIndex = parseInt(minSlider.value);
            let maxIndex = parseInt(maxSlider.value);

            if (minIndex > maxIndex) {
                minIndex = maxIndex;
                minSlider.value = minIndex.toString();
            }

            const minVal = VIEW_STEPS[minIndex];
            const maxVal = VIEW_STEPS[maxIndex];

            minValSpan.textContent = formatViewsValue(minVal);
            maxValSpan.textContent = formatViewsValue(maxVal);

            State.filters.views.setRange(minVal, maxVal);
            UIBuilder.updateViewsChipText();
            FilterEngine.apply();
        };

        minSlider.addEventListener("input", handleSliderChange);
        maxSlider.addEventListener("input", handleSliderChange);
    },

    buildWatchedContent() {
        const container = document.createElement("div");
        container.className = "ytsift-popover-duration-container";

        const presetsRow = document.createElement("div");
        presetsRow.className = "ytsift-popover-presets-row";

        const btnAll = document.createElement("button");
        btnAll.id = "ytsift-popover-watched-all";
        btnAll.className = "ytsift-popover-preset-btn active";
        btnAll.textContent = "All";

        const btnUnwatched = document.createElement("button");
        btnUnwatched.id = "ytsift-popover-watched-unwatched";
        btnUnwatched.className = "ytsift-popover-preset-btn";
        btnUnwatched.textContent = "Unwatched";

        const btnWatched = document.createElement("button");
        btnWatched.id = "ytsift-popover-watched-watched";
        btnWatched.className = "ytsift-popover-preset-btn";
        btnWatched.textContent = "Watched";

        presetsRow.appendChild(btnAll);
        presetsRow.appendChild(btnUnwatched);
        presetsRow.appendChild(btnWatched);

        const sliderContainer = document.createElement("div");
        sliderContainer.className = "ytsift-popover-slider-container";

        const sliderHeader = document.createElement("div");
        sliderHeader.className = "ytsift-slider-header";

        const sliderLabel = document.createElement("span");
        sliderLabel.textContent = "Threshold";

        const sliderValue = document.createElement("span");
        sliderValue.id = "ytsift-popover-watched-value";
        sliderValue.textContent = "10%";

        sliderHeader.appendChild(sliderLabel);
        sliderHeader.appendChild(sliderValue);

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

        container.appendChild(presetsRow);
        container.appendChild(sliderContainer);
        this.watchedPopover.appendChild(container);

        const updateUI = () => {
            const currentType = State.filters.watched.type;
            const currentPercent = State.filters.watched.percent;

            btnAll.classList.toggle("active", currentType === "all");
            btnUnwatched.classList.toggle("active", currentType === "unwatched");
            btnWatched.classList.toggle("active", currentType === "watched");

            slider.value = currentPercent;
            sliderValue.textContent = `${currentPercent}%`;

            if (currentType === "all") {
                sliderContainer.style.opacity = "0.5";
                slider.disabled = true;
            } else {
                sliderContainer.style.opacity = "1";
                slider.disabled = false;
            }
        };

        const handleTypeClick = (type) => {
            State.filters.watched.setCriteria(type, parseInt(slider.value));
            updateUI();
            UIBuilder.updateWatchedChipText();
            FilterEngine.apply();
        };

        btnAll.addEventListener("click", () => handleTypeClick("all"));
        btnUnwatched.addEventListener("click", () => handleTypeClick("unwatched"));
        btnWatched.addEventListener("click", () => handleTypeClick("watched"));

        slider.addEventListener("input", () => {
            const percent = parseInt(slider.value);
            sliderValue.textContent = `${percent}%`;
            if (State.filters.watched.type !== "all") {
                State.filters.watched.setCriteria(State.filters.watched.type, percent);
                UIBuilder.updateWatchedChipText();
                FilterEngine.apply();
            }
        });
    },

    buildAgeContent() {
        const AGE_STEPS = [0, 1, 2, 3, 5, 7, 14, 30, 90, 180, 365, 730, 1095, Infinity];

        const formatAgeValue = (days) => {
            if (days === 0) return "0 days";
            if (days === Infinity) return "Max";
            if (days >= 365) {
                const yrs = days / 365;
                return `${yrs.toFixed(1).replace(".0", "")}y`;
            }
            if (days >= 30) {
                const mos = days / 30;
                return `${mos.toFixed(1).replace(".0", "")}mo`;
            }
            if (days >= 7) {
                const wks = days / 7;
                return `${wks.toFixed(1).replace(".0", "")}w`;
            }
            return `${days}d`;
        };

        const container = document.createElement("div");
        container.className = "ytsift-popover-duration-container";
        container.style.width = "12.31em";

        const minContainer = document.createElement("div");
        minContainer.style.display = "flex";
        minContainer.style.flexDirection = "column";
        minContainer.style.gap = "0.23em";

        const minHeader = document.createElement("div");
        minHeader.className = "ytsift-slider-header";
        const minLabel = document.createElement("span");
        minLabel.textContent = "Min Age";
        const minValSpan = document.createElement("span");
        minValSpan.id = "ytsift-popover-age-min-val";
        minValSpan.textContent = "0 days";
        minHeader.appendChild(minLabel);
        minHeader.appendChild(minValSpan);

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
        maxContainer.style.display = "flex";
        maxContainer.style.flexDirection = "column";
        maxContainer.style.gap = "0.23em";

        const maxHeader = document.createElement("div");
        maxHeader.className = "ytsift-slider-header";
        const maxLabel = document.createElement("span");
        maxLabel.textContent = "Max Age";
        const maxValSpan = document.createElement("span");
        maxValSpan.id = "ytsift-popover-age-max-val";
        maxValSpan.textContent = "Max";
        maxHeader.appendChild(maxLabel);
        maxHeader.appendChild(maxValSpan);

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

        container.appendChild(minContainer);
        container.appendChild(maxContainer);
        this.agePopover.appendChild(container);

        const handleSliderChange = () => {
            let minIndex = parseInt(minSlider.value);
            let maxIndex = parseInt(maxSlider.value);

            if (minIndex > maxIndex) {
                minIndex = maxIndex;
                minSlider.value = minIndex.toString();
            }

            const minVal = AGE_STEPS[minIndex];
            const maxVal = AGE_STEPS[maxIndex];

            minValSpan.textContent = formatAgeValue(minVal);
            maxValSpan.textContent = formatAgeValue(maxVal);

            State.filters.age.setRange(minVal, maxVal);
            UIBuilder.updateAgeChipText();
            FilterEngine.apply();
        };

        minSlider.addEventListener("input", handleSliderChange);
        maxSlider.addEventListener("input", handleSliderChange);
    },

    updateDurationInputs(min, max) {
        const minSlider = this.durationPopover.querySelector("#ytsift-popover-duration-min-slider");
        const maxSlider = this.durationPopover.querySelector("#ytsift-popover-duration-max-slider");
        const minValSpan = this.durationPopover.querySelector("#ytsift-popover-duration-min-val");
        const maxValSpan = this.durationPopover.querySelector("#ytsift-popover-duration-max-val");

        const btnShort = this.durationPopover.querySelector("#ytsift-popover-preset-short");
        const btnMedium = this.durationPopover.querySelector("#ytsift-popover-preset-medium");
        const btnLong = this.durationPopover.querySelector("#ytsift-popover-preset-long");

        const activePreset = State.filters.duration.preset;
        if (btnShort) btnShort.classList.toggle("active", activePreset === "short");
        if (btnMedium) btnMedium.classList.toggle("active", activePreset === "medium");
        if (btnLong) btnLong.classList.toggle("active", activePreset === "long");

        if (minSlider) minSlider.value = min === "" ? 0 : min;
        if (minValSpan) minValSpan.textContent = `${min === "" ? 0 : min}m`;

        if (maxSlider) maxSlider.value = (max === Infinity || max === "") ? 120 : max;
        if (maxValSpan) maxValSpan.textContent = (max === Infinity || max === "") ? "Max" : `${max}m`;
    },

    updateViewsInputs(min, max) {
        const VIEW_STEPS = [0, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, Infinity];

        const formatViewsValue = (val) => {
            if (val === 0) return "0";
            if (val === Infinity) return "Max";
            if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(1).replace(".0", "")}k`;
            return val.toString();
        };

        const minSlider = this.viewsPopover.querySelector("#ytsift-popover-views-min-slider");
        const maxSlider = this.viewsPopover.querySelector("#ytsift-popover-views-max-slider");
        const minValSpan = this.viewsPopover.querySelector("#ytsift-popover-views-min-val");
        const maxValSpan = this.viewsPopover.querySelector("#ytsift-popover-views-max-val");

        const actualMin = min === "" ? 0 : min;
        const actualMax = max === "" ? Infinity : max;

        let minIndex = VIEW_STEPS.indexOf(actualMin);
        if (minIndex === -1) minIndex = 0;

        let maxIndex = VIEW_STEPS.indexOf(actualMax);
        if (maxIndex === -1) maxIndex = VIEW_STEPS.length - 1;

        if (minSlider) minSlider.value = minIndex.toString();
        if (minValSpan) minValSpan.textContent = formatViewsValue(actualMin);

        if (maxSlider) maxSlider.value = maxIndex.toString();
        if (maxValSpan) maxValSpan.textContent = formatViewsValue(actualMax);
    },

    updateWatchedInputs(type, percent) {
        const slider = this.watchedPopover.querySelector("#ytsift-popover-watched-slider");
        const sliderValue = this.watchedPopover.querySelector("#ytsift-popover-watched-value");
        const btnAll = this.watchedPopover.querySelector("#ytsift-popover-watched-all");
        const btnUnwatched = this.watchedPopover.querySelector("#ytsift-popover-watched-unwatched");
        const btnWatched = this.watchedPopover.querySelector("#ytsift-popover-watched-watched");
        const sliderContainer = this.watchedPopover.querySelector(".ytsift-popover-slider-container");

        if (slider) slider.value = percent;
        if (sliderValue) sliderValue.textContent = `${percent}%`;

        if (btnAll) btnAll.classList.toggle("active", type === "all");
        if (btnUnwatched) btnUnwatched.classList.toggle("active", type === "unwatched");
        if (btnWatched) btnWatched.classList.toggle("active", type === "watched");

        if (sliderContainer) {
            if (type === "all") {
                sliderContainer.style.opacity = "0.5";
                if (slider) slider.disabled = true;
            } else {
                sliderContainer.style.opacity = "1";
                if (slider) slider.disabled = false;
            }
        }
    },

    updateAgeInputs(min, max) {
        const AGE_STEPS = [0, 1, 2, 3, 5, 7, 14, 30, 90, 180, 365, 730, 1095, Infinity];

        const formatAgeValue = (days) => {
            if (days === 0) return "0 days";
            if (days === Infinity) return "Max";
            if (days >= 365) {
                const yrs = days / 365;
                return `${yrs.toFixed(1).replace(".0", "")}y`;
            }
            if (days >= 30) {
                const mos = days / 30;
                return `${mos.toFixed(1).replace(".0", "")}mo`;
            }
            if (days >= 7) {
                const wks = days / 7;
                return `${wks.toFixed(1).replace(".0", "")}w`;
            }
            return `${days}d`;
        };

        const minSlider = this.agePopover.querySelector("#ytsift-popover-age-min-slider");
        const maxSlider = this.agePopover.querySelector("#ytsift-popover-age-max-slider");
        const minValSpan = this.agePopover.querySelector("#ytsift-popover-age-min-val");
        const maxValSpan = this.agePopover.querySelector("#ytsift-popover-age-max-val");

        const actualMin = min === "" ? 0 : min;
        const actualMax = max === "" ? Infinity : max;

        let minIndex = AGE_STEPS.indexOf(actualMin);
        if (minIndex === -1) minIndex = 0;

        let maxIndex = AGE_STEPS.indexOf(actualMax);
        if (maxIndex === -1) maxIndex = AGE_STEPS.length - 1;

        if (minSlider) minSlider.value = minIndex.toString();
        if (minValSpan) minValSpan.textContent = formatAgeValue(actualMin);

        if (maxSlider) maxSlider.value = maxIndex.toString();
        if (maxValSpan) maxValSpan.textContent = formatAgeValue(actualMax);
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

    isDurationOpen() {
        return this.durationPopover && (this.durationPopover.matches(":popover-open") || this.durationPopover.style.display === "block");
    },

    isViewsOpen() {
        return this.viewsPopover && (this.viewsPopover.matches(":popover-open") || this.viewsPopover.style.display === "block");
    },

    isWatchedOpen() {
        return this.watchedPopover && (this.watchedPopover.matches(":popover-open") || this.watchedPopover.style.display === "block");
    },

    isAgeOpen() {
        return this.agePopover && (this.agePopover.matches(":popover-open") || this.agePopover.style.display === "block");
    },

    hideAll() {
        try {
            this.durationPopover?.hidePopover();
            this.viewsPopover?.hidePopover();
            this.watchedPopover?.hidePopover();
            this.agePopover?.hidePopover();
        } catch {
            if (this.durationPopover) this.durationPopover.style.display = "none";
            if (this.viewsPopover) this.viewsPopover.style.display = "none";
            if (this.watchedPopover) this.watchedPopover.style.display = "none";
            if (this.agePopover) this.agePopover.style.display = "none";
        }
    },
};

const FilterEngine = {
    apply() {
        const cards = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD);
        let matchCount = 0;

        cards.forEach((card) => {
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
                    resolvedTitle = titleEl ? (titleEl.getAttribute("title") || "").trim() : "";
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
                    const durationEl = card.querySelector(CONFIG.SELECTORS.VIDEO_DURATION);
                    durationStr = durationEl ? durationEl.textContent.trim() : "";
                }
                durationSec = DurationParser.parse(durationStr);
                card.__ytsift_duration_sec = durationSec;
            }

            // Static view count is cached on the DOM node to avoid redundant parsing
            let views = card.__ytsift_views;
            if (views === undefined) {
                let parsed = NaN;

                if (cardData) {
                    const viewsPart = DataModelResolver.getVideoViewsPart(cardData);
                    if (viewsPart) {
                        const shortText = DataModelResolver.getNestedValue(viewsPart, "text.content");
                        const longText = DataModelResolver.getNestedValue(viewsPart, "text.accessibility.accessibilityData.label");

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
                        if (txt.includes("view") || txt.includes("visualiza") || txt.includes("vista") || txt.includes("assist")) {
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
                    const shortText = cardData ? DataModelResolver.getNestedValue(DataModelResolver.getVideoViewsPart(cardData), "text.content") : "N/A";
                    const longText = cardData
                        ? DataModelResolver.getNestedValue(DataModelResolver.getVideoViewsPart(cardData), "text.accessibility.accessibilityData.label")
                        : "N/A";
                    console.warn(`[ytsift] Failed to parse views for video: "${title}". Short: "${shortText}", Long: "${longText}", DOM: "${domViewsStr}"`);
                    parsed = 0;
                }

                views = parsed;
                card.__ytsift_views = views;
            }

            // Static age in days is cached on the DOM node to avoid redundant parsing
            let ageDays = card.__ytsift_age_days;
            if (ageDays === undefined) {
                let parsed = NaN;

                if (cardData) {
                    const agePart = DataModelResolver.getVideoAgePart(cardData);
                    if (agePart) {
                        const shortText = DataModelResolver.getNestedValue(agePart, "text.content");
                        const longText = DataModelResolver.getNestedValue(agePart, "text.accessibility.accessibilityData.label");

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
            const watchedPercent = DataModelResolver.getVideoWatchedPercent(cardData, card);

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

            const shouldHide = !(textMatch && watchedMatch && durationMatch && viewsMatch && ageMatch);
            card.classList.toggle(CONFIG.CLASSES.HIDDEN, shouldHide);

            if (!shouldHide) {
                matchCount++;
            }
        });

        const counterEl = document.getElementById("ytsift-counter");
        if (counterEl) {
            counterEl.textContent = `${matchCount} / ${cards.length}`;
        }
    },
};

const QueueManager = {
    enqueueVideo(videoId) {
        const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
        const ytdApp = targetWindow.document.querySelector("ytd-app");
        if (!ytdApp) {
            console.error("[ytsift] Element ytd-app not found.");
            return false;
        }

        const commandExecutor = ytdApp.resolveCommand || (ytdApp.__data__ && ytdApp.__data__.commandExecutor);
        const apiService = ytdApp.apiService_ || (ytdApp.services_ && ytdApp.services_.api);

        const actionPayload = {
            clickTrackingParams: "CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
            addToPlaylistCommand: {
                openMiniplayer: true,
                videoId: videoId,
                listType: "PLAYLIST_EDIT_LIST_TYPE_QUEUE",
                onCreateListCommand: {
                    clickTrackingParams: "CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
                    commandMetadata: {
                        webCommandMetadata: { sendPost: true, apiUrl: "/youtubei/v1/playlist/create" }
                    },
                    createPlaylistServiceEndpoint: { videoIds: [videoId], params: "CAQ%3D" }
                },
                videoIds: [videoId],
                videoCommand: {
                    clickTrackingParams: "CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
                    commandMetadata: {
                        webCommandMetadata: { url: `/watch?v=${videoId}`, webPageType: "WEB_PAGE_TYPE_WATCH", rootVe: 3832 }
                    },
                    watchEndpoint: { videoId: videoId }
                }
            }
        };

        if (typeof commandExecutor === "function") {
            try {
                commandExecutor.call(ytdApp, {
                    signalServiceEndpoint: {
                        signal: "CLIENT_SIGNAL",
                        actions: [actionPayload]
                    }
                });
                console.log(`[ytsift] Native command executed for video: ${videoId}`);
                return true;
            } catch (e) {
                console.warn("[ytsift] Native commandExecutor failed, trying apiService...", e);
            }
        }

        if (apiService && typeof apiService.executeServiceAction === "function") {
            try {
                apiService.executeServiceAction({
                    actionName: "yt-service-request-action",
                    args: [actionPayload, ytdApp]
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
        cards.forEach((card) => {
            if (!card.classList.contains(CONFIG.CLASSES.HIDDEN)) {
                const data = DataModelResolver.getCardData(card);
                const id = DataModelResolver.getVideoId(data, card);
                if (id) {
                    ids.add(id);
                }
            }
        });
        return Array.from(ids);
    }
};

const FetchInterceptor = {
    install() {
        const targetWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

        targetWindow.fetch = new Proxy(targetWindow.fetch, {
            apply(target, thisArg, argArray) {
                const [input, init] = argArray;
                const url = typeof input === "string" ? input : input?.url || "";
                const isBrowseReq = url.includes("/youtubei/v1/browse?prettyPrint=false");

                const isVideosTab = State.channelVideosPattern.test(window.location.href) || State.channelIdVideosPattern.test(window.location.href);

                const method = init?.method || (typeof input === "object" && input?.method) || "GET";
                const isPost = method.toUpperCase() === "POST";
                const areFiltersActive = State.isFilterActive();

                if (isBrowseReq && isVideosTab && isPost && areFiltersActive) {
                    const now = Date.now();
                    const timeSinceLast = now - State.lastFetchTime;
                    if (timeSinceLast < CONFIG.THROTTLE_DELAY) {
                        const waitTime = CONFIG.THROTTLE_DELAY - timeSinceLast;
                        return new Promise((resolve) => setTimeout(resolve, waitTime)).then(() => {
                            State.lastFetchTime = Date.now();
                            return Reflect.apply(target, thisArg, argArray);
                        });
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

        // 1. General Section
        const secGeneral = document.createElement("div");
        secGeneral.className = "ytsift-section-general";

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
        clearBtn.appendChild(DOMRenderer.createSvgIcon("M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"));
        clearBtn.setAttribute("aria-label", "Clear search");

        searchContainer.appendChild(searchIconSpan);
        searchContainer.appendChild(input);
        searchContainer.appendChild(clearBtn);

        const watchedChip = DOMRenderer.createChip({ id: "ytsift-chip-watched", text: "Status ▾", pressed: State.filters.watched.isActive() });

        secGeneral.appendChild(searchContainer);
        secGeneral.appendChild(watchedChip);
        wrapper.appendChild(secGeneral);

        // Separator 1
        const separator1 = document.createElement("div");
        separator1.className = CONFIG.CLASSES.SEPARATOR;
        wrapper.appendChild(separator1);

        // 2. Duration Section
        const secDuration = document.createElement("div");
        secDuration.className = "ytsift-section-duration";

        const durationChip = DOMRenderer.createChip({ id: "ytsift-chip-duration", text: "Duration ▾", pressed: State.filters.duration.isActive() });
        const ageChip = DOMRenderer.createChip({ id: "ytsift-chip-age", text: "Age ▾", pressed: State.filters.age.isActive() });
        secDuration.appendChild(durationChip);
        secDuration.appendChild(ageChip);
        wrapper.appendChild(secDuration);

        // Separator 2
        const separator2 = document.createElement("div");
        separator2.className = CONFIG.CLASSES.SEPARATOR;
        wrapper.appendChild(separator2);

        // 3. Views Section
        const secViews = document.createElement("div");
        secViews.className = "ytsift-section-views";

        const viewsChip = DOMRenderer.createChip({ id: "ytsift-chip-views", text: "Views ▾", pressed: State.filters.views.isActive() });
        secViews.appendChild(viewsChip);
        wrapper.appendChild(secViews);

        // Separator 3
        const separator3 = document.createElement("div");
        separator3.className = CONFIG.CLASSES.SEPARATOR;
        wrapper.appendChild(separator3);

        // 4. Actions Section
        const secActions = document.createElement("div");
        secActions.className = "ytsift-section-actions";

        const counterBadge = document.createElement("span");
        counterBadge.className = CONFIG.CLASSES.COUNTER;
        counterBadge.id = "ytsift-counter";
        counterBadge.textContent = "0 / 0";
        counterBadge.setAttribute("role", "status");
        counterBadge.setAttribute("aria-live", "polite");
        secActions.appendChild(counterBadge);

        const clearAllBtn = document.createElement("button");
        clearAllBtn.id = "ytsift-clear-all";
        clearAllBtn.className = "ytsift-clear-all-btn";
        clearAllBtn.textContent = "Clear All";
        secActions.appendChild(clearAllBtn);

        const enqueueAllBtn = document.createElement("button");
        enqueueAllBtn.id = "ytsift-enqueue-all";
        enqueueAllBtn.className = "ytsift-enqueue-all-btn";
        enqueueAllBtn.textContent = "+ Queue";
        secActions.appendChild(enqueueAllBtn);
        wrapper.appendChild(secActions);

        chipBar.prepend(wrapper);
        State.lastCardCount = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD).length;

        this.wireEvents(input, clearBtn, watchedChip, durationChip, viewsChip, ageChip, clearAllBtn, enqueueAllBtn);
        this.updateWatchedChipText();
        this.updateAgeChipText();

        FilterEngine.apply();
    },

    updateWatchedChipText() {
        const chip = document.getElementById("ytsift-chip-watched");
        if (!chip) return;
        if (!State.filters.watched.isActive()) {
            chip.textContent = "Status ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            const type = State.filters.watched.type;
            const percent = State.filters.watched.percent;
            if (type === "watched") {
                chip.textContent = `Watched (>= ${percent}%) ▾`;
            } else if (type === "unwatched") {
                chip.textContent = `Unwatched (< ${percent}%) ▾`;
            } else {
                chip.textContent = "Status ▾";
                chip.classList.remove(CONFIG.CLASSES.ACTIVE);
                chip.setAttribute("aria-pressed", "false");
            }
        }
    },

    updateDurationChipText() {
        const chip = document.getElementById("ytsift-chip-duration");
        if (!chip) return;
        if (State.filters.duration.preset === null) {
            chip.textContent = "Duration ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            let label = "";
            if (State.filters.duration.preset === "short" && State.filters.duration.min === 0 && State.filters.duration.max === 4) {
                label = "Short";
            } else if (State.filters.duration.preset === "medium" && State.filters.duration.min === 4 && State.filters.duration.max === 20) {
                label = "Medium";
            } else if (State.filters.duration.preset === "long" && State.filters.duration.min === 20 && State.filters.duration.max === Infinity) {
                label = "Long";
            } else {
                const maxText = State.filters.duration.max === Infinity ? "+" : `-${State.filters.duration.max}`;
                label = `${State.filters.duration.min}${maxText}m`;
            }
            chip.textContent = `Duration: ${label} ▾`;
        }
    },

    formatViewsLabel(val) {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1).replace(".0", "")}k`;
        return val;
    },

    updateViewsChipText() {
        const chip = document.getElementById("ytsift-chip-views");
        if (!chip) return;
        if (!State.filters.views.isActive()) {
            chip.textContent = "Views ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            if (State.filters.views.min === 0 && State.filters.views.max === Infinity) {
                chip.textContent = "Views ▾";
                chip.classList.remove(CONFIG.CLASSES.ACTIVE);
                chip.setAttribute("aria-pressed", "false");
                State.filters.views.reset();
            } else {
                let label = "";
                if (State.filters.views.min > 0 && State.filters.views.max === Infinity) {
                    label = `>${this.formatViewsLabel(State.filters.views.min)}`;
                } else if (State.filters.views.min === 0 && State.filters.views.max < Infinity) {
                    label = `<${this.formatViewsLabel(State.filters.views.max)}`;
                } else {
                    label = `${this.formatViewsLabel(State.filters.views.min)}-${this.formatViewsLabel(State.filters.views.max)}`;
                }
                chip.textContent = `Views: ${label} ▾`;
            }
        }
    },

    updateAgeChipText() {
        const chip = document.getElementById("ytsift-chip-age");
        if (!chip) return;
        if (!State.filters.age.isActive()) {
            chip.textContent = "Age ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            if (State.filters.age.min === 0 && State.filters.age.max === Infinity) {
                chip.textContent = "Age ▾";
                chip.classList.remove(CONFIG.CLASSES.ACTIVE);
                chip.setAttribute("aria-pressed", "false");
                State.filters.age.reset();
            } else {
                const formatAgeLabel = (days) => {
                    if (days === 0) return "0d";
                    if (days === Infinity) return "Max";
                    if (days >= 365) {
                        const yrs = days / 365;
                        return `${yrs.toFixed(1).replace(".0", "")}y`;
                    }
                    if (days >= 30) {
                        const mos = days / 30;
                        return `${mos.toFixed(1).replace(".0", "")}mo`;
                    }
                    if (days >= 7) {
                        const wks = days / 7;
                        return `${wks.toFixed(1).replace(".0", "")}w`;
                    }
                    return `${days}d`;
                };

                let label = "";
                if (State.filters.age.min > 0 && State.filters.age.max === Infinity) {
                    label = `>${formatAgeLabel(State.filters.age.min)}`;
                } else if (State.filters.age.min === 0 && State.filters.age.max < Infinity) {
                    label = `<${formatAgeLabel(State.filters.age.max)}`;
                } else {
                    label = `${formatAgeLabel(State.filters.age.min)}-${formatAgeLabel(State.filters.age.max)}`;
                }
                chip.textContent = `Age: ${label} ▾`;
            }
        }
    },

    wireEvents(input, clearBtn, watchedChip, durationChip, viewsChip, ageChip, clearAllBtn, enqueueAllBtn) {
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
            } else if (e.key === "Escape") {
                input.value = "";
                State.filters.text.reset();
                clearBtn.style.visibility = "hidden";
                FilterEngine.apply();
                input.blur();
            }
        });

        watchedChip.addEventListener("click", () => {
            const wasJustClosed = Date.now() - PopoverManager.lastWatchedClosedTime < 150;
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
            const wasJustClosed = Date.now() - PopoverManager.lastDurationClosedTime < 150;
            PopoverManager.hideAll();

            if (wasJustClosed) {
                return;
            }

            PopoverManager.updateDurationInputs(
                !State.filters.duration.isActive() ? "" : State.filters.duration.min,
                State.filters.duration.max === Infinity ? "" : State.filters.duration.max,
            );
            PopoverManager.showDuration(durationChip);
        });

        viewsChip.addEventListener("click", () => {
            const wasJustClosed = Date.now() - PopoverManager.lastViewsClosedTime < 150;
            PopoverManager.hideAll();

            if (wasJustClosed) {
                return;
            }

            PopoverManager.updateViewsInputs(
                !State.filters.views.isActive() ? "" : State.filters.views.min,
                State.filters.views.max === Infinity ? "" : State.filters.views.max,
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
                State.filters.age.max === Infinity ? "" : State.filters.age.max,
            );
            PopoverManager.showAge(ageChip);
        });

        enqueueAllBtn.addEventListener("click", async () => {
            const videoIds = QueueManager.getVisibleVideoIds();
            if (videoIds.length === 0) return;

            enqueueAllBtn.disabled = true;
            enqueueAllBtn.style.opacity = "0.5";
            enqueueAllBtn.style.cursor = "not-allowed";

            const total = videoIds.length;
            for (let i = 0; i < total; i++) {
                enqueueAllBtn.textContent = `Queuing (${i + 1}/${total})`;
                QueueManager.enqueueVideo(videoIds[i]);
                await new Promise((resolve) => setTimeout(resolve, 150));
            }

            enqueueAllBtn.textContent = "Done!";
            setTimeout(() => {
                enqueueAllBtn.textContent = "+ Queue";
                enqueueAllBtn.disabled = false;
                enqueueAllBtn.style.opacity = "1";
                enqueueAllBtn.style.cursor = "pointer";
            }, 1000);
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
            PopoverManager.updateWatchedInputs("all", 10);
            PopoverManager.updateAgeInputs("", "");

            const btnShort = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-short");
            const btnMedium = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-medium");
            const btnLong = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-long");
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
};

const AppObserver = {
    observer: null,

    init() {
        this.observer = new MutationObserver((mutations) => this.handleMutations(mutations));
        this.observer.observe(document.body, { childList: true, subtree: true });
    },

    handleMutations(mutations) {
        // Quick URL check: are we on the videos tab?
        const isVideosTab = State.channelVideosPattern.test(window.location.href) || State.channelIdVideosPattern.test(window.location.href);
        if (!isVideosTab) return;

        const chipBar = document.querySelector(CONFIG.SELECTORS.CHIP_BAR);
        if (!chipBar) return;

        const controlsWrapper = chipBar.querySelector(`.${CONFIG.CLASSES.CONTROLS_WRAPPER}`);
        if (!controlsWrapper) {
            UIBuilder.build(chipBar);
        } else {
            // Only perform query if mutations actually contain nodes added/removed to avoid redundant queries
            let hasCardMutation = false;
            for (let i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0 || mutations[i].removedNodes.length > 0) {
                    hasCardMutation = true;
                    break;
                }
            }

            if (hasCardMutation) {
                const currentCardCount = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD).length;
                if (currentCardCount !== State.lastCardCount) {
                    State.lastCardCount = currentCardCount;
                    FilterEngine.apply();
                }
            }
        }
    },
};

const App = {
    init() {
        StyleManager.inject();
        PopoverManager.init();
        FetchInterceptor.install();
        AppObserver.init();
    },
};

App.init();
