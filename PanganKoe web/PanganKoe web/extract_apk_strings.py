import zipfile, re

apk_path = r'C:\Users\LENOVO\Downloads\PanganKoe-debug.apk'
with zipfile.ZipFile(apk_path, 'r') as z:
    content = z.read('assets/public/assets/index-CgOVxaYi.js').decode('utf-8', errors='ignore')
    
    # Find Indonesian sentences and phrases
    phrases = re.findall(r'[\"\'`]([A-Z0-9\s\.\,\!\?\-\(\)\:\;\/]{4,150})[\"\'`]', content, re.IGNORECASE)
    
    keywords = ['budget', 'anggaran', 'keluarga', 'anak', 'balita', 'gizi', 'stunting', 'pilihan', 'preferensi', 'tujuan', 'profil', 'makan', 'dapur', 'sarapan', 'jumlah', 'anggota', 'alergi', 'target', 'mitra', 'warung']
    
    matches = []
    for p in phrases:
        p_clean = p.strip()
        if any(k in p_clean.lower() for k in keywords) and 5 < len(p_clean) < 120:
            if not p_clean.startswith('http') and not p_clean.startswith('var ') and not p_clean.startswith('function'):
                matches.append(p_clean)
                
    print(f'Found {len(matches)} Relevant Sentences:')
    seen = set()
    for m in matches:
        if m not in seen:
            seen.add(m)
            print('-', m)
