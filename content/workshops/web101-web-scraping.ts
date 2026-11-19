/* Web 101 ve Etik Web Scraping: kurulum rehberi.
   Hazırlayan: Taha Bayati (https://github.com/tahabayati/IEEE-TEDU-Site), IEEE TEDU Computer Society.

   Sayfanın bütün içeriği bu dosyada; arayüz kodunu değiştirmeden düzenlenebilir.
   - Bir şeyi silmeden gizlemek için: published: false
   - Sırayı değiştirmek için: order (küçük olan önce gelir). Yoksa dizideki sıra geçerli.
   - Adımlarda düz metin bir paragraf, { code: "..." } kopyalanabilir bir komut,
     { href, label } bir bağlantıdır.
*/

import type { Workshop } from "@/lib/workshops";

const workshop: Workshop = {
  slug: "web101-web-scraping",
  title: "Web 101 & Etik Web Scraping",
  organizer: "IEEE TEDU Computer Society",
  summary:
    "Web'in nasıl çalıştığına ve herkese açık web verilerini Python ile sorumlu bir şekilde nasıl toplayacağımıza uygulamalı bir giriş. Tarayıcında gerçek HTTP isteklerini inceleyecek, HTML okuyacak ve adım adım küçük bir scraper yazacaksın.",
  duration: "1,5 ile 2 saat",
  audience: "Mühendislik dışındaki öğrenciler dahil, tamamen yeni başlayanlar. Daha önce programlama deneyimi gerekmez.",
  // Installation guides, in the order people should follow them (add `order` to rearrange, published: false to hide).
  // install: one list of steps per system. A string is a step, { code: "..." } is a copyable command.
  tools: [
    {
      id: "vscode",
      name: "Visual Studio Code",
      description: "Ücretsiz bir kod editörü. Tüm Python kodlarımızı burada yazıp çalıştıracağız.",
      icon: "/images/workshops/web101-web-scraping/Icons/vscode.svg",
      url: "https://code.visualstudio.com/download",
      urlLabel: "VS Code'u indir",
      install: {
        windows: [
          "İndirme sayfasında “Windows”u seç (çoğu dizüstü bilgisayar için User Installer, x64).",
          "Kurulum dosyasını çalıştır ve varsayılan ayarları kabul et.",
          "Seçenekler ekranında “Add to PATH” işaretli kalsın.",
        ],
        macos: [
          "İndirme sayfasında “Mac”i seç (Universal sürüm her Mac'te çalışır).",
          "İndirilen zip dosyasını aç ve Visual Studio Code'u Uygulamalar (Applications) klasörüne sürükle.",
        ],
        linux: [
          "İndirme sayfasında .deb (Ubuntu/Debian) veya .rpm (Fedora) paketini seç.",
          "Paketi yazılım yükleyicinle aç ya da indirme klasöründe bir terminalden kur:",
          { code: "sudo apt install ./code_*.deb", lang: "bash" },
        ],
      },
      verify: "VS Code'u aç. “Welcome” sekmesini görmelisin.",
    },
    {
      id: "python",
      name: "Python 3",
      description: "Scraper'ımızı yazacağımız programlama dili. Güncel herhangi bir Python 3 sürümü işini görür.",
      icon: "/images/workshops/web101-web-scraping/Icons/python.svg",
      url: "https://www.python.org/downloads/",
      urlLabel: "Python'u indir",
      install: {
        windows: [
          "İndirme sayfasında sarı “Download Python 3.x” butonuna tıkla.",
          "Kurulum dosyasını çalıştır. İlk ekranda “Add python.exe to PATH” kutusunu işaretle, sonra “Install Now”a tıkla. Bu, pip'i de kurar; ayrıca işaretlemen gereken bir şey yok. (“Customize installation”ı seçersen “pip” işaretli kalsın.)",
          "Kurulumun başarılı olduğunu söylediğinde “Close”a tıkla.",
          "Son olarak Python'u VS Code'a ekle: VS Code'u aç, Extensions bölümünü aç (Ctrl+Shift+X), “Python”u ara (yayıncı: Microsoft) ve “Install”a tıkla.",
        ],
        macos: [
          "macOS kurulum dosyasını almak için indirme sayfasında “Download Python 3.x”e tıkla.",
          ".pkg dosyasını aç ve varsayılan ayarlarla adımlarda “Continue”a tıklayarak ilerle.",
          "Son olarak Python'u VS Code'a ekle: VS Code'u aç, Extensions bölümünü aç (Cmd+Shift+X), “Python”u ara (yayıncı: Microsoft) ve “Install”a tıkla.",
        ],
        linux: [
          "Çoğu dağıtımda Python 3 zaten yüklüdür. Ubuntu/Debian'da ihtiyacımız olan her şeyin kurulu olduğundan emin ol:",
          { code: "sudo apt update && sudo apt install python3 python3-pip python3-venv", lang: "bash" },
          "Son olarak Python'u VS Code'a ekle: VS Code'u aç, Extensions bölümünü aç (Ctrl+Shift+X), “Python”u ara (yayıncı: Microsoft) ve “Install”a tıkla.",
        ],
      },
      // Optional click-to-play YouTube video per system (youtube.com / youtu.be link). `thumbnail` is a local image in /public, so nothing is requested from YouTube until play.
      videos: {
        windows: { url: "https://www.youtube.com/watch?v=C3bOxcILGu4", title: "Windows 11'e Python 3.13.0 kurulumu", thumbnail: "/images/workshops/web101-web-scraping/thumb-python-windows.jpg" },
      },
      // Optional extra tip per system: strings, { code }, or { href, label } links.
      tips: {
        macos: [
          "Homebrew kullanıyor musun? Python'u kurulum dosyası yerine terminalden de kurabilirsin.",
          { href: "https://brew.sh", label: "Homebrew yok mu? brew.sh üzerinden kurabilirsin" },
          { code: "brew install python", lang: "bash" },
        ],
      },
      verify: {
        windows: ["Yeni bir Komut İstemi (Command Prompt) aç ve şunu çalıştır:", { code: "python --version", lang: "powershell" }, "Python 3.12.4 gibi bir çıktı görmelisin."],
        macos: ["Terminal'i aç ve şunu çalıştır:", { code: "python3 --version", lang: "bash" }, "Python 3.12.4 gibi bir çıktı görmelisin."],
        linux: ["Bir terminal aç ve şunu çalıştır:", { code: "python3 --version", lang: "bash" }, "Python 3.12.4 gibi bir çıktı görmelisin."],
      },
    },
    {
      id: "requests",
      name: "requests",
      description: "Web sayfalarını tıpkı bir tarayıcı gibi bizim için indiren bir Python paketi.",
      icon: "/images/workshops/web101-web-scraping/Icons/Requests_Python_Logo.png",
      url: "https://requests.readthedocs.io/en/latest/",
      urlLabel: "requests dokümantasyonu",
      install: {
        windows: [
          "Windows tuşuna bas, cmd yaz ve Komut İstemi'ni (Command Prompt) aç.",
          "Şunu çalıştır:",
          { code: "python -m pip install requests", lang: "powershell" },
        ],
        macos: [
          "Cmd+Boşluk tuşlarına bas, Terminal yaz ve Enter'a bas.",
          "Şunu çalıştır:",
          { code: "python3 -m pip install requests", lang: "bash" },
        ],
        linux: [
          "Yeni Ubuntu/Debian sürümleri sistem geneline pip kurulumunu engeller, bu yüzden bir sanal ortama (virtual environment) kuruyoruz. Bir terminal aç ve atölye için bir klasör oluştur:",
          { code: "mkdir web101 && cd web101", lang: "bash" },
          "Ortamı oluştur, etkinleştir ve kurulumu yap:",
          { code: "python3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install requests", lang: "bash" },
          "Daha sonra bu web101 klasörünü VS Code'da aç. VS Code .venv ortamını kullanmayı önerecek.",
        ],
      },
      tips: {
        macos: [
          "Python'u Homebrew ile kurduysan ve “externally-managed-environment” hatası aldıysan, bunun yerine bir sanal ortam kullan:",
          { code: "mkdir web101 && cd web101\npython3 -m venv .venv\nsource .venv/bin/activate\npython -m pip install requests", lang: "bash" },
        ],
      },
      verify: {
        windows: ["Şunu çalıştır:", { code: "python -c \"import requests; print('requests works')\"", lang: "powershell" }, "Çıktı şu olmalı: requests works"],
        macos: ["Şunu çalıştır:", { code: "python3 -c \"import requests; print('requests works')\"", lang: "bash" }, "Çıktı şu olmalı: requests works"],
        linux: ["Ortam hâlâ etkinken şunu çalıştır:", { code: "python -c \"import requests; print('requests works')\"", lang: "bash" }, "Çıktı şu olmalı: requests works"],
      },
    },
    {
      id: "beautifulsoup",
      name: "Beautiful Soup",
      description: "Bir sayfanın HTML'ini okuyup istediğimiz veriyi seçmemize yardım eden bir Python paketi. Kurulumdaki adı beautifulsoup4.",
      icon: "/images/workshops/web101-web-scraping/Icons/beautifulsoup.svg",
      url: "https://www.crummy.com/software/BeautifulSoup/bs4/doc/",
      urlLabel: "Beautiful Soup dokümantasyonu",
      install: {
        windows: [
          "Aynı Komut İstemi penceresinde şunu çalıştır:",
          { code: "python -m pip install beautifulsoup4", lang: "powershell" },
        ],
        macos: [
          "Aynı Terminal penceresinde şunu çalıştır:",
          { code: "python3 -m pip install beautifulsoup4", lang: "bash" },
        ],
        linux: [
          "Aynı terminalde, önceki adımdaki ortam hâlâ etkinken (satırın başında (.venv) görürsün) şunu çalıştır:",
          { code: "python -m pip install beautifulsoup4", lang: "bash" },
        ],
      },
      tips: {
        macos: [
          "Önceki adımda sanal ortam kullandıysan, ortam etkinken bunun yerine şunu çalıştır:",
          { code: "python -m pip install beautifulsoup4", lang: "bash" },
        ],
      },
      verify: {
        windows: ["Şunu çalıştır:", { code: "python -c \"import bs4; print('Beautiful Soup works')\"", lang: "powershell" }, "Çıktı şu olmalı: Beautiful Soup works"],
        macos: ["Şunu çalıştır:", { code: "python3 -c \"import bs4; print('Beautiful Soup works')\"", lang: "bash" }, "Çıktı şu olmalı: Beautiful Soup works"],
        linux: ["Ortam hâlâ etkinken şunu çalıştır:", { code: "python -c \"import bs4; print('Beautiful Soup works')\"", lang: "bash" }, "Çıktı şu olmalı: Beautiful Soup works"],
      },
    },
    {
      id: "nodejs",
      name: "Node.js",
      description: "Bir JavaScript çalışma ortamı. JavaScript araçlarının paket yöneticisi olan npm'i de birlikte kurar.",
      icon: "/images/workshops/web101-web-scraping/Icons/nodejs.svg",
      url: "https://nodejs.org/en/download",
      urlLabel: "Node.js'i indir",
      install: {
        windows: [
          "İndirme sayfasında LTS sürümünü ve Windows Installer (.msi) dosyasını seç.",
          "Kurulum dosyasını çalıştır ve varsayılan ayarları kabul et. “Add to PATH” işaretli kalsın.",
        ],
        macos: [
          "İndirme sayfasında LTS sürümünü ve macOS Installer (.pkg) dosyasını seç.",
          ".pkg dosyasını aç ve varsayılan ayarlarla adımlarda “Continue”a tıklayarak ilerle.",
        ],
        linux: [
          "Ubuntu/Debian'da en hızlı yol paket yöneticisidir (sürüm, web sitesindekinden eski olabilir):",
          { code: "sudo apt update && sudo apt install nodejs npm", lang: "bash" },
          "En güncel LTS sürümü için indirme sayfasında Linux'u seç ve gösterilen komutları izle.",
        ],
      },
      videos: {
        windows: { url: "https://www.youtube.com/watch?v=lt5D2EWZMN0", title: "Windows 11'e Node.js kurulumu", thumbnail: "/images/workshops/web101-web-scraping/thumb-nodejs-windows.jpg" },
      },
      tips: {
        macos: [
          "Homebrew kullanıyor musun? Node.js'i kurulum dosyası yerine terminalden kurabilirsin.",
          { code: "brew install node", lang: "bash" },
        ],
      },
      verify: {
        windows: ["Yeni bir Komut İstemi (Command Prompt) aç ve şunu çalıştır:", { code: "node --version\nnpm --version", lang: "powershell" }, "İkisi de bir sürüm numarası yazdırmalı."],
        macos: ["Yeni bir Terminal penceresi aç ve şunu çalıştır:", { code: "node --version\nnpm --version", lang: "bash" }, "İkisi de bir sürüm numarası yazdırmalı."],
        linux: ["Yeni bir terminal aç ve şunu çalıştır:", { code: "node --version\nnpm --version", lang: "bash" }, "İkisi de bir sürüm numarası yazdırmalı."],
      },
    },
    {
      id: "chrome",
      name: "Google Chrome",
      description: "Web sayfalarının nasıl kurulduğunu incelemek için kullanacağımız tarayıcı. Geliştirici araçları, sayfanın HTML'ini ve yaptığı istekleri gösterir.",
      icon: "/images/workshops/web101-web-scraping/Icons/google-chrome.svg",
      url: "https://www.google.com/chrome/",
      urlLabel: "Chrome'u indir",
      extraLinks: [{ label: "Firefox mu tercih ediyorsun? Buradan indir", url: "https://www.mozilla.org/firefox/new/" }],
      install: {
        windows: [
          "İndirme sayfasında “Chrome'u indir” butonuna tıkla ve kurulum dosyasını çalıştır.",
          "Chrome kendi kendine kurulur. Giriş yapsan da atlasan da atölye için fark etmez.",
        ],
        macos: [
          "İndirme sayfasında “Chrome'u indir” butonuna tıkla ve .dmg dosyasını aç.",
          "Google Chrome'u Uygulamalar (Applications) klasörüne sürükle.",
        ],
        linux: [
          "İndirme sayfasında 64-bit .deb (Ubuntu/Debian) veya .rpm (Fedora) paketini seç.",
          "Paketi yazılım yükleyicinle aç ya da indirme klasöründe bir terminalden kur:",
          { code: "sudo apt install ./google-chrome-stable_current_amd64.deb", lang: "bash" },
        ],
      },
      tips: {
        macos: [
          "Homebrew kullanıyor musun? Chrome'u terminalden de kurabilirsin.",
          { code: "brew install --cask google-chrome", lang: "bash" },
        ],
      },
      verify: {
        windows: "Herhangi bir web sitesini aç ve F12'ye bas. “Elements” ve “Network” sekmeleri olan bir panel açılmalı.",
        macos: "Herhangi bir web sitesini aç ve Cmd+Option+I'ya bas. “Elements” ve “Network” sekmeleri olan bir panel açılmalı.",
        linux: "Herhangi bir web sitesini aç ve F12'ye bas. “Elements” ve “Network” sekmeleri olan bir panel açılmalı.",
      },
    },
  ],
};

export default workshop;
