import createEmotionCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import mixpanel from "mixpanel-browser";

const hydrate = () => {
	const emotionCache = createEmotionCache({ key: "css" });

	mixpanel.init("a5eea8bd8876042048d9da892b2242f9", {
		track_pageview: true,
		persistence: "localStorage",
		ignore_dnt: true,
	});

	startTransition(() => {
		hydrateRoot(
			document.body,
			<StrictMode>
				<CacheProvider value={emotionCache}>
					<RemixBrowser />
				</CacheProvider>
			</StrictMode>
		);
	});
};

if (typeof requestIdleCallback === "function") {
	requestIdleCallback(hydrate);
} else {
	// Safari doesn't support requestIdleCallback
	// https://caniuse.com/requestidlecallback
	setTimeout(hydrate, 1);
}
