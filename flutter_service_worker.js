'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "7d64e34f02da347abdac4aab8b812db5",
"assets/assets/images/about-img.png": "0dd31bd3b31fbf8028a318a7276602d5",
"assets/assets/images/dish-1.png": "abb83a38153d35ba26c678530b331ede",
"assets/assets/images/dish-2.png": "eefeb8a9d12e987e5baeffd90c81abc4",
"assets/assets/images/dish-3.png": "aad8da1416aa77079c29c2c6f9f67574",
"assets/assets/images/dish-4.png": "72369ac0419998a41b04e40e592c9faf",
"assets/assets/images/dish-5.png": "2ea87bea2ad82604c633eb02f791bec9",
"assets/assets/images/dish-6.png": "1e06f769f1a7fa08f269f81328c66227",
"assets/assets/images/home-img-1.png": "a4564f92b4c09fc381739b663cc259af",
"assets/assets/images/home-img-2.png": "2908fb0cab7229f113f1d86250d45856",
"assets/assets/images/home-img-3.png": "40cb7f9bd95c273ae642efe84b25d184",
"assets/assets/images/loader.gif": "22c5d157973656189720714aa7b49faf",
"assets/assets/images/menu-1.jpg": "260ed0d5c75f513435527f18d145353f",
"assets/assets/images/menu-2.jpg": "fa2920ed48100123f074022425b17f09",
"assets/assets/images/menu-3.jpg": "6220ae2d7e7ac940310717f8da708cd2",
"assets/assets/images/menu-4.jpg": "ccf55f9e85f09846007fe0d4f74d3c5e",
"assets/assets/images/menu-5.jpg": "66330886ecad1a531fad3375eff5682c",
"assets/assets/images/menu-6.jpg": "4cd025190e984e0393468c88e1c01b55",
"assets/assets/images/menu-7.jpg": "6cdf8bacf373b7fe35347efb8543415b",
"assets/assets/images/menu-8.jpg": "4fc6c8c4f8c96694ca17c45da5e7d1ac",
"assets/assets/images/menu-9.jpg": "72c37a6dccf237c43c898a1caf4d64dd",
"assets/assets/images/pic-1.png": "a157ad5ba9710cf12e02e3eb714a824c",
"assets/assets/images/pic-2.png": "5013dfdc1f8223814c90faae1214efed",
"assets/assets/images/pic-3.png": "a49de285c0c794d9625d0ae61f53ba47",
"assets/assets/images/pic-4.png": "74fe1df06ee8719da110ff5919ff6ee3",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "4bf8163397f69a75517d590b5be3a2c1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "a88d11a8a886a61253e33f452714b895",
"/": "a88d11a8a886a61253e33f452714b895",
"main.dart.js": "40d4cd25a0bdf845678e05e2ab2848ac",
"manifest.json": "954a92d3017708f6492c12d4fc79a8da",
"version.json": "eba0230347e30b718faa9090ad3b9465"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
