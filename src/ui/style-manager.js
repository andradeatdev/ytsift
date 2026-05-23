export const StyleManager = {
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
