import { CONFIG } from "../config.js";
import { UIBuilder } from "../ui/builder.js";
import { PopoverManager } from "../ui/popover-manager.js";
import { StyleManager } from "../ui/style-manager.js";
import { FetchInterceptor } from "./fetch-interceptor.js";
import { FilterEngine } from "./filter-engine.js";
import { State } from "./state.js";

export const AppObserver = {
	observer: null,

	init() {
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
				FilterEngine.apply();
			}
		}
	},
};

export const App = {
	init() {
		StyleManager.inject();
		PopoverManager.init();
		FetchInterceptor.install();
		AppObserver.init();
	},
};
