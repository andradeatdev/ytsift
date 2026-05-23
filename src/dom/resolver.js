export const DataModelResolver = {
	getCardData(card) {
		if (!card) return null;
		return card.data || card.__data || null;
	},

	getNestedValue(obj, path) {
		if (!obj || !path) return undefined;
		const parts = path.split(".");
		let current = obj;
		for (const part of parts) {
			if (current == null) return undefined;
			current = current[part];
		}
		return current;
	},

	getVideoTitle(data) {
		return (
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.title.content",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.title.content",
			)
		);
	},

	getVideoDuration(data) {
		const overlays =
			this.getNestedValue(
				data,
				"content.lockupViewModel.contentImage.thumbnailViewModel.overlays",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.contentImage.thumbnailViewModel.overlays",
			);
		if (Array.isArray(overlays)) {
			for (const overlay of overlays) {
				const timeStatus = overlay.thumbnailOverlayTimeStatusRenderer;
				if (timeStatus) {
					const content = this.getNestedValue(timeStatus, "text.content");
					if (content) return content;
				}
				const bottomOverlay = overlay.thumbnailBottomOverlayViewModel;
				if (bottomOverlay && Array.isArray(bottomOverlay.badges)) {
					for (const badge of bottomOverlay.badges) {
						const badgeModel = badge.thumbnailBadgeViewModel;
						if (badgeModel?.text) {
							return badgeModel.text;
						}
					}
				}
			}
		}
		return undefined;
	},

	getVideoWatchedPercent(data, card) {
		if (data) {
			const overlays =
				this.getNestedValue(
					data,
					"content.lockupViewModel.contentImage.thumbnailViewModel.overlays",
				) ||
				this.getNestedValue(
					data,
					"lockupViewModel.contentImage.thumbnailViewModel.overlays",
				);
			if (Array.isArray(overlays)) {
				for (const overlay of overlays) {
					const pb = this.getNestedValue(
						overlay,
						"thumbnailBottomOverlayViewModel.progressBar.thumbnailOverlayProgressBarViewModel",
					);
					if (pb && pb.startPercent !== undefined) {
						return pb.startPercent;
					}
					const renderer = overlay.thumbnailOverlayProgressBarRenderer;
					if (renderer && renderer.percentWatched !== undefined) {
						return renderer.percentWatched;
					}
				}
			}
		}
		// DOM fallback
		const pbEl = card.querySelector(
			"ytd-thumbnail-overlay-progress-bar-renderer, yt-thumbnail-overlay-progress-bar-view-model, [role='progressbar']",
		);
		if (pbEl) {
			const getPercentFromStyle = (el) => {
				const widthStr = el.style.width;
				if (widthStr?.includes("%")) {
					const match = widthStr.match(/(\d+(?:\.\d+)?)\s*%/);
					if (match) return Number.parseFloat(match[1]);
				}
				return null;
			};
			let p = getPercentFromStyle(pbEl);
			if (p === null) {
				const children = pbEl.querySelectorAll("*");
				for (const child of children) {
					p = getPercentFromStyle(child);
					if (p !== null) break;
				}
			}
			if (p !== null) return p;
			return 100; // Found progress bar but no style width, assume fully watched
		}
		return 0;
	},

	getVideoViewsPart(data) {
		const metadataParts = [];

		const partsA =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			);
		if (Array.isArray(partsA)) {
			metadataParts.push(...partsA);
		}

		const rowsB =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			);
		if (Array.isArray(rowsB)) {
			for (const row of rowsB) {
				if (Array.isArray(row.metadataParts)) {
					metadataParts.push(...row.metadataParts);
				}
			}
		}

		for (const part of metadataParts) {
			const text = this.getNestedValue(part, "text.content");
			const label = this.getNestedValue(
				part,
				"text.accessibility.accessibilityData.label",
			);
			const combined = `${text || ""} ${label || ""}`.toLowerCase();
			if (
				combined.includes("view") ||
				combined.includes("visualiza") ||
				combined.includes("vista") ||
				combined.includes("assist")
			) {
				return part;
			}
		}
		return undefined;
	},

	getVideoAgePart(data) {
		const metadataParts = [];

		const partsA =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadataLine.metadataParts",
			);
		if (Array.isArray(partsA)) {
			metadataParts.push(...partsA);
		}

		const rowsB =
			this.getNestedValue(
				data,
				"content.lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			) ||
			this.getNestedValue(
				data,
				"lockupViewModel.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows",
			);
		if (Array.isArray(rowsB)) {
			for (const row of rowsB) {
				if (Array.isArray(row.metadataParts)) {
					metadataParts.push(...row.metadataParts);
				}
			}
		}

		for (const part of metadataParts) {
			const text = this.getNestedValue(part, "text.content");
			const label = this.getNestedValue(
				part,
				"text.accessibility.accessibilityData.label",
			);
			const combined = `${text || ""} ${label || ""}`.toLowerCase();
			if (
				combined.includes("ago") ||
				combined.includes("há ") ||
				combined.includes("minut") ||
				combined.includes("hour") ||
				combined.includes("hora") ||
				combined.includes("day") ||
				combined.includes("dia") ||
				combined.includes("week") ||
				combined.includes("semana") ||
				combined.includes("month") ||
				combined.includes("mês") ||
				combined.includes("meses") ||
				combined.includes("year") ||
				combined.includes("ano")
			) {
				return part;
			}
		}
		return undefined;
	},

	getVideoId(data, card) {
		if (data) {
			const path1 =
				"content.lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
			const path2 =
				"lockupViewModel.contentImage.thumbnailViewModel.videoThumbnailCommand.watchEndpoint.videoId";
			const path3 =
				"content.lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
			const path4 =
				"lockupViewModel.metadata.lockupMetadataViewModel.title.command.watchEndpoint.videoId";
			const id =
				this.getNestedValue(data, path1) ||
				this.getNestedValue(data, path2) ||
				this.getNestedValue(data, path3) ||
				this.getNestedValue(data, path4);
			if (id) return id;
		}

		// DOM fallback
		const anchor = card.querySelector("a[href*='/watch?v=']");
		if (anchor) {
			const href = anchor.getAttribute("href");
			const match = href.match(/[?&]v=([^&#]+)/);
			if (match) return match[1];
		}
		return null;
	},
};
