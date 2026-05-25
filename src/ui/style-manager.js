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
