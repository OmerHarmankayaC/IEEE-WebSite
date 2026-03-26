document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animations (Intersection Observer)
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // 2. Navbar shrink effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // 3. Populate Team Carousel and handle Tabs dynamically
    const generateCollinsCarouselCard = (role, name = "İsim Soyisim") => `
        <div class="collins-card">
            <div class="collins-card-bg"></div>
            <div class="collins-card-content">
                <h4 class="collins-card-name">${name}</h4>
                <p class="collins-card-role">${role}</p>
            </div>
        </div>
    `;

    // Populate Genel Baskan
    const gbContainer = document.getElementById('genel-baskan-container');
    if(gbContainer) {
        gbContainer.innerHTML = `
            <div class="gb-avatar"></div>
            <h3 class="gb-name">Yönetici Adı</h3>
            <p class="gb-role">Genel Koordinatör</p>
        `;
    }

    // Populate CS Carousel
    let csHTML = generateCollinsCarouselCard("CS Başkanı", "Başkan CS");
    for(let i=1; i<=6; i++) csHTML += generateCollinsCarouselCard("CS Üyesi", `Üye ${i}`);
    const csBoard = document.getElementById('cs-board');
    if(csBoard) csBoard.innerHTML = csHTML;

    // Populate RAS Carousel
    let rasHTML = generateCollinsCarouselCard("RAS Başkanı", "Başkan RAS");
    for(let i=1; i<=6; i++) rasHTML += generateCollinsCarouselCard("RAS Üyesi", `Üye ${i}`);
    const rasBoard = document.getElementById('ras-board');
    if(rasBoard) rasBoard.innerHTML = rasHTML;

    // Populate WIE Carousel
    let wieHTML = generateCollinsCarouselCard("WIE Başkanı", "Başkan WIE");
    for(let i=1; i<=6; i++) wieHTML += generateCollinsCarouselCard("WIE Üyesi", `Üye ${i}`);
    const wieBoard = document.getElementById('wie-board');
    if(wieBoard) wieBoard.innerHTML = wieHTML;

    // Tab Interface Logic & Leader Injection
    const generateLeaderHTML = (name) => `
        <div class="leader-avatar"></div>
        <p class="leader-name">${name}</p>
    `;
    const csLeader = document.getElementById('cs-leader');
    if(csLeader) csLeader.innerHTML = generateLeaderHTML("Başkan CS");
    
    const rasLeader = document.getElementById('ras-leader');
    if(rasLeader) rasLeader.innerHTML = generateLeaderHTML("Başkan RAS");
    
    const wieLeader = document.getElementById('wie-leader');
    if(wieLeader) wieLeader.innerHTML = generateLeaderHTML("Başkan WIE");

    const tabs = document.querySelectorAll('.team-tab-wrapper');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active style from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Set active on clicked tab
            tab.classList.add('active');
            
            // Hide all carousels
            document.querySelectorAll('.carousels-wrapper .collins-carousel').forEach(c => {
                c.style.display = 'none';
            });
            
            // Show the target carousel
            const targetId = tab.getAttribute('data-target');
            const targetCarousel = document.getElementById(targetId);
            if(targetCarousel) {
                targetCarousel.style.display = 'flex';
                // Reset scroll to left when appearing
                targetCarousel.scrollLeft = 0;
            }
        });
    });

    // Carousel Slider Controls
    function updateArrowVisibility(carousel, prevBtn, nextBtn) {
        if(!carousel || !prevBtn || !nextBtn) return;
        const scrollLeft = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        if(maxScroll <= 0) {
            prevBtn.style.visibility = 'hidden';
            nextBtn.style.visibility = 'hidden';
            return;
        }

        if(scrollLeft <= 5) {
            prevBtn.style.visibility = 'hidden';
            prevBtn.style.opacity = '0';
        } else {
            prevBtn.style.visibility = 'visible';
            prevBtn.style.opacity = '1';
        }
        
        if(scrollLeft >= maxScroll - 5) {
            nextBtn.style.visibility = 'hidden';
            nextBtn.style.opacity = '0';
        } else {
            nextBtn.style.visibility = 'visible';
            nextBtn.style.opacity = '1';
        }
    }

    const activitiesCarousel = document.getElementById('activities-carousel-track');
    const actPrev = document.getElementById('activities-prev');
    const actNext = document.getElementById('activities-next');
    if(activitiesCarousel && actPrev && actNext) {
        updateArrowVisibility(activitiesCarousel, actPrev, actNext);
        activitiesCarousel.addEventListener('scroll', () => updateArrowVisibility(activitiesCarousel, actPrev, actNext));

        actPrev.addEventListener('click', () => activitiesCarousel.scrollBy({ left: -400, behavior: 'smooth' }));
        actNext.addEventListener('click', () => activitiesCarousel.scrollBy({ left: 400, behavior: 'smooth' }));
    }

    const teamPrev = document.getElementById('team-prev');
    const teamNext = document.getElementById('team-next');
    if(teamPrev && teamNext) {
        const getActiveCarousel = () => {
            const carousels = document.querySelectorAll('.carousels-wrapper .collins-carousel');
            for(let c of carousels) {
                if(window.getComputedStyle(c).display === 'flex') return c;
            }
            return null;
        };

        const updateTeamArrows = () => {
            const c = getActiveCarousel();
            if(c) updateArrowVisibility(c, teamPrev, teamNext);
        };
        
        // Listen to active tab shifts and active carousel scrolls
        document.querySelectorAll('.carousels-wrapper .collins-carousel').forEach(c => {
            c.addEventListener('scroll', updateTeamArrows);
        });
        document.querySelectorAll('.team-tab-wrapper').forEach(t => {
            t.addEventListener('click', () => setTimeout(updateTeamArrows, 150)); // let active class apply
        });
        setTimeout(updateTeamArrows, 200);

        teamPrev.addEventListener('click', () => {
            const c = getActiveCarousel();
            if(c) c.scrollBy({ left: -350, behavior: 'smooth' });
        });
        teamNext.addEventListener('click', () => {
            const c = getActiveCarousel();
            if(c) c.scrollBy({ left: 350, behavior: 'smooth' });
        });
    }

    // 4. Dynamic Floating Button Colors
    const floatingBtn = document.getElementById('floating-contact');
    if (floatingBtn) {
        window.addEventListener('scroll', () => {
            const rect = floatingBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const elementsUnder = document.elementsFromPoint(x, y);
            
            // Check if any element behind the center of the button is a dark section
            const isDark = elementsUnder.some(el => 
                el.classList && 
                (el.classList.contains('bg-navy') || el.classList.contains('bg-dark-navy') || el.classList.contains('footer-bg'))
            );
            
            if (isDark) {
                floatingBtn.classList.add('dark-bg-mode');
            } else {
                floatingBtn.classList.remove('dark-bg-mode');
            }
        });
        // Trigger initial check
        window.dispatchEvent(new Event('scroll'));
    }
});
