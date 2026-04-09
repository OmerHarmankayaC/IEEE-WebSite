import re

files_info = {
    "blog-silikon-vadisi.html": "Silikon Vadisi'nde Bir Türk Mühendis",
    "blog-savunma-sanayii.html": "Savunma Sanayii Ziyareti",
    "blog-otonom-arac.html": "Otonom Araç Projesi Finallerde",
    "blog-akademi.html": "Akademi Buluşmaları Devam Ediyor",
    "blog-gomulu-sistemler.html": "Gömülü Sistemler ve IoT Temelleri"
}

for file, title in files_info.items():
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'<h1 class="blog-title">.*?</h1>', f'<h1 class="blog-title">{title}</h1>', content)
    content = re.sub(r'<title>.*?</title>', f'<title>{title} | IEEE TEDU</title>', content)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
