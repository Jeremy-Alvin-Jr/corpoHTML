const styleAmbush = function() {
    let object = {};
    let animationActive = true;
    let active = true;

    let visibleElements = new Set();
    let intersectionUpdate = function(entries, observer) {
        for(const entry of entries) {
            if(entry.isIntersecting) {
                visibleElements.add(entry.target);
            } else {
                visibleElements.delete(entry.target);
                entry.target.classList.remove("ambushed");
            }
        }
    }
    let observer = new IntersectionObserver(intersectionUpdate, {
        threshold: 0, root: null
    });
    let onScroll = function(e) {
        for(const element of visibleElements) {
            let top = element.getBoundingClientRect().top;
            let topFromBottom = window.innerHeight - top;
            if(element.classList.contains("styleambush")) {
                if(topFromBottom > object.ambush.bottomRevealLine)
                    element.classList.add("ambushed");
                else
                    element.classList.remove("ambushed");
            }
            if(element.classList.contains("animatedambush")) {
                let found = false;
                for(const animation of element.getAnimations()) {
                    if(animation.animationName === "animatedambush") {
                        let options = object.scrollAnimation;
                        let timing = animation.effect.getComputedTiming();
                        let duration = timing.activeDuration;
                        let time = (topFromBottom - options.bottomRevealLine);
                        time *= options.revealingSpeed;
                        time = Math.max(time, 0);
                        time = Math.min(time, duration-1);
                        animation.currentTime = time;
                        found = true;
                        break;
                    }
                }
                if(!found)
                    throw new Error("StyleAmbush: animation 'animatedambush' not found");
            }
        }
    }
    
    Object.defineProperty(object, "ambush", {value: {bottomRevealLine: 200}});
    Object.defineProperty(object, "scrollAnimation", {value: {
        bottomRevealLine: 100, revealingSpeed: 1
    }});

    object.deactivateAnimation = function() {
        animationActive = false;
    }
    object.activateAnimation = function() {
        animationActive = true;
    }
    object.stop = function() {
        active = false;
        observer.disconnect();
    }

    object.registerElement = function(element) {
        let classes = element.classList;
        if(!(classes.contains("styleambush") || classes.contains("animatedambush"))) {
            throw new Error(
                "StyleAmbush: element " + element +
                "needs to contain 'styleambush' or 'animatedambush' class"
            );
        }
        observer.observe(element);
    }
    object.unregisterElement = function(element) {
        observer.unobserve(element);
    }

    document.addEventListener("scroll", onScroll);
    return object;
}();

document.addEventListener("DOMContentLoaded", function(event) {
    let entries = document.getElementsByClassName("animatedambush");
    for(const entry of entries) {
        styleAmbush.registerElement(entry);
    }
    entries = document.getElementsByClassName("styleambush");
    for(const entry of entries) {
        if(!entry.classList.contains("animatedambush"))
            styleAmbush.registerElement(entry);
    }
});