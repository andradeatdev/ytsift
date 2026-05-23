import { CONFIG } from "@/config.js";
import { DataModelResolver } from "@/dom/resolver.js";

export const QueueManager = {
	enqueueVideo(videoId) {
		const targetWindow =
			typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
		const ytdApp = targetWindow.document.querySelector("ytd-app");
		if (!ytdApp) {
			console.error("[ytsift] Element ytd-app not found.");
			return false;
		}

		const commandExecutor =
			ytdApp.resolveCommand || ytdApp.__data__?.commandExecutor;
		const apiService = ytdApp.apiService_ || ytdApp.services_?.api;

		const actionPayload = {
			clickTrackingParams: "CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
			addToPlaylistCommand: {
				openMiniplayer: true,
				videoId: videoId,
				listType: "PLAYLIST_EDIT_LIST_TYPE_QUEUE",
				onCreateListCommand: {
					clickTrackingParams:
						"CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
					commandMetadata: {
						webCommandMetadata: {
							sendPost: true,
							apiUrl: "/youtubei/v1/playlist/create",
						},
					},
					createPlaylistServiceEndpoint: {
						videoIds: [videoId],
						params: "CAQ%3D",
					},
				},
				videoIds: [videoId],
				videoCommand: {
					clickTrackingParams:
						"CMQBEPBbIhMI4anqme3PlAMVZrqVAh0TaiGqygEEl8RGWA==",
					commandMetadata: {
						webCommandMetadata: {
							url: `/watch?v=${videoId}`,
							webPageType: "WEB_PAGE_TYPE_WATCH",
							rootVe: 3832,
						},
					},
					watchEndpoint: { videoId: videoId },
				},
			},
		};

		if (typeof commandExecutor === "function") {
			try {
				commandExecutor.call(ytdApp, {
					signalServiceEndpoint: {
						signal: "CLIENT_SIGNAL",
						actions: [actionPayload],
					},
				});
				console.log(`[ytsift] Native command executed for video: ${videoId}`);
				return true;
			} catch (e) {
				console.warn(
					"[ytsift] Native commandExecutor failed, trying apiService...",
					e,
				);
			}
		}

		if (apiService && typeof apiService.executeServiceAction === "function") {
			try {
				apiService.executeServiceAction({
					actionName: "yt-service-request-action",
					args: [actionPayload, ytdApp],
				});
				console.log(`[ytsift] API service executed for video: ${videoId}`);
				return true;
			} catch (e) {
				console.error("[ytsift] API service execution failed.", e);
			}
		}

		return false;
	},

	getVisibleVideoIds() {
		const cards = document.querySelectorAll(CONFIG.SELECTORS.VIDEO_CARD);
		const ids = new Set();
		for (const card of cards) {
			if (!card.classList.contains(CONFIG.CLASSES.HIDDEN)) {
				const data = DataModelResolver.getCardData(card);
				const id = DataModelResolver.getVideoId(data, card);
				if (id) {
					ids.add(id);
				}
			}
		}
		return Array.from(ids);
	},
};
