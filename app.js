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

    // 2b. Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');

    function openMobileMenu() {
        hamburger.classList.add('open');
        mobileMenu.classList.add('open');
        mobileOverlay.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileOverlay.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) closeMobileMenu();
            else openMobileMenu();
        });
    }
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu when any link is tapped
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // 2c. Committee Switcher (Mobile)
    const comTabs = document.querySelectorAll('.com-tab');
    const comWrappers = document.querySelectorAll('.committee-wrapper');

    comTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            comTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            comWrappers.forEach(w => {
                if (w.id === targetId) w.classList.add('active');
                else w.classList.remove('active');
            });
        });
    });

    // 3. Populate Team Carousel and handle Tabs dynamically
    const generateCollinsCarouselCard = (role, name = "İsim Soyisim", imgSrc = "") => `
        <div class="collins-card">
            <div class="collins-card-bg" ${imgSrc ? `style="background-image: url('${imgSrc}'); background-size: cover; background-position: center;"` : ''}></div>
            <div class="collins-card-content">
                <h4 class="collins-card-name">${name}</h4>
                <p class="collins-card-role">${role}</p>
            </div>
        </div>
    `;

    const generateLeaderHTML = (name, imgSrc = "") => `
        <div class="leader-avatar" ${imgSrc ? `style="background-image: url('${imgSrc}'); background-size: cover; background-position: center;"` : ''}></div>
        <p class="leader-name">${name}</p>
    `;

    const teamData = {
        "cs": {
            leader: { name: "Eylül Akpınar", img: "people-pictures/Eylül Akpınar CS-başkan.jpeg" },
            members: [
                { name: "Enes Taşçı", role: "CS Üyesi", img: "people-pictures/Enes Taşçı - CS.jpeg" },
                { name: "Esra Eda Kılıç", role: "CS Üyesi", img: "people-pictures/Esra Eda Kılıç CS.jpg" },
                { name: "İdil Yavuzer", role: "CS Üyesi", img: "people-pictures/İdil yavuzer -cs.jpg" },
                { name: "Yusuf Atakan Ünal", role: "CS Üyesi", img: "people-pictures/Yusuf Atakan Ünal WIE_CS.jpg" },
                { name: "Ömer Harmankaya", role: "CS Üyesi", img: "people-pictures/Ömer Harmankaya-CS.jpg" }
            ]
        },
        "ras": {
            leader: { name: "Boran Bozkurt", img: "people-pictures/Boran Bozkurt-RAS-başkan.JPG" },
            members: [
                { name: "Ali Rahima", role: "RAS Üyesi", img: "people-pictures/Ali Rahima RAS.jpg" },
                { name: "Harun Emre Erten", role: "RAS Üyesi", img: "people-pictures/Harun Emre Erten-RAS.jpeg" },
                { name: "İbrahim Efe Yılmaz", role: "RAS Üyesi", img: "people-pictures/İbrahim Efe Yılmaz-RAS.jpeg" },
                { name: "Kayra Üstten", role: "RAS Üyesi", img: "people-pictures/Kayra Üstten RAS .jpeg" }
            ]
        },
        "wie": {
            leader: { name: "İrem Akıl", img: "people-pictures/İrem Akıl wie-başkan.HEIC" },
            members: [
                { name: "Aysu Ece Atalay", role: "WIE Üyesi", img: "people-pictures/Aysu Ece Atalay Wie.jpg" },
                { name: "Serra Yelmenoğlu", role: "WIE Üyesi", img: "people-pictures/Serra Yelmenoğlu-WIE.heif" },
                { name: "Zeynep Nil Usluoğlu", role: "WIE Üyesi", img: "people-pictures/Zeynep Nil Usluoğlu wie.jpg" },
                { name: "İpek Özdemir", role: "WIE Üyesi", img: "people-pictures/ipek özdemir wie.png" },
                { name: "İrem Aköz", role: "WIE Üyesi", img: "people-pictures/irem aköz wie.jpg" }
            ]
        },
        "medya": {
            leader: { name: "Duru Türkmen", img: "people-pictures/Duru Türkmen-Sosyal Medya ve Tasarım-başkan.jpg" },
            members: [
                { name: "Duru Baykan", role: "Tasarım Üyesi", img: "people-pictures/Duru Baykan-Sosyal Medya ve Tasarım.jpeg" },
                { name: "Ece Salman", role: "Tasarım Üyesi", img: "people-pictures/Ece salman-tasarım ve medya.jpeg" },
                { name: "Ela Nur Yerli", role: "Tasarım Üyesi", img: "people-pictures/Ela Nur Yerli-Sosyal Medya ve Tasarım.jpg" },
                { name: "Simay Balaban", role: "Medya Üyesi", img: "people-pictures/Simay Balaban medya.jpg" },
                { name: "Zeynep Öztürk", role: "Tasarım Üyesi", img: "people-pictures/Zeynep Öztürk tasarım.jpg" }
            ]
        }
    };

    // Populate Presidential Duo
    const presOffice = document.getElementById('presidential-office-container');
    if(presOffice) {
        presOffice.innerHTML = `
            <div class="president-box">
                <div class="gb-avatar" style="background-image: url('people-pictures/Umut Uygur-başkan.jpeg');"></div>
                <h3 class="gb-name">Umut Uygur</h3>
                <p class="gb-role">Genel Başkan</p>
            </div>
            <div class="president-box">
                <div class="gb-avatar" style="background-image: url('people-pictures/Dilasude Özdoğan-Genel başkan yardımcısı.jpeg');"></div>
                <h3 class="gb-name">Dilasude Özdoğan</h3>
                <p class="gb-role">Genel Başkan Yardımcısı</p>
            </div>
        `;
    }

    // Populate Leaders and Carousels
    Object.keys(teamData).forEach(key => {
        const data = teamData[key];
        
        // Leader
        const leaderEl = document.getElementById(`${key}-leader`);
        if(leaderEl) leaderEl.innerHTML = generateLeaderHTML(data.leader.name, data.leader.img);
        
        // Carousel
        const carouselEl = document.getElementById(`${key}-board`);
        if(carouselEl) {
            let html = "";
            data.members.forEach(m => {
                html += generateCollinsCarouselCard(m.role, m.name, m.img);
            });
            carouselEl.innerHTML = html;
        }
    });

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
        // Force reset to true beginning
        activitiesCarousel.scrollLeft = 0;
        updateArrowVisibility(activitiesCarousel, actPrev, actNext);
        activitiesCarousel.addEventListener('scroll', () => updateArrowVisibility(activitiesCarousel, actPrev, actNext));

        actPrev.addEventListener('click', () => activitiesCarousel.scrollBy({ left: -400, behavior: 'smooth' }));
        actNext.addEventListener('click', () => activitiesCarousel.scrollBy({ left: 400, behavior: 'smooth' }));

        // 3b. Activity Card Direct Click (Mobile)
        const activityCards = document.querySelectorAll('.activity-card');
        activityCards.forEach(card => {
            let startX, startY;
            card.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, {passive: true});
            
            card.addEventListener('touchend', (e) => {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = Math.abs(endX - startX);
                const diffY = Math.abs(endY - startY);
                
                if (diffX < 10 && diffY < 10) {
                    const link = card.querySelector('a');
                    if (link) window.location.href = link.href;
                }
            }, {passive: true});
        });
    }


    // Force all team carousels to start at position 0
    document.querySelectorAll('.collins-carousel').forEach(c => { c.scrollLeft = 0; });

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

    // 4. Dynamic Floating Button Colors and Hide Logic
    const floatingBtn = document.getElementById('floating-contact');
    if (floatingBtn) {
        window.addEventListener('scroll', () => {
            // Hide if at the very top of the document
            if (window.scrollY < 100) {
                floatingBtn.classList.add('hide-contact');
            } else {
                floatingBtn.classList.remove('hide-contact');
            }

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
