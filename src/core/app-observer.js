import { CONFIG } from "@/config.js";
import { FetchInterceptor } from "@/core/fetch-interceptor.js";
import { FilterEngine } from "@/core/filter-engine.js";
import { Settings } from "@/core/settings.js";
import { State } from "@/core/state.js";
import { UIBuilder } from "@/ui/builder.js";
import { PopoverManager } from "@/ui/popover-manager.js";
import { StyleManager } from "@/ui/style-manager.js";

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

export const AppObserver = {
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

export const App = {
	init() {
		Settings.load();
		StyleManager.inject();
		PopoverManager.init();
		FetchInterceptor.install();
		AppObserver.init();
	},
};
