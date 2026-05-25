import { FilterEngine } from "@/core/filter-engine.js";
import { Settings } from "@/core/settings.js";
import { State } from "@/core/state.js";
import { UIBuilder } from "@/ui/builder.js";

export const PopoverManager = {
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
