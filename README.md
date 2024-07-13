# nep

Ez egy alakuló félben lévő böngésző bővítmény, ami a Neptun használatát hivatott kibírhatóbbá tenni.

**Figyelmeztetés: aktív fejlesztés alatt, éles használatra nem ajánlott.**

## Használat

Futtatáshoz egyelőre használd a `web-ext` programot.

```bash
web-ext run -v -u https://neptun.bme.hu/hallgatoi/login.aspx
```

## Kompatibilitás

A bővítmény kompatibilis Firefox, Chrome és ezeken alapuló böngészőkkel.

## Funkciók

Minden funkció külön-külön kapcsolgatható a bővítmény beállításaiban.

### Sötét téma

*fejlesztés alatt*

Ennek elég leíró neve van. Az implementációhoz át kellett kicsit alakítani pár elem megjelenését.

### Gombok javítása

Valamiért néhány gomb felirat nélkül jelenik meg. Ezeknél egy id-t jelenítünk meg. Nem ugyanaz, mint ami a felirat lenne, de jobb mint a semmi, mert ebből legalább következtethetünk arra mit is csinálna.

### Kitty-mode

*fejlesztés alatt*

Cicák mászkálnak a fejlécen (Google Colab-ből lopva).

### Mobilos UI

*TODO*

### Reklámok kiszedése

*TODO*

### Egyedi téma

*TODO*

*lehet mergelve lesz a sötét témával*

### Akadálymentesítési fejlesztések

*TODO*

### Megjelenített név/neptunkód személyreszabása

*TODO*

### Lekérdezések optimalizálása

*TODO*

### self-care tippek/boldog gondolatok

*TODO*

### Figyelmeztetés kitöltetlen kérdőívek miatt

*TODO*

### Egyetemspecifikus funkciók

*TODO*

### Captcha megoldó

*TODO*

### NPU portok

Törekszem az NPU-s funkciók átportolására, de van pár ami szerintem az idő során értelmét vesztette.

| funkció                                            | állapot | megjegyzés |
| -------------------------------------------------- | ------- | ---------- |
| Tárgy felvétele 1 kattintással                     | todo    |            |
| Kidobás elleni védelem                             | todo    |            |
| Bejelentkezési adatok tárolása                     | wontfix | security   |
| Felturbózott szabad helyre várakozás               | wontfix |            |
| Egyszerűbb félévválasztás                          | todo    |            |
| Könnyebben használható menü                        | todo    |            |
| Felturbózott tárgyfelvétel oldal                   | todo    |            |
| Felturbózott vizsgajelentkezés oldal               | todo    |            |
| Könnyebben használható órarend, leckekönyv oldalak | ????    |            |
| Bezárható “új hivatalos üzenet” értesítés          | todo    |            |
| Fejléc eltüntetése                                 | ????    |            |
| Automatikus oldalméret-beállítás                   | ????    |            |
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

[NPU](https://github.com/solymosi/npu) by [Solymosi Máté](https://github.com/solymosi)

## Licence

Ez a projekt [GPL-3.0 license](https://www.gnu.org/licenses/gpl-3.0.html)-t követ.
