import { FilterEngine } from "@/core/filter-engine.js";
import { State } from "@/core/state.js";
import { UIBuilder } from "@/ui/builder.js";

export const PopoverManager = {
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

			if (max === Number.POSITIVE_INFINITY) {
				maxSlider.value = "120";
				maxValSpan.textContent = "Max";
				return;
			}
			maxSlider.value = max;
			maxValSpan.textContent = `${max}m`;
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
		};

		btnShort.addEventListener("click", () => handlePresetClick("short"));
		btnMedium.addEventListener("click", () => handlePresetClick("medium"));
		btnLong.addEventListener("click", () => handlePresetClick("long"));

		const handleSliderChange = () => {
			let min = Number.parseInt(minSlider.value, 10);
			const max = Number.parseInt(maxSlider.value, 10);

			if (max !== 120 && min > max) {
				min = max;
				minSlider.value = min;
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

		const formatViewsValue = (val) => {
			if (val === 0) return "0";
			if (val === Number.POSITIVE_INFINITY) return "Max";
			if (val >= 1000000)
				return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
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
			let minIndex = Number.parseInt(minSlider.value, 10);
			const maxIndex = Number.parseInt(maxSlider.value, 10);

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
				return;
			}
			sliderContainer.style.opacity = "1";
			slider.disabled = false;
		};

		const handleTypeClick = (type) => {
			State.filters.watched.setCriteria(
				type,
				Number.parseInt(slider.value, 10),
			);
			updateUI();
			UIBuilder.updateWatchedChipText();
			FilterEngine.apply();
		};

		btnAll.addEventListener("click", () => handleTypeClick("all"));
		btnUnwatched.addEventListener("click", () => handleTypeClick("unwatched"));
		btnWatched.addEventListener("click", () => handleTypeClick("watched"));

		slider.addEventListener("input", () => {
			const percent = Number.parseInt(slider.value, 10);
			sliderValue.textContent = `${percent}%`;
			if (State.filters.watched.type !== "all") {
				State.filters.watched.setCriteria(State.filters.watched.type, percent);
				UIBuilder.updateWatchedChipText();
				FilterEngine.apply();
			}
		});
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

		const formatAgeValue = (days) => {
			if (days === 0) return "0 days";
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
			let minIndex = Number.parseInt(minSlider.value, 10);
			const maxIndex = Number.parseInt(maxSlider.value, 10);

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
		const minSlider = this.durationPopover.querySelector(
			"#ytsift-popover-duration-min-slider",
		);
		const maxSlider = this.durationPopover.querySelector(
			"#ytsift-popover-duration-max-slider",
		);
		const minValSpan = this.durationPopover.querySelector(
			"#ytsift-popover-duration-min-val",
		);
		const maxValSpan = this.durationPopover.querySelector(
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

		if (minSlider) minSlider.value = min === "" ? 0 : min;
		if (minValSpan) minValSpan.textContent = `${min === "" ? 0 : min}m`;

		if (maxSlider)
			maxSlider.value =
				max === Number.POSITIVE_INFINITY || max === "" ? 120 : max;
		if (maxValSpan)
			maxValSpan.textContent =
				max === Number.POSITIVE_INFINITY || max === "" ? "Max" : `${max}m`;
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

		const formatViewsValue = (val) => {
			if (val === 0) return "0";
			if (val === Number.POSITIVE_INFINITY) return "Max";
			if (val >= 1000000)
				return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
			if (val >= 1000) return `${(val / 1000).toFixed(1).replace(".0", "")}k`;
			return val.toString();
		};

		const minSlider = this.viewsPopover.querySelector(
			"#ytsift-popover-views-min-slider",
		);
		const maxSlider = this.viewsPopover.querySelector(
			"#ytsift-popover-views-max-slider",
		);
		const minValSpan = this.viewsPopover.querySelector(
			"#ytsift-popover-views-min-val",
		);
		const maxValSpan = this.viewsPopover.querySelector(
			"#ytsift-popover-views-max-val",
		);

		const actualMin = min === "" ? 0 : min;
		const actualMax = max === "" ? Number.POSITIVE_INFINITY : max;

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
		const slider = this.watchedPopover.querySelector(
			"#ytsift-popover-watched-slider",
		);
		const sliderValue = this.watchedPopover.querySelector(
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
		const sliderContainer = this.watchedPopover.querySelector(
			".ytsift-popover-slider-container",
		);

		if (slider) slider.value = percent;
		if (sliderValue) sliderValue.textContent = `${percent}%`;

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

		const formatAgeValue = (days) => {
			if (days === 0) return "0 days";
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

		const minSlider = this.agePopover.querySelector(
			"#ytsift-popover-age-min-slider",
		);
		const maxSlider = this.agePopover.querySelector(
			"#ytsift-popover-age-max-slider",
		);
		const minValSpan = this.agePopover.querySelector(
			"#ytsift-popover-age-min-val",
		);
		const maxValSpan = this.agePopover.querySelector(
			"#ytsift-popover-age-max-val",
		);

		const actualMin = min === "" ? 0 : min;
		const actualMax = max === "" ? Number.POSITIVE_INFINITY : max;

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
