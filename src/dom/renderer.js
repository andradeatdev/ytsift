import { CONFIG } from "@/config.js";

export const DOMRenderer = {
	// SVG nodes created programmatically to comply with Trusted Types CSP
	createSvgIcon(pathD) {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", pathD);
		svg.appendChild(path);
		return svg;
	},

	createChip({ id, text, duration, pressed }) {
		const chip = document.createElement("button");
		chip.className = CONFIG.CLASSES.CHIP;
		if (duration) chip.classList.add(CONFIG.CLASSES.DURATION_CHIP);
		chip.id = id;
		chip.textContent = text;
		if (duration) chip.setAttribute("data-duration", duration);
		chip.setAttribute("aria-pressed", pressed ? "true" : "false");
		return chip;
	},
};
