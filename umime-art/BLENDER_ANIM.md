
## Městečko „Jak to funguje“ (TownLife)

```
cd umime-art/blender
../../.venv-art/bin/python mestecko.py -- scena            # městečko (2000×900), out/mesto_scena + paths.json
../../.venv-art/bin/python mesto_figury.py -- hrdina_chuze # jedna práce = jeden proces (hrdina_*, knihovnice, pekar, farmar, babicka, kluk,
                                                           #   pes_bezi, pes_sedi, kocka, ovce, slepice, kralik, ptak, ryba, mlyn)
cd .. && ../.venv-art/bin/python encode.py mesto           # webp do public/home/mesto + src/components/mesto-scena.json
```
Pohoří (`hory-*.webp`) a sopka (`sopka.webp`) jsou samostatné vrstvy za městečkem. Souřadnice zvířat a obyvatel
(`extra` v JSON) se počítají v `encode.py` ze světových souřadnic stejnou projekcí jako kamera ve scéně.
