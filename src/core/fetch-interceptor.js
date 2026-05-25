import { Settings } from "@/core/settings.js";
import { State } from "@/core/state.js";

export const FetchInterceptor = {
	install() {
		const targetWindow =
			typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

		targetWindow.fetch = new Proxy(targetWindow.fetch, {
			apply(target, thisArg, argArray) {
				const [input, init] = argArray;
				const url = typeof input === "string" ? input : input?.url || "";
				const isBrowseReq = url.includes(
					"/youtubei/v1/browse?prettyPrint=false",
				);

				const isVideosTab =
					State.channelVideosPattern.test(window.location.href) ||
					State.channelIdVideosPattern.test(window.location.href);

				const method =
					init?.method || (typeof input === "object" && input?.method) || "GET";
				const isPost = method.toUpperCase() === "POST";
				const areFiltersActive = State.isFilterActive();

				if (isBrowseReq && isVideosTab && isPost && areFiltersActive) {
					const now = Date.now();
					const timeSinceLast = now - State.lastFetchTime;
					if (timeSinceLast < Settings.requestThrottle) {
						const waitTime = Settings.requestThrottle - timeSinceLast;
						return new Promise((resolve) => setTimeout(resolve, waitTime)).then(
							() => {
								State.lastFetchTime = Date.now();
								return Reflect.apply(target, thisArg, argArray);
							},
						);
					}
					State.lastFetchTime = Date.now();
				}

				return Reflect.apply(target, thisArg, argArray);
			},
		});
	},
};
