import { container, Lifecycle } from "tsyringe";

export function injectRegister(identifier: Identifier, lifecycle: Lifecycle = Lifecycle.Transient) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        container.register(identifier, { useClass: constructor }, { lifecycle: lifecycle });
    };
}

export type Identifier = "IInitializable" | "EnvManager";
