import { container, type Container, type Piece } from '@sapphire/pieces';
import type { Ctor } from '@sapphire/utilities';

/**
 * A way to use ApplyOptions without installing @sapphire/discord*-utilities dep
 * @see https://github.com/sapphiredev/utilities/blob/caddeb87b74b0ff7dd489c2d7f82238ab6b71f22/packages/decorators/src/piece-decorators.ts
 * @see https://github.com/sapphiredev/utilities/blob/caddeb87b74b0ff7dd489c2d7f82238ab6b71f22/packages/decorators/src/utils.ts
 */

/**
 * Decorator function that applies given options to any Sapphire piece
 * @param optionsOrFn The options or function that returns options to pass to the piece constructor
 */
export function ApplyOptions<T extends Piece.Options>(optionsOrFn: T | ((parameters: ApplyOptionsCallbackParameters) => T)): ClassDecorator {
	return createClassDecorator((target: Ctor<ConstructorParameters<typeof Piece>, Piece>) =>
		createProxy(target, {
			construct: (ctor, [context, baseOptions = {}]: [Piece.LoaderContext, Piece.Options]) =>
				new ctor(context, {
					...baseOptions,
					...(typeof optionsOrFn === 'function' ? optionsOrFn({ container, context }) : optionsOrFn)
				})
		})
	);
}

/**
 * Utility to make a class decorator with lighter syntax and inferred types.
 * @param fn The class to decorate
 * @see {@link ApplyOptions}
 */
export function createClassDecorator<TFunction extends (...args: any[]) => void>(fn: TFunction): ClassDecorator {
	return fn;
}

/**
 * Creates a new proxy to efficiently add properties to class without creating subclasses
 * @param target The constructor of the class to modify
 * @param handler The handler function to modify the constructor behavior for the target
 * @hidden
 */
export function createProxy<T extends object>(target: T, handler: Omit<ProxyHandler<T>, 'get'>): T {
	return new Proxy(target, {
		...handler,
		get: (target, property) => {
			const value = Reflect.get(target, property);
			return typeof value === 'function' ? (...args: readonly unknown[]) => value.apply(target, args) : value;
		}
	});
}

export interface ApplyOptionsCallbackParameters {
	container: Container;
	context: Piece.LoaderContext;
}
