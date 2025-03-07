/*
 Copyright 2020 Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

 import AppBase from "./support/AppBase.js";
 import AppLoader from "./loaders/AppLoader.js";
 
 let animationRunning = false;
 const ANIMATION_DURATION = 1000 * 60 * 2; // 2 minutes
 
 class Application extends AppBase {
   // PORTAL //
   portal;
 
   constructor() {
     super();
 
     // LOAD APPLICATION BASE //
     super
       .load()
       .then(() => {
         // APPLICATION LOADER //
         const applicationLoader = new AppLoader({app: this});
         applicationLoader
           .load()
           .then(({portal, group, map, view}) => {
             //console.info(portal, group, map, view);
 
             // PORTAL //
             this.portal = portal;
 
             // APP TITLE //
             this.title = this.title || map?.portalItem?.title || "Application";
             // APP DESCRIPTION //
             this.description = this.description || map?.portalItem?.description || group?.description || "...";
 
             // USER SIGN-IN //
             this.configUserSignIn();
 
             // APPLICATION //
             this.applicationReady({portal, group, map, view})
               .catch(this.displayError)
               .then(() => {
                 // HIDE APP LOADER //
                 document.getElementById("app-loader").removeAttribute("active");
               });
           })
           .catch(this.displayError);
       })
       .catch(this.displayError);
   }
 
   /**
    *
    */
   configUserSignIn() {
     if (this.oauthappid || this.portal?.user) {
       const signIn = document.getElementById("sign-in");
       signIn && (signIn.portal = this.portal);
     }
   }
 
   /**
    *
    * @param view
    */
   configView(view) {
     return new Promise((resolve, reject) => {
       if (view) {
         require(["esri/widgets/Home", "esri/widgets/Search", "esri/widgets/LayerList", "esri/widgets/Legend"], (
           Home,
           Search,
           LayerList,
           Legend
         ) => {
           //
           // CONFIGURE VIEW SPECIFIC STUFF HERE //
           //
           view.set({
             constraints: {snapToZoom: false},
             qualityProfile: "high",
           });
 
           // HOME //
           const home = new Home({view});
           view.ui.add(home, {position: "top-left", index: 0});
 
           // LEGEND //
           /*
            const legend = new Legend({ view: view });
            view.ui.add(legend, {position: 'bottom-left', index: 0});
            */
 
           // SEARCH /
           /*
            const search = new Search({ view: view});
            view.ui.add(legend, {position: 'top-right', index: 0});
            */
 
           // LAYER LIST //
           const layerList = new LayerList({
             container: "layer-list-container",
             view: view,
             listItemCreatedFunction: event => {
               event.item.open = event.item.layer.type === "group";
             },
             visibleElements: {statusIndicators: true},
           });
 
           // VIEW UPDATING //
           this.disableViewUpdating = false;
           const viewUpdating = document.getElementById("view-updating");
           view.ui.add(viewUpdating, "bottom-right");
           this._watchUtils.init(view, "updating", updating => {
             !this.disableViewUpdating && viewUpdating.toggleAttribute("active", updating);
           });
 
           resolve();
         });
       } else {
         resolve();
       }
     });
   }
 
   /**
    *
    * @param portal
    * @param group
    * @param map
    * @param view
    * @returns {Promise}
    */
   applicationReady({portal, group, map, view}) {
     return new Promise(async (resolve, reject) => {
       // VIEW READY //
       this.configView(view)
         .then(() => {
           this.initializeViewSpinTools({view});
           this.initializeSlideTiles({view}).then(resolve).catch(reject);
           this.initializeAnimation(view);
 
           resolve();
         })
         .catch(reject);
     });
   }
 
   /**
    *
    * @param view
    */
   initializeSlideTiles({view}) {
     return new Promise((resolve, reject) => {
       const slideTileTemplate = document.getElementById("slide-tile-template");
       const createSlideTile = (slide, slideIdx) => {
         const templateNode = slideTileTemplate.content.cloneNode(true);
         const slideTile = templateNode.querySelector("calcite-tile-select");
         slideTile.setAttribute("heading", slide.title.text);
         slideTile.setAttribute("description", " "); // blank space critical to maintain vertical layout //
         slideTile.setAttribute("value", slideIdx);
         slideTile.toggleAttribute("checked", slideIdx === 0);
 
         const slideThumb = templateNode.querySelector(".slide-thumb");
         slideThumb.setAttribute("src", slide.thumbnail.url);
 
         slideTile.addEventListener("calciteTileSelectChange", () => {
           setActiveSlide(slideIdx);
           this.stopAnimation();
         });
         return slideTile;
       };
 
       const slides = view.map.presentation.slides;
       const slideTiles = slides.map(createSlideTile);
 
       const slideTileContainer = document.getElementById("slide-tile-container");
       slideTileContainer.replaceChildren(...slideTiles);
 
       setTimeout(() => {
         slideTileContainer.querySelectorAll("calcite-tile-select").forEach(tileSelect => {
           this.setShadowElementStyle(tileSelect, ".container.width-full", "flex-direction", "column");
         });
       }, 500);
 
       const setActiveSlide = slideIdx => {
         const nextSlideItem = slideTileContainer.querySelector(`calcite-tile-select[value="${slideIdx}"]`);
         nextSlideItem.toggleAttribute("checked", true);
         slides.getItemAt(slideIdx).applyTo(view, {speedFactor: 0.3, easing: "linear"});
       };
 
       const updateProgress = document.getElementById("update-progress");
       const _updateProgress = () => {
         updateProgress.value -= 0.001;
       };
 
       const _nextSlide = () => {
         updateProgress.value = 1.0;
         const currentSlideItem = slideTileContainer.querySelector("calcite-tile-select[checked]");
         const currentSlideIdx = +currentSlideItem.getAttribute("value");
         let nextSlideIdx = currentSlideIdx + 1;
         if (nextSlideIdx > slides.length - 1) {
           nextSlideIdx = 0;
         }
         setActiveSlide(nextSlideIdx);
       };
 
       let updateHandle;
       let progressHandle;
       const slidesAction = document.getElementById("slides-action");
       slidesAction.addEventListener("click", () => {
         this.stopAnimation();
         const isActive = slidesAction.toggleAttribute("active");
         slideTileContainer.toggleAttribute("disabled", isActive);
 
         if (isActive) {
           slidesAction.setAttribute("icon", "pause-f");
           updateProgress.value = 1.0;
           updateHandle = setInterval(_nextSlide, 10000);
           progressHandle = setInterval(_updateProgress, 10);
           view.focus();
         } else {
           slidesAction.setAttribute("icon", "play-f");
           updateProgress.value = 0.0;
           updateHandle && clearInterval(updateHandle);
           updateHandle = null;
           progressHandle && clearInterval(progressHandle);
           progressHandle = null;
         }
       });
 
       resolve();
     });
   }
 
   /**
    *
    * @param view
    */
   initializeViewSpinTools({view}) {
     require(["esri/core/watchUtils", "esri/core/promiseUtils"], (watchUtils, promiseUtils) => {
       const viewSpinPanel = document.getElementById("view-spin-panel");
       view.ui.add(viewSpinPanel);
 
       // DISPLAY SPIN TOOLS //
       //viewSpinPanel.removeAttribute('hidden');
 
       let spin_direction = "none";
       let spin_step = 0.05;
 
       const _spin = promiseUtils.debounce(() => {
         if (spin_direction !== "none") {
           const heading = view.camera.heading + (spin_direction === "right" ? spin_step : -spin_step);
           view
             .goTo(
               {
                 center: view.center.clone(),
                 heading: heading,
               },
               {animate: false}
             )
             .then(() => {
               if (spin_direction !== "none") {
                 requestAnimationFrame(_spin);
               }
             });
         }
       });
 
       this.enableSpin = enabled => {
         //viewSpinPanel.classList.toggle("btn-disabled", !enabled);
         if (!enabled) {
           _enableSpin("none");
           spinLeftBtn.removeAttribute("active");
           spinRightBtn.removeAttribute("active");
         }
       };
 
       const _enableSpin = direction => {
         spin_direction = direction;
         if (spin_direction !== "none") {
           _spin();
         }
       };
 
       const spinLeftBtn = document.getElementById("spin-left-btn");
       const headingNode = document.getElementById("spin-heading-label");
       const spinRightBtn = document.getElementById("spin-right-btn");
 
       spinLeftBtn.addEventListener("click", () => {
         spinRightBtn.setAttribute("appearance", "clear");
         _enableSpin("none");
         if (spinLeftBtn.toggleAttribute("active")) {
           _enableSpin("left");
         }
       });
 
       spinRightBtn.addEventListener("click", () => {
         spinLeftBtn.removeAttribute("active");
         _enableSpin("none");
         if (spinRightBtn.toggleAttribute("active")) {
           _enableSpin("right");
         }
       });
 
       const getHeadingLabel = heading => {
         let label = "N";
         switch (true) {
           case heading < 67:
             label = "NE";
             break;
           case heading < 113:
             label = "E";
             break;
           case heading < 157:
             label = "SE";
             break;
           case heading < 202:
             label = "S";
             break;
           case heading < 247:
             label = "SW";
             break;
           case heading < 292:
             label = "W";
             break;
           case heading < 337:
             label = "NW";
             break;
         }
         return label;
       };
 
       watchUtils.init(view, "camera.heading", heading => {
         headingNode.innerHTML = getHeadingLabel(heading);
         headingNode.title = heading.toFixed(0);
       });
     });
   }
 
   stopAnimation() {
     const animationAction = document.getElementById("go-through-tunnel");
     animationRunning = false;
     animationAction.text = "Restart animation";
     animationAction.icon = "play-f";
   }
 
   initializeAnimation(view) {
     const animationAction = document.getElementById("go-through-tunnel");
     require(["esri/core/reactiveUtils"], function (reactiveUtils) {
       function waitForUpdates() {
         return reactiveUtils.whenOnce(() => !view.updating);
       }
 
       function applySlide(name, props = {}) {
         var slide = view.map.presentation.slides.find(s => s.title.text === name);
         return waitForUpdates().then(() => slide.applyTo(view, props));
       }
 
       document.getElementById("go-through-tunnel").addEventListener("click", event => {
         if (!animationRunning) {
           animationAction.text = "Stop animation";
           animationAction.icon = "pause-f";
           animationRunning = true;
           applySlide("Tunnel entrance", {animate: false})
             .then(waitForUpdates)
             .then(() => {
               var layer = view.map.layers.find(l => l.title === "Follow line");
               var query = layer.createQuery();
               query.returnGeometry = true;
               query.returnZ = true;
               query.where = "";
               return layer.queryFeatures(query).then(response => {
                 return response.features[0].geometry;
               });
             })
             .then(line => animateCameraAlongLine(line))
             .catch(console.error);
         } else {
           this.stopAnimation();
         }
       });
 
       function distance(pointA, pointB) {
         const a = pointA[0] - pointB[0];
         const b = pointA[1] - pointB[1];
         return Math.sqrt(a * a + b * b);
       }
 
       function heading(pointA, pointB) {
         const atan2 = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
         return 90 - (atan2 * 180) / Math.PI;
       }
 
       function animateCameraAlongLine(geometry) {
         const path = geometry.paths[0];
         const start = path[0];
         const waypoints = path.slice(1);
 
         const durations = [];
         let totalLength = 0;
 
         waypoints.forEach((point, index) => {
           const length = distance(point, path[index]);
           durations.push(length);
           totalLength += length;
         });
 
         durations.forEach((duration, index) => {
           durations[index] = (duration * ANIMATION_DURATION) / totalLength;
         });
 
         const paths = [start];
 
         const movingPoint = {
           type: "point",
           spatialReference: geometry.spatialReference,
           x: start[0],
           y: start[1],
           z: start[2],
         };
 
         const initialDistance = distance(start, [view.camera.position.x, view.camera.position.y]);
 
         function completeAnimation() {
           paths.push([movingPoint.x, movingPoint.y, movingPoint.z]);
         }
 
         let index = 0;
         let startTime = null;
         let previousPoint = null;
         function step(timestamp) {
           if (durations.length <= index) {
             return;
           }
 
           if (!startTime) {
             startTime = timestamp;
             previousPoint = [movingPoint.x, movingPoint.y, movingPoint.z];
           }
 
           var progress = timestamp - startTime;
 
           const sp = Math.min(1.0, progress / durations[index]);
           movingPoint.x = previousPoint[0] + (waypoints[index][0] - previousPoint[0]) * sp;
           movingPoint.y = previousPoint[1] + (waypoints[index][1] - previousPoint[1]) * sp;
           movingPoint.z = previousPoint[2] + (waypoints[index][2] - previousPoint[2]) * sp;
 
           if (paths.length) {
             // Update camera
             const camera = view.camera.clone();
 
             // Position
             const currentDistance = distance(
               [movingPoint.x, movingPoint.y],
               [view.camera.position.x, view.camera.position.y]
             );
             const dX = movingPoint.x - camera.position.x;
             const dY = movingPoint.y - camera.position.y;
             const dZ = movingPoint.z - camera.position.z;
 
             camera.position.x = camera.position.x + (dX * (currentDistance - initialDistance)) / initialDistance;
             camera.position.y = camera.position.y + (dY * (currentDistance - initialDistance)) / initialDistance;
             camera.position.z = camera.position.z + (dZ * (currentDistance - initialDistance)) / initialDistance;
 
             // Heading
             camera.heading = heading([view.camera.position.x, view.camera.position.y], [movingPoint.x, movingPoint.y]);
             view.camera = camera;
           }
 
           if (progress >= durations[index]) {
             completeAnimation();
             startTime = timestamp + (durations[index] - progress);
             previousPoint = [movingPoint.x, movingPoint.y, movingPoint.z];
             index++;
           }
           if (animationRunning) {
             window.requestAnimationFrame(step);
           }
         }
         reactiveUtils.when(
           () => view.interacting,
           () => {
             animationRunning = false;
             animationAction.text = "Restart animation";
             slidesAction.setAttribute("icon", "pause-f");
           },
           {once: true}
         );
         window.requestAnimationFrame(step);
       }
     }.bind(this));
   }
 }
 
 export default new Application();
 