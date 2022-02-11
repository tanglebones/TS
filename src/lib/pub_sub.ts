import {registryType} from "./registry";

export type pubSubMessageHandlerType = (message: string) => Promise<void>;

export type pubSubType = {
  pub(message: string): Promise<void>,
  sub(handler: pubSubMessageHandlerType): () => void,
};

/**
 * Returns a pubSubCtor for use in creating pubSub channels.
 * `pub` resolves when all subscribed message handlers have resolved.
 *
 * In general it is not advisable to use the pubSub pattern as analysing what will happen when a message is published
 * becomes complex quickly.
 *
 * @param tuidFactory
 * @param registryFactory
 */
export const pubSubCtorCtor = (tuidFactory: () => string, registryFactory: <T>() => registryType<T>) => {
  return () => {
    const subs = registryFactory<pubSubMessageHandlerType>();

    const sub = (handler: pubSubMessageHandlerType) => subs.register(tuidFactory(), handler);

    const pub = async (message: string) => {
      await Promise.all(
        subs
          .values
          .map(
            async handler => handler(message),
          )
      );
    };

    const r: pubSubType = {pub, sub};
    return r;
  };
};