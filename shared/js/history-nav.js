/*
==================================================================
// Back and Forward
==================================================================
Binder's Back/Forward pair, on every page of the site. The places it
walks are the tab's history entries for this site, as the browser lists
them (the Navigation API): the home page, and each gallery's visits.
Held for a moment, or dragged off, a button lists the places its way,
nearest first, as Binder's segments do.

A page with places of its own (a gallery, whose sidebar choices are
visits) hands setUpSiteHistoryNav what it knows of them, and calls
refreshSiteHistoryNav whenever they change. Any other page (the home
page) is one place, named by its title.
*/

// AppKit's click-and-hold time for a segment's menu (HIMouseTracking 'clho'),
// and its square around the press: a drag out of it opens the menu at once.
const SITE_HISTORY_MENU_DELAY = 250;
const SITE_HISTORY_MENU_DRAG_SLOP = 6;

const siteHistoryNav = {
    places: null,
    backButton: null,
    forwardButton: null,
    menu: null,
    menuButton: null,
    holdTimer: null,
    pressedButton: null,
    pressX: 0,
    pressY: 0,
    isMenuHeld: false
};

// The tab's run of this site's pages as the browser lists it, around the
// one on screen. Null where the browser doesn't say.
function getSiteHistory() {
    const navigation = window.navigation;
    if (!navigation || !navigation.currentEntry || typeof navigation.entries !== 'function') return null;

    const entries = navigation.entries();
    const current = navigation.currentEntry.index;

    return current >= 0 && entries[current] ? { entries, current } : null;
}

// Another page's name in the menus: the one it left with the browser (after
// its gallery's name, when that is another gallery), or else its address.
function getSitePageTitle(browserEntry) {
    let saved = null;
    try {
        saved = browserEntry.getState();
    } catch (error) {
        saved = null;
    }

    if (saved && saved.title) {
        const page = saved.page || saved.title;
        return page === saved.title || page === document.title ? saved.title : `${page} · ${saved.title}`;
    }

    const path = browserEntry.url ? new URL(browserEntry.url).pathname.replace(/\/(index\.html)?$/, '') : '';
    return path ? decodeURIComponent(path.split('/').pop()).replace(/[-_]+/g, ' ') : location.hostname;
}

// A page that is one place: it is named by its title, and the places around
// it are the site's other pages.
const plainSitePlaces = {
    getPosition() {
        const site = getSiteHistory();
        return site ? { index: site.current, count: site.entries.length } : { index: 0, count: 1 };
    },

    getMenuItems(direction) {
        const site = getSiteHistory();
        const items = [];
        if (!site) return items;

        for (let index = site.current + direction; index >= 0 && index < site.entries.length; index += direction) {
            items.push({ delta: index - site.current, title: getSitePageTitle(site.entries[index]) });
        }

        return items;
    },

    go(delta) {
        const position = plainSitePlaces.getPosition();
        const target = position.index + delta;
        if (delta !== 0 && target >= 0 && target < position.count) history.go(delta);
    }
};

function nameSitePage() {
    try {
        navigation.updateCurrentEntry({ state: { title: document.title } });
    } catch (error) {
        // Without the Navigation API the menus name the page by its address.
    }
}

function refreshSiteHistoryNav() {
    const nav = siteHistoryNav;
    if (!nav.places || !nav.backButton || !nav.forwardButton) return;

    const position = nav.places.getPosition();
    nav.backButton.disabled = position.index <= 0;
    nav.forwardButton.disabled = position.index >= position.count - 1;
}

// --- The Menus ---

function getSiteHistoryMenu() {
    const nav = siteHistoryNav;

    if (!nav.menu) {
        const menu = document.createElement('div');
        menu.id = 'site-history-menu';
        menu.className = 'history-menu';
        menu.setAttribute('role', 'menu');
        menu.appendChild(document.createElement('ul'));

        menu.addEventListener('click', event => {
            const item = event.target.closest('li[data-history-delta]');
            if (item) chooseSiteHistoryMenuItem(item);
        });

        document.body.appendChild(menu);
        nav.menu = menu;
    }

    return nav.menu;
}

function openSiteHistoryMenu(button, direction) {
    const nav = siteHistoryNav;
    const menu = getSiteHistoryMenu();
    const list = menu.querySelector('ul');

    list.replaceChildren();
    nav.places.getMenuItems(direction).forEach(({ delta, title }) => {
        const item = document.createElement('li');
        item.setAttribute('role', 'menuitem');
        item.dataset.historyDelta = String(delta);
        item.textContent = title;
        list.appendChild(item);
    });

    if (list.children.length === 0) return;

    const rect = button.getBoundingClientRect();
    menu.style.display = 'block';
    menu.style.left = `${Math.round(rect.left)}px`;
    menu.style.top = `${Math.round(rect.bottom + 4)}px`;
    menu.style.maxHeight = `${Math.max(120, window.innerHeight - rect.bottom - 12)}px`;

    nav.menuButton = button;
    button.classList.add('is-pressed');
}

function closeSiteHistoryMenu() {
    const nav = siteHistoryNav;
    if (nav.menu) nav.menu.style.display = 'none';
    if (nav.menuButton) nav.menuButton.classList.remove('is-pressed');
    nav.menuButton = null;
    nav.isMenuHeld = false;
}

function isSiteHistoryMenuOpen() {
    return Boolean(siteHistoryNav.menuButton);
}

function chooseSiteHistoryMenuItem(item) {
    const delta = Number(item.dataset.historyDelta);
    closeSiteHistoryMenu();
    siteHistoryNav.places.go(delta);
}

// --- The Buttons ---
// A click goes one place; held for AppKit's delay, or dragged off the spot,
// the button's menu opens under it instead, and letting go over a place goes
// there. Like a toolbar button, neither takes focus from what has it.

function getSiteHistoryDirection(button) {
    return button === siteHistoryNav.backButton ? -1 : 1;
}

function setUpSiteHistoryButton(button) {
    const nav = siteHistoryNav;

    button.addEventListener('mousedown', event => {
        if (event.button !== 0) return;
        event.preventDefault();

        if (nav.menuButton === button) {
            closeSiteHistoryMenu();
            return;
        }

        closeSiteHistoryMenu();
        clearTimeout(nav.holdTimer);
        nav.pressedButton = button;
        nav.pressX = event.clientX;
        nav.pressY = event.clientY;
        button.classList.add('is-pressed');
        nav.holdTimer = setTimeout(() => openHeldSiteHistoryMenu(button), SITE_HISTORY_MENU_DELAY);
    });

    // Return and Space, and assistive clicks, which come without a press.
    button.addEventListener('click', event => {
        if (event.detail === 0) nav.places.go(getSiteHistoryDirection(button));
    });
}

function openHeldSiteHistoryMenu(button) {
    const nav = siteHistoryNav;
    clearTimeout(nav.holdTimer);
    nav.holdTimer = null;
    nav.isMenuHeld = true;
    openSiteHistoryMenu(button, getSiteHistoryDirection(button));
    if (!isSiteHistoryMenuOpen()) button.classList.remove('is-pressed');
}

function handleSiteHistoryMouseMove(event) {
    const nav = siteHistoryNav;
    if (!nav.holdTimer || !nav.pressedButton) return;

    const half = SITE_HISTORY_MENU_DRAG_SLOP / 2;
    if (Math.abs(event.clientX - nav.pressX) < half && Math.abs(event.clientY - nav.pressY) < half) return;

    openHeldSiteHistoryMenu(nav.pressedButton);
}

function handleSiteHistoryMouseUp(event) {
    const nav = siteHistoryNav;
    const button = nav.pressedButton;
    if (!button) return;

    nav.pressedButton = null;

    if (nav.holdTimer) {
        clearTimeout(nav.holdTimer);
        nav.holdTimer = null;
        button.classList.remove('is-pressed');
        if (button.contains(event.target)) nav.places.go(getSiteHistoryDirection(button));
        return;
    }

    if (nav.isMenuHeld) {
        nav.isMenuHeld = false;
        const item = event.target.closest && event.target.closest('#site-history-menu li[data-history-delta]');
        // Let go anywhere else and the menu stays open for a click.
        if (item) chooseSiteHistoryMenuItem(item);
    }
}

// Sets up the page's #history-back and #history-forward. `places` is the
// page's own ({ getPosition, getMenuItems, go }); a page that has none is
// one place, and its buttons are set at once.
function setUpSiteHistoryNav(places) {
    const nav = siteHistoryNav;
    nav.backButton = document.getElementById('history-back');
    nav.forwardButton = document.getElementById('history-forward');
    if (!nav.backButton || !nav.forwardButton) return;

    nav.places = places || plainSitePlaces;

    setUpSiteHistoryButton(nav.backButton);
    setUpSiteHistoryButton(nav.forwardButton);

    document.addEventListener('mousemove', handleSiteHistoryMouseMove);
    document.addEventListener('mouseup', handleSiteHistoryMouseUp);

    document.addEventListener('mousedown', event => {
        if (!isSiteHistoryMenuOpen()) return;
        if (nav.menu.contains(event.target) || nav.menuButton.contains(event.target)) return;
        closeSiteHistoryMenu();
    }, true);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && isSiteHistoryMenuOpen()) {
            event.preventDefault();
            event.stopPropagation();
            closeSiteHistoryMenu();
        }
    }, true);

    window.addEventListener('resize', closeSiteHistoryMenu);
    window.addEventListener('blur', closeSiteHistoryMenu);

    if (places) return;

    nameSitePage();
    refreshSiteHistoryNav();

    // Back here from a gallery, the gallery is now Forward.
    window.addEventListener('pageshow', refreshSiteHistoryNav);
}
