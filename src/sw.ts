import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import type {
  RouteMatchCallbackOptions,
  RouteHandlerCallbackOptions,
} from 'workbox-core/types';

type MatchCbOptions = RouteMatchCallbackOptions;
type HandlerCbOptions = RouteHandlerCallbackOptions;

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST, {
  directoryIndex: 'index.html',
  cleanURLs: true,
});

const matchCb = ({ url /*request, event*/ }: MatchCbOptions) => {
  return url.pathname === '/special/url';
};

const handlerCb = async ({
  /*url,*/ request: _request /*event, params*/,
}: HandlerCbOptions) => {
  //const response = await fetch(request);
  //const responseBody = await response.text();
  return new Response(`<!-- Look Ma. Added some Content. -->`, {});
};

registerRoute(matchCb, handlerCb);
