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
                --ytsift-input-height: 2.15em; /* 28px */
                --ytsift-input-radius: 0.46em; /* 6px */
                --ytsift-input-focus-bg: var(--yt-sys-color-baseline--base-background, #fff);
                
                /* Custom spinner sizing (in ems, relative to --ytsift-popover-font-size) */
                --ytsift-spin-width: 1.69em; /* 22px */
                --ytsift-spin-btn-height: 0.92em; /* 12px */
                --ytsift-spin-icon-size: 1.08em; /* 14px */
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

            .ytsift-time-input,
            .ytsift-views-input {
                border: 1px solid var(--ytsift-outline);
                background-color: var(--ytsift-tonal-bg);
                color: var(--ytsift-text-primary);
                border-radius: var(--ytsift-input-radius);
                height: var(--ytsift-input-height);
                font-size: 1em; /* 13px */
                padding: 0 0.62em; /* 8px */
                font-family: "Roboto", "Arial", sans-serif;
                outline: none;
                box-sizing: border-box;
                vertical-align: middle;
                transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
            }

            .ytsift-time-input {
                width: 5em; /* 60px */
            }

            .ytsift-views-input {
                width: 6.92em; /* 90px */
            }

            .ytsift-time-input:hover,
            .ytsift-views-input:hover {
                background-color: var(--ytsift-hover-bg);
            }

            .ytsift-time-input:focus,
            .ytsift-views-input:focus {
                border-color: var(--ytsift-text-primary);
                background-color: var(--ytsift-input-focus-bg);
                box-shadow: 0 0 0 1px var(--ytsift-text-primary);
            }

            /* Hide browser default spin buttons */
            .ytsift-time-input::-webkit-outer-spin-button,
            .ytsift-time-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .ytsift-time-input {
                -moz-appearance: textfield;
            }

            .ytsift-number-spinner {
                position: relative;
                display: inline-flex;
                align-items: center;
            }

            .ytsift-number-spinner .ytsift-time-input {
                padding-right: calc(var(--ytsift-spin-width) + 0.62em); /* Make room for spinners */
            }

            .ytsift-spin-controls {
                position: absolute;
                right: 0.31em; /* 4px */
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                height: calc(100% - 0.46em); /* 6px height offset */
                justify-content: center;
                width: var(--ytsift-spin-width);
                pointer-events: none;
            }

            .ytsift-spin-btn {
                background: transparent;
                border: none;
                padding: 0;
                margin: 0;
                width: var(--ytsift-spin-width);
                height: var(--ytsift-spin-btn-height);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--ytsift-text-secondary);
                pointer-events: auto;
                transition: color 0.15s;
            }

            .ytsift-spin-btn:hover {
                color: var(--ytsift-text-primary);
            }

            .ytsift-spin-btn svg {
                width: var(--ytsift-spin-icon-size);
                height: var(--ytsift-spin-icon-size);
                fill: currentColor;
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

            ytd-rich-item-renderer.ytsift-hidden {
                display: none !important;
            }
        `);
    },
};

const State = {
    query: "",
    hideWatched: false,
    duration: {
        preset: null,
        min: 0,
        max: Infinity,
    },
    views: {
        active: false,
        min: 0,
        max: Infinity,
    },
    lastCardCount: 0,
    lastFetchTime: 0,

    // Global URLPattern instances to avoid recreation on every fetch
    channelVideosPattern: new URLPattern({ pathname: "/:username/videos" }),
    channelIdVideosPattern: new URLPattern({ pathname: "/channel/:id/videos" }),

    reset() {
        this.query = "";
        this.hideWatched = false;
        this.duration.preset = null;
        this.duration.min = 0;
        this.duration.max = Infinity;
        this.views.active = false;
        this.views.min = 0;
        this.views.max = Infinity;
        this.lastCardCount = 0;
    },

    isFilterActive() {
        return this.query !== "" || this.hideWatched || this.duration.preset !== null || this.views.active;
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

    createNumberSpinner(id, placeholder, ariaLabel) {
        const wrapper = document.createElement("div");
        wrapper.className = "ytsift-number-spinner";

        const input = document.createElement("input");
        input.id = id;
        input.className = "ytsift-time-input";
        input.type = "number";
        input.min = "0";
        input.step = "0.5";
        input.placeholder = placeholder;
        input.setAttribute("aria-label", ariaLabel);

        const spinControls = document.createElement("div");
        spinControls.className = "ytsift-spin-controls";

        const btnUp = document.createElement("button");
        btnUp.className = "ytsift-spin-btn up";
        btnUp.type = "button";
        btnUp.tabIndex = -1;
        btnUp.setAttribute("aria-label", "Increment");
        btnUp.appendChild(this.createSvgIcon("M7 14l5-5 5 5H7z"));

        const btnDown = document.createElement("button");
        btnDown.className = "ytsift-spin-btn down";
        btnDown.type = "button";
        btnDown.tabIndex = -1;
        btnDown.setAttribute("aria-label", "Decrement");
        btnDown.appendChild(this.createSvgIcon("M7 10l5 5 5-5H7z"));

        const stepValue = 0.5;
        btnUp.addEventListener("click", (e) => {
            e.preventDefault();
            const val = parseFloat(input.value);
            const currentVal = Number.isNaN(val) ? 0 : val;
            input.value = (currentVal + stepValue).toFixed(1).replace(".0", "");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });

        btnDown.addEventListener("click", (e) => {
            e.preventDefault();
            const val = parseFloat(input.value);
            if (!Number.isNaN(val) && val > 0) {
                input.value = Math.max(0, val - stepValue)
                    .toFixed(1)
                    .replace(".0", "");
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });

        spinControls.appendChild(btnUp);
        spinControls.appendChild(btnDown);

        wrapper.appendChild(input);
        wrapper.appendChild(spinControls);

        return { wrapper, input };
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

    getVideoWatched(data) {
        const overlays =
            this.getNestedValue(data, "content.lockupViewModel.contentImage.thumbnailViewModel.overlays") ||
            this.getNestedValue(data, "lockupViewModel.contentImage.thumbnailViewModel.overlays");
        if (Array.isArray(overlays)) {
            for (const overlay of overlays) {
                const pb = this.getNestedValue(overlay, "thumbnailBottomOverlayViewModel.progressBar.thumbnailOverlayProgressBarViewModel");
                if (pb) {
                    return true;
                }
                if (overlay.thumbnailOverlayProgressBarRenderer) {
                    return true;
                }
            }
        }
        return false;
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
};

const PopoverManager = {
    durationPopover: null,
    viewsPopover: null,
    lastDurationClosedTime: 0,
    lastViewsClosedTime: 0,

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

        document.body.appendChild(this.durationPopover);
        document.body.appendChild(this.viewsPopover);

        this.buildDurationContent();
        this.buildViewsContent();
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

        const inputsRow = document.createElement("div");
        inputsRow.className = "ytsift-popover-inputs-row";

        const minSpinner = DOMRenderer.createNumberSpinner("ytsift-popover-duration-min", "Min", "Minimum duration in minutes");
        const minInput = minSpinner.input;

        const labelMin = document.createElement("span");
        labelMin.textContent = "m";

        const hyphen = document.createElement("span");
        hyphen.textContent = "-";

        const maxSpinner = DOMRenderer.createNumberSpinner("ytsift-popover-duration-max", "Max", "Maximum duration in minutes");
        const maxInput = maxSpinner.input;

        const labelMax = document.createElement("span");
        labelMax.textContent = "m";

        inputsRow.appendChild(minSpinner.wrapper);
        inputsRow.appendChild(labelMin);
        inputsRow.appendChild(hyphen);
        inputsRow.appendChild(maxSpinner.wrapper);
        inputsRow.appendChild(labelMax);

        container.appendChild(presetsRow);
        container.appendChild(inputsRow);
        this.durationPopover.appendChild(container);

        const updatePresetActiveClasses = (activePreset) => {
            btnShort.classList.toggle("active", activePreset === "short");
            btnMedium.classList.toggle("active", activePreset === "medium");
            btnLong.classList.toggle("active", activePreset === "long");
        };

        const handlePresetClick = (preset) => {
            const isCurrent = State.duration.preset === preset;
            if (isCurrent) {
                State.duration.preset = null;
                State.duration.min = 0;
                State.duration.max = Infinity;
                minInput.value = "";
                maxInput.value = "";
            } else {
                State.duration.preset = preset;
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
                State.duration.min = min;
                State.duration.max = max;
                minInput.value = min;
                maxInput.value = max === Infinity ? "" : max;
            }
            updatePresetActiveClasses(State.duration.preset);
            UIBuilder.updateDurationChipText();
            FilterEngine.apply();
        };

        btnShort.addEventListener("click", () => handlePresetClick("short"));
        btnMedium.addEventListener("click", () => handlePresetClick("medium"));
        btnLong.addEventListener("click", () => handlePresetClick("long"));

        const handleInputChange = () => {
            const min = parseFloat(minInput.value) || 0;
            const max = parseFloat(maxInput.value);
            State.duration.min = min;
            State.duration.max = Number.isNaN(max) ? Infinity : max;

            if (State.duration.min === 0 && State.duration.max === 4) {
                State.duration.preset = "short";
            } else if (State.duration.min === 4 && State.duration.max === 20) {
                State.duration.preset = "medium";
            } else if (State.duration.min === 20 && State.duration.max === Infinity) {
                State.duration.preset = "long";
            } else {
                State.duration.preset = "custom";
            }

            updatePresetActiveClasses(State.duration.preset);
            UIBuilder.updateDurationChipText();
            FilterEngine.apply();
        };

        minInput.addEventListener("input", handleInputChange);
        maxInput.addEventListener("input", handleInputChange);
    },

    buildViewsContent() {
        const container = document.createElement("div");
        container.className = "ytsift-popover-views-container";

        const minInput = document.createElement("input");
        minInput.id = "ytsift-popover-views-min";
        minInput.className = "ytsift-views-input";
        minInput.type = "text";
        minInput.placeholder = "Min: e.g. 10k";
        minInput.setAttribute("aria-label", "Minimum views");

        const hyphen = document.createElement("span");
        hyphen.textContent = "-";

        const maxInput = document.createElement("input");
        maxInput.id = "ytsift-popover-views-max";
        maxInput.className = "ytsift-views-input";
        maxInput.type = "text";
        maxInput.placeholder = "Max: e.g. 1M";
        maxInput.setAttribute("aria-label", "Maximum views");

        const handleUpdate = () => {
            const minStr = minInput.value.trim();
            const maxStr = maxInput.value.trim();
            const minVal = minStr ? ViewsParser.parseViews(minStr) : 0;
            const maxVal = maxStr ? ViewsParser.parseViews(maxStr) : Infinity;

            State.views.min = minVal;
            State.views.max = maxVal;
            State.views.active = minVal > 0 || maxVal < Infinity;

            UIBuilder.updateViewsChipText();
            FilterEngine.apply();
        };

        minInput.addEventListener("input", handleUpdate);
        maxInput.addEventListener("input", handleUpdate);

        container.appendChild(minInput);
        container.appendChild(hyphen);
        container.appendChild(maxInput);
        this.viewsPopover.appendChild(container);
    },

    updateDurationInputs(min, max) {
        const minInput = this.durationPopover.querySelector("#ytsift-popover-duration-min");
        const maxInput = this.durationPopover.querySelector("#ytsift-popover-duration-max");
        if (minInput) minInput.value = min;
        if (maxInput) maxInput.value = max === Infinity ? "" : max;
    },

    updateViewsInputs(minStr, maxStr) {
        const minInput = this.viewsPopover.querySelector("#ytsift-popover-views-min");
        const maxInput = this.viewsPopover.querySelector("#ytsift-popover-views-max");
        if (minInput) minInput.value = minStr;
        if (maxInput) maxInput.value = maxStr;
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

    isDurationOpen() {
        return this.durationPopover && (this.durationPopover.matches(":popover-open") || this.durationPopover.style.display === "block");
    },

    isViewsOpen() {
        return this.viewsPopover && (this.viewsPopover.matches(":popover-open") || this.viewsPopover.style.display === "block");
    },

    hideAll() {
        try {
            this.durationPopover?.hidePopover();
            this.viewsPopover?.hidePopover();
        } catch {
            if (this.durationPopover) this.durationPopover.style.display = "none";
            if (this.viewsPopover) this.viewsPopover.style.display = "none";
        }
    },
};

const FilterEngine = {
    apply() {
        const cards = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD);
        let matchCount = 0;

        const allWords = State.query.toLowerCase().split(/\s+/).filter(Boolean);
        const positiveWords = [];
        const negativeWords = [];

        for (const word of allWords) {
            if (word.startsWith("-") && word.length > 1) {
                negativeWords.push(word.slice(1));
            } else {
                positiveWords.push(word);
            }
        }

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

            // Watched status must be queried dynamically to reflect live watch state changes
            const isWatched = (cardData ? DataModelResolver.getVideoWatched(cardData) : false) || card.querySelector(CONFIG.SELECTORS.VIDEO_WATCHED) !== null;

            let textMatch = true;
            if (positiveWords.length > 0 || negativeWords.length > 0) {
                const titleLower = title.toLowerCase();
                const matchesPositive = positiveWords.every((word) => titleLower.includes(word));
                const matchesNegative = negativeWords.some((word) => titleLower.includes(word));
                textMatch = matchesPositive && !matchesNegative;
            }

            let watchedMatch = true;
            if (State.hideWatched && isWatched) {
                watchedMatch = false;
            }

            let durationMatch = true;
            if (State.duration.preset !== null) {
                const minSec = State.duration.min * 60;
                const maxSec = State.duration.max * 60;
                durationMatch = durationSec >= minSec && durationSec <= maxSec;
            }

            let viewsMatch = true;
            if (State.views.active) {
                viewsMatch = views >= State.views.min && views <= State.views.max;
            }

            const shouldHide = !(textMatch && watchedMatch && durationMatch && viewsMatch);
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
        input.value = State.query;
        input.setAttribute("aria-label", "Filter videos by keyword");

        const clearBtn = document.createElement("button");
        clearBtn.className = CONFIG.CLASSES.CLEAR_BTN;
        clearBtn.appendChild(DOMRenderer.createSvgIcon("M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"));
        clearBtn.setAttribute("aria-label", "Clear search");

        searchContainer.appendChild(searchIconSpan);
        searchContainer.appendChild(input);
        searchContainer.appendChild(clearBtn);

        const watchedChip = DOMRenderer.createChip({ id: "ytsift-chip-watched", text: "Unwatched", pressed: State.hideWatched });

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

        const durationChip = DOMRenderer.createChip({ id: "ytsift-chip-duration", text: "Duration ▾", pressed: State.duration.preset !== null });
        secDuration.appendChild(durationChip);
        wrapper.appendChild(secDuration);

        // Separator 2
        const separator2 = document.createElement("div");
        separator2.className = CONFIG.CLASSES.SEPARATOR;
        wrapper.appendChild(separator2);

        // 3. Views Section
        const secViews = document.createElement("div");
        secViews.className = "ytsift-section-views";

        const viewsChip = DOMRenderer.createChip({ id: "ytsift-chip-views", text: "Views ▾", pressed: State.views.active });
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
        wrapper.appendChild(secActions);

        chipBar.prepend(wrapper);
        State.lastCardCount = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD).length;

        this.wireEvents(input, clearBtn, watchedChip, durationChip, viewsChip, clearAllBtn);

        FilterEngine.apply();
    },

    updateDurationChipText() {
        const chip = document.getElementById("ytsift-chip-duration");
        if (!chip) return;
        if (State.duration.preset === null) {
            chip.textContent = "Duration ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            let label = "";
            if (State.duration.preset === "short" && State.duration.min === 0 && State.duration.max === 4) {
                label = "Short";
            } else if (State.duration.preset === "medium" && State.duration.min === 4 && State.duration.max === 20) {
                label = "Medium";
            } else if (State.duration.preset === "long" && State.duration.min === 20 && State.duration.max === Infinity) {
                label = "Long";
            } else {
                const maxText = State.duration.max === Infinity ? "+" : `-${State.duration.max}`;
                label = `${State.duration.min}${maxText}m`;
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
        if (!State.views.active) {
            chip.textContent = "Views ▾";
            chip.classList.remove(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "false");
        } else {
            chip.classList.add(CONFIG.CLASSES.ACTIVE);
            chip.setAttribute("aria-pressed", "true");
            if (State.views.min === 0 && State.views.max === Infinity) {
                chip.textContent = "Views ▾";
                chip.classList.remove(CONFIG.CLASSES.ACTIVE);
                chip.setAttribute("aria-pressed", "false");
                State.views.active = false;
            } else {
                let label = "";
                if (State.views.min > 0 && State.views.max === Infinity) {
                    label = `>${this.formatViewsLabel(State.views.min)}`;
                } else if (State.views.min === 0 && State.views.max < Infinity) {
                    label = `<${this.formatViewsLabel(State.views.max)}`;
                } else {
                    label = `${this.formatViewsLabel(State.views.min)}-${this.formatViewsLabel(State.views.max)}`;
                }
                chip.textContent = `Views: ${label} ▾`;
            }
        }
    },

    wireEvents(input, clearBtn, watchedChip, durationChip, viewsChip, clearAllBtn) {
        input.addEventListener("input", () => {
            State.query = input.value;
            clearBtn.style.visibility = input.value.length > 0 ? "visible" : "hidden";
            FilterEngine.apply();
        });

        clearBtn.addEventListener("click", () => {
            input.value = "";
            State.query = "";
            clearBtn.style.visibility = "hidden";
            FilterEngine.apply();
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                input.blur();
            } else if (e.key === "Escape") {
                input.value = "";
                State.query = "";
                clearBtn.style.visibility = "hidden";
                FilterEngine.apply();
                input.blur();
            }
        });

        watchedChip.addEventListener("click", () => {
            State.hideWatched = !State.hideWatched;
            watchedChip.classList.toggle(CONFIG.CLASSES.ACTIVE, State.hideWatched);
            watchedChip.setAttribute("aria-pressed", State.hideWatched ? "true" : "false");
            FilterEngine.apply();
        });

        durationChip.addEventListener("click", () => {
            const wasJustClosed = Date.now() - PopoverManager.lastDurationClosedTime < 150;
            PopoverManager.hideAll();

            if (wasJustClosed) {
                return;
            }

            PopoverManager.updateDurationInputs(
                State.duration.min === 0 && State.duration.max === Infinity ? "" : State.duration.min,
                State.duration.max === Infinity ? "" : State.duration.max,
            );
            PopoverManager.showDuration(durationChip);
        });

        viewsChip.addEventListener("click", () => {
            const wasJustClosed = Date.now() - PopoverManager.lastViewsClosedTime < 150;
            PopoverManager.hideAll();

            if (wasJustClosed) {
                return;
            }

            PopoverManager.updateViewsInputs(State.views.min === 0 ? "" : State.views.min, State.views.max === Infinity ? "" : State.views.max);
            PopoverManager.showViews(viewsChip);
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

            PopoverManager.hideAll();
            PopoverManager.updateDurationInputs("", "");
            PopoverManager.updateViewsInputs("", "");

            const btnShort = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-short");
            const btnMedium = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-medium");
            const btnLong = PopoverManager.durationPopover.querySelector("#ytsift-popover-preset-long");
            if (btnShort) btnShort.classList.remove("active");
            if (btnMedium) btnMedium.classList.remove("active");
            if (btnLong) btnLong.classList.remove("active");

            State.reset();
            this.updateDurationChipText();
            this.updateViewsChipText();
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
