#!/usr/bin/env python3
"""
Uruchom: python3 patch_index.py
Wymagane: plik index.html w tym samym folderze
"""
import re, shutil, os

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Marker gdzie wstawić sekcję
marker = '<section class="promo-section">'
if marker not in html:
    print("❌ Nie znaleziono markera w pliku. Sprawdź czy plik to właściwy index.html.")
    exit(1)

games_html = """
<!-- ══ SEKCJA GIER EDUKACYJNYCH ══ -->
<section class="games-section" id="gry" style="padding:80px 5%;background:white;">
  <div style="max-width:1100px;margin:0 auto;">
    <div class="section-label">Wersje Alpha</div>
    <h2 class="section-title">Gry edukacyjne do nauki pianina</h2>
    <p style="color:#64748b;font-size:0.95rem;max-width:580px;line-height:1.7;margin:0 0 36px;">
      Eksperymentalne gry przeglądarkowe sterowane mikrofonem lub nuceniem. Ćwicz nuty bawiąc się — bez klawiszy, bez ekranów nut. Wystarczy głos lub instrument.
    </p>
    <div style="display:inline-block;background:#fef9e7;border:1.5px solid #d4af37;border-radius:50px;padding:6px 18px;font-size:0.75rem;font-weight:700;color:#92710a;letter-spacing:0.08em;margin-bottom:36px;">
      ⚠ Wersja Alpha — gry są w trakcie rozwoju
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">

      <!-- Piano Invaders -->
      <a href="piano_invaders.html" style="text-decoration:none;border-radius:28px;overflow:hidden;border:1.5px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.07);display:flex;flex-direction:column;transition:all 0.25s;background:white;" class="game-card">
        <div style="background:linear-gradient(135deg,#0d1117 0%,#1a2744 60%,#0f2027 100%);padding:28px;position:relative;overflow:hidden;min-height:160px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 60%,rgba(68,170,255,0.18) 0%,transparent 60%);"></div>
          <div style="position:absolute;top:14px;right:14px;background:rgba(68,170,255,0.15);border:1px solid rgba(68,170,255,0.35);border-radius:50px;padding:3px 10px;font-size:0.65rem;font-weight:700;color:#7dd3fc;letter-spacing:0.1em;">ALPHA</div>
          <!-- Mini piano invaders ilustracja -->
          <div style="text-align:center;position:relative;z-index:1;">
            <div style="font-size:3rem;margin-bottom:8px;">🎹</div>
            <div style="display:flex;gap:10px;justify-content:center;margin-bottom:6px;">
              <span style="background:rgba(255,68,68,0.7);color:#fff;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;">C</span>
              <span style="background:rgba(255,136,68,0.7);color:#fff;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;">E</span>
              <span style="background:rgba(68,255,100,0.7);color:#000;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;">G</span>
              <span style="background:rgba(68,170,255,0.8);color:#fff;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;">H</span>
            </div>
            <div style="width:32px;height:10px;background:#0cf;border-radius:3px;margin:0 auto;box-shadow:0 0 10px #0cf;"></div>
          </div>
        </div>
        <div style="padding:22px 24px 26px;flex:1;">
          <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#d4af37;margin-bottom:8px;">Gra zręcznościowa</div>
          <h3 style="font-family:'Playfair Display',serif;color:#1e3a8a;font-size:1.3rem;margin:0 0 10px;">Piano Invaders</h3>
          <p style="font-size:0.85rem;color:#64748b;line-height:1.65;margin:0 0 16px;">Klasyczny Space Invaders sterowany dźwiękiem. Nuty małe = ruch pianina, jednokreślne = strzał. Mikrofon wykrywa zagraną nutę i reaguje w czasie rzeczywistym.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:#f0f7ff;color:#1e3a8a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #dbeafe;">🎤 Mikrofon</span>
            <span style="background:#f0f7ff;color:#1e3a8a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #dbeafe;">c–h małe</span>
            <span style="background:#f0f7ff;color:#1e3a8a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #dbeafe;">c¹–h¹</span>
          </div>
          <div style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;background:#1e3a8a;color:white;padding:10px 22px;border-radius:50px;font-weight:700;font-size:0.82rem;">
            Zagraj teraz →
          </div>
        </div>
      </a>

      <!-- Piano Maze -->
      <a href="piano_maze.html" style="text-decoration:none;border-radius:28px;overflow:hidden;border:1.5px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.07);display:flex;flex-direction:column;transition:all 0.25s;background:white;" class="game-card">
        <div style="background:linear-gradient(135deg,#0a1a0a 0%,#1a3a1a 60%,#0d2a0d 100%);padding:28px;position:relative;overflow:hidden;min-height:160px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 70% 40%,rgba(212,175,55,0.15) 0%,transparent 60%);"></div>
          <div style="position:absolute;top:14px;right:14px;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.35);border-radius:50px;padding:3px 10px;font-size:0.65rem;font-weight:700;color:#fcd34d;letter-spacing:0.1em;">ALPHA</div>
          <!-- Mini maze ilustracja -->
          <div style="position:relative;z-index:1;text-align:center;">
            <div style="display:inline-grid;grid-template-columns:repeat(5,18px);grid-template-rows:repeat(5,18px);gap:2px;margin-bottom:8px;">
              <div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div>
              <div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#d4af37;border-radius:2px;font-size:9px;display:flex;align-items:center;justify-content:center;">🎹</div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div>
              <div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div>
              <div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div>
              <div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#2d5a2d;border-radius:2px;"></div><div style="background:#1e3a1e;border-radius:2px;"></div><div style="background:#d4af37;border-radius:2px;font-size:8px;display:flex;align-items:center;justify-content:center;">🚪</div><div style="background:#1e3a1e;border-radius:2px;"></div>
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <span style="background:rgba(212,175,55,0.2);color:#fcd34d;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;border:1px solid rgba(212,175,55,0.3);">↑ c¹</span>
              <span style="background:rgba(212,175,55,0.2);color:#fcd34d;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;border:1px solid rgba(212,175,55,0.3);">→ e¹</span>
              <span style="background:rgba(212,175,55,0.2);color:#fcd34d;font-size:0.6rem;font-weight:700;padding:3px 8px;border-radius:4px;border:1px solid rgba(212,175,55,0.3);">↓ g¹</span>
            </div>
          </div>
        </div>
        <div style="padding:22px 24px 26px;flex:1;">
          <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:#d4af37;margin-bottom:8px;">Gra logiczna</div>
          <h3 style="font-family:'Playfair Display',serif;color:#1e3a8a;font-size:1.3rem;margin:0 0 10px;">Muzyczny Labirynt</h3>
          <p style="font-size:0.85rem;color:#64748b;line-height:1.65;margin:0 0 16px;">Przeprowadź postać przez labirynt grając odpowiednie nuty. Każdy kierunek to inna nuta jednokreślna. Sterowanie mikrofonem lub kliknięciem kafelka z nutą.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:#fef9e7;color:#92710a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #fde68a;">🎤 Mikrofon</span>
            <span style="background:#fef9e7;color:#92710a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #fde68a;">🎹 Kafelki</span>
            <span style="background:#fef9e7;color:#92710a;font-size:0.72rem;font-weight:600;padding:4px 12px;border-radius:50px;border:1px solid #fde68a;">c¹–h¹</span>
          </div>
          <div style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;background:#d4af37;color:#1a1a2e;padding:10px 22px;border-radius:50px;font-weight:700;font-size:0.82rem;">
            Zagraj teraz →
          </div>
        </div>
      </a>

    </div>
  </div>
</section>

<style>
.game-card:hover{transform:translateY(-6px)!important;box-shadow:0 16px 48px rgba(0,0,0,0.13)!important;}
@media(max-width:700px){
  .game-card>div:first-child{min-height:120px!important;padding:20px!important;}
  section#gry>div>div:last-child{grid-template-columns:1fr!important;}
}
</style>
"""

# Backup
shutil.copy("index.html", "index.html.bak")
print("✅ Backup zapisany jako index.html.bak")

# Wstaw przed promo-section
new_html = html.replace(marker, games_html + "\n" + marker, 1)

# Dodaj link do nawigacji jeśli go nie ma
if 'href="#gry"' not in new_html:
    # Dodaj do site-nav przed href="podrecznik.html"
    new_html = new_html.replace(
        '<a href="podrecznik.html">Podręcznik</a>',
        '<a href="#gry">🎮 Gry</a><a href="podrecznik.html">Podręcznik</a>'
    )
    print("✅ Dodano link do nawigacji")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

print("✅ Gotowe! Sekcja gier dodana do index.html")
print("   Otwórz index.html w przeglądarce aby sprawdzić.")
