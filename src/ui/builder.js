import { CONFIG } from "@/config.js";
import { FilterEngine } from "@/core/filter-engine.js";
import { State } from "@/core/state.js";
import { DOMRenderer } from "@/dom/renderer.js";
import { QueueManager } from "@/queue/queue-manager.js";
import { PopoverManager } from "@/ui/popover-manager.js";

export const UIBuilder = {
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
		clearBtn.appendChild(
			DOMRenderer.createSvgIcon(
				"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
			),
		);
		clearBtn.setAttribute("aria-label", "Clear search");

		searchContainer.appendChild(searchIconSpan);
		searchContainer.appendChild(input);
		searchContainer.appendChild(clearBtn);

		const watchedChip = DOMRenderer.createChip({
			id: "ytsift-chip-watched",
			text: "Status ▾",
			pressed: State.filters.watched.isActive(),
		});

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

		const durationChip = DOMRenderer.createChip({
			id: "ytsift-chip-duration",
			text: "Duration ▾",
			pressed: State.filters.duration.isActive(),
		});
		const ageChip = DOMRenderer.createChip({
			id: "ytsift-chip-age",
			text: "Age ▾",
			pressed: State.filters.age.isActive(),
		});
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

		const viewsChip = DOMRenderer.createChip({
			id: "ytsift-chip-views",
			text: "Views ▾",
			pressed: State.filters.views.isActive(),
		});
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
		);
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
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");

		const type = State.filters.watched.type;
		const percent = State.filters.watched.percent;

		if (type === "watched") {
			chip.textContent = `Watched (>= ${percent}%) ▾`;
			return;
		}

		if (type === "unwatched") {
			chip.textContent = `Unwatched (< ${percent}%) ▾`;
			return;
		}

		chip.textContent = "Status ▾";
		chip.classList.remove(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "false");
	},

	updateDurationChipText() {
		const chip = document.getElementById("ytsift-chip-duration");
		if (!chip) return;

		if (State.filters.duration.preset === null) {
			chip.textContent = "Duration ▾";
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");

		const min = State.filters.duration.min;
		const max = State.filters.duration.max;

		if (State.filters.duration.preset === "short" && min === 0 && max === 4) {
			chip.textContent = "Duration: Short ▾";
			return;
		}
		if (State.filters.duration.preset === "medium" && min === 4 && max === 20) {
			chip.textContent = "Duration: Medium ▾";
			return;
		}
		if (
			State.filters.duration.preset === "long" &&
			min === 20 &&
			max === Number.POSITIVE_INFINITY
		) {
			chip.textContent = "Duration: Long ▾";
			return;
		}

		const maxText = max === Number.POSITIVE_INFINITY ? "+" : `-${max}`;
		chip.textContent = `Duration: ${min}${maxText}m ▾`;
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

		if (!State.filters.views.isActive()) {
			chip.textContent = "Views ▾";
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");

		const min = State.filters.views.min;
		const max = State.filters.views.max;

		if (min === 0 && max === Number.POSITIVE_INFINITY) {
			chip.textContent = "Views ▾";
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			State.filters.views.reset();
			return;
		}

		if (min > 0 && max === Number.POSITIVE_INFINITY) {
			chip.textContent = `Views: >${this.formatViewsLabel(min)} ▾`;
			return;
		}

		if (min === 0 && max < Number.POSITIVE_INFINITY) {
			chip.textContent = `Views: <${this.formatViewsLabel(max)} ▾`;
			return;
		}

		chip.textContent = `Views: ${this.formatViewsLabel(min)}-${this.formatViewsLabel(max)} ▾`;
	},

	updateAgeChipText() {
		const chip = document.getElementById("ytsift-chip-age");
		if (!chip) return;

		if (!State.filters.age.isActive()) {
			chip.textContent = "Age ▾";
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			return;
		}

		chip.classList.add(CONFIG.CLASSES.ACTIVE);
		chip.setAttribute("aria-pressed", "true");

		const min = State.filters.age.min;
		const max = State.filters.age.max;

		if (min === 0 && max === Number.POSITIVE_INFINITY) {
			chip.textContent = "Age ▾";
			chip.classList.remove(CONFIG.CLASSES.ACTIVE);
			chip.setAttribute("aria-pressed", "false");
			State.filters.age.reset();
			return;
		}

		const formatAgeLabel = (days) => {
			if (days === 0) return "0d";
			if (days === Number.POSITIVE_INFINITY) return "Max";
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

		if (min > 0 && max === Number.POSITIVE_INFINITY) {
			chip.textContent = `Age: >${formatAgeLabel(min)} ▾`;
			return;
		}

		if (min === 0 && max < Number.POSITIVE_INFINITY) {
			chip.textContent = `Age: <${formatAgeLabel(max)} ▾`;
			return;
		}

		chip.textContent = `Age: ${formatAgeLabel(min)}-${formatAgeLabel(max)} ▾`;
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
};
