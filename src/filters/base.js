export class BaseFilter {
	constructor() {
		this.active = false;
	}
	isActive() {
		return this.active;
	}
	reset() {
		this.active = false;
	}
	matches(_metadata) {
		return true;
	}
}
