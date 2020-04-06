declare module sdkbox {     module ChartboostListener {        /*!        * there is cached content        */        export function onChartboostCached(name : string) : object;
        /*!        * should Chartboost display        */        export function onChartboostShouldDisplay(name : string) : boolean;
        /*!        * Charboost ad has displayed        */        export function onChartboostDisplay(name : string) : object;
        /*!        * Chartboost ad has been dismissed        */        export function onChartboostDismiss(name : string) : object;
        /*!        * Chartboost is not running        */        export function onChartboostClose(name : string) : object;
        /*!        * Chartboost ad was clicked on        */        export function onChartboostClick(name : string) : object;
        /*!        * Chartboost reward was given        */        export function onChartboostReward(name : string , reward : number) : object;
        /*!        * Chartboost failed to load        */        export function onChartboostFailedToLoad(name : string , e : object) : object;
        /*!        * Chartboost failed to record click        */        export function onChartboostFailToRecordClick(name : string , e : object) : object;
        /*!        * Chartboost confirmation        */        export function onChartboostConfirmation() : object;
        /*!        * Chartboost complete store        */        export function onChartboostCompleteStore() : object;
    }     module PluginChartboost {        /*!        * Set to restrict Chartboost's ability to collect personal data from the device.        * When this is set to YES. IDFA and ip address will not be collected by the SDK or the server.        * This method should be called before init        */        export function restrictDataCollection(shouldRestrict : boolean) : object;
        /*!        * initialize the plugin instance.        */        export function init(jsonconfig : object) : object;
        /*!        * show ad by specifying ad name.        */        export function show(name : string) : object;
        /*!        * creates the an optional listener.        */        export function setListener(listener : object) : object;
        export function getListener() : object;
        /*!        * removed the listener.        */        export function removeListener() : object;
        /*!        * check to see if any views are visible.        */        export function isAnyViewVisible() : boolean;
        /*!        * is the specified ad available?        */        export function isAvailable(name : string) : boolean;
        export function cache(name : string) : object;
        /*!        * set to enable and disable the auto cache feature (Enabled by default).        */        export function setAutoCacheAds(shouldCache : boolean) : object;
        /*!        * get the current auto cache behavior (Enabled by default).        */        export function getAutoCacheAds() : boolean;
        /*!        * close any visible Chartboost impressions (interstitials, more apps, rewarded        * video, etc..) and the loading view (if visible).        *        * deprecated >= 2.3.x        */        export function closeImpression() : object;
        /*!        * set to control how the fullscreen ad units should interact with the status bar.        * (CBStatusBarBehaviorIgnore by default).        */        export function setStatusBarBehavior(behavior : object) : object;
        /*!        * confirm if an age gate passed or failed. When specified Chartboost will wait for        * call before showing the IOS App Store.        */        export function didPassAgeGate(pass : boolean) : object;
        /*!        * decide if Chartboost SDK should block for an age gate.        */        export function setShouldPauseClickForConfirmation(shouldPause : boolean) : object;
        /*!        * opens a "deep link" URL for a Chartboost Custom Scheme.        */        export function handleOpenURL(url : string , sourceApp : string) : boolean;
        /*!        * set a custom identifier to send in the POST body for all Chartboost API server requests.        */        export function setCustomID(customID : string) : object;
        /*!        * get the current custom identifier being sent in the POST body for all Chartboost        * API server requests.        */        export function getCustomID() : string;
        /*!        * decide if Chartboost SDK should show interstitials in the first session.        */        export function setShouldRequestInterstitialsInFirstSession(shouldRequest : boolean) : object;
        /*!        * decide if Chartboost SDK should show a loading view while preparing to display        * the "more applications" UI.        */        export function setShouldDisplayLoadingViewForMoreApps(shouldDisplay : boolean) : object;
        /*!        * decide if Chartboost SDK will attempt to fetch videos from the Chartboost API        * servers.        */        export function setShouldPrefetchVideoContent(shouldPrefetch : boolean) : object;
    }}