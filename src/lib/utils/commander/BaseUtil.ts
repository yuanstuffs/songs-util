import { resolvePath } from '#utils/util';

export class BaseUtil {
	public constructor(public readonly destination: string) {
		this.destination = resolvePath(destination);
	}
}
