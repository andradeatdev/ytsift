import { CONFIG } from "@/config.js";
import { FilterEngine } from "@/core/filter-engine.js";
import { Settings } from "@/core/settings.js";
import { State } from "@/core/state.js";
import { DOMRenderer } from "@/dom/renderer.js";
import { QueueManager } from "@/queue/queue-manager.js";
import { PopoverManager } from "@/ui/popover-manager.js";

export const UIBuilder = {
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
