/**
 * Site-wide behaviour for every page.
 *
 * Each section below checks that its elements exist first, so the same file
 * can be loaded on the homepage, the blog pages and the contact page.
 *
 * Depends on:
 *   - assets/js/i18n.js       → window.I18n (always loaded before this file)
 *   - assets/js/data/team.js  → window.IEEE_TEAM (homepage only)
 */
document.addEventListener('DOMContentLoaded', () => {
    const t = key => (window.I18n ? window.I18n.t(key) : key);

    /** Escapes a value for safe use inside HTML text or a quoted attribute. */
    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    // ---------------------------------------------------------------------
    // 1. Reveal-on-scroll animations
    // ---------------------------------------------------------------------
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ---------------------------------------------------------------------
    // 2. Navbar shrinks after the user scrolls down
    // ---------------------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ---------------------------------------------------------------------
    // 3. Committee switcher (mobile): tabs + swipe left/right
    // ---------------------------------------------------------------------
    const comTabs = Array.from(document.querySelectorAll('.com-tab'));
    const comWrappers = document.querySelectorAll('.committee-wrapper');

    comTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;
            comTabs.forEach(t => t.classList.toggle('active', t === tab));
            comWrappers.forEach(w => w.classList.toggle('active', w.id === targetId));
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });

    const comContainer = document.querySelector('.committees-grid');
    if (comContainer && comTabs.length) {
        const SWIPE_THRESHOLD = 60;
        let touchStartX = 0;

        comContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        comContainer.addEventListener('touchend', e => {
            const deltaX = e.changedTouches[0].screenX - touchStartX;
            const currentIndex = comTabs.findIndex(tab => tab.classList.contains('active'));
            if (currentIndex === -1) return;

            if (deltaX < -SWIPE_THRESHOLD && currentIndex < comTabs.length - 1) {
                comTabs[currentIndex + 1].click(); // swipe left → next committee
            } else if (deltaX > SWIPE_THRESHOLD && currentIndex > 0) {
                comTabs[currentIndex - 1].click(); // swipe right → previous committee
            }
        }, { passive: true });
    }

    // ---------------------------------------------------------------------
    // 4. Board of Directors (data lives in assets/js/data/team.js)
    // ---------------------------------------------------------------------
    const LINKEDIN_ICON = `
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>`;

    const displayName = person => person.name || t('team.tba');

    const linkedinLink = url => url
        ? `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" class="member-linkedin" title="${escapeHTML(t('team.linkedin'))}" aria-label="${escapeHTML(t('team.linkedin'))}">${LINKEDIN_ICON}</a>`
        : '';

    const avatarStyle = (img, extra = '') => img
        ? `style="background-image: url('${escapeHTML(img)}');${extra}"`
        : '';

    const renderPresident = person => `
        <div class="president-box">
            <div class="gb-avatar" ${person.img ? avatarStyle(person.img) : 'style="background-color: var(--ted-navy);"'}>
                ${linkedinLink(person.linkedin)}
            </div>
            <h3 class="gb-name">${escapeHTML(displayName(person))}</h3>
            <p class="gb-role">${escapeHTML(t(person.roleKey))}</p>
        </div>`;

    const renderLeader = person => `
        <div class="leader-avatar" ${avatarStyle(person.img, ' background-size: cover; background-position: center;')}>
            ${linkedinLink(person.linkedin)}
        </div>
        <p class="leader-name">${escapeHTML(displayName(person))}</p>`;

    const renderMemberCard = person => `
        <div class="collins-card">
            <div class="collins-card-bg" ${avatarStyle(person.img)}>
                ${linkedinLink(person.linkedin)}
            </div>
            <div class="collins-card-content">
                <h4 class="collins-card-name">${escapeHTML(displayName(person))}</h4>
            </div>
        </div>`;

    const TBA_PLACEHOLDER_CARDS = 3;
    const teamData = window.IEEE_TEAM || {};
    const yearButtons = document.querySelectorAll('.year-btn');
    let selectedYear = (document.querySelector('.year-btn.active') || {}).dataset?.year || Object.keys(teamData)[0];

    function renderTeam(year) {
        const yearData = teamData[year];
        if (!yearData) return;

        const presidentialEl = document.getElementById('presidential-office-container');
        if (presidentialEl) {
            presidentialEl.innerHTML = yearData.presidential.map(renderPresident).join('');
        }

        Object.entries(yearData.committees).forEach(([key, committee]) => {
            const leaderEl = document.getElementById(`${key}-leader`);
            if (leaderEl) leaderEl.innerHTML = renderLeader(committee.leader);

            const boardEl = document.getElementById(`${key}-board`);
            if (!boardEl) return;

            const members = committee.members.length
                ? [...committee.members].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                : Array.from({ length: TBA_PLACEHOLDER_CARDS }, () => ({ name: null }));
            boardEl.innerHTML = members.map(renderMemberCard).join('');
        });

        setTimeout(toggleTeamNavVisibility, 50);
    }

    if (document.getElementById('presidential-office-container')) {
        renderTeam(selectedYear);
        document.addEventListener('languagechange', () => renderTeam(selectedYear));
    }

    // Academic year switcher (fades the board out, swaps data, fades back in)
    yearButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            yearButtons.forEach(b => b.classList.toggle('active', b === btn));
            selectedYear = btn.dataset.year;

            const fadeTargets = document.querySelectorAll('#presidential-office-container, .team-tabs-container, .carousels-wrapper');
            fadeTargets.forEach(el => { el.style.opacity = '0'; });

            setTimeout(() => {
                renderTeam(selectedYear);
                fadeTargets.forEach(el => { el.style.opacity = '1'; });
            }, 200);
        });
    });

    // Committee tabs above the board carousels
    const teamTabs = document.querySelectorAll('.team-tab-wrapper');
    teamTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            teamTabs.forEach(t => t.classList.toggle('active', t === tab));

            document.querySelectorAll('.carousels-wrapper .collins-carousel').forEach(c => {
                c.style.display = 'none';
            });

            const targetCarousel = document.getElementById(tab.dataset.target);
            if (targetCarousel) {
                targetCarousel.style.display = 'flex';
                targetCarousel.scrollLeft = 0;
            }

            setTimeout(toggleTeamNavVisibility, 50);
        });
    });

    // Prev/next arrows for the team carousel. Only the RAS board has enough
    // members to scroll, so the arrows are shown for RAS only.
    const teamNextBtn = document.getElementById('team-next-btn');
    const teamPrevBtn = document.getElementById('team-prev-btn');
    const rasBoard = document.getElementById('ras-board');
    const TEAM_CARD_GAP = 24;

    function toggleTeamNavVisibility() {
        if (!teamNextBtn || !teamPrevBtn || !rasBoard) return;

        const maxScroll = rasBoard.scrollWidth - rasBoard.clientWidth;
        if (rasBoard.style.display !== 'flex' || maxScroll <= 10) {
            teamNextBtn.style.display = 'none';
            teamPrevBtn.style.display = 'none';
            return;
        }

        const scrollPos = Math.round(rasBoard.scrollLeft);
        teamPrevBtn.style.display = scrollPos <= 5 ? 'none' : 'flex';
        teamNextBtn.style.display = scrollPos >= maxScroll - 5 ? 'none' : 'flex';
    }

    if (teamNextBtn && teamPrevBtn && rasBoard) {
        const scrollTeam = direction => {
            const firstCard = rasBoard.querySelector('.collins-card');
            if (firstCard) {
                rasBoard.scrollBy({ left: direction * (firstCard.offsetWidth + TEAM_CARD_GAP), behavior: 'smooth' });
            }
        };
        teamNextBtn.addEventListener('click', () => scrollTeam(1));
        teamPrevBtn.addEventListener('click', () => scrollTeam(-1));
        rasBoard.addEventListener('scroll', toggleTeamNavVisibility);
        window.addEventListener('resize', toggleTeamNavVisibility);
        setTimeout(toggleTeamNavVisibility, 200);
    }

    // ---------------------------------------------------------------------
    // 5. "Ideas & Projects" carousel + optional live Instagram feed
    // ---------------------------------------------------------------------
    const actCarousel = document.getElementById('activities-carousel');
    const actNextBtn = document.getElementById('activities-next-btn');
    const actPrevBtn = document.getElementById('activities-prev-btn');
    const ACTIVITY_CARD_GAP = 32;

    function toggleActivitiesNavVisibility() {
        if (!actCarousel || !actNextBtn || !actPrevBtn) return;

        const maxScroll = actCarousel.scrollWidth - actCarousel.clientWidth;
        if (maxScroll <= 10) {
            actNextBtn.style.display = 'none';
            actPrevBtn.style.display = 'none';
            return;
        }

        actNextBtn.style.display = 'flex';
        actPrevBtn.style.display = 'flex';

        const atEnd = actCarousel.scrollLeft >= maxScroll - 10;
        const atStart = actCarousel.scrollLeft <= 10;
        actNextBtn.style.opacity = atEnd ? '0' : '1';
        actNextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
        actPrevBtn.style.opacity = atStart ? '0' : '1';
        actPrevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
    }

    if (actCarousel && actNextBtn && actPrevBtn) {
        const scrollActivities = direction => {
            const firstCard = actCarousel.querySelector('.activity-card');
            if (firstCard) {
                actCarousel.scrollBy({ left: direction * (firstCard.offsetWidth + ACTIVITY_CARD_GAP), behavior: 'smooth' });
            }
        };
        actNextBtn.addEventListener('click', () => scrollActivities(1));
        actPrevBtn.addEventListener('click', () => scrollActivities(-1));
        actCarousel.addEventListener('scroll', toggleActivitiesNavVisibility);
        window.addEventListener('resize', toggleActivitiesNavVisibility);
        setTimeout(toggleActivitiesNavVisibility, 100);
    }

    /*
     * Live Instagram feed (optional).
     *
     * Leave INSTAGRAM_FEED_URL empty to keep the static blog cards written in
     * index.html. To show real posts instead, paste a JSON feed URL from a
     * service such as Behold.so (e.g. "https://feeds.behold.so/YOUR_FEED_ID").
     * If the request fails, the static cards stay in place.
     */
    const INSTAGRAM_FEED_URL = '';
    const INSTAGRAM_MAX_POSTS = 10;
    const INSTAGRAM_CAPTION_LENGTH = 80;
    const CARD_COLORS = ['#fbe4d8', '#d4e6f1', '#e8daef', '#d8f7d1', '#f7d1d1', '#fff3cd', '#d1ecf1'];
    let instagramPosts = [];

    function renderInstagramFeed() {
        if (!actCarousel || instagramPosts.length === 0) return;

        actCarousel.innerHTML = instagramPosts.map((post, index) => {
            const color = CARD_COLORS[index % CARD_COLORS.length];
            const caption = post.caption
                ? post.caption.substring(0, INSTAGRAM_CAPTION_LENGTH) + (post.caption.length > INSTAGRAM_CAPTION_LENGTH ? '...' : '')
                : t('instagram.fallbackCaption');

            let label = t('instagram.label');
            const date = post.timestamp ? new Date(post.timestamp) : null;
            if (date && !isNaN(date)) {
                label = date.toLocaleDateString(window.I18n ? window.I18n.locale : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            }

            const mediaUrl = post.mediaUrl || post.media_url;
            return `
                <a href="${escapeHTML(post.permalink)}" target="_blank" rel="noopener noreferrer" class="activity-card" style="background-color: ${color}; color: var(--text-dark); text-decoration: none; display: flex; flex-direction: column; overflow: hidden; position: relative;">
                    <div class="ac-top-right" style="z-index: 2;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
                    </div>
                    ${mediaUrl ? `<div style="height: 60%; width: 100%; background-image: url('${escapeHTML(mediaUrl)}'); background-size: cover; background-position: center; border-radius: 20px 20px 0 0; margin: -2rem -2rem 1rem -2rem; opacity: 0.9;"></div>` : ''}
                    <div class="ac-content" style="z-index: 2; display: flex; flex-direction: column; justify-content: flex-end; flex-grow: 1;">
                        <div class="ac-category" style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.5rem;">${escapeHTML(label)}</div>
                        <h3 class="ac-title" style="font-size: 1.2rem; font-weight: 700; line-height: 1.4;">${escapeHTML(caption)}</h3>
                    </div>
                </a>`;
        }).join('');

        setTimeout(toggleActivitiesNavVisibility, 50);
    }

    async function loadInstagramFeed() {
        if (!actCarousel || !INSTAGRAM_FEED_URL) return;

        try {
            const response = await fetch(INSTAGRAM_FEED_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            // Providers wrap the array differently: [], { posts: [] } or { data: [] }.
            const posts = Array.isArray(data) ? data : (data.posts || data.data || []);
            instagramPosts = posts.filter(p => p && p.permalink).slice(0, INSTAGRAM_MAX_POSTS);
            renderInstagramFeed();
        } catch (error) {
            console.error('Instagram feed could not be loaded; keeping the static cards.', error);
        }
    }

    loadInstagramFeed();
    document.addEventListener('languagechange', renderInstagramFeed);

    // ---------------------------------------------------------------------
    // 6. Floating "Contact" button: hidden at the top, inverts over dark sections
    // ---------------------------------------------------------------------
    const floatingBtn = document.getElementById('floating-contact');
    if (floatingBtn) {
        const DARK_SECTION_CLASSES = ['bg-navy', 'bg-dark-navy', 'footer-bg'];

        window.addEventListener('scroll', () => {
            floatingBtn.classList.toggle('hide-contact', window.scrollY < 100);

            const rect = floatingBtn.getBoundingClientRect();
            const elementsUnder = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            const isOverDark = elementsUnder.some(el =>
                el.classList && DARK_SECTION_CLASSES.some(cls => el.classList.contains(cls))
            );
            floatingBtn.classList.toggle('dark-bg-mode', isOverDark);
        });

        window.dispatchEvent(new Event('scroll'));
    }

    // ---------------------------------------------------------------------
    // 7. Contact form → opens the visitor's email app with the message prefilled
    // ---------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const CONTACT_EMAIL = 'ieee@tedu.edu.tr';

        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const message = contactForm.querySelector('#message').value.trim();

            const subject = `${t('contact.mailSubject')} — ${name}`;
            const body = `${message}\n\n— ${name} <${email}>`;
            window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }
});
