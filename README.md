<p align="center">
  <img src="assets/icon.png" alt="nep logo" width="128">
</p>

<h1 align="center">nep</h1>

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/neptun-extension-project/"><img alt="Firefox Add-on" src="https://img.shields.io/amo/v/neptun-extension-project?label=Firefox%20Add-on&logo=firefox-browser"></a>
  <a href="https://github.com/neptun-extension-project/nep/releases"><img alt="GitHub release" src="https://img.shields.io/github/v/release/neptun-extension-project/nep"></a>
  <a href="https://github.com/neptun-extension-project/nep/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/neptun-extension-project/nep/build-unsigned.yml?branch=main"></a>
  <a href="https://www.gnu.org/licenses/gpl-3.0.html"><img alt="License: GPLv3" src="https://img.shields.io/badge/license-GPLv3-blue"></a>
</p>

## Miért?

Az új Neptun csomó hibáját megoldotta a régi verziónak, de így is maradtak hiányosságai és pár új probléma is van vele. Ezzel a bővítménnyel ezeket a hibákat igyekszünk kijavítani.

## Tartalomjegyzék

- [Miért?](#miért)
- [Tartalomjegyzék](#tartalomjegyzék)
- [Telepítés](#telepítés)
- [Kompatibilitás](#kompatibilitás)
- [Működő funkciók](#működő-funkciók)
  - [Megjelenített név/neptunkód személyreszabása](#megjelenített-névneptunkód-személyreszabása)
  - [Szerver választó](#szerver-választó)
  - [Kidobás elleni védelem](#kidobás-elleni-védelem)
  - [Süti elfogadása](#süti-elfogadása)
  - [Captcha megoldó](#captcha-megoldó)
  - [Swagger UI](#swagger-ui)
  - [Menü újragondolás](#menü-újragondolás)
- [Tervezett funkciók](#tervezett-funkciók)
  - [Sötét téma](#sötét-téma)
  - [Kitty-mode](#kitty-mode)
  - [Egyedi téma](#egyedi-téma)
  - [Akadálymentesítési fejlesztések](#akadálymentesítési-fejlesztések)
  - [Lekérdezések optimalizálása](#lekérdezések-optimalizálása)
  - [self-care tippek/boldog gondolatok](#self-care-tippekboldog-gondolatok)
  - [Figyelmeztetés kitöltetlen kérdőívek miatt](#figyelmeztetés-kitöltetlen-kérdőívek-miatt)
  - [Egyetemspecifikus funkciók](#egyetemspecifikus-funkciók)
  - [NPU portok](#npu-portok)
- [Fejlesztés](#fejlesztés)
  - [Új modul fejlesztése](#új-modul-fejlesztése)
- [Hozzájárulás](#hozzájárulás)
- [Köszönet](#köszönet)
- [Licenc](#licenc)

## Telepítés

A legegyszerűbb a hivatalos addon oldalról telepíteni:

[**Firefox Addons →**](https://addons.mozilla.org/en-US/firefox/addon/neptun-extension-project/)

<details>
<summary>Időleges telepítés (kipróbálásra)</summary>

1. Töltsd le a legfrissebb aláiratlan bővítmény fájlt a [release](https://github.com/neptun-extension-project/nep/releases)-ek közül vagy [artifact](https://github.com/neptun-extension-project/nep/actions)-ekből. Utóbbi esetében csomagold ki a külső zip-et.
2. Telepítsd a kedvenc böngésződben:

   **Firefox:** `about:addons` oldalon: fogaskerék > Debug Add-ons > Load Temporary Add-on…

   **Chrome:** `chrome://extensions` oldalon: Load unpacked

</details>

<details>
<summary>Fejlesztéshez</summary>

Futtatáshoz használd a `web-ext` programot:

```bash
web-ext run -v -u https://neptun.bme.hu/hallgatoi/login
```

</details>

## Kompatibilitás

A bővítmény kompatibilis Firefox, Chrome és ezeken alapuló böngészőkkel.

## Működő funkciók

Minden funkció külön-külön kapcsolgatható a bővítmény beállításaiban.

### Megjelenített név/neptunkód személyreszabása

A jobb felső nevet és neptun kódot tartalmazó címke személyre szabására van.

A név mellett a neptun kód átírható egyedi értékre.

### Szerver választó

Néhány egyetem esetében úgy oldották meg a terhelés elosztását, hogy több, külön címen elérhető neptun szervert futtatnak. Az ezek közti váltást egyszerűsíti ez a modul és azt is tudja jelezni, hogy melyik szerveren hány szabad hely van még.

### Kidobás elleni védelem

Aktivitást szimulál, így nem dob ki a neptun 10 perc után.

### Süti elfogadása

Egyszerű modul, ami automatikusan elfogadja a neptun által használt sütiket.

### Captcha megoldó

Ha feljön a captchás ablak, automatikusan kitölti és folytatja a bejelentkezési folyamatot.

A hang captchát használja, nagyon minimális az erőforrásigénye. Az eredeti kódot [RED](https://github.com/LetsUpdate) írta a [CSN](https://github.com/LetsUpdate/CSN)-hez, ez lett most adaptálva az új neptunhoz, pici módosításokkal.

### Swagger UI

Fejlesztőknek segít a neptun API próbálgatásában.

Hozzáad egy gombot a footer-hez, ami injektálja a swagger-ui-t az oldalba. Ezen a UI-on automatikusan kiválasztja az aktuális neptun szervert és kitölti a session storage alapján az access token-t.

### Menü újragondolás

A korábbi Neptun felületre építve vízszintesen kiterített menüsávra cseréli a lenyíló menüt és kiszedi a keresés szövegdobozt.

A kedvenceket kezelését is átalakítja kiszedve a teljesen értelmetlen 8 db-os limitet. A kedvenceket továbbra is a neptunban tárolja, de nem kompatibilis formátumban, ami a korábbi kedvenceket felülírja. Tetszőleges URL is megadható kedvencnek.


## Tervezett funkciók

### Sötét téma

*fejlesztés alatt*

Ennek elég leíró neve van. Az implementációhoz át kellett kicsit alakítani pár elem megjelenését.

### Kitty-mode

*fejlesztés alatt*

Cicák mászkálnak a fejlécen (Google Colab-ből lopva).

### Egyedi téma

*TODO*

*lehet mergelve lesz a sötét témával*

### Akadálymentesítési fejlesztések

*TODO*

### Lekérdezések optimalizálása

*TODO*

### self-care tippek/boldog gondolatok

*TODO*

### Figyelmeztetés kitöltetlen kérdőívek miatt

*TODO*

### Egyetemspecifikus funkciók

*TODO*

### NPU portok

Törekszem az NPU-s funkciók átportolására, de van pár ami szerintem az idő során értelmét vesztette.

| Funkció | Állapot | Megjegyzés |
| --- | :---: | --- |
| Tárgy felvétele 1 kattintással | 🚧 | |
| Kidobás elleni védelem | ✅ | |
| Bejelentkezési adatok tárolása | ❌ | security |
| Felturbózott szabad helyre várakozás | ❌ | |
| Egyszerűbb félévválasztás | 🚧 | |
| Könnyebben használható menü | 🚧 | |
| Felturbózott tárgyfelvétel oldal | 🚧 | |
| Felturbózott vizsgajelentkezés oldal | 🚧 | |
| Könnyebben használható órarend, leckekönyv oldalak | ❓ | |
| Bezárható "új hivatalos üzenet" értesítés | 🚧 | |
| Fejléc eltüntetése | ❓ | |
| Automatikus oldalméret-beállítás | ❓ | |

Jelmagyarázat: ✅ kész · 🚧 tervben · ❌ wontfix · ❓ bizonytalan

## Fejlesztés

A projekt egy manifest v3-as web-extension.

A használt nyelv javascript. Erre az alacsonyabb komplexitás miatt esett választás. Issuek-ban szabad érvelni más megoldások használatáért.

Magas prioritást élvez a szoftver biztonság. Például jelszavak plaintext tárolása vagy online erőforrások injektálása kerülendő.

### Új modul fejlesztése

A `modules` alatt kell egy új mappát létrehozni, a többi mintájára egy `.js` fájl kell és annak elérési útját hozzáadni a `modules.js`-be.

## Hozzájárulás

Mindenféle hozzájárulást szívesen veszek, nyitott vagyok új ötletekre és örülök, ha más is részt vesz a fejlesztésben.

Kérlek mielőtt egy új funkciót implementálsz nyiss rá issue-t, hogy mások véleményezhessék mielőtt feleslegesen dolgozol!

## Köszönet

- [NPU](https://github.com/solymosi/npu) by [Solymosi Máté](https://github.com/solymosi)
- [CSN](https://github.com/LetsUpdate/CSN) by [RED](https://github.com/LetsUpdate)
- [selfcare.tech](https://github.com/jenniferlynparsons/selfcaretech)

## Licenc

Ez a projekt a [GNU General Public License Version 3 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0.html) alatt kerül terjesztésre.

Ez a projekt tartalmaz kódot, amely az alábbi forrásból származik:

- RED által készített userscript, amely MIT licenc alatt érhető el.
  A kapcsolódó szerzői jogi értesítés és a licencfeltételek megtalálhatók a forráskódban.
- [js-yaml](https://github.com/nodeca/js-yaml), Vitaly Puzrin fejlesztése: MIT licenc alatt
- [swagger-ui](https://github.com/swagger-api/swagger-ui), a SmartBear Software-től: Apache License 2.0 licenc alatt
