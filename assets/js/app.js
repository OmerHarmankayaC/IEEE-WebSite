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
            // Center the active tab in switcher
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });

    // Swipe Functionality for Committees (Mobile)
    const comContainer = document.querySelector('.committees-container');
    if (comContainer) {
        let touchStartX = 0;
        let touchEndX = 0;

        comContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        comContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleComSwipe();
        }, { passive: true });

        function handleComSwipe() {
            const threshold = 60;
            const currentTab = document.querySelector('.com-tab.active');
            if (!currentTab) return;

            const tabsArray = Array.from(comTabs);
            const currentIndex = tabsArray.indexOf(currentTab);

            if (touchEndX < touchStartX - threshold) {
                // Swipe Left -> Next
                if (currentIndex < tabsArray.length - 1) {
                    tabsArray[currentIndex + 1].click();
                }
            } else if (touchEndX > touchStartX + threshold) {
                // Swipe Right -> Prev
                if (currentIndex > 0) {
                    tabsArray[currentIndex - 1].click();
                }
            }
        }
    }

    const generateCollinsCarouselCard = (name = "İsim Soyisim", imgSrc = "", linkedin = "#") => `
        <div class="collins-card">
            <div class="collins-card-bg" ${imgSrc ? `style="background-image: url('${imgSrc}');"` : ''}>
                <a href="${linkedin}" target="_blank" class="member-linkedin" title="LinkedIn Profile">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                </a>
            </div>
            <div class="collins-card-content">
                <h4 class="collins-card-name">${name}</h4>
            </div>
        </div>
    `;

    const generateLeaderHTML = (name, imgSrc = "", linkedin = "#") => `
        <div class="leader-avatar" ${imgSrc ? `style="background-image: url('${imgSrc}'); background-size: cover; background-position: center;"` : ''}>
            <a href="${linkedin}" target="_blank" class="member-linkedin" title="LinkedIn Profile">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
            </a>
        </div>
        <p class="leader-name">${name}</p>
    `;

    const teamData = {
        "cs": {
            leader: { name: "Eylül Akpınar", img: "assets/images/people-pictures/eylul-akpinar-cs-baskan.jpg", linkedin: "https://www.linkedin.com/in/eyl%C3%BCl-akp%C4%B1nar-887634343/" },
            members: [
                { name: "Enes Taşçı", role: "CS Üyesi", img: "assets/images/people-pictures/enes-tasci-cs.jpg", linkedin: "https://www.linkedin.com/in/enestsc/" },
                { name: "Esra Eda Kılıç", role: "CS Üyesi", img: "assets/images/people-pictures/esra-eda-kilic-cs.jpg", linkedin: "https://www.linkedin.com/in/esraedak%C4%B1l%C4%B1%C3%A7/" },
                { name: "İdil Yavuzer", role: "CS Üyesi", img: "assets/images/people-pictures/idil-yavuzer-cs.jpg", linkedin: "https://www.linkedin.com/in/idil-duru-yavuzer-3047a8322/" },
                { name: "Yusuf Atakan Ünal", role: "CS Üyesi", img: "assets/images/people-pictures/yusuf-atakan-unal-wie-cs.jpg", linkedin: "https://www.linkedin.com/in/yusufatakanunal/" },
                { name: "Ömer Harmankaya", role: "CS Üyesi", img: "assets/images/people-pictures/omer-harmankaya-cs.jpg", linkedin: "http://www.linkedin.com/in/omer-harmankaya" }
            ]
        },
        "ras": {
            leader: { name: "Boran Bozkurt", img: "assets/images/people-pictures/boran-bozkurt-ras-baskan.jpg", linkedin: "https://www.linkedin.com/in/boran-bozkurt-b45a1a27b/" },
            members: [
                { name: "Ali Rahima", role: "RAS Üyesi", img: "assets/images/people-pictures/ali-rahima-ras.jpg", linkedin: "https://www.linkedin.com/in/ali-rahima-5b1a8729b/" },
                { name: "Harun Emre Erten", role: "RAS Üyesi", img: "assets/images/people-pictures/harun-emre-erten-ras.jpg", linkedin: "https://www.linkedin.com/in/harun-emre-erten-083653300/" },
                { name: "İbrahim Efe Yılmaz", role: "RAS Üyesi", img: "assets/images/people-pictures/ibrahim-efe-yilmaz-ras.jpg", linkedin: "https://www.linkedin.com/in/ibrahim-efe-y%C4%B1lmaz-52a880318/" },
                { name: "Kayra Üstten", role: "RAS Üyesi", img: "assets/images/people-pictures/kayra-ustten-ras.jpg", linkedin: "https://www.linkedin.com/in/kayra-ustten-650268313/" },
                { name: "Batuhan Mert Korkmaz", role: "RAS Üyesi", img: "assets/images/people-pictures/Batuhan Mert Korkmaz-RAS.jpeg", linkedin: "https://www.linkedin.com/in/batuhanmertkorkmaz/" },
                { name: "Furkan Aldemir", role: "RAS Üyesi", img: "assets/images/people-pictures/Furkan Aldemir RAS.jpeg", linkedin: "https://www.linkedin.com/in/furkan-aldemir-a07907302/" },
                { name: "Selin Mafizer", role: "RAS Üyesi", img: "assets/images/people-pictures/Selin_Mafizer_RAS.jpg", linkedin: "https://www.linkedin.com/in/selin-mafizer-691b33291/" }
            ]
        },
        "wie": {
            leader: { name: "İrem Akıl", img: "assets/images/people-pictures/irem-akil-wie-baskan.jpg", linkedin: "https://www.linkedin.com/in/irem-ak%C4%B1l-9202a829a/" },
            members: [
                { name: "Aysu Ece Atalay", role: "WIE Üyesi", img: "assets/images/people-pictures/aysu-ece-atalay-wie.jpg", linkedin: "https://www.linkedin.com/in/aysu-ece-atalay-619bb139b/" },
                { name: "Serra Yelmenoğlu", role: "WIE Üyesi", img: "assets/images/people-pictures/serra-yelmenoglu-wie.jpg", linkedin: "https://www.linkedin.com/in/serra-yelmeno%C4%9Flu-2680743b4/" },
                { name: "Zeynep Nil Usluoğlu", role: "WIE Üyesi", img: "assets/images/people-pictures/zeynep-nil-usluoglu-wie.jpg", linkedin: "https://www.linkedin.com/in/zeynep-nil-usluo%C4%9Flu-72a729328/" },
                { name: "İpek Özdemir", role: "WIE Üyesi", img: "assets/images/people-pictures/ipek-ozdemir-wie.jpg", linkedin: "https://www.linkedin.com/in/ipek-%C3%B6zdemir-b1350b299/" },
                { name: "İrem Aköz", role: "WIE Üyesi", img: "assets/images/people-pictures/irem-akoz-wie.jpg", linkedin: "https://www.linkedin.com/in/irem-ak%C3%B6z-aa7450247/" }
            ]
        },
        "medya": {
            leader: { name: "Duru Türkmen", img: "assets/images/people-pictures/duru-turkmen-sosyal-medya-ve-tasarim-baskan.jpg", linkedin: "https://www.linkedin.com/in/duru-t%C3%BCrkmen-756a7733a/" },
            members: [
                { name: "Duru Baykan", role: "Tasarım Üyesi", img: "assets/images/people-pictures/duru-baykan-sosyal-medya-ve-tasarim.jpg", linkedin: "https://www.linkedin.com/in/duru-baykan-877242325/" },
                { name: "Ece Salman", role: "Tasarım Üyesi", img: "assets/images/people-pictures/ece-salman-tasarim-ve-medya.jpg", linkedin: "javascript:void(0)" },
                { name: "Ela Nur Yerli", role: "Tasarım Üyesi", img: "assets/images/people-pictures/ela-nur-yerli-sosyal-medya-ve-tasarim.jpg", linkedin: "https://www.linkedin.com/in/ela-nur-yerli-927ab7324/" },
                { name: "Simay Balaban", role: "Medya Üyesi", img: "assets/images/people-pictures/simay-balaban-medya.jpg", linkedin: "https://www.linkedin.com/in/simay-balaban-72a40438a/" },
                { name: "Zeynep Öztürk", role: "Tasarım Üyesi", img: "assets/images/people-pictures/zeynep-ozturk-tasarim.jpg", linkedin: "https://www.linkedin.com/in/zeynep-%C3%B6zt%C3%BCrk-9bbba7302/" }
            ]
        }
    };

    // Populate Presidential Duo
    const presOffice = document.getElementById('presidential-office-container');
    if(presOffice) {
        presOffice.innerHTML = `
            <div class="president-box">
                <div class="gb-avatar" style="background-image: url('assets/images/people-pictures/umut-uygur-baskan.jpg');">
                    <a href="https://www.linkedin.com/in/umut-uygur/" target="_blank" class="member-linkedin" title="LinkedIn Profile">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                    </a>
                </div>
                <h3 class="gb-name">Umut Uygur</h3>
                <p class="gb-role">Genel Başkan</p>
            </div>
            <div class="president-box">
                <div class="gb-avatar" style="background-image: url('assets/images/people-pictures/dilasude-ozdogan-genel-baskan-yardimcisi.jpg');">
                    <a href="https://www.linkedin.com/in/dilasude-%C3%B6zdo%C4%9Fan-b11b303b1/" target="_blank" class="member-linkedin" title="LinkedIn Profile">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                    </a>
                </div>
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
        if(leaderEl) leaderEl.innerHTML = generateLeaderHTML(data.leader.name, data.leader.img, data.leader.linkedin);
        
        // Carousel
        const carouselEl = document.getElementById(`${key}-board`);
        if(carouselEl) {
            let html = "";
            data.members.forEach(m => {
                html += generateCollinsCarouselCard(m.name, m.img, m.linkedin);
            });
            carouselEl.innerHTML = html;
        }
    });

    // 3. Instagram Feed Loader
    const instagramFeed = [
        {
            id: "post1",
            url: "https://www.instagram.com/p/C9tH4Z-tmq0/", // Example link, user should update
            img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop", // Placeholder
            caption: "Kariyer Söyleşileri: Mühendislikte Yeni Ufuklar"
        },
        {
            id: "post2",
            url: "https://www.instagram.com/p/C9q8X7xtO-N/", 
            img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop",
            caption: "Robotics and Automation Society: Atölye Çalışmaları"
        },
        {
            id: "post3",
            url: "https://www.instagram.com/p/C9oA1T9tmK6/",
            img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop",
            caption: "IEEE TEDU General Assembly 2024"
        },
        {
            id: "post4",
            url: "https://www.instagram.com/p/C9l5J4xtm_3/",
            img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
            caption: "Computer Society: Kodlama Yarışması"
        },
        {
            id: "post5",
            url: "https://www.instagram.com/p/C9jN2Vxtm_w/",
            img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop",
            caption: "Teknik Gezi: Savunma Sanayii Ziyareti"
        },
        {
            id: "post6",
            url: "https://www.instagram.com/p/C9hG1T9tm_o/",
            img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
            caption: "Women in Engineering: İlham Veren Kadınlar"
        }
    ];

    function loadInstagramFeed() {
        const grid = document.getElementById('instagram-feed-grid');
        if (!grid) return;

        // In a real scenario, you'd fetch this from an API like Behold.so or a proxy
        let html = "";
        instagramFeed.forEach(post => {
            html += `
                <a href="${post.url}" target="_blank" class="instagram-post reveal">
                    <img src="${post.img}" alt="${post.caption}" loading="lazy">
                    <div class="instagram-overlay">
                        <div class="instagram-overlay-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </div>
                    </div>
                </a>
            `;
        });
        grid.innerHTML = html;
        
        // Re-observe new elements for reveal animation
        const newReveals = grid.querySelectorAll('.reveal');
        newReveals.forEach(r => revealOnScroll.observe(r));
    }

    // loadInstagramFeed(); // Disable for screenshots

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

    // 3b. Activities Carousel Navigation (Restored)
    const actCarousel = document.getElementById('activities-carousel');
    const actNextBtn = document.getElementById('activities-next-btn');
    const actPrevBtn = document.getElementById('activities-prev-btn');
    
    if (actCarousel && actNextBtn && actPrevBtn) {
        actNextBtn.addEventListener('click', () => {
            const firstCard = actCarousel.querySelector('.activity-card');
            if (firstCard) {
                const scrollAmount = firstCard.offsetWidth + 32; // card width + gap
                actCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });

        actPrevBtn.addEventListener('click', () => {
            const firstCard = actCarousel.querySelector('.activity-card');
            if (firstCard) {
                const scrollAmount = firstCard.offsetWidth + 32; 
                actCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });

        const toggleBtnVisibility = () => {
            const maxScroll = actCarousel.scrollWidth - actCarousel.clientWidth;
            if (maxScroll <= 10) {
                actNextBtn.style.display = 'none';
                actPrevBtn.style.display = 'none';
            } else {
                actNextBtn.style.display = 'flex';
                actPrevBtn.style.display = 'flex';
                
                if (actCarousel.scrollLeft >= maxScroll - 10) {
                    actNextBtn.style.opacity = '0';
                    actNextBtn.style.pointerEvents = 'none';
                } else {
                    actNextBtn.style.opacity = '1';
                    actNextBtn.style.pointerEvents = 'auto';
                }

                if (actCarousel.scrollLeft <= 10) {
                    actPrevBtn.style.opacity = '0';
                    actPrevBtn.style.pointerEvents = 'none';
                } else {
                    actPrevBtn.style.opacity = '1';
                    actPrevBtn.style.pointerEvents = 'auto';
                }
            }
        };

        // Hide buttons if at the ends of scroll or if not scrollable
        actCarousel.addEventListener('scroll', toggleBtnVisibility);
        window.addEventListener('resize', toggleBtnVisibility);
        // Initial check
        setTimeout(toggleBtnVisibility, 100);
    }


    // Force all team carousels to start at position 0


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
